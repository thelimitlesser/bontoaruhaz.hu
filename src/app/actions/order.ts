'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { sendOrderReceivedEmail, sendOrderConfirmedEmail } from "@/lib/resend";
import { createInvoiceForOrder } from "@/lib/szamlazz";
import { createPxpShipment } from "@/lib/shipping/pannon-xp";

export async function createOrder(data: {
    userId?: string;
    items: any[];
    customerData: any;
    totalAmount: number;
    shippingMethod: string;
    paymentMethod: string;
    stripePaymentIntentId?: string;
    sessionId?: string;
}) {
    const { userId, items, customerData, totalAmount, shippingMethod, paymentMethod, stripePaymentIntentId, sessionId } = data;

    const order = await prisma.order.create({
        data: {
            userId,
            totalAmount,
            shippingAddress: JSON.stringify({
                name: `${customerData.lastName} ${customerData.firstName}`,
                address: customerData.address,
                city: customerData.city,
                postalCode: customerData.postalCode,
                phone: customerData.phone,
                email: customerData.email
            }),
            billingAddress: JSON.stringify({
                name: customerData.companyName || `${customerData.lastName} ${customerData.firstName}`,
                address: customerData.billingAddress || customerData.address,
                city: customerData.billingCity || customerData.city,
                postalCode: customerData.billingPostalCode || customerData.postalCode,
                taxNumber: customerData.taxNumber || '',
                email: customerData.email
            }),
            shippingMethod,
            paymentMethod,
            stripePaymentIntentId,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            items: {
                create: items.map(item => ({
                    partId: item.id,
                    quantity: item.quantityInCart,
                    priceAtTime: item.price
                }))
            }
        },
        include: {
            items: {
                include: { part: true }
            }
        }
    });

    // Handle stock decrement and reservation cleanup
    try {
        for (const item of items) {
            // Decrement actual stock (NEM töröljük a terméket, csak a stock csökken)
            await prisma.part.update({
                where: { id: item.id },
                data: {
                    stock: { decrement: item.quantityInCart }
                }
            });

            // Delete reservation if order is placed
            if (sessionId) {
                await prisma.reservation.deleteMany({
                    where: {
                        partId: item.id,
                        sessionId: sessionId
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error decrementing stock or clearing reservations after order:", error);
    }

    // Send "Order Received" email (non-blocking)
    console.log(`TRIGGERING "Order Received" email for ${customerData.email}`);
    sendOrderReceivedEmail(order, customerData.email).catch(err => {
        console.error("CRITICAL: sendOrderReceivedEmail CATCH error:", err);
    });

    revalidatePath('/admin/orders');
    return order;
}

export async function approveOrder(orderId: string) {
    console.log("APPROVING ORDER:", orderId);
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { part: true } } }
    });

    if (!order) throw new Error("Order not found");

    try {
        // 1. Capture Stripe Payment if it exists
        if (order.stripePaymentIntentId && order.paymentMethod === 'CARD') {
            console.log("Capturing Stripe payment:", order.stripePaymentIntentId);
            if (!stripe) throw new Error("Stripe beállítások hiányoznak. Nem sikerült a fizetés véglegesítése.");
            try {
                await stripe.paymentIntents.capture(order.stripePaymentIntentId);
            } catch (err: any) {
                console.error("Stripe capture error:", err);
                throw new Error(`Bankkártyás fizetés véglegesítése sikertelen: ${err.message}`);
            }
        }

        // 2. Create Pannon XP Shipment (Skip if PICKUP)
        let trackingNumber = order.trackingNumber;
        if (order.shippingMethod !== 'PICKUP') {
            console.log("Creating PXP shipment for order:", order.id);
            const pxpResult = await createPxpShipment(order);
            console.log("PXP Result:", pxpResult);
            
            if (!pxpResult.success) {
                throw new Error(`Szállítási címke generálása sikertelen (PannonXP): ${pxpResult.error}`);
            }
            trackingNumber = pxpResult.trackingNumber;
        }
        
        // 3. Create Számlázz.hu Invoice
        console.log("Creating invoice...");
        const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
        const customerEmail = billingData.email || 'vevo@email.com';
        
        const invoiceResult = await createInvoiceForOrder(order, { ...billingData, email: customerEmail });
        if (!invoiceResult) {
            console.warn("Invoice generation failed but process continues...");
            // Optionally throw error if invoice is mandatory:
            // throw new Error("A számla generálása sikertelen volt.");
        }

        // 4. Update Order Status
        console.log("Updating database status to PROCESSING...");
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PROCESSING',
                paymentStatus: order.paymentMethod === 'CARD' ? 'PAID' : order.paymentStatus,
                trackingNumber: trackingNumber,
                invoiceId: invoiceResult?.invoiceId
            },
            include: {
                items: {
                    include: {
                        part: true
                    }
                }
            }
        });

        // 5. Send "Order Confirmed" email
        console.log("Sending confirmation email...");
        try {
            await sendOrderConfirmedEmail(updatedOrder as any, customerEmail, invoiceResult?.pdfUrl);
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
            // Don't fail the whole process if only email failed
        }

        console.log("Order approved successfully!");
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        console.error("CRITICAL ERROR in approveOrder:", error);
        return { success: false, error: error.message || "Szerverhiba történt a jóváhagyás során." };
    }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    });
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
}

export async function updateOrderPaymentStatus(orderId: string, newPaymentStatus: string) {
    await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: newPaymentStatus }
    });
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
}

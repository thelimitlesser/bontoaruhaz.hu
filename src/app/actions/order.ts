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
    sendOrderReceivedEmail(order, customerData.email).catch(err => console.error("Email send error:", err));

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
        if (order.stripePaymentIntentId) {
            console.log("Capturing Stripe payment:", order.stripePaymentIntentId);
            if (!stripe) throw new Error("Stripe beállítások hiányoznak. Nem sikerült a fizetés véglegesítése.");
            await stripe.paymentIntents.capture(order.stripePaymentIntentId);
        }

        // 2. Create Pannon XP Shipment
        console.log("Creating PXP shipment for order:", order.id);
        const pxpResult = await createPxpShipment(order);
        console.log("PXP Result:", pxpResult);
        
        if (!pxpResult.success) {
            console.log("PXP FAILED - throwing error");
            throw new Error(`PannonXP hiba: ${pxpResult.error}`);
        }
        
        // 3. Create Számlázz.hu Invoice
        console.log("Creating invoice...");
        const billingData = JSON.parse(order.billingAddress);
        const customerEmail = billingData.email || 'vevo@email.com';
        
        const invoiceResult = await createInvoiceForOrder(order, { ...billingData, email: customerEmail });
        console.log("Invoice Result:", invoiceResult);

        // 4. Update Order Status
        console.log("Updating database status to PROCESSING...");
        await (prisma.order.update as any)({
            where: { id: orderId },
            data: {
                status: 'PROCESSING',
                paymentStatus: order.paymentMethod === 'CARD' ? 'PAID' : order.paymentStatus,
                trackingNumber: pxpResult.trackingNumber,
                invoiceId: invoiceResult?.invoiceId
            }
        });

        // 5. Send "Order Confirmed" email
        console.log("Sending confirmation email...");
        await sendOrderConfirmedEmail(order, customerEmail, invoiceResult?.pdfUrl);

        console.log("Order approved successfully!");
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("CRITICAL ERROR in approveOrder:", error);
        throw error;
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

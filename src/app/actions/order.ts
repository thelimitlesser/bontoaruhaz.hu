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
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { part: true } } }
    });

    if (!order) throw new Error("Order not found");

    try {
        // 1. Capture Stripe Payment if it exists
        if (order.stripePaymentIntentId) {
            if (!stripe) throw new Error("Stripe beállítások hiányoznak. Nem sikerült a fizetés véglegesítése.");
            await stripe.paymentIntents.capture(order.stripePaymentIntentId);
        }

        // 2. Create Pannon XP Shipment
        const pxpResult = await createPxpShipment(order);
        
        // 3. Create Számlázz.hu Invoice
        const billingData = JSON.parse(order.billingAddress);
        const customerEmail = billingData.email || 'vevo@email.com';
        
        const invoiceResult = await createInvoiceForOrder(order, { ...billingData, email: customerEmail });

        // 4. Update Order Status
        await (prisma.order.update as any)({
            where: { id: orderId },
            data: {
                status: 'PROCESSING',
                paymentStatus: 'PAID',
                trackingNumber: pxpResult.trackingNumber,
                invoiceId: invoiceResult?.invoiceId
            }
        });

        // 5. Send "Order Confirmed" email
        await sendOrderConfirmedEmail(order, customerEmail, invoiceResult?.pdfUrl);

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Error approving order:", error);
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

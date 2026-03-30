'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { stripe } from "@/lib/stripe";
import { sendOrderReceivedEmail, sendOrderConfirmedEmail, sendOrderReadyForPickupEmail } from "@/lib/resend";
import { createBillingoInvoice } from "@/lib/billingo";
import { createPxpShipment } from "@/lib/shipping/pannon-xp";

export async function createPendingOrder(data: {
    userId?: string;
    items: any[];
    customerData: any;
    totalAmount: number;
    shippingMethod: string;
    paymentMethod: string;
    stripePaymentIntentId?: string;
    sessionId?: string;
    isCompany?: boolean;
    billingSameAsShipping?: boolean;
}) {
    const { userId, items, customerData, totalAmount, shippingMethod, paymentMethod, stripePaymentIntentId, sessionId, isCompany, billingSameAsShipping } = data;

    // Construct Definitive Billing Data
    const billingName = isCompany ? customerData.companyName : `${customerData.lastName} ${customerData.firstName}`;
    const billingPostalCode = billingSameAsShipping ? customerData.postalCode : customerData.billingPostalCode;
    const billingCity = billingSameAsShipping ? customerData.city : customerData.billingCity;
    const billingAddress = billingSameAsShipping ? customerData.address : customerData.billingAddress;
    const taxNumber = isCompany ? customerData.taxNumber : '';

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
                name: billingName,
                address: billingAddress,
                city: billingCity,
                postalCode: billingPostalCode,
                taxNumber: taxNumber,
                email: customerData.email,
                companyName: customerData.companyName,
                lastName: customerData.lastName,
                firstName: customerData.firstName
            }),
            shippingMethod,
            paymentMethod,
            stripePaymentIntentId,
            // @ts-ignore
            isCompany: !!isCompany,
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

    return order;
}

export async function finalizeStripeOrder(paymentIntentId: string, sessionId?: string) {
    if (!stripe) throw new Error("Stripe beállítások hiányoznak.");

    const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { items: { include: { part: true } } }
    });

    if (!order) return { success: false, error: "Order not found" };
    
    // If order is already finalized, skip (idempotent)
    if (order.paymentStatus === 'AUTHORIZED' || order.paymentStatus === 'PAID') {
        return { success: true, alreadyFinalized: true };
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (intent.status === 'succeeded' || intent.status === 'requires_capture') {
        try {
            for (const item of order.items) {
                // Decrement stock
                await prisma.part.update({
                    where: { id: item.partId },
                    data: { stock: { decrement: item.quantity } }
                });

                // Clear reservation
                if (sessionId) {
                    await prisma.reservation.deleteMany({
                        where: { partId: item.partId, sessionId: sessionId }
                    });
                }
            }
        } catch (error) {
            console.error("Error decrementing stock or clearing reservations after Stripe payment:", error);
        }

        // Send confirmation email
        const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
        
        try {
            await sendOrderReceivedEmail(order as any, billingData.email);
        } catch (err) {
            console.error("Email sending error:", err);
        }

        // Mark as AUTHORIZED to indicate successful payment reservation but pending admin capture
        await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: 'AUTHORIZED' }
        });

        revalidatePath('/admin/orders');
        revalidatePath('/', 'layout'); // Ensure public pages reflect the new stock immediately
        revalidateTag('products'); // Clear unstable_cache for products
        revalidateTag('parts');
        revalidateTag('search');
        return { success: true };
    }

    return { success: false, error: "Payment not confirmed" };
}

export async function createOrder(data: {
    userId?: string;
    items: any[];
    customerData: any;
    totalAmount: number;
    shippingMethod: string;
    paymentMethod: string;
    stripePaymentIntentId?: string;
    sessionId?: string;
    isCompany?: boolean;
    billingSameAsShipping?: boolean;
}) {
    const { userId, items, customerData, totalAmount, shippingMethod, paymentMethod, stripePaymentIntentId, sessionId, isCompany, billingSameAsShipping } = data;

    // Construct Definitive Billing Data
    const billingName = isCompany ? customerData.companyName : `${customerData.lastName} ${customerData.firstName}`;
    const billingPostalCode = billingSameAsShipping ? customerData.postalCode : customerData.billingPostalCode;
    const billingCity = billingSameAsShipping ? customerData.city : customerData.billingCity;
    const billingAddress = billingSameAsShipping ? customerData.address : customerData.billingAddress;
    const taxNumber = isCompany ? customerData.taxNumber : '';

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
                name: billingName,
                address: billingAddress,
                city: billingCity,
                postalCode: billingPostalCode,
                taxNumber: taxNumber,
                email: customerData.email,
                companyName: customerData.companyName,
                lastName: customerData.lastName,
                firstName: customerData.firstName
            }),
            shippingMethod,
            paymentMethod,
            stripePaymentIntentId,
            // @ts-ignore
            isCompany: !!isCompany,
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
    revalidatePath('/', 'layout'); // Ensure public pages reflect the new stock immediately
    revalidateTag('products'); // Clear unstable_cache for products
    revalidateTag('parts');
    revalidateTag('search');
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
            console.log("Checking Stripe payment status:", order.stripePaymentIntentId);
            if (!stripe) throw new Error("Stripe beállítások hiányoznak. Nem sikerült a fizetés véglegesítése.");
            
            try {
                const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
                if (intent.status === 'requires_capture') {
                    console.log("Capturing Stripe payment...");
                    await stripe.paymentIntents.capture(order.stripePaymentIntentId);
                } else if (intent.status === 'succeeded') {
                    console.log("Stripe payment already captured, proceeding...");
                } else {
                    console.warn("Stripe payment in unexpected state:", intent.status);
                    // If it's something like 'requires_payment_method', we might want to fail
                }
            } catch (err: any) {
                console.error("Stripe error:", err);
                // Allow "already captured" errors to pass if we can identify them, but retrieve is safer
                throw new Error(`Bankkártyás fizetés ellenőrzése sikertelen: ${err.message}`);
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
        
        // 3. Create Billingo Invoice (Skip for non-card PICKUP)
        const isPickup = order.shippingMethod === 'PICKUP';
        const isNonCardPickup = isPickup && order.paymentMethod !== 'CARD';
        let invoiceResult = null;
        
        if (!isNonCardPickup) {
            console.log("Creating Billingo invoice...");
            const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
            const customerEmail = billingData.email || 'vevo@email.com';
            
            console.log("APPROVE_ORDER: Calling Billingo for order", order.id, "with email", customerEmail);
            invoiceResult = await createBillingoInvoice(order, { ...billingData, email: customerEmail });
            console.log("Billingo Invoice Result:", invoiceResult);
            if (!invoiceResult) {
                console.warn("Invoice generation failed but process continues...");
            }
        } else {
            console.log("Skipping Billingo invoice for non-card PICKUP order (will invoice on payment)");
        }

        // 4. Update Order Status
        console.log(`Updating database status to ${isPickup ? 'READY_FOR_PICKUP' : 'PROCESSING'}...`);
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: isPickup ? 'READY_FOR_PICKUP' : 'PROCESSING',
                paymentStatus: order.paymentMethod === 'CARD' ? 'PAID' : order.paymentStatus,
                trackingNumber: trackingNumber,
                invoiceId: invoiceResult?.invoiceId,
                // @ts-ignore
                invoiceUrl: invoiceResult?.pdfUrl
            },
            include: {
                items: {
                    include: {
                        part: true
                    }
                }
            }
        });

        // 5. Send Email
        console.log("Sending appropriate notification email...");
        try {
            const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
            const customerEmail = billingData.email || 'vevo@email.com';
            
            if (isNonCardPickup) {
                await sendOrderReadyForPickupEmail(updatedOrder as any, customerEmail);
            } else {
                await sendOrderConfirmedEmail(updatedOrder as any, customerEmail, invoiceResult?.pdfUrl);
            }
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
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
    console.log(`Updating payment status for ${orderId} to ${newPaymentStatus}`);
    
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { part: true } } }
    });

    if (!order) throw new Error("Order not found");

    // Trigger Billingo if transitioning to PAID and no invoice exists yet
    let invoiceId = order.invoiceId;
    // @ts-ignore
    let invoiceUrl = order.invoiceUrl;

    if (newPaymentStatus === 'PAID' && !invoiceId) {
        console.log("Generating delayed invoice for PAID order...");
        const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
        
        // Ensure we pass corporate data correctly to Billingo
        const billingoData = {
            ...billingData,
            // @ts-ignore
            isCompany: order.isCompany,
            // Fallback for taxNumber if it's missing from billingData but we know it's a company
            // @ts-ignore
            taxNumber: billingData.taxNumber || (order.isCompany ? 'ADÓSZÁM HIÁNYZIK' : '')
        };
        
        const customerEmail = billingData.email || 'vevo@email.com';
        const invoiceResult = await createBillingoInvoice(order, { ...billingoData, email: customerEmail });
        if (invoiceResult) {
            invoiceId = invoiceResult.invoiceId;
            invoiceUrl = invoiceResult.pdfUrl;
        }
    }

    // If it's a PICKUP order and we mark it as PAID, it's also COMPLETED (they took it)
    const shouldComplete = order.shippingMethod === 'PICKUP' && newPaymentStatus === 'PAID';

    await prisma.order.update({
        where: { id: orderId },
        data: { 
            paymentStatus: newPaymentStatus,
            invoiceId: invoiceId,
            // @ts-ignore
            invoiceUrl: invoiceUrl,
            status: shouldComplete ? 'DELIVERED' : order.status
        }
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
}

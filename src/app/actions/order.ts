'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { stripe } from "@/lib/stripe";
import { sendOrderReceivedEmail, sendOrderConfirmedEmail, sendOrderReadyForPickupEmail, sendOrderManualInvoiceEmail } from "@/lib/resend";
import { createBillingoInvoice } from "@/lib/billingo";
import { createPxpShipment } from "@/lib/shipping/pannon-xp";

export async function createPendingOrder(data: {
    userId?: string;
    items: any[];
    customerData: any;
    totalAmount: number;
    shippingCost: number;
    shippingMethod: string;
    paymentMethod: string;
    stripePaymentIntentId?: string;
    sessionId?: string;
    isCompany?: boolean;
    billingSameAsShipping?: boolean;
}) {
    const { userId, items, customerData, totalAmount, shippingMethod, paymentMethod, stripePaymentIntentId, sessionId, isCompany, billingSameAsShipping, shippingCost } = data;

    // Construct Definitive Billing Data
    const billingName = isCompany ? customerData.companyName : `${customerData.lastName} ${customerData.firstName}`;
    const billingPostalCode = billingSameAsShipping ? customerData.postalCode : customerData.billingPostalCode;
    const billingCity = billingSameAsShipping ? customerData.city : customerData.billingCity;
    const billingAddress = billingSameAsShipping ? customerData.address : customerData.billingAddress;
    const taxNumber = isCompany ? customerData.taxNumber : '';

    const existingOrder = await prisma.order.findFirst({
        where: {
            stripePaymentIntentId: stripePaymentIntentId,
            paymentStatus: 'PENDING'
        }
    });

    const orderData = {
        userId,
        totalAmount: Math.round(Number(totalAmount)),
        shippingCost: Math.round(Number(shippingCost)) || 0,
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
    };

    if (existingOrder) {
        console.log(`[UPSERT] Updating existing Pending order: ${existingOrder.id} for intent: ${stripePaymentIntentId}`);
        return await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
                ...orderData,
                items: {
                    deleteMany: {}, // Clear old items to avoid messy quantity merges
                    create: items.map(item => ({
                        partId: item.id,
                        quantity: Math.round(Number(item.quantityInCart)) || 1,
                        priceAtTime: Math.round(Number(item.price)),
                        productName: item.name || null
                    }))
                }
            },
            include: { items: { include: { part: true } } }
        });
    }

    const order = await prisma.order.create({
        data: {
            ...orderData,
            items: {
                create: items.map(item => ({
                    partId: item.id,
                    quantity: Math.round(Number(item.quantityInCart)) || 1,
                    priceAtTime: Math.round(Number(item.price)),
                    productName: item.name || null
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
    console.log(`[FINALIZE] Triggered for Intent: ${paymentIntentId}`);
    if (!stripe) throw new Error("Stripe beállítások hiányoznak.");

    // 1. Find the order first - prioritize the PENDING one
    const order = await prisma.order.findFirst({
        where: { 
            stripePaymentIntentId: paymentIntentId,
            paymentStatus: 'PENDING' 
        },
        include: { items: { include: { part: true } } }
    });

    if (!order) {
        // Double check if ANY order exists with this ID and is already finalized
        const finalizedOrder = await prisma.order.findFirst({
            where: { 
                stripePaymentIntentId: paymentIntentId,
                paymentStatus: { in: ['AUTHORIZED', 'PAID'] }
            }
        });
        
        if (finalizedOrder) {
            console.log(`[FINALIZE] Order ${finalizedOrder.id} already finalized for intent ${paymentIntentId}. Skipping.`);
            return { success: true, alreadyFinalized: true };
        }

        console.error(`[FINALIZE] No PENDING order found for Intent: ${paymentIntentId}`);
        return { success: false, error: "Order not found" };
    }
    
    // 2. Check if already finalized
    if (order.paymentStatus === 'AUTHORIZED' || order.paymentStatus === 'PAID') {
        console.log(`[FINALIZE] Order ${order.id} already finalized (Status: ${order.paymentStatus}). Skipping.`);
        return { success: true, alreadyFinalized: true };
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`[FINALIZE] Stripe Intent Status: ${intent.status}`);
    
    if (intent.status === 'succeeded' || intent.status === 'requires_capture') {
        // 3. Atomically update status to AUTHORIZED to prevent double processing
        // We use updateMany here to safely check the current state
        const updateResult = await prisma.order.updateMany({
            where: { 
                id: order.id,
                paymentStatus: 'PENDING' // Only update if still pending
            },
            data: { paymentStatus: 'AUTHORIZED' }
        });

        if (updateResult.count === 0) {
            console.log(`[FINALIZE] Order ${order.id} was already updated by another process.`);
            return { success: true, alreadyFinalized: true };
        }

        console.log(`[FINALIZE] Proceeding with fulfillment for Order: ${order.id}`);

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
            console.error("[FINALIZE] Error decrementing stock or clearing reservations:", error);
        }

        // Send confirmation email
        const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
        
        try {
            // RE-FETCH order to ensure we have exactly what's in the DB (including any auto-generated fields or relations)
            // even though we have an 'order' object, re-fetching is the safest way to guarantee hydration for the email.
            const freshOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: { items: { include: { part: true } } }
            });
            
            if (freshOrder) {
                console.log(`[FINALIZE] Sending "Order Received" email for ${billingData.email} with fresh order data.`);
                await sendOrderReceivedEmail(freshOrder as any, billingData.email);
            }
        } catch (err) {
            console.error("[FINALIZE] Email sending error:", err);
        }

        revalidatePath('/admin/orders');
        revalidatePath('/', 'layout');
        // @ts-ignore
        revalidateTag('products');
        // @ts-ignore
        revalidateTag('parts');
        // @ts-ignore
        revalidateTag('search');
        
        return { success: true };
    }

    console.warn(`[FINALIZE] Payment not confirmed for Intent: ${paymentIntentId}. Status: ${intent.status}`);
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
    shippingCost?: number;
}) {
    const { userId, items, customerData, totalAmount, shippingMethod, paymentMethod, stripePaymentIntentId, sessionId, isCompany, billingSameAsShipping, shippingCost } = data;

    // Construct Definitive Billing Data
    const billingName = isCompany ? customerData.companyName : `${customerData.lastName} ${customerData.firstName}`;
    const billingPostalCode = billingSameAsShipping ? customerData.postalCode : customerData.billingPostalCode;
    const billingCity = billingSameAsShipping ? customerData.city : customerData.billingCity;
    const billingAddress = billingSameAsShipping ? customerData.address : customerData.billingAddress;
    const taxNumber = isCompany ? customerData.taxNumber : '';

    const order = await prisma.order.create({
        data: {
            userId,
            totalAmount: Math.round(Number(totalAmount)),
            shippingCost: Math.round(Number(shippingCost)) || 0,
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
                    quantity: Math.round(Number(item.quantityInCart)) || 1,
                    priceAtTime: Math.round(Number(item.price)),
                    productName: item.name || null
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

    // Send "Order Received" email
    console.log(`TRIGGERING "Order Received" email for ${customerData.email}`);
    
    try {
        // RE-FETCH order to ensure we have the exact saved state from the DB for the email
        const freshOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: { include: { part: true } } }
        });
        
        if (freshOrder) {
            await sendOrderReceivedEmail(freshOrder, customerData.email);
        }
    } catch (err) {
        console.error("CRITICAL: sendOrderReceivedEmail ERROR:", err);
    }

    revalidatePath('/admin/orders');
    revalidatePath('/', 'layout'); // Ensure public pages reflect the new stock immediately
    // @ts-ignore
    revalidateTag('products'); // Clear unstable_cache for products
    // @ts-ignore
    revalidateTag('parts');
    // @ts-ignore
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
    // CRITICAL: We now SKIP this for PICKUP orders as per user request (manual invoicing only)
    let invoiceId = order.invoiceId;
    // @ts-ignore
    let invoiceUrl = order.invoiceUrl;

    const isPickup = order.shippingMethod === 'PICKUP';

    if (newPaymentStatus === 'PAID' && !invoiceId && !isPickup) {
        console.log("Generating delayed invoice for PAID order (Delivery)...");
        try {
            const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
            
            if (billingData) {
                const billingoData = {
                    ...billingData,
                    // @ts-ignore
                    isCompany: order.isCompany,
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
        } catch (e) {
            console.error("Error parsing billing address or creating invoice:", e);
        }
    }

    // If it's a PICKUP order and we mark it as PAID, it's also COMPLETED (they took it)
    const shouldComplete = isPickup && newPaymentStatus === 'PAID';

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

export async function issueManualInvoice(orderId: string) {
    console.log("MANUALLY ISSUING INVOICE FOR ORDER:", orderId);
    
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { part: true } } }
    });

    if (!order) throw new Error("Order not found");
    // @ts-ignore
    if (order.invoiceId) throw new Error("Ehhez a rendeléshez már készült számla.");

    try {
        const billingData = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress;
        
        const billingoData = {
            ...billingData,
            // @ts-ignore
            isCompany: order.isCompany,
            // @ts-ignore
            taxNumber: billingData.taxNumber || (order.isCompany ? 'ADÓSZÁM HIÁNYZIK' : '')
        };
        
        const customerEmail = billingData.email || 'vevo@email.com';
        
        console.log("ISSUE_MANUAL_INVOICE: Calling Billingo...");
        const invoiceResult = await createBillingoInvoice(order, { ...billingoData, email: customerEmail });
        
        if (!invoiceResult) throw new Error("A Billingo számla kiállítása sikertelen volt.");

        // Update order with invoice data
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                invoiceId: invoiceResult.invoiceId,
                // @ts-ignore
                invoiceUrl: invoiceResult.pdfUrl
            }
        });

        // Send custom "Invoice Prepared" email
        console.log("Sending manual invoice email to:", customerEmail);
        await sendOrderManualInvoiceEmail(updatedOrder, customerEmail, invoiceResult.pdfUrl);

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        
        return { success: true, pdfUrl: invoiceResult.pdfUrl };
    } catch (err: any) {
        console.error("Error in issueManualInvoice:", err);
        return { success: false, error: err.message };
    }
}

export async function cleanupOldOrders() {
    console.log("RUNNING ORDER CLEANUP...");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        // 1. Find orders that match the criteria
        const ordersToDelete = await prisma.order.findMany({
            where: {
                status: { in: ['DELIVERED', 'CANCELLED'] },
                OR: [
                    { updatedAt: { lt: thirtyDaysAgo } },
                    { 
                        AND: [
                            { updatedAt: null },
                            { createdAt: { lt: thirtyDaysAgo } }
                        ]
                    }
                ]
            },
            select: { id: true }
        });

        const orderIds = ordersToDelete.map(o => o.id);

        if (orderIds.length === 0) {
            console.log("No orders to clean up.");
            return { success: true, count: 0 };
        }

        console.log(`Deleting ${orderIds.length} old orders...`);

        // 2. Perform deletion in a transaction
        await prisma.$transaction([
            // Delete order items first due to foreign key constraints
            prisma.orderItem.deleteMany({
                where: { orderId: { in: orderIds } }
            }),
            // Delete the orders themselves
            prisma.order.deleteMany({
                where: { id: { in: orderIds } }
            })
        ]);

        console.log("Cleanup successful.");
        revalidatePath('/admin/orders');
        return { success: true, count: orderIds.length };
    } catch (error) {
        console.error("CRITICAL ERROR in cleanupOldOrders:", error);
        return { success: false, error: "Hiba történt a törlés során." };
    }
}

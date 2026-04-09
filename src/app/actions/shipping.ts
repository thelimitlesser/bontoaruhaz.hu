'use server';

import { performPxpManifest, trackShipment, cancelPxpShipment, getBulkPxpLabels } from "@/lib/shipping/pannon-xp";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export async function cancelOrder(orderId: string) {
    try {
        // 1. Fetch order details to get tracking number, items, and stripe intent
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) {
            return { success: false, error: "Rendelés nem található." };
        }

        if (order.status === 'CANCELLED') {
            return { success: false, error: "A rendelés már le van mondva." };
        }

        // 2. If it has an uncaptured Stripe payment, cancel it
        if (order.stripePaymentIntentId && order.paymentMethod === 'CARD' && order.paymentStatus !== 'PAID') {
            try {
                if (stripe) {
                    const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
                    if (intent.status === 'requires_capture') {
                        console.log("Cancelling uncaptured Stripe payment:", order.stripePaymentIntentId);
                        await stripe.paymentIntents.cancel(order.stripePaymentIntentId);
                    }
                }
            } catch (err: any) {
                console.error("Stripe cancellation error:", err);
                // We proceed anyway, but log the error
            }
        }

        // 3. If it has a PXP tracking number, cancel the shipment
        if (order.trackingNumber) {
            const pxpResult = await cancelPxpShipment(order.trackingNumber);
            if (!pxpResult.success) {
                console.warn(`PXP Cancellation warning for order ${orderId}: ${pxpResult.error}`);
            }
        }

        // 4. Return items to stock
        for (const item of order.items) {
            if (item.partId) {
                await prisma.part.update({
                    where: { id: item.partId },
                    data: {
                        stock: { increment: item.quantity }
                    }
                });
            }
        }

        // 5. Update order status to CANCELLED
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }
        });

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        revalidatePath('/admin/shipping');

        return { success: true };
    } catch (error: any) {
        console.error("Cancel Order Error:", error);
        return { success: false, error: error.message };
    }
}

export async function closePxpDay() {
    try {
        // 1. Determine start of today in Budapest time
        const now = new Date();
        const budapestDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Europe/Budapest',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        }).format(now);

        const [month, day, year] = budapestDate.split('/');
        const startOfToday = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        // 2. Get orders to manifest:
        // Only those currently ready (status: PROCESSING, trackingNumber present)
        // We do NOT include already SHIPPED ones, because every close should be a clean, new manifest.
        const combinedOrders = await prisma.order.findMany({
            where: {
                trackingNumber: { not: null },
                status: 'PROCESSING'
            },
            select: { trackingNumber: true, id: true, status: true }
        });

        const trackingNumbers = combinedOrders.map(o => o.trackingNumber as string);
        
        if (trackingNumbers.length === 0) {
            return { success: false, error: "Nincs lezárható csomag a listában." };
        }

        console.log(`Attempting cumulative manifest for ${trackingNumbers.length} items (Today's total list).`);

        // 3. Call PannonXP API with the FULL list for today
        const result = await performPxpManifest(trackingNumbers);

        if (result.success && result.pdfBase64) {
            // Note: The PXP API (especially on the test server) ignores our specific trackingNumbers array 
            // and instead just closes EVERY un-picked-up package on the account, returning a huge array.
            // To prevent our UI from claiming we closed 30 packages when we only requested 2, 
            // we strictly use the numbers WE requested to update our database count.
            const manifestedNums = trackingNumbers;

            // 4. Update status to SHIPPED and refresh updatedAt for all processing orders in the manifest
            const updateRes = await prisma.order.updateMany({
                where: {
                    trackingNumber: { in: manifestedNums },
                    status: 'PROCESSING'
                },
                data: {
                    status: 'SHIPPED'
                    // Prisma automatically updates updatedAt with @updatedAt
                }
            });
            
            console.log(`Cumulative manifest status update: ${updateRes.count} new orders set to SHIPPED`);

            // 5. Save/Log manifest info
            await prisma.pxpManifest.create({
                data: {
                    itemCount: manifestedNums.length,
                    pdfBase64: result.pdfBase64
                }
            });

            revalidatePath('/admin/shipping');
            revalidatePath('/admin/orders');

            return {
                success: true,
                pdfBase64: result.pdfBase64,
                count: manifestedNums.length
            };
        }

        return { success: false, error: result.error || "Hiba a napi zárás során" };
    } catch (error: any) {
        console.error("Action Error (closePxpDay):", error);
        return { success: false, error: error.message };
    }
}

export async function getBulkShippingLabels(trackingNumbers: string[]) {
    try {
        const result = await getBulkPxpLabels(trackingNumbers);
        return result;
    } catch (error: any) {
        console.error("Action Error (getBulkShippingLabels):", error);
        return { success: false, error: error.message };
    }
}

export async function trackAndSyncShipment(orderId: string, trackingNumber: string) {
    try {
        const result = await trackShipment(trackingNumber);

        if (result.success) {
            let newStatus: any = undefined;
            const statusId = (result as any).statusId;
            
            // Map PXP numeric status codes to our internal OrderStatus
            // 5 = Kézbesítve (Delivered)
            // 8 = Törölve/Visszáru (Cancelled/Returned)
            if (statusId === 5) {
                newStatus = 'DELIVERED';
            } else if (statusId === 8) {
                newStatus = 'CANCELLED';
            } else if (statusId >= 1) {
                newStatus = 'SHIPPED';
            }

            if (newStatus) {
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    select: { paymentMethod: true, paymentStatus: true, status: true }
                });

                const dataToUpdate: any = {};
                
                // Only update status if it's different and meaningful
                if (newStatus !== order?.status) {
                    dataToUpdate.status = newStatus;
                }

                // Ha utánvétes és kézbesítették, akkor a futár átvette a pénzt -> Fizetve
                if (newStatus === 'DELIVERED' && order?.paymentMethod === 'COD' && order?.paymentStatus !== 'PAID') {
                    dataToUpdate.paymentStatus = 'PAID';
                }

                if (Object.keys(dataToUpdate).length > 0) {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: dataToUpdate
                    });
                }
            }

            revalidatePath(`/admin/orders/${orderId}`);
            return { success: true, status: result.statusText };
        }

        return { success: false, error: result.error || "Nem sikerült lekérni a státuszt." };
    } catch (error: any) {
        console.error("Track & Sync Error:", error);
        return { success: false, error: error.message };
    }
}

export async function bulkSyncPxpStatuses() {
    try {
        // Find all orders that are SHIPPED (or PROCESSING with a tracking number)
        const ordersToSync = await prisma.order.findMany({
            where: {
                status: { in: ['SHIPPED', 'PROCESSING'] },
                trackingNumber: { not: null }
            },
            select: { id: true, trackingNumber: true }
        });

        console.log(`Bulk syncing ${ordersToSync.length} orders with PXP...`);
        let updatedCount = 0;

        for (const order of ordersToSync) {
            if (order.trackingNumber) {
                const res = await trackAndSyncShipment(order.id, order.trackingNumber);
                if (res.success) updatedCount++;
            }
        }

        // Log the sync
        await prisma.pxpSyncLog.create({
            data: { itemCount: updatedCount }
        });

        revalidatePath('/admin/orders');
        return { success: true, count: updatedCount };
    } catch (error: any) {
        console.error("Bulk Sync Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getLastPxpSync() {
    try {
        const lastSync = await prisma.pxpSyncLog.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, lastSync };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getManifestHistory() {
    try {
        const manifests = await prisma.pxpManifest.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30, // Last 30 manifests
            select: {
                id: true,
                createdAt: true,
                itemCount: true
            }
        });
        return { success: true, manifests };
    } catch (error: any) {
        console.error("Error fetching manifests:", error);
        return { success: false, error: error.message };
    }
}

export async function getManifestPdf(id: string) {
    try {
        const manifest = await prisma.pxpManifest.findUnique({
            where: { id },
            select: { pdfBase64: true, createdAt: true }
        });
        if (manifest) {
            return { success: true, pdfBase64: manifest.pdfBase64, date: manifest.createdAt };
        }
        return { success: false, error: "Nincs ilyen napi zárás" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function cleanupOldManifestsAction() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await prisma.pxpManifest.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        if (result.count > 0) {
            console.log(`Maintenance: Deleted ${result.count} old PXP manifests.`);
        }

        return { success: true, deletedCount: result.count };
    } catch (error: any) {
        console.error("Cleanup Action Error:", error);
        return { success: false, error: error.message };
    }
}

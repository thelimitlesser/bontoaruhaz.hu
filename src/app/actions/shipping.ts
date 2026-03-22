'use server';

import { performPxpManifest, trackShipment, cancelPxpShipment } from "@/lib/shipping/pannon-xp";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelOrder(orderId: string) {
    try {
        // 1. Fetch order details to get tracking number and items
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

        // 2. If it has a PXP tracking number, cancel the shipment in PXP system
        if (order.trackingNumber) {
            const pxpResult = await cancelPxpShipment(order.trackingNumber);
            if (!pxpResult.success) {
                console.warn(`PXP Cancellation warning for order ${orderId}: ${pxpResult.error}`);
                // We proceed anyway with local cancellation, but log it
            }
        }

        // 3. Return items to stock
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

        // 4. Update order status to CANCELLED
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
        const result = await performPxpManifest();

        if (result.success && result.pdfBase64) {
            // Update order status for manifested orders
            if (result.manifestedIds && result.manifestedIds.length > 0) {
                await prisma.order.updateMany({
                    where: {
                        trackingNumber: { in: result.manifestedIds }
                    },
                    data: {
                        status: 'SHIPPED' // Or a specific 'MANIFESTED' status if we had one
                    }
                });
            }

            // Save manifest to database
            await prisma.pxpManifest.create({
                data: {
                    itemCount: result.manifestedIds?.length || 0,
                    pdfBase64: result.pdfBase64
                }
            });

            revalidatePath('/admin/shipping');
            revalidatePath('/admin/orders');

            return {
                success: true,
                pdfBase64: result.pdfBase64,
                count: result.manifestedIds?.length || 0
            };
        }

        return { success: false, error: result.error || "Hiba a napi zárás során" };
    } catch (error: any) {
        console.error("Action Error (closePxpDay):", error);
        return { success: false, error: error.message };
    }
}

export async function trackAndSyncShipment(orderId: string, trackingNumber: string) {
    try {
        const result = await trackShipment(trackingNumber);

        if (result.success && result.statusText) {
            let newStatus: any = undefined;
            
            // Map PXP status text/code to our internal OrderStatus
            const statusText = result.statusText.toLowerCase();
            if (statusText.includes('kiszállítva') || statusText.includes('átvéve')) {
                newStatus = 'DELIVERED';
            } else if (statusText.includes('törölve')) {
                newStatus = 'CANCELLED';
            } else {
                newStatus = 'SHIPPED';
            }

            if (newStatus) {
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    select: { paymentMethod: true, paymentStatus: true }
                });

                const dataToUpdate: any = { status: newStatus };

                // Ha utánvétes és kézbesítették, akkor a futár átvette a pénzt -> Fizetve
                if (newStatus === 'DELIVERED' && order?.paymentMethod === 'COD' && order?.paymentStatus !== 'PAID') {
                    dataToUpdate.paymentStatus = 'PAID';
                }

                await prisma.order.update({
                    where: { id: orderId },
                    data: dataToUpdate
                });
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

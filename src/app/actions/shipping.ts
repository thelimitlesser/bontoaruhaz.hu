'use server';

import { performPxpManifest, trackShipment } from "@/lib/shipping/pannon-xp";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: newStatus }
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

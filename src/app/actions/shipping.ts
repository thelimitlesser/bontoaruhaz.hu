"use server";

import { getShipmentStatus } from "@/lib/shipping/pannon-xp";
import { updateOrderPaymentStatus, updateOrderStatus } from "./order";

export async function trackAndSyncShipment(orderId: string, trackingNumber: string) {
    if (!trackingNumber) return { success: false, error: "Nincs csomagszám" };

    const result = await getShipmentStatus(trackingNumber);

    if (result.success) {
        // Automatically update order status if delivered
        if (result.isDelivered) {
            await updateOrderStatus(orderId, "DELIVERED");
        }

        // If it's a COD order and it's delivered, we can potentially mark it as PAID 
        // Note: PXP has 'utanvet_beszedve' flag we use, but even 'isDelivered' is a strong indicator
        if (result.isPaid) {
            await updateOrderPaymentStatus(orderId, "PAID");
        }

        return {
            success: true,
            statusText: result.statusText,
            isDelivered: result.isDelivered,
            isPaid: result.isPaid,
            deliveredAt: result.deliveredAt
        };
    }

    return result;
}

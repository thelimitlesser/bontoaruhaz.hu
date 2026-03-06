'use server';

import { prisma } from"@/lib/prisma";
import { revalidatePath } from"next/cache";

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

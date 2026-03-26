"use client";

import { updateOrderStatus } from"@/app/actions/order";
import { useTransition } from"react";

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        startTransition(async () => {
            await updateOrderStatus(orderId, newStatus);
        });
    };

    const statusOptions = [
        { value:"PENDING", label:"Függőben" },
        { value:"READY_FOR_PICKUP", label:"Átvehető" },
        { value:"PROCESSING", label:"Feldolgozás alatt" },
        { value:"SHIPPED", label:"Szállítva" },
        { value:"DELIVERED", label:"Kézbesítve" },
        { value:"CANCELLED", label:"Törölve" },
        { value:"RETURNED", label:"Visszaküldve" },
        { value:"REFUNDED", label:"Visszatérítve" },
    ];

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">Státusz:</span>
            <select
                value={currentStatus}
                onChange={handleChange}
                disabled={isPending}
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] cursor-pointer" >
                {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

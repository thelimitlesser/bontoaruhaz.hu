"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/order";
import { CheckCircle2, Loader2 } from "lucide-react";

interface MarkAsPickedUpButtonProps {
    orderId: string;
    status: string;
    shippingMethod: string;
}

export function MarkAsPickedUpButton({ orderId, status, shippingMethod }: MarkAsPickedUpButtonProps) {
    const [isPending, startTransition] = useTransition();

    if (shippingMethod !== 'PICKUP') return null;
    if (status !== 'READY_FOR_PICKUP' && status !== 'PROCESSING') return null;

    const handlePickedUp = async () => {
        if (!confirm("Biztosan rögzíted az átvételt? A rendelés állapota 'Átvéve' lesz.")) return;

        startTransition(async () => {
            try {
                await updateOrderStatus(orderId, 'DELIVERED');
                alert("Átvétel sikeresen rögzítve!");
            } catch (err: any) {
                alert("Hiba: " + (err.message || "Ismeretlen hiba történt."));
            }
        });
    };

    return (
        <button
            onClick={handlePickedUp}
            disabled={isPending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            ÁTVÉTEL RÖGZÍTÉSE
        </button>
    );
}

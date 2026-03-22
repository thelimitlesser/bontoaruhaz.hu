"use client";

import { useTransition } from "react";
import { cancelOrder } from "@/app/actions/shipping";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface CancelOrderButtonProps {
    orderId: string;
    status: string;
}

export function CancelOrderButton({ orderId, status }: CancelOrderButtonProps) {
    const [isPending, startTransition] = useTransition();

    if (status === 'CANCELLED' || status === 'DELIVERED') return null;

    const handleCancel = async () => {
        if (!confirm("Biztosan lemondod a rendelést? Ez a termékeket visszateszi a készletre és a PannonXP szállítást is törli (ha van).")) return;

        startTransition(async () => {
            const result = await cancelOrder(orderId);
            if (result.success) {
                alert("Rendelés sikeresen lemondva, készlet visszatöltve.");
            } else {
                alert("Hiba: " + (result.error || "Ismeretlen hiba történt."));
            }
        });
    };

    return (
        <button
            onClick={handleCancel}
            disabled={isPending}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-bold text-xs uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Rendelés Lemondása
        </button>
    );
}

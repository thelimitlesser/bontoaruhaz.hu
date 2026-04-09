"use client";

import { useTransition } from "react";
import { updateOrderPaymentStatus } from "@/app/actions/order";
import { CheckCircle2, Loader2 } from "lucide-react";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useState } from "react";

interface MarkAsPickedUpButtonProps {
    orderId: string;
    status: string;
    shippingMethod: string;
}

export function MarkAsPickedUpButton({ orderId, status, shippingMethod }: MarkAsPickedUpButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    if (shippingMethod !== 'PICKUP') return null;
    if (status !== 'READY_FOR_PICKUP' && status !== 'PROCESSING') return null;

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                await updateOrderPaymentStatus(orderId, 'PAID');
                // We could use a toast notification here if available, 
                // but let's stick to the current logic for now
            } catch (err: any) {
                alert("Hiba: " + (err.message || "Ismeretlen hiba történt."));
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={isPending}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                ÁTVÉTEL RÖGZÍTÉSE
            </button>

            <ConfirmationModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirm}
                variant="success"
                title="Átvétel rögzítése"
                description="Biztosan rögzíted az átvételt? A rendelés állapota 'Átvéve' lesz, kifizetett státusszal."
                confirmText="Átvétel rögzítése"
            />
        </>
    );
}

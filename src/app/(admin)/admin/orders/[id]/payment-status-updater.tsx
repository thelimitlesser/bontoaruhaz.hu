"use client";

import { updateOrderPaymentStatus } from"@/app/actions/order";
import { useTransition } from"react";
import { CheckCircle, Clock } from"lucide-react";

export function PaymentStatusUpdater({ orderId, currentPaymentStatus }: { orderId: string, currentPaymentStatus: string }) {
    const [isPending, startTransition] = useTransition();

    const handleMarkAsPaid = () => {
        startTransition(async () => {
            await updateOrderPaymentStatus(orderId,"PAID");
        });
    };

    if (currentPaymentStatus ==="PAID") {
        return (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl font-bold border border-green-500/20">
                <CheckCircle className="w-5 h-5" />
                Fizetve
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-500 font-bold">
                <Clock className="w-5 h-5" />
                Fizetésre vár (Utánvét / Helyszíni)
            </div>
            <button
                onClick={handleMarkAsPaid}
                disabled={isPending}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50" >
                {isPending ?"Frissítés..." :"Fizetés Jóváhagyása"}
            </button>
        </div>
    );
}

"use client";

import { updateOrderPaymentStatus } from "@/app/actions/order";
import { useTransition } from "react";
import { CheckCircle, Clock } from "lucide-react";

export function PaymentStatusUpdater({ orderId, currentPaymentStatus, orderStatus, paymentMethod }: { orderId: string, currentPaymentStatus: string, orderStatus: string, paymentMethod: string }) {
    const [isPending, startTransition] = useTransition();

    const handleMarkAsPaid = () => {
        startTransition(async () => {
            await updateOrderPaymentStatus(orderId, "PAID");
        });
    };

    if (currentPaymentStatus === "PAID") {
        return (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl font-bold border border-green-500/20">
                <CheckCircle className="w-5 h-5" />
                Fizetve
            </div>
        );
    }

    const isCOD = paymentMethod === 'COD';
    const canApprovePayment = !isCOD || orderStatus === 'DELIVERED';

    return (
        <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-500 font-bold">
                <Clock className="w-5 h-5" />
                Fizetésre vár (Utánvét / Helyszíni)
            </div>
            <button
                onClick={handleMarkAsPaid}
                disabled={isPending || !canApprovePayment}
                title={!canApprovePayment ? "Utánvét esetén csak sikeres kézbesítés után hagyható jóvá a fizetés!" : "Fizetés véglegesítése"}
                className={`font-bold px-4 py-2 rounded-lg text-sm transition-all ${canApprovePayment ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-gray-300 dark:bg-zinc-800 text-gray-500 cursor-not-allowed opacity-70'}`} >
                {isPending ? "Frissítés..." : "Fizetés Jóváhagyása"}
            </button>
        </div>
    );
}

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

    const isCOD = paymentMethod === 'COD' || paymentMethod === 'cod';
    const canApprovePayment = true; // Pro decision: let admin decide, but with clear labeling

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border ${isCOD ? 'bg-blue-500/5 border-blue-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isCOD ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <h4 className={`font-bold text-sm ${isCOD ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {isCOD ? "UTÁNVÉT - BESZEDENDŐ" : "FIZETÉSRE VÁR"}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isCOD ? "A futár fogja beszedni a teljes összeget." : "Helyszíni fizetés vagy egyéb függő tétel."}
                    </p>
                </div>
            </div>
            
            <button
                onClick={handleMarkAsPaid}
                disabled={isPending}
                className={`w-full sm:w-auto font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg ${isPending ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'}`}
            >
                {isPending ? "FRISSÍTÉS..." : (isCOD ? "Pénz megérkezett (Jóváhagyás)" : "Fizetés Jóváhagyása")}
            </button>
        </div>
    );
}

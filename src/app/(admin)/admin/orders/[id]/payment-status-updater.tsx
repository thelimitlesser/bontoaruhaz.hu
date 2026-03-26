"use client";

import { updateOrderPaymentStatus } from "@/app/actions/order";
import { useTransition } from "react";
import { CheckCircle, Clock } from "lucide-react";

export function PaymentStatusUpdater({ 
    orderId, 
    currentPaymentStatus, 
    orderStatus, 
    paymentMethod,
    shippingMethod,
    trackingNumber 
}: { 
    orderId: string, 
    currentPaymentStatus: string, 
    orderStatus: string, 
    paymentMethod: string,
    shippingMethod: string,
    trackingNumber?: string | null 
}) {
    const [isPending, startTransition] = useTransition();

    const handleMarkAsPaid = () => {
        if (!confirm("Biztosan megérkezett a pénz? Csak akkor hagyd jóvá manuálisan, ha a futár már elszámolt vele, vagy készpénzben átvetted!")) {
            return;
        }
        startTransition(async () => {
            await updateOrderPaymentStatus(orderId, "PAID");
        });
    };

    if (currentPaymentStatus === "PAID") {
        return (
            <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-600 px-6 py-4 rounded-2xl font-black border border-emerald-500/20 shadow-sm shadow-emerald-500/5 w-full">
                <div className="bg-emerald-500 text-white p-1 rounded-full">
                    <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm uppercase tracking-widest">FIZETVE</h4>
                    <p className="text-[10px] font-medium opacity-70 italic uppercase">A rendelés pénzügyileg rendezve.</p>
                </div>
            </div>
        );
    }

    const isCOD = paymentMethod === 'COD' || paymentMethod === 'cod';
    const isDelivery = shippingMethod === 'DELIVERY';
    const isStripe = paymentMethod === 'CARD';
    const hasTracking = !!trackingNumber;

    // Hide button if it's Stripe (Automated capture) OR COD Shipping (Automated PXP)
    const shouldHideButton = isStripe || (isCOD && isDelivery);

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-2xl border transition-all ${isCOD ? 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20' : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 shadow-sm'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full shadow-inner ${isCOD ? 'bg-blue-100 text-blue-600' : (isStripe ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600')}`}>
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <h4 className={`font-black text-xs uppercase tracking-widest ${isCOD ? 'text-blue-700 dark:text-blue-400' : (isStripe ? 'text-purple-700 dark:text-purple-400' : 'text-amber-700 dark:text-amber-400')}`}>
                        {isCOD ? "UTÁNVÉT - BESZEDENDŐ" : (isStripe ? "STRIPE - FOGLALT ÖSSZEG" : "FIZETÉSRE VÁR")}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] leading-relaxed">
                        {isCOD 
                            ? (isDelivery ? "A futár fogja beszedni a teljes összeget." : "Helyszíni fizetés szükséges az átvételkor.")
                            : (isStripe 
                                ? "Az összeg zárolva van a kártyán. A 'Rendelés Jóváhagyása' után automatikusan levonódik." 
                                : "Helyszíni fizetés vagy egyéb függő tétel.")}
                    </p>
                    {isCOD && isDelivery && hasTracking && (
                        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Automata frissítés a PXP-től kiszállításkor
                        </div>
                    )}
                </div>
            </div>
            
            {!shouldHideButton && (
                <button
                    onClick={handleMarkAsPaid}
                    disabled={isPending}
                    className={`w-full sm:w-auto font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 ${isPending ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 border-b-4 border-emerald-800 hover:border-emerald-700'}`}
                >
                    {isPending ? "FRISSÍTÉS..." : (isCOD ? "Pénz megérkezett (Jóváhagyás)" : "Fizetés Jóváhagyása")}
                </button>
            )}
        </div>
    );
}

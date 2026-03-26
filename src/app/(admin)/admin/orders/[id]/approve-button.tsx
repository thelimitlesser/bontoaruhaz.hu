"use client";

import { useState } from "react";
import { CheckCircle, Loader2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { approveOrder } from "@/app/actions/order";
import { useRouter } from "next/navigation";

interface ApproveOrderButtonProps {
    orderId: string;
    status: string;
    paymentMethod: string;
    shippingMethod: string;
}

export function ApproveOrderButton({ orderId, status, paymentMethod, shippingMethod }: ApproveOrderButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    if (status !== 'PENDING') return null;

    const isCard = paymentMethod === 'CARD';
    const isPickup = shippingMethod === 'PICKUP';
    
    // Choose help text based on scenario
    let helpText = "Ez véglegesen elindítja a fizetést, kiállítja a számlát és generálja a PannonXP szállítási címkét is.";
    
    if (isPickup && !isCard) {
        helpText = "Ez elküldi a vevőnek a visszaigazoló emailt az átvételi információkkal. A számlát majd a helyszíni fizetéskor állítjuk ki.";
    } else if (isPickup && isCard) {
        helpText = "Ez véglegesíti a bankkártyás fizetést, kiállítja a számlát és elküldi a vevőnek az átvételi információkat.";
    } else if (!isPickup && !isCard) {
        helpText = "Ez kiállítja a számlát és generálja a PannonXP szállítási címkét is.";
    } else if (!isPickup && isCard) {
        helpText = "Ez véglegesíti a bankkártyás fizetést, kiállítja a számlát és generálja a PannonXP szállítási címkét is.";
    }

    const handleApprove = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await approveOrder(orderId);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Ismeretlen hiba történt a jóváhagyás során.");
                setShowConfirm(false);
            }
        } catch (err: any) {
            console.error("Hiba a jóváhagyás során:", err);
            setError(err.message || "Ismeretlen hiba történt a jóváhagyás közben.");
            setShowConfirm(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                >
                    <CheckCircle className="w-5 h-5" />
                    RENDELÉS JÓVÁHAGYÁSA
                </button>
            ) : (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-500 rounded-xl p-4 shadow-lg animate-in slide-in-from-bottom-2">
                    <h3 className="text-emerald-800 dark:text-emerald-300 font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-emerald-500" />
                        Biztosan jóváhagyod a rendelést?
                    </h3>
                    <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mb-4 font-medium">
                        {helpText}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" /> Mégsem
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Igen, Jóváhagyom!
                        </button>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20 shadow-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="leading-tight">{error}</span>
                </div>
            )}
        </div>
    );
}

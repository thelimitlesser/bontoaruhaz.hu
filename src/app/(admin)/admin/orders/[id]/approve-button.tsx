"use client";

import { useState } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { approveOrder } from "@/app/actions/order";
import { useRouter } from "next/navigation";

interface ApproveOrderButtonProps {
    orderId: string;
    status: string;
}

export function ApproveOrderButton({ orderId, status }: ApproveOrderButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    if (status !== 'PENDING') return null;

    const handleApprove = async () => {
        if (!confirm("Biztosan jóváhagyod a rendelést? Ez elindítja a fizetést, a számlázást és a szállítást is.")) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await approveOrder(orderId);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || "Ismeretlen hiba történt a jóváhagyás során.");
            }
        } catch (err: any) {
            console.error("Hiba a jóváhagyás során:", err);
            setError(err.message || "Ismeretlen hiba történt a jóváhagyás közben.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handleApprove}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <CheckCircle className="w-5 h-5" />
                )}
                RENDELÉS JÓVÁHAGYÁSA
            </button>
            
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
}

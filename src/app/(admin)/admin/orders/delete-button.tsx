"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteOrder } from "@/app/actions/order";
import { useRouter } from "next/navigation";

interface DeleteOrderButtonProps {
    orderId: string;
    orderNumber?: string;
    redirectAfterDelete?: boolean;
    compact?: boolean;
}

export function DeleteOrderButton({ orderId, orderNumber, redirectAfterDelete = false, compact = false }: DeleteOrderButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await deleteOrder(orderId);
            if (result.success) {
                if (redirectAfterDelete) {
                    router.push("/admin/orders");
                } else {
                    router.refresh();
                }
            } else {
                setError(result.error || "A törlés sikertelen.");
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error("Delete order error:", err);
            setError(err.message || "Hiba történt a törlés során.");
            setIsLoading(false);
        }
    };

    return (
        <>
            {compact ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    title="Rendelés végleges törlése"
                    className="p-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white rounded-xl transition-all duration-200 ring-1 ring-red-200 dark:ring-red-500/20 shadow-sm"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            ) : (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white rounded-xl transition-all duration-200 text-xs font-bold ring-1 ring-red-200 dark:ring-red-500/20 shadow-sm"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Rendelés törlése
                </button>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                        Rendelés törlése
                                    </h3>
                                    {orderNumber && (
                                        <p className="text-xs font-mono font-bold text-gray-500">#{orderNumber.slice(0, 8)}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Biztosan törölni szeretnéd ezt a lemondott / törölt rendelést? Ez a művelet <strong className="text-red-600 dark:text-red-400">véglegesen eltávolítja</strong> a rendelést a rendszerből.
                        </p>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs transition-colors"
                            >
                                Mégsem
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Végleges törlés
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

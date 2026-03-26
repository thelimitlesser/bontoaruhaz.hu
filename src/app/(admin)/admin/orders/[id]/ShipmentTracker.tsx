"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, Truck, AlertCircle, ExternalLink } from "lucide-react";
import { trackAndSyncShipment } from "@/app/actions/shipping";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ShipmentTrackerProps {
    orderId: string;
    trackingNumber: string | null;
}

export function ShipmentTracker({ orderId, trackingNumber }: ShipmentTrackerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{
        text: string;
        isDelivered: boolean;
        isPaid: boolean;
        deliveredAt?: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleTrack = async () => {
        if (!trackingNumber) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await trackAndSyncShipment(orderId, trackingNumber) as any;
            if (result.success) {
                setStatus({
                    text: result.statusText || "Ismeretlen állapot",
                    isDelivered: !!result.isDelivered,
                    isPaid: !!result.isPaid,
                    deliveredAt: result.deliveredAt
                });
                // Refresh page if status changed (to update order status badge & payment status)
                if (result.isDelivered || result.isPaid) {
                    router.refresh();
                }
            } else {
                setError(result.error || "Hiba a lekérdezés során");
            }
        } catch (err) {
            setError("Hálózati hiba történt");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (trackingNumber) {
            handleTrack();
        }
    }, [trackingNumber]);

    if (!trackingNumber) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Csomagszám</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded border border-gray-100 dark:border-white/5 truncate max-w-[120px]" title={trackingNumber}>
                            {trackingNumber}
                        </span>
                        <a 
                            href={`https://mypxp.pannonxp.hu/kereses?v=${trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-blue-500/70 hover:text-blue-500 transition-colors"
                            title="Megnyitás a PannonXP oldalán"
                        >
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
                <button
                    onClick={handleTrack}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-gray-200 dark:border-white/10"
                >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Frissítés
                </button>
            </div>

            {status && (
                <div className={`p-3 rounded-xl border animate-in fade-in slide-in-from-top-1 ${status.isDelivered ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20' : 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20'}`}>
                    <div className="flex items-start gap-3">
                        {status.isDelivered ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        ) : (
                            <Truck className="w-4 h-4 text-blue-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                Aktuális állapot: {status.text}
                            </p>
                            {status.isDelivered && (
                                <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-0.5">
                                    ✓ Kézbesítve{status.deliveredAt ? `: ${status.deliveredAt}` : ''}
                                </p>
                            )}
                            {status.isPaid && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black mt-0.5">
                                    💰 UTÁNVÉT BESZEDVE - RENDELÉS LEZÁRVA
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-500/5 p-2 rounded-lg border border-red-200 dark:border-red-500/20">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
        </div>
    );
}

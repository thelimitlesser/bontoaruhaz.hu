"use client";

import { useState } from "react";
import { RefreshCw, Check, Loader2 } from "lucide-react";
import { bulkSyncPxpStatuses } from "@/app/actions/shipping";
import { useRouter } from "next/navigation";

export function BulkSyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastResult, setLastResult] = useState<{ count: number } | null>(null);
    const router = useRouter();

    const handleBulkSync = async () => {
        setIsSyncing(true);
        try {
            const result = await bulkSyncPxpStatuses();
            if (result.success) {
                setLastResult({ count: result.count || 0 });
                router.refresh();
                // Clear success message after 3 seconds
                setTimeout(() => setLastResult(null), 3000);
            } else {
                alert("Hiba a tömeges frissítés során: " + (result.error || "Ismeretlen hiba"));
            }
        } catch (err) {
            alert("Hálózati hiba történt a frissítés közben.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleBulkSync}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border ${
                    isSyncing 
                        ? "bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10 cursor-not-allowed" 
                        : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
                title="PannonXP státuszok frissítése az összes szállított rendelésnél"
            >
                {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : lastResult ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                    <RefreshCw className="w-4 h-4" />
                )}
                {isSyncing ? "Szinkronizálás..." : lastResult ? `${lastResult.count} db frissítve` : "Futár állapota Frissítése"}
            </button>
        </div>
    );
}

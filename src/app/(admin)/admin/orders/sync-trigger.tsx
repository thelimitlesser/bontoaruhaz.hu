"use client";

import { useEffect } from "react";
import { bulkSyncPxpStatuses } from "@/app/actions/shipping";
import { useRouter } from "next/navigation";

interface SyncTriggerProps {
    lastSyncAt: Date | null;
}

export function SyncTrigger({ lastSyncAt }: SyncTriggerProps) {
    const router = useRouter();

    useEffect(() => {
        const FOUR_HOURS = 4 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const lastSync = lastSyncAt ? new Date(lastSyncAt).getTime() : 0;

        if (now - lastSync > FOUR_HOURS) {
            console.log("Auto-syncing PXP statuses (passive trigger)...");
            bulkSyncPxpStatuses().then(result => {
                if (result.success && result.count && result.count > 0) {
                    router.refresh();
                }
            }).catch(err => {
                console.error("Passive sync failed:", err);
            });
        }
    }, [lastSyncAt, router]);

    return null; // This component doesn't render anything
}

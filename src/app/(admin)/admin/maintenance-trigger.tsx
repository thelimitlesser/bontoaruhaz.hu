"use client";

import { useEffect } from "react";
import { cleanupOldManifestsAction } from "@/app/actions/shipping";

export function MaintenanceTrigger() {
    useEffect(() => {
        // Run cleanup in the background when the dashboard is loaded.
        // We don't wait for it or show any UI, it's just a passive maintenance task.
        const triggerCleanup = async () => {
            try {
                // Check if we already ran it in this session to avoid redundant calls
                const lastRun = sessionStorage.getItem('last_maintenance_run');
                const now = new Date().getTime();
                
                // Only run once every 24 hours per browser session (or just once per session)
                if (!lastRun || (now - parseInt(lastRun)) > 24 * 60 * 60 * 1000) {
                    console.log("Triggering background maintenance (shipping labels cleanup)...");
                    await cleanupOldManifestsAction();
                    sessionStorage.setItem('last_maintenance_run', now.toString());
                }
            } catch (err) {
                console.error("Maintenance trigger error:", err);
            }
        };

        triggerCleanup();
    }, []);

    return null; // Invisible component
}

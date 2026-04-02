import { bulkSyncPxpStatuses } from "@/app/actions/shipping";
import { NextResponse } from "next/server";


import { headers } from "next/headers";

export async function GET(request: Request) {
    try {
        // Force dynamic behavior
        headers();
        // Optional: Add an API key check here for security
        // const { searchParams } = new URL(request.url);
        // if (searchParams.get('key') !== process.env.CRON_SECRET) return...

        console.log("Cron job: Syncing PXP statuses...");
        const result = await bulkSyncPxpStatuses();
        
        return NextResponse.json({ 
            success: true, 
            count: result.count,
            message: `Sikeresen frissítve: ${result.count} db rendelés.` 
        });
    } catch (error: any) {
        console.error("Cron Sync Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

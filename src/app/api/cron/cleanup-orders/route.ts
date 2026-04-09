import { cleanupOldOrders } from "@/app/actions/order";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Force dynamic behavior
        headers();
        
        // Optional: Security check if CRON_SECRET is defined
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        console.log("Cron job: Cleaning up old orders...");
        const result = await cleanupOldOrders();
        
        return NextResponse.json({ 
            success: true, 
            deletedCount: result.count,
            message: result.success ? `Sikeresen törölve: ${result.count} db régi rendelés.` : "Hiba történt."
        });
    } catch (error: any) {
        console.error("Cron Cleanup Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

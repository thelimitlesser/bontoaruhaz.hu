import { NextRequest, NextResponse } from "next/server";
import { bulkSyncPxpStatuses } from "@/app/actions/shipping";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Basic security check: ensure the request has the correct Authorization header
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  console.log("CRON: Starting Pannon XP status sync...");

  try {
    const result = await bulkSyncPxpStatuses();
    
    if (result.success) {
      console.log(`CRON: Successfully synced ${result.count} orders.`);
      return NextResponse.json({
        success: true,
        message: `Szinkronizálás sikeres: ${result.count} rendelés frissítve.`,
        updatedCount: result.count
      });
    } else {
      console.error("CRON: Sync failed:", result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("CRON: Unexpected error during sync:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Force dynamic to avoid build-time caching
        headers();
        
        // Delete all reservations to clear any stuck ones
        const result = await prisma.reservation.deleteMany({});
        
        return NextResponse.json({ 
            status: "ok", 
            timestamp: new Date().toISOString(),
            clearedReservations: result.count
        });
    } catch (error: any) {
        console.error("Health Check Error:", error);
        return NextResponse.json({ 
            status: "error", 
            message: error.message
        }, { status: 500 });
    }
}



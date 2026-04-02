import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
    try {
        // Force dynamic to avoid build-time caching
        headers();
        
        console.log("Health Check: Testing Prisma connection...");
        const count = await prisma.part.count();
        
        return NextResponse.json({ 
            status: "ok", 
            database: "connected",
            count: count,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Health Check Error:", error);
        return NextResponse.json({ 
            status: "error", 
            message: error.message,
            stack: error.stack?.substring(0, 500)
        }, { status: 500 });
    }
}

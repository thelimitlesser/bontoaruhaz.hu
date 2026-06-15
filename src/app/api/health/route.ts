import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
    try {
        // Force dynamic to avoid build-time caching
        headers();
        
        return NextResponse.json({ 
            status: "ok", 
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Health Check Error:", error);
        return NextResponse.json({ 
            status: "error", 
            message: error.message
        }, { status: 500 });
    }
}




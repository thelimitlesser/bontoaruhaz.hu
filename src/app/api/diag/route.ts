import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    console.log("DIAGNOSTIC: Starting database connection test...");
    
    try {
        // 1. Check basic connection
        await prisma.$connect();
        
        // 2. Try to count something meaningful
        const brandsCount = await prisma.vehicleBrand.count();
        const partsCount = await prisma.part.count();
        const usersCount = await prisma.user.count();
        
        // 3. Check environment (masked)
        const dbUrl = process.env.DATABASE_URL || "NOT SET";
        const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");

        return NextResponse.json({
            status: "SUCCESS",
            message: "Adatbázis kapcsolat sikeresen felépült!",
            counts: {
                brands: brandsCount,
                parts: partsCount,
                users: usersCount
            },
            config: {
                url_format: maskedUrl,
                node_env: process.env.NODE_ENV
            }
        });
    } catch (error: any) {
        console.error("DIAGNOSTIC: Failed!", error);
        
        return NextResponse.json({
            status: "ERROR",
            message: "Hiba történt az adatbázis-kapcsolat során!",
            error_details: error.message,
            error_code: error.code,
            advice: "Ellenőrizze a Vercel-ben a DATABASE_URL formátumát és a Supabase jelszót!"
        }, { status: 500 });
    }
}

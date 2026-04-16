import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return new Response("Nincs azonosító megadva", { status: 400 });
    }

    try {
        const manifest = await prisma.pxpManifest.findUnique({
            where: { id },
            select: { pdfBase64: true, createdAt: true }
        });

        if (manifest && manifest.pdfBase64) {
            const pdfBuffer = Buffer.from(manifest.pdfBase64, 'base64');
            const dateStr = manifest.createdAt.toISOString().split('T')[0];
            
            return new Response(pdfBuffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="PXP_Gyujtolista_${dateStr}.pdf"`,
                },
            });
        }

        return new Response("A gyűjtőlista nem található", { status: 404 });
    } catch (error) {
        console.error("Manifest API Error:", error);
        return new Response("Belső szerverhiba", { status: 500 });
    }
}

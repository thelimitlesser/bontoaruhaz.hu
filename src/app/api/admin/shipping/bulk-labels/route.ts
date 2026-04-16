import { getBulkPxpLabels } from "@/lib/shipping/pannon-xp";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const idsString = searchParams.get('ids');

    if (!idsString) {
        return new Response("Nincsenek csomagszámok megadva", { status: 400 });
    }

    const trackingNumbers = idsString.split(',').filter(Boolean);

    if (trackingNumbers.length === 0) {
        return new Response("Nincsenek érvényes csomagszámok", { status: 400 });
    }

    try {
        console.log(`Generating bulk PDF for ${trackingNumbers.length} tracking numbers...`);
        const result = await getBulkPxpLabels(trackingNumbers);

        if (result.success && result.pdfBase64) {
            const pdfBuffer = Buffer.from(result.pdfBase64, 'base64');
            
            return new Response(pdfBuffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="PXP_Osszes_Cimke_${new Date().toISOString().split('T')[0]}.pdf"`,
                },
            });
        }

        return new Response(result.error || "Hiba a tömeges címke letöltésekor", { status: 500 });
    } catch (error) {
        console.error("Bulk Label Route Error:", error);
        return new Response("Belső szerverhiba", { status: 500 });
    }
}

import { getPxpLabelPdf } from "@/lib/shipping/pannon-xp";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ trackingNumber: string }> }
) {
    const { trackingNumber } = await params;

    if (!trackingNumber) {
        return new Response("Nincs csomagszám", { status: 400 });
    }

    try {
        const result = await getPxpLabelPdf(trackingNumber);

        if (result.success && result.pdfBase64) {
            const pdfBuffer = Buffer.from(result.pdfBase64, 'base64');
            
            return new Response(pdfBuffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="PXP_Label_${trackingNumber}.pdf"`,
                },
            });
        }

        return new Response(result.error || "Hiba a címke letöltésekor", { status: 500 });
    } catch (error) {
        console.error("Label Route Error:", error);
        return new Response("Belső szerverhiba", { status: 500 });
    }
}

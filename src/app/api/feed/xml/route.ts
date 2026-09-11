import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function GET() {
    try {
        const parts = await prisma.part.findMany({
            where: {
                stock: { gt: 0 }
            },
            include: {
                VehicleBrand: true,
                VehicleModel: true,
                PartCategory: true,
                compatibilities: {
                    include: {
                        VehicleModel: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bontoaruhaz.hu";

        let xmlContent = `<?xml version="1.0" encoding="utf-8"?>\n<termekek>\n`;

        for (const part of parts) {
            // Parse images
            let imageList: string[] = [];
            try {
                if (part.images) {
                    const parsed = JSON.parse(part.images);
                    if (Array.isArray(parsed)) {
                        imageList = parsed;
                    }
                }
            } catch {
                if (part.images && typeof part.images === "string") {
                    imageList = [part.images];
                }
            }

            // Build image xml string
            const kepekXml = imageList.map(url => `<kep_url>${escapeXml(url)}</kep_url>`).join("");

            // Auto típus string
            let autoTipus = "";
            if (part.VehicleBrand?.name || part.VehicleModel?.name) {
                autoTipus = `${part.VehicleBrand?.name || ""} ${part.VehicleModel?.name || ""}`.trim();
            } else if (part.compatibilities.length > 0) {
                const firstComp = part.compatibilities[0];
                autoTipus = `${firstComp.VehicleModel?.name || ""}`.trim();
            }

            // Termék URL
            const termekUrl = `${baseUrl}/product/${part.sku || part.id}`;

            // Állapot (Új / Használt)
            const allapot = part.condition === "NEW" ? "új" : "használt";

            xmlContent += `  <termek>\n`;
            xmlContent += `    <azonosito>${escapeXml(part.sku || part.id)}</azonosito>\n`;
            xmlContent += `    <megnevezes>${escapeXml(part.name)}</megnevezes>\n`;
            xmlContent += `    <leiras>${escapeXml(part.description || part.name)}</leiras>\n`;
            xmlContent += `    <kategoria>${escapeXml(part.PartCategory?.name || "alkatrész")}</kategoria>\n`;
            xmlContent += `    <allapot>${escapeXml(allapot)}</allapot>\n`;
            xmlContent += `    <kepek>${kepekXml}</kepek>\n`;
            xmlContent += `    <ar>${part.priceGross}</ar>\n`;
            xmlContent += `    <auto_tipus>${escapeXml(autoTipus)}</auto_tipus>\n`;
            xmlContent += `    <cikkszam>${escapeXml(part.productCode || part.oemNumbers || "")}</cikkszam>\n`;
            xmlContent += `    <gyartoi_cikkszam>${escapeXml(part.oemNumbers || "")}</gyartoi_cikkszam>\n`;
            xmlContent += `    <termek_url>${escapeXml(termekUrl)}</termek_url>\n`;
            xmlContent += `  </termek>\n`;
        }

        xmlContent += `</termekek>`;

        return new NextResponse(xmlContent, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "s-maxage=3600, stale-while-revalidate"
            }
        });
    } catch (error: any) {
        console.error("XML Feed generation error:", error);
        return new NextResponse("Error generating XML feed", { status: 500 });
    }
}

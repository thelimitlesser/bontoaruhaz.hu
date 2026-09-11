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
                        VehicleModel: {
                            include: {
                                VehicleBrand: true
                            }
                        }
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

            const kepekXml = imageList.map(url => `<kep_url>${escapeXml(url)}</kep_url>`).join("");
            const termekUrl = `${baseUrl}/product/${part.sku || part.id}`;
            const allapot = part.condition === "NEW" ? "új" : "használt";

            // 1. Összegyűjtjük az ÖSSZES kompatibilis autótípust és modellt
            const compList: { brandName: string; modelName: string; fullName: string; brandId?: string; modelId?: string }[] = [];

            // Elsődleges márka/modell (ha van)
            if (part.VehicleBrand?.name || part.VehicleModel?.name) {
                const brand = part.VehicleBrand?.name || "";
                const model = part.VehicleModel?.name || "";
                const full = `${brand} ${model}`.trim();
                if (full) {
                    compList.push({ 
                        brandName: brand, 
                        modelName: model, 
                        fullName: full,
                        brandId: part.brandId || undefined,
                        modelId: part.modelId || undefined
                    });
                }
            }

            // További kompatibilis modellek a PartCompatibility táblából
            for (const c of part.compatibilities) {
                const brand = c.VehicleModel?.VehicleBrand?.name || "";
                const model = c.VehicleModel?.name || "";
                const full = `${brand} ${model}`.trim();
                if (full && !compList.some(item => item.fullName === full)) {
                    compList.push({ 
                        brandName: brand, 
                        modelName: model, 
                        fullName: full,
                        brandId: c.brandId || undefined,
                        modelId: c.modelId || undefined
                    });
                }
            }

            // Ha 0 kompatibilitás volt megadva, default legyen a terméknév vagy általános
            if (compList.length === 0) {
                compList.push({ brandName: "Egyetemes", modelName: "Alkatrész", fullName: "Egyetemes alkatrész" });
            }

            // 2. Felépítjük a tiszta leírást (csak amit a leírás mezőbe kell írni)
            let fullDescription = "";

            if (part.description && part.description.trim()) {
                fullDescription += `${part.description.trim()}\n\n`;
            }

            if (part.engineCode) {
                fullDescription += `Motorkód: ${part.engineCode}\n`;
            }

            fullDescription += `Érdeklődéskor hivatkozzon erre: ${part.sku || part.id}\n`;
            fullDescription += `Bármire van szüksége hívjon bizalommal!\n`;
            fullDescription += `Szállítási idő: 1-3 munkanap.`;

            // 3. GENERÁLÁS: Minden kompatibilis autótípusra KÜLÖN <termek> elemet generálunk
            compList.forEach((compItem, index) => {
                const uniqueId = compList.length > 1 ? `${part.sku || part.id}-${index + 1}` : (part.sku || part.id);
                
                let displayTitle = part.name;
                if (!displayTitle.toLowerCase().includes(compItem.fullName.toLowerCase())) {
                    displayTitle = `${compItem.fullName} ${part.name}`;
                }

                // Generáljuk a pontos URL-t a márka és modell paraméterekkel, ha rendelkezésre állnak
                let specificTermekUrl = termekUrl;
                if (compItem.brandId && compItem.modelId) {
                    specificTermekUrl = `${termekUrl}?v_make=${compItem.brandId}&v_model=${compItem.modelId}`;
                }

                // A valódi gyári cikkszám és gyártói cikkszám kinyerése
                const realCikkszam = part.productCode || part.oemNumbers || part.sku || "";
                const realGyartoiCikkszam = part.oemNumbers || part.productCode || part.sku || "";

                xmlContent += `  <termek>\n`;
                xmlContent += `    <azonosito>${escapeXml(uniqueId)}</azonosito>\n`;
                xmlContent += `    <megnevezes>${escapeXml(displayTitle)}</megnevezes>\n`;
                xmlContent += `    <leiras>${escapeXml(fullDescription.trim())}</leiras>\n`;
                xmlContent += `    <kategoria>${escapeXml(part.PartCategory?.name || "alkatrész")}</kategoria>\n`;
                xmlContent += `    <allapot>${escapeXml(allapot)}</allapot>\n`;
                xmlContent += `    <kepek>${kepekXml}</kepek>\n`;
                xmlContent += `    <ar>${part.priceGross}</ar>\n`;
                xmlContent += `    <auto_tipus>${escapeXml(compItem.fullName)}</auto_tipus>\n`;
                xmlContent += `    <cikkszam>${escapeXml(realCikkszam)}</cikkszam>\n`;
                xmlContent += `    <gyartoi_cikkszam>${escapeXml(realGyartoiCikkszam)}</gyartoi_cikkszam>\n`;
                xmlContent += `    <termek_url>${escapeXml(specificTermekUrl)}</termek_url>\n`;
                xmlContent += `  </termek>\n`;
            });
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

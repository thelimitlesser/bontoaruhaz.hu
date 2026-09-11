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
            const compList: { brandName: string; modelName: string; fullName: string }[] = [];

            // Elsődleges márka/modell (ha van)
            if (part.VehicleBrand?.name || part.VehicleModel?.name) {
                const brand = part.VehicleBrand?.name || "";
                const model = part.VehicleModel?.name || "";
                const full = `${brand} ${model}`.trim();
                if (full) {
                    compList.push({ brandName: brand, modelName: model, fullName: full });
                }
            }

            // További kompatibilis modellek a PartCompatibility táblából
            for (const c of part.compatibilities) {
                const brand = c.VehicleModel?.VehicleBrand?.name || "";
                const model = c.VehicleModel?.name || "";
                const full = `${brand} ${model}`.trim();
                if (full && !compList.some(item => item.fullName === full)) {
                    compList.push({ brandName: brand, modelName: model, fullName: full });
                }
            }

            // Ha 0 kompatibilitás volt megadva, default legyen a terméknév vagy általános
            if (compList.length === 0) {
                compList.push({ brandName: "Egyetemes", modelName: "Alkatrész", fullName: "Egyetemes alkatrész" });
            }

            // 2. Felépítjük a strukturált, részletes leírást (Specifikációk + Kompatibilitás)
            let fullDescription = "";

            if (part.description && part.description.trim()) {
                fullDescription += `${part.description.trim()}\n\n`;
            }

            fullDescription += `--- RÉSZLETES ADATOK ---\n`;
            fullDescription += `Állapot: ${allapot === "új" ? "Új" : "Használt"}\n`;
            if (part.sku) fullDescription += `Hivatkozási szám: ${part.sku}\n`;
            if (part.productCode && part.productCode !== part.sku) fullDescription += `Gyári cikkszám: ${part.productCode}\n`;
            if (part.oemNumbers && part.oemNumbers !== part.productCode) fullDescription += `OEM számok: ${part.oemNumbers}\n`;
            if (part.engineCode) fullDescription += `Motorkód: ${part.engineCode}\n`;
            if (part.yearFrom || part.yearTo) {
                fullDescription += `Évjárat: ${part.yearFrom || ""}${part.yearFrom && part.yearTo ? " - " : ""}${part.yearTo || ""}\n`;
            }

            if (compList.length > 0) {
                fullDescription += `\n--- KOMPATIBILIS TÍPUSOK ---\n`;
                compList.forEach(item => {
                    fullDescription += `- ${item.fullName}\n`;
                });
            }

            // 3. GENERÁLÁS: Minden kompatibilis autótípusra KÜLÖN <termek> elemet generálunk
            // Így a RacingBazár (és más oldalak) külön hirdetésként fogják felvenni az összes kompatibilis autómodellre!
            compList.forEach((compItem, index) => {
                // Egyedi azonosító a variációra (pl. SKU-1, SKU-2), hogy ne ütközzenek
                const uniqueId = compList.length > 1 ? `${part.sku || part.id}-${index + 1}` : (part.sku || part.id);
                
                // Cím kiegészítése a konkrét autómodell nevével
                let displayTitle = part.name;
                if (!displayTitle.toLowerCase().includes(compItem.fullName.toLowerCase())) {
                    displayTitle = `${compItem.fullName} ${part.name}`;
                }

                xmlContent += `  <termek>\n`;
                xmlContent += `    <azonosito>${escapeXml(uniqueId)}</azonosito>\n`;
                xmlContent += `    <megnevezes>${escapeXml(displayTitle)}</megnevezes>\n`;
                xmlContent += `    <leiras>${escapeXml(fullDescription.trim())}</leiras>\n`;
                xmlContent += `    <kategoria>${escapeXml(part.PartCategory?.name || "alkatrész")}</kategoria>\n`;
                xmlContent += `    <allapot>${escapeXml(allapot)}</allapot>\n`;
                xmlContent += `    <kepek>${kepekXml}</kepek>\n`;
                xmlContent += `    <ar>${part.priceGross}</ar>\n`;
                xmlContent += `    <auto_tipus>${escapeXml(compItem.fullName)}</auto_tipus>\n`;
                xmlContent += `    <cikkszam>${escapeXml(part.productCode || part.oemNumbers || "")}</cikkszam>\n`;
                xmlContent += `    <gyartoi_cikkszam>${escapeXml(part.oemNumbers || "")}</gyartoi_cikkszam>\n`;
                xmlContent += `    <termek_url>${escapeXml(termekUrl)}</termek_url>\n`;
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

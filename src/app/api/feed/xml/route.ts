import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProductUrl } from "@/utils/slug";

export const dynamic = "force-dynamic";

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function cleanDisplayTitle(
    partName: string,
    targetComp: { fullName: string; brandName: string; modelName: string },
    allComps: { fullName: string; brandName: string; modelName: string }[]
): string {
    let cleaned = partName.trim();

    const stringsToRemove = new Set<string>();
    for (const comp of allComps) {
        if (comp.fullName) stringsToRemove.add(comp.fullName);
        if (comp.modelName) stringsToRemove.add(comp.modelName);
        if (comp.brandName && comp.modelName) stringsToRemove.add(`${comp.brandName} ${comp.modelName}`);

        if (comp.modelName) {
            const baseModel = comp.modelName.replace(/\s*\([^)]*\)/g, "").trim();
            if (baseModel) {
                stringsToRemove.add(baseModel);
                if (comp.brandName) stringsToRemove.add(`${comp.brandName} ${baseModel}`);
            }
        }
    }

    const sortedStrings = Array.from(stringsToRemove)
        .filter(s => s && s.length >= 3)
        .sort((a, b) => b.length - a.length);

    for (const str of sortedStrings) {
        const esc = str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const startRegex = new RegExp("^" + esc + "(\\s*[-:,/]?\\s*)", "gi");
        cleaned = cleaned.replace(startRegex, "");
    }

    for (const str of sortedStrings) {
        if (targetComp.fullName.toLowerCase().includes(str.toLowerCase())) continue;
        const esc = str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const innerRegex = new RegExp("\\b" + esc + "\\b", "gi");
        cleaned = cleaned.replace(innerRegex, "");
    }

    cleaned = cleaned
        .replace(/\s+/g, " ")
        .replace(/^[-:/\\,\s]+/, "")
        .replace(/[-:/\\,\s]+$/, "")
        .trim();

    if (!cleaned) {
        cleaned = partName;
    }

    if (!cleaned.toLowerCase().includes(targetComp.fullName.toLowerCase())) {
        return `${targetComp.fullName} ${cleaned}`.trim();
    }
    return cleaned;
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
            // Alapvető kánonikus termék URL
            const productPath = getProductUrl({
                id: part.id,
                name: part.name,
                brandName: part.VehicleBrand?.name,
                modelName: part.VehicleModel?.name,
                sku: part.sku
            });
            const termekUrl = `${baseUrl}${productPath}`;
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
            let fullDescription = part.description ? part.description.trim() : `Eladó gyári ${allapot} ${part.name}.`;

            if (part.engineCode && !fullDescription.toLowerCase().includes(part.engineCode.toLowerCase())) {
                fullDescription += `\nMotorkód: ${part.engineCode}`;
            }

            const refCode = part.productCode || part.sku || part.id;
            if (refCode && !fullDescription.includes(refCode)) {
                fullDescription += `\nHivatkozási szám: (${refCode})`;
            }

            if (!fullDescription.includes("Szállítási idő")) {
                fullDescription += `\nSzállítási idő: 1-3 munkanap.`;
            }

            // Újsorok átalakítása <br /> tagekké a Racing Bazár HTML megjelenítéséhez
            const formattedDescription = fullDescription
                .replace(/\r\n/g, "\n")
                .replace(/\n\n+/g, "<br /><br />")
                .replace(/\n/g, "<br />");

            const refId = part.sku ? part.sku : part.id;
            const finalPrice = Math.round(Number(part.priceGross || part.priceNet || 0));
            const netPrice = Math.round(Number(part.priceNet || 0));

            // 3. GENERÁLÁS: Minden kompatibilis autótípusra KÜLÖN <termek> elemet generálunk
            compList.forEach((compItem, index) => {
                const uniqueId = compList.length > 1 ? `${refId}-${index + 1}` : refId;
                const displayTitle = cleanDisplayTitle(part.name, compItem, compList);

                // Generáljuk a pontos URL-t a márka és modell paraméterekkel, ha rendelkezésre állnak
                let specificTermekUrl = termekUrl;
                if (compItem.brandId && compItem.modelId) {
                    specificTermekUrl = `${termekUrl}?v_make=${compItem.brandId}&v_model=${compItem.modelId}`;
                }

                // A cikkszám a megadott Gyári Cikkszám. A gyártói cikkszám üres tag marad.
                const realCikkszam = part.productCode || "";

                xmlContent += `  <termek>\n`;
                xmlContent += `    <azonosito>${escapeXml(uniqueId)}</azonosito>\n`;
                xmlContent += `    <megnevezes>${escapeXml(displayTitle)}</megnevezes>\n`;
                xmlContent += `    <leiras>${escapeXml(formattedDescription.trim())}</leiras>\n`;
                xmlContent += `    <kategoria>${escapeXml(part.PartCategory?.name || "alkatrész")}</kategoria>\n`;
                xmlContent += `    <allapot>${escapeXml(allapot)}</allapot>\n`;
                xmlContent += `    <kepek>${kepekXml}</kepek>\n`;
                xmlContent += `    <ar>${finalPrice}</ar>\n`;
                xmlContent += `    <ar_brutto>${finalPrice}</ar_brutto>\n`;
                xmlContent += `    <ar_netto>${netPrice}</ar_netto>\n`;
                xmlContent += `    <price>${finalPrice}</price>\n`;
                xmlContent += `    <valuta>HUF</valuta>\n`;
                xmlContent += `    <penznem>HUF</penznem>\n`;
                xmlContent += `    <auto_tipus>${escapeXml(compItem.fullName)}</auto_tipus>\n`;
                xmlContent += `    <marka>${escapeXml(compItem.brandName)}</marka>\n`;
                xmlContent += `    <modell>${escapeXml(compItem.modelName)}</modell>\n`;
                xmlContent += `    <cikkszam>${escapeXml(realCikkszam)}</cikkszam>\n`;
                xmlContent += `    <gyartoi_cikkszam></gyartoi_cikkszam>\n`;
                xmlContent += `    <termek_url>${escapeXml(specificTermekUrl)}</termek_url>\n`;
                xmlContent += `    <url>${escapeXml(specificTermekUrl)}</url>\n`;
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


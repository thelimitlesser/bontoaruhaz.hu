import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProductUrl } from '@/utils/slug';

export const revalidate = 3600; // Cache feed for 1 hour

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    const baseUrl = 'https://www.bontoaruhaz.hu';

    try {
        const parts = await prisma.part.findMany({
            where: {
                stock: { gt: 0 }
            },
            select: {
                id: true,
                name: true,
                description: true,
                priceGross: true,
                priceNet: true,
                stock: true,
                sku: true,
                images: true,
                VehicleBrand: { select: { name: true } },
                VehicleModel: { select: { name: true } },
                PartCompatibility: {
                    select: {
                        VehicleBrand: { select: { name: true } },
                        VehicleModel: { select: { name: true } }
                    }
                }
            },
            take: 2000
        });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
        xml += `<channel>\n`;
        xml += `  <title>Bontóáruház Termékek</title>\n`;
        xml += `  <link>${baseUrl}</link>\n`;
        xml += `  <description>Gyári bontott autóalkatrészek garanciával</description>\n`;

        for (const part of parts) {
            const productPath = getProductUrl({
                id: part.id,
                name: part.name,
                brandName: part.VehicleBrand?.name,
                modelName: part.VehicleModel?.name,
                sku: part.sku
            });
            const link = `${baseUrl}${productPath}`;

            // Build main title with brand & model if available
            let title = part.name;
            if (part.VehicleBrand?.name) {
                if (part.VehicleModel?.name) {
                    title += ` - ${part.VehicleBrand.name} ${part.VehicleModel.name}`;
                } else {
                    title += ` - ${part.VehicleBrand.name}`;
                }
            }

            // Build full compatibility string
            const compatibilities = part.PartCompatibility.map(c => {
                const b = c.VehicleBrand?.name || '';
                const m = c.VehicleModel?.name || '';
                return `${b} ${m}`.trim();
            }).filter(Boolean);

            let description = part.description || part.name;
            if (compatibilities.length > 0) {
                description += ` | Kompatibilis típusok: ${compatibilities.join(', ')}`;
            }
            if (part.sku) {
                description += ` | Cikkszám: ${part.sku}`;
            }

            // Image URL
            let imageUrl = '';
            if (part.images && typeof part.images === 'string') {
                const imgList = part.images.split(',').filter(Boolean);
                if (imgList.length > 0) imageUrl = imgList[0];
            } else if (part.images && Array.isArray(part.images) && part.images.length > 0) {
                const img = part.images[0];
                imageUrl = typeof img === 'string' ? img : (img?.url || '');
            }
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }

            const price = Math.round(Number(part.priceGross || part.priceNet || 0));

            xml += `  <item>\n`;
            xml += `    <g:id>${escapeXml(part.id)}</g:id>\n`;
            xml += `    <g:title>${escapeXml(title)}</g:title>\n`;
            xml += `    <g:description>${escapeXml(description)}</g:description>\n`;
            xml += `    <g:link>${escapeXml(link)}</g:link>\n`;
            if (imageUrl) {
                xml += `    <g:image_link>${escapeXml(imageUrl)}</g:image_link>\n`;
            }
            xml += `    <g:availability>${part.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>\n`;
            xml += `    <g:price>${price} HUF</g:price>\n`;
            xml += `    <g:condition>used</g:condition>\n`;
            if (part.VehicleBrand?.name) {
                xml += `    <g:brand>${escapeXml(part.VehicleBrand.name)}</g:brand>\n`;
            }
            if (part.sku) {
                xml += `    <g:mpn>${escapeXml(part.sku)}</g:mpn>\n`;
            }
            xml += `    <g:google_product_category>Vehicles &amp; Parts &gt; Vehicle Parts &amp; Accessories</g:google_product_category>\n`;
            xml += `  </item>\n`;
        }

        xml += `</channel>\n`;
        xml += `</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate'
            }
        });
    } catch (error: any) {
        console.error('Google Shopping Feed Generation Error:', error);
        return new NextResponse(`Error generating feed: ${error?.message || error}`, { status: 500 });
    }
}

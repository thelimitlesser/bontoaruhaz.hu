import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { extractIdFromSlug } from '@/utils/slug'

export async function generateMetadata({ params }: { params: Promise<{ slug_id: string }> }): Promise<Metadata> {
    const { slug_id } = await params
    const id = extractIdFromSlug(slug_id)
    const dbPart = await prisma.part.findUnique({
        where: { id },
        select: {
            name: true,
            brandId: true,
            modelId: true,
            yearFrom: true,
            yearTo: true,
            condition: true,
        }
    })

    if (!dbPart) return { title: 'Termék nem található' }

    const [brandObj, modelObj] = await Promise.all([
        dbPart.brandId ? prisma.vehicleBrand.findUnique({ where: { id: dbPart.brandId } }) : null,
        dbPart.modelId ? prisma.vehicleModel.findUnique({ where: { id: dbPart.modelId } }) : null
    ]);
    
    const brandName = brandObj?.name || dbPart.brandId || "";
    const modelName = modelObj?.name || dbPart.modelId || "";

    // Construction of the SEO-perfect title: Brand - Model - Part Name - Year
    let yearString = "";
    if (dbPart.yearFrom && dbPart.yearTo) {
        yearString = `${dbPart.yearFrom}-${dbPart.yearTo}`;
    } else if (dbPart.yearFrom) {
        yearString = `${dbPart.yearFrom}-`;
    }

    const titleParts = [brandName, modelName, dbPart.name, yearString].filter(Boolean);
    const title = `${titleParts.join(' ')} - BONTÓÁRUHÁZ`;
    const description = `Bontott ${brandName} ${modelName} alkatrész: ${dbPart.name}. Szállítás: 2-3 munkanap. Garanciával, az ország egész területén.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
        },
    }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

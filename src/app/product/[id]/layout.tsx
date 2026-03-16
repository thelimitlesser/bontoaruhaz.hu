import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getBrandById, getModelById, getBrandBySlug, getModelBySlug } from '@/lib/vehicle-data'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
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

    const brandObj = dbPart.brandId ? getBrandById(dbPart.brandId) : null;
    const modelObj = dbPart.modelId ? getModelById(dbPart.modelId) : null;
    
    const brandName = brandObj?.name || (dbPart.brandId ? getBrandBySlug(dbPart.brandId)?.name : null) || dbPart.brandId || "";
    const modelName = modelObj?.name || (dbPart.modelId ? getModelBySlug(dbPart.modelId)?.name : null) || dbPart.modelId || "";

    // Construction of the SEO-perfect title: Brand - Model - Part Name - Year
    let yearString = "";
    if (dbPart.yearFrom && dbPart.yearTo) {
        yearString = `${dbPart.yearFrom}-${dbPart.yearTo}`;
    } else if (dbPart.yearFrom) {
        yearString = `${dbPart.yearFrom}-`;
    }

    const titleParts = [brandName, modelName, dbPart.name, yearString].filter(Boolean);
    const title = `${titleParts.join(' ')} - BONTÓÁRUHÁZ`;
    const description = `Minőségi bontott ${brandName} ${modelName} alkatrész: ${dbPart.name}. Garanciával, gyors szállítással Magyarország egész területén.`;

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

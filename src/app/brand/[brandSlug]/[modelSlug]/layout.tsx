export const dynamic = "force-dynamic";
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ brandSlug: string; modelSlug: string }> }): Promise<Metadata> {
    const { brandSlug, modelSlug } = await params
    
    // Fetch brand and model in parallel
    const brand = await prisma.vehicleBrand.findUnique({ where: { slug: brandSlug } });
    const model = await prisma.vehicleModel.findFirst({ 
        where: { 
            slug: modelSlug,
            brandId: brand?.id 
        } 
    });

    if (!brand || !model) return { title: 'Modell nem található' }

    const title = `${brand.name} ${model.name} bontott alkatrészek - BONTÓÁRUHÁZ`
    const description = `Keress és rendelj bontott alkatrészeket ${brand.name} ${model.name} típushoz. Motor, váltó, karosszéria és egyéb alkatrészek garanciával, azonnal raktárról.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: brand.logo ? [{ url: brand.logo }] : [],
        },
    }
}

export default function ModelLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

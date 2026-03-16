import { Metadata } from 'next'
import { getBrandBySlug, getModelBySlug } from '@/lib/vehicle-data'

export async function generateMetadata({ params }: { params: Promise<{ brandSlug: string; modelSlug: string }> }): Promise<Metadata> {
    const { brandSlug, modelSlug } = await params
    const brand = getBrandBySlug(brandSlug)
    const model = getModelBySlug(modelSlug)

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

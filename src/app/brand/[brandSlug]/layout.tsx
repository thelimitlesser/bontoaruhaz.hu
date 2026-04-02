export const dynamic = "force-dynamic";
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ brandSlug: string }> }): Promise<Metadata> {
    const { brandSlug } = await params
    const brand = await prisma.vehicleBrand.findUnique({
        where: { slug: brandSlug }
    });

    if (!brand) return { title: 'Márka nem található' }

    const title = `Bontott ${brand.name} alkatrészek garanciával - BONTÓÁRUHÁZ`
    const description = `Minőségi bontott ${brand.name} alkatrészek széles választéka. Gyors szállítás, 14 napos visszavásárlási garancia közvetlenül a raktárunkból.`

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

export default function BrandLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

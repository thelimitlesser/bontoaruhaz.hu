export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { BrandModelsList } from "@/components/brand/brand-models-list";
import { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ brandSlug: string }> }): Promise<Metadata> {
    try {
        const { brandSlug } = await params;
        const brand = await prisma.vehicleBrand.findUnique({
            where: { slug: brandSlug }
        });
        
        if (!brand) return { title: "Márka nem található" };

        const title = `Bontott ${brand.name} alkatrészek és típusok | Bontóáruház`;
        const description = `Minőségi bontott autóalkatrészek széles választéka ${brand.name} gépjárművekhez. Keress modellszám vagy kategória alapján!`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [brand.logo],
            }
        };
    } catch (error) {
        console.error("META ERROR: Failed to fetch brand metadata from DB:", error);
        return { title: "Alkatrészek | Bontóáruház" };
    }
}

export default async function BrandPage({ params }: { params: Promise<{ brandSlug: string }> }) {
    try {
        const { brandSlug } = await params;

        const brand = await prisma.vehicleBrand.findUnique({
            where: { slug: brandSlug }
        });

        if (!brand) {
            notFound();
        }

        const models = await prisma.vehicleModel.findMany({
            where: {
                brandId: brand.id,
                OR: [
                    {
                        Part: {
                            some: { stock: { gt: 0 } }
                        }
                    },
                    {
                        PartCompatibility: {
                            some: {
                                part: { stock: { gt: 0 } }
                            }
                        }
                    }
                ]
            },
            select: { 
                id: true, 
                name: true, 
                slug: true,
                series: true 
            }
        });

        return renderBrandPage(brand, models);
    } catch (error) {
        console.error("RUNTIME ERROR: Failed to fetch brand page data from DB. Displaying error state.", error);
        return (
            <div className="min-h-screen pt-40 text-center px-4">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Átmeneti hiba az adatok betöltésekor</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Az adatbázis jelenleg nem elérhető. Kérjük, frissítse az oldalt vagy próbálkozzon pár perc múlva.</p>
                <Link href="/" className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-bold">VISSZA A FŐOLDALRA</Link>
            </div>
        );
    }
}

function renderBrandPage(brand: any, models: any[]) {
    const typedModels = models as any[]; // Cast to match BrandModelsList prop type

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Bontott ${brand.name} alkatrészek`,
        "description": `Bontott autóalkatrészek kínálata ${brand.name} típusokhoz.`,
        "url": `https://bontoaruhaz.hu/brand/${brand.slug}`,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": models.length,
            "itemListElement": models.map((m, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": `${brand.name} ${m.name}`,
                "url": `https://bontoaruhaz.hu/brand/${brand.slug}/${m.slug}`
            }))
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

            <main className="pt-32 pb-20 px-4 md:px-6 max-w-[1500px] mx-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium uppercase tracking-wide overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    <Link href="/" className="hover:text-black transition-colors shrink-0">KEZDŐLAP</Link>
                    <span className="shrink-0">/</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {brand.logo && (
                            <Image src={brand.logo} alt={brand.name} width={16} height={16} className="object-contain opacity-50 grayscale" />
                        )}
                        <span className="text-[var(--color-primary)] font-bold">{brand.name}</span>
                    </div>
                </div>

                <div className="mb-6 focus-within:outline-none flex items-center gap-4">
                    <h1 className="text-2xl sm:text-4xl font-black text-gray-700 uppercase tracking-tighter leading-none">
                        {brand.name} MODELLVÁLASZTÉK
                    </h1>
                </div>

                <BrandModelsList brand={{ id: brand.id, name: brand.name, slug: brand.slug, logo: brand.logo }} models={typedModels} />

            </main>
        </div>
    );
}

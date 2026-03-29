import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveCategoriesForModelAction } from "@/app/actions/vehicle";
import { ArrowRight, Search, PlusCircle } from "lucide-react";
import { getCategoryIcon } from "@/utils/icon-mapping";
import { Navbar } from "@/components/navbar";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ brandSlug: string; modelSlug: string }> }): Promise<Metadata> {
    const { brandSlug, modelSlug } = await params;
    const brand = await prisma.vehicleBrand.findUnique({ where: { slug: brandSlug } });
    const model = await prisma.vehicleModel.findFirst({ where: { slug: modelSlug, brandId: brand?.id } });

    if (!brand || !model) return { title: "Modell nem található" };

    const title = `Bontott ${brand.name} ${model.name} alkatrészek kategóriák szerint | Bontóáruház`;
    const description = `Válogass kategóriák szerint a bontott ${brand.name} ${model.name} alkatrészek között. Karosszéria, motor, futómű és minden egyéb egy helyen.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [brand.logo],
        }
    };
}

export default async function ModelCategoryPage({ params }: { params: Promise<{ brandSlug: string; modelSlug: string }> }) {
    const { brandSlug, modelSlug } = await params;

    const brand = await prisma.vehicleBrand.findUnique({ where: { slug: brandSlug } });
    const model = await prisma.vehicleModel.findFirst({ where: { slug: modelSlug, brandId: brand?.id } });

    if (!brand || !model) {
        notFound();
    }

    const categories = await getActiveCategoriesForModelAction(brand.id, model.id);
    
    const filteredCategories = categories.map(cat => ({
        ...cat,
        icon: getCategoryIcon(cat.iconName)
    }));

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Bontott ${brand.name} ${model.name} alkatrészek`,
        "description": `Kategóriánkénti bontott alkatrész válogatás ${brand.name} ${model.name} gépjárműhöz.`,
        "url": `https://bontoaruhaz.hu/brand/${brand.slug}/${model.slug}`,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": filteredCategories.length,
            "itemListElement": filteredCategories.map((cat, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": `${cat.name} alkatrészek`,
                "url": `https://bontoaruhaz.hu/brand/${brand.slug}/${model.slug}/${cat.slug}`
            }))
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-[family-name:var(--font-geist-sans)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

            <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">

                {/* Navigation / Breadcrumb */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-4 font-medium uppercase tracking-wide">
                    <Link href="/" className="hover:text-black transition-colors">KEZDŐLAP</Link>
                    <span>/</span>
                    <Link href={`/brand/${brand.slug}`} className="hover:text-black transition-colors flex items-center gap-1.5 line-clamp-1">
                        {brand.name}
                    </Link>
                    <span>/</span>
                    <span className="text-[var(--color-primary)] font-bold">{model.name}</span>
                </div>

                <div className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-[#1a1a1a] uppercase tracking-tighter mb-4 italic leading-none">
                        <span className="text-[var(--color-primary)]">{brand.name} {model.name}</span>
                        <br />
                        ALKATRÉSZEK
                    </h1>
                    <p className="text-gray-500 text-lg font-medium max-w-2xl">
                        Válaszd ki az alkatrész kategóriát a kereséshez.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={cat.id}
                                href={`/brand/${brand.slug}/${model.slug}/${cat.slug}`}
                                className="group relative bg-white border border-gray-100 rounded-xl p-4 md:p-5 hover:shadow-xl hover:shadow-[var(--color-primary)]/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    {/* Icon */}
                                    <Icon className="w-12 h-12 shrink-0 object-contain transition-all duration-300 group-hover:scale-110 text-[var(--color-primary)] opacity-80 group-hover:opacity-100" strokeWidth={1.5} />
                                    
                                    <span className="text-base font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors leading-tight uppercase tracking-tight">
                                        {cat.name}
                                    </span>
                                </div>
                                
                                {/* Decorative background element */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-0 group-hover:scale-150 z-0" />
                            </Link>
                        );
                    })}

                    {/*"Not found" LAST CARD */}
                    <Link
                        href="/#kereso" 
                        className="group relative bg-white border border-dashed border-[var(--color-primary)]/40 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-xl p-4 md:p-5 transition-all duration-200 flex items-center gap-4 active:scale-[0.98]" 
                    >
                        <Search className="w-12 h-12 shrink-0 text-[var(--color-primary)] opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" strokeWidth={2} />
                        <h3 className="font-black text-[var(--color-primary)] text-base leading-tight uppercase">
                            NEM TALÁLOD?
                        </h3>
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-20 border-t border-gray-200 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="flex flex-col gap-2 items-center text-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                            <span className="text-sm font-black text-[#1a1a1a] uppercase tracking-wider">14 Nap Garancia</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Minden alkatrészre pénzvisszafizetési garanciát vállalunk.</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center text-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-sm font-black text-[#1a1a1a] uppercase tracking-wider">Gyors szállítás</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">1-3 napon belüli szállítás az ország egész területén.</p>
                    </div>
                </div>

            </main>
        </div>
    );
}

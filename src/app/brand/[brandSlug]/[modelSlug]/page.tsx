"use client";
import { useState, useEffect, use } from"react";
import Link from"next/link";
import { notFound } from"next/navigation";
import { getBrandBySlug, getModelBySlug, categories } from"@/lib/vehicle-data";
import { ArrowRight, Search, PackageSearch } from"lucide-react";
import { Navbar } from"@/components/navbar";
import { getCategoryProductCounts } from"@/app/actions/product";

export default function ModelCategoryPage({ params }: { params: Promise<{ brandSlug: string; modelSlug: string }> }) {
    const { brandSlug, modelSlug } = use(params);

    const brand = getBrandBySlug(brandSlug);
    const model = getModelBySlug(modelSlug);

    if (!brand || !model) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Bontott ${brand.name} ${model.name} alkatrészek`,
        "description": `Kategóriánkénti bontott alkatrész válogatás ${brand.name} ${model.name} gépjárműhöz.`,
        "url": `https://bontoaruhaz.hu/brand/${brand.slug}/${model.slug}`,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": categories.length,
            "itemListElement": categories.map((cat, index) => ({
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

                {/* Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {categories.map((cat) => {
                        const Icon = cat.icon;

                        return (
                            <Link
                                key={cat.id}
                                href={`/brand/${brand.slug}/${model.slug}/${cat.slug}`}
                                className="group relative bg-white border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-xl hover:shadow-[var(--color-primary)]/10 rounded-xl p-4 transition-all duration-200 flex items-center gap-4 active:scale-[0.98]" >
                                {/* Icon */}
                                <Icon className="w-12 h-12 shrink-0 object-contain transition-all duration-300 group-hover:scale-110 text-[var(--color-primary)] opacity-80 group-hover:opacity-100" strokeWidth={1.5} />

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg leading-tight transition-colors text-gray-900 group-hover:text-[var(--color-primary)] break-words">
                                        {cat.name.split('/').map((part, i, arr) => (
                                            <span key={i}>
                                                {part}
                                                {i < arr.length - 1 && <>/<wbr /></>}
                                            </span>
                                        ))}
                                    </h3>
                                </div>

                                {/* Subtle Indicator */}
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />
                                </div>
                            </Link>
                        );
                    })}

                    {/*"Not found" LAST CARD */}
                    <Link
                        href="/#kereso" className="group relative bg-white border border-dashed border-[var(--color-primary)]/40 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-xl p-4 transition-all duration-200 flex items-center gap-4 active:scale-[0.98]" >
                        <Search className="w-12 h-12 shrink-0 text-[var(--color-primary)] opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" strokeWidth={2} />
                        <div>
                            <h3 className="font-black text-[var(--color-primary)] text-[14px] leading-tight uppercase">
                                NEM TALÁLOD?
                            </h3>
                        </div>
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-20 border-t border-gray-200 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-black text-[#1a1a1a] uppercase tracking-wider">1.5M+ Alkatrész</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Folyamatosan frissülő készlet Magyarország legnagyobb bontóiból.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                            <span className="text-sm font-black text-[#1a1a1a] uppercase tracking-wider">15 Nap Garancia</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Minden alkatrészre pénzvisszafizetési garanciát vállalunk.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-sm font-black text-[#1a1a1a] uppercase tracking-wider">Gyors kiszállítás</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Akár 24 órán belüli szállítás az ország egész területén.</p>
                    </div>
                </div>

            </main>
        </div>
    );
}

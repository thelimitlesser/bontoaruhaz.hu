"use client";

import { use, Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useSearchParams } from "next/navigation";
import {
    getBrandBySlug,
    getModelBySlug,
    getCategoryBySlug,
    getProducts,
    getSubcategoriesByCategory,
    getPartItemsBySubcategory
} from "@/lib/vehicle-data";
import { subcategories as allSubcategories, partItems as allPartItems } from "@/lib/parts-data";
import { Filter } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { getSearchProducts } from "@/app/actions/product";

function CategoryProductsContent({ params }: { params: { brandSlug: string; modelSlug: string; categorySlug: string } }) {
    const { brandSlug, modelSlug, categorySlug } = params;
    const searchParams = useSearchParams();
    const subcatSlug = searchParams.get("subcat");
    const partItemSlug = searchParams.get("item");


    const brand = getBrandBySlug(brandSlug);
    const model = getModelBySlug(modelSlug);
    const category = getCategoryBySlug(categorySlug);

    if (!brand || !model || !category) {
        notFound();
    }

    const subcategories = getSubcategoriesByCategory(category.id).sort((a, b) => a.name.localeCompare(b.name, 'hu'));
    const currentSubcategory = subcatSlug ? subcategories.find(s => s.slug === subcatSlug) : null;

    // Level 3 items for the selected subcategory
    const partItems = currentSubcategory ? getPartItemsBySubcategory(currentSubcategory.id).sort((a, b) => a.name.localeCompare(b.name, 'hu')) : [];
    const currentPartItem = partItemSlug ? partItems.find(p => p.slug === partItemSlug) : null;

    const [realProducts, setRealProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState<string>("");

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const yearInt = yearFilter ? parseInt(yearFilter) : undefined;
                const results = await getSearchProducts({
                    brand: brand.id,
                    model: model.id,
                    category: category.id,
                    subcategory: currentSubcategory?.id,
                    partItem: currentPartItem?.id,
                    year: yearInt && !isNaN(yearInt) ? yearInt : undefined,
                });
                setRealProducts(results.parts);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [brand.id, model.id, category.id, currentSubcategory?.id, currentPartItem?.id, yearFilter]);

    return (
        <main className="pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-6 font-medium tracking-wide overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                <Link href="/" className="hover:text-[var(--color-primary)] transition-colors shrink-0 p-2 -ml-2 rounded-lg hover:bg-foreground/5 active:scale-95">Autó kereső</Link>
                <span className="shrink-0 opacity-40">/</span>
                <Link href={`/brand/${brand.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase shrink-0 p-2 rounded-lg hover:bg-foreground/5 active:scale-95">{brand.name}</Link>
                <span className="shrink-0 opacity-40">/</span>
                <Link href={`/brand/${brand.slug}/${model.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase shrink-0 p-2 rounded-lg hover:bg-foreground/5 active:scale-95">{model.name}</Link>
                <span className="shrink-0 opacity-40">/</span>
                {currentSubcategory ? (
                    <>
                        <Link href={`/brand/${brand.slug}/${model.slug}/${category.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase shrink-0 p-2 rounded-lg hover:bg-foreground/5 active:scale-95">{category.name}</Link>
                        <span className="shrink-0 opacity-40">/</span>
                        <span className="text-gray-900 font-bold uppercase shrink-0 p-2">{currentSubcategory.name}</span>
                    </>
                ) : (
                    <span className="text-gray-900 font-bold uppercase shrink-0 p-2">{category.name}</span>
                )}
            </div>

            {/* Main Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <header>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-tight">
                        {brand.name} {model.name} {currentSubcategory ? currentSubcategory.name : category.name}
                    </h1>
                </header>

                {/* Year Filter Input */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <label htmlFor="year-filter" className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Évjárat szerinti szűrés
                    </label>
                    <div className="relative group">
                        <input
                            id="year-filter" type="number" placeholder="Pl. 2012" value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                        {yearFilter && (
                            <button
                                onClick={() => setYearFilter("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Progressive Filters (Replaced drill-down) */}
            <div className="mb-12 space-y-6">

                {/* Level 2: Subcategories (Main Parts) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Alkatrész csoportok
                    </h3>
                    <div className="flex flex-wrap gap-2 pb-2">
                        <Link
                            href={`/brand/${brand.slug}/${modelSlug}/${categorySlug}`}
                            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${!currentSubcategory ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'}`}
                        >
                            Összes
                        </Link>
                        {subcategories.map((subcat) => (
                            <Link
                                key={subcat.id}
                                href={`?subcat=${subcat.slug}`}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${currentSubcategory?.id === subcat.id ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'}`}
                            >
                                {subcat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Level 3: Specific Parts (Detailed Filters) */}
                {currentSubcategory && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-3">
                            {currentSubcategory.name} - Részletes szűrés
                        </h3>
                        {partItems.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pb-2">
                                <Link
                                    href={`?subcat=${currentSubcategory.slug}`}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${!currentPartItem ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'}`}
                                >
                                    Bármelyik
                                </Link>
                                {partItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`?subcat=${currentSubcategory.slug}&item=${item.slug}`}
                                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${currentPartItem?.id === item.id ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'}`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Ehhez a csoporthoz nincsenek további részletes alkatrészek definiálva.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full block">

                {/* Product Grid */}
                <div className="w-full">
                    <header className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                            {currentPartItem ? currentPartItem.name : (currentSubcategory ? currentSubcategory.name : category.name)} termékek
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Találatok: <span className="text-[var(--color-primary)] font-bold">{isLoading ? '...' : realProducts.length} db</span>
                        </p>
                    </header>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-[340px] bg-gray-100 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : realProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {realProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Filter className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Nincs találat ebben a kategóriában</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Jelenleg nincs feltöltve ilyen alkatrész ehhez a modellhez. Nézz vissza később, vagy keress más kategóriában!
                            </p>
                            <Link href={`/brand/${brand.slug}/${model.slug}`} className="inline-block mt-6 px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                                Vissza a kategóriákhoz
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main >
    );
}

export default function CategoryProductsPage({ params }: { params: Promise<{ brandSlug: string; modelSlug: string; categorySlug: string }> }) {
    const resolvedParams = use(params);

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <Navbar />
            <Suspense fallback={<div className="pt-32 px-8">Loading...</div>}>
                <CategoryProductsContent params={resolvedParams} />
            </Suspense>
        </div>
    );
}

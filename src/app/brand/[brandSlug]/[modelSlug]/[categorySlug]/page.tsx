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
import { ArrowLeft, ShoppingCart, Filter, ArrowRight, X, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { getSearchProducts } from "@/app/actions/product";

function CategoryProductsContent({ params }: { params: { brandSlug: string; modelSlug: string; categorySlug: string } }) {
    const { brandSlug, modelSlug, categorySlug } = params;
    const searchParams = useSearchParams();
    const subcatSlug = searchParams.get("subcat");
    const partItemSlug = searchParams.get("item");
    const [searchQuery, setSearchQuery] = useState("");


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

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const results = await getSearchProducts({
                    brand: brand.id,
                    model: model.id,
                    category: category.id,
                    subcategory: currentSubcategory?.id,
                    partItem: currentPartItem?.id,
                });
                setRealProducts(results);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [brand.id, model.id, category.id, currentSubcategory?.id, currentPartItem?.id]);

    return (
        <main className="pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">

            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6 font-medium tracking-wide">
                <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Autó kereső</Link>
                <span>/</span>
                <Link href={`/brand/${brand.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase">{brand.name}</Link>
                <span>/</span>
                <Link href={`/brand/${brand.slug}/${model.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase">{model.name}</Link>
                <span>/</span>
                {currentSubcategory ? (
                    <>
                        <Link href={`/brand/${brand.slug}/${model.slug}/${category.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase">{category.name}</Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-bold uppercase">{currentSubcategory.name}</span>
                    </>
                ) : (
                    <span className="text-gray-900 dark:text-white font-bold uppercase">{category.name}</span>
                )}
            </div>

            {/* Main Header */}
            <header className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                    {brand.name} {model.name} {currentSubcategory ? currentSubcategory.name : category.name}
                </h1>
                <p className="text-gray-500 mt-2 font-medium">
                    {brand.name} {model.name} típushoz válogatott prémium minőségű alkatrészek.
                </p>
            </header>

            {/* Selection Grid (Drill-down & Search) */}
            <div className="mb-16">

                {/* Search Input */}
                <div className="relative mb-8 max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Keresés "${category.name}" alkatrészeiben...`}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {searchQuery.trim() !== "" ? (
                    /* Search Results View */
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <span className="w-8 h-[1px] bg-gray-700"></span>
                            Keresési eredmények
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {allPartItems
                                .filter(pi =>
                                    subcategories.some(s => s.id === pi.subcategoryId) &&
                                    pi.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .sort((a, b) => a.name.localeCompare(b.name, 'hu'))
                                .map((item) => {
                                    const parentSubcat = subcategories.find(s => s.id === item.subcategoryId);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={`?subcat=${parentSubcat?.slug}&item=${item.slug}`}
                                            className="group flex flex-col p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--color-primary)]/50 hover:bg-white/10 transition-all duration-200"
                                        >
                                            <span className="text-xs text-[var(--color-primary)] font-bold uppercase mb-1">{parentSubcat?.name}</span>
                                            <span className="text-sm font-bold text-gray-200 uppercase tracking-tight group-hover:text-white">
                                                {item.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                ) : !currentSubcategory ? (
                    /* Level 2 Subcategories View (Clean Grid) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {subcategories.map((subcat) => (
                            <Link
                                key={subcat.id}
                                href={`?subcat=${subcat.slug}`}
                                className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all duration-200"
                            >
                                <span className="font-bold uppercase tracking-wide">{subcat.name}</span>
                                <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Level 3 Specific Parts View (Drill-down) */
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-gray-700"></span>
                                {currentSubcategory.name} - Specifikus alkatrészek
                            </h3>
                            <Link href={`/brand/${brand.slug}/${model.slug}/${category.slug}`} className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                                <ArrowLeft className="w-3 h-3" /> Vissza a kategóriákhoz
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {partItems.length > 0 ? partItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`?subcat=${subcatSlug}&item=${item.slug}`}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-xs font-bold uppercase tracking-tight
                                        ${currentPartItem?.id === item.id
                                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20'
                                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-[var(--color-primary)]/50 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <span className="truncate pr-2">{item.name}</span>
                                    {currentPartItem?.id === item.id && <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />}
                                </Link>
                            )) : (
                                <div className="col-span-full py-4 text-gray-500 font-medium italic">
                                    Ehhez a csoporthoz nincsenek további részletes alkatrészek definiálva.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full block">

                {/* Product Grid */}
                <div className="w-full">
                    <header className="mb-8 flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                            {currentPartItem ? currentPartItem.name : (currentSubcategory ? currentSubcategory.name : category.name)} termékek
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Találatok: <span className="text-[var(--color-primary)] font-bold">{isLoading ? '...' : realProducts.length} db</span>
                        </p>
                    </header>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-[340px] bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : realProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {realProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Filter className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nincs találat ebben a kategóriában</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
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

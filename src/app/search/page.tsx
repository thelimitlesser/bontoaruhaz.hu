"use client";

import { use, Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { getSearchProducts } from "@/app/actions/product";
import { Filter, Search, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { categories, subcategories, partItems } from "@/lib/parts-data";

function SearchResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const brand = searchParams.get("brand") || undefined;
    const model = searchParams.get("model") || undefined;
    const category = searchParams.get("cat") || undefined;
    const subcategory = searchParams.get("subcat") || undefined;
    const item = searchParams.get("item") || undefined;
    const aiPowered = searchParams.get("ai_powered") === "true";
    
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 20;

    const [products, setProducts] = useState<any[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [detectedMeta, setDetectedMeta] = useState<{
        detectedYear?: number;
        detectedBrand?: string;
        detectedModel?: string;
        suggestion?: string;
    }>({});

    useEffect(() => {
        let isStale = false;

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const results = await getSearchProducts({
                    query: query,
                    brand: brand,
                    model: model,
                    category: category,
                    subcategory: subcategory,
                    partItem: item,
                    take: pageSize,
                    skip: (page - 1) * pageSize
                });

                if (!isStale) {
                    setProducts(results.parts);
                    setTotalResults(results.total);
                    setDetectedMeta(results.meta);
                }
            } catch (error) {
                if (!isStale) {
                    console.error("Search error:", error);
                }
            } finally {
                if (!isStale) {
                    setIsLoading(false);
                }
            }
        };

        if (query || brand || model || category || subcategory || item) {
            fetchResults();
        } else {
            setIsLoading(false);
        }

        return () => {
            isStale = true;
        };
    }, [query, brand, model, category, subcategory, item, page]);

    return (
        <main className="pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                        <Search className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter">
                        Keresési eredmények
                    </h1>
                </div>

                {aiPowered && (
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full w-fit">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">AI Segítséggel optimalizálva</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1">Észlelt keresési feltételek:</span>

                            {(brand || detectedMeta.detectedBrand) && (
                                <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Márka</span>
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{brand || detectedMeta.detectedBrand}</span>
                                </div>
                            )}

                            {(model || detectedMeta.detectedModel) ? (
                                <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Modell</span>
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                        {products.find(p => p.modelId === model)?.modelName || model || detectedMeta.detectedModel}
                                    </span>
                                </div>
                            ) : (brand || detectedMeta.detectedBrand) && (
                                <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase">Modell</span>
                                    <span className="text-sm font-black text-blue-700 uppercase tracking-tight">Összes generáció</span>
                                </div>
                            )}

                            {/* Detected Year */}
                            {detectedMeta.detectedYear && (
                                <div className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg shadow-sm flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-orange-400 uppercase">Évjárat</span>
                                    <span className="text-sm font-black text-orange-700 uppercase tracking-tight">{detectedMeta.detectedYear}</span>
                                </div>
                            )}

                            {item ? (
                                <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Alkatrész</span>
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                        {products.find(p => p.partItemId === item)?.partItemName || item.replace(/-/g, ' ')}
                                    </span>
                                </div>
                            ) : subcategory ? (
                                <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Kategória</span>
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                        {products.find(p => p.subcategoryId === subcategory)?.subcategoryName || subcategory.replace(/-/g, ' ')}
                                    </span>
                                </div>
                            ) : category && (
                                <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Főcsoport</span>
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                        {products.find(p => p.categoryId === category)?.categoryName || category.replace(/-/g, ' ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <p className="text-gray-500 font-medium">
                    Találatok a <span className="text-gray-900 font-bold">&quot;{query}&quot;</span> kifejezésre.
                </p>

                {/* Generation / Model Switcher (Pills) */}
                {!isLoading && products.length > 0 && (
                    <div className="mt-6 flex flex-col gap-8">
                        {/* Models */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Modell generációk</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.delete("model");
                                        router.push(`/search?${params.toString()}`);
                                    }}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2",
                                        !model
                                            ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                                            : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                                    )}>
                                    Összes modell
                                </button>

                                {Array.from(new Set(products.map(p => p.modelId))).filter(Boolean).map(mId => {
                                    const modelData = products.find(p => p.modelId === mId)?.modelName || mId;
                                    const isSelected = model === mId;

                                    return (
                                        <button
                                            key={mId}
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams.toString());
                                                params.set("model", mId);
                                                router.push(`/search?${params.toString()}`);
                                            }}
                                            className={clsx(
                                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2",
                                                isSelected
                                                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                                                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                                            )}>
                                            {modelData}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Hierarchical Filters */}
                        <div className="flex flex-col gap-6">
                            {/* Level 1: Categories */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Főcsoportok</span>
                                    {(category || subcategory || item) && (
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams.toString());
                                                params.delete("cat");
                                                params.delete("subcat");
                                                params.delete("item");
                                                router.push(`/search?${params.toString()}`);
                                            }}
                                            className="text-[10px] font-bold text-[var(--color-primary)] uppercase hover:underline"
                                        >
                                            Összes kategória
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {/* Get categories that are present in the results OR use specific ones if already filtered */}
                                    {Array.from(new Set([
                                        ...products.map(p => p.categoryId),
                                        ...(category ? [category] : [])
                                    ])).filter(Boolean).map(cId => {
                                        const cat = categories.find(c => c.id === cId);
                                        const isSelected = category === cId;
                                        if (!cat) return null;

                                        return (
                                            <button
                                                key={cId}
                                                onClick={() => {
                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.set("cat", cId);
                                                    params.delete("subcat");
                                                    params.delete("item");
                                                    router.push(`/search?${params.toString()}`);
                                                }}
                                                className={clsx(
                                                    "px-5 py-2.5 rounded-2xl border text-xs font-black transition-all shadow-sm uppercase tracking-wider",
                                                    isSelected
                                                        ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                                                        : "bg-white/50 backdrop-blur-sm border-gray-100 text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-orange-50/50 hover:-translate-y-0.5"
                                                )}
                                            >
                                                {cat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Level 2: Subcategories */}
                            {category && (
                                <div className="flex flex-col gap-3 p-5 bg-gray-50/50 border border-gray-100 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alkatrész csoportok</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {subcategories
                                            .filter(sc => sc.categoryId === category)
                                            .filter(sc => products.some(p => p.subcategoryId === sc.id) || subcategory === sc.id)
                                            .map(sc => {
                                                const isSelected = subcategory === sc.id;
                                                return (
                                                    <button
                                                        key={sc.id}
                                                        onClick={() => {
                                                            const params = new URLSearchParams(searchParams.toString());
                                                            params.set("subcat", sc.id);
                                                            params.delete("item");
                                                            router.push(`/search?${params.toString()}`);
                                                        }}
                                                        className={clsx(
                                                            "px-5 py-2.5 rounded-2xl border text-xs font-black transition-all shadow-sm uppercase tracking-wider",
                                                            isSelected
                                                                ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                                                                : "bg-white border-gray-100 text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-orange-50/50"
                                                        )}
                                                    >
                                                        {sc.name}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* Level 3: Part Items */}
                            {subcategory && (
                                <div className="flex flex-col gap-3 p-5 bg-white border border-[var(--color-primary)]/10 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl shadow-[var(--color-primary)]/5">
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4 text-[var(--color-primary)]" />
                                        <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest text-opacity-70">Konkrét alkatrészek</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {partItems
                                            .filter(pi => pi.subcategoryId === subcategory)
                                            .filter(pi => products.some(p => p.partItemId === pi.id) || item === pi.id)
                                            .map(pi => {
                                                const isSelected = item === pi.id;
                                                return (
                                                    <button
                                                        key={pi.id}
                                                        onClick={() => {
                                                            const params = new URLSearchParams(searchParams.toString());
                                                            params.set("item", pi.id);
                                                            router.push(`/search?${params.toString()}`);
                                                        }}
                                                        className={clsx(
                                                            "px-5 py-2.5 rounded-2xl border text-xs font-black transition-all shadow-sm uppercase tracking-wider",
                                                            isSelected
                                                                ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                                                                : "bg-gray-50 border-transparent text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-white"
                                                        )}
                                                    >
                                                        {pi.name}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Did you mean? Suggestion */}
                {detectedMeta.suggestion && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Search className="w-4 h-4" />
                        </div>
                        <p className="text-sm text-blue-900">
                            Nincs találat erre: <span className="font-bold underline italic">"{query}"</span>.
                            Erre gondoltál: <Link href={`/search?query=${encodeURIComponent(detectedMeta.suggestion)}&ai_powered=true`} className="font-black text-blue-600 hover:underline cursor-pointer decoration-2 underline-offset-4 decoration-blue-200">
                                {detectedMeta.suggestion}
                            </Link>?
                        </p>
                    </div>
                )}
            </div>

            {/* Results Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-[340px] bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination UI */}
                    {totalResults > pageSize && (
                        <div className="flex flex-col items-center gap-4 pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                {page > 1 && (
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set("page", (page - 1).toString());
                                            router.push(`/search?${params.toString()}`);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        Előző
                                    </button>
                                )}
                                
                                <div className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-black shadow-lg">
                                    {page} / {Math.ceil(totalResults / pageSize)}
                                </div>

                                {page < Math.ceil(totalResults / pageSize) && (
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set("page", (page + 1).toString());
                                            router.push(`/search?${params.toString()}`);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        Következő
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                Összesen {totalResults} találat • 20 termék oldalanként
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-16 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-tight">Nincs közvetlen találat</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Sajnos nem találtunk pontos egyezést a raktárkészletünkben. Próbáld meg egyszerűbb kulcsszavakkal, vagy böngéssz márkák szerint!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all uppercase tracking-wider text-sm">
                            Vissza a főoldalra
                        </Link>
                        <Link href="/brand" className="px-8 py-4 bg-[var(--color-primary)] text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase tracking-wider text-sm shadow-lg shadow-[var(--color-primary)]/20">
                            Márkák böngészése
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <Navbar />
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
                </div>
            }>
                <SearchResultsContent />
            </Suspense>
        </div>
    );
}

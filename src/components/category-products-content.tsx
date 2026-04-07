"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getActiveSubcategoriesForModelAction, getActivePartItemsForModelAction } from "@/app/actions/vehicle";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getSearchProducts } from "@/app/actions/product";

export function CategoryProductsContent({ 
    params,
    brand,
    model,
    category,
    initialData
}: { 
    params: { brandSlug: string; modelSlug: string; categorySlug: string };
    brand: any;
    model: any;
    category: any;
    initialData: {
        subcategories: any[];
        activeItems: any[];
        initialProducts: any[];
        totalCount: number;
        page: number;
        perPage: number;
    };
}) {
    const { brandSlug, modelSlug, categorySlug } = params;
    const searchParams = useSearchParams();
    const router = useRouter();
    const subcatSlug = searchParams.get("subcat");
    const partItemSlug = searchParams.get("item");
    const urlPage = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const urlYear = searchParams.get("year") || "";
    const urlSort = searchParams.get("sortBy") || "newest";

    const [realProducts, setRealProducts] = useState<any[]>(initialData.initialProducts);
    const [totalCount, setTotalCount] = useState(initialData.totalCount);
    const [currentPage, setCurrentPage] = useState(initialData.page);
    const [isLoading, setIsLoading] = useState(false);
    
    // Local state for the input field to avoid lag, but sync to URL on change/blur
    const [localYear, setLocalYear] = useState(urlYear);
    
    // Active filters state
    const [activeSubcategories, setActiveSubcategories] = useState<any[]>(initialData.subcategories);
    const [activePartItems, setActivePartItems] = useState<any[]>(initialData.activeItems);

    const isFirstRender = useRef(true);
    const prevParamsKey = useRef(`${subcatSlug}-${partItemSlug}-${urlYear}-${urlPage}-${urlSort}`);

    // Update state if initialData changes (server-side navigation)
    useEffect(() => {
        if (initialData) {
            setActiveSubcategories(initialData.subcategories);
            setActivePartItems(initialData.activeItems);
            setRealProducts(initialData.initialProducts);
            setTotalCount(initialData.totalCount);
            setCurrentPage(initialData.page);
            setLocalYear(urlYear); // Sync local input with URL
        }
    }, [initialData, urlYear]);

    // Fetch active subcategories - Only if NOT the first render or if brand/model changes
    useEffect(() => {
        if (isFirstRender.current) return;
        
        const fetchSubcats = async () => {
            if (category?.id) {
                const subcats = await getActiveSubcategoriesForModelAction(brand.id, model.id, category.id);
                setActiveSubcategories(subcats || []);
            }
        };
        fetchSubcats();
    }, [brand.id, model.id, category?.id]);

    // Fetch active part items when subcategory changes - Only if NOT first render
    useEffect(() => {
        if (isFirstRender.current) return;

        const fetchItems = async () => {
            if (subcatSlug && activeSubcategories.length > 0) {
                const subcat = activeSubcategories.find(s => s.slug === subcatSlug);
                if (subcat) {
                    const items = await getActivePartItemsForModelAction(brand.id, model.id, subcat.id);
                    setActivePartItems(items || []);
                }
            } else {
                setActivePartItems([]);
            }
        };
        fetchItems();
    }, [brand.id, model.id, subcatSlug, activeSubcategories]);

    const currentSubcategory = subcatSlug ? activeSubcategories.find(s => s.slug === subcatSlug) : null;
    const currentPartItem = partItemSlug ? activePartItems.find(p => p.slug === partItemSlug) : null;

    useEffect(() => {
        const currentKey = `${subcatSlug}-${partItemSlug}-${urlYear}-${urlPage}-${urlSort}`;
        
        if (isFirstRender.current) {
            isFirstRender.current = false;
            prevParamsKey.current = currentKey;
            return;
        }

        // Avoid fetching if params didn't actually change
        if (currentKey === prevParamsKey.current) return;

        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const yearInt = urlYear ? parseInt(urlYear) : undefined;
                const results = await getSearchProducts({
                    brand: brand.id,
                    model: model.id,
                    category: category.id,
                    subcategory: currentSubcategory?.id,
                    partItem: currentPartItem?.id,
                    year: yearInt && !isNaN(yearInt) ? yearInt : undefined,
                    take: initialData.perPage,
                    skip: (urlPage - 1) * initialData.perPage,
                    sortBy: urlSort
                });
                setRealProducts(results.parts);
                setTotalCount(results.total);
                setCurrentPage(urlPage - 1);
                prevParamsKey.current = currentKey;
                
                // Scroll to top on page change
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timer);
    }, [brand.id, model.id, category.id, currentSubcategory?.id, currentPartItem?.id, urlYear, subcatSlug, partItemSlug, urlPage, initialData.perPage, urlSort]);

    const totalPages = Math.ceil(totalCount / initialData.perPage);

    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });
        // Always reset to page 1 on filter change, UNLESS explicitly setting page
        if (!updates.page) params.set("page", "1");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage: number) => {
        updateFilters({ page: newPage.toString() });
    };

    const handleYearChange = (val: string) => {
        setLocalYear(val);
        // Only trigger URL update if it's 4 digits or empty
        if (val === "" || (val.length === 4 && !isNaN(parseInt(val)))) {
            updateFilters({ year: val || null });
        }
    };

    return (
        <main className="pt-32 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-6 font-medium tracking-wide overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                <Link href="/" className="hover:text-[var(--color-primary)] transition-colors shrink-0 p-2 -ml-2 rounded-lg hover:bg-foreground/5 active:scale-95">Autó kereső</Link>
                <span className="shrink-0 text-gray-400">/</span>
                <Link href={`/brand/${brand.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase shrink-0 p-2 rounded-lg hover:bg-foreground/5 active:scale-95">{brand.name}</Link>
                <span className="shrink-0 text-gray-400">/</span>
                <Link href={`/brand/${brand.slug}/${model.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase shrink-0 p-2 rounded-lg hover:bg-foreground/5 active:scale-95">{model.name}</Link>
                <span className="shrink-0 text-gray-400">/</span>
                {currentSubcategory ? (
                    <>
                        <Link href={`/brand/${brand.slug}/${model.slug}/${category.slug}`} className="hover:text-[var(--color-primary)] transition-colors uppercase shrink-0 p-2 rounded-lg hover:bg-foreground/5 active:scale-95">{category.name}</Link>
                        <span className="shrink-0 text-gray-400">/</span>
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

                {/* Year and Sort Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-4 min-w-full sm:min-w-[450px]">
                    {/* Year Filter */}
                    <div className="flex flex-col gap-2 w-full sm:w-[180px]">
                        <label htmlFor="year-filter" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Évjárat
                        </label>
                        <div className="relative group">
                            <input
                                id="year-filter" type="number" placeholder="Pl. 2012" value={localYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                onBlur={() => updateFilters({ year: localYear || null })}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all" />
                            {localYear && (
                                <button
                                    onClick={() => { setLocalYear(""); updateFilters({ year: null }); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Évjárat szűrő törlése" >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex flex-col gap-2 w-full sm:w-[250px]">
                        <label htmlFor="sort-dropdown" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                            Rendezés
                        </label>
                        <select 
                            id="sort-dropdown"
                            value={urlSort}
                            onChange={(e) => updateFilters({ sortBy: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="newest">Legújabb elöl</option>
                            <option value="price_asc">Olcsóbb elöl</option>
                            <option value="price_desc">Drágább elöl</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Progressive Filters (Replaced drill-down) */}
            <div className="mb-12 space-y-6">

                {/* Level 2: Subcategories (Main Parts) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Alkatrész csoportok
                    </h3>
                    <div className="flex flex-wrap gap-2 pb-2">
                        <Link
                            href={`/brand/${brand.slug}/${model.slug}/${category.slug}`}
                            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 active:scale-95 ${!currentSubcategory ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'}`}
                        >
                            Összes
                        </Link>
                        {activeSubcategories.sort((a, b) => a.name.localeCompare(b.name, 'hu')).map((subcat) => (
                            <Link
                                key={subcat.id}
                                href={`?subcat=${subcat.slug}`}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 active:scale-95 ${currentSubcategory?.id === subcat.id ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'}`}
                            >
                                {subcat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Level 3: Specific Parts (Detailed Filters) */}
                <div className="min-h-[100px]">
                    {currentSubcategory ? (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-3">
                                {currentSubcategory.name} - Részletes szűrés
                            </h3>
                            {activePartItems.length > 0 ? (
                                <div className="flex flex-wrap gap-2 pb-2">
                                    <Link
                                        href={`?subcat=${currentSubcategory.slug}`}
                                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 active:scale-95 ${!currentPartItem ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'}`}
                                    >
                                        Bármelyik
                                    </Link>
                                    {activePartItems.sort((a, b) => a.name.localeCompare(b.name, 'hu')).map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`?subcat=${currentSubcategory.slug}&item=${item.slug}`}
                                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 active:scale-95 ${currentPartItem?.id === item.id ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'}`}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            ) : isLoading ? (
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-9 w-24 bg-gray-200 rounded-xl animate-pulse" />)}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Ehhez a csoporthoz nincsenek további részletes alkatrészek definiálva.</p>
                            )}
                        </div>
                    ) : (
                        <div className="h-[100px] border border-dashed border-gray-100 rounded-2xl flex items-center justify-center">
                             <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Válassz alkatrész csoportot a részletesebb szűréshez</p>
                        </div>
                    )}
                </div>
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
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-pulse">
                                    <div className="aspect-[4/3] bg-gray-100" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                                        <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                                        <div className="h-8 bg-gray-100 rounded-xl w-full mt-4" />
                                    </div>
                                </div>
                            ))}
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(urlPage - 1)}
                                disabled={urlPage === 1 || isLoading}
                                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                aria-label="Előző oldal"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - urlPage) <= 1)
                                    .map((p, index, array) => (
                                        <div key={p} className="flex items-center">
                                            {index > 0 && array[index - 1] !== p - 1 && (
                                                <span className="px-2 text-gray-400">...</span>
                                            )}
                                            <button
                                                onClick={() => handlePageChange(p)}
                                                className={`min-w-[40px] h-10 rounded-xl font-bold text-sm transition-all active:scale-95 ${urlPage === p ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}
                                            >
                                                {p}
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(urlPage + 1)}
                                disabled={urlPage === totalPages || isLoading}
                                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                aria-label="Következő oldal"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main >
    );
}

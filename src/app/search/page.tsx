"use client";

import { ProductCard } from "@/components/product-card";
import { mockProducts } from "@/lib/mock-data";
import { Filter, SlidersHorizontal, Search, X } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { brands, models, categories } from "@/lib/vehicle-data";
import { subcategories, partItems } from "@/lib/parts-data";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getSearchProducts } from "@/app/actions/product";

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minYear, setMinYear] = useState("");
    const [maxYear, setMaxYear] = useState("");
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
    const [selectedModel, setSelectedModel] = useState(searchParams.get("model") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("part") || "");
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subpart") || "");
    const [selectedPartItem, setSelectedPartItem] = useState(searchParams.get("item") || "");
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

    const [realProducts, setRealProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const brand = searchParams.get("brand");
        if (brand) setSelectedBrand(brand);
        const model = searchParams.get("model");
        if (model) setSelectedModel(model);
        const part = searchParams.get("part");
        if (part) setSelectedCategory(part);
        const subpart = searchParams.get("subpart");
        if (subpart) setSelectedSubcategory(subpart);
        const item = searchParams.get("item");
        if (item) setSelectedPartItem(item);
        const q = searchParams.get("q");
        if (q) setSearchQuery(q);
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const brandId = selectedBrand ? brands.find(b => b.slug === selectedBrand)?.id : undefined;
                const modelId = selectedModel ? models.find(m => m.slug === selectedModel)?.id : undefined;
                const categoryId = selectedCategory ? categories.find(c => c.slug === selectedCategory)?.id : undefined;
                const subcategoryId = selectedSubcategory ? subcategories.find(s => s.slug === selectedSubcategory)?.id : undefined;
                const partItemId = selectedPartItem ? partItems.find(p => p.slug === selectedPartItem)?.id : undefined;

                const results = await getSearchProducts({
                    brand: brandId,
                    model: modelId,
                    category: categoryId,
                    subcategory: subcategoryId,
                    partItem: partItemId,
                    minPrice: minPrice ? parseInt(minPrice) : undefined,
                    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
                    query: searchQuery || undefined,
                });
                setRealProducts(results);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchProducts, 400);
        return () => clearTimeout(timer);
    }, [selectedBrand, selectedModel, selectedCategory, selectedSubcategory, selectedPartItem, minPrice, maxPrice, searchQuery]);

    const handleClearFilters = () => {
        setMinPrice("");
        setMaxPrice("");
        setMinYear("");
        setMaxYear("");
        setSelectedBrand("");
        setSelectedModel("");
        setSelectedCategory("");
        setSelectedSubcategory("");
        setSelectedPartItem("");
        setSearchQuery("");
        router.push("/search");
    };

    const currentBrandId = brands.find(b => b.slug === selectedBrand)?.id;
    const availableModels = currentBrandId ? models.filter(m => m.brandId === currentBrandId) : [];
    const currentCategoryId = categories.find(c => c.slug === selectedCategory)?.id;
    const availableSubcategories = currentCategoryId ? subcategories.filter(s => s.categoryId === currentCategoryId) : [];

    // Level 3 - Specific Part Items
    const currentSubcategoryId = availableSubcategories.find(s => s.slug === selectedSubcategory)?.id;
    const availablePartItems = currentSubcategoryId ? partItems.filter(p => p.subcategoryId === currentSubcategoryId) : [];

    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

            {/* Sidebar Filters */}
            <aside className="w-full md:w-72 shrink-0">
                <div className="glass-panel p-6 rounded-2xl sticky top-24 mb-8 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                        <div className="flex items-center gap-2 text-[var(--color-primary)]">
                            <Filter className="w-5 h-5" />
                            <h2 className="font-bold text-xl">Szűrők</h2>
                        </div>
                        {(selectedBrand || selectedCategory || minPrice || maxPrice || selectedPartItem) && (
                            <button
                                onClick={handleClearFilters}
                                className="text-xs text-muted-foreground hover:text-[var(--color-primary)] flex items-center gap-1 transition-colors"
                            >
                                <X className="w-3 h-3" />
                                Törlés
                            </button>
                        )}
                    </div>

                    {/* Text Search */}
                    <div className="mb-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <input
                                type="text"
                                placeholder="Keresés név, cikkszám..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-foreground/5 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-inner text-foreground"
                            />
                        </div>
                    </div>

                    {/* Brand Filter */}
                    <div className="mb-6">
                        <SearchableSelect
                            label="Márka"
                            options={brands.map(b => ({ value: b.slug, label: b.name }))}
                            value={selectedBrand}
                            onChange={(val) => {
                                setSelectedBrand(val);
                                setSelectedModel(""); // Reset model when brand changes
                            }}
                            theme="light"
                            placeholder="Válassz márkát..."
                        />
                    </div>

                    {/* Model Filter */}
                    <div className="mb-6">
                        <SearchableSelect
                            label="Modell"
                            options={availableModels.map(m => ({ value: m.slug, label: m.name }))}
                            value={selectedModel}
                            onChange={(val) => setSelectedModel(val)}
                            theme="light"
                            disabled={!selectedBrand}
                            placeholder={selectedBrand ? "Válassz modellt..." : "Előbb válassz márkát"}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                        <SearchableSelect
                            label="Kategória"
                            options={categories.map(c => ({ value: c.slug, label: c.name }))}
                            value={selectedCategory}
                            onChange={(val) => {
                                setSelectedCategory(val);
                                setSelectedSubcategory(""); // Reset subcategories when category changes
                                setSelectedPartItem("");
                            }}
                            theme="light"
                            placeholder="Válassz kategóriát..."
                        />
                    </div>

                    {/* Subcategories (Sub-parts) Dropdown */}
                    {availableSubcategories.length > 0 && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <SearchableSelect
                                label="Alkatrész csoport"
                                options={availableSubcategories.map(s => ({ value: s.slug, label: s.name }))}
                                value={selectedSubcategory}
                                onChange={(val) => {
                                    setSelectedSubcategory(val);
                                    setSelectedPartItem(""); // Reset part items when subcategory changes
                                }}
                                theme="light"
                                placeholder="Válassz alkatrészt..."
                            />
                        </div>
                    )}

                    {/* Specific Part Item Filter (Level 3) */}
                    {availablePartItems.length > 0 && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <SearchableSelect
                                label="Specifikus alkatrész"
                                options={availablePartItems.map(p => ({ value: p.slug, label: p.name }))}
                                value={selectedPartItem}
                                onChange={(val) => setSelectedPartItem(val)}
                                theme="light"
                                placeholder="Válassz specifikus elemet..."
                            />
                        </div>
                    )}


                    {/* Price Filter */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                            Ár (HUF)
                        </h3>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[var(--color-primary)]"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span className="text-muted-foreground">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[var(--color-primary)]"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Year Filter */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                            Évjárat
                        </h3>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                placeholder="Mettől"
                                className="w-full bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[var(--color-primary)]"
                                value={minYear}
                                onChange={(e) => setMinYear(e.target.value)}
                            />
                            <span className="text-muted-foreground">-</span>
                            <input
                                type="number"
                                placeholder="Meddig"
                                className="w-full bg-foreground/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[var(--color-primary)]"
                                value={maxYear}
                                onChange={(e) => setMaxYear(e.target.value)}
                            />
                        </div>
                    </div>


                    <button className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[var(--color-primary)]/20">
                        <Search className="w-4 h-4" />
                        Szűrés alkalmazása
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-foreground/5 p-6 rounded-2xl border border-border">
                    <h1 className="text-2xl font-bold text-foreground">
                        Találatok: <span className="text-[var(--color-primary)]">{isLoading ? '...' : realProducts.length} db</span> <span className="text-muted-foreground font-medium text-lg ml-1">alkatrész</span>
                    </h1>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background hover:bg-[var(--color-primary)] hover:text-white transition-all text-sm font-semibold border border-border shadow-sm hover:shadow-md active:scale-95">
                        <SlidersHorizontal className="w-4 h-4" />
                        Rendezés
                    </button>
                </div>

                {/* Active Filter Chips */}
                {(selectedBrand || selectedModel || selectedCategory || selectedSubcategory || selectedPartItem) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {selectedBrand && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-background text-foreground text-[10px] font-bold rounded-full border border-border uppercase tracking-wider shadow-sm">
                                <span className="text-muted-foreground mr-1">Márka:</span>
                                {brands.find(b => b.slug === selectedBrand)?.name || selectedBrand}
                                <X className="w-3 h-3 cursor-pointer hover:text-[var(--color-primary)]" onClick={() => setSelectedBrand("")} />
                            </div>
                        )}
                        {selectedModel && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-background text-foreground text-[10px] font-bold rounded-full border border-border uppercase tracking-wider shadow-sm">
                                <span className="text-muted-foreground mr-1">Modell:</span>
                                {models.find(m => m.slug === selectedModel)?.name || selectedModel}
                                <X className="w-3 h-3 cursor-pointer hover:text-[var(--color-primary)]" onClick={() => setSelectedModel("")} />
                            </div>
                        )}
                        {selectedCategory && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold rounded-full border border-[var(--color-primary)]/20 uppercase tracking-wider shadow-sm">
                                <span className="opacity-70 mr-1">Kategória:</span>
                                {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => {
                                    setSelectedCategory("");
                                    setSelectedSubcategory("");
                                    setSelectedPartItem("");
                                }} />
                            </div>
                        )}
                        {selectedSubcategory && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-[10px] font-medium rounded-full border border-[var(--color-primary)]/10 uppercase tracking-wider shadow-sm">
                                <span className="opacity-70 mr-1">Csoport:</span>
                                {subcategories.find(s => s.slug === selectedSubcategory)?.name || selectedSubcategory}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => {
                                    setSelectedSubcategory("");
                                    setSelectedPartItem("");
                                }} />
                            </div>
                        )}
                        {selectedPartItem && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-black rounded-full border border-[var(--color-primary)] outline outline-1 outline-[var(--color-primary)]/20 uppercase tracking-wider shadow-md scale-105 ml-1">
                                <span className="opacity-90 mr-1">Alkatrész:</span>
                                {partItems.find(p => p.slug === selectedPartItem)?.name || selectedPartItem}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPartItem("")} />
                            </div>
                        )}
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-80 bg-foreground/5 rounded-2xl animate-pulse" />)
                    ) : (
                        realProducts.length > 0 ? (
                            realProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            mockProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        )
                    )}
                </div>

                {/* Empty State Mock */}
                {mockProducts.length === 0 && (
                    <div className="text-center py-20 bg-foreground/5 rounded-3xl border border-dashed border-border mt-10">
                        <div className="bg-foreground/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Nincs találat</h2>
                        <p className="text-muted-foreground">Próbáljon meg kevesebb szűrőt beállítani vagy más kulcsszóra keresni.</p>
                    </div>
                )}
            </main>

        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen p-8 pt-24 font-[family-name:var(--font-geist-sans)]">
            <Suspense fallback={
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 opacity-50 animate-pulse">
                    <div className="w-72 h-[600px] bg-foreground/5 rounded-2xl" />
                    <div className="flex-1 space-y-8">
                        <div className="h-20 bg-foreground/5 rounded-2xl" />
                        <div className="grid grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-foreground/5 rounded-2xl" />)}
                        </div>
                    </div>
                </div>
            }>
                <SearchContent />
            </Suspense>

            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[url('/grid.svg')] opacity-20 pointer-events-none dark:opacity-10"></div>
        </div>
    );
}

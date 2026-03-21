"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Loader2, FolderIcon, CarFront, Tag, Hash, Car, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getSearchSuggestions } from "@/app/actions/product";
import { brands, models, getModelsByBrand, partItems, categories, partsSubcategories } from "@/lib/vehicle-data";

type SearchTab = "manual" | "code" | "ai";

export function VehicleSelector() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SearchTab>("manual");

    // AI State
    const [aiQuery, setAiQuery] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Manual State
    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedPartItem, setSelectedPartItem] = useState<string>("");

    // Code State
    const [codeQuery, setCodeQuery] = useState("");

    // Typewriter effect state
    const placeholderTexts = ["Pl.: 5G1 941 005", "Pl.: Audi a3 turbó", "Pl.: 2015-ös fekete Golf heteshez bal első LED lámpa", "Pl.: OPR kód alapján keresek...", "Pl.: Generátor VW Passathoz"];
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const currentFullText = placeholderTexts[placeholderIndex];

        if (!isDeleting && currentText === currentFullText) {
            timer = setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && currentText === "") {
            setIsDeleting(false);
            setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
            timer = setTimeout(() => { }, 300);
        } else {
            const nextText = isDeleting
                ? currentFullText.substring(0, currentText.length - 1)
                : currentFullText.substring(0, currentText.length + 1);

            const typingSpeed = isDeleting ? 15 : Math.random() * 20 + 30;

            timer = setTimeout(() => {
                setCurrentText(nextText);
            }, typingSpeed);
        }

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, placeholderIndex]);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<{
        brands: any[],
        models: any[],
        categories: any[],
        products: any[]
    }>({ brands: [], models: [], categories: [], products: [] });
    const [isInstantSearching, setIsInstantSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Instant Search
    useEffect(() => {
        if (aiQuery.trim().length < 2) {
            setSuggestions({ brands: [], models: [], categories: [], products: [] });
            setShowDropdown(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsInstantSearching(true);
            try {
                const results = await getSearchSuggestions(aiQuery.trim());
                setSuggestions(results);
                const hasResults = results.brands.length > 0 ||
                    results.models.length > 0 ||
                    results.categories.length > 0 ||
                    results.products.length > 0;
                setShowDropdown(hasResults);
            } catch (error) {
                console.error("Instant search error:", error);
            } finally {
                setIsInstantSearching(false);
            }
        }, 200);

        return () => clearTimeout(delayDebounceFn);
    }, [aiQuery]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        inputRef.current?.blur();

        if (activeTab === "manual") {
            if (!selectedBrand) return;

            const brand = brands.find(b => b.id === selectedBrand);
            const model = models.find(m => m.id === selectedModel);
            const partItem = partItems.find(p => p.id === selectedPartItem);

            if (!brand) return;

            // Base URL: /brand/[brandSlug]
            let url = `/brand/${brand.slug}`;

            // If model is selected: /brand/[brandSlug]/[modelSlug]
            if (model) {
                url += `/${model.slug}`;

                // If part item is selected, we need to find its category slug for canonical routing
                if (partItem) {
                    const subcategory = partsSubcategories.find(s => s.id === partItem.subcategoryId);
                    const category = categories.find(c => c.id === subcategory?.categoryId);

                    if (category) {
                        // Canonical: /brand/[brandSlug]/[modelSlug]/[categorySlug]?subcat=[subcatSlug]&item=[partItemSlug]
                        url += `/${category.slug}`;
                        const params = new URLSearchParams();
                        if (subcategory) params.set("subcat", subcategory.slug);
                        params.set("item", partItem.slug);
                        url += `?${params.toString()}`;
                    }
                }
            }

            router.push(url);
            return;
        }

        if (activeTab === "code") {
            if (!codeQuery.trim()) return;
            router.push(`/search?query=${encodeURIComponent(codeQuery.trim())}`);
            return;
        }

        // AI Search Path
        if (!aiQuery.trim()) return;

        setIsThinking(true);
        setAiError(null);
        try {
            const res = await fetch("/api/ai-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: aiQuery })
            });

            if (!res.ok) throw new Error("API hiba");

            const filters = await res.json();
            const params = new URLSearchParams();
            if (filters.sku) params.set("query", filters.sku);
            if (filters.query && !filters.sku) params.set("query", filters.query);

            params.set("ai_powered", "true");
            if (aiQuery) params.set("query", aiQuery);

            if (filters.isBroad) {
                if (filters.brand) params.set("brand", filters.brand);
                if (filters.category) params.set("cat", filters.category);
                if (filters.subcategory) params.set("subcat", filters.subcategory);
                if (filters.item) params.set("item", filters.item);
                router.push(`/search?${params.toString()}`);
            } else if (filters.brand && filters.model && filters.category) {
                if (filters.subcategory) params.set("subcat", filters.subcategory);
                if (filters.item) params.set("item", filters.item);
                router.push(`/brand/${filters.brand}/${filters.model}/${filters.category}?${params.toString()}`);
            } else if (filters.brand && filters.model) {
                if (filters.subcategory) params.set("subcat", filters.subcategory);
                if (filters.item) params.set("item", filters.item);
                router.push(`/brand/${filters.brand}/${filters.model}?${params.toString()}`);
            } else if (filters.brand) {
                router.push(`/brand/${filters.brand}?${params.toString()}`);
            } else {
                router.push(`/search?${params.toString()}`);
            }

        } catch (error) {
            console.error(error);
            setAiError("Az AI pillanatnyilag túlterhelt. Kérjük, próbálja újra pár másodperc múlva, vagy használja a kézi keresőt!");
        } finally {
            setIsThinking(false);
        }
    };

    // Manual Search computed data
    const availableModels = selectedBrand ? getModelsByBrand(selectedBrand) : [];

    const partOptions = partItems.map(item => {
        const subcat = partsSubcategories.find(s => s.id === item.subcategoryId);
        const cat = categories.find(c => c.id === subcat?.categoryId);
        return {
            value: item.id,
            label: item.name,
            group: cat?.name || "Egyéb"
        };
    });

    return (
        <div className="w-full max-w-5xl mx-auto rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative bg-white/95 backdrop-blur-xl border border-white/20 transform transition-all duration-500 hover:shadow-[0_48px_80px_-24px_rgba(219,81,60,0.25)]">

            {/* Premium Header / Tab Switcher */}
            <div className="flex items-center justify-between p-1.5 bg-gray-100/50 rounded-t-[2.5rem] border-b border-gray-100">
                <div className="flex w-full flex-wrap sm:flex-nowrap p-1 gap-1">
                    <button
                        onClick={() => setActiveTab("manual")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-2 min-[350px]:px-4 text-[9px] min-[350px]:text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-2xl sm:rounded-[1.75rem] whitespace-nowrap focus:outline-none focus-visible:ring-0",
                            activeTab === "manual" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Márka / Modell
                    </button>
                    <button
                        onClick={() => setActiveTab("code")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-2 min-[350px]:px-4 text-[9px] min-[350px]:text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-2xl sm:rounded-[1.75rem] whitespace-nowrap focus:outline-none focus-visible:ring-0",
                            activeTab === "code" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Cikkszám
                    </button>
                    <button
                        onClick={() => setActiveTab("ai")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-2 min-[350px]:px-4 text-[9px] min-[350px]:text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-2xl sm:rounded-[1.75rem] whitespace-nowrap focus:outline-none focus-visible:ring-0",
                            activeTab === "ai" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Okos kereső
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-10">
                {activeTab === "manual" && (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_auto] bg-white border-2 border-gray-100 rounded-[2rem] relative transition-all shadow-sm divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="min-h-[64px] flex items-center w-full min-w-0 rounded-t-[2rem] md:rounded-t-none md:rounded-l-[2rem]">
                                <SearchableSelect
                                    theme="light"
                                    variant="minimal"
                                    placeholder="Márka"
                                    options={brands.filter(b => !b.hidden).map(b => ({ value: b.id, label: b.name }))}
                                    value={selectedBrand}
                                    onChange={(val) => {
                                        setSelectedBrand(val);
                                        setSelectedModel("");
                                    }}
                                />
                            </div>

                            <div className="min-h-[64px] flex items-center w-full min-w-0">
                                <SearchableSelect
                                    theme="light"
                                    variant="minimal"
                                    placeholder="Modell"
                                    disabled={!selectedBrand}
                                    options={availableModels.map(m => ({ 
                                        value: m.id, 
                                        label: m.name,
                                        group: m.series || 'Egyéb'
                                    }))}
                                    value={selectedModel}
                                    onChange={setSelectedModel}
                                />
                            </div>

                            <div className="min-h-[64px] flex items-center w-full min-w-0">
                                <SearchableSelect
                                    theme="light"
                                    variant="minimal"
                                    placeholder="Alkatrészek Neve"
                                    options={partOptions}
                                    value={selectedPartItem}
                                    onChange={setSelectedPartItem}
                                />
                            </div>

                            <div className="p-2 flex items-center justify-center bg-gray-50/30 md:bg-transparent">
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={!selectedBrand || !selectedModel || !selectedPartItem}
                                    className={clsx(
                                        "h-14 md:h-12 w-full md:w-auto md:px-10 rounded-3xl flex items-center justify-center transition-all duration-300 gap-3 font-black text-white shrink-0 focus:outline-none focus-visible:ring-0",
                                        (selectedBrand && selectedModel && selectedPartItem)
                                            ? "bg-[var(--color-primary)] hover:bg-orange-600 shadow-md hover:scale-[1.01] active:scale-95"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    <Search className="w-5 h-5 stroke-[2.5]" />
                                    <span className="uppercase tracking-widest text-[12px]">Keresés</span>
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                            Válaszd ki autód adatait a legpontosabb találatokhoz
                        </p>
                    </div>
                )}

                {activeTab === "code" && (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] bg-white border-2 border-gray-100 rounded-[2rem] relative transition-all shadow-sm divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="min-h-[64px] flex items-center w-full min-w-0 relative group">
                                <div className="absolute left-6 z-10 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                                    <Hash className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={codeQuery}
                                    onChange={(e) => setCodeQuery(e.target.value)}
                                    placeholder="Cikkszám vagy hivatkozási szám (Pl.: 5G1 941 005)"
                                    className="w-full h-[64px] bg-transparent border-none pl-14 pr-8 py-4 text-base sm:text-lg focus:outline-none placeholder:text-gray-300 font-bold"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <div className="p-2 flex items-center justify-center bg-gray-50/30 md:bg-transparent">
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={!codeQuery.trim()}
                                    className={clsx(
                                        "h-14 md:h-12 w-full md:w-auto md:px-10 rounded-3xl flex items-center justify-center transition-all duration-300 gap-3 font-black text-white shrink-0 focus:outline-none focus-visible:ring-0",
                                        codeQuery.trim()
                                            ? "bg-[var(--color-primary)] hover:bg-orange-600 shadow-md hover:scale-[1.01] active:scale-95"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    <Search className="w-5 h-5 stroke-[2.5]" />
                                    <span className="uppercase tracking-widest text-[12px]">Keresés</span>
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                            Keress gyári cikkszám (OEM) vagy saját hivatkozási számunk alapján
                        </p>
                    </div>
                )}

                {activeTab === "ai" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <form onSubmit={handleSearch} className="flex flex-col gap-0">
                            <div className="w-full relative group">
                                <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-widest">
                                    Írd le mit keresel, az AI érti:
                                </label>

                                <div className="relative flex items-center">
                                    <div className="absolute left-4 z-30 text-[var(--color-primary)]/80 animate-pulse pointer-events-none">
                                        <Sparkles className="w-5 h-5" />
                                    </div>

                                    {!aiQuery && (
                                        <div className="absolute left-12 right-12 z-30 text-gray-400 text-base sm:text-lg pointer-events-none transition-opacity duration-300 flex items-center h-full pt-[1px]">
                                            <span className="truncate">{currentText}</span>
                                            <span className="animate-pulse ml-[1px] font-light text-gray-400">|</span>
                                        </div>
                                    )}

                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className={clsx(
                                            "w-full bg-gray-50 border-2 border-gray-100 pl-12 pr-16 py-4 text-base sm:text-xl text-gray-900 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm h-[64px] relative z-20",
                                            showDropdown ? "rounded-t-[2rem] rounded-b-none border-b-0" : "rounded-[2rem]"
                                        )}
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        onFocus={() => {
                                            const hasResults = suggestions.brands.length > 0 ||
                                                suggestions.models.length > 0 ||
                                                suggestions.categories.length > 0 ||
                                                suggestions.products.length > 0;
                                            if (hasResults) setShowDropdown(true);
                                        }}
                                        disabled={isThinking}
                                        autoComplete="off"
                                    />

                                    <button
                                        type="submit"
                                        disabled={isThinking || !aiQuery.trim()}
                                        className={clsx(
                                            "absolute right-2 top-2 bottom-2 z-30 aspect-square rounded-[1.5rem] flex items-center justify-center transition-all",
                                            aiQuery.trim() && !isThinking ? "bg-[var(--color-primary)] text-white shadow-md hover:scale-105" : "bg-white text-gray-300"
                                        )}
                                    >
                                        {isThinking ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <Search className="w-6 h-6" />
                                        )}
                                    </button>

                                    {showDropdown && (
                                        <div
                                            ref={dropdownRef}
                                            className="absolute top-full left-0 w-full mt-0 z-[100] bg-white rounded-b-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-t-[1px] border-[var(--color-primary)]/30 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] sm:max-h-[400px] overflow-y-auto overflow-x-hidden box-border"
                                        >
                                            {isInstantSearching ? (
                                                <div className="p-8 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                                                    <span className="text-sm font-medium tracking-tight uppercase">Keresés...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col pb-2">
                                                    {suggestions.categories.length > 0 && (
                                                        <div className="flex flex-col border-b border-gray-100 last:border-0">
                                                            <div className="px-4 py-2 bg-gray-50/50">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Kategóriák</span>
                                                            </div>
                                                            {suggestions.categories.map((cat: any) => (
                                                                <Link
                                                                    key={cat.id}
                                                                    href={cat.type === 'category' ? `/search?cat=${cat.id}` : `/search?subcat=${cat.id}`}
                                                                    onClick={() => setShowDropdown(false)}
                                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/50 transition-all group"
                                                                >
                                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                                                                        <FolderIcon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[13px] font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{cat.name}</span>
                                                                        <span className="text-[10px] text-gray-400">Lépj a kategóriához</span>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {(suggestions.brands.length > 0 || suggestions.models.length > 0) && (
                                                        <div className="flex flex-col border-b border-gray-100 last:border-0">
                                                            <div className="px-4 py-2 bg-gray-50/50">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Járművek</span>
                                                            </div>
                                                            {suggestions.brands.map((brand: any) => (
                                                                <Link
                                                                    key={brand.id}
                                                                    href={`/brand/${brand.id}`}
                                                                    onClick={() => setShowDropdown(false)}
                                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/50 transition-all group"
                                                                >
                                                                    <Tag className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-primary)]" />
                                                                    <span className="text-[13px] font-bold text-gray-900 group-hover:text-[var(--color-primary)]">{brand.name}</span>
                                                                </Link>
                                                            ))}
                                                            {suggestions.models.map((model: any) => (
                                                                <Link
                                                                    key={model.id}
                                                                    href={`/brand/${model.brandId}/${model.id}`}
                                                                    onClick={() => setShowDropdown(false)}
                                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/50 transition-all group"
                                                                >
                                                                    <CarFront className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-primary)]" />
                                                                    <span className="text-[13px] font-bold text-gray-900 group-hover:text-[var(--color-primary)]">{model.brandName} {model.name}</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {suggestions.products.length > 0 && (
                                                        <div className="flex flex-col">
                                                            <div className="px-4 py-2 bg-gray-50/50">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Termékek</span>
                                                            </div>
                                                            {suggestions.products.map((product: any) => (
                                                                <Link
                                                                    key={product.id}
                                                                    href={`/product/${product.id}`}
                                                                    onClick={() => setShowDropdown(false)}
                                                                    className="flex items-center gap-4 p-4 hover:bg-orange-50/50 transition-all group border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div className="w-10 h-10 bg-white rounded border border-gray-100 overflow-hidden shrink-0">
                                                                        <img src={product.images ? product.images.split(',')[0] : 'https://placehold.co/100x100?text=NX'} alt="" className="w-full h-full object-contain" />
                                                                    </div>
                                                                    <div className="flex-grow min-w-0">
                                                                        <div className="text-[12px] font-bold text-gray-900 truncate group-hover:text-[var(--color-primary)]">{product.name}</div>
                                                                        <div className="text-[11px] font-bold text-[var(--color-primary)]">{product.priceGross.toLocaleString()} Ft</div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 min-h-[1.5rem] flex items-center justify-center animate-fade-in px-2">
                                    {aiError ? (
                                        <p className="text-xs text-red-500 font-medium text-center">{aiError}</p>
                                    ) : (
                                        <p className="text-[10px] sm:text-xs text-center text-gray-400 leading-relaxed uppercase tracking-widest font-bold">
                                            {isThinking ? "Elemzés folyamatban..." : "Próbáld ki: 2015-ös Audi A6 LED lámpa"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

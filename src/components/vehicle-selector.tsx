"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Search, CarFront, Hash, Car, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getDirectMatchAction, getPartSuggestionsAction } from "@/app/actions/product";
import { getModelsByBrandAction, getActivePartOptionsAction } from "@/app/actions/vehicle";

type SearchTab = "manual" | "code";

interface VehicleSelectorProps {
    initialBrands: any[];
    initialModelsMap: Record<string, any[]>;
    initialPartOptions: any[];
}

export function VehicleSelector({ initialBrands, initialModelsMap, initialPartOptions }: VehicleSelectorProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SearchTab>("manual");
    const [isPending, startTransition] = useTransition();
    const containerRef = useRef<HTMLDivElement>(null);
    const codeSearchRef = useRef<HTMLDivElement>(null);

    // Scroll back to top of search section on mobile after selection
    const scrollToSearchTop = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            const searchElement = document.getElementById('kereso');
            if (searchElement) {
                searchElement.scrollIntoView({ behavior: "smooth", block: "start" });
            } else if (containerRef.current) {
                containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    // Manual State
    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedPartItem, setSelectedPartItem] = useState<string>("");
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [modelsCache, setModelsCache] = useState<Record<string, any[]>>(initialModelsMap || {});
    
    // Part Options State
    const [currentPartOptions, setCurrentPartOptions] = useState<any[]>(initialPartOptions);
    const [isLoadingParts, setIsLoadingParts] = useState(false);

    // Code State
    const [codeQuery, setCodeQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

    // Suggestion Debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (codeQuery.trim().length >= 2) {
                setIsSearchingSuggestions(true);
                const results = await getPartSuggestionsAction(codeQuery.trim());
                setSuggestions(results || []);
                setShowSuggestions(true);
                setIsSearchingSuggestions(false);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [codeQuery]);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (codeSearchRef.current && !codeSearchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch models of selected brand
    useEffect(() => {
        let active = true;
        if (!selectedBrand) {
            setAvailableModels([]);
            return;
        }

        if (modelsCache[selectedBrand]) {
            setAvailableModels(modelsCache[selectedBrand]);
            return;
        }

        const fetchModels = async () => {
            setIsLoadingModels(true);
            try {
                const models = await getModelsByBrandAction(selectedBrand);
                if (active) {
                    setAvailableModels(models || []);
                    if (models) {
                        setModelsCache(prev => ({ ...prev, [selectedBrand]: models }));
                    }
                }
            } catch (error) {
                if (active) {
                    console.error("Error fetching models:", error);
                    setAvailableModels([]);
                }
            } finally {
                if (active) {
                    setIsLoadingModels(false);
                }
            }
        };

        fetchModels();
        return () => { active = false; };
    }, [selectedBrand]); 
    
    // Part Options Cache
    const [partsCache, setPartsCache] = useState<Record<string, any[]>>({
        "all": initialPartOptions 
    });

    // Fetch active part options when brand or model changes
    useEffect(() => {
        const cacheKey = `${selectedBrand}-${selectedModel}`;
        if (partsCache[cacheKey]) {
            setCurrentPartOptions(partsCache[cacheKey]);
            return;
        }

        const fetchParts = async () => {
            setIsLoadingParts(true);
            try {
                const parts = await getActivePartOptionsAction(selectedBrand, selectedModel);
                const results = parts || [];
                setCurrentPartOptions(results);
                setPartsCache(prev => ({ ...prev, [cacheKey]: results }));
            } catch (error) {
                console.error("Error fetching active parts:", error);
            } finally {
                setIsLoadingParts(false);
            }
        };

        fetchParts();
    }, [selectedBrand, selectedModel]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setShowSuggestions(false);

        startTransition(async () => {
            try {
                if (activeTab === "manual") {
                    if (!selectedBrand) return;

                    const brand = initialBrands.find(b => b.id === selectedBrand);
                    const model = availableModels.find(m => m.id === selectedModel);
                    const partItem = currentPartOptions.find(p => p.value === selectedPartItem);

                    if (!brand) return;

                    let url = `/brand/${brand.slug}`;
                    if (model) {
                        url += `/${model.slug}`;
                        if (partItem && partItem.categorySlug) {
                            url += `/${partItem.categorySlug}`;
                            if (partItem.subcatSlug) {
                                url += `/${partItem.subcatSlug}`;
                                if (partItem.slug) {
                                    url += `/${partItem.slug}`;
                                }
                            }
                        }
                    }
                    router.push(url);
                    return;
                }

                if (activeTab === "code") {
                    if (!codeQuery.trim()) return;
                    
                    const directId = await getDirectMatchAction(codeQuery.trim());
                    if (directId) {
                        router.push(`/product/${directId}`);
                        return;
                    }

                    router.push(`/search?query=${encodeURIComponent(codeQuery.trim())}`);
                    return;
                }
            } catch (err) {
                console.error("Search failed:", err);
            }
        });
    };

    return (
        <div 
            ref={containerRef}
            className="w-full max-w-5xl mx-auto rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative bg-white/95 backdrop-blur-xl border border-white/20 transform transition-all duration-500 hover:shadow-[0_48px_80px_-24px_rgba(219,81,60,0.25)]"
        >

            {/* Tab Switcher */}
            <div className="flex items-center justify-between p-1.5 bg-gray-100/50 rounded-t-[2.5rem] border-b border-gray-100">
                <div className="flex w-full p-1 gap-1">
                    <button
                        onClick={() => setActiveTab("manual")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-[1.75rem] whitespace-nowrap focus:outline-none focus-visible:ring-0 active:scale-95",
                            activeTab === "manual" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Car className="w-4 h-4" />
                        Márka / Modell
                    </button>
                    <button
                        onClick={() => setActiveTab("code")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-[1.75rem] whitespace-nowrap focus:outline-none focus-visible:ring-0 active:scale-95",
                            activeTab === "code" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Hash className="w-4 h-4" />
                        Cikkszám
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-10">
                {activeTab === "manual" && (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_auto] bg-white border-2 border-gray-100 rounded-[2rem] relative transition-all shadow-sm divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="min-h-[64px] flex items-center w-full min-w-0">
                                <SearchableSelect
                                    theme="light"
                                    variant="minimal"
                                    placeholder="Márka"
                                    options={initialBrands.map(b => ({ value: b.id, label: b.name }))}
                                    value={selectedBrand}
                                    onChange={(val) => {
                                        setSelectedBrand(val);
                                        setSelectedModel("");
                                        if (val) scrollToSearchTop();
                                    }}
                                    hideAllOption={true}
                                />
                            </div>

                            <div className="min-h-[64px] flex items-center w-full min-w-0">
                                <SearchableSelect
                                    theme="light"
                                    variant="minimal"
                                    placeholder={isLoadingModels ? "Töltés..." : "Modell"}
                                    disabled={!selectedBrand || isLoadingModels}
                                    options={availableModels.map(m => ({ 
                                        value: m.id, 
                                        label: m.name,
                                        group: m.series || 'Egyéb'
                                    }))}
                                    value={selectedModel}
                                    onChange={(val) => {
                                        setSelectedModel(val);
                                        if (val) scrollToSearchTop();
                                    }}
                                    hideAllOption={true}
                                />
                            </div>

                            <div className="min-h-[64px] flex items-center w-full min-w-0">
                                <SearchableSelect
                                    theme="light"
                                    variant="minimal"
                                    placeholder={isLoadingParts ? "Töltés..." : "Alkatrészek Neve"}
                                    options={currentPartOptions}
                                    value={selectedPartItem}
                                    onChange={(val) => {
                                        setSelectedPartItem(val);
                                        if (val) scrollToSearchTop();
                                    }}
                                    hideAllOption={true}
                                    disabled={isLoadingParts}
                                />
                            </div>

                            <div className="p-2 flex items-center justify-center bg-gray-50/30 md:bg-transparent">
                                <button
                                    data-testid="search-button"
                                    onClick={() => handleSearch()}
                                    disabled={!selectedBrand || !selectedModel || !selectedPartItem || isPending}
                                    className={clsx(
                                        "h-14 md:h-12 w-full md:w-auto md:px-10 rounded-3xl flex items-center justify-center transition-all duration-300 gap-3 font-black text-white shrink-0 focus:outline-none focus-visible:ring-0",
                                        (selectedBrand && selectedModel && selectedPartItem)
                                            ? "bg-[var(--color-primary)] hover:bg-orange-600 shadow-md hover:scale-[1.01] active:scale-95"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed",
                                        isPending && "opacity-80 cursor-wait"
                                    )}
                                >
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 stroke-[2.5]" />}
                                    <span className="uppercase tracking-widest text-[12px]">{isPending ? "Keresés..." : "Keresés"}</span>
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
                        <div 
                            ref={codeSearchRef}
                            className="flex flex-col md:grid md:grid-cols-[1fr_auto] bg-white border-2 border-gray-100 rounded-[2rem] relative transition-all shadow-sm divide-y md:divide-y-0 md:divide-x divide-gray-100"
                        >
                            <div className="min-h-[64px] flex items-center w-full min-w-0 relative">
                                <div className="absolute left-6 z-10 text-gray-400 peer-focus:text-[var(--color-primary)] transition-colors">
                                    {isSearchingSuggestions ? <Loader2 className="w-5 h-5 animate-spin" /> : <Hash className="w-5 h-5" />}
                                </div>
                                <input
                                    type="text"
                                    value={codeQuery}
                                    onChange={(e) => setCodeQuery(e.target.value)}
                                    placeholder="Cikkszám (OEM) vagy hivatkozási szám"
                                    className="peer w-full h-[64px] bg-transparent border-none pl-14 pr-8 py-4 text-sm sm:text-lg focus:outline-none placeholder:text-gray-300 placeholder:text-xs placeholder:sm:text-lg font-bold"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    onFocus={() => codeQuery.length >= 2 && setShowSuggestions(true)}
                                />

                                {/* Suggestions Dropdown */}
                                {showSuggestions && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                        {suggestions.length > 0 ? (
                                            <div className="max-h-[400px] overflow-y-auto py-2">
                                                {suggestions.map((part) => (
                                                    <Link
                                                        key={part.id}
                                                        href={`/product/${part.id}`}
                                                        className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                                                        onClick={() => setShowSuggestions(false)}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm sm:text-base font-bold text-gray-900 leading-tight group-hover:text-[var(--color-primary)] transition-colors break-words">
                                                                {part.name}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                                                {part.productCode && (
                                                                    <div className="flex items-center gap-1.5 bg-gray-200 px-2 py-0.5 rounded-md">
                                                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Ref</span>
                                                                        <span className="text-xs font-bold text-gray-950">{part.productCode}</span>
                                                                    </div>
                                                                )}
                                                                {part.sku && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">OEM</span>
                                                                        <span className="text-xs font-bold text-gray-900">{part.sku}</span>
                                                                    </div>
                                                                )}
                                                                <div className="ml-auto bg-[var(--color-primary)] text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-sm group-hover:bg-orange-600 transition-colors shrink-0">
                                                                    {part.priceGross.toLocaleString('hu-HU')} Ft
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Search className="w-4 h-4 text-gray-300 mt-1 group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Search className="w-5 h-5 text-gray-300" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-900">Nincs találat</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">
                                                    Ellenőrizd a beírt számot
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-2 flex items-center justify-center bg-gray-50/30 md:bg-transparent">
                                <button
                                    data-testid="search-button"
                                    onClick={() => handleSearch()}
                                    disabled={!codeQuery.trim() || isPending}
                                    className={clsx(
                                        "h-14 md:h-12 w-full md:w-auto md:px-10 rounded-3xl flex items-center justify-center transition-all duration-300 gap-3 font-black text-white shrink-0 focus:outline-none focus-visible:ring-0",
                                        codeQuery.trim()
                                            ? "bg-[var(--color-primary)] hover:bg-orange-600 shadow-md hover:scale-[1.01] active:scale-95"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed",
                                        isPending && "opacity-80 cursor-wait"
                                    )}
                                >
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 stroke-[2.5]" />}
                                    <span className="uppercase tracking-widest text-[12px]">{isPending ? "Keresés..." : "Keresés"}</span>
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                            Keress gyári cikkszám (OEM) vagy saját hivatkozási számunk alapján
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

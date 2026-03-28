"use client";

import { useState, useEffect } from "react";
import { Search, CarFront, Hash, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getDirectMatchAction } from "@/app/actions/product";
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
    }, [selectedBrand]); // Removed modelsCache from deps to avoid infinite loops and redundant triggers
    
    // Part Options Cache
    const [partsCache, setPartsCache] = useState<Record<string, any[]>>({
        "all": initialPartOptions // Cache for the empty brand/model case
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
    }, [selectedBrand, selectedModel]); // Removed partsCache from deps

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (activeTab === "manual") {
            if (!selectedBrand) return;

            const brand = initialBrands.find(b => b.id === selectedBrand);
            const model = availableModels.find(m => m.id === selectedModel);
            const partItem = currentPartOptions.find(p => p.value === selectedPartItem);

            if (!brand) return;

            let url = `/brand/${brand.slug}`;
            if (model) {
                url += `/${model.slug}`;
                if (partItem && partItem.categorySlug && partItem.subcatSlug) {
                    url += `/${partItem.categorySlug}`;
                    const params = new URLSearchParams();
                    params.set("subcat", partItem.subcatSlug);
                    params.set("item", partItem.slug);
                    url += `?${params.toString()}`;
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
    };

    return (
        <div className="w-full max-w-5xl mx-auto rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative bg-white/95 backdrop-blur-xl border border-white/20 transform transition-all duration-500 hover:shadow-[0_48px_80px_-24px_rgba(219,81,60,0.25)]">

            {/* Tab Switcher */}
            <div className="flex items-center justify-between p-1.5 bg-gray-100/50 rounded-t-[2.5rem] border-b border-gray-100">
                <div className="flex w-full p-1 gap-1">
                    <button
                        onClick={() => setActiveTab("manual")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-[1.75rem] whitespace-nowrap focus:outline-none focus-visible:ring-0",
                            activeTab === "manual" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Car className="w-4 h-4" />
                        Márka / Modell
                    </button>
                    <button
                        onClick={() => setActiveTab("code")}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-[1.75rem] whitespace-nowrap focus:outline-none focus-visible:ring-0",
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
                                    onChange={setSelectedModel}
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
                                    onChange={setSelectedPartItem}
                                    hideAllOption={true}
                                    disabled={isLoadingParts}
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
            </div>
        </div>
    );
}

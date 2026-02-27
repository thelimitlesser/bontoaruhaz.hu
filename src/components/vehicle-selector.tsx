"use client";

import { useState } from "react";
import { Search, Car, Disc, Hash, Sparkles } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { SearchableSelect } from "@/components/ui/searchable-select";

type SearchMode = "car" | "tire" | "sku" | "ai";

import { brands, models, getModelsByBrand, getAllUniqueSubcategoriesForSearch } from "@/lib/vehicle-data";

export function VehicleSelector() {
    const [activeTab, setActiveTab] = useState<SearchMode>("car");

    // Car State
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [part, setPart] = useState("");

    // Tire State (Mock)
    const [width, setWidth] = useState("");
    const [diameter, setDiameter] = useState("");

    // SKU State
    const [sku, setSku] = useState("");

    // AI State
    const [aiQuery, setAiQuery] = useState("");

    // Dynamic Options
    const brandOptions = brands.map(b => ({ value: b.id, label: b.name }));

    const selectedBrandModels = brand ? getModelsByBrand(brand) : [];
    const modelOptions = selectedBrandModels.map(m => ({
        value: m.id,
        label: m.years ? `${m.name} (${m.years})` : m.name
    }));

    // Generate dynamic part options from all detailed subcategories
    const partOptions = getAllUniqueSubcategoriesForSearch();

    const widthOptions = [
        { value: "175", label: "175" }, { value: "185", label: "185" }, { value: "195", label: "195" },
        { value: "205", label: "205" }, { value: "215", label: "215" }, { value: "225", label: "225" },
        { value: "235", label: "235" }, { value: "245", label: "245" }, { value: "255", label: "255" }
    ];

    const diameterOptions = [
        { value: "r14", label: "R14" }, { value: "r15", label: "R15" }, { value: "r16", label: "R16" },
        { value: "r17", label: "R17" }, { value: "r18", label: "R18" }, { value: "r19", label: "R19" },
        { value: "r20", label: "R20" }, { value: "r21", label: "R21" }
    ];

    const tabs = [
        { id: "car", label: "Márka / Modell", icon: Car },
        { id: "tire", label: "Felni / Gumi", icon: Disc },
        { id: "sku", label: "Cikkszám", icon: Hash },
        { id: "ai", label: "AI Segéd", icon: Sparkles },
    ];

    const getSearchUrl = () => {
        const params = new URLSearchParams();
        if (activeTab === "car") {
            if (brand) params.set("brand", brand);
            if (model) params.set("model", model);
            if (part) params.set("part", part);
        } else if (activeTab === "tire") {
            if (width) params.set("width", width);
            if (diameter) params.set("diameter", diameter);
        } else if (activeTab === "sku") {
            if (sku) params.set("sku", sku);
        } else if (activeTab === "ai") {
            if (aiQuery) params.set("ai", aiQuery);
        }
        return `/search?${params.toString()}`;
    };

    return (
        <div className="rounded-2xl shadow-2xl relative bg-white border border-gray-200">

            {/* Search Mode Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-100 overflow-x-auto rounded-t-2xl">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as SearchMode)}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-bold transition-all whitespace-nowrap",
                            index === 0 && "rounded-tl-2xl",
                            index === tabs.length - 1 && "rounded-tr-2xl",
                            activeTab === tab.id
                                ? "text-gray-900 bg-white border-b-2 border-[var(--color-primary)]"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                        )}
                    >
                        <tab.icon className={clsx("w-4 h-4", activeTab === tab.id ? "text-[var(--color-primary)]" : "text-gray-400")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">


                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* --- CAR SEARCH MODE --- */}
                    {activeTab === "car" && (
                        <>
                            <div className="w-full">
                                <SearchableSelect
                                    label="Márka"
                                    options={brandOptions}
                                    value={brand}
                                    onChange={setBrand}
                                    placeholder="Válassz márkát..."
                                />
                            </div>

                            <div className="w-full">
                                <SearchableSelect
                                    label="Modell"
                                    options={modelOptions}
                                    value={model}
                                    onChange={setModel}
                                    placeholder="Válassz modellt..."
                                    disabled={!brand}
                                />
                            </div>

                            <div className="w-full">
                                <SearchableSelect
                                    label="Alkatrész Neve"
                                    options={partOptions}
                                    value={part}
                                    onChange={setPart}
                                    placeholder="Keress pl. Generátor..."
                                    disabled={!brand || !model}
                                />
                            </div>
                        </>
                    )}

                    {/* --- TIRE SEARCH MODE --- */}
                    {activeTab === "tire" && (
                        <>
                            <div className="w-full">
                                <SearchableSelect
                                    label="Szélesség"
                                    options={widthOptions}
                                    value={width}
                                    onChange={setWidth}
                                    placeholder="Pl. 205"
                                />
                            </div>

                            <div className="w-full">
                                <SearchableSelect
                                    label="Átmérő"
                                    options={diameterOptions}
                                    value={diameter}
                                    onChange={setDiameter}
                                    placeholder="Pl. R16"
                                />
                            </div>

                            <div className="relative md:col-span-1 border border-border rounded-xl flex items-center justify-center text-muted text-sm bg-foreground/5 h-[50px] mt-6">
                                További szűrők...
                            </div>
                        </>
                    )}

                    {/* --- SKU SEARCH MODE --- */}
                    {activeTab === "sku" && (
                        <div className="md:col-span-3 relative">
                            <label className="block text-xs text-muted mb-1 ml-1">Gyári cikkszám vagy utángyártott kód</label>
                            <input
                                type="text"
                                placeholder="Pl. 5G1 941 005"
                                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder-muted h-[50px]"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                            />
                        </div>
                    )}

                    {/* --- AI SEARCH MODE --- */}
                    {activeTab === "ai" && (
                        <div className="md:col-span-3 relative">
                            <label className="block text-xs text-muted mb-1 ml-1">Írd le saját szavaiddal (AI felismeri)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Pl. 2015-ös fekete Golf heteshez keresek bal első LED lámpát..."
                                    className="w-full bg-foreground/5 border border-[var(--color-primary)]/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder-muted shadow-[0_0_15px_rgba(219,81,60,0.1)] h-[50px]"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                />
                                <Sparkles className="absolute right-4 top-3.5 w-4 h-4 text-[var(--color-primary)] animate-pulse" />
                            </div>
                        </div>
                    )}

                    {/* Search Button (Always Visible) */}
                    <div className="flex items-end">
                        <Link href={getSearchUrl()} className="w-full">
                            <button
                                className="w-full bg-foreground/10 hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] border border-border text-foreground hover:text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group h-[50px]"
                            >
                                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Keresés
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}

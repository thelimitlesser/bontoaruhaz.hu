"use client";

import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { YearSelect } from "@/components/ui/year-select";
import clsx from "clsx";

interface VehicleCompatibilitySectionProps {
    isUniversal: boolean;
    setIsUniversal: (val: boolean) => void;
    selectedBrand: string;
    setSelectedBrand: (val: string) => void;
    selectedModel: string;
    setSelectedModel: (val: string) => void;
    yearFrom: string;
    setYearFrom: (val: string) => void;
    yearTo: string;
    setYearTo: (val: string) => void;
    bodyType: string;
    setBodyType: (val: string) => void;
    compatibilities: { brandId: string; modelId: string; bodyType?: string; yearFrom?: string; yearTo?: string }[];
    setCompatibilities: React.Dispatch<React.SetStateAction<{ brandId: string; modelId: string; bodyType?: string; yearFrom?: string; yearTo?: string }[]>>;
    errors?: string[];
    // Dynamic data from DB
    brands: any[];
    models: any[];
}

export function VehicleCompatibilitySection({
    isUniversal, setIsUniversal,
    selectedBrand, setSelectedBrand,
    selectedModel, setSelectedModel,
    yearFrom, setYearFrom,
    yearTo, setYearTo,
    bodyType, setBodyType,
    compatibilities, setCompatibilities,
    errors = [],
    brands,
    models
}: VehicleCompatibilitySectionProps) {
    
    const [addBrand, setAddBrand] = useState("");
    const [addModel, setAddModel] = useState("");
    const [addYearFrom, setAddYearFrom] = useState("");
    const [addYearTo, setAddYearTo] = useState("");
    const [addBodyType, setAddBodyType] = useState("");

    const bodyTypeOptions = [
        { value: "Sedan", label: "Sedan" },
        { value: "Ferdehátú", label: "Ferdehátú" },
        { value: "Kombi", label: "Kombi" },
        { value: "3 ajtós", label: "3 ajtós" }
    ];

    const handleAddComp = () => {
        if (!addBrand || !addModel) return;
        setCompatibilities([...compatibilities, { brandId: addBrand, modelId: addModel, bodyType: addBodyType, yearFrom: addYearFrom, yearTo: addYearTo }]);
        setAddBrand("");
        setAddModel("");
        setAddYearFrom("");
        setAddYearTo("");
        setAddBodyType("");
    };

    const handleRemoveComp = (index: number) => {
        setCompatibilities(compatibilities.filter((_, i) => i !== index));
    };

    const brandOptions = brands.filter(b => !b.hidden).map(b => ({ value: b.id, label: b.name }));
    
    // Grouped model options using the 'series' field for elegant headers
    const modelOptions = selectedBrand ? models.filter((m: any) => m.brandId === selectedBrand).map((m: any) => ({ 
        value: m.id, 
        label: m.name,
        group: m.series || 'Egyéb'
    })) : [];

    const addModelOptions = addBrand ? models.filter((m: any) => m.brandId === addBrand).map((m: any) => ({ 
        value: m.id, 
        label: m.name,
        group: m.series || 'Egyéb'
    })) : [];

    return (
        <div className={`bg-white border rounded-xl p-6 space-y-6 transition-all ${isUniversal ? 'border-orange-500 shadow-md shadow-orange-500/10' : 'border-gray-200 shadow-sm'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-900">Jármű Kompatibilitás</h2>

                <label className="flex items-center gap-3 cursor-pointer group bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={isUniversal} onChange={(e) => setIsUniversal(e.target.checked)} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${isUniversal ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isUniversal ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm font-bold text-orange-900">Univerzális alkatrész (Minden autóhoz)</span>
                </label>
            </div>

            {!isUniversal ? (
                <>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Elsődleges Jármű (Donor)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={clsx(errors.includes("selectedBrand") && "ring-2 ring-red-500 rounded-xl")}>
                                <SearchableSelect
                                    name="brandId" label="Márka *" options={brandOptions}
                                    value={selectedBrand}
                                    onChange={(val) => { setSelectedBrand(val); setSelectedModel(""); }}
                                    placeholder="Válassz márkát..." theme="light" />
                            </div>
                            <div className={clsx(errors.includes("selectedModel") && "ring-2 ring-red-500 rounded-xl")}>
                                <SearchableSelect
                                    name="modelId" label="Modell *" options={modelOptions}
                                    value={selectedModel}
                                    onChange={setSelectedModel}
                                    placeholder="Válassz modellt..." disabled={!selectedBrand}
                                    theme="light" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 items-end">
                            <div>
                                <YearSelect 
                                    label="Évjárat (mettől)"
                                    value={yearFrom} 
                                    onChange={setYearFrom}
                                    placeholder="Válassz évet..." 
                                    minYear={2000}
                                    maxYear={2030}
                                />
                            </div>
                            <div>
                                <YearSelect 
                                    label="Évjárat (meddig)"
                                    value={yearTo} 
                                    onChange={setYearTo}
                                    placeholder="Válassz évet..." 
                                    minYear={2000}
                                    maxYear={2030}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <SearchableSelect
                                    name="bodyType" label="Karosszéria típus" options={bodyTypeOptions}
                                    value={bodyType}
                                    onChange={setBodyType}
                                    placeholder="Válassz típust (opcionális)..." 
                                    theme="light" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">További Kompatibilis Modellek</h3>
                        {compatibilities.length > 0 && (
                            <div className="space-y-2">
                                {compatibilities.map((comp, idx) => {
                                    const bName = brands.find(b => b.id === comp.brandId)?.name || comp.brandId;
                                    const mName = models.filter((m: any) => m.brandId === comp.brandId).find((m: any) => m.id === comp.modelId)?.name || comp.modelId;
                                    return (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{bName} {mName} {comp.bodyType && <span className="font-normal text-gray-500 italic">({comp.bodyType})</span>}</span>
                                                {(comp.yearFrom || comp.yearTo) && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">
                                                        {comp.yearFrom || '...'} - {comp.yearTo || '...'}
                                                    </span>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => handleRemoveComp(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Márka</label>
                                    <SearchableSelect
                                        name="addBrandId" options={brandOptions}
                                        value={addBrand}
                                        onChange={(val) => { setAddBrand(val); setAddModel(""); }}
                                        placeholder="Márka..." theme="light" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Modell</label>
                                    <SearchableSelect
                                        name="addModelId" options={addModelOptions}
                                        value={addModel}
                                        onChange={setAddModel}
                                        placeholder="Modell..." disabled={!addBrand}
                                        theme="light" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Kivitel</label>
                                    <SearchableSelect
                                        name="addBodyType" options={bodyTypeOptions}
                                        value={addBodyType}
                                        onChange={setAddBodyType}
                                        placeholder="Kivitel..." theme="light" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Mettől</label>
                                    <div className="relative" style={{ height: '46px' }}>
                                        <YearSelect 
                                            value={addYearFrom} 
                                            onChange={setAddYearFrom}
                                            placeholder="Év" 
                                            minYear={2000}
                                            maxYear={2030}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Meddig</label>
                                    <div className="relative" style={{ height: '46px' }}>
                                        <YearSelect 
                                            value={addYearTo} 
                                            onChange={setAddYearTo}
                                            placeholder="Év" 
                                            minYear={2000}
                                            maxYear={2030}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        type="button" onClick={handleAddComp}
                                        disabled={!addBrand || !addModel}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-95" 
                                        style={{ height: '46px' }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Hozzáad</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-8 text-orange-800 bg-orange-50 rounded-lg border border-orange-100">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">Ez az alkatrész Univerzálisnak lett jelölve.</p>
                    <p className="text-sm mt-1 opacity-80">Nem szükséges külön autómárkákhoz rendelni, minden keresésben releváns lesz.</p>
                </div>
            )}
        </div>
    );
}

"use client";

import { Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CustomSelect } from "@/components/ui/custom-select";
import { partItems, categories, partsSubcategories as subcategories } from "@/lib/vehicle-data";
import clsx from "clsx";

interface BasicInfoSectionProps {
    productName: string;
    setProductName: (val: string) => void;
    nameRef: React.RefObject<HTMLInputElement | null>;
    selectedPartItem: string;
    setSelectedPartItem: (val: string) => void;
    sku: string;
    setSku: (val: string) => void;
    isCheckingSku: boolean;
    duplicateWarnings: any[];
    autoRef: string;
    setAutoRef: (val: string) => void;
    condition: string;
    setCondition: (val: string) => void;
    engineCode: string;
    setEngineCode: (val: string) => void;
    initialData?: any;
    errors?: string[];
}

export function BasicInfoSection({
    productName, setProductName, nameRef,
    selectedPartItem, setSelectedPartItem,
    sku, setSku, isCheckingSku, duplicateWarnings,
    autoRef, setAutoRef, 
    condition, setCondition,
    engineCode, setEngineCode,
    initialData, errors = []
}: BasicInfoSectionProps) {
    
    const allPartItemOptions = partItems.map(p => ({ value: p.id, label: p.name }));
    const selectedPartItemObj = partItems.find(p => p.id === selectedPartItem);
    const inferredSubcategory = subcategories.find(s => s.id === selectedPartItemObj?.subcategoryId);
    const inferredCategory = categories.find(c => c.id === inferredSubcategory?.categoryId);

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Alapadatok</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={clsx("text-sm font-medium", errors.includes("productName") ? "text-red-600" : "text-gray-700")}>Megnevezés *</label>
                    <input 
                        ref={nameRef as any}
                        name="name" type="text" required value={productName} 
                        onChange={(e) => setProductName(e.target.value)} 
                        placeholder="pl. Volkswagen Golf VII Generátor" 
                        spellCheck={true}
                        className={clsx(
                            "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors font-bold",
                            errors.includes("productName") 
                                ? "bg-red-50 border-2 border-red-500 text-red-900" 
                                : "bg-orange-50 border border-orange-200 text-gray-900 focus:border-[var(--color-primary)]"
                        )}
                    />
                    <p className={clsx("text-[10px] font-bold uppercase tracking-wider", errors.includes("productName") ? "text-red-500" : "text-[var(--color-primary)]")}>
                        {errors.includes("productName") ? "Ez a mező kötelező!" : "Intelligens névgenerálás aktív - kiegészítheted manuálisan is"}
                    </p>
                </div>

                <div className="w-full">
                    <div className={clsx(errors.includes("selectedPartItem") && "ring-2 ring-red-500 rounded-xl")}>
                        <SearchableSelect
                            name="partItemId" label="Pontos Alkatrész Kereső *" options={allPartItemOptions}
                            value={selectedPartItem}
                            onChange={setSelectedPartItem}
                            placeholder="Keresés (pl. első lökhárító, generátor)..." theme="light" />
                    </div>
                    {errors.includes("selectedPartItem") ? (
                        <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Kérjük válasszon alkatrészt!</p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1">Az alkatrész kiválasztásával a fő- és alkategóriák automatikusan kitöltődnek.</p>
                    )}

                    {inferredCategory && <input type="hidden" name="categoryId" value={inferredCategory.id} />}
                    {inferredSubcategory && <input type="hidden" name="subcategoryId" value={inferredSubcategory.id} />}
                </div>
            </div>

            {/* Categorization Preview */}
            {(inferredCategory || inferredSubcategory || selectedPartItemObj) && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400">Automatikus Kategorizálás</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-orange-900">
                        {inferredCategory && (
                            <span className="bg-orange-200/50 px-2 py-1 rounded shadow-sm">{inferredCategory.name}</span>
                        )}
                        {inferredSubcategory && (
                            <>
                                <span className="text-orange-300">/</span>
                                <span className="bg-orange-200/50 px-2 py-1 rounded shadow-sm">{inferredSubcategory.name}</span>
                            </>
                        )}
                        {selectedPartItemObj && (
                            <>
                                <span className="text-orange-300">/</span>
                                <span className="bg-orange-600 text-white px-2 py-1 rounded shadow-sm">{selectedPartItemObj.name}</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 relative">
                    <label className={clsx("text-sm font-medium", errors.includes("sku") ? "text-red-600" : "text-gray-700")}>Cikkszám (Gyári szám) *</label>
                    <div className="relative">
                        <input 
                            name="sku" type="text" required value={sku} 
                            onChange={(e) => setSku(e.target.value)} 
                            placeholder="pl. 5G1941005" 
                            className={clsx(
                                "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors font-mono uppercase",
                                errors.includes("sku") 
                                    ? "bg-red-50 border-2 border-red-500 text-red-900 placeholder-red-300" 
                                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-[var(--color-primary)]"
                            )} 
                        />
                        {isCheckingSku && <div className="absolute right-3 top-3.5"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>}
                    </div>
                    {errors.includes("sku") && <p className="text-[10px] text-red-500 font-bold uppercase">A cikkszám megadása kötelező!</p>}
                    {duplicateWarnings.length > 0 && (
                        <div className="mt-3 bg-orange-50 border border-orange-200 p-3 rounded-lg animate-in fade-in slide-in-from-top-2 absolute w-full md:w-[250%] z-10 shadow-xl">
                            <p className="text-xs font-bold text-orange-800 flex items-center gap-1.5 mb-2">⚠️ Figyelem! Létező termék(ek):</p>
                            <ul className="space-y-1.5">
                                {duplicateWarnings.map(dup => (
                                    <li key={dup.id} className="text-[10px] text-orange-900 bg-white/60 px-2 py-1.5 rounded flex justify-between items-center border border-orange-100">
                                        <span className="font-semibold truncate mr-2">{dup.name}</span>
                                        <span className="whitespace-nowrap"><span className="font-mono bg-orange-200 px-1.5 py-0.5 rounded text-orange-900 font-bold">{dup.stock} db</span> készleten</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Motorkód</label>
                    <input 
                        name="engineCode" type="text" 
                        value={engineCode} 
                        onChange={(e) => setEngineCode(e.target.value)}
                        placeholder="pl. ASZ" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors font-mono uppercase" 
                    />
                </div>

                <div className="space-y-2">
                    <label className={clsx("text-sm font-medium", errors.includes("autoRef") ? "text-red-600" : "text-gray-700")}>Hivatkozási szám *</label>
                    <input 
                        name="productCode" type="text" required value={autoRef} 
                        onChange={(e) => setAutoRef(e.target.value)} 
                        placeholder="pl. 1000" 
                        className={clsx(
                            "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors font-mono uppercase font-bold",
                            errors.includes("autoRef") 
                                ? "bg-red-50 border-2 border-red-500 text-red-900" 
                                : "bg-orange-50 border border-orange-200 text-gray-900 focus:border-[var(--color-primary)]"
                        )} 
                    />
                    {errors.includes("autoRef") && <p className="text-[10px] text-red-500 font-bold uppercase">A hivatkozási szám kötelező!</p>}
                </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
                <div className="max-w-xs">
                    <CustomSelect 
                        label="Termék Állapota *"
                        value={condition}
                        onChange={setCondition}
                        options={[
                            { value: "used", label: "Használt" },
                            { value: "new", label: "Új" }
                        ]}
                    />
                    <input type="hidden" name="condition" value={condition} />
                </div>
            </div>
        </div>
    );
}

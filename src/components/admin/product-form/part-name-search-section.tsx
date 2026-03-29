"use client";

import { Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import clsx from "clsx";

interface PartNameSearchSectionProps {
    productName: string;
    setProductName: (val: string) => void;
    nameRef: React.RefObject<HTMLInputElement | null>;
    selectedPartItem: string;
    setSelectedPartItem: (val: string) => void;
    isCheckingName: boolean;
    nameDuplicates: any[];
    errors?: string[];
    // Dynamic data from DB
    partItems: any[];
    categories: any[];
    subcategories: any[];
}

export function PartNameSearchSection({
    productName, setProductName, nameRef,
    selectedPartItem, setSelectedPartItem,
    isCheckingName, nameDuplicates,
    errors = [],
    partItems, categories, subcategories
}: PartNameSearchSectionProps) {
    
    const allPartItemOptions = partItems.map(p => ({ value: p.id, label: p.name }));
    const selectedPartItemObj = partItems.find(p => p.id === selectedPartItem);
    const inferredSubcategory = subcategories.find(s => s.id === selectedPartItemObj?.subcategoryId);
    const inferredCategory = categories.find(c => c.id === inferredSubcategory?.categoryId);

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Megnevezés (Title) */}
                <div className="space-y-2 relative">
                    <label className={clsx("text-sm font-medium", errors.includes("productName") ? "text-red-600" : "text-gray-700")}>Megnevezés *</label>
                    <div className="relative">
                        <input 
                            ref={nameRef as any}
                            name="name" type="text" required value={productName} 
                            onChange={(e) => setProductName(e.target.value)} 
                            placeholder="pl. BMW 1 (E81) Benzin Nagynyomású pumpa" 
                            spellCheck={true}
                            className={clsx(
                                "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors font-bold",
                                errors.includes("productName") 
                                    ? "bg-red-50 border-2 border-red-500 text-red-900" 
                                    : "bg-orange-50 border border-orange-200 text-gray-900 focus:border-[var(--color-primary)]"
                            )}
                        />
                        {isCheckingName && <div className="absolute right-3 top-3.5"><Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" /></div>}
                    </div>
                    
                    {/* Name Duplicate Warning */}
                    {nameDuplicates.length > 0 && (
                        <div className="mt-3 bg-red-50 border border-red-200 p-3 rounded-lg animate-in fade-in slide-in-from-top-2 absolute w-full z-20 shadow-xl ring-1 ring-red-500/20">
                            <p className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-2 uppercase tracking-tight">⚠️ FIGYELEM! Ez a termék már létezik:</p>
                            <ul className="space-y-1.5">
                                {nameDuplicates.map(dup => (
                                    <li key={dup.id} className="text-[10px] text-red-900 bg-white/80 px-2 py-1.5 rounded flex justify-between items-center border border-red-100">
                                        <span className="font-semibold truncate mr-2">{dup.name}</span>
                                        <span className="whitespace-nowrap font-mono bg-red-200 px-1.5 py-0.5 rounded text-red-900 font-bold">Ref: {dup.productCode}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-[10px] text-red-600 mt-2 font-medium italic">Kérjük ellenőrizze, hogy biztosan új terméket kíván-e feltölteni!</p>
                        </div>
                    )}

                    <p className={clsx("text-[10px] font-bold uppercase tracking-wider", errors.includes("productName") ? "text-red-500" : "text-[var(--color-primary)]")}>
                        {errors.includes("productName") ? "Ez a mező kötelező!" : "Intelligens névgenerálás aktív - kiegészítheted manuálisan is"}
                    </p>
                </div>

                {/* Searchable Select (Autocomplete) */}
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
        </div>
    );
}

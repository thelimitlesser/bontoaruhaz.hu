"use client";

import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import clsx from "clsx";

interface DescriptionSectionProps {
    selectedBrand: string;
    selectedModel: string;
    selectedPartItemObj: any;
    yearFrom: string;
    yearTo: string;
    autoRef: string;
    manualDescription: string;
    setManualDescription: (val: string) => void;
    descriptionHeader: string;
    setDescriptionHeader: (val: string) => void;
    descriptionRef: React.RefObject<HTMLTextAreaElement | null>;
    condition?: string;
    errors?: string[];
    // Dynamic data from DB
    brands: any[];
    models: any[];
}

export function DescriptionSection({
    selectedBrand, selectedModel, selectedPartItemObj,
    yearFrom, yearTo, autoRef,
    manualDescription, setManualDescription,
    descriptionHeader, setDescriptionHeader,
    descriptionRef, condition = "used", errors = [],
    brands,
    models
}: DescriptionSectionProps) {
    
    const generatedHeader = useMemo(() => {
        const brandName = brands.find(b => b.id === selectedBrand)?.name;
        const modelName = models.filter((m: any) => m.brandId === selectedBrand).find((m: any) => m.id === selectedModel)?.name;
        const partName = selectedPartItemObj?.name;
        const years = yearFrom || yearTo ? `(${yearFrom || '?'}-${yearTo || '?'})` : "";
        const condLabel = condition === 'new' ? 'gyári új' : 'gyári használt';

        const parts = [];
        if (brandName) parts.push(brandName);
        if (modelName) parts.push(modelName);
        if (partName) parts.push(partName);
        if (years) parts.push(years);

        if (parts.length === 0) return "";
        return `Eladó ${condLabel} ${parts.join(' ')}.`;
    }, [selectedBrand, selectedModel, selectedPartItemObj, yearFrom, yearTo, condition]);

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Termék Leírás</h2>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Teljes Leírás (Fejléc + Egyedi + Lábjegyzet)</label>
                    <span className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider">Helyesírás-ellenőrző aktív</span>
                </div>
                
                <div className="w-full bg-white border-2 border-gray-300 rounded-xl focus-within:border-[var(--color-primary)] focus-within:ring-4 focus-within:ring-[var(--color-primary)]/10 overflow-hidden shadow-sm transition-all flex flex-col">
                    
                    {/* Editable Header Component */}
                    <div className="p-4 border-b flex flex-col gap-2 bg-gray-50/50 border-gray-100">
                        <div className="flex items-center justify-between">
                            <label htmlFor="descriptionHeader" className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Leírás Fejléce (Automatikusan generált, de szerkeszthető)
                            </label>
                            {generatedHeader && (
                                <div className="flex items-center gap-1 text-[10px] bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm">
                                    <Sparkles className="w-3 h-3" /> AUTO-SYNC
                                </div>
                            )}
                        </div>
                        
                        <input
                            id="descriptionHeader"
                            type="text"
                            value={descriptionHeader}
                            onChange={(e) => setDescriptionHeader(e.target.value)}
                            placeholder="pl. Eladó gyári Volkswagen Golf VII Generátor..."
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 placeholder:text-gray-300"
                        />
                    </div>

                    {/* Editable Manual Description */}
                    <textarea
                        ref={descriptionRef as any}
                        id="manualDescription"
                        name="manualDescription" 
                        rows={6}
                        defaultValue={manualDescription}
                        onBlur={(e) => setManualDescription(e.target.value)}
                        placeholder="Ide írhatod az alkatrész specifikus adatait (pl. szín, állapot, extra infók)..."
                        spellCheck="true"
                        lang="hu-HU"
                        autoCorrect="on"
                        autoComplete="on"
                        autoCapitalize="sentences"
                        className="w-full border-none px-4 py-4 focus:outline-none focus:ring-0 text-gray-900 resize-none text-lg leading-relaxed bg-white min-h-[150px] font-sans" 
                    ></textarea>

                    {/* Auto Footer Component */}
                    <div className="bg-gray-50 text-gray-500 px-4 py-3 border-t border-gray-100 text-sm whitespace-pre-wrap">
                        A hivatkozási számra hivatkozzon, hogyha bármi kérdése van a termékkel kapcsolatban!{"\n"}
                        Hivatkozási szám: <span className="font-bold text-gray-700">({autoRef || "..."})</span>
                    </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                    A fejléc és a lábjegyzet automatikusan frissül az adatok alapján, de a fejlécet tetszőlegesen átírhatod.
                </p>
            </div>
        </div>
    );
}

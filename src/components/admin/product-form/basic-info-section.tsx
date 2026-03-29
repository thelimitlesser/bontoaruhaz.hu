"use client";

import { Loader2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import clsx from "clsx";

interface BasicInfoSectionProps {
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
    sku, setSku, isCheckingSku, duplicateWarnings,
    autoRef, setAutoRef, 
    condition, setCondition,
    engineCode, setEngineCode,
    initialData, errors = [],
}: BasicInfoSectionProps) {
    
    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">További Adatok</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SKU */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-gray-700">Cikkszám (Gyári szám)</label>
                    <div className="relative">
                        <input 
                            name="sku" type="text" value={sku} 
                            onChange={(e) => setSku(e.target.value)} 
                            placeholder="pl. 5G1941005" 
                            className={clsx(
                                "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors font-mono uppercase bg-gray-50 border border-gray-200 text-gray-900 focus:border-[var(--color-primary)]"
                            )} 
                        />
                        {isCheckingSku && <div className="absolute right-3 top-3.5"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>}
                    </div>
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

                {/* Engine Code */}
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

                {/* Reference Number */}
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

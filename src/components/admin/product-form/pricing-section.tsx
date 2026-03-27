"use client";

import { Save, Loader2, Package } from "lucide-react";
import clsx from "clsx";
import { PXP_SPECIAL_RATES } from "@/lib/shipping/pxp-rates";
import { CustomSelect } from "@/components/ui/custom-select";

interface PricingSectionProps {
    priceGross: string;
    setPriceGross: (val: string) => void;
    weight: string;
    setWeight: (val: string) => void;
    length: string;
    setLength: (val: string) => void;
    width: string;
    setWidth: (val: string) => void;
    height: string;
    setHeight: (val: string) => void;
    packageType: string;
    setPackageType: (val: string) => void;
    shippingPrice: string;
    setShippingPrice: (val: string) => void;
    stock: string;
    setStock: (val: string) => void;
    isSubmitting: boolean;
    initialData?: any;
    errors?: string[];
}

export function PricingSection({ 
    priceGross, setPriceGross,
    weight, setWeight,
    length, setLength,
    width, setWidth,
    height, setHeight,
    packageType, setPackageType,
    shippingPrice, setShippingPrice,
    stock, setStock,
    isSubmitting, 
    initialData,
    errors = [] 
}: PricingSectionProps) {
    const packageTypeOptions = [
        { value: 'doboz', label: 'Doboz', group: 'Alap típusok' },
        { value: 'level', label: 'Levél', group: 'Alap típusok' },
        { value: 'raklap', label: `Raklap (${PXP_SPECIAL_RATES['raklap']} Ft)`, group: 'Alap típusok' },
        { value: 'csomagterajto', label: `Csomagtérajtó (${PXP_SPECIAL_RATES['csomagterajto']} Ft)`, group: 'Speciális alkatrészek' },
        { value: 'lokharito', label: `Lökhárító (személyautó) (${PXP_SPECIAL_RATES['lokharito']} Ft)`, group: 'Speciális alkatrészek' },
        { value: 'lokharito_teher', label: `Lökhárító (teherautó) (${PXP_SPECIAL_RATES['lokharito_teher']} Ft)`, group: 'Speciális alkatrészek' },
        { value: 'motor', label: `Motor (${PXP_SPECIAL_RATES['motor']} Ft)`, group: 'Speciális alkatrészek' },
        { value: 'motorhazteto', label: `Motorháztető (${PXP_SPECIAL_RATES['motorhazteto']} Ft)`, group: 'Speciális alkatrészek' },
        { value: 'oldalajto', label: `Oldalajtó (${PXP_SPECIAL_RATES['oldalajto']} Ft)`, group: 'Speciális alkatrészek' },
        { value: 'valto', label: `Váltó (${PXP_SPECIAL_RATES['valto']} Ft)`, group: 'Speciális alkatrészek' },
    ];

    const handlePackageTypeChange = (newType: string) => {
        setPackageType(newType);
        
        // Auto-fill price if it's a special rate
        if (PXP_SPECIAL_RATES[newType]) {
            setShippingPrice(PXP_SPECIAL_RATES[newType].toString());
        }
    };
    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-gray-200 text-gray-900 pb-4">Árazás & Szállítás</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className={clsx("text-sm font-medium", errors.includes("priceGross") ? "text-red-600" : "text-gray-700")}>Eladási Ár (Ft) *</label>
                    <div className="relative">
                        <input 
                            name="priceGross" 
                            type="number" 
                            required 
                            value={priceGross}
                            onChange={(e) => setPriceGross(e.target.value)}
                            placeholder="pl. 15000" 
                            className={clsx(
                                "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors font-bold text-lg",
                                errors.includes("priceGross") 
                                    ? "bg-red-50 border-2 border-red-500 text-red-900 placeholder-red-300" 
                                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-[var(--color-primary)]"
                            )} 
                        />
                        <div className={clsx("absolute right-4 top-1/2 -translate-y-1/2 font-bold", errors.includes("priceGross") ? "text-red-400" : "text-gray-400")}>Ft</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Eredeti Ár (Opcionális - Akcióhoz)</label>
                    <div className="relative">
                        <input 
                            name="originalPrice" 
                            type="number" 
                            defaultValue={initialData?.originalPrice || ""} 
                            placeholder="pl. 20000" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Ft</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Ha kitöltöd, a rendszer automatikusan "AKCIÓ" címkét tesz rá.</p>
                </div>

                <div className="space-y-2">
                    <label className={clsx("text-sm font-medium", errors.includes("weight") ? "text-red-600" : "text-gray-700")}>Súly (kg) *</label>
                    <div className="relative">
                        <input 
                            name="weight" 
                            type="number" 
                            step="0.01" 
                            required 
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="pl. 5.5" 
                            className={clsx(
                                "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors",
                                errors.includes("weight") 
                                    ? "bg-red-50 border-2 border-red-500 text-red-900 placeholder-red-300" 
                                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-[var(--color-primary)]"
                            )} 
                        />
                        <div className={clsx("absolute right-4 top-1/2 -translate-y-1/2 font-bold", errors.includes("weight") ? "text-red-400" : "text-gray-400")}>kg</div>
                    </div>
                </div>

                {/* Dimensions: Hosszúság x Szélesség x Magasság */}
                <div className="space-y-2">
                    <label className={clsx("text-sm font-medium", errors.includes("length") ? "text-red-600" : "text-gray-700")}>Hosszúság (cm) *</label>
                    <input 
                        name="length" 
                        type="number" 
                        required 
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="pl. 30" 
                        className={clsx(
                            "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors",
                            errors.includes("length") 
                                ? "bg-red-50 border-2 border-red-500 text-red-900 placeholder-red-300" 
                                : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-[var(--color-primary)]"
                        )} 
                    />
                </div>
                <div className="space-y-2">
                    <label className={clsx("text-sm font-medium", errors.includes("width") ? "text-red-600" : "text-gray-700")}>Szélesség (cm) *</label>
                    <input 
                        name="width" 
                        type="number" 
                        required 
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="pl. 40" 
                        className={clsx(
                            "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors",
                            errors.includes("width") 
                                ? "bg-red-50 border-2 border-red-500 text-red-900 placeholder-red-300" 
                                : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-[var(--color-primary)]"
                        )} 
                    />
                </div>
                <div className="space-y-2">
                    <label className={clsx("text-sm font-medium", errors.includes("height") ? "text-red-600" : "text-gray-700")}>Magasság (cm) *</label>
                    <input 
                        name="height" 
                        type="number" 
                        required 
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="pl. 20" 
                        className={clsx(
                            "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors",
                            errors.includes("height") 
                                ? "bg-red-50 border-2 border-red-500 text-red-900 placeholder-red-300" 
                                : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-[var(--color-primary)]"
                        )} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                    <label className={clsx("text-sm font-medium", errors.includes("shippingPrice") ? "text-red-600" : "text-gray-700")}>Házhozszállítási díj (Ft) *</label>
                    <div className="relative">
                        <input 
                            name="shippingPrice" 
                            type="number" 
                            required 
                            value={shippingPrice}
                            onChange={(e) => setShippingPrice(e.target.value)}
                            placeholder="pl. 2500" 
                            className={clsx(
                                "w-full rounded-lg px-4 py-3 focus:outline-none transition-colors font-bold",
                                errors.includes("shippingPrice") 
                                    ? "bg-red-50 border-2 border-red-500 text-red-900 placeholder-red-300" 
                                    : "bg-orange-50 border border-orange-200 text-gray-900 focus:border-orange-500"
                            )} 
                        />
                        <div className={clsx("absolute right-4 top-1/2 -translate-y-1/2 font-bold", errors.includes("shippingPrice") ? "text-red-400" : "text-orange-400")}>Ft</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <CustomSelect 
                        label="Csomag Típusa *"
                        value={packageType}
                        onChange={handlePackageTypeChange}
                        options={packageTypeOptions}
                        className={errors.includes("packageType") ? "ring-2 ring-red-500 rounded-lg" : ""}
                    />
                    <input type="hidden" name="packageType" value={packageType} />
                    {PXP_SPECIAL_RATES[packageType] && (
                        <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-1 px-1">
                            ✨ API: Fix kedvezményes szállítási ár alkalmazva
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Készlet (db) *</label>
                    <input 
                        name="stock" 
                        type="number" 
                        required 
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-gray-900 transition-colors" 
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-gray-500">
                    <p>Minden megadott mező mentésre kerül a rendszerben.</p>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-[var(--color-primary)] hover:bg-[#e67e00] text-white font-bold py-4 px-12 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 text-lg"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Mentés folyamatban...
                        </>
                    ) : (
                        <>
                            <Save className="w-6 h-6" />
                            {initialData?.id ? "Módosítások Mentése" : "Termék Hozzáadása"}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

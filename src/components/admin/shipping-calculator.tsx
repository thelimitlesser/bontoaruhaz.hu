"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Info, MapPin } from 'lucide-react';
import { getShippingPrice } from '@/lib/shipping/pxp-rates';

interface ShippingCalculatorProps {
    initialWeight?: number | null;
    initialHeight?: number | null;
    initialWidth?: number | null;
    initialLength?: number | null;
    subcategorySlug?: string;
}

export function ShippingCalculator({
    initialWeight,
    initialHeight,
    initialWidth,
    initialLength,
    subcategorySlug
}: ShippingCalculatorProps) {
    const [weight, setWeight] = useState<string>(initialWeight?.toString() || '');
    const [height, setHeight] = useState<string>(initialHeight?.toString() || '');
    const [width, setWidth] = useState<string>(initialWidth?.toString() || '');
    const [length, setLength] = useState<string>(initialLength?.toString() || '');
    const [volumetricWeight, setVolumetricWeight] = useState<number>(0);
    const [shippingFee, setShippingFee] = useState<number | null>(null);

    useEffect(() => {
        const w = parseFloat(weight) || 0;
        const h = parseFloat(height) || 0;
        const wi = parseFloat(width) || 0;
        const l = parseFloat(length) || 0;

        // Volumetric weight logic is inside getShippingPrice, but we show it for UI
        const volWeight = (l * wi * h) / 6000;
        setVolumetricWeight(volWeight);

        if (w > 0 || subcategorySlug) {
            setShippingFee(getShippingPrice(w, l, wi, h, subcategorySlug));
        } else {
            setShippingFee(null);
        }
    }, [weight, height, width, length, subcategorySlug]);

    return (
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Szállítási Kalkulátor (Pannon XP)</h3>
                        <p className="text-xs text-gray-500">Méretek alapján számolt automata szállítási díj</p>
                    </div>
                </div>
                {shippingFee !== null && (
                    <div className="text-right">
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Szállítási díj</div>
                        <div className="text-xl font-black text-blue-700">{shippingFee.toLocaleString('hu-HU')} Ft</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Súly (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 text-gray-900 font-bold transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Hossz (cm)</label>
                    <input
                        type="number"
                        name="length"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 text-gray-900 font-bold transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Szél. (cm)</label>
                    <input
                        type="number"
                        name="width"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 text-gray-900 font-bold transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Mag. (cm)</label>
                    <input
                        type="number"
                        name="height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-400 text-gray-900 font-bold transition-all"
                    />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-100 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-gray-500">Térfogatsúly:</span>
                    <span className="font-bold text-gray-900">{volumetricWeight.toFixed(2)} kg</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded border border-blue-100">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-gray-500 italic">PXP Díj övezet:</span>
                    <span className="font-bold text-blue-700">Országos egységár (0-500kg)</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-gray-500 italic">A díj a súly, méret vagy speciális kategória (pl. motor) alapján változik.</span>
                </div>
            </div>

            {/* Hidden input to pass the calculated fee to the form */}
            <input type="hidden" name="shippingPrice" value={shippingFee || ''} />
        </div>
    );
}

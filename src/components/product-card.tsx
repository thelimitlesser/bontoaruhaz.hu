"use client";
import Link from "next/link";
import { ShoppingCart, Tag, MapPin, Globe, Calendar, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";
import { Product } from "@/lib/mock-data";
import { getProductUrl } from "@/utils/slug";

// Add support for real Prisma Part
export interface PrismaPart {
    id: string;
    name: string;
    priceGross: number;
    currency: string;
    images: string; // CSV string
    condition: string;
    sku: string;
    brandId?: string | null;
    modelId?: string | null;
    brandName?: string | null;
    modelName?: string | null;
    yearFrom?: number | null;
    yearTo?: number | null;
    isUniversal?: boolean;
    isCompatibilityMatch?: boolean;
    partner?: {
        businessName: string;
    } | null;
}

import { useState } from "react";

export function ProductCard({ product }: { product: Product | any }) {
    const [isLoaded, setIsLoaded] = useState(false);
    // Adapter for Prisma Part
    const isPrisma = 'priceGross' in product;

    const displayPrice = isPrisma ? product.priceGross : product.price;
    const displayCurrency = product.currency || 'HUF';
    const displayCondition = isPrisma
        ? (product.condition === 'USED' ? 'Használt' : product.condition === 'NEW' ? 'Új' : 'Felújított')
        : product.condition;

    // Parse images CSV
    const imageList = isPrisma
        ? (product.images ? product.images.split(',') : [])
        : [product.image];

    const mainImage = imageList[0] || 'https://placehold.co/600x400/1a1a1a/cccccc?text=Bontóáruház';
    
    // Format year range
    const formatYear = () => {
        const from = product.yearFrom;
        const to = product.yearTo;
        
        if (!from && !to) return null;
        if (from && to) {
            if (from === to) return `${from}`;
            return `${from} - ${to}`;
        }
        if (from) return `${from}-`;
        if (to) return `${to}-ig`;
        return null;
    };
    
    const yearRange = formatYear();

    const productUrl = getProductUrl({
        id: product.id,
        name: product.name,
        brandName: isPrisma ? product.brandName : product.brand,
        modelName: isPrisma ? product.modelName : product.model,
        sku: product.sku
    });

    return (
        <Link href={productUrl} className="block h-full group active:scale-[0.98] transition-transform">
            <div className="glass-card p-0 pb-4 relative overflow-hidden flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-1 bg-background/40 backdrop-blur-md border border-border hover:border-[var(--color-primary)]/50 hover:shadow-lg hover:shadow-[0_0_20px_rgba(219,81,60,0.1)]">
                {/* Badge Container */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {product?.isUniversal && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-orange-500/20 border-orange-500 text-orange-600 backdrop-blur-md uppercase tracking-widest flex items-center">
                            <Globe className="w-2.5 h-2.5 mr-1" /> Univerzális
                        </span>
                    )}
                </div>

                {/* Image Container (4:3 aspect ratio) */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900 group border-b border-border/50">
                    {!isLoaded && (
                        <div className="absolute inset-0 bg-muted/20 animate-pulse z-10" />
                    )}
                    
                    {/* Blurred Background Layer */}
                    <div className="absolute inset-0 overflow-hidden">
                        <Image
                            src={mainImage}
                            alt=""
                            fill
                            className={clsx(
                                "object-cover blur-xl scale-110 opacity-60 transition-opacity duration-500",
                                isLoaded ? "opacity-60" : "opacity-0"
                            )}
                        />
                        <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-sm" />
                    </div>

                    {/* Foreground Sharp Image */}
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        onLoadingComplete={() => setIsLoaded(true)}
                        className={clsx(
                            "object-contain z-10 transition-transform duration-700 ease-out group-hover:scale-105 drop-shadow-xl",
                            isLoaded ? "opacity-100" : "opacity-0"
                        )} 
                    />
                    
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col px-5 pt-4 min-w-0">
                    <div className="flex items-center gap-2 mb-2 min-w-0">
                        <Tag className="w-3 h-3 text-[var(--color-primary)] shrink-0" />
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider truncate">
                            {isPrisma ? `${product?.brandName || product?.brandId || ''} ${product?.modelName || ''}`.trim() || 'Egyéb' : product?.brand}
                        </span>
                    </div>

                    <h3 className={clsx("text-lg font-bold text-foreground leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 [overflow-wrap:anywhere] [word-break:break-word] min-w-0")}>
                        {product?.name || "Név nélküli termék"}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 mt-1">
                        {product?.sku && product.sku !== "SKU-HIÁNY" && (
                            <p className="text-xs text-gray-400 font-mono font-medium">{product.sku.toUpperCase()}</p>
                        )}
                        {yearRange && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                                <Calendar className="w-3 h-3" />
                                <span>{yearRange}</span>
                            </div>
                        )}
                        {product?.isCompatibilityMatch && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Ellenőrzött illeszkedés</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                        <div className="flex flex-col">
                            {isPrisma && product?.originalPrice && product.originalPrice > product.priceGross && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 line-through">
                                        {product.originalPrice.toLocaleString('hu-HU')} {displayCurrency}
                                    </span>
                                    <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full animate-pulse uppercase tracking-tighter">
                                        -{Math.round(((product.originalPrice - product.priceGross) / product.originalPrice) * 100)}%
                                    </span>
                                </div>
                            )}
                            <span className="text-xs text-gray-500 font-medium">{isPrisma && product?.originalPrice && product.originalPrice > product.priceGross ? 'Akciós ár:' : 'Vételár:'}</span>
                            <span className={clsx(
                                "text-xl font-bold transition-colors whitespace-nowrap",
                                isPrisma && product?.originalPrice && product.originalPrice > product.priceGross 
                                    ? "text-red-600 group-hover:text-red-700" 
                                    : "text-foreground group-hover:text-[var(--color-primary)]"
                            )}>
                                {displayPrice?.toLocaleString('hu-HU')} {displayCurrency}
                            </span>
                        </div>

                        <div 
                            className="h-10 w-10 rounded-lg bg-foreground/5 hover:bg-[var(--color-primary)] flex items-center justify-center transition-all border border-border hover:border-[var(--color-primary)] shadow-sm hover:shadow-lg hover:text-white text-gray-500"
                            aria-label="Kosárba teszem"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

"use client";
import Link from "next/link";
import { ShoppingCart, Tag, MapPin, Globe } from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";
import { Product } from "@/lib/mock-data";

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
    isUniversal?: boolean;
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
    const displayBrand = isPrisma ? product.brandId : product.brand;

    return (
        <Link href={`/product/${product?.id}`} className="block h-full group">
            <div className="glass-card relative overflow-hidden flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-1 bg-background/40 backdrop-blur-md border border-border hover:border-[var(--color-primary)]/50 hover:shadow-lg hover:shadow-[0_0_20px_rgba(219,81,60,0.1)]">
                {/* Badge Container */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    {isPrisma && product?.isUniversal && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-orange-500/20 border-orange-500 text-orange-600 backdrop-blur-md uppercase tracking-widest">
                            <Globe className="w-2.5 h-2.5 inline mr-1" /> Univerzális
                        </span>
                    )}
                </div>

                {/* Image Container */}
                <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden bg-muted/20">
                    {!isLoaded && (
                        <div className="absolute inset-0 bg-muted/20 animate-pulse" />
                    )}
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        onLoadingComplete={() => setIsLoaded(true)}
                        className={clsx(
                            "object-cover transition-all duration-500 group-hover:scale-110",
                            isLoaded ? "opacity-100" : "opacity-0"
                        )} />
                    {/* Scanline overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-4 pt-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-3 h-3 text-[var(--color-primary)]" />
                        <span className="text-xs text-muted uppercase tracking-wider">
                            {isPrisma ? `${product?.brandName || product?.brandId || ''} ${product?.modelName || ''}`.trim() || 'Egyéb' : product?.brand}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1 leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {product?.name || "Név nélküli termék"}
                    </h3>
                    <p className="text-xs text-muted mb-4 font-mono">{product?.sku || "SKU-HIÁNY"}</p>

                    <div className="mt-auto flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted">Bruttó ár:</span>
                            <span className="text-xl font-bold text-foreground group-hover:text-[var(--color-primary)] transition-colors">
                                {displayPrice?.toLocaleString('hu-HU')} {displayCurrency}
                            </span>
                        </div>

                        <div className="h-10 w-10 rounded-lg bg-foreground/5 hover:bg-[var(--color-primary)] flex items-center justify-center transition-all border border-border hover:border-[var(--color-primary)] shadow-sm hover:shadow-lg hover:text-white text-muted">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

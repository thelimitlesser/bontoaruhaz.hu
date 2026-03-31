"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getProductUrl } from "@/utils/slug";

interface RelatedProductsProps {
    products: any[];
    brandName: string;
    modelName: string;
    brandSlug: string;
    modelSlug: string;
}

export function RelatedProducts({ products, brandName, modelName, brandSlug, modelSlug }: RelatedProductsProps) {
    if (products.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto mt-20 mb-12 border-t border-border pt-16">
            <div className="flex items-end justify-between mb-10 px-2 md:px-0">
                <div className="space-y-2">
                    <span className="text-[var(--color-primary)] font-black text-xs uppercase tracking-[0.2em]">Másodpercek alatt megtalálod</span>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight italic">
                        TOVÁBBI <span className="text-[var(--color-primary)]">{brandName} {modelName}</span> ALKATRÉSZEK
                    </h2>
                </div>
                <Link 
                    href={`/brand/${brandSlug}/${modelSlug}`}
                    className="hidden sm:flex items-center gap-2 text-sm font-bold text-muted hover:text-[var(--color-primary)] transition-colors group"
                >
                    Összes megtekintése
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="flex overflow-x-auto pb-8 gap-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 scrollbar-hide px-4 sm:px-0 -mx-4 sm:mx-0">
                {products.map((p) => (
                    <Link
                        key={p.id}
                        href={getProductUrl({
                            id: p.id,
                            name: p.name,
                            brandName: p.brandName,
                            modelName: p.modelName,
                            sku: p.sku
                        })}
                        className="group bg-background border border-border rounded-[2rem] overflow-hidden hover:border-[var(--color-primary)] hover:shadow-2xl hover:shadow-[var(--color-primary)]/10 transition-all duration-300 flex flex-col active:scale-[0.98] snap-start min-w-[280px] sm:min-w-0"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden bg-muted">
                            <Image
                                src={p.images?.split(',')[0] || "/logo_orange.png"}
                                alt={p.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-foreground/5 text-[10px] font-black uppercase tracking-wider rounded-md text-muted">
                                    {p.brandName}
                                </span>
                                <span className="px-2 py-1 bg-foreground/5 text-[10px] font-black uppercase tracking-wider rounded-md text-muted">
                                    {p.modelName}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 min-h-[3rem]">
                                {p.name}
                            </h3>

                            <div className="pt-4 mt-auto flex items-center justify-between border-t border-border/50">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-foreground">
                                        {p.priceGross.toLocaleString('hu-HU')}
                                    </span>
                                    <span className="text-xs font-bold text-muted">FT</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-foreground/[0.03] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-[var(--color-primary)] transition-colors" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Mobile view 'view all' link */}
            <div className="mt-8 flex justify-center sm:hidden">
                <Link 
                    href={`/brand/${brandSlug}/${modelSlug}`}
                    className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-6 py-3 rounded-xl active:scale-95 transition-all"
                >
                    Összes megtekintése
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

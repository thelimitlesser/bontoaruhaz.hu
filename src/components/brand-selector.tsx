import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Car } from "lucide-react";

interface BrandSelectorProps {
    brands: any[];
}

export function BrandSelector({ brands }: BrandSelectorProps) {
    return (
        <section className="w-full py-20 px-4 md:px-8 relative z-10">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter">
                            Válassz <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-orange-500">Márkát</span>
                        </h2>
                        <p className="text-muted mt-2 max-w-lg">
                            Találd meg a keresett alkatrészt autómárka alapján. Válassz a listából!
                        </p>
                    </div>
                    <div className="h-px flex-1 bg-border ml-8 hidden md:block" />
                </div>

                {/* Brand Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
                    {brands.filter(brand => !brand.hidden).map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/brand/${brand.slug}`}
                            className="group relative flex flex-col items-center justify-center gap-2 sm:gap-4 p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-foreground/5 border border-foreground/10 hover:border-[var(--color-primary)]/50 hover:bg-foreground/10 transition-all duration-300 hover:-translate-y-1" >
                            {/* Icon / Logo Container - Fixed Scaling */}
                            <div className="relative w-9 h-9 sm:w-14 sm:h-14 flex items-center justify-center p-1.5 sm:p-2 transition-all duration-300 group-hover:scale-105">
                                <Image
                                    src={brand.logo}
                                    alt={`${brand.name} logo - Bontott ${brand.name} alkatrészek`}
                                    fill
                                    className={`object-contain transition-all duration-300 opacity-90 group-hover:opacity-100 ${brand.logo.endsWith('.png') ? "mix-blend-multiply" : "brightness-0"}`}
                                    sizes="(max-width: 640px) 48px, 80px"
                                />
                            </div>

                            {/* Name */}
                            <span className="text-[10px] sm:text-[13px] font-black text-gray-950 group-hover:text-foreground uppercase tracking-tight sm:tracking-wide whitespace-nowrap">
                                {brand.name}
                            </span>

                            {/* Neon Glow Hover Effect */}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
}

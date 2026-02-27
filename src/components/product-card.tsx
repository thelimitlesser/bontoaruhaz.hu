import Link from "next/link";
import { ShoppingCart, Tag, MapPin } from "lucide-react";
import Image from "next/image";
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
    partner?: {
        businessName: string;
    } | null;
}

export function ProductCard({ product }: { product: Product | any }) {
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

    const mainImage = imageList[0] || 'https://placehold.co/600x400/1a1a1a/cccccc?text=AutoNexus';
    const displayBrand = isPrisma ? product.brandId : product.brand;

    return (
        <Link href={`/product/${product.id}`} className="block h-full group">
            <div className="glass-card relative overflow-hidden flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-1 bg-background/40 backdrop-blur-md border border-border hover:border-[var(--color-primary)]/50 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(219,81,60,0.15)] hover:shadow-[0_0_20px_rgba(219,81,60,0.1)]">
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${displayCondition === 'Új' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' :
                        displayCondition === 'Felújított' ? 'bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400' :
                            'bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400'
                        }`}>
                        {displayCondition}
                    </span>
                </div>

                {/* Image Container */}
                <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Scanline overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-4 pt-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3 text-[var(--color-primary)]" />
                            <span className="text-xs text-muted uppercase tracking-wider">{displayBrand}</span>
                        </div>
                        {isPrisma && product.partner && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded">
                                <MapPin className="w-2.5 h-2.5" />
                                {product.partner.businessName}
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1 leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-xs text-muted mb-4 font-mono">{product.sku}</p>

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

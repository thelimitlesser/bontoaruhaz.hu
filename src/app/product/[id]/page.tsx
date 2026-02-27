import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RotateCcw, HelpCircle, CheckCircle2, Star, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { CompatibilityTable } from "@/components/compatibility-table";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { prisma } from "@/lib/prisma";
import { getBrandBySlug, getModelBySlug } from "@/lib/vehicle-data";
import { Product } from "@/lib/mock-data";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const dbPart = await prisma.part.findUnique({
    where: { id }
  });

  if (!dbPart) {
    notFound();
  }

  const brand = dbPart.brandId ? getBrandBySlug(dbPart.brandId)?.name || dbPart.brandId : "Ismeretlen";
  const model = dbPart.modelId ? getModelBySlug(dbPart.modelId)?.name || dbPart.modelId : "Ismeretlen";

  const conditionMap: Record<string, "Új" | "Használt" | "Felújított"> = {
    "NEW": "Új",
    "USED": "Használt",
    "REFURBISHED": "Felújított"
  };

  const images = (dbPart.images || "").split(",").filter(img => img.length > 0);
  const mainImage = images.length > 0 ? images[0] : "/placeholder.png";

  const product: Product = {
    id: dbPart.id,
    name: dbPart.name,
    price: dbPart.priceGross,
    currency: dbPart.currency,
    image: mainImage,
    condition: conditionMap[dbPart.condition] || "Használt",
    brand,
    model,
    sku: dbPart.sku,
    quantity: dbPart.stock,
  };

  const galleryImages = images.length > 0 ? images : [mainImage];

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 relative z-0" style={{ paddingTop: '120px' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Navigation - Back Button Only */}
        <nav className="flex items-center mb-8">
          <Link href="/search" className="text-[var(--color-primary)] font-bold flex items-center gap-2 hover:underline text-sm uppercase tracking-wide">
            <ArrowLeft className="w-4 h-4" /> Vissza a találatokhoz
          </Link>
        </nav>

        {/* Main Layout - Flexbox for Layout Stability */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">

          {/* LEFT: Image Container - Fixed Width 50% on Desktop */}
          <div className="w-full md:w-1/2 flex-shrink-0 space-y-6">
            <ProductGallery images={galleryImages} productName={product.name} />

            {/* Premium Trust Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-black/5 dark:to-black/40 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]">

              {/* Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start gap-5 relative z-10">
                <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-3 rounded-xl shrink-0 border border-emerald-500/20 shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-lg tracking-wide flex items-center gap-2">
                    Kockázatmentes vásárlás
                    <span className="text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">100% Garancia</span>
                  </h4>
                  <p className="text-muted text-sm leading-relaxed font-light">
                    Cégünk által forgalmazott alkatrészekre <strong className="text-foreground font-bold">14 napos beépítési garanciát</strong> vállalunk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info - "Original" Data Style */}
          <div className="w-full md:w-1/2 space-y-8">

            {/* Header */}
            <div className="space-y-2 border-b border-border pb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                <span className="text-[var(--color-primary)]">{product.brand} {product.model}</span>
                <br />
                <span className="text-xl md:text-2xl text-muted font-normal">{product.name}</span>
              </h1>
              <div className="flex items-center gap-4 text-xs font-mono text-muted uppercase tracking-widest pt-2">
                <span>Termék kód: {product.sku}</span>
                <span className="w-1 h-1 bg-muted rounded-full" />
                <span className="text-emerald-500 font-bold">{product.quantity} darab raktáron</span>
              </div>
            </div>

            {/* Feature List - The "First Layout" Style */}
            <div className="space-y-4">
              {[
                { label: "Állapot", value: product.condition, icon: Star },
                { label: "Termék kód", value: product.sku, icon: Info },
                { label: "Garancia", value: "14 nap", icon: ShieldCheck },
                { label: "Kiszállítás", value: "Akár 1 munkanap", icon: Truck }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0 group hover:bg-foreground/5 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 text-muted">
                    <item.icon className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-foreground text-sm font-bold">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Price & Action Box */}
            <div className="bg-foreground/5 border border-border rounded-2xl p-6 lg:p-8 space-y-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-muted text-xs font-bold uppercase tracking-widest">Fogyasztói ár</span>
                <div className="text-right">
                  <span className="text-4xl font-bold text-foreground block">{product.price.toLocaleString('hu-HU')} Ft</span>
                  <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">+ Szállítás: 1 990 Ft</span>
                </div>
              </div>

              {/* Standard Rounded CTA (Not Pill, Not Square) */}
              <AddToCartButton product={product} />

              <div className="flex items-center justify-center gap-6 text-[10px] text-muted font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {product.quantity} db raktáron</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Azonnal átvehető</span>
              </div>
            </div>

          </div>
        </div>

        {/* Compatibility Table & Question CTA */}
        <div className="mt-8 pt-6 border-t border-border space-y-12">
          <CompatibilityTable brand={product.brand} model={product.model} />

          <div className="flex justify-center">
            <a
              href={`mailto:info@autonexus.hu?subject=Érdeklődés: ${product.name} (${product.sku})`}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-full transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-lg"
            >
              <HelpCircle className="w-5 h-5 text-muted group-hover:text-[var(--color-primary)] transition-colors" />
              <span className="text-muted font-medium group-hover:text-foreground transition-colors">
                Kérdésem van a termékkel kapcsolatban
              </span>
              <span className="text-xs text-muted group-hover:text-[var(--color-primary)] transition-colors ml-2 font-mono">
                ({product.sku})
              </span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

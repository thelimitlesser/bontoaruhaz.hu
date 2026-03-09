import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, HelpCircle, Star, Info, Globe, Calendar, CheckCircle2, Factory, Hash, Settings, Phone, Mail, ChevronRight, Clock, AlertCircle, Share2, Heart, Scale, Box } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { CompatibilityTable } from "@/components/compatibility-table";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { prisma } from "@/lib/prisma";
import { getBrandById, getModelById, getCategoryById, getSubcategoryById, getPartItemById, getBrandBySlug, getModelBySlug, categories, partsSubcategories, partItems } from "@/lib/vehicle-data";
import { Product } from "@/lib/mock-data";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const dbPart = await prisma.part.findUnique({
    where: { id },
    include: {
      compatibilities: true
    }
  });

  if (!dbPart) {
    notFound();
  }

  const brandObj = dbPart.brandId ? getBrandById(dbPart.brandId) : null;
  const modelObj = dbPart.modelId ? getModelById(dbPart.modelId) : null;
  const categoryObj = dbPart.categoryId ? getCategoryById(dbPart.categoryId) : null;
  const subcategoryObj = dbPart.subcategoryId ? getSubcategoryById(dbPart.subcategoryId) : null;

  const partItemObj = dbPart.partItemId ? getPartItemById(dbPart.partItemId) : null;

  const brandName = brandObj?.name || (dbPart.brandId ? getBrandBySlug(dbPart.brandId)?.name : null) || dbPart.brandId || "Ismeretlen";
  const modelName = modelObj?.name || (dbPart.modelId ? getModelBySlug(dbPart.modelId)?.name : null) || dbPart.modelId || "Ismeretlen";
  const categoryName = categoryObj?.name || dbPart.categoryId || null;
  const subcategoryName = subcategoryObj?.name || dbPart.subcategoryId || null;
  const partItemName = partItemObj?.name || dbPart.partItemId || null;

  const brandSlug = brandObj?.slug || dbPart.brandId;
  const modelSlug = modelObj?.slug || dbPart.modelId;
  const categorySlug = categoryObj?.slug || dbPart.categoryId;
  const subcategorySlug = subcategoryObj?.slug || dbPart.subcategoryId;
  const partItemSlug = partItemObj?.slug || dbPart.partItemId;

  const conditionMap: Record<string, "Új" | "Használt" | "Felújított"> = { "NEW": "Új", "USED": "Használt", "REFURBISHED": "Felújított" };

  const images = (dbPart.images || "").split(",").filter(img => img.length > 0);
  const mainImage = images.length > 0 ? images[0] : "/placeholder.png";

  const product: Product = {
    id: dbPart.id,
    name: dbPart.name,
    price: dbPart.priceGross,
    currency: dbPart.currency,
    image: mainImage,
    condition: conditionMap[dbPart.condition] || "Ismeretlen",
    brand: brandName,
    model: modelName,
    sku: dbPart.sku,
    quantity: dbPart.stock,
    shippingPrice: dbPart.shippingPrice,
    weight: dbPart.weight,
    length: dbPart.length,
    width: dbPart.width,
    height: dbPart.height,
  };

  const galleryImages = images.length > 0 ? images : [mainImage];

  // Format year string
  let yearString = "";
  if (dbPart.yearFrom && dbPart.yearTo) {
    yearString = `${dbPart.yearFrom} - ${dbPart.yearTo}`;
  } else if (dbPart.yearFrom) {
    yearString = `${dbPart.yearFrom}-től`;
  } else if (dbPart.yearTo) {
    yearString = `${dbPart.yearTo}-ig`;
  }

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 relative z-0 bg-background" style={{ paddingTop: '100px' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm font-medium text-muted overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link href="/" className="hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-2 shrink-0">
            <ArrowLeft className="w-4 h-4" /> Vissza
          </Link>
          <span className="mx-3 border-r h-4 border-border shrink-0"></span>
          {brandSlug ? (
            <Link href={`/brand/${brandSlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
              {product.brand}
            </Link>
          ) : (
            <span className="shrink-0">{product.brand}</span>
          )}
          {modelSlug && (
            <>
              <span className="mx-2 text-border shrink-0">/</span>
              <Link href={`/brand/${brandSlug}/${modelSlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
                {product.model}
              </Link>
            </>
          )}
          {categorySlug && categoryName && (
            <>
              <span className="mx-2 text-border shrink-0">/</span>
              <Link href={`/brand/${brandSlug}/${modelSlug}/${categorySlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
                {categoryName}
              </Link>
            </>
          )}
          {subcategorySlug && subcategoryName && (
            <>
              <span className="mx-2 text-border shrink-0">/</span>
              <Link href={`/brand/${brandSlug}/${modelSlug}/${categorySlug}?subcat=${subcategorySlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
                {subcategoryName}
              </Link>
            </>
          )}
          {partItemSlug && partItemName && (
            <>
              <span className="mx-2 text-border shrink-0">/</span>
              <Link href={`/brand/${brandSlug}/${modelSlug}/${categorySlug}?subcat=${subcategorySlug}&item=${partItemSlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
                {partItemName}
              </Link>
            </>
          )}
        </nav>

        {/* Title Area - Moved out of the Left Column for alignment */}
        <div className="space-y-4 pt-2">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
            {product.name}
          </h1>

        </div>

        {/* Two Column Layout: Main Content (Left) & Sticky Buy Box (Right) */}
        <div className="flex flex-col lg:flex-row gap-10 items-start pt-2">

          {/* LEFT (MAIN CONTENT - 65%) */}
          <div className="w-full lg:w-[60%] xl:w-[65%] space-y-8 min-w-0">

            {/* Product Gallery Component */}
            <div>
              <ProductGallery images={galleryImages} productName={product.name} />
            </div>

            {/* 3. Specifications & Details (Accordion style look) */}
            <div className="bg-foreground/[0.02] border border-border rounded-3xl overflow-hidden shadow-sm">

              {/* Identification Info */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[var(--color-primary)]" />
                    Alapadatok
                  </h3>

                  {/* Badges removed from here, integrated into grid below */}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {/* Condition (Állapot) block */}
                  <div className="p-3 sm:p-4 bg-background rounded-2xl border border-border flex items-start gap-2 sm:gap-3">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-muted mt-0.5" />
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-wider font-bold">Állapot</div>
                      <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5">{product.condition || "Ismeretlen"}</div>
                    </div>
                  </div>

                  {/* Year / Universal block */}
                  <div className="p-3 sm:p-4 bg-background rounded-2xl border border-border flex items-start gap-2 sm:gap-3">
                    {dbPart?.isUniversal ? <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-muted mt-0.5" /> : <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted mt-0.5" />}
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-wider font-bold">{dbPart?.isUniversal ? "Típus" : "Évjárat"}</div>
                      <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5">
                        {dbPart?.isUniversal ? "Univerzális" : (yearString || "-")}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-background rounded-2xl border border-border flex items-start gap-2 sm:gap-3">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-muted mt-0.5" />
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-wider font-bold">Hivatkozási szám</div>
                      <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5">{dbPart?.productCode || "-"}</div>
                    </div>
                  </div>
                  {product.sku && (
                    <div className="p-3 sm:p-4 bg-background rounded-2xl border border-border flex items-start gap-2 sm:gap-3">
                      <Factory className="w-4 h-4 sm:w-5 sm:h-5 text-muted mt-0.5" />
                      <div>
                        <div className="text-[10px] text-muted uppercase tracking-wider font-bold">Gyári Cikkszám</div>
                        <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5 truncate max-w-[80px] sm:max-w-none">{product.sku}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-border w-full" />

              {/* Description */}
              {dbPart.description && (
                <>
                  <div className="p-6 md:p-8 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Info className="w-5 h-5 text-[var(--color-primary)]" />
                      Termékleírás
                    </h3>
                    <div className="text-muted leading-relaxed max-w-none prose">
                      {dbPart.description.split('\\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-border w-full" />
                </>
              )}

              {/* Compatibility Area */}
              <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8 md:pt-4 bg-foreground/[0.01]">
                <CompatibilityTable
                  brand={product.brand}
                  model={product.model}
                  yearFrom={dbPart?.yearFrom}
                  yearTo={dbPart?.yearTo}
                  isUniversal={dbPart?.isUniversal}
                  extraCompatibilities={dbPart?.compatibilities || []}
                />
              </div>
            </div>

          </div>


          {/* RIGHT (STICKY BUY BOX - 35%) */}
          <div className="w-full lg:w-[40%] xl:w-[35%] relative">
            <div className="sticky top-32 space-y-6">

              {/* Main Buy Box */}
              <div className="bg-background border-2 border-border rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Price Block */}
                  <div>
                    <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-1">Vételár</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                        {product.price.toLocaleString('hu-HU')}
                      </span>
                      <span className="text-xl font-bold text-muted">Ft</span>
                    </div>
                  </div>

                  {/* Shipping Info Block */}
                  {product.shippingPrice && (
                    <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-muted uppercase font-bold tracking-wider">Várható szállítási díj</div>
                          <div className="text-lg font-black text-foreground">{product.shippingPrice.toLocaleString('hu-HU')} Ft</div>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block text-[10px] text-muted italic">
                        Pannon XP futárszolgálattal
                      </div>
                    </div>
                  )}

                  {/* Dimensions Badge (Optional Tooltip/Info) */}
                  {(product.weight || (product.length && product.width && product.height)) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {product.weight && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-600">
                          <Scale className="w-3 h-3" />
                          {product.weight} kg
                        </div>
                      )}
                      {product.length && product.width && product.height && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-600">
                          <Box className="w-3 h-3" />
                          {product.length}×{product.width}×{product.height} cm
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-2 text-xs sm:text-sm text-emerald-600 font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Raktárról azonnal szállítjuk
                  </div>
                </div>

                <div className="h-px bg-border w-full my-6" />

                {/* Stock & Buy Button */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-muted">Készleten:</span>
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="relative flex h-3 w-3">
                        {product.quantity > 0 ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        )}
                      </span>
                      {product.quantity} darab
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <AddToCartButton product={product} />
                    <Link href="/checkout" className="w-full h-16 bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white font-bold text-base xl:text-lg rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-slate-900/20">
                      PÉNZTÁRHOZ
                    </Link>

                    {/* Guarantee Badge moved here */}
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="w-5 h-5" /> 14 Nap Pénzvisszafizetési Garancia
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

      </div>

      {/* New Full-Width Inquiry Section - Refined Compact Version */}
      <div className="mt-8 mb-12">
        <div className="glass-panel rounded-[2rem] p-6 md:p-10 border-2 border-[var(--color-primary)]/20 relative overflow-hidden group max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              ÜGYFÉLSZOLGÁLAT
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
              Kérdésed van az alkatrésszel kapcsolatban?
            </h2>
            <p className="text-base text-muted leading-relaxed max-w-2xl mb-8">
              <span className="font-bold text-foreground">Kérjük, hivatkozzon a termék hivatkozási számára!</span>
            </p>

            <div className="flex justify-center w-full">
              <a
                href="tel:+36301234567" className="flex items-center justify-center gap-2.5 px-10 py-4 bg-[var(--color-primary)] text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[var(--color-primary)]/20" >
                <Phone className="w-5 h-5" />
                +36 30 123 4567
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

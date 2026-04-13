export const dynamic = "force-dynamic";
import { getRelatedProducts, getProductPageDataAction, getProductMetadataAction } from "@/app/actions/product";
import { extractIdFromSlug, getProductSlug, getProductUrl } from "@/utils/slug";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck, Star, Settings, Calendar, Hash, Factory, Info, Phone, HelpCircle, Globe, ChevronRight, Box } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { CompatibilityWrapper } from "@/components/compatibility-wrapper";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Product } from "@/lib/mock-data";
import { RelatedProductsWrapper } from "@/components/related-products-wrapper";
import { clsx } from "clsx";



export async function generateMetadata({ params }: { params: Promise<{ slug_id: string }> }): Promise<import("next").Metadata> {
  try {
    const { slug_id } = await params;
    const id = extractIdFromSlug(slug_id);
    const data = await getProductMetadataAction(id);
    if (!data) {
      return { 
        title: "Termék nem található | Bontóáruház",
        description: "A keresett alkatrész jelenleg nem elérhető. Böngésszen tovább több ezer minőségi bontott autóalkatrészünk között."
      };
    }

    const { dbPart, brandName, modelName } = data;
    
    // SEO-ready title with powerful keywords
    const title = `Gyári Bontott ${brandName} ${modelName} ${dbPart.name} - Garanciával | Bontóáruház`;
    const description = dbPart.description 
      ? dbPart.description.slice(0, 155) + "..." 
      : `Minőségi, bevizsgált gyári bontott ${brandName} ${modelName} ${dbPart.name} alkatrész garanciával és gyors országos kiszállítással a Bontóáruházban.`;

    const images = (dbPart.images || "").split(",").filter(img => img.length > 0);
    const mainImage = images.length > 0 ? images[0] : "https://bontoaruhaz.hu/logo_orange.png";

    return {
      title,
      description,
      keywords: [`${brandName} ${modelName} alkatrész`, `${dbPart.name} ára`, "bontott autóalkatrész", "gyári alkatrész", "autóbontó online"],
      openGraph: {
        title,
        description,
        images: [mainImage],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [mainImage],
      }
    };
  } catch (error) {
    console.error("Product SEO Error:", error);
    return {
      title: "Gyári Bontott Autóalkatrész Garanciával | Bontóáruház",
      description: "Válogasson minőségi, bevizsgált bontott autóalkatrészek közül garanciával. Gyors szállítás Seregélyesről az ország egész területére."
    };
  }
}


export default async function ProductPage({ params }: { params: Promise<{ slug_id: string }> }) {
  const { slug_id } = await params;
  const id = extractIdFromSlug(slug_id);

  const data = await getProductPageDataAction(id);

  if (!data) {
    notFound();
  }

  const { dbPart, brandObj, modelObj, categoryObj, subcategoryObj, partItemObj } = data;

  const brandName = brandObj?.name || dbPart.brandId || "Ismeretlen";
  const modelName = modelObj?.name || dbPart.modelId || "Ismeretlen";
  const categoryName = categoryObj?.name || dbPart.categoryId || null;
  const subcategoryName = subcategoryObj?.name || dbPart.subcategoryId || null;
  const partItemName = partItemObj?.name || dbPart.partItemId || null;

  const brandSlug = brandObj?.slug || dbPart.brandId;
  const modelSlug = modelObj?.slug || dbPart.modelId;
  const categorySlug = categoryObj?.slug || dbPart.categoryId;
  const subcategorySlug = subcategoryObj?.slug || dbPart.subcategoryId;
  const partItemSlug = partItemObj?.slug || dbPart.partItemId;

  // Canonical Redirect Logic
  const canonicalSlug = getProductSlug(dbPart.name, brandName, modelName, dbPart.sku);
  const canonicalSlugId = `${canonicalSlug}-${dbPart.id}`;
  
  if (slug_id !== canonicalSlugId) {
    redirect(`/product/${canonicalSlugId}`);
  }


  const normalizedCondition = (dbPart.condition || "USED").toUpperCase();
  const conditionMap: Record<string, string> = { 
    "NEW": "Új", 
    "USED": "Használt", 
    "REFURBISHED": "Felújított",
    "ÚJ": "Új",
    "HASZNÁLT": "Használt",
    "FELÚJÍTOTT": "Felújított"
  };

  const images = (dbPart.images || "").split(",").filter(img => img.length > 0);
  const mainImage = images.length > 0 ? images[0] : "/placeholder.png";

  const product: Product = {
    id: dbPart.id,
    name: dbPart.name,
    price: dbPart.priceGross,
    currency: dbPart.currency,
    image: mainImage,
    condition: (conditionMap[normalizedCondition] || "Ismeretlen") as any,
    brand: brandName,
    model: modelName,
    sku: dbPart.sku || "",
    quantity: dbPart.stock - (dbPart.reservations?.length || 0),
    shippingPrice: (dbPart as any).shippingPrice,
    weight: (dbPart as any).weight,
    length: (dbPart as any).length,
    width: (dbPart as any).width,
    height: (dbPart as any).height,
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Főoldal",
        "item": "https://bontoaruhaz.hu"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": brandName,
        "item": `https://bontoaruhaz.hu/brand/${brandSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": modelName,
        "item": `https://bontoaruhaz.hu/brand/${brandSlug}/${modelSlug}`
      },
      ...(categoryName ? [{
        "@type": "ListItem",
        "position": 4,
        "name": categoryName,
        "item": `https://bontoaruhaz.hu/brand/${brandSlug}/${modelSlug}/${categorySlug}`
      }] : [])
    ]
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${brandName} ${modelName} ${dbPart.name} ${yearString}`,
    "image": images.length > 0 ? images : [mainImage],
    "description": dbPart.description || `Bontott ${brandName} ${modelName} alkatrész.`,
    "sku": dbPart.sku,
    "mpn": dbPart.productCode,
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    "offers": {
      "@type": "Offer",
      "url": `https://bontoaruhaz.hu/product/${canonicalSlugId}`,
      "priceCurrency": dbPart.currency || "HUF",
      "price": dbPart.priceGross,
      "availability": dbPart.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": (dbPart.condition === "NEW" || dbPart.condition === "ÚJ") ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": (dbPart as any).shippingPrice || 2500,
          "currency": "HUF"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "HU",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility"
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 relative bg-background overflow-x-hidden w-full max-w-[100vw] flex flex-col" style={{ paddingTop: '100px' }}>
      <main className="flex-1 min-h-[800px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto space-y-6 w-full overflow-x-hidden">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm font-medium text-gray-600 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link href="/" className="hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-2 shrink-0 py-1 -ml-1 rounded-lg">
            <ArrowLeft className="w-5 h-5" /> <span className="text-base sm:text-sm">Vissza</span>
          </Link>
          <span className="mx-3 border-r h-4 border-gray-300 shrink-0"></span>
          {brandSlug ? (
            <Link href={`/brand/${brandSlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
              {product.brand}
            </Link>
          ) : (
            <span className="shrink-0">{product.brand}</span>
          )}
          {modelSlug && (
            <>
              <span className="mx-2 text-gray-300 shrink-0">/</span>
              <Link href={`/brand/${brandSlug}/${modelSlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
                {product.model}
              </Link>
            </>
          )}
          {categorySlug && categoryName && (
            <>
              <span className="mx-2 text-gray-300 shrink-0">/</span>
              <Link href={`/brand/${brandSlug}/${modelSlug}/${categorySlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
                {categoryName}
              </Link>
            </>
          )}
          {subcategorySlug && subcategoryName && (
            <>
              <span className="mx-2 text-gray-300 shrink-0">/</span>
              <Link href={`/brand/${brandSlug}/${modelSlug}/${categorySlug}/${subcategorySlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
                {subcategoryName}
              </Link>
            </>
          )}
          {partItemSlug && partItemName && (
            <>
              <span className="mx-2 text-gray-300 shrink-0">/</span>
              <Link href={`/brand/${brandSlug}/${modelSlug}/${categorySlug}/${subcategorySlug}/${partItemSlug}`} className="hover:text-[var(--color-primary)] transition-colors shrink-0">
                {partItemName}
              </Link>
            </>
          )}
        </nav>

        {/* Title Area - Moved out of the Left Column for alignment */}
        <div className="space-y-4 pt-2">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight break-words">
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
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Állapot</div>
                      <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5">{product.condition || "Ismeretlen"}</div>
                    </div>
                  </div>

                  {/* Year / Universal block */}
                  <div className="p-3 sm:p-4 bg-background rounded-2xl border border-border flex items-start gap-2 sm:gap-3">
                    {dbPart?.isUniversal ? <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5" /> : <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5" />}
                    <div>
                      <div className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">{dbPart?.isUniversal ? "Típus" : "Évjárat"}</div>
                      <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5">
                        {dbPart?.isUniversal ? "Univerzális" : (yearString || "-")}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-background rounded-2xl border border-border flex items-start gap-2 sm:gap-3">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Hivatkozási szám</div>
                      <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5">{dbPart?.productCode || "-"}</div>
                    </div>
                  </div>
                  {product.sku && (
                    <div className="p-3 sm:p-4 bg-background rounded-2xl border border-border flex items-start gap-2 sm:gap-3">
                      <Factory className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Gyári Cikkszám</div>
                        <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5 truncate max-w-[80px] sm:max-w-none">{product.sku}</div>
                      </div>
                    </div>
                  )}
                  {dbPart.engineCode && (
                    <div className="p-3 sm:p-4 bg-background rounded-2xl border border-border flex items-start gap-2 sm:gap-3">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Motorkód</div>
                        <div className="font-mono text-sm sm:text-lg font-bold text-foreground mt-0.5">{dbPart.engineCode}</div>
                      </div>
                    </div>
                  )}

                  {/* Dimensions Box Hidden from customers as per request */}
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
                    <div className="text-foreground leading-relaxed max-w-none prose prose-p:text-foreground">
                    {/* First line is the header, make it bold and stand out */}
                    {dbPart.description && dbPart.description.split('\n').map((line, i) => (
                      <p 
                        key={i} 
                        className={i === 0 ? "font-bold mb-6 text-lg uppercase tracking-tight" : "mb-2 text-foreground"}
                      >
                        {line.replace(/\\n/g, '\n')}
                      </p>
                    ))}

                    {/* Meta-info icons below the text */}
                    <div className="mt-8 pt-6 border-t border-border space-y-4 text-sm italic">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-foreground/[0.03] rounded-lg">
                          <Truck className="w-4 h-4 text-[var(--color-primary)]" />
                        </div>
                        <p className="text-foreground">Szállítási idő: <span className="font-black">1-3 munkanap.</span></p>
                      </div>
                    </div>
                    </div>
                  </div>
                  <div className="h-px bg-border w-full" />
                </>
              )}

              {/* Compatibility Area */}
              <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8 md:pt-4 bg-foreground/[0.01]">
                <CompatibilityWrapper
                  partId={dbPart.id}
                  brand={product.brand}
                  model={product.model}
                  yearFrom={dbPart?.yearFrom}
                  yearTo={dbPart?.yearTo}
                  isUniversal={dbPart?.isUniversal}
                />
              </div>
            </div>

          </div>


          {/* RIGHT (STICKY BUY BOX - 35%) */}
          <div className="w-full lg:w-[40%] xl:w-[35%] relative">
            <div className="sticky top-32 space-y-6">

              {/* Main Buy Box */}
              <div className="bg-background border-2 border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Price Block */}
                  <div>
                    {dbPart.originalPrice && dbPart.originalPrice > dbPart.priceGross && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-400 line-through font-medium">
                          {dbPart.originalPrice.toLocaleString('hu-HU')} Ft
                        </span>
                        <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
                          -{Math.round(((dbPart.originalPrice - dbPart.priceGross) / dbPart.originalPrice) * 100)}% KEDVEZMÉNY
                        </span>
                      </div>
                    )}
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-1">
                      {dbPart.originalPrice && dbPart.originalPrice > dbPart.priceGross ? 'Akciós Vételár' : 'Vételár'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={clsx(
                        "text-3xl sm:text-5xl font-black tracking-tight",
                        dbPart.originalPrice && dbPart.originalPrice > dbPart.priceGross ? "text-red-600" : "text-foreground"
                      )}>
                        {product.price.toLocaleString('hu-HU')}
                      </span>
                      <span className={clsx(
                        "text-lg sm:text-xl font-bold",
                        dbPart.originalPrice && dbPart.originalPrice > dbPart.priceGross ? "text-red-600/60" : "text-gray-600"
                      )}>Ft</span>
                    </div>
                  </div>




                  <div className="mt-2 text-xs sm:text-sm text-emerald-600 font-bold flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Raktárról azonnal szállítjuk
                  </div>
                </div>

                <div className="h-px bg-border w-full my-6" />

                {/* Stock & Buy Button */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-600">Készleten:</span>
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

      {/* Related Products Section (Streaming) */}
      <RelatedProductsWrapper 
        productId={dbPart.id} 
        modelId={dbPart.modelId} 
        brandId={dbPart.brandId} 
        brandName={brandName}
        modelName={modelName}
        brandSlug={brandSlug || ""}
        modelSlug={modelSlug || ""}
      />

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
                    href="tel:+36706121277"
                    className="flex items-center justify-center gap-2.5 px-10 py-4 bg-[var(--color-primary)] text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[var(--color-primary)]/20"
                  >
                    <Phone className="w-5 h-5" />
                    +36 70 612 1277
                  </a>
                </div>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}

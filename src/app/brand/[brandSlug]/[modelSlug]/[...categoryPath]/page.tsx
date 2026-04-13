export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { CategoryProductsContent } from "@/components/category-products-content";
import { getCategoryPageDataAction } from "@/app/actions/product";
import type { Metadata } from 'next';

export async function generateMetadata({ 
    params,
    searchParams 
}: { 
    params: Promise<{ brandSlug: string; modelSlug: string; categoryPath: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
    try {
        const { brandSlug, modelSlug, categoryPath } = await params;
        const resolvedSearchParams = await searchParams;

        // Extraction logic
        const categorySlug = categoryPath[0];
        const subcatSlugFromPath = categoryPath[1];
        const partItemSlugFromPath = categoryPath[2];
        
        // Use either path or query param (for transition)
        const subcatSlug = subcatSlugFromPath || (resolvedSearchParams.subcat as string | undefined);
        const partItemSlug = partItemSlugFromPath || (resolvedSearchParams.item as string | undefined);

        const [brand, category] = await Promise.all([
            prisma.vehicleBrand.findUnique({ where: { slug: brandSlug } }),
            prisma.partCategory.findUnique({ where: { slug: categorySlug } })
        ]);

        const model = brand 
            ? await prisma.vehicleModel.findFirst({ where: { slug: modelSlug, brandId: brand.id } })
            : null;

        if (!brand || !model || !category) {
            return { 
                title: 'Alkatrészek keresése | Bontóáruház',
                description: 'Válogasson minőségi bontott autóalkatrészeink közül. Keressen márka, modell vagy kategória alapján garanciával.'
            };
        }

        // Try to find subcategory and part item for more specific SEO
        const subcat = subcatSlug 
            ? await prisma.partSubcategory.findFirst({ where: { slug: subcatSlug, categoryId: category.id } })
            : null;
        
        const partItem = (partItemSlug && subcat)
            ? await prisma.partItem.findFirst({ where: { slug: partItemSlug, subcategoryId: subcat.id } })
            : null;

        const mainTerm = partItem?.name || subcat?.name || category.name;
        const title = `Bontott ${brand.name} ${model.name} ${mainTerm} Alkatrészek | Bontóáruház`;
        const description = `Válogass minőségi bontott ${brand.name} ${model.name} ${mainTerm} alkatrészek közül. 14 napos garancia, gyors kiszállítás és megbízható minőség Seregélyesről.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                locale: 'hu_HU',
                images: brand.logo ? [brand.logo] : [],
            }
        };
    } catch (error) {
        console.error("SEO Metadata Error:", error);
        return {
            title: 'Minőségi Bontott Autóalkatrészek | Bontóáruház',
            description: 'Találja meg a tökéletes bontott alkatrészt autójához Seregélyes legnagyobb raktárkészletéből. 14 napos garancia és gyors házhozszállítás minden alkatrészre.'
        };
    }
}

export default async function CategoryProductsPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ brandSlug: string; modelSlug: string; categoryPath: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await params;
    const { brandSlug, modelSlug, categoryPath } = resolvedParams;
    const { searchParams: resolvedSearchParams } = { searchParams: await searchParams };

    const categorySlug = categoryPath[0];
    const subcatSlugFromPath = categoryPath[1];
    const partItemSlugFromPath = categoryPath[2];

    // LEGACY REDIRECTION (SEO Continuity)
    // If someone visits /brand/audi/a6/kijelzo?subcat=muszer&item=ora
    // Redirect to /brand/audi/a6/kijelzo/muszer/ora
    if (resolvedSearchParams.subcat || resolvedSearchParams.item) {
        const s = resolvedSearchParams.subcat as string;
        const i = resolvedSearchParams.item as string;
        
        let newPath = `/brand/${brandSlug}/${modelSlug}/${categorySlug}`;
        if (s) newPath += `/${s}`;
        if (i) newPath += `/${i}`;
        
        // Preserve other filters (year, page, sortBy)
        const newParams = new URLSearchParams();
        if (resolvedSearchParams.year) newParams.set("year", resolvedSearchParams.year as string);
        if (resolvedSearchParams.sortBy) newParams.set("sortBy", resolvedSearchParams.sortBy as string);
        if (resolvedSearchParams.page) newParams.set("page", resolvedSearchParams.page as string);
        
        const queryString = newParams.toString();
        redirect(queryString ? `${newPath}?${queryString}` : newPath);
    }

    const [brand, category] = await Promise.all([
        prisma.vehicleBrand.findUnique({ where: { slug: brandSlug } }),
        prisma.partCategory.findUnique({ where: { slug: categorySlug } })
    ]);

    const model = brand 
        ? await prisma.vehicleModel.findFirst({ where: { slug: modelSlug, brandId: brand.id } })
        : null;

    if (!brand || !model || !category) {
        notFound();
    }

    const subcatSlug = subcatSlugFromPath;
    const partItemSlug = partItemSlugFromPath;
    const yearStr = resolvedSearchParams.year as string | undefined;
    const year = yearStr ? parseInt(yearStr) : null;
    const pageStr = resolvedSearchParams.page as string | undefined;
    const page = pageStr ? Math.max(0, parseInt(pageStr) - 1) : 0; // URL is 1-indexed, DB 0-indexed
    const sortBy = (resolvedSearchParams.sortBy as string) || "newest";

    // Prefetch EVERYTHING on the server!
    const pageData = await getCategoryPageDataAction({
        brandId: brand.id,
        modelId: model.id,
        categoryId: category.id,
        subcatSlug,
        partItemSlug,
        year,
        page,
        sortBy
    });

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <div className="min-h-[800px] flex flex-col">
                <CategoryProductsContent 
                    params={{
                        brandSlug,
                        modelSlug,
                        categoryPath
                    }} 
                    brand={brand}
                    model={model}
                    category={category}
                    initialData={pageData}
                />
            </div>
        </div>
    );
}


import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { CategoryProductsContent } from "@/components/category-products-content";
import { getCategoryPageDataAction } from "@/app/actions/product";

export default async function CategoryProductsPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ brandSlug: string; modelSlug: string; categorySlug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await params;
    const { brandSlug, modelSlug, categorySlug } = resolvedParams;

    const brand = await prisma.vehicleBrand.findUnique({ where: { slug: brandSlug } });
    const model = await prisma.vehicleModel.findFirst({ where: { slug: modelSlug, brandId: brand?.id } });
    const category = await prisma.partCategory.findUnique({ where: { slug: categorySlug } });

    if (!brand || !model || !category) {
        notFound();
    }

    const { searchParams: resolvedSearchParams } = { searchParams: await searchParams };
    const subcatSlug = resolvedSearchParams.subcat as string | undefined;
    const partItemSlug = resolvedSearchParams.item as string | undefined;
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
            <Navbar />
            <CategoryProductsContent 
                params={resolvedParams} 
                brand={brand}
                model={model}
                category={category}
                initialData={pageData}
            />
        </div>
    );
}

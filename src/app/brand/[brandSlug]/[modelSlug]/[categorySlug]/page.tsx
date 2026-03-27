import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { prisma } from "@/lib/prisma";
import { CategoryProductsContent } from "@/components/category-products-content";

export default async function CategoryProductsPage({ params }: { params: Promise<{ brandSlug: string; modelSlug: string; categorySlug: string }> }) {
    const resolvedParams = await params;
    const { brandSlug, modelSlug, categorySlug } = resolvedParams;

    const brand = await prisma.vehicleBrand.findUnique({ where: { slug: brandSlug } });
    const model = await prisma.vehicleModel.findFirst({ where: { slug: modelSlug, brandId: brand?.id } });
    const category = await prisma.partCategory.findUnique({ where: { slug: categorySlug } });

    if (!brand || !model || !category) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
            <Navbar />
            <Suspense fallback={<div className="pt-32 px-8">Loading...</div>}>
                <CategoryProductsContent 
                    params={resolvedParams} 
                    brand={brand}
                    model={model}
                    category={category}
                />
            </Suspense>
        </div>
    );
}

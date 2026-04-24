"use server";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getBrandsAction() {
    return unstable_cache(
        async () => {
            try {
                // To avoid slow Postgres Seq Scans from OR + relation SOME queries,
                // we break it down into direct index scans and combine in JS.
                
                // 1. Get brand IDs from actual parts in stock
                const directBrands = await prisma.part.findMany({
                    where: { stock: { gt: 0 }, brandId: { not: null } },
                    distinct: ['brandId'],
                    select: { brandId: true }
                });
                
                // 2. Get brand IDs from compatibilities of parts in stock
                const compatBrands = await prisma.partCompatibility.findMany({
                    where: { part: { stock: { gt: 0 } } },
                    distinct: ['brandId'],
                    select: { brandId: true }
                });

                const activeBrandIds = new Set([
                    ...directBrands.map(p => p.brandId),
                    ...compatBrands.map(p => p.brandId)
                ].filter(Boolean) as string[]);

                if (activeBrandIds.size === 0) return [];

                const activeBrands = await prisma.vehicleBrand.findMany({
                    where: { 
                        id: { in: Array.from(activeBrandIds) },
                        hidden: false 
                    },
                    select: { id: true, name: true, slug: true, logo: true },
                    orderBy: { name: 'asc' }
                });
                
                return activeBrands;
            } catch (error) {
                console.error("CRITICAL: getBrandsAction failed in production environment:", error);
                return []; 
            }
        },
        ['getBrandsAction-cache-v3'],
        { revalidate: 3600, tags: ['vehicle-brands'] }
    )();
}

export async function getModelsByBrandAction(brandId: string) {
    if (!brandId) return [];
    
    return unstable_cache(
        async () => {
            try {
                // 1. Models from direct parts
                const directModels = await prisma.part.findMany({
                    where: { brandId: brandId, stock: { gt: 0 }, modelId: { not: null } },
                    distinct: ['modelId'],
                    select: { modelId: true }
                });

                // 2. Models from compatibilities
                const compatModels = await prisma.partCompatibility.findMany({
                    where: { brandId: brandId, part: { stock: { gt: 0 } } },
                    distinct: ['modelId'],
                    select: { modelId: true }
                });

                const activeModelIds = new Set([
                    ...directModels.map(p => p.modelId),
                    ...compatModels.map(p => p.modelId)
                ].filter(Boolean) as string[]);

                if (activeModelIds.size === 0) return [];

                const activeModels = await prisma.vehicleModel.findMany({
                    where: { 
                        id: { in: Array.from(activeModelIds) } 
                    },
                    select: { 
                        id: true, 
                        name: true, 
                        slug: true,
                        series: true 
                    },
                    orderBy: { name: 'asc' }
                });

                return activeModels;
            } catch (error) {
                console.error(`ERROR: getModelsByBrandAction failed for brandId ${brandId} in Vercel environment:`, error);
                return [];
            }
        },
        [`getModelsByBrandAction-cache-v3-${brandId}`],
        { revalidate: 3600, tags: [`vehicle-models-${brandId}`] }
    )();
}

export async function getActivePartOptionsAction(brandId?: string, modelId?: string) {
    return unstable_cache(
        async () => {
            try {
                let parts: { partItemId: string | null }[] = [];
                
                if (brandId || modelId) {
                    const directParts = await prisma.part.findMany({
                        where: {
                            stock: { gt: 0 },
                            partItemId: { not: null },
                            brandId: brandId || undefined,
                            modelId: modelId || undefined
                        },
                        distinct: ['partItemId'],
                        select: { partItemId: true }
                    });

                    const compatParts = await prisma.partCompatibility.findMany({
                        where: {
                            brandId: brandId || undefined,
                            modelId: modelId || undefined,
                            part: { stock: { gt: 0 }, partItemId: { not: null } }
                        },
                        select: { part: { select: { partItemId: true } } }
                    });

                    parts = [
                        ...directParts,
                        ...compatParts.map(pc => pc.part)
                    ];
                } else {
                    parts = await prisma.part.findMany({
                        where: { stock: { gt: 0 }, partItemId: { not: null } },
                        distinct: ['partItemId'],
                        select: { partItemId: true }
                    });
                }

                const activePartItemIds = Array.from(new Set(parts.map(p => p.partItemId).filter(Boolean) as string[]));

                if (activePartItemIds.length === 0) return [];

                const activePartItems = await prisma.partItem.findMany({
                    where: {
                        id: { in: activePartItemIds }
                    },
                    include: {
                        PartSubcategory: {
                            include: {
                                PartCategory: true
                            }
                        }
                    },
                    orderBy: { name: 'asc' }
                });

                return activePartItems.map(item => {
                    const combinedKeywords = [
                        ...(item.keywords || []),
                        ...(item.PartSubcategory?.keywords || []),
                        ...(item.PartSubcategory?.PartCategory?.keywords || []),
                        item.PartSubcategory?.name,
                        item.PartSubcategory?.PartCategory?.name
                    ].filter((k, i, self) => k && self.indexOf(k) === i); 

                    return {
                        value: item.id,
                        label: item.name,
                        group: item.PartSubcategory.PartCategory.name || "Egyéb",
                        slug: item.slug,
                        subcatSlug: item.PartSubcategory.slug,
                        categorySlug: item.PartSubcategory.PartCategory.slug,
                        keywords: combinedKeywords
                    };
                });
            } catch (error) {
                console.error("ERROR: getActivePartOptionsAction failed.", error);
                return [];
            }
        },
        [`getActivePartOptionsAction-cache-v3-${brandId || 'all'}-${modelId || 'all'}`],
        { revalidate: 3600, tags: ['vehicle-part-options'] }
    )();
}

export async function getActiveCategoriesForModelAction(brandId: string, modelId: string) {
    return unstable_cache(
        async () => {
            try {
                const allCategories = await prisma.partCategory.findMany({
                    orderBy: { name: 'asc' },
                    select: { id: true, name: true, slug: true, iconName: true }
                });

                // Split OR query for index performance
                const directCategories = await prisma.part.findMany({
                    where: { stock: { gt: 0 }, brandId, modelId, categoryId: { not: null } },
                    distinct: ['categoryId'],
                    select: { categoryId: true }
                });

                const compatCategories = await prisma.partCompatibility.findMany({
                    where: { brandId, modelId, part: { stock: { gt: 0 }, categoryId: { not: null } } },
                    select: { part: { select: { categoryId: true } } }
                });

                const activeIds = new Set([
                    ...directCategories.map(c => c.categoryId),
                    ...compatCategories.map(c => c.part.categoryId)
                ].filter(Boolean) as string[]);

                let sortedCategories = allCategories.sort((a, b) => a.name.localeCompare(b.name, 'hu'));
                const filteredCategories = sortedCategories.filter(cat => activeIds.has(cat.id));
                
                return filteredCategories.map(cat => ({
                    ...cat,
                    hasProducts: true
                }));
            } catch (error) {
                console.error("ERROR: getActiveCategoriesForModelAction failed:", error);
                return [];
            }
        },
        [`getActiveCategoriesForModelAction-cache-v3-${brandId}-${modelId}`],
        { revalidate: 3600, tags: [`vehicle-categories-${brandId}-${modelId}`] }
    )();
}

export async function getActiveSubcategoriesForModelAction(brandId: string, modelId: string, categoryId: string) {
    return unstable_cache(
        async () => {
            try {
                const directSubcats = await prisma.part.findMany({
                    where: { stock: { gt: 0 }, brandId, modelId, categoryId, subcategoryId: { not: null } },
                    distinct: ['subcategoryId'],
                    select: { subcategoryId: true }
                });

                const compatSubcats = await prisma.partCompatibility.findMany({
                    where: { brandId, modelId, part: { stock: { gt: 0 }, categoryId, subcategoryId: { not: null } } },
                    select: { part: { select: { subcategoryId: true } } }
                });

                const activeIds = new Set([
                    ...directSubcats.map(s => s.subcategoryId),
                    ...compatSubcats.map(s => s.part.subcategoryId)
                ].filter(Boolean) as string[]);

                if (activeIds.size === 0) return [];

                const activeSubcats = await prisma.partSubcategory.findMany({
                    where: { id: { in: Array.from(activeIds) } },
                    select: { id: true, name: true, slug: true },
                    orderBy: { name: 'asc' }
                });

                return activeSubcats;
            } catch (error) {
                console.error("ERROR: getActiveSubcategoriesForModelAction failed:", error);
                return [];
            }
        },
        [`getActiveSubcategoriesForModelAction-cache-v3-${brandId}-${modelId}-${categoryId}`],
        { revalidate: 3600, tags: [`vehicle-subcategories-${brandId}-${modelId}-${categoryId}`] }
    )();
}

export async function getActivePartItemsForModelAction(brandId: string, modelId: string, subcategoryId: string) {
    return unstable_cache(
        async () => {
            try {
                const directItems = await prisma.part.findMany({
                    where: { stock: { gt: 0 }, brandId, modelId, subcategoryId, partItemId: { not: null } },
                    distinct: ['partItemId'],
                    select: { partItemId: true }
                });

                const compatItems = await prisma.partCompatibility.findMany({
                    where: { brandId, modelId, part: { stock: { gt: 0 }, subcategoryId, partItemId: { not: null } } },
                    select: { part: { select: { partItemId: true } } }
                });

                const activeIds = new Set([
                    ...directItems.map(i => i.partItemId),
                    ...compatItems.map(i => i.part.partItemId)
                ].filter(Boolean) as string[]);

                if (activeIds.size === 0) return [];

                const activeItems = await prisma.partItem.findMany({
                    where: { id: { in: Array.from(activeIds) } },
                    select: { id: true, name: true, slug: true },
                    orderBy: { name: 'asc' }
                });

                return activeItems;
            } catch (error) {
                console.error("ERROR: getActivePartItemsForModelAction failed:", error);
                return [];
            }
        },
        [`getActivePartItemsForModelAction-cache-v3-${brandId}-${modelId}-${subcategoryId}`],
        { revalidate: 3600, tags: [`vehicle-partitems-${brandId}-${modelId}-${subcategoryId}`] }
    )();
}

export async function getVehicleSelectorDataAction() {
    try {
        const brands = await getBrandsAction();
        return { brands, modelsMap: {} };
    } catch (error) {
        console.error("ERROR: getVehicleSelectorDataAction failed:", error);
        return { brands: [], modelsMap: {} };
    }
}

"use server";

import { prisma } from "@/lib/prisma";

import { unstable_cache } from "next/cache";

export const getBrandsAction = unstable_cache(
    async () => {
        // Only return brands that have at least one product with stock > 0
        const activeBrands = await prisma.vehicleBrand.findMany({
            where: {
                hidden: false,
                OR: [
                    {
                        Part: {
                            some: { stock: { gt: 0 } }
                        }
                    },
                    {
                        VehicleModel: {
                            some: {
                                PartCompatibility: {
                                    some: {
                                        part: { stock: { gt: 0 } }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            select: { id: true, name: true, slug: true, logo: true }
        });
        
        return activeBrands;
    },
    ["brands-list"],
    { revalidate: 3600, tags: ["brands"] }
);

export const getModelsByBrandAction = unstable_cache(
    async (brandId: string) => {
        if (!brandId) return [];
        
        const activeModels = await prisma.vehicleModel.findMany({
            where: {
                brandId: brandId,
                OR: [
                    {
                        Part: {
                            some: { stock: { gt: 0 } }
                        }
                    },
                    {
                        PartCompatibility: {
                            some: {
                                part: { stock: { gt: 0 } }
                            }
                        }
                    }
                ]
            },
            select: { 
                id: true, 
                name: true, 
                slug: true,
                series: true 
            }
        });

        return activeModels;
    },
    ["models-by-brand"],
    { revalidate: 3600, tags: ["models"] }
);

export const getActivePartOptionsAction = unstable_cache(
    async (brandId?: string, modelId?: string) => {
        const activePartItems = await prisma.partItem.findMany({
            where: {
                Part: {
                    some: {
                        stock: { gt: 0 },
                        AND: [
                            brandId ? {
                                OR: [
                                    { brandId: brandId },
                                    { compatibilities: { some: { brandId: brandId } } }
                                ]
                            } : {},
                            modelId ? {
                                OR: [
                                    { modelId: modelId },
                                    { compatibilities: { some: { modelId: modelId } } }
                                ]
                            } : {}
                        ]
                    }
                }
            },
            include: {
                PartSubcategory: {
                    include: {
                        PartCategory: true
                    }
                }
            }
        });

        return activePartItems.map(item => ({
            value: item.id,
            label: item.name,
            group: item.PartSubcategory.PartCategory.name || "Egyéb",
            slug: item.slug,
            subcatSlug: item.PartSubcategory.slug,
            categorySlug: item.PartSubcategory.PartCategory.slug
        }));
    },
    ["active-part-options"],
    { revalidate: 3600, tags: ["automotive", "parts"] }
);

export const getActiveCategoriesForModelAction = unstable_cache(
    async (brandId: string, modelId: string) => {
        // 1. Fetch all categories
        const allCategories = await prisma.partCategory.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, iconName: true }
        });

        // 2. Fetch IDs of categories that HAVE products for this model (including compatibility)
        const activeCategories = await prisma.part.findMany({
            where: {
                stock: { gt: 0 },
                OR: [
                    { brandId: brandId, modelId: modelId },
                    { compatibilities: { some: { brandId: brandId, modelId: modelId } } }
                ]
            },
            distinct: ['categoryId'],
            select: { categoryId: true }
        });

        const activeIds = new Set(activeCategories.map(c => c.categoryId).filter(Boolean) as string[]);

        // 3. Initial alphabetical sort
        let sortedCategories = allCategories.sort((a, b) => a.name.localeCompare(b.name, 'hu'));
        
        // 4. Filter to only show categories with products
        const filteredCategories = sortedCategories.filter(cat => activeIds.has(cat.id));
        
        return filteredCategories.map(cat => ({
            ...cat,
            hasProducts: true
        }));
    },
    ["active-categories-for-model"],
    { revalidate: 3600, tags: ["automotive", "categories"] }
);

export const getActiveSubcategoriesForModelAction = unstable_cache(
    async (brandId: string, modelId: string, categoryId: string) => {
        const activeSubcats = await prisma.partSubcategory.findMany({
            where: {
                Part: {
                    some: {
                        stock: { gt: 0 },
                        categoryId: categoryId,
                        OR: [
                            { brandId: brandId, modelId: modelId },
                            { compatibilities: { some: { brandId: brandId, modelId: modelId } } }
                        ]
                    }
                }
            },
            select: { id: true, name: true, slug: true }
        });
        return activeSubcats;
    },
    ["active-subcategories-for-model"],
    { revalidate: 3600, tags: ["automotive", "categories"] }
);

export const getActivePartItemsForModelAction = unstable_cache(
    async (brandId: string, modelId: string, subcategoryId: string) => {
        const activeItems = await prisma.partItem.findMany({
            where: {
                Part: {
                    some: {
                        stock: { gt: 0 },
                        subcategoryId: subcategoryId,
                        OR: [
                            { brandId: brandId, modelId: modelId },
                            { compatibilities: { some: { brandId: brandId, modelId: modelId } } }
                        ]
                    }
                }
            },
            select: { id: true, name: true, slug: true }
        });
        return activeItems;
    },
    ["active-items-for-model"],
    { revalidate: 3600, tags: ["automotive", "parts"] }
);

export const getVehicleSelectorDataAction = unstable_cache(
    async () => {
        const brands = await getBrandsAction();
        // Parallel fetch models for all brands to pre-warm the cache
        const modelsPromises = brands.map(brand => getModelsByBrandAction(brand.id));
        const allModels = await Promise.all(modelsPromises);
        
        const modelsMap: Record<string, any[]> = {};
        brands.forEach((brand, index) => {
            modelsMap[brand.id] = allModels[index];
        });

        return {
            brands,
            modelsMap
        };
    },
    ["vehicle-selector-bootstrap"],
    { revalidate: 3600, tags: ["automotive"] }
);

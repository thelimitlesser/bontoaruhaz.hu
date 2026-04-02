"use server";

import { prisma } from "@/lib/prisma";

export async function getBrandsAction() {
    try {
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
    } catch (error) {
        console.error("CRITICAL: getBrandsAction failed in production environment:", error);
        return []; // Return empty array instead of crashing the whole page
    }
}

export async function getModelsByBrandAction(brandId: string) {
    if (!brandId) return [];
    
    try {
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
    } catch (error) {
        console.error(`ERROR: getModelsByBrandAction failed for brandId ${brandId} in Vercel environment:`, error);
        return [];
    }
}

export async function getActivePartOptionsAction(brandId?: string, modelId?: string) {
    try {
        // Step 1: Find all distinct PartItem IDs associated with active parts for this brand/model
        const parts = await prisma.part.findMany({
            where: {
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
            },
            distinct: ['partItemId'],
            select: { partItemId: true }
        });

        const activePartItemIds = parts.map(p => p.partItemId).filter(Boolean) as string[];

        if (activePartItemIds.length === 0) return [];

        // Step 2: Fetch the actual PartItem details
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

        return activePartItems.map(item => ({
            value: item.id,
            label: item.name,
            group: item.PartSubcategory.PartCategory.name || "Egyéb",
            slug: item.slug,
            subcatSlug: item.PartSubcategory.slug,
            categorySlug: item.PartSubcategory.PartCategory.slug
        }));
    } catch (error) {
        console.error("ERROR: getActivePartOptionsAction failed. Database unreachable from Vercel runtime?", error);
        return [];
    }
}

export async function getActiveCategoriesForModelAction(brandId: string, modelId: string) {
    try {
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
    } catch (error) {
        console.error("ERROR: getActiveCategoriesForModelAction failed:", error);
        return [];
    }
}

export async function getActiveSubcategoriesForModelAction(brandId: string, modelId: string, categoryId: string) {
    try {
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
    } catch (error) {
        console.error("ERROR: getActiveSubcategoriesForModelAction failed:", error);
        return [];
    }
}

export async function getActivePartItemsForModelAction(brandId: string, modelId: string, subcategoryId: string) {
    try {
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
    } catch (error) {
        console.error("ERROR: getActivePartItemsForModelAction failed:", error);
        return [];
    }
}

export async function getVehicleSelectorDataAction() {
    try {
        const brands = await getBrandsAction();
        
        return {
            brands,
            modelsMap: {} // We fetch models on demand now to improve initial home page speed
        };
    } catch (error) {
        console.error("ERROR: getVehicleSelectorDataAction failed:", error);
        return { brands: [], modelsMap: {} };
    }
}

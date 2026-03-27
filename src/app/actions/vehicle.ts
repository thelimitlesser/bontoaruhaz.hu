"use server";

import { prisma } from "@/lib/prisma";

export async function getBrandsAction() {
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
}

export async function getModelsByBrandAction(brandId: string) {
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
}

export async function getActivePartOptionsAction(brandId?: string, modelId?: string) {
    // Query PartItems that have associated parts with stock > 0
    // Optionally filter by brand and model
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
}

export async function getActiveCategoriesForModelAction(brandId: string, modelId: string) {
    // 1. Fetch all categories
    const allCategories = await prisma.partCategory.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, iconName: true }
    });

    // 2. Fetch IDs of categories that HAVE products for this model (including compatibility)
    const categoriesWithProducts = await prisma.partCategory.findMany({
        where: {
            Part: {
                some: {
                    stock: { gt: 0 },
                    OR: [
                        { brandId: brandId, modelId: modelId },
                        { compatibilities: { some: { brandId: brandId, modelId: modelId } } }
                    ]
                }
            }
        },
        select: { id: true }
    });

    const activeIds = new Set(categoriesWithProducts.map(c => c.id));

    // 2. Initial alphabetical sort
    let sortedCategories = allCategories.sort((a, b) => a.name.localeCompare(b.name, 'hu'));
    
    // 4. Filter to only show categories with products
    const filteredCategories = sortedCategories.filter(cat => activeIds.has(cat.id));
    
    return filteredCategories.map(cat => ({
        ...cat,
        hasProducts: true // All returned categories have products now
    }));
}

export async function getActiveSubcategoriesForModelAction(brandId: string, modelId: string, categoryId: string) {
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
}

export async function getActivePartItemsForModelAction(brandId: string, modelId: string, subcategoryId: string) {
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
}

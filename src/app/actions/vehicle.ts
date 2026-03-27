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
                    ...(brandId && { brandId }),
                    ...(modelId && { modelId }),
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
    // Return unique categories that have products in stock for this model
    const activeCategories = await prisma.partCategory.findMany({
        where: {
            Part: {
                some: {
                    stock: { gt: 0 },
                    brandId: brandId,
                    modelId: modelId
                }
            }
        },
        select: { id: true, name: true, slug: true, iconName: true }
    });
    return activeCategories;
}

export async function getActiveSubcategoriesForModelAction(brandId: string, modelId: string, categoryId: string) {
    const activeSubcats = await prisma.partSubcategory.findMany({
        where: {
            Part: {
                some: {
                    stock: { gt: 0 },
                    brandId: brandId,
                    modelId: modelId,
                    categoryId: categoryId
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
                    brandId: brandId,
                    modelId: modelId,
                    subcategoryId: subcategoryId
                }
            }
        },
        select: { id: true, name: true, slug: true }
    });
    return activeItems;
}

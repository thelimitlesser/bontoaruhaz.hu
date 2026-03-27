"use server";

import { prisma } from "@/lib/prisma";

// --- Vehicle Data Fetchers ---

export async function getBrands() {
    return await prisma.vehicleBrand.findMany({
        where: { hidden: false },
        orderBy: { name: 'asc' }
    });
}

export async function getModelsByBrand(brandId: string) {
    if (!brandId) return [];
    return await prisma.vehicleModel.findMany({
        where: { brandId },
        orderBy: { name: 'asc' }
    });
}

// --- Part Catalog Fetchers ---

export async function getCategories() {
    return await prisma.partCategory.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function getSubcategoriesByCategory(categoryId: string) {
    if (!categoryId) return [];
    return await prisma.partSubcategory.findMany({
        where: { categoryId },
        orderBy: { name: 'asc' }
    });
}

export async function getPartItemsBySubcategory(subcategoryId: string) {
    if (!subcategoryId) return [];
    return await prisma.partItem.findMany({
        where: { subcategoryId },
        orderBy: { name: 'asc' }
    });
}

export async function getAllPartItems() {
    return await prisma.partItem.findMany({
        orderBy: { name: 'asc' }
    });
}

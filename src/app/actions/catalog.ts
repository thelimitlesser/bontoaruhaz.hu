"use server";

import { prisma } from "@/lib/prisma";

// --- Vehicle Data Fetchers ---

export async function getBrands() {
    try {
        return await prisma.vehicleBrand.findMany({
            where: { hidden: false },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("catalog: getBrands failed:", error);
        return [];
    }
}

export async function getModelsByBrand(brandId: string) {
    if (!brandId) return [];
    try {
        return await prisma.vehicleModel.findMany({
            where: { brandId },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error(`catalog: getModelsByBrand failed for ${brandId}:`, error);
        return [];
    }
}

// --- Part Catalog Fetchers ---

export async function getCategories() {
    try {
        return await prisma.partCategory.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("catalog: getCategories failed:", error);
        return [];
    }
}

export async function getSubcategoriesByCategory(categoryId: string) {
    if (!categoryId) return [];
    try {
        return await prisma.partSubcategory.findMany({
            where: { categoryId },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error(`catalog: getSubcategoriesByCategory failed for ${categoryId}:`, error);
        return [];
    }
}

export async function getPartItemsBySubcategory(subcategoryId: string) {
    if (!subcategoryId) return [];
    try {
        return await prisma.partItem.findMany({
            where: { subcategoryId },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error(`catalog: getPartItemsBySubcategory failed for ${subcategoryId}:`, error);
        return [];
    }
}

export async function getAllPartItems() {
    try {
        return await prisma.partItem.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("catalog: getAllPartItems failed:", error);
        return [];
    }
}

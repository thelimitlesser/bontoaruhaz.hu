"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- BRANDS ---
export async function getBrands() {
    return await prisma.vehicleBrand.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createBrand(data: any) {
    const brand = await prisma.vehicleBrand.create({ data });
    revalidatePath('/admin');
    return brand;
}

export async function updateBrand(id: string, data: any) {
    const brand = await prisma.vehicleBrand.update({ where: { id }, data });
    revalidatePath('/admin');
    return brand;
}

export async function deleteBrand(id: string) {
    await prisma.vehicleBrand.delete({ where: { id } });
    revalidatePath('/admin');
}

// --- MODELS ---
export async function getModels(brandId?: string) {
    return await prisma.vehicleModel.findMany({
        where: brandId ? { brandId } : undefined,
        orderBy: { name: 'asc' },
        include: { VehicleBrand: true }
    });
}

export async function createModel(data: any) {
    const model = await prisma.vehicleModel.create({ data });
    revalidatePath('/admin');
    return model;
}

export async function updateModel(id: string, data: any) {
    const model = await prisma.vehicleModel.update({ where: { id }, data });
    revalidatePath('/admin');
    return model;
}

export async function deleteModel(id: string) {
    await prisma.vehicleModel.delete({ where: { id } });
    revalidatePath('/admin');
}

// --- CATEGORIES ---
export async function getCategories() {
    return await prisma.partCategory.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createCategory(data: any) {
    const category = await prisma.partCategory.create({ data });
    revalidatePath('/admin');
    return category;
}

export async function updateCategory(id: string, data: any) {
    const category = await prisma.partCategory.update({ where: { id }, data });
    revalidatePath('/admin');
    return category;
}

export async function deleteCategory(id: string) {
    await prisma.partCategory.delete({ where: { id } });
    revalidatePath('/admin');
}

// --- SUBCATEGORIES ---
export async function getSubcategories(categoryId?: string) {
    return await prisma.partSubcategory.findMany({
        where: categoryId ? { categoryId } : undefined,
        orderBy: { name: 'asc' }
    });
}

export async function createSubcategory(data: any) {
    const sub = await prisma.partSubcategory.create({ data });
    revalidatePath('/admin');
    return sub;
}

export async function updateSubcategory(id: string, data: any) {
    const sub = await prisma.partSubcategory.update({ where: { id }, data });
    revalidatePath('/admin');
    return sub;
}

export async function deleteSubcategory(id: string) {
    await prisma.partSubcategory.delete({ where: { id } });
    revalidatePath('/admin');
}

// --- PART ITEMS ---
export async function getPartItems(subcategoryId?: string) {
    return await prisma.partItem.findMany({
        where: subcategoryId ? { subcategoryId } : undefined,
        orderBy: { name: 'asc' }
    });
}

export async function createPartItem(data: any) {
    const item = await prisma.partItem.create({ data });
    revalidatePath('/admin');
    return item;
}

export async function updatePartItem(id: string, data: any) {
    const item = await prisma.partItem.update({ where: { id }, data });
    revalidatePath('/admin');
    return item;
}

export async function deletePartItem(id: string) {
    await prisma.partItem.delete({ where: { id } });
    revalidatePath('/admin');
}

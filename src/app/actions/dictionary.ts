"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Központi cache ürítő függvény.
 * Ha valami változik a szótárakban, az "automotive" taget és a specifikus taget is ürítjük,
 * hogy a publikus oldalon a villámgyors cache azonnal frissüljön mindenkinek.
 */
function clearDictionaryCache(type: 'brands' | 'models' | 'categories' | 'parts') {
    revalidatePath('/admin');
    revalidatePath('/admin/inventory');
    // @ts-ignore
    revalidateTag('automotive');
    
    // @ts-ignore
    if (type === 'brands') revalidateTag('brands');
    // @ts-ignore
    if (type === 'models') revalidateTag('models');
    // @ts-ignore
    if (type === 'categories') revalidateTag('categories');
    // @ts-ignore
    if (type === 'parts') revalidateTag('parts');
}

// --- BRANDS ---
export async function getBrands() {
    return await prisma.vehicleBrand.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createBrand(data: any) {
    if (data.id) {
        const existing = await prisma.vehicleBrand.findUnique({ where: { id: data.id } });
        if (existing) throw new Error("Ez a márka már létezik!");
    }
    const brand = await prisma.vehicleBrand.create({ data });
    clearDictionaryCache('brands');
    return brand;
}

export async function updateBrand(id: string, data: any) {
    const brand = await prisma.vehicleBrand.update({ where: { id }, data });
    clearDictionaryCache('brands');
    return brand;
}

export async function deleteBrand(id: string) {
    await prisma.vehicleBrand.delete({ where: { id } });
    clearDictionaryCache('brands');
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
    if (data.id) {
        const existing = await prisma.vehicleModel.findUnique({ where: { id: data.id } });
        if (existing) throw new Error("Ez a modell már létezik!");
    }
    const model = await prisma.vehicleModel.create({ data });
    clearDictionaryCache('models');
    return model;
}

export async function updateModel(id: string, data: any) {
    const model = await prisma.vehicleModel.update({ where: { id }, data });
    clearDictionaryCache('models');
    return model;
}

export async function deleteModel(id: string) {
    await prisma.vehicleModel.delete({ where: { id } });
    clearDictionaryCache('models');
}

// --- CATEGORIES ---
export async function getCategories() {
    return await prisma.partCategory.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createCategory(data: any) {
    if (data.id) {
        const existing = await prisma.partCategory.findUnique({ where: { id: data.id } });
        if (existing) throw new Error("Ez a kategória már létezik!");
    }
    const category = await prisma.partCategory.create({ data });
    clearDictionaryCache('categories');
    return category;
}

export async function updateCategory(id: string, data: any) {
    const category = await prisma.partCategory.update({ where: { id }, data });
    clearDictionaryCache('categories');
    return category;
}

export async function deleteCategory(id: string) {
    await prisma.partCategory.delete({ where: { id } });
    clearDictionaryCache('categories');
}

// --- SUBCATEGORIES ---
export async function getSubcategories(categoryId?: string) {
    return await prisma.partSubcategory.findMany({
        where: categoryId ? { categoryId } : undefined,
        orderBy: { name: 'asc' }
    });
}

export async function createSubcategory(data: any) {
    if (data.id) {
        const existing = await prisma.partSubcategory.findUnique({ where: { id: data.id } });
        if (existing) throw new Error("Ez az alkategória már létezik!");
    }
    const sub = await prisma.partSubcategory.create({ data });
    clearDictionaryCache('categories');
    return sub;
}

export async function updateSubcategory(id: string, data: any) {
    const sub = await prisma.partSubcategory.update({ where: { id }, data });
    clearDictionaryCache('categories');
    return sub;
}

export async function deleteSubcategory(id: string) {
    await prisma.partSubcategory.delete({ where: { id } });
    clearDictionaryCache('categories');
}

// --- PART ITEMS ---
export async function getPartItems(subcategoryId?: string) {
    return await prisma.partItem.findMany({
        where: subcategoryId ? { subcategoryId } : undefined,
        orderBy: { name: 'asc' }
    });
}

export async function createPartItem(data: any) {
    if (data.id) {
        const existing = await prisma.partItem.findUnique({ where: { id: data.id } });
        if (existing) throw new Error("Ez az alkatrész már létezik!");
    }
    const item = await prisma.partItem.create({ data });
    clearDictionaryCache('parts');
    return item;
}

export async function updatePartItem(id: string, data: any) {
    // 1. Megszerezzük a régi nevet a módosítás előtt
    const oldItem = await prisma.partItem.findUnique({ 
        where: { id },
        select: { name: true }
    });

    // 2. Frissítjük magát az alkatrész-típust
    const item = await prisma.partItem.update({ where: { id }, data });

    // 3. Ha megváltozott a név, lefuttatjuk a szinkronizációt a termékeken
    if (oldItem && data.name && oldItem.name !== data.name) {
        const parts = await prisma.part.findMany({
            where: { partItemId: id },
            select: { id: true, name: true, description: true }
        });

        // Végigfutunk az érintett termékeken és lecseréljük a régi nevet az újra
        for (const part of parts) {
            let needsUpdate = false;
            const updateData: any = {};

            // Név csere
            if (part.name.includes(oldItem.name)) {
                updateData.name = part.name.replaceAll(oldItem.name, data.name);
                needsUpdate = true;
            }

            // Leírás (fejléc) csere
            if (part.description && part.description.includes(oldItem.name)) {
                updateData.description = part.description.replaceAll(oldItem.name, data.name);
                needsUpdate = true;
            }

            if (needsUpdate) {
                await prisma.part.update({
                    where: { id: part.id },
                    data: updateData
                });
            }
        }
    }

    clearDictionaryCache('parts');
    return item;
}

export async function deletePartItem(id: string) {
    await prisma.partItem.delete({ where: { id } });
    clearDictionaryCache('parts');
}

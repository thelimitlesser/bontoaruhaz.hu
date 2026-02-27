'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";

export async function createProduct(formData: FormData) {
    const rawFormData = {
        name: formData.get('name') as string,
        sku: formData.get('sku') as string,
        priceGross: parseInt(formData.get('priceGross') as string),
        // Calculate net based on 27% VAT default
        priceNet: Math.round(parseInt(formData.get('priceGross') as string) / 1.27),
        description: formData.get('description') as string,
        oemNumbers: formData.get('oemNumbers') as string, // stored as CSV string
        condition: formData.get('condition') as string,
        stock: parseInt(formData.get('stock') as string),
        brandId: formData.get('brandId') as string,
        modelId: formData.get('modelId') as string,
        categoryId: formData.get('categoryId') as string,
        subcategoryId: formData.get('subcategoryId') as string,
        partItemId: formData.get('partItemId') as string,
        yearFrom: formData.get('yearFrom') ? parseInt(formData.get('yearFrom') as string) : null,
        yearTo: formData.get('yearTo') ? parseInt(formData.get('yearTo') as string) : null,
    };

    // basic validation
    if (!rawFormData.name || !rawFormData.sku || !rawFormData.priceGross) {
        throw new Error("Hiányzó kötelező mezők!");
    }

    // 1. Get or Create the "Shop" Partner Profile (Quick fix for MVP)
    // In a real app, this would come from the session.
    let partner = await prisma.partnerProfile.findFirst({
        where: { businessName: "Bontóáruház Saját" }
    });

    if (!partner) {
        // Find the admin user
        const adminUser = await prisma.user.findUnique({ where: { email: 'admin@autonexus.com' } });
        if (!adminUser) throw new Error("Admin felhasználó nem található (Seed script futott?)");

        partner = await prisma.partnerProfile.create({
            data: {
                userId: adminUser.id,
                businessName: "Bontóáruház Saját",
                returnPolicy: "14 nap visszavásárlási garancia"
            }
        });
    }

    // 2. Handle Image Uploads with Supabase Storage
    const imagesFiles = formData.getAll('imageFiles') as File[];
    const uploadedImageUrls: string[] = [];

    if (imagesFiles.length > 0) {
        const { createClient } = await import("@/utils/supabase/server");
        const supabase = await createClient();

        for (const file of imagesFiles) {
            // Skip empty files or non-file entries
            if (!file.name || file.size === 0) continue;

            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

            // Process with sharp: resize and convert to webp buffer
            const processedBuffer = await sharp(buffer)
                .resize(1000, 1000, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 90 })
                .toBuffer();

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('part-images')
                .upload(fileName, processedBuffer, {
                    contentType: 'image/webp',
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Supabase upload error:", error);
                continue;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('part-images')
                .getPublicUrl(fileName);

            uploadedImageUrls.push(publicUrl);
        }
    }

    // 3. Create the Product
    await prisma.part.create({
        data: {
            name: rawFormData.name,
            sku: rawFormData.sku,
            description: rawFormData.description,
            priceGross: rawFormData.priceGross,
            priceNet: rawFormData.priceNet,
            oemNumbers: rawFormData.oemNumbers,
            condition: rawFormData.condition,
            stock: rawFormData.stock,
            partnerId: partner.id,
            categoryId: rawFormData.categoryId || undefined,
            subcategoryId: rawFormData.subcategoryId || undefined,
            partItemId: rawFormData.partItemId || undefined,
            brandId: rawFormData.brandId || undefined,
            modelId: rawFormData.modelId || undefined,
            yearFrom: rawFormData.yearFrom,
            yearTo: rawFormData.yearTo,
            tecdocKTypes: formData.get('tecdocKTypes') as string || "",
            images: uploadedImageUrls.join(','),
        }
    });

    revalidatePath('/admin/products');
    redirect('/admin/products');
}

export async function getSearchProducts(params: {
    brand?: string;
    model?: string;
    category?: string;
    subcategory?: string;
    partItem?: string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
}) {
    const { brand, model, category, subcategory, partItem, minPrice, maxPrice, query } = params;

    const where: any = {};

    if (brand) where.brandId = brand;
    if (model) where.modelId = model;
    if (category) where.categoryId = category;
    if (subcategory) {
        // Find subcategory ID from slug if needed, but usually we pass ID
        where.subcategoryId = subcategory;
    }
    if (partItem) where.partItemId = partItem;

    if (minPrice || maxPrice) {
        where.priceGross = {};
        if (minPrice) where.priceGross.gte = minPrice;
        if (maxPrice) where.priceGross.lte = maxPrice;
    }

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { oemNumbers: { contains: query, mode: 'insensitive' } },
        ];
    }

    const parts = await prisma.part.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            partner: true
        }
    });

    return parts;
}

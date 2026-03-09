'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";

export async function createProduct(formData: FormData) {
    const rawFormData = {
        name: formData.get('name') as string,
        sku: formData.get('sku') as string,
        productCode: formData.get('productCode') as string,
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
        isUniversal: formData.get('isUniversal') === 'true',
        compatibilitiesData: formData.get('compatibilitiesData') as string,
        weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : null,
        height: formData.get('height') ? parseFloat(formData.get('height') as string) : null,
        width: formData.get('width') ? parseFloat(formData.get('width') as string) : null,
        length: formData.get('length') ? parseFloat(formData.get('length') as string) : null,
        shippingPrice: formData.get('shippingPrice') ? parseInt(formData.get('shippingPrice') as string) : null,
    };

    // basic validation
    if (!rawFormData.name || !rawFormData.sku || !rawFormData.priceGross) {
        throw new Error("Hiányzó kötelező mezők!");
    }

    // 1. Get current user and ensure they exist in Prisma
    const supabaseServer = await createClient();
    const { data: { user: authUser } } = await supabaseServer.auth.getUser();

    if (!authUser) {
        throw new Error("Be kell jelentkezned a termék feltöltéséhez!");
    }

    // Get or Create the Partner Profile for the current user
    let partner = await prisma.partnerProfile.findUnique({
        where: { userId: authUser.id }
    });

    if (!partner) {
        // Ensure user exists in Prisma (sync from Supabase)
        let prismaUser = await prisma.user.findUnique({ where: { id: authUser.id } });
        if (!prismaUser) {
            prismaUser = await prisma.user.create({
                data: {
                    id: authUser.id,
                    email: authUser.email!,
                    fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.display_name || 'Admin',
                    role: 'ADMIN' // Only admins can access this page anyway
                }
            });
        }

        partner = await prisma.partnerProfile.create({
            data: {
                userId: authUser.id,
                businessName: prismaUser.fullName || "Saját Üzlet",
                returnPolicy: "14 nap visszavásárlási garancia"
            }
        });
    }

    // 2. Handle Image Uploads with Supabase Storage
    const imagesFiles = formData.getAll('imageFiles') as File[];
    const uploadedImageUrls: string[] = [];

    if (imagesFiles.length > 0 && imagesFiles[0].size > 0) {
        const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Clean name for folder (no special characters, spaces to underscores)
        const cleanName = rawFormData.name
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);

        // Unique folder suffix to avoid collisions for same-named parts
        const folderName = `${cleanName}_${Math.random().toString(36).substring(7)}`;

        for (const file of imagesFiles) {
            if (!file.name || file.size === 0) continue;

            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
            const filePath = `${folderName}/${fileName}`;

            // Process with sharp
            const processedBuffer = await sharp(buffer)
                .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 90 })
                .toBuffer();

            // Upload to Supabase Storage with path
            const { error } = await supabase.storage
                .from('part-images')
                .upload(filePath, processedBuffer, {
                    contentType: 'image/webp',
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Supabase upload error:", error);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('part-images')
                .getPublicUrl(filePath);

            uploadedImageUrls.push(publicUrl);
        }
    }

    let parsedCompatibilities = [];
    if (rawFormData.compatibilitiesData) {
        try {
            parsedCompatibilities = JSON.parse(rawFormData.compatibilitiesData);
        } catch (e) {
            console.error("Failed to parse compatibilities", e);
        }
    }

    // 3. Create the Product
    await prisma.part.create({
        data: {
            name: rawFormData.name,
            sku: rawFormData.sku,
            productCode: rawFormData.productCode,
            description: rawFormData.description,
            priceGross: rawFormData.priceGross,
            priceNet: rawFormData.priceNet,
            oemNumbers: rawFormData.oemNumbers || "",
            condition: rawFormData.condition || "USED",
            stock: rawFormData.stock || 1,
            partner: { connect: { id: partner.id } },
            categoryId: rawFormData.categoryId || undefined,
            subcategoryId: rawFormData.subcategoryId || undefined,
            partItemId: rawFormData.partItemId || undefined,
            brandId: rawFormData.brandId || undefined,
            modelId: rawFormData.modelId || undefined,
            yearFrom: rawFormData.yearFrom,
            yearTo: rawFormData.yearTo,
            tecdocKTypes: formData.get('tecdocKTypes') as string || "",
            images: uploadedImageUrls.join(','),
            isUniversal: rawFormData.isUniversal,
            weight: rawFormData.weight,
            height: rawFormData.height,
            width: rawFormData.width,
            length: rawFormData.length,
            shippingPrice: rawFormData.shippingPrice,
            compatibilities: {
                create: parsedCompatibilities.map((c: any) => ({
                    brandId: c.brandId,
                    modelId: c.modelId,
                    yearFrom: c.yearFrom ? parseInt(c.yearFrom) : null,
                    yearTo: c.yearTo ? parseInt(c.yearTo) : null,
                }))
            }
        }
    });

    revalidatePath('/admin/inventory');
    redirect('/admin/inventory');
}

export async function updateProduct(id: string, formData: FormData) {
    const rawFormData = {
        name: formData.get('name') as string,
        sku: formData.get('sku') as string,
        productCode: formData.get('productCode') as string,
        priceGross: parseInt(formData.get('priceGross') as string),
        priceNet: Math.round(parseInt(formData.get('priceGross') as string) / 1.27),
        description: formData.get('description') as string,
        oemNumbers: formData.get('oemNumbers') as string,
        condition: formData.get('condition') as string,
        stock: parseInt(formData.get('stock') as string),
        brandId: formData.get('brandId') as string,
        modelId: formData.get('modelId') as string,
        categoryId: formData.get('categoryId') as string,
        subcategoryId: formData.get('subcategoryId') as string,
        partItemId: formData.get('partItemId') as string,
        yearFrom: formData.get('yearFrom') ? parseInt(formData.get('yearFrom') as string) : null,
        yearTo: formData.get('yearTo') ? parseInt(formData.get('yearTo') as string) : null,
        isUniversal: formData.get('isUniversal') === 'true',
        compatibilitiesData: formData.get('compatibilitiesData') as string,
        existingImages: formData.get('existingImages') as string || "",
        weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : null,
        height: formData.get('height') ? parseFloat(formData.get('height') as string) : null,
        width: formData.get('width') ? parseFloat(formData.get('width') as string) : null,
        length: formData.get('length') ? parseFloat(formData.get('length') as string) : null,
        shippingPrice: formData.get('shippingPrice') ? parseInt(formData.get('shippingPrice') as string) : null,
    };

    if (!rawFormData.name || !rawFormData.sku || !rawFormData.priceGross) {
        throw new Error("Hiányzó kötelező mezők!");
    }

    // Handle New Image Uploads
    const imagesFiles = formData.getAll('imageFiles') as File[];
    const newImageUrls: string[] = [];

    if (imagesFiles.length > 0 && imagesFiles[0].size > 0) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Clean name for folder
        const cleanName = rawFormData.name
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);

        const folderName = `${cleanName}_${Math.random().toString(36).substring(7)}`;

        for (const file of imagesFiles) {
            if (!file.name || file.size === 0) continue;
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
            const filePath = `${folderName}/${fileName}`;

            const processedBuffer = await sharp(buffer)
                .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 90 })
                .toBuffer();

            const { error } = await supabase.storage
                .from('part-images')
                .upload(filePath, processedBuffer, { contentType: 'image/webp' });

            if (error) continue;
            const { data: { publicUrl } } = supabase.storage.from('part-images').getPublicUrl(filePath);
            newImageUrls.push(publicUrl);
        }
    }

    const finalImages = [
        ...rawFormData.existingImages.split(',').filter(Boolean),
        ...newImageUrls
    ].join(',');

    let parsedCompatibilities = [];
    if (rawFormData.compatibilitiesData) {
        try {
            parsedCompatibilities = JSON.parse(rawFormData.compatibilitiesData);
        } catch (e) {
            console.error("Failed to parse compatibilities", e);
        }
    }

    await prisma.part.update({
        where: { id },
        data: {
            name: rawFormData.name,
            sku: rawFormData.sku,
            productCode: rawFormData.productCode,
            description: rawFormData.description,
            priceGross: rawFormData.priceGross,
            priceNet: rawFormData.priceNet,
            oemNumbers: rawFormData.oemNumbers || "",
            condition: rawFormData.condition || "USED",
            stock: rawFormData.stock || 1,
            categoryId: rawFormData.categoryId || null,
            subcategoryId: rawFormData.subcategoryId || null,
            partItemId: rawFormData.partItemId || null,
            brandId: rawFormData.brandId || null,
            modelId: rawFormData.modelId || null,
            yearFrom: rawFormData.yearFrom,
            yearTo: rawFormData.yearTo,
            tecdocKTypes: formData.get('tecdocKTypes') as string || "",
            images: finalImages,
            isUniversal: rawFormData.isUniversal,
            weight: rawFormData.weight,
            height: rawFormData.height,
            width: rawFormData.width,
            length: rawFormData.length,
            shippingPrice: rawFormData.shippingPrice,
            compatibilities: {
                deleteMany: {},
                create: parsedCompatibilities.map((c: any) => ({
                    brandId: c.brandId,
                    modelId: c.modelId,
                    yearFrom: c.yearFrom ? parseInt(c.yearFrom) : null,
                    yearTo: c.yearTo ? parseInt(c.yearTo) : null,
                }))
            }
        }
    });

    revalidatePath('/admin/inventory');
    revalidatePath(`/product/${id}`);
}

export async function deleteProduct(id: string) {
    // 1. Get the product to find the images
    const product = await prisma.part.findUnique({
        where: { id },
        select: { images: true }
    });

    if (product && product.images) {
        const imageUrls = product.images.split(',').filter(Boolean);
        if (imageUrls.length > 0) {
            try {
                // 2. Extract paths from public URLs
                // Format: .../storage/v1/object/public/part-images/folder/file.webp
                const paths = imageUrls.map(url => {
                    const parts = url.split('/part-images/');
                    return parts.length > 1 ? parts[1] : null;
                }).filter(Boolean) as string[];

                if (paths.length > 0) {
                    // 3. Initialize Supabase client
                    const { createClient } = await import("@supabase/supabase-js");
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );

                    // 4. Remove from Storage
                    const { error } = await supabase.storage
                        .from('part-images')
                        .remove(paths);

                    if (error) {
                        console.error("Supabase Storage cleanup error:", error);
                    } else {
                        console.log(`Successfully deleted ${paths.length} images from storage for product ${id}`);
                    }
                }
            } catch (err) {
                console.error("Failed to clean up images for product:", id, err);
                // We continue with product deletion even if image cleanup fails
            }
        }
    }

    // 5. Delete the database record
    await prisma.part.delete({
        where: { id }
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/admin/products');
}

export async function getSearchProducts(params: {
    brand?: string;
    model?: string;
    category?: string;
    subcategory?: string;
    partItem?: string;
    year?: number;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
    take?: number;
}) {
    const { brand, model, category, subcategory, partItem, year, minPrice, maxPrice, query, take } = params;

    const where: any = {};

    const vehicleFilters: any[] = [];
    if (brand || model || year) {
        const primaryMatch: any = {};
        if (brand) primaryMatch.brandId = brand;
        if (model) primaryMatch.modelId = model;
        if (year) {
            primaryMatch.AND = [
                { OR: [{ yearFrom: null }, { yearFrom: { lte: year } }] },
                { OR: [{ yearTo: null }, { yearTo: { gte: year } }] }
            ];
        }

        const compatibilityMatch: any = {};
        if (brand) compatibilityMatch.brandId = brand;
        if (model) compatibilityMatch.modelId = model;
        if (year) {
            compatibilityMatch.AND = [
                { OR: [{ yearFrom: null }, { yearFrom: { lte: year } }] },
                { OR: [{ yearTo: null }, { yearTo: { gte: year } }] }
            ];
        }

        vehicleFilters.push(
            { isUniversal: true },
            primaryMatch,
            { compatibilities: { some: compatibilityMatch } }
        );
    }

    if (vehicleFilters.length > 0) {
        where.OR = vehicleFilters;
    }

    if (category) where.categoryId = category;
    if (subcategory) where.subcategoryId = subcategory;
    if (partItem) where.partItemId = partItem;

    if (minPrice || maxPrice) {
        where.priceGross = {};
        if (minPrice) where.priceGross.gte = minPrice;
        if (maxPrice) where.priceGross.lte = maxPrice;
    }

    if (query) {
        const textSearch = [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { oemNumbers: { contains: query, mode: 'insensitive' } },
        ];

        // If we already have a vehicle OR filter, we need to AND it with the text search
        if (where.OR) {
            where.AND = [
                { OR: where.OR },
                { OR: textSearch }
            ];
            delete where.OR;
        } else {
            where.OR = textSearch;
        }
    }

    const parts = await prisma.part.findMany({
        where,
        take: take || undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            partner: true
        }
    });

    return parts;
}
export async function getCategoryProductCounts(brandId: string, modelId: string) {
    const counts = await prisma.part.groupBy({
        by: ['categoryId'],
        where: {
            OR: [
                { brandId, modelId },
                { isUniversal: true },
                {
                    compatibilities: {
                        some: {
                            brandId,
                            modelId
                        }
                    }
                }
            ]
        },
        _count: {
            id: true
        }
    });

    const countsMap: Record<string, number> = {};
    counts.forEach(c => {
        if (c.categoryId) {
            countsMap[c.categoryId] = c._count.id;
        }
    });

    return countsMap;
}

export async function getNextReferenceNumber() {
    const result = await prisma.part.aggregate({
        _max: {
            productCode: true
        }
    });

    const maxCode = result._max.productCode;

    if (!maxCode || isNaN(parseInt(maxCode))) {
        return "1000";
    }

    const nextCode = parseInt(maxCode) + 1;
    return nextCode.toString();
}

export async function updatePartStock(id: string, newStock: number) {
    if (newStock < 0) throw new Error("A készlet nem lehet negatív!");

    await prisma.part.update({
        where: { id },
        data: { stock: newStock }
    });

    revalidatePath('/admin/inventory');
}

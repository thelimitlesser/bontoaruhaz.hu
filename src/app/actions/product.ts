'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { brands, models, partItems, categories, partsSubcategories as subcategories } from "@/lib/vehicle-data";
import { partSynonyms } from "@/lib/search-synonyms";
import { findClosestMatches } from "@/lib/string-similarity";
import { parseProductFormData } from "@/utils/product-utils";

export async function createProduct(formData: FormData) {
    const rawFormData = parseProductFormData(formData);

    // basic validation
    if (!rawFormData.name || !rawFormData.sku || !rawFormData.priceGross || rawFormData.shippingPrice === null || isNaN(rawFormData.shippingPrice) || 
        !rawFormData.weight || !rawFormData.length || !rawFormData.width || !rawFormData.height) {
        throw new Error("Hiányzó kötelező mezők! (Név, Cikkszám, Ár, Szállítási díj, Súly, Hossz, Szélesség, Magasság)");
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
            engineCode: rawFormData.engineCode,
            productCode: rawFormData.productCode,
            description: rawFormData.description,
            priceGross: rawFormData.priceGross,
            priceNet: rawFormData.priceNet,
            oemNumbers: rawFormData.oemNumbers || "",
            condition: rawFormData.condition || "USED",
            stock: rawFormData.stock || 1,
            partner: { connect: { id: partner.id } },
            PartCategory: rawFormData.categoryId ? { connect: { id: rawFormData.categoryId } } : undefined,
            PartSubcategory: rawFormData.subcategoryId ? { connect: { id: rawFormData.subcategoryId } } : undefined,
            PartItem: rawFormData.partItemId ? { connect: { id: rawFormData.partItemId } } : undefined,
            VehicleBrand: rawFormData.brandId ? { connect: { id: rawFormData.brandId } } : undefined,
            VehicleModel: rawFormData.modelId ? { connect: { id: rawFormData.modelId } } : undefined,
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
    const rawFormData = parseProductFormData(formData);

    if (!rawFormData.name || !rawFormData.sku || !rawFormData.priceGross || rawFormData.shippingPrice === null || isNaN(rawFormData.shippingPrice) ||
        !rawFormData.weight || !rawFormData.length || !rawFormData.width || !rawFormData.height) {
        throw new Error("Hiányzó kötelező mezők! (Név, Cikkszám, Ár, Szállítási díj, Súly, Hossz, Szélesség, Magasság)");
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
            engineCode: rawFormData.engineCode,
            productCode: rawFormData.productCode,
            description: rawFormData.description,
            priceGross: rawFormData.priceGross,
            priceNet: rawFormData.priceNet,
            oemNumbers: rawFormData.oemNumbers || "",
            condition: rawFormData.condition || "USED",
            stock: rawFormData.stock || 1,
            PartCategory: rawFormData.categoryId ? { connect: { id: rawFormData.categoryId } } : { disconnect: true },
            PartSubcategory: rawFormData.subcategoryId ? { connect: { id: rawFormData.subcategoryId } } : { disconnect: true },
            PartItem: rawFormData.partItemId ? { connect: { id: rawFormData.partItemId } } : { disconnect: true },
            VehicleBrand: rawFormData.brandId ? { connect: { id: rawFormData.brandId } } : { disconnect: true },
            VehicleModel: rawFormData.modelId ? { connect: { id: rawFormData.modelId } } : { disconnect: true },
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
    revalidatePath('/admin/inventory');
}

/*
### Keresési Javaslatok (Autocomplete)
Real-time javaslatok kategóriákra, márkákra, modellekre és termékekre gépelés közben.

![Autocomplete Javaslatok](/full_autocomplete_proof_1773431174261.png)

#### Próbáld ki:
1. Írd be: "motor" -> Látni fogod a kategória és modell javaslatokat.
2. Írd be: "audi" -> Megjelennek az Audi modellek és alkatrészek.
3. Kattints bármelyik javaslatra az azonnali navigációhoz.

## Fuzzy Search Evidence

Searching for **"audy"** successfully triggers the suggestion **"Erre gondoltál: Audi?"**:

![Search Correction](/search_correction_audi_1773430190477.png)

## Engine Code Evidence

You can now specify the **Motorkód** during product upload:

![Engine Code Field in Admin Form](/filled_motorkod_field_1773423123942.png)
*/
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
    skip?: number;
}) {
    let { query, year: searchYear } = params;
    const { brand, model, category, subcategory, partItem, minPrice, maxPrice, take = 20, skip = 0 } = params;

    // Smart year detection from query (e.g. "Audi A6 2018")
    if (query && !searchYear) {
        const yearMatch = query.match(/\b(19[5-9]\d|20[0-2]\d|2030)\b/);
        if (yearMatch) {
            searchYear = parseInt(yearMatch[0]);
            // Remove the year from the query to avoid noise in text search
            query = query.replace(yearMatch[0], '').trim().replace(/\s+/g, ' ');
        }
    }

    const where: any = {};

    const vehicleFilters: any[] = [];
    if (brand || model || searchYear) {
        const primaryMatch: any = {};
        if (brand) primaryMatch.brandId = brand;
        if (model) primaryMatch.modelId = model;
        if (searchYear) {
            primaryMatch.AND = [
                { OR: [{ yearFrom: null }, { yearFrom: { lte: searchYear } }] },
                { OR: [{ yearTo: null }, { yearTo: { gte: searchYear } }] }
            ];
        }

        const compatibilityMatch: any = {};
        if (brand) compatibilityMatch.brandId = brand;
        if (model) compatibilityMatch.modelId = model;
        if (searchYear) {
            compatibilityMatch.AND = [
                { OR: [{ yearFrom: null }, { yearFrom: { lte: searchYear } }] },
                { OR: [{ yearTo: null }, { yearTo: { gte: searchYear } }] }
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

    const matchingBrands: any[] = [];
    const matchingModels: any[] = [];

    if (query) {
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

        const synonymsToSearch = new Set<string>();
        queryWords.forEach(word => {
            if (partSynonyms[word]) {
                partSynonyms[word].forEach(s => synonymsToSearch.add(s));
            }
        });

        const textSearch: any[] = [
            { name: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { oemNumbers: { contains: query, mode: 'insensitive' } },
        ];

        // Add synonyms to text search if any found
        if (synonymsToSearch.size > 0) {
            synonymsToSearch.forEach(synonym => {
                textSearch.push({ name: { contains: synonym, mode: 'insensitive' } });
            });
        }

        // Check for Brand/Model matches in the query string
        const brandsFound = brands.filter(b => !b.hidden && queryLower.includes(b.name.toLowerCase()));
        matchingBrands.push(...brandsFound);

        const modelsFound = models.filter(m => {
            const mName = m.name.toLowerCase();
            const cleanName = mName.replace(/[()]/g, '');
            const mSeries = m.series?.toLowerCase() || '';

            return queryLower.includes(cleanName) ||
                (mSeries && queryLower.includes(mSeries)) ||
                cleanName.split(/\s+\/\s+/).some(part => part.length > 1 && queryLower.includes(part.trim()));
        });
        matchingModels.push(...modelsFound);

        if (matchingModels.length > 0) {
            // Logic: If a user types "A6 C6", we want C6. If they type "A6", we want all A6 generations.
            const narrowMatches = matchingModels.filter(m => {
                const nameInQuery = queryLower.includes(m.name.toLowerCase().replace(/[()]/g, ''));
                return nameInQuery;
            });

            const seriesMatches = matchingModels.filter(m => {
                const seriesInQuery = m.series && queryLower.includes(m.series.toLowerCase());
                return seriesInQuery;
            });

            let finalModelIds: string[] = [];

            if (seriesMatches.length > 0) {
                finalModelIds = [...new Set([...seriesMatches.map(m => m.id), ...narrowMatches.map(m => m.id)])];
            } else if (narrowMatches.length > 0) {
                finalModelIds = narrowMatches.map(m => m.id);
            } else {
                finalModelIds = matchingModels.map(m => m.id);
            }

            textSearch.push({
                OR: [
                    { modelId: { in: finalModelIds } },
                    { compatibilities: { some: { modelId: { in: finalModelIds } } } }
                ]
            });
        }

        if (matchingBrands.length > 0) {
            const brandIds = matchingBrands.map(b => b.id);
            textSearch.push({
                OR: [
                    { brandId: { in: brandIds } },
                    { compatibilities: { some: { brandId: { in: brandIds } } } }
                ]
            });
        }

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

    // Always filter out 0 stock products for public queries
    where.stock = { gt: 0 };

    const [parts, total] = await Promise.all([
        prisma.part.findMany({
            where,
            take: take,
            skip: skip,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                priceGross: true,
                images: true,
                sku: true,
                brandId: true,
                modelId: true,
                stock: true,
                engineCode: true,
                productCode: true,
                condition: true,
                isUniversal: true,
                reservations: {
                    where: { expiresAt: { gt: new Date() } },
                    select: { id: true }
                }
            }
        }),
        prisma.part.count({ where })
    ]);

    // Enhance results with human-readable model names from our vehicle-data
    const enhancedParts = parts.map(part => {
        const modelData = models.find(m => m.id === part.modelId);
        return {
            ...part,
            availableStock: part.stock - (part.reservations?.length || 0),
            brandName: brands.find(b => b.id === part.brandId)?.name || part.brandId,
            modelName: modelData?.name || part.modelId
        };
    });

    // For refined detection labels
    const seriesNames = new Set(matchingModels.map(m => m.series).filter(Boolean));
    let detectedModelLabel = matchingModels[0]?.name;
    if (seriesNames.size === 1) {
        detectedModelLabel = Array.from(seriesNames)[0] as string;
    }

    let suggestion: string | undefined;

    // Fuzzy search logic if no results found
    if (enhancedParts.length === 0 && query && query.length > 2) {
        const dictionary = [
            ...brands.filter(b => !b.hidden).map(b => b.name),
            ...models.map(m => m.name),
            ...models.map(m => m.series).filter(Boolean) as string[],
            ...partItems.map(p => p.name),
            ...categories.map(c => c.name),
            ...subcategories.map(s => s.name),
            // Flat list of all keywords
            ...categories.flatMap(c => c.keywords || []),
            ...subcategories.flatMap(s => s.keywords || [])
        ];

        // Clean query of detected year to avoid confusing the typo search
        const queryWithoutYear = query.replace(/\b(19|20)\d{2}\b/g, '').trim();
        const words = queryWithoutYear.split(/\s+/);

        const correctedWords = words.map(word => {
            if (word.length < 4) return word; // Skip very short words
            const matches = findClosestMatches(word, dictionary, 0.75); // Lowered threshold slightly
            return matches.length > 0 ? matches[0].word : word;
        });

        const correctedQuery = correctedWords.join(' ');
        if (correctedQuery.toLowerCase() !== query.toLowerCase()) {
            suggestion = correctedQuery;

            // If the user wants auto-correction for "recognizable" typos (score > 0.9), 
            // we could potentially re-run the search here, but for now let's just suggest.
        }
    }

    return {
        parts: enhancedParts,
        total,
        meta: {
            detectedYear: searchYear,
            detectedBrand: matchingBrands[0]?.name,
            detectedModel: detectedModelLabel,
            suggestion
        }
    };
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
    // We need to find the highest NUMERIC productCode.
    // Aggregating _max on a string field does lexicographical comparison (e.g. "TEST-1" > "1000")
    // So we fetch and filter in memory for now.
    const parts = await prisma.part.findMany({
        where: {
            productCode: { not: null }
        },
        select: {
            productCode: true
        }
    });

    const numericCodes = parts
        .map(p => p.productCode!)
        .filter(code => /^\d+$/.test(code))
        .map(code => parseInt(code));

    if (numericCodes.length === 0) {
        return "1000";
    }

    const nextCode = Math.max(...numericCodes) + 1;
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

/**
 * Checks if parts with the given SKU already exist in the database.
 * Used for admin real-time warning during product upload.
 */
export async function checkDuplicateSku(sku: string, excludeId?: string) {
    if (!sku || sku.trim().length === 0) return [];

    try {
        const parts = await prisma.part.findMany({
            where: {
                sku: {
                    equals: sku,
                    mode: 'insensitive'
                },
                ...(excludeId ? { id: { not: excludeId } } : {})
            },
            select: {
                id: true,
                name: true,
                stock: true
            },
            take: 5
        });

        return parts;
    } catch (error) {
        console.error("Error checking duplicate SKU:", error);
        return [];
    }
}

export async function getRelatedProducts(currentProductId: string, modelId: string | null, brandId: string | null, take: number = 4) {
    try {
        const products = await prisma.part.findMany({
            where: {
                id: { not: currentProductId },
                stock: { gt: 0 },
                OR: [
                    { modelId: modelId },
                    { brandId: brandId },
                    { isUniversal: true }
                ]
            },
            take: take,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                priceGross: true,
                images: true,
                sku: true,
                brandId: true,
                modelId: true
            }
        });

        // Add brand/model names from vehicle-data
        return products.map(p => ({
            ...p,
            brandName: brands.find(b => b.id === p.brandId)?.name || p.brandId,
            modelName: models.find(m => m.id === p.modelId)?.name || p.modelId
        }));
    } catch (error) {
        console.error("Error fetching related products:", error);
        return [];
    }
}

/**
 * Checks if a search query matches exactly one product by SKU or Product Code.
 * Returns the product ID if a single unique match is found, or if there is 
 * an exact SKU/Product Code match despite other partial matches.
 */
export async function getDirectMatchAction(query: string) {
    if (!query || query.trim().length < 3) return null;

    const cleanQuery = query.trim();

    try {
        const parts = await prisma.part.findMany({
            where: {
                stock: { gt: 0 },
                OR: [
                    { sku: { equals: cleanQuery, mode: 'insensitive' } },
                    { productCode: { equals: cleanQuery, mode: 'insensitive' } },
                    { oemNumbers: { contains: cleanQuery, mode: 'insensitive' } }
                ]
            },
            select: { id: true, sku: true, productCode: true },
            take: 5 // Take a few to check for exactness
        });

        if (parts.length === 0) return null;

        // 1. Look for exact SKU or Product Code match (highest priority)
        const strictMatch = parts.find(p => 
            (p.sku && p.sku.toLowerCase() === cleanQuery.toLowerCase()) || 
            (p.productCode && p.productCode.toLowerCase() === cleanQuery.toLowerCase())
        );

        if (strictMatch) {
            return strictMatch.id;
        }

        // 2. If exactly one result found (even if partial/OEM contains), redirect
        if (parts.length === 1) {
            return parts[0].id;
        }

        return null;
    } catch (error) {
        console.error("Direct match check error:", error);
        return null;
    }
}

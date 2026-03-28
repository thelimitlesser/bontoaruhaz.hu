import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";
import { parseProductFormData } from "@/utils/product-utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const rawFormData = parseProductFormData(formData);
        const productId = formData.get('id') as string | null;

        // 1. Validation
        if (!rawFormData.name || !rawFormData.sku || !rawFormData.priceGross || rawFormData.shippingPrice === null || isNaN(rawFormData.shippingPrice) || 
            !rawFormData.weight || !rawFormData.length || !rawFormData.width || !rawFormData.height) {
            return NextResponse.json({ error: "Hiányzó kötelező mezők!" }, { status: 400 });
        }

        // 2. Auth & Partner check
        const supabaseServer = await createClient();
        const { data: { user: authUser } } = await supabaseServer.auth.getUser();
        if (!authUser) return NextResponse.json({ error: "Be kell jelentkezned!" }, { status: 401 });

        let partner = await prisma.partnerProfile.findUnique({ where: { userId: authUser.id } });
        if (!partner) {
            let prismaUser = await prisma.user.findUnique({ where: { id: authUser.id } });
            if (!prismaUser) {
                prismaUser = await prisma.user.create({
                    data: {
                        id: authUser.id,
                        email: authUser.email!,
                        fullName: authUser.user_metadata?.full_name || 'Admin',
                        role: 'ADMIN'
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

        // 3. Images
        const imagesFiles = formData.getAll('imageFiles') as File[];
        const uploadedImageUrls: string[] = [];

        if (imagesFiles.length > 0 && imagesFiles[0].size > 0) {
            const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
            const supabase = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const cleanName = rawFormData.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
            const folderName = `${cleanName}_${Math.random().toString(36).substring(7)}`;

            const uploadPromises = imagesFiles.map(async (file) => {
                if (!file.name || file.size === 0) return null;
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
                const filePath = `${folderName}/${fileName}`;

                const processedBuffer = await sharp(buffer)
                    .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80, effort: 4 })
                    .toBuffer();

                const { error } = await supabase.storage
                    .from('part-images')
                    .upload(filePath, processedBuffer, { contentType: 'image/webp' });

                if (error) return null;
                const { data: { publicUrl } } = supabase.storage.from('part-images').getPublicUrl(filePath);
                return publicUrl;
            });

            const uploadResults = await Promise.all(uploadPromises);
            uploadedImageUrls.push(...uploadResults.filter((url): url is string => url !== null));
        }

        const finalImages = productId 
            ? [...rawFormData.existingImages.split(',').filter(Boolean), ...uploadedImageUrls].join(',')
            : uploadedImageUrls.join(',');

        // 4. Compatibilities
        let parsedCompatibilities = [];
        if (rawFormData.compatibilitiesData) {
            try { parsedCompatibilities = JSON.parse(rawFormData.compatibilitiesData); } catch (e) {}
        }

        const productData: any = {
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
            images: finalImages,
            isUniversal: rawFormData.isUniversal,
            weight: rawFormData.weight,
            height: rawFormData.height,
            width: rawFormData.width,
            length: rawFormData.length,
            packageType: rawFormData.packageType,
            shippingPrice: rawFormData.shippingPrice,
            PartCategory: rawFormData.categoryId ? { connect: { id: rawFormData.categoryId } } : undefined,
            PartSubcategory: rawFormData.subcategoryId ? { connect: { id: rawFormData.subcategoryId } } : undefined,
            PartItem: rawFormData.partItemId ? { connect: { id: rawFormData.partItemId } } : undefined,
            VehicleBrand: rawFormData.brandId ? { connect: { id: rawFormData.brandId } } : undefined,
            VehicleModel: rawFormData.modelId ? { connect: { id: rawFormData.modelId } } : undefined,
            yearFrom: rawFormData.yearFrom,
            yearTo: rawFormData.yearTo,
            tecdocKTypes: formData.get('tecdocKTypes') as string || "",
            compatibilities: {
                deleteMany: productId ? {} : undefined,
                create: parsedCompatibilities.map((c: any) => ({
                    brandId: c.brandId,
                    modelId: c.modelId,
                    yearFrom: c.yearFrom ? parseInt(c.yearFrom) : null,
                    yearTo: c.yearTo ? parseInt(c.yearTo) : null,
                }))
            }
        };

        if (productId) {
            await prisma.part.update({ where: { id: productId }, data: productData });
        } else {
            productData.partner = { connect: { id: partner.id } };
            await prisma.part.create({ data: productData });
        }

        revalidatePath('/admin/inventory');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

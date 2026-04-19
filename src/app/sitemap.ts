import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getProductUrl } from '@/utils/slug'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.bontoaruhaz.hu'

    // Static routes
    const staticRoutes = [
        '',
        '/about',
        '/contact',
        '/faq',
        '/impressum',
        '/privacy',
        '/terms',
        '/warranty',
        '/how-it-works',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Brand & Model routes from Database (only those with stock)
    let dynamicRoutes: any[] = [];
    try {
        const activeBrands = await prisma.vehicleBrand.findMany({
            where: {
                OR: [
                    { Part: { some: { stock: { gt: 0 } } } },
                    { VehicleModel: { some: {
                        OR: [
                            { Part: { some: { stock: { gt: 0 } } } },
                            { PartCompatibility: { some: { part: { stock: { gt: 0 } } } } }
                        ]
                    }}}
                ]
            },
            select: { slug: true, id: true, VehicleModel: {
                where: {
                    OR: [
                        { Part: { some: { stock: { gt: 0 } } } },
                        { PartCompatibility: { some: { part: { stock: { gt: 0 } } } } }
                    ]
                },
                select: { slug: true }
            }}
        });

        activeBrands.forEach((brand: any) => {
            // Brand page
            dynamicRoutes.push({
                url: `${baseUrl}/brand/${brand.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            });

            // Model pages for this brand
            brand.VehicleModel.forEach((model: any) => {
                dynamicRoutes.push({
                    url: `${baseUrl}/brand/${brand.slug}/${model.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.5,
                });
            });
        });
    } catch (e) {
        console.error("Dynamic routes sitemap error:", e);
    }

    // Product routes from Database
    let productRoutes: any[] = [];
    try {
        const products = await prisma.part.findMany({
            where: { stock: { gt: 0 } },
            select: { 
                id: true, 
                name: true, 
                sku: true, 
                createdAt: true,
                VehicleBrand: { select: { name: true } },
                VehicleModel: { select: { name: true } }
            },
            take: 10000 // Increased limit to cover the vast majority of active products
        });
        
        productRoutes = products.map(p => {
            const productUrl = getProductUrl({
                id: p.id,
                name: p.name,
                brandName: p.VehicleBrand?.name,
                modelName: p.VehicleModel?.name,
                sku: p.sku
            });
            return {
                url: `${baseUrl}${productUrl}`,
                lastModified: p.createdAt,
                changeFrequency: 'daily' as const,
                priority: 0.7,
            };
        });
    } catch (e) {
        console.error("Sitemap generation error:", e);
    }

    return [...staticRoutes, ...dynamicRoutes, ...productRoutes]
}

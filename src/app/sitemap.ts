import { MetadataRoute } from 'next'
import { brands } from '@/lib/vehicle-data'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://bontoaruhaz.hu'

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

    // Brand routes
    const brandRoutes = brands
        .filter((brand) => !brand.hidden)
        .map((brand) => ({
            url: `${baseUrl}/brand/${brand.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))

    // Product routes from Database
    let productRoutes: any[] = [];
    try {
        const products = await prisma.part.findMany({
            select: { id: true, createdAt: true },
            take: 2000 // Increased limit for better coverage
        });
        
        productRoutes = products.map(p => ({
            url: `${baseUrl}/product/${p.id}`,
            lastModified: p.createdAt,
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }));
    } catch (e) {
        console.error("Sitemap generation error:", e);
    }

    return [...staticRoutes, ...brandRoutes, ...productRoutes]
}

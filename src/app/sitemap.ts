import { MetadataRoute } from 'next'
import { brands } from '@/lib/vehicle-data'

export default function sitemap(): MetadataRoute.Sitemap {
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

    return [...staticRoutes, ...brandRoutes]
}

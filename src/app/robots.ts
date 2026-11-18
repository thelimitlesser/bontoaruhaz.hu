import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/profile/', '/checkout', '/orders'],
            },
            {
                // Aggressive scrapers, AI crawlers and third-party SEO audit bots that drain CPU & CDN bandwidth
                userAgent: [
                    'AhrefsBot',
                    'SemrushBot',
                    'MJ12bot',
                    'DotBot',
                    'PetalBot',
                    'DataForSeoBot',
                    'Bytespider',
                    'Amazonbot',
                    'ClaudeBot',
                    'CCBot',
                    'GPTBot',
                    'ChatGPT-User',
                    'Google-Extended',
                    'PerplexityBot',
                    'Baiduspider',
                    'YandexBot',
                    'Sogou',
                    'SeekportBot'
                ],
                disallow: ['/'],
            }
        ],
        sitemap: 'https://www.bontoaruhaz.hu/sitemap.xml',
    }
}

import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/private/', '/auth/'],
            },
            {
                userAgent: ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot'],
                allow: '/',
                disallow: ['/admin/', '/api/', '/private/', '/auth/'],
            },
            {
                userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'PetalBot'],
                disallow: '/',
            },
        ],
        sitemap: 'https://tolzy.me/sitemap.xml',
    };
}

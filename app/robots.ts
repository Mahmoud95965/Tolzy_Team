import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/private/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
            },
            {
                userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot'],
                disallow: '/',
            },
        ],
        sitemap: 'https://tolzy.me/sitemap.xml',
    };
}

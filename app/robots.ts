import { MetadataRoute } from 'next';

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
        sitemap: 'https://www.tolzy.me/sitemap.xml',
    };
}

import type { Metadata } from 'next';
import ToolsPage from '@/src/views/ToolsPage';

// Generate metadata dynamically based on search params (e.g. category)
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const category = resolvedSearchParams?.category;

    if (category && typeof category === 'string' && category !== 'All') {
        const { generateCategoryMetadata } = await import('@/src/utils/seoHelpers');
        // Defaulting to 50+ tools for category pages to keep it fast
        // In a real scenario, we could query the count specifically
        return generateCategoryMetadata(category, 50);
    }

    return {
        title: 'جميع الأدوات - دليل شامل 630+ أداة ذكاء اصطناعي',
        description: 'استكشف أكبر دليل عربي لأدوات الذكاء الاصطناعي. أكثر من 630 أداة مع تقييمات حقيقية، مقارنات احترافية، ومراجعات مفصلة. ChatGPT، Gemini، Claude، Midjourney، DALL-E وأكثر. ابحث عن الأداة المثالية لمشروعك.',
        keywords: [
            'أدوات ذكاء اصطناعي',
            'AI tools',
            'reimaginehome مجاني',
            'كاتب مقالات ذكي مجاني',
            'أدوات أتمتة سير عمل الذكاء الاصطناعي',
            'موقع reimagine home',
            'podcast adobe com enhance',
            'اداه كاتب المقالات',
            'adobe podcast enhance',
            'Itz me',
            'ltz. me',
            'ChatGPT',
            'Google Gemini',
            'Claude AI',
            'Midjourney',
            'DALL-E',
            'تقييم أدوات AI',
            'مقارنة أدوات الذكاء الاصطناعي',
            'أفضل أدوات AI 2026',
            'دليل أدوات الذكاء الاصطناعي',
        ],
        openGraph: {
            title: 'جميع الأدوات - دليل شامل 500+ أداة ذكاء اصطناعي',
            description: 'أكبر دليل عربي لأدوات الذكاء الاصطناعي مع تقييمات ومقارنات احترافية',
            url: 'https://tolzy.me/tools',
            type: 'website',
            locale: 'ar_EG',
            siteName: 'Tolzy',
            images: [
                {
                    url: 'https://tolzy.me/Logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'Tolzy - دليل أدوات الذكاء الاصطناعي',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'جميع الأدوات - Tolzy',
            description: 'أكبر دليل عربي لأدوات الذكاء الاصطناعي',
            images: ['https://tolzy.me/Logo.png'],
        },
        alternates: {
            canonical: 'https://tolzy.me/tools',
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default function Tools() {
    return <ToolsPage />;
}

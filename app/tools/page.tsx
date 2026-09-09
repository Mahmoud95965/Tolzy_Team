import type { Metadata } from 'next';
import ToolsPage from '@/src/views/ToolsPage';
import { getToolsCountFromFirebase } from '@/lib/firebase-admin';
import { generateCollectionPageSchema } from '@/src/utils/seoHelpers';

export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours (ISR)

// Generate metadata dynamically based on search params (e.g. category)
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const category = resolvedSearchParams?.category;

    if (category && typeof category === 'string' && category !== 'All') {
        const { generateCategoryMetadata } = await import('@/src/utils/seoHelpers');
        return generateCategoryMetadata(category, 50);
    }

    return {
        title: 'جميع الأدوات - دليل شامل +1000 أداة ذكاء اصطناعي',
        description: 'استكشف أكبر دليل عربي لأدوات الذكاء الاصطناعي. أكثر من 1000 أداة مع تقييمات حقيقية، مقارنات احترافية، ومراجعات مفصلة. ChatGPT، Gemini، Claude، Midjourney، DALL-E وأكثر. ابحث عن الأداة المثالية لمشروعك.',
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
            title: 'جميع الأدوات - دليل شامل +1000 أداة ذكاء اصطناعي',
            description: 'أكبر دليل عربي لأدوات الذكاء الاصطناعي مع تقييمات ومقارنات احترافية',
            url: 'https://tolzy.me/tools',
            type: 'website',
            locale: 'ar_EG',
            siteName: 'Tolzy',
            images: [
                {
                    url: 'https://tolzy.me/image/tools/Hero.png',
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
            images: ['https://tolzy.me/image/tools/Hero.png'],
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

export default async function Tools() {
    let totalTools = 1000;
    try {
        const count = await getToolsCountFromFirebase();
        if (count && count > 0) totalTools = count;
    } catch (error) {
        console.error('❌ Error fetching tools count for schema:', error);
    }

    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'جميع أدوات الذكاء الاصطناعي - دليل Tolzy الشامل',
        'description': `استكشف أكبر دليل عربي لأدوات الذكاء الاصطناعي تضم أكثر من ${totalTools} أداة مصنفة ومراجعة بدقة.`,
        'url': 'https://tolzy.me/tools',
        'numberOfItems': totalTools,
        'isPartOf': {
            '@type': 'WebSite',
            'name': 'Tolzy',
            'url': 'https://tolzy.me'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <ToolsPage />
        </>
    );
}

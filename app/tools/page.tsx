import type { Metadata } from 'next';
import ToolsPage from '@/src/views/ToolsPage';
import { getAllToolsFromFirebase } from '@/lib/firebase-admin';
import { generateCollectionPageSchema } from '@/src/utils/seoHelpers';

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
            title: 'جميع الأدوات - دليل شامل 630+ أداة ذكاء اصطناعي',
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
    let tools: any[] = [];
    try {
        tools = await getAllToolsFromFirebase();
    } catch (error) {
        console.error('❌ Error fetching tools for tools page schema:', error);
    }

    // Limit to the first 100 tools for schema speed and Google Search Console loading limits
    const schemaItems = tools.slice(0, 100).map((tool: any) => ({
        name: tool.name,
        description: tool.description || `أداة ذكاء اصطناعي مميزة ومجانية لمختلف التخصصات.`,
        url: `https://tolzy.me/tools/${tool.id}`,
        imageUrl: tool.imageUrl || 'https://tolzy.me/image/tools/Hero.png',
    }));

    const collectionSchema = generateCollectionPageSchema(
        'جميع أدوات الذكاء الاصطناعي - دليل Tolzy الشامل',
        'استكشف أكبر دليل عربي لأدوات الذكاء الاصطناعي. أكثر من 630 أداة مع تقييمات حقيقية ومراجعات مفصلة.',
        'https://tolzy.me/tools',
        schemaItems
    );

    return (
        <>
            {schemaItems.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
                />
            )}
            <ToolsPage />
        </>
    );
}

import type { Metadata } from 'next';
import ToolDetailPage from '@/src/views/ToolDetailPage';
import { getAllToolsFromFirebase, getToolByIdFromFirebase } from '@/lib/firebase-admin';
import { getFallbackToolById } from '@/src/data/fallbackTools';
import { generateBreadcrumbData, mapToStandardCategory } from '@/src/utils/seoHelpers';

type Props = {
    params: Promise<{ id: string }>;
};

async function resolveTool(id: string): Promise<any> {
    let tool: any = null;
    try {
        tool = await getToolByIdFromFirebase(id);
    } catch {}

    if (!tool) {
        tool = getFallbackToolById(id);
    }

    if (!tool) {
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const supabaseKey =
                process.env.SUPABASE_SERVICE_ROLE_KEY ||
                process.env.SUPABASE_KEY ||
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                '';
            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const cleanId = decodeURIComponent(id).trim();
                const { data } = await supabase
                    .from('tools_embeddings')
                    .select('*')
                    .or(`id.eq.${cleanId},name.ilike.${cleanId}`)
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    let cleanDesc = String(data.description || '');
                    const descMatch = cleanDesc.match(/\[الوصف الدقيق\]:\s*([^\n]+)/);
                    if (descMatch && descMatch[1]) {
                        cleanDesc = descMatch[1].trim();
                    } else {
                        cleanDesc = cleanDesc.split('\n')[0].replace(/\[.*?\]:\s*/g, '');
                    }

                    tool = {
                        id: data.id,
                        name: data.name,
                        description: cleanDesc || data.description,
                        longDescription: data.description || '',
                        category: data.category || 'General',
                        pricing: 'Freemium',
                        url: data.link || '',
                        imageUrl: '/tolzy-logo.svg',
                        tags: [],
                        features: [],
                        rating: 4.8,
                        reviewCount: 10,
                        votingStats: { helpfulCount: 12, notHelpfulCount: 0, totalVotes: 12 },
                        votes: { helpful: [], notHelpful: [] },
                        savedBy: [],
                    };
                }
            }
        } catch {}
    }

    return tool;
}

// Generate static paths for tools - Returning placeholder allows ISR without quota exhaustion
export async function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

// Generate dynamic metadata focusing on high-CTR Arabic formulas
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const tool = await resolveTool(id);

    if (!tool) {
        return {
            title: {
                absolute: 'الأداة غير موجودة — TOLZY',
            },
            description: 'لم يتم العثور على الأداة المطلوبة في دليل أدوات TOLZY.',
        };
    }

    // High CTR Title & Description Formulas
    const title = `شرح وأفضل بدائل أداة ${tool.name} | المميزات والعيوب والأسعار — TOLZY`;
    const description = `اكتشف كل ما يخص أداة ${tool.name}: هل هي مجانية؟ هل تدعم اللغة العربية؟ تعرف على أهم المميزات والعيوب وروابط الاستخدام المباشر على دليل TOLZY.`;
    const categoryStr = Array.isArray(tool.category) ? tool.category[0] : (tool.category || 'أدوات الذكاء الاصطناعي');

    return {
        title: {
            absolute: title,
        },
        description,
        keywords: [
            tool.name,
            ...(tool.tags || []),
            categoryStr,
            'أداة ذكاء اصطناعي',
            'AI tool',
            tool.pricing === 'Free' ? 'مجاني' : '',
            `بدائل ${tool.name}`,
            `شرح ${tool.name}`,
            `سعر ${tool.name}`,
            'TOLZY',
            'دليل أدوات الذكاء الاصطناعي'
        ].filter(Boolean),
        openGraph: {
            title,
            description,
            url: `https://tolzy.me/tools/${tool.id}`,
            type: 'website',
            locale: 'ar_AR',
            siteName: 'TOLZY',
            images: [
                {
                    url: tool.imageUrl || 'https://tolzy.me/image/tools/Hero.png',
                    width: 1200,
                    height: 630,
                    alt: tool.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [tool.imageUrl || 'https://tolzy.me/image/tools/Hero.png'],
        },
        alternates: {
            canonical: `https://tolzy.me/tools/${tool.id}`,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function ToolDetail({ params }: Props) {
    const { id } = await params;
    const tool = await resolveTool(id);

    if (!tool) {
        return <ToolDetailPage initialTool={null} />;
    }

    // 1. SoftwareApplication JSON-LD Schema
    const softwareAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': tool.name,
        'description': tool.description,
        'applicationCategory': mapToStandardCategory(tool.category),
        'operatingSystem': 'Web',
        'url': tool.url || `https://tolzy.me/tools/${tool.id}`,
        'image': tool.imageUrl || 'https://tolzy.me/image/tools/Hero.png',
        'offers': {
            '@type': 'Offer',
            'price': tool.pricing === 'Free' ? '0' : (tool.pricing === 'Freemium' ? '0' : '10'),
            'priceCurrency': 'USD',
            'availability': 'https://schema.org/InStock',
            'category': tool.pricing
        },
        ...(tool.rating && tool.rating > 0 ? {
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': tool.rating,
                'reviewCount': tool.reviewCount && tool.reviewCount > 0 ? tool.reviewCount : 1,
                'bestRating': '5',
                'worstRating': '1'
            }
        } : {}),
        'author': {
            '@type': 'Organization',
            'name': 'TOLZY',
            'url': 'https://tolzy.me'
        }
    };

    // 2. Automatic FAQPage JSON-LD Schema (Pricing, Main Use Case, Alternatives)
    const pricingDesc = tool.pricing === 'Free' 
        ? 'مجانية بالكامل (Free) بدون رسوم' 
        : tool.pricing === 'Freemium' 
            ? 'توفر خطة مجانية تتيح التجربة (Freemium) مع إمكانية الترقية للباقات المدفوعة' 
            : tool.pricing === 'Subscription' 
                ? 'تعتمد على اشتراك دوري (Subscription)' 
                : 'مدفوعة بالكامل (Paid)';

    const categoryDesc = Array.isArray(tool.category) ? tool.category.join(' و ') : (tool.category || 'التقنية والذكاء الاصطناعي');
    const mainFeatures = Array.isArray(tool.features) && tool.features.length > 0 
        ? tool.features.slice(0, 3).join('، ') 
        : (tool.description || 'تسهيل المهام وتوفير الوقت بالذكاء الاصطناعي');

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': `ما هي باقات وأسعار أداة ${tool.name}؟ وهل تتوفر نسخة مجانية؟`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `أداة ${tool.name} تقدم نموذج تسعير ${pricingDesc}. يمكنك التعرف على كافة التفاصيل والروابط المباشرة عبر دليل TOLZY.`
                }
            },
            {
                '@type': 'Question',
                'name': `ما هو الاستخدام الرئيسي لأداة ${tool.name} وما هي أبرز ميزاتها؟`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `تُستخدم أداة ${tool.name} بشكل أساسي في مجال ${categoryDesc}. وهي مخصصة لـ: ${tool.description || mainFeatures}. ومن أهم ميزاتها: ${mainFeatures}.`
                }
            },
            {
                '@type': 'Question',
                'name': `ما هي أفضل بدائل أداة ${tool.name} المتاحة على منصة TOLZY؟`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `يوفر دليل TOLZY قائمة محدثة بأفضل بدائل ${tool.name} في تصنيف ${categoryDesc}، حيث يمكنك مقارنة الإيجابيات والسلبيات والتسعير لاختيار الأداة الأنسب.`
                }
            }
        ]
    };

    // 3. Breadcrumbs Schema
    const getCategoryString = (cat: any) => Array.isArray(cat) ? cat[0] : (cat || 'أدوات');
    const categoryStr = getCategoryString(tool.category);
    
    const breadcrumbs = generateBreadcrumbData([
        { name: 'الرئيسية', url: 'https://tolzy.me' },
        { name: 'الأدوات', url: 'https://tolzy.me/tools' },
        { name: categoryStr, url: `https://tolzy.me/tools?category=${encodeURIComponent(categoryStr)}` },
        { name: tool.name, url: `https://tolzy.me/tools/${tool.id}` }
    ]);

    const schemas = [softwareAppSchema, faqSchema, breadcrumbs];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
            />
            <ToolDetailPage initialTool={tool} />
        </>
    );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour

import type { Metadata } from 'next';
import AboutPage from '@/src/views/AboutPage';
import { generateTolzyEcosystemData } from '@/src/utils/seoHelpers';

export const metadata: Metadata = {
    title: 'من نحن - Tolzy | المنصة العربية الرائدة لأدوات الذكاء الاصطناعي',
    description: 'تعرف على Tolzy - المنصة العربية الرائدة في تقديم دليل شامل لأكثر من 630 أداة ذكاء اصطناعي، كورسات برمجة مجانية مع Tolzy Learn، ومشاريع مفتوحة المصدر. مهمتنا: تبسيط الوصول إلى تقنيات الذكاء الاصطناعي للمحتوى العربي.',
    keywords: [
        'Tolzy',
        'تولزي',
        'عن Tolzy',
        'منصة عربية للذكاء الاصطناعي',
        'دليل أدوات AI',
        'تعليم البرمجة بالعربي',
        'محتوى تقني عربي',
    ],
    openGraph: {
        title: 'من نحن - Tolzy',
        description: 'المنصة العربية الرائدة في تقديم دليل شامل لأدوات الذكاء الاصطناعي والتعليم التقني',
        url: 'https://tolzy.me/about',
        type: 'website',
        locale: 'ar_EG',
        siteName: 'Tolzy',
        images: [
            {
                url: 'https://tolzy.me/Logo.png',
                width: 1200,
                height: 630,
                alt: 'Tolzy - عن المنصة',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'من نحن - Tolzy',
        description: 'المنصة العربية الرائدة في تقديم دليل شامل لأدوات الذكاء الاصطناعي',
        images: ['https://tolzy.me/Logo.png'],
    },
    alternates: {
        canonical: 'https://tolzy.me/about',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function About() {
    const ecosystemSchema = generateTolzyEcosystemData();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ecosystemSchema) }}
            />
            <AboutPage />
        </>
    );
}

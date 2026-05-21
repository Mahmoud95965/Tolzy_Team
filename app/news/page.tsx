import type { Metadata } from 'next';
import NewsPage from '@/src/views/NewsPage';

export const metadata: Metadata = {
    title: 'أخبار وشروحات الذكاء الاصطناعي: آخر التطورات + دروس عملية',
    description: 'لا تفوّت أي جديد! تابع آخر أخبار الذكاء الاصطناعي من OpenAI وGoogle وMeta، بالإضافة إلى شروحات مفصّلة تعلّمك استخدام أدوات AI خطوة بخطوة باللغة العربية.',
    openGraph: {
        title: 'أخبار وشروحات الذكاء الاصطناعي: آخر التطورات + دروس عملية',
        description: 'أخبار AI لحظة بلحظة + شروحات عملية بالعربي',
        url: 'https://tolzy.me/news',
    },
    alternates: {
        canonical: 'https://tolzy.me/news',
    },
};

export default function News() {
    return <NewsPage />;
}

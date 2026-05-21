import type { Metadata } from 'next';
import PricingPage from '@/src/views/PricingPage';

export const metadata: Metadata = {
    title: 'باقات الأسعار والاشتراك في Tolzy Pro',
    description: 'اشترك في باقة Tolzy Pro لتجربة أدوات ذكاء اصطناعي غير محدودة، سرعة سيرفر فائقة، والوصول لأقوى الميزات والخدمات. ابدأ تطوير مهاراتك ومشاريعك اليوم.',
    keywords: [
        'أسعار تولزي',
        'باقات تولزي',
        'اشتراك Tolzy Pro',
        'Vodafone Cash AI',
        'أدوات ذكاء اصطناعي غير محدودة',
        'Tolzy subscription',
        'تفعيل حساب تولزي',
        'باقة المحترفين ذكاء اصطناعي',
    ],
    openGraph: {
        title: 'باقات الأسعار والاشتراك في Tolzy Pro',
        description: 'أطلق العنان لإنتاجيتك مع صلاحيات كاملة وأدوات ذكاء اصطناعي مصممة خصيصاً للمحترفين وصناع المحتوى.',
        url: 'https://tolzy.me/pricing',
        type: 'website',
        locale: 'ar_EG',
        siteName: 'Tolzy',
        images: [
            {
                url: 'https://tolzy.me/image/tools/Hero.png',
                width: 1200,
                height: 630,
                alt: 'Tolzy Pro الباقات والأسعار',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'باقات الأسعار والاشتراك في Tolzy Pro',
        description: 'اشترك في باقة Tolzy Pro لتجربة أدوات ذكاء اصطناعي غير محدودة.',
        images: ['https://tolzy.me/image/tools/Hero.png'],
    },
    alternates: {
        canonical: 'https://tolzy.me/pricing',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function Pricing() {
    return <PricingPage />;
}
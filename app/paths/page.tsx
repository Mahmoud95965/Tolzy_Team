import type { Metadata } from 'next';
import TolzyPathsPage from '@/src/views/TolzyPathsPage';

export const metadata: Metadata = {
    title: 'مسارات تعلّم البرمجة والذكاء الاصطناعي: خطة واضحة نحو الاحتراف',
    description: 'مسارات تعليمية منظمة من الصفر حتى الاحتراف في البرمجة والذكاء الاصطناعي. خطط دراسية عملية وكورسات مرتبة تأخذك خطوة بخطوة.',
    openGraph: {
        title: 'مسارات تعلّم البرمجة والذكاء الاصطناعي: خطة واضحة نحو الاحتراف',
        description: 'مسارات تعليمية منظمة من الصفر حتى الاحتراف',
        url: 'https://tolzy.me/paths',
    },
    alternates: {
        canonical: 'https://tolzy.me/paths',
    },
};

export default function Paths() {
    return <TolzyPathsPage />;
}

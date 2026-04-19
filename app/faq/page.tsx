import type { Metadata } from 'next';
import FAQPage from '@/src/views/FAQPage';

export const metadata: Metadata = {
    title: 'كل ما تريد معرفته عن Tolzy: أسئلة وإجابات',
    description: 'إجابات واضحة ومباشرة على كل أسئلتك حول Tolzy وأدوات الذكاء الاصطناعي. اكتشف كيف تستفيد من المنصة بأقصى قدر.',
    openGraph: {
        title: 'كل ما تريد معرفته عن Tolzy: أسئلة وإجابات',
        description: 'إجابات على الأسئلة الأكثر شيوعاً حول Tolzy وأدوات AI',
        url: 'https://www.tolzy.me/faq',
    },
};

export default function FAQ() {
    return <FAQPage />;
}

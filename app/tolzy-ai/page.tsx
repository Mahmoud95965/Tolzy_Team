import TolzyAIPage from '@/src/views/TolzyAIPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'مختبر Tolzy AI: جرّب أحدث نماذج الذكاء الاصطناعي بنفسك',
    description: 'جرّب أقوى نماذج الذكاء الاصطناعي مباشرة داخل Tolzy — Gemini Pro، توليد الصور، وأكثر. مختبر تفاعلي مجاني لاستكشاف قدرات AI الحقيقية.',
    keywords: [
        'tolzy ai',
        'gemini pro',
        'تجارب ذكاء اصطناعي',
        'نماذج AI',
        'مختبر ذكاء اصطناعي',
        'جرب AI مجاناً',
    ],
    openGraph: {
        title: 'مختبر Tolzy AI: جرّب أحدث نماذج الذكاء الاصطناعي بنفسك',
        description: 'مختبر تفاعلي مجاني لاستكشاف قدرات الذكاء الاصطناعي الحقيقية',
        url: 'https://tolzy.me/tolzy-ai',
    }
};

export default function Page() {
    return <TolzyAIPage />;
}

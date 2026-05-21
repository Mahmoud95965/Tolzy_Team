import type { Metadata } from 'next';
import BeginnerGuidePage from '@/src/views/BeginnerGuidePage';

export const metadata: Metadata = {
    title: 'من أين أبدأ؟ دليل المبتدئين الشامل لأدوات AI',
    description: 'لا تعرف من أين تبدأ مع الذكاء الاصطناعي؟ دليل مبسّط خطوة بخطوة لاستخدام ChatGPT وGemini وأقوى أدوات AI — حتى لو أول مرة!',
    openGraph: {
        title: 'من أين أبدأ؟ دليل المبتدئين الشامل لأدوات AI',
        description: 'دليل مبسّط خطوة بخطوة لاستخدام أقوى أدوات الذكاء الاصطناعي',
        url: 'https://tolzy.me/guide',
    },
    alternates: {
        canonical: 'https://tolzy.me/guide',
    },
};

export default function Guide() {
    return <BeginnerGuidePage />;
}

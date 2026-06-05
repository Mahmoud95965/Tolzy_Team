import type { Metadata } from 'next';
import PulsePage from '@/src/views/PulsePage';

export const metadata: Metadata = {
    title: 'TOLZY Pulse | نبض التحديثات والميزات الجديدة في تولزي',
    description: 'تابع نبض التحديثات والميزات الجديدة في Tolzy AI — ميزات مبتكرة، تحسينات الأداء وثورة الكوبيلوت والمجتمع في مكان واحد.',
    openGraph: {
        title: 'TOLZY Pulse | نبض التحديثات والميزات الجديدة في تولزي',
        description: 'تابع نبض التحديثات والميزات الجديدة في Tolzy AI — ميزات مبتكرة، تحسينات الأداء ومستودعات الأكواد والـ Prompts.',
        url: 'https://tolzy.me/pulse',
    },
    alternates: {
        canonical: 'https://tolzy.me/pulse',
    },
};

export default function Pulse() {
    return <PulsePage />;
}

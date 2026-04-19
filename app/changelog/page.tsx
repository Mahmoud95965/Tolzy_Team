import type { Metadata } from 'next';
import ChangelogPage from '@/src/views/ChangelogPage';

export const metadata: Metadata = {
    title: 'ما الجديد في Tolzy؟ آخر التحديثات والميزات الثورية',
    description: 'تابع كل جديد في Tolzy AI — ميزات جديدة، تحسينات ضخمة، وتحديثات مبتكرة تُغيّر طريقة استخدامك للذكاء الاصطناعي.',
    openGraph: {
        title: 'ما الجديد في Tolzy؟ آخر التحديثات والميزات الثورية',
        description: 'تابع كل جديد في Tolzy AI — ميزات وتحديثات مبتكرة',
        url: 'https://www.tolzy.me/changelog',
    },
};

export default function Changelog() {
    return <ChangelogPage />;
}

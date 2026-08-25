import type { Metadata } from 'next';
import DocsPage from '@/src/views/DocsPage';

export const metadata: Metadata = {
    title: 'توثيق TOLZY AI: الدليل الشامل لمنظومة الذكاء الاصطناعي',
    description: 'الدليل الرسمي الشامل لمنظومة TOLZY AI — تعرّف على مستشار AXIOM 2.5 Pro، بيئة Build With AI، منصة OmniLearn للتعلم الذكي، دليل الأدوات، ونظام التوكن الموحد.',
    openGraph: {
        title: 'توثيق TOLZY AI: الدليل الشامل لمنظومة الذكاء الاصطناعي',
        description: 'دليل الاستخدام والمساعدة الشامل لمنظومة أدوات وخدمات TOLZY AI',
        url: 'https://tolzy.me/docs',
    },
    alternates: {
        canonical: 'https://tolzy.me/docs',
    },
};

export default function Docs() {
    return <DocsPage />;
}

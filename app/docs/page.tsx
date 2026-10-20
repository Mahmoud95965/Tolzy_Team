import type { Metadata } from 'next';
import DocsPage from '@/src/views/DocsPage';

export const metadata: Metadata = {
    title: 'توثيق TOLZY: الدليل الشامل لمنظومة وأدوات ومجتمع الذكاء الاصطناعي',
    description: 'الدليل الرسمي الشامل لمنظومة TOLZY — تعرّف على مستشار AXIOM 2.5 Pro، بيئة Build With AI، منصة OmniLearn للتعلم الذكي، دليل +1,000 أداة، ومجتمع المطورين وحزم الأدوات التقنية.',
    openGraph: {
        title: 'توثيق TOLZY: الدليل الشامل لمنظومة وأدوات ومجتمع الذكاء الاصطناعي',
        description: 'دليل الاستخدام والمساعدة الشامل لمنظومة أدوات وخدمات TOLZY المفتوحة والمجانية 100% بدون أي قيود.',
        url: 'https://tolzy.me/docs',
    },
    alternates: {
        canonical: 'https://tolzy.me/docs',
    },
};

export default function Docs() {
    return <DocsPage />;
}

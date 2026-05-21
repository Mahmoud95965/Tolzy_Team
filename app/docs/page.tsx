import type { Metadata } from 'next';
import DocsPage from '@/src/views/DocsPage';

export const metadata: Metadata = {
    title: 'توثيق Tolzy: دليلك الشامل لمنصة الذكاء الاصطناعي',
    description: 'دليل الاستخدام الشامل لأدوات وإعدادات منصة Tolzy. تعلم كيفية استخدام T O L Z Y AI و Copilot وكتابة المطالبات باحترافية.',
    openGraph: {
        title: 'توثيق Tolzy: دليلك الشامل',
        description: 'دليل الاستخدام والمساعدة لمنصة Tolzy AI',
        url: 'https://tolzy.me/docs',
    },
    alternates: {
        canonical: 'https://tolzy.me/docs',
    },
};

export default function Docs() {
    return <DocsPage />;
}

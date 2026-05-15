import type { Metadata } from 'next';
import BuildWithAIPage from '@/src/views/BuildWithAIPage';

export const metadata: Metadata = {
    title: 'ابنِ مع الذكاء الاصطناعي | Tolzy Build',
    description: 'أدخل فكرة مشروعك واحصل على خطة بناء كاملة ومنظمة: الميزات، التقنيات، الخطوات، والبرومبتات الجاهزة. من Tolzy AI.',
    keywords: 'build with ai, tolzy build, بناء مشروع, خطة مشروع, ذكاء اصطناعي',
};

export default function Page() {
    return <BuildWithAIPage />;
}

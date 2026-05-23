import type { Metadata } from 'next';
import BuildWithAIPage from '@/src/views/BuildWithAIPage';

export const metadata: Metadata = {
    title: 'ابنِ مشروعك بالذكاء الاصطناعي | Tolzy Build - هندسة المشاريع البرمجية',
    description: 'ابنِ مشروعك وموقعك بالذكاء الاصطناعي مع Tolzy Build. أدخل فكرة تطبيقك واحصل فوراً على خطة هندسية متكاملة مصممة للمطورين: الميزات، التقنيات المناسبة، البنية التحتية، البرومبتات، وخطوات البرمجة المنظمة بالكامل بالعربية.',
    keywords: 'build with ai, tolzy build, بناء موقع بالذكاء الاصطناعي, هندسة المشاريع البرمجية, خطة عمل تطبيق, توليد أكواد برمجية, برومبتات جاهزة للمطورين, ذكاء اصطناعي للمبرمجين, برمجة المواقع بالعربي',
};

export default function Page() {
    return <BuildWithAIPage />;
}

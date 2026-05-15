import type { Metadata } from 'next';
import MyProjectsPage from '@/src/views/MyProjectsPage';

export const metadata: Metadata = {
    title: 'مشاريعي | Tolzy Build',
    description: 'عرض جميع مشاريعك التي تم إنشاؤها باستخدام ميزة "ابنِ مع الذكاء الاصطناعي" من Tolzy.',
};

export default function Page() {
    return <MyProjectsPage />;
}

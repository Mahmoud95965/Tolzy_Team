import type { Metadata } from 'next';
import ProjectDetailPage from '@/src/views/ProjectDetailPage';

export const metadata: Metadata = {
    title: 'تفاصيل المشروع | Tolzy Build',
    description: 'عرض تفاصيل خطة البناء الكاملة لمشروعك.',
};

export async function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

export default function Page() {
    return <ProjectDetailPage />;
}

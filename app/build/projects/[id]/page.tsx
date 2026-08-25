import type { Metadata } from 'next';
import ProjectDetailPage from '@/src/views/ProjectDetailPage';

export const metadata: Metadata = {
    title: 'تفاصيل المشروع | Tolzy Build',
    description: 'عرض تفاصيل خطة البناء الكاملة لمشروعك ورابطه المباشر.',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return <ProjectDetailPage />;
}

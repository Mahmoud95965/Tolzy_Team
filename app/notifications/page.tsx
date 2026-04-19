import type { Metadata } from 'next';
import NotificationsPage from '@/src/views/NotificationsPage';

export const metadata: Metadata = {
    title: 'الإشعارات | تولزي',
    description: 'تابع تفاعل المجتمع مع منشوراتك على منصة تولزي.',
};

export default function Page() {
    return <NotificationsPage />;
}

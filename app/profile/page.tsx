import type { Metadata } from 'next';
import ProfilePage from '@/src/views/ProfilePage';

export const metadata: Metadata = {
    title: 'الملف الشخصي - Tolzy',
    description: 'إدارة ملفك الشخصي وأدواتك المحفوظة في Tolzy.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function Profile() {
    return <ProfilePage />;
}

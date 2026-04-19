import type { Metadata } from 'next';
import AuthPage from '@/src/views/AuthPage';

export const metadata: Metadata = {
    title: 'تسجيل الدخول - Tolzy',
    description: 'سجل الدخول أو أنشئ حساب جديد في Tolzy للوصول إلى المزايا الحصرية وحفظ أدواتك المفضلة.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function Auth() {
    return <AuthPage />;
}

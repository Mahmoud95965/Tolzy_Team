import type { Metadata } from 'next';
import AuthPage from '@/src/views/AuthPage';

export const metadata: Metadata = {
    title: 'تسجيل الدخول وإنشاء حساب — TOLZY',
    description: 'سجل الدخول أو أنشئ حساب جديد مجاناً في دليل ومحرك بحث TOLZY للوصول إلى المزايا المخصصة وحفظ أدواتك المفضلة ومتابعة الكورسات.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function Auth() {
    return <AuthPage />;
}

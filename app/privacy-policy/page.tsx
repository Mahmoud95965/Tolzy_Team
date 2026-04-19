import type { Metadata } from 'next';
import PrivacyPolicyPage from '@/src/views/PrivacyPolicyPage';

export const metadata: Metadata = {
    title: 'سياسة الخصوصية - Tolzy',
    description: 'سياسة الخصوصية وحماية البيانات في Tolzy. تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية.',
    openGraph: {
        title: 'سياسة الخصوصية - Tolzy',
        description: 'سياسة الخصوصية وحماية البيانات في Tolzy',
        url: 'https://www.tolzy.me/privacy-policy',
    },
};

export default function PrivacyPolicy() {
    return <PrivacyPolicyPage />;
}

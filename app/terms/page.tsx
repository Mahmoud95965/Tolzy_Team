import type { Metadata } from 'next';
import TermsPage from '../../src/views/TermsPage';

export const metadata: Metadata = {
    title: 'شروط الخدمة والاستخدام - Tolzy',
    description: 'شروط الخدمة والاتفاقية القانونية لاستخدام منصة Tolzy وأدواتها. يرجى قراءة الشروط بعناية قبل استخدام خدماتنا.',
    openGraph: {
        title: 'شروط الخدمة والاستخدام - Tolzy',
        description: 'شروط الاستخدام والاتفاقية القانونية لمنصة Tolzy',
        url: 'https://tolzy.me/terms',
    },
    alternates: {
        canonical: 'https://tolzy.me/terms',
    },
};

export default function Page() {
    return <TermsPage />;
}

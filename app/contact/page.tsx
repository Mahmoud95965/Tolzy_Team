import type { Metadata } from 'next';
import ContactPage from '@/src/views/ContactPage';

export const metadata: Metadata = {
    title: 'تواصل معنا: فريق Tolzy في خدمتك',
    description: 'لديك سؤال أو اقتراح أو شراكة؟ تواصل مع فريق Tolzy مباشرة — نرد على جميع الرسائل خلال 24 ساعة.',
    openGraph: {
        title: 'تواصل معنا: فريق Tolzy في خدمتك',
        description: 'تواصل مع فريق Tolzy مباشرة',
        url: 'https://www.tolzy.me/contact',
    },
};

export default function Contact() {
    return <ContactPage />;
}

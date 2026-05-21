import type { Metadata } from 'next';
import ContactPage from '@/src/views/ContactPage';
import { generateContactPageSchema } from '@/src/utils/seoHelpers';

export const metadata: Metadata = {
    title: 'تواصل معنا: فريق Tolzy في خدمتك',
    description: 'لديك سؤال أو اقتراح أو شراكة؟ تواصل مع فريق Tolzy مباشرة — نرد على جميع الرسائل خلال 24 ساعة لخدمتك وتلبية استفساراتك.',
    openGraph: {
        title: 'تواصل معنا: فريق Tolzy في خدمتك',
        description: 'تواصل مع فريق Tolzy مباشرة للاقتراحات أو الشراكات الاستراتيجية',
        url: 'https://tolzy.me/contact',
        type: 'website',
    },
    alternates: {
        canonical: 'https://tolzy.me/contact',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function Contact() {
    const contactSchema = generateContactPageSchema();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
            />
            <ContactPage />
        </>
    );
}

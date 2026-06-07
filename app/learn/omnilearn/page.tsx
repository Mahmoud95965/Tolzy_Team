import type { Metadata } from 'next';
import TolzyOmniLearnPage from '@/src/views/TolzyOmniLearnPage';

export const metadata: Metadata = {
    title: 'TOLZY OmniLearn - معالج التعلم الذكي الفائق ومناقشة المساقات بالذكاء الاصطناعي',
    description: 'منصة TOLZY OmniLearn الذكية - تلخيص ومناقشة أي كورس على Coursera أو يوتيوب أو المقالات والمدونات التعليمية باستخدام محرك AXIOM للتفكير والتحليل. اطرح أسئلتك التقنية واحصل على إجابات هندسية فورية!',
    keywords: [
        'TOLZY OmniLearn',
        'OmniLearn',
        'AXIOM engine',
        'تلخيص كورسات Coursera',
        'الدردشة مع المقالات التعليمية',
        'تلخيص فيديوهات يوتيوب بالذكاء الاصطناعي',
        'الدردشة مع يوتيوب',
        'شرح كورسات يوتيوب بالذكاء الاصطناعي',
        'تحليل الفيديوهات بالذكاء الاصطناعي',
        'مساعد التعليم الذكي',
        'تولزي اومني ليرن'
    ],
    openGraph: {
        title: 'TOLZY OmniLearn - معالج التعلم الذكي الفائق',
        description: 'تلخيص ومناقشة أي كورس على Coursera أو يوتيوب أو المقالات والمدونات التعليمية باستخدام محرك AXIOM للتفكير والتحليل.',
        url: 'https://tolzy.me/learn/omnilearn',
        type: 'website',
        locale: 'ar_EG',
        siteName: 'TOLZY OmniLearn',
        images: [
            {
                url: 'https://tolzy.me/image/tools/Hero.png',
                width: 1200,
                height: 630,
                alt: 'TOLZY OmniLearn - معالج التعلم الذكي الفائق',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TOLZY OmniLearn - معالج التعلم الذكي الفائق',
        description: 'تلخيص ومناقشة أي كورس على Coursera أو يوتيوب أو المقالات والمدونات التعليمية باستخدام محرك AXIOM.',
        images: ['https://tolzy.me/image/tools/Hero.png'],
    },
    alternates: {
        canonical: 'https://tolzy.me/learn/omnilearn',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function OmniLearnPage() {
    return (
        <TolzyOmniLearnPage />
    );
}

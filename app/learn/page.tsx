import type { Metadata } from 'next';
import TolzyLearnPage from '@/src/views/TolzyLearnPage';
import { getAllCoursesFromFirebase } from '@/lib/firebase-admin';
import { generateCollectionPageSchema } from '@/src/utils/seoHelpers';

export const metadata: Metadata = {
    title: 'Tolzy Learn - كورسات برمجة مجانية عالية الجودة | تعلم البرمجة من الصفر',
    description: 'منصة Tolzy Learn التعليمية - أفضل كورسات البرمجة المجانية بالعربية. تعلم تطوير الويب، JavaScript، React، Python، وأكثر من خلال دورات شاملة ومشاريع عملية. ابدأ رحلتك في عالم البرمجة مجاناً الآن!',
    keywords: [
        'Tolzy Learn',
        'كورسات برمجة',
        'كورسات برمجة مجانية',
        'تعلم البرمجة',
        'تعلم البرمجة من الصفر',
        'برمجة للمبتدئين',
        'مواقع تعلم البرمجة',
        'أفضل موقع لتعلم البرمجة',
        'تعلم البرمجة أونلاين',
        'كورسات أونلاين مجانية',
        'كورسات ذكاء اصطناعي',
        'تعلم الذكاء الاصطناعي',
        'تعلم الذكاء الاصطناعي من الصفر',
        'أدوات الذكاء الاصطناعي',
        'مواقع ذكاء اصطناعي',
        'أفضل أدوات الذكاء الاصطناعي',
        'مواقع AI مجانية',
        'تعلم استخدام ChatGPT',
        'كتابة برومبتات بالذكاء الاصطناعي',
        'Python',
        'تعلم بايثون',
        'كورس بايثون',
        'كورس بايثون مجاني',
        'بايثون للمبتدئين',
        'تعلم Python بالعربي',
        'JavaScript',
        'تعلم جافاسكريبت',
        'كورس JavaScript',
        'جافاسكريبت للمبتدئين',
        'تعلم HTML',
        'تعلم CSS',
        'تعلم Front End',
        'تعلم Back End',
        'Full Stack Developer',
        'كورسات مجانية بشهادات',
        'كورسات بشهادات معتمدة',
        'شهادات برمجة مجانية',
        'كورسات Coursera مجانية',
        'كورسات Google مجانية',
        'أفضل مواقع الكورسات',
        'أفضل منصات التعلم أونلاين',
        'بديل Coursera',
        'بديل Udemy',
        'مواقع تعليم مجانية',
        'مواقع أدوات برمجة',
        'أدوات للمبرمجين',
        'مواقع تجمع أدوات الذكاء الاصطناعي',
        'أدوات AI للطلاب',
        'أدوات AI للمصممين',
        'تعلم البرمجة بدون خبرة',
        'أفضل كورس برمجة للمبتدئين',
        'من أين أبدأ تعلم البرمجة',
        'هل تعلم البرمجة صعب',
        'كيف تصبح مبرمج',
        'كورسات برمجة مجانية بالعربي',
        'تولزي ليرن',
        'تولزي أدوات',
        'tolzy ai tools',
        'tolzy learning platform',
    ],
    openGraph: {
        title: 'Tolzy Learn - كورسات برمجة مجانية عالية الجودة',
        description: 'أفضل كورسات البرمجة المجانية بالعربية. تعلم تطوير الويب والبرمجة من خلال دورات شاملة ومشاريع عملية',
        url: 'https://tolzy.me/learn',
        type: 'website',
        locale: 'ar_EG',
        siteName: 'Tolzy Learn',
        images: [
            {
                url: 'https://tolzy.me/image/tools/Hero.png',
                width: 1200,
                height: 630,
                alt: 'Tolzy Learn - تعلم البرمجة مجاناً',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tolzy Learn - كورسات برمجة مجانية',
        description: 'أفضل كورسات البرمجة المجانية بالعربية',
        images: ['https://tolzy.me/image/tools/Hero.png'],
    },
    alternates: {
        canonical: 'https://tolzy.me/learn',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function TolzyLearn() {
    let courses: any[] = [];
    try {
        courses = await getAllCoursesFromFirebase();
    } catch (error) {
        console.error('❌ Error fetching courses for learn page schema:', error);
    }

    const schemaItems = courses.map((course: any) => ({
        name: course.title,
        description: course.description || `كورس برمجة مجاني وتفاعلي لتعلم ${course.title} من الصفر بالعربية.`,
        url: `https://tolzy.me/learn/course/${course.id}`,
        imageUrl: course.thumbnail || 'https://tolzy.me/image/tools/Hero.png',
    }));

    const collectionSchema = generateCollectionPageSchema(
        'كورسات البرمجة والتعليم التقني - Tolzy Learn',
        'أفضل الكورسات التقنية والبرمجية المجانية عالية الجودة لتعلم البرمجة من الصفر باللغة العربية.',
        'https://tolzy.me/learn',
        schemaItems
    );

    return (
        <>
            {schemaItems.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
                />
            )}
            <TolzyLearnPage />
        </>
    );
}

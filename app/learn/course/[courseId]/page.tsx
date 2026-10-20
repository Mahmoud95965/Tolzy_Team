import type { Metadata } from 'next';
import TolzyCoursePlayerPage from '@/src/views/TolzyCoursePlayerPage';
import { getSmartKeywords, generateBreadcrumbData } from '@/src/utils/seoHelpers';
import { getFallbackCourseById } from '@/src/data/fallbackCourses';
import { createClient } from '@supabase/supabase-js';

// Init Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

type Props = {
    params: Promise<{ courseId: string }>;
};

// Generate static paths for courses
export async function generateStaticParams() {
    return [{ courseId: 'placeholder' }];
}

// Generate comprehensive high-CTR metadata for Tolzy Learn courses
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { courseId } = await params;
    
    let course: any = null;
    try {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .or(`id.eq.${courseId},external_id.eq.${courseId}`)
            .single();
        course = data;
    } catch (e) {
        // Fallback handled below
    }

    if (!course) {
        course = getFallbackCourseById(courseId);
    }

    if (!course) {
        return {
            title: {
                absolute: 'الكورس غير موجود — TOLZY',
            },
            description: 'لم يتم العثور على الكورس المطلوب في منصة كورس ومسارات TOLZY.',
        };
    }

    const title = `كورس ${course.title} المجاني | شرح شامل وشهادة إتمام — TOLZY`;
    const description = `ابدأ الآن دراسة ${course.title} مجاناً باللغة العربية: محتوى تدريبي عملي، مهارات وتطبيقات واقعية، وشهادة إتمام معتمدة عبر أكاديمية TOLZY.`;
    const courseImage = course.thumbnail || 'https://tolzy.me/image/tools/Hero.png';

    return {
        title: {
            absolute: title,
        },
        description,
        keywords: [
            course.title,
            course.category || '',
            ...(course.instructor ? [course.instructor] : []),
            'TOLZY',
            'Tolzy Learn',
            'كورس مجاني',
            'تعليم البرمجة بالعربي',
            'شهادة معتمدة',
            ...getSmartKeywords(course.title + ' ' + (course.category || '') + ' ' + description)
        ],
        openGraph: {
            title,
            description,
            url: `https://tolzy.me/learn/course/${courseId}`,
            type: 'article',
            locale: 'ar_AR',
            siteName: 'TOLZY',
            images: [
                {
                    url: courseImage,
                    width: 1200,
                    height: 630,
                    alt: course.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [courseImage],
        },
        alternates: {
            canonical: `https://tolzy.me/learn/course/${courseId}`,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function CoursePlayer({ params }: Props) {
    const { courseId } = await params;
    let course: any = null;
    try {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .or(`id.eq.${courseId},external_id.eq.${courseId}`)
            .single();
        course = data;
    } catch (e) {
        // Handle gracefully
    }

    if (!course) {
        course = getFallbackCourseById(courseId);
    }

    // Enhanced Course JSON-LD schema
    const courseSchema = course ? {
        '@context': 'https://schema.org',
        '@type': 'Course',
        'name': course.title,
        'description': course.description || `كورس تدريبي شامل في ${course.title} عبر منصة TOLZY.`,
        'provider': {
            '@type': 'Organization',
            'name': 'TOLZY',
            'url': 'https://tolzy.me',
            'logo': 'https://tolzy.me/image/tools/Hero.png',
        },
        'image': [course.thumbnail || 'https://tolzy.me/image/tools/Hero.png'],
        'educationalLevel': course.level || 'Beginner to Advanced',
        'inLanguage': 'ar',
        'isAccessibleForFree': true,
        'hasCourseInstance': {
            '@type': 'CourseInstance',
            'courseMode': 'online',
            'courseWorkload': course.duration || 'متغيرة حسب وتيرة التعلم الذاتي',
            'instructor': {
                '@type': 'Person',
                'name': course.instructor || 'فريق أكاديمية TOLZY'
            }
        },
        ...(course.rating ? {
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': course.rating,
                'reviewCount': course.reviewsCount || 1,
                'bestRating': '5',
                'worstRating': '1'
            }
        } : {}),
        'url': `https://tolzy.me/learn/course/${course.id || courseId}`
    } : null;

    const breadcrumbs = course ? generateBreadcrumbData([
        { name: 'الرئيسية', url: 'https://tolzy.me' },
        { name: 'الكورسات ومسارات التعلم', url: 'https://tolzy.me/learn' },
        { name: course.category || 'كورس تقني', url: `https://tolzy.me/learn?category=${encodeURIComponent(course.category || '')}` },
        { name: course.title, url: `https://tolzy.me/learn/course/${course.id || courseId}` }
    ]) : null;

    const schemas = [courseSchema, breadcrumbs].filter(Boolean);

    return (
        <>
            {schemas.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas) }}
                />
            )}
            <TolzyCoursePlayerPage initialCourse={course} />
        </>
    );
}

export const revalidate = 3600; // Revalidate every hour

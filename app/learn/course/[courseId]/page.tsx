import type { Metadata } from 'next';
import TolzyCoursePlayerPage from '@/src/views/TolzyCoursePlayerPage';
import { getSmartKeywords, generateBreadcrumbData } from '@/src/utils/seoHelpers';
import { createClient } from '@supabase/supabase-js';

// Init Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Props = {
    params: Promise<{ courseId: string }>;
};

// Generate static paths for all courses
export async function generateStaticParams() {
    try {
        const { data: courses, error } = await supabase.from('courses').select('id');
        if (error) throw error;

        return (courses || []).map((course: any) => ({
            courseId: course.id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Generate comprehensive metadata for Tolzy Learn courses
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { courseId } = await params;
    
    const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .or(`id.eq.${courseId},external_id.eq.${courseId}`)
        .single();

    if (!course) {
        return {
            title: 'الكورس غير موجود - Tolzy Learn',
        };
    }

    const courseName = course.title;
    const courseDescription = course.description || 'تعلم مهارات جديدة مع Tolzy Learn';
    const courseImage = course.thumbnail || 'https://tolzy.me/Logo.png';

    return {
        title: `${courseName} - Tolzy Learn | كورسات مجانية`,
        description: courseDescription,
        keywords: [
            courseName,
            course.category || '',
            ...(course.instructor ? [course.instructor] : []),
            'Tolzy Learn',
            'كورس مجاني',
            'تعليم البرمجة بالعربي',
            'دورة شاملة',
            ...getSmartKeywords(courseName + ' ' + (course.category || '') + ' ' + courseDescription)
        ],
        openGraph: {
            title: `${courseName} - Tolzy Learn`,
            description: courseDescription,
            url: `https://tolzy.me/learn/course/${courseId}`,
            type: 'article',
            locale: 'ar_EG',
            siteName: 'Tolzy Learn',
            images: [
                {
                    url: courseImage,
                    width: 1200,
                    height: 630,
                    alt: courseName,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${courseName} - Tolzy Learn`,
            description: courseDescription,
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
    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .or(`id.eq.${courseId},external_id.eq.${courseId}`)
        .single();

    // Enhanced Course JSON-LD schema for Tolzy Learn
    const courseSchema = course ? {
        '@context': 'https://schema.org',
        '@type': 'Course',
        'name': course.title,
        'description': course.description,
        'provider': {
            '@type': 'Organization',
            'name': 'Tolzy',
            'url': 'https://tolzy.me',
            'logo': 'https://tolzy.me/Logo.png',
            'sameAs': [
                'https://twitter.com/tolzy',
                'https://facebook.com/tolzy'
            ]
        },
        'image': [course.thumbnail || 'https://tolzy.me/Logo.png'],
        'educationalLevel': course.level, // beginner, intermediate, advanced
        'inLanguage': 'ar',
        'isAccessibleForFree': course.price === 'free',
        'hasCourseInstance': {
            '@type': 'CourseInstance',
            'courseMode': 'online',
            'instructor': {
                '@type': 'Person', // Assuming instructor is a person, adjust if Organization
                'name': course.instructor || 'Tolzy Team'
            }
        },
        'aggregateRating': course.rating ? {
            '@type': 'AggregateRating',
            'ratingValue': course.rating,
            'reviewCount': course.reviewsCount || 1 // Avoid 0 review count for valid schema
        } : undefined,
    } : null;

    const breadcrumbs = course ? generateBreadcrumbData([
        { name: 'الرئيسية', url: 'https://tolzy.me' },
        { name: 'Tolzy Learn', url: 'https://tolzy.me/learn' },
        { name: course.category || 'كورس', url: `https://tolzy.me/learn?category=${encodeURIComponent(course.category || '')}` },
        { name: course.title, url: `https://tolzy.me/learn/course/${course.id}` }
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

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { Course } from '../types/learn';
import { 
    ExternalLink, 
    Globe, 
    Clock, 
    Users, 
    ArrowLeft, 
    Sparkles, 
    CheckCircle2, 
    PlayCircle, 
    Star, 
    Award,
    BookOpen,
    Share2,
    Check,
    Cpu,
    ArrowUpRight
} from 'lucide-react';
import { getFallbackCourseById, FALLBACK_COURSES } from '../data/fallbackCourses';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

// Lazy load CourseReviews component
const CourseReviews = dynamic(() => import('../components/learn/CourseReviews'), {
    loading: () => (
        <div className="animate-pulse bg-[#f5f5eb] border border-[#d2d2c8] h-64 rounded-[28px]" />
    ),
    ssr: false
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface TolzyCoursePlayerPageProps {
    initialCourse?: Course | null;
}

const TolzyCoursePlayerPage: React.FC<TolzyCoursePlayerPageProps> = ({ initialCourse }) => {
    const params = useParams();
    const router = useRouter();
    const courseId = (params?.courseId as string) || '';

    // Initialize with initialCourse or direct fallback lookup
    const [course, setCourse] = useState<Course | null>(() => {
        if (initialCourse) return initialCourse;
        if (courseId) return getFallbackCourseById(courseId);
        return null;
    });

    const [loading, setLoading] = useState<boolean>(!course);
    const [copied, setCopied] = useState<boolean>(false);

    // Sync state if initialCourse prop updates
    useEffect(() => {
        if (initialCourse) {
            setCourse(initialCourse);
            setLoading(false);
        }
    }, [initialCourse]);

    // Fetch from Supabase or fallback
    useEffect(() => {
        if (!courseId) return;

        // If course is already matching, no need to re-query
        if (course && (course.id === courseId || (course as any).external_id === courseId)) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadCourseData = async () => {
            try {
                // Try Supabase first
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .or(`id.eq.${courseId},external_id.eq.${courseId}`)
                    .single();

                if (data && !error && isMounted) {
                    setCourse({
                        ...data,
                        sourceUrl: data.url || data.sourceUrl,
                        platform: data.provider || data.platform || 'Tolzy',
                        whatYouWillLearn: data.what_you_will_learn || data.whatYouWillLearn || [],
                        metadata: data.metadata || {}
                    } as Course);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                // Fallback handled below
            }

            // Fallback resolution
            if (isMounted) {
                const fallback = getFallbackCourseById(courseId) || FALLBACK_COURSES[0];
                if (fallback) {
                    setCourse(fallback);
                }
                setLoading(false);
            }
        };

        loadCourseData();

        return () => {
            isMounted = false;
        };
    }, [courseId, course]);

    const handleEnroll = () => {
        const targetUrl = 
            course?.sourceUrl || 
            (course as any)?.url || 
            `https://www.youtube.com/results?search_query=${encodeURIComponent(course?.title || 'كورس برمجة وتطوير')}`;
        
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
    };

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success('تم نسخ رابط الكورس إلى الحافظة');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <PageLayout showCopilot={false}>
                <div className="min-h-screen bg-[#f5f5eb] flex items-center justify-center pt-28" dir="rtl">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 rounded-full border-4 border-[#14140f]/20 border-t-[#14140f] animate-spin mx-auto" />
                        <p className="text-sm font-medium text-[#6e6e64]">جاري تحميل تفاصيل الكورس...</p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (!course) {
        return (
            <PageLayout showCopilot={false}>
                <div className="min-h-screen bg-[#f5f5eb] flex items-center justify-center p-4 pt-28" dir="rtl">
                    <div className="max-w-md w-full bg-[#ffffff] border border-[#d2d2c8] rounded-[28px] p-8 text-center space-y-4">
                        <h2 className="text-2xl font-medium text-[#14140f]">الكورس غير متاح حالياً</h2>
                        <p className="text-sm text-[#6e6e64]">لم يتم العثور على الكورس المطلوب، يمكنك تصفح باقي الكورسات المتاحة في الدليل.</p>
                        <Link
                            href="/#courses"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-[28px] bg-[#beff50] text-[#14140f] border border-[#14140f] font-medium text-sm hover:bg-[#aef538] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                            <span>تصفح كافة الكورسات</span>
                        </Link>
                    </div>
                </div>
            </PageLayout>
        );
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.description,
        "provider": {
            "@type": "Organization",
            "name": course.platform || "TOLZY",
            "sameAs": course.sourceUrl || "https://tolzy.me"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": course.rating || 4.9,
            "reviewCount": course.reviewsCount || 100
        },
        "offers": {
            "@type": "Offer",
            "category": "Free",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    const skills = course.whatYouWillLearn || course.metadata?.skills || [
        'تطبيقات عملية ومشاريع كاملة',
        'شرح مبسط ومباشر باللغة العربية',
        'أفضل الممارسات البرمجية الحديثة',
        'تجهيز بيئة العمل ونشر المشاريع'
    ];

    return (
        <PageLayout showCopilot={false}>
            <SEO
                title={`${course.title} | كورس تدريبي مجاني — TOLZY`}
                description={course.description?.slice(0, 160) || `تعلم ${course.title} مجاناً باللغة العربية مع تطبيقات عملية ومسار شامل على دليل TOLZY.`}
                keywords={`${course.title}, كورس ${course.title}, كورس برمجة مجاني, تعلم ${course.category || ''}, TOLZY`}
                image={course.thumbnail}
                structuredData={structuredData}
            />

            <div className="min-h-screen bg-[#f5f5eb] text-[#14140f] selection:bg-[#beff50] selection:text-[#14140f] pt-28 sm:pt-36 pb-20 antialiased" dir="rtl">
                
                {/* ─── Breadcrumb Bar ─── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                    <nav className="flex items-center gap-2 text-xs font-medium text-[#6e6e64]">
                        <Link href="/" className="hover:text-[#14140f] transition-colors">
                            الرئيسية
                        </Link>
                        <span>/</span>
                        <Link href="/#courses" className="hover:text-[#14140f] transition-colors">
                            الكورسات التقنية
                        </Link>
                        <span>/</span>
                        <span className="text-[#14140f] font-normal truncate max-w-xs sm:max-w-md">
                            {course.title}
                        </span>
                    </nav>
                </div>

                {/* ─── Course Hero Section (Perk Editorial Surface) ─── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <div className="bg-[#ffffff] border border-[#d2d2c8] rounded-[28px] p-6 sm:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                            
                            {/* Course Visual Thumbnail (5 Cols) */}
                            <div className="lg:col-span-5 relative aspect-video sm:aspect-[4/3] rounded-[24px] overflow-hidden border border-[#d2d2c8] bg-[#f5f5eb] group cursor-pointer" onClick={handleEnroll}>
                                <img 
                                    src={course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60'} 
                                    alt={course.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-[#14140f]/20 group-hover:bg-[#14140f]/30 transition-colors flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-[#beff50] border border-[#14140f] text-[#14140f] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <PlayCircle className="w-8 h-8 fill-current" />
                                    </div>
                                </div>

                                {/* Platform Pill */}
                                <div className="absolute top-4 right-4">
                                    <span className="px-3.5 py-1 rounded-full bg-[#14140f] text-[#ffffff] text-xs font-medium flex items-center gap-1.5 shadow-sm">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>{course.platform || 'Tolzy'}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Course Details (7 Cols) */}
                            <div className="lg:col-span-7 space-y-6 text-right">
                                
                                {/* Badges Strip */}
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="px-3.5 py-1 rounded-full bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8] text-xs font-medium">
                                        {course.category || 'تطوير وبرمجة'}
                                    </span>

                                    <span className="px-3 py-1 rounded-full bg-[#beff50] text-[#14140f] border border-[#14140f] text-xs font-medium">
                                        مجاني بالكامل (100% Free)
                                    </span>

                                    {course.hasCertificate && (
                                        <span className="px-3 py-1 rounded-full bg-[#ffffff] text-[#14140f] border border-[#d2d2c8] text-xs font-medium flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-[#14140f]" />
                                            <span>شهادة إتمام</span>
                                        </span>
                                    )}
                                </div>

                                {/* Main Title */}
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] leading-[1.12] text-[#14140f]">
                                    {course.title}
                                </h1>

                                {/* Description */}
                                <p className="text-sm sm:text-base text-[#6e6e64] font-normal leading-relaxed">
                                    {course.description}
                                </p>

                                {/* Metadata Pills Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                    <div className="p-3.5 rounded-[20px] bg-[#f5f5eb] border border-[#d2d2c8] text-center">
                                        <div className="text-xs font-normal text-[#6e6e64]">المدة الزمنية</div>
                                        <div className="text-sm font-medium font-mono text-[#14140f] mt-1 flex items-center justify-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{course.duration || '30 ساعة'}</span>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-[20px] bg-[#f5f5eb] border border-[#d2d2c8] text-center">
                                        <div className="text-xs font-normal text-[#6e6e64]">المستوى</div>
                                        <div className="text-sm font-medium text-[#14140f] mt-1">
                                            {{ 'beginner': 'مبتدئ', 'intermediate': 'متوسط', 'advanced': 'متقدم' }[course.level?.toLowerCase() || ''] || course.level || 'شامل'}
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-[20px] bg-[#f5f5eb] border border-[#d2d2c8] text-center">
                                        <div className="text-xs font-normal text-[#6e6e64]">التقييم</div>
                                        <div className="text-sm font-medium text-[#14140f] mt-1 flex items-center justify-center gap-1 font-mono">
                                            <Star className="w-3.5 h-3.5 fill-[#14140f]" />
                                            <span>{(course.rating || 4.9).toFixed(1)}</span>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-[20px] bg-[#f5f5eb] border border-[#d2d2c8] text-center">
                                        <div className="text-xs font-normal text-[#6e6e64]">الطلاب</div>
                                        <div className="text-sm font-medium font-mono text-[#14140f] mt-1 flex items-center justify-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{course.studentsCount ? course.studentsCount.toLocaleString() : '2,500+'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Primary Actions Row */}
                                <div className="pt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={handleEnroll}
                                        className="flex-1 sm:flex-none px-8 py-4 rounded-[28px] bg-[#beff50] hover:bg-[#aef538] text-[#14140f] border border-[#14140f] font-medium text-base flex items-center justify-center gap-2.5 transition-transform active:scale-[0.99]"
                                    >
                                        <span>بدء مشاهدة الكورس الآن</span>
                                        <ExternalLink className="w-4 h-4 rtl:-scale-x-100" />
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="p-4 rounded-[28px] bg-[#ffffff] hover:bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] transition-colors"
                                        title="مشاركة الكورس"
                                        aria-label="مشاركة الكورس"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-[#14140f]" /> : <Share2 className="w-5 h-5 text-[#14140f]" />}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Content Grid: Skills & Reviews ─── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Main Column: Skills & Details (8 Cols) */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* Skills Section */}
                            <div className="bg-[#ffffff] border border-[#d2d2c8] rounded-[28px] p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center text-[#14140f]">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-medium tracking-[-0.03em] text-[#14140f]">
                                            المهارات والمعارف المكتسبة في هذا الكورس
                                        </h2>
                                        <p className="text-xs text-[#6e6e64] mt-0.5">نقاط أساسية يتم التركيز عليها خلال المحاضرات والتطبيقات</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {skills.map((skill: string, idx: number) => (
                                        <div 
                                            key={idx}
                                            className="p-4 rounded-[20px] bg-[#f5f5eb] border border-[#d2d2c8] flex items-start gap-3"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-[#beff50] border border-[#14140f] flex items-center justify-center text-[#14140f] shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs sm:text-sm font-medium text-[#14140f] leading-relaxed">
                                                {skill}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-[#ffffff] border border-[#d2d2c8] rounded-[28px] p-6 sm:p-8">
                                <CourseReviews
                                    courseId={course.id}
                                    onRatingUpdate={(newRating: number, newReviewsCount: number) => {
                                        setCourse(prev => prev ? ({ ...prev, rating: newRating, reviewsCount: newReviewsCount }) : null);
                                    }}
                                />
                            </div>

                        </div>

                        {/* Sidebar Column: Fast Enroll & Platform Info (4 Cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            
                            {/* Enroll Box */}
                            <div className="bg-[#ffffff] border border-[#d2d2c8] rounded-[28px] p-6 space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-[#d2d2c8]">
                                    <div>
                                        <span className="text-xs font-normal text-[#6e6e64] block">نوع الدورة</span>
                                        <span className="text-lg font-medium text-[#14140f]">محتوى تقني مفتوح</span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-[#beff50] text-[#14140f] border border-[#14140f] text-xs font-medium">
                                        مجاني 100%
                                    </span>
                                </div>

                                <div className="space-y-3 text-xs text-[#6e6e64]">
                                    <div className="flex items-center justify-between">
                                        <span>المدرب / الجهة:</span>
                                        <span className="font-medium text-[#14140f]">{course.instructor || 'فريق أكاديمية TOLZY'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>لغة الكورس:</span>
                                        <span className="font-medium text-[#14140f]">العربية (مترجم / ناطق)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>طريقة الوصول:</span>
                                        <span className="font-medium text-[#14140f]">مباشر أونلاين على مدار الساعة</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>الشهادة:</span>
                                        <span className="font-medium text-[#14140f]">{course.hasCertificate ? 'نعم — متاحة مجاناً' : 'إتمام ذاتي'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleEnroll}
                                    className="w-full py-4 rounded-[28px] bg-[#beff50] hover:bg-[#aef538] text-[#14140f] border border-[#14140f] font-medium text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
                                >
                                    <span>الانتقال لمشاهدة الكورس</span>
                                    <ExternalLink className="w-4 h-4 rtl:-scale-x-100" />
                                </button>
                            </div>

                            {/* Back to courses pill card */}
                            <div className="bg-[#ffffff] border border-[#d2d2c8] rounded-[28px] p-6 text-center space-y-3">
                                <h3 className="text-sm font-medium text-[#14140f]">تبحث عن دورات أخرى؟</h3>
                                <p className="text-xs text-[#6e6e64] leading-relaxed">
                                    تصفح أكثر من 150 مسار ودورة تدريبية في الذكاء الاصطناعي وتطوير الويب وعلم البيانات.
                                </p>
                                <Link
                                    href="/#courses"
                                    className="inline-flex items-center gap-2 text-xs font-medium text-[#14140f] underline underline-offset-4 hover:text-black transition-colors"
                                >
                                    <span>العودة لكافة الكورسات في الدليل</span>
                                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                                </Link>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </PageLayout>
    );
};

export default TolzyCoursePlayerPage;

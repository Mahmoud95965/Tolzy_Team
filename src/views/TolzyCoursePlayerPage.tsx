"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import dynamic from 'next/dynamic';

// Lazy load CourseReviews component for better performance
const CourseReviews = dynamic(() => import('../components/learn/CourseReviews'), {
    loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-xl"></div>,
    ssr: false
});
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

import { Course } from '../types/learn';
import { ExternalLink, Globe, Clock, Users, ArrowLeft, Sparkles, CheckCircle2, PlayCircle, Star, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';

import SEO from '../components/SEO';

interface TolzyCoursePlayerPageProps {
    initialCourse?: Course | null;
}

const TolzyCoursePlayerPage: React.FC<TolzyCoursePlayerPageProps> = ({ initialCourse }) => {
    const params = useParams();
    const router = useRouter();
    const courseId = params?.courseId as string;
    const [course, setCourse] = useState<Course | null>(initialCourse || null);
    const [loading, setLoading] = useState(!initialCourse);

    // Auto-fetch real student count
    const fetchRealStudentCount = async () => {
        if (!course || !course.sourceUrl) return;

        try {
            // Determine API URL based on environment
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_BASE = isLocal ? 'http://localhost:5000' : '';

            const response = await axios.post(`${API_BASE}/api/fetch-course`, {
                url: course.sourceUrl,
                courseId: course.id // Pass ID to allow server-side update
            });

            if (response.data && response.data.studentsCount > 0) {
                const newCount = response.data.studentsCount;
                setCourse(prev => prev ? ({ ...prev, studentsCount: newCount }) : null);
            }
        } catch (error) {
            // silent fail
        }
    };

    // Trigger on load if missing
    useEffect(() => {
        if (course && (!course.studentsCount || course.studentsCount === 0)) {
            fetchRealStudentCount();
        }
    }, [course?.id]);


    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            try {
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', courseId)
                    .single();

                if (data && !error) {
                    setCourse({ 
                        ...data,
                        sourceUrl: data.url,
                        platform: data.provider,
                        whatYouWillLearn: data.what_you_will_learn || [],
                        metadata: data.metadata || {}
                    } as Course);
                } else {
                    router.push('/learn');
                }
            } catch (error) {
                console.error('Error fetching course:', error);
                router.push('/learn');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, router]);

    const handleEnroll = () => {
        if (course?.sourceUrl) {
            window.open(course.sourceUrl, '_blank');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!course) return null;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.description,
        "provider": {
            "@type": "Organization",
            "name": course.platform || "Tolzy Learn",
            "sameAs": course.sourceUrl
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": course.rating || 5,
            "reviewCount": course.reviewsCount || 1
        },
        "offers": {
            "@type": "Offer",
            "category": "Free"
        }
    };

    return (
        <PageLayout showCopilot={false}>
            <SEO
                title={`${course.title} | كورس مجاني على Tolzy Learn`}
                description={course.description?.slice(0, 160) || `تعلم ${course.title} مجاناً على منصة Tolzy Learn.`}
                keywords={`${course.title}, كورس ${course.title}, تعلم ${course.category}, ${course.platform || 'Tolzy'}`}
                image={course.thumbnail}
                structuredData={structuredData}
            />

            <div className="min-h-screen bg-white dark:bg-[#0f1115] font-sans text-slate-900 dark:text-slate-300 relative overflow-x-hidden transition-colors duration-300 pt-32" dir="rtl">

                {/* Minimalist Hero Section */}
                <div className="relative pt-6 pb-6">
                    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
                        {/* Immersive Top Section */}
                        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111]">
                            <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                                {/* Visual Card (Right side RTL -> First in DOM) */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative w-full lg:w-1/3 xl:w-1/4 shrink-0 aspect-square rounded-2xl overflow-hidden shadow-sm group cursor-pointer"
                                    onClick={handleEnroll}
                                >
                                    <img 
                                        src={course.thumbnail} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-slate-900/10 transition-colors" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/90 dark:bg-black/80 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
                                            <PlayCircle className="w-8 h-8 fill-current" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Text Content (Left side RTL -> Second in DOM) */}
                                <div className="flex-1 space-y-6 text-right py-4 flex flex-col justify-center">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-wrap items-center gap-3"
                                    >
                                        <span className="px-4 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                                            {course.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                            <Globe className="w-3 h-3" />
                                            {course.platform}
                                        </div>
                                    </motion.div>

                                    <motion.h1 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-3xl md:text-4xl lg:text-5xl font-black text-indigo-600 dark:text-indigo-400 leading-tight tracking-tight"
                                    >
                                        {course.title}
                                    </motion.h1>

                                    <motion.p 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium"
                                    >
                                        {course.description}
                                    </motion.p>
                                    
                                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 tracking-widest">المدة الزمنية</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-indigo-500" />
                                                {course.duration || 'غير محدد'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 tracking-widest">المستوى</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                                {{ 'beginner': 'مبتدئ', 'intermediate': 'متوسط', 'advanced': 'متقدم' }[course.level?.toLowerCase() || ''] || course.level}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 tracking-widest">المشاهدات</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-indigo-500" />
                                                {course.studentsCount?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pb-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        
                        {/* Main Content (Bento Grid) */}
                        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6">
                            
                            {/* Skills Section (Enriched) - Full row */}
                            <div className="md:col-span-12 space-y-6 bg-slate-50 dark:bg-gray-800/20 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Sparkles className="w-7 h-7" />
                                        </div>
                                        المهارات التي ستكتسبها
                                    </h2>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(course.metadata?.skills || course.whatYouWillLearn || []).map((skill: string, i: number) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-4 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all flex items-start gap-3 group"
                                        >
                                            <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-relaxed">{skill}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Enriched Metadata - Half width right DOM -> Left visual */}
                            {course.metadata && Object.keys(course.metadata).filter(k => k !== 'skills' && k !== 'what_you_will_learn').length > 0 ? (
                                <div className="md:col-span-5 p-6 rounded-3xl bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-800 h-fit">
                                    <h3 className="text-sm font-black text-slate-700 dark:text-slate-400 mb-5 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        تفاصيل إضافية
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(course.metadata)
                                            .filter(([k]) => k !== 'skills' && k !== 'what_you_will_learn')
                                            .map(([key, value]) => {
                                                const isLong = String(value).length > 15;
                                                return (
                                                    <div key={key} className={`flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-white dark:bg-gray-800/50 shadow-sm border border-slate-100 dark:border-slate-800 flex-grow ${isLong ? 'w-full' : 'min-w-[90px]'}`}>
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                                                            {key.split('_').join(' ')}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {typeof value === 'boolean' ? (value ? 'نعم' : 'لا') : String(value)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden"></div>
                            )}

                            {/* Reviews - Half width left DOM -> Right visual */}
                            <div className="md:col-span-7 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] shadow-sm h-full">
                                <CourseReviews
                                    courseId={course.id}
                                    onRatingUpdate={(newRating: number, newReviewsCount: number) => {
                                        setCourse(prev => prev ? ({ ...prev, rating: newRating, reviewsCount: newReviewsCount }) : null);
                                    }}
                                />
                            </div>

                            {/* Ask YouTube Learn - Bento Promotional Card */}
                            <div className="md:col-span-12 overflow-hidden rounded-3xl border border-emerald-500/20 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/15 dark:via-teal-500/5 dark:to-[#0f1115]/45 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative shadow-lg shadow-emerald-500/5 dark:shadow-[0_0_30px_rgba(16,185,129,0.05)] text-right">
                                {/* Ambient glow backgrounds */}
                                <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />
                                
                                <div className="flex flex-col md:flex-row items-center gap-5 md:gap-6 relative z-10 text-center md:text-right">
                                    <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-400 relative shadow-lg shadow-emerald-500/20">
                                        <img 
                                            src="/image/tools/11zon_cropped.jpg" 
                                            alt="YouTube Learn Icon" 
                                            className="w-full h-full object-cover"
                                        />
                                        <span className="absolute inset-0 bg-emerald-400/10 animate-pulse"></span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <h3 className="text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400">
                                                تعلّم بشكل أسرع مع Ask YouTube Learn AI
                                            </h3>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-550/30">جديد ✨</span>
                                        </div>
                                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-350 font-medium leading-relaxed max-w-2xl">
                                            هل تود مناقشة هذا الكورس؟ اسأل رفيقك الذكي فوراً عن الأكواد والمفاهيم واستخرج ملخصات شاملة أو اختبر مستواك بأسئلة تفاعلية ذكية!
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 relative z-10 w-full md:w-auto">
                                    <button
                                        onClick={() => router.push(`/learn?youtubeUrl=${encodeURIComponent(course.sourceUrl || '')}`)}
                                        className="w-full md:w-auto px-6 py-4 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white dark:text-[#090a0f] font-black text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <span>ابدأ التعلم التفاعلي الذكي</span>
                                        <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Right) */}
                        <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-6">
                            {/* Action Card */}
                            <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
                                
                                <div className="flex items-center justify-between mb-6 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">الرخصة</span>
                                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">مجاني بالكامل</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                                        <span className="text-amber-700 dark:text-amber-500 font-black">{course.rating || 5}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button 
                                        onClick={handleEnroll}
                                        className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                    >
                                        ابدأ التعلم الآن
                                        <ExternalLink className="w-5 h-5 rtl:-scale-x-100" />
                                    </button>
                                    
                                    <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium px-4">
                                        سيتم توجيهك إلى {course.platform} لإكمال عملية التسجيل مجاناً.
                                    </p>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                            <Globe className="w-4 h-4" /> المنصة
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{course.platform}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                            <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse" /> البث
                                        </div>
                                        <span className="text-sm font-black text-indigo-500">متاح الآن</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Breadcrumbs (Sidebar Version) */}
                            <div className="hidden lg:block p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col gap-3">
                                    <Link href="/learn" className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
                                        <ArrowLeft className="w-3 h-3 rtl:rotate-180" /> العودة لقائمة الكورسات
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Fixed Action */}
                <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
                    <button 
                        onClick={handleEnroll}
                        className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        سجل مجاناً الآن
                        <ExternalLink className="w-5 h-5" />
                    </button>
                </div>

                {/* Ask YouTube Learn Floating Launcher */}
                <div className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-50">
                    <button
                        onClick={() => router.push(`/learn?youtubeUrl=${encodeURIComponent(course.sourceUrl || '')}`)}
                        className="relative block w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-400 bg-[#090a0f] shadow-lg shadow-emerald-500/20 hover:scale-110 hover:shadow-emerald-500/40 hover:border-emerald-300 transition-all duration-300 group"
                        title="اسأل يوتيوب AI عن هذا الكورس"
                    >
                        <img 
                            src="/image/tools/11zon_cropped.jpg" 
                            alt="Ask YouTube Learn" 
                            className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-300"
                        />
                        <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none"></span>
                    </button>
                </div>
            </div>
        </PageLayout>
    );
};

export default TolzyCoursePlayerPage;

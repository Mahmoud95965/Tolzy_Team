"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import { Search, BookOpen, ChevronLeft, ChevronRight, Code2, Brain, Palette, Database, Shield, Globe, Zap, Star, TrendingUp, Target, Clock, Award } from 'lucide-react';
import { Course } from '../types/learn';
import SmartCourseCard from '../components/learn/SmartCourseCard';
import CommandPalette from '../components/learn/CommandPalette';

const COURSES_PER_PAGE = 9;

const CATEGORIES = [
    { id: 'all', label: 'الكل', icon: Globe },
    { id: 'برمجة الويب', label: 'تطوير الويب', icon: Code2 },
    { id: 'الذكاء الاصطناعي', label: 'الذكاء الاصطناعي', icon: Brain },
    { id: 'تصميم واجهات', label: 'تصميم UI/UX', icon: Palette },
    { id: 'علم البيانات', label: 'علم البيانات', icon: Database },
    { id: 'الأمن السيبراني', label: 'الأمن السيبراني', icon: Shield },
    { id: 'عام', label: 'عام', icon: BookOpen },
];

const LEARNING_PATHS = [
    {
        title: 'مسار Front-End Pro',
        description: 'من الصفر إلى مطور واجهات محترف',
        icon: Code2,
        color: 'from-blue-500 to-indigo-600',
        steps: ['HTML & CSS', 'JavaScript', 'React', 'Next.js'],
        duration: '6 أشهر',
    },
    {
        title: 'مسار AI Developer',
        description: 'بناء تطبيقات الذكاء الاصطناعي',
        icon: Brain,
        color: 'from-emerald-500 to-teal-600',
        steps: ['Python', 'Machine Learning', 'Deep Learning', 'LLMs'],
        duration: '8 أشهر',
    },
    {
        title: 'مسار Data Science',
        description: 'تحليل البيانات واتخاذ القرارات',
        icon: Database,
        color: 'from-purple-500 to-pink-600',
        steps: ['Python', 'Pandas', 'Visualization', 'ML'],
        duration: '5 أشهر',
    },
];

const TolzyLearnPage: React.FC = () => {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pillsRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/admin/courses');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCourses(data);
                } else {
                    console.error('Failed to load courses:', data.error);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Reset to page 1 on category change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);

    const filteredCourses = courses.filter(course => {
        if (selectedCategory === 'all') return true;
        return course.category === selectedCategory;
    });

    const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
    const paginatedCourses = filteredCourses.slice(
        (currentPage - 1) * COURSES_PER_PAGE,
        currentPage * COURSES_PER_PAGE
    );

    const handleCourseClick = (courseId: string) => {
        router.push(`/learn/course/${courseId}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollPills = (dir: 'left' | 'right') => {
        if (pillsRef.current) {
            pillsRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
        }
    };

    const getPageNumbers = () => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <PageLayout>
        <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-300 overflow-x-hidden w-full">

                {/* Background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-5%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/8 rounded-full blur-[100px] md:blur-[130px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-teal-500/8 rounded-full blur-[80px] md:blur-[100px]" />
                </div>

                {/* === HERO SECTION === */}
                <section className="relative z-10 pt-24 md:pt-36 pb-10 md:pb-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs md:text-sm font-bold mb-4 md:mb-6">
                                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                أكثر من {courses.length > 0 ? courses.length : 150}+ كورس تقني مجاني
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 md:mb-5 tracking-tighter leading-tight"
                        >
                            اكتشف{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
                                مهارتك التالية
                            </span>
                            {' '}على Tolzy Learn
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-8 md:mb-10 max-w-xl mx-auto"
                        >
                            مكتبة متكاملة من الدورات المجانية في البرمجة، الذكاء الاصطناعي، والتصميم.
                        </motion.p>

                        {/* Big Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div
                                onClick={() => setIsCommandPaletteOpen(true)}
                                className="group flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300"
                            >
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Search className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                                </div>
                                <span className="text-slate-400 dark:text-slate-500 text-sm md:text-base font-medium flex-1 text-right truncate">
                                    ابحث في أكثر من {courses.length > 0 ? courses.length : 150} كورس...
                                </span>
                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                    <kbd className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-500">CTRL</kbd>
                                    <span className="text-slate-400 text-xs">+</span>
                                    <kbd className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-500">K</kbd>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8"
                        >
                            {[
                                { icon: BookOpen, label: '150+ كورس' },
                                { icon: Star, label: 'مجاني 100%' },
                                { icon: TrendingUp, label: 'محدّث باستمرار' },
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-center gap-1.5 md:gap-2 text-slate-500 dark:text-slate-400 text-[13px] md:text-sm">
                                    <stat.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                                    <span className="font-semibold">{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* === CATEGORY PILLS === */}
                <div className="sticky top-[64px] md:top-20 z-30 bg-slate-50/90 dark:bg-[#050505]/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 py-3 md:py-4">
                    <div className="max-w-7xl mx-auto px-4 relative flex items-center gap-2">
                        {/* Scroll Left */}
                        <button
                            onClick={() => scrollPills('left')}
                            className="hidden md:flex shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <div
                            ref={pillsRef}
                            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 px-1"
                        >
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex items-center gap-1.5 md:gap-2 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-[13px] md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                                            isActive
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                                                : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Scroll Right */}
                        <button
                            onClick={() => scrollPills('right')}
                            className="hidden md:flex shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* === MAIN CONTENT (Grid + Sidebar) === */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10 w-full">
                    <div className="flex gap-8 items-start">

                        {/* Left: Course Grid */}
                        <div className="flex-1 min-w-0 w-full overflow-hidden" ref={gridRef}>
                            {/* Count & Sort header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white">
                                        {selectedCategory === 'all' ? 'جميع الكورسات' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        {filteredCourses.length} كورس متاح · صفحة {currentPage} من {Math.max(1, totalPages)}
                                    </p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                                    <Target className="w-4 h-4 text-emerald-500" />
                                    <span>الأحدث أولاً</span>
                                </div>
                            </div>

                            {/* 3-Column Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                        <div key={i} className="aspect-[3/4] rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                    ))}
                                </div>
                            ) : paginatedCourses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {paginatedCourses.map((course, index) => (
                                            <motion.div
                                                key={`${course.id}-${currentPage}`}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.4) }}
                                            >
                                                <SmartCourseCard
                                                    course={course}
                                                    onClick={() => handleCourseClick(course.id)}
                                                    featured={false}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                        <Search className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">لا توجد نتائج في هذا القسم</h3>
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all"
                                    >
                                        استكشاف جميع الكورسات
                                    </button>
                                </div>
                            )}

                            {/* === PAGINATION === */}
                            {!loading && totalPages > 1 && (
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-8 md:mt-12">
                                    {/* Prev */}
                                    <button
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold text-xs md:text-sm disabled:opacity-40 hover:border-emerald-500/40 hover:text-emerald-600 transition-all"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        السابق
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1 md:gap-1.5">
                                        {getPageNumbers().map((page, idx) =>
                                            page === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs md:text-sm">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page as number)}
                                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all ${
                                                        currentPage === page
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40 hover:text-emerald-600'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {/* Next */}
                                    <button
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold text-xs md:text-sm disabled:opacity-40 hover:border-emerald-500/40 hover:text-emerald-600 transition-all"
                                    >
                                        التالي
                                        <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>
                                </div>
                            )}

                            {/* === MOBILE ONLY SUGGESTED PATHS === */}
                            <div className="mt-16 lg:hidden">
                                <div className="flex items-center gap-2 mb-4">
                                    <Award className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white">مسارات مقترحة لك</h3>
                                </div>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                                    {LEARNING_PATHS.map((path) => {
                                        const Icon = path.icon;
                                        return (
                                            <div
                                                key={path.title}
                                                onClick={() => router.push('/paths')}
                                                className="shrink-0 w-[240px] p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center shrink-0`}>
                                                        <Icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <p className="font-black text-slate-800 dark:text-white text-sm truncate">{path.title}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{path.duration}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* === RIGHT STICKY SIDEBAR === */}
                        <aside className="w-72 shrink-0 hidden lg:block sticky top-36 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Award className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-base font-black text-slate-800 dark:text-white">مسارات تعليمية مقترحة</h3>
                                </div>

                                <div className="space-y-3">
                                    {LEARNING_PATHS.map((path) => {
                                        const Icon = path.icon;
                                        return (
                                            <div
                                                key={path.title}
                                                className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center shrink-0 shadow-lg`}>
                                                        <Icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-slate-800 dark:text-white text-sm group-hover:text-emerald-500 transition-colors">{path.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{path.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {path.steps.map((step) => (
                                                        <span key={step} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400">{step}</span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{path.duration}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick tip */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1">💡 نصيحة</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    استخدم شريط البحث (CTRL+K) للوصول السريع لأي كورس بالاسم أو التقنية.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>

                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    courses={courses}
                    onSelectCourse={handleCourseClick}
                />
            </div>
        </PageLayout>
    );
};

export default TolzyLearnPage;

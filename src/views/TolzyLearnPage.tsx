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
import AskYouTubeLearn from '../components/learn/AskYouTubeLearn';

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
    const [isYoutubeActive, setIsYoutubeActive] = useState(false);
    const [isForceOpenYoutubeLearn, setIsForceOpenYoutubeLearn] = useState(false);

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
        <PageLayout navbarOffset={false} showCopilot={false}>
            <div className="relative min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-x-hidden w-full pt-20 md:pt-24">

                {/* === ASK YOUTUBE LEARN (CHAT BAR / WIDGET) === */}
                <div className={isYoutubeActive ? "relative z-40 w-full max-w-7xl mx-auto px-4 pb-2" : "w-0 h-0 overflow-visible"}>
                    <AskYouTubeLearn 
                        onStateChange={(isActive) => setIsYoutubeActive(isActive)} 
                        isForceOpen={isForceOpenYoutubeLearn}
                        onCloseForceOpen={() => setIsForceOpenYoutubeLearn(false)}
                    />
                </div>

                {/* === PREMIUM HERO SECTION === */}
                {!isYoutubeActive && (
                    <div className="relative overflow-hidden bg-gradient-to-bl from-slate-100 via-slate-50 to-slate-200 dark:from-[#0f1322] dark:via-[#090a0f] dark:to-[#0d101e] border-b border-slate-200 dark:border-white/5 pt-6 pb-12 md:pt-8 md:pb-16 mt-2">
                        {/* Background decorations */}
                        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
                            <div className="absolute top-10 right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />
                            <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
                            <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px]" />
                        </div>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20 dark:opacity-40" />

                        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-white/90 text-xs md:text-sm font-bold mb-6 border border-slate-300 dark:border-white/10"
                            >
                                <span className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-pulse" />
                                أكثر من {courses.length > 0 ? courses.length : 150}+ كورس تقني مجاني
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight"
                            >
                                اكتشف{' '}
                                <span className="relative">
                                    <span className="bg-gradient-to-l from-amber-600 via-yellow-500 to-amber-700 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400 bg-clip-text text-transparent">مهارتك التالية</span>
                                    <motion.span
                                        initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.8, duration: 0.5 }}
                                        className="absolute -bottom-1 right-0 h-1 bg-gradient-to-l from-amber-500 to-yellow-550 dark:from-amber-300 dark:to-yellow-400 rounded-full"
                                    />
                                </span>
                            </motion.h1>

                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium mb-8 max-w-xl mx-auto leading-relaxed"
                            >
                                مكتبة متكاملة من الدورات المجانية في البرمجة، الذكاء الاصطناعي، والتصميم.
                            </motion.p>

                            {/* Big Search Bar */}
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
                                className="max-w-2xl mx-auto"
                            >
                                <div
                                    onClick={() => setIsCommandPaletteOpen(true)}
                                    className="group flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 bg-white/70 dark:bg-[#0f1322]/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-xl md:rounded-2xl cursor-pointer hover:bg-white/95 dark:hover:bg-[#0f1322]/60 hover:border-emerald-500/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all duration-300"
                                >
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                                        <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-700 dark:text-white" />
                                    </div>
                                    <span className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium flex-1 text-right truncate">
                                        ابحث في أكثر من {courses.length > 0 ? courses.length : 150} كورس...
                                    </span>
                                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                                        <kbd className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-slate-400">CTRL</kbd>
                                        <span className="text-slate-400 dark:text-slate-500 text-xs">+</span>
                                        <kbd className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-slate-400">K</kbd>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick stats */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                                className="flex flex-wrap items-center justify-center gap-5 md:gap-10 mt-6 md:mt-8 text-slate-500 dark:text-slate-400 text-sm font-medium"
                            >
                                {[
                                    { icon: BookOpen, label: `${courses.length > 0 ? courses.length : '150'}+ كورس`, emoji: '📚' },
                                    { icon: Star, label: 'مجاني 100%', emoji: '⭐' },
                                    { icon: TrendingUp, label: 'محدّث باستمرار', emoji: '🔄' },
                                ].map((stat) => (
                                    <div key={stat.label} className="flex items-center gap-2">
                                        <span className="text-lg">{stat.emoji}</span>
                                        <span className="font-semibold">{stat.label}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Bottom wave */}
                        <div className="absolute bottom-0 left-0 right-0">
                            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                                <path d="M0 60V20C240 0 480 40 720 30C960 20 1200 50 1440 20V60H0Z" className="fill-slate-50 dark:fill-[#090a0f]" />
                            </svg>
                        </div>
                    </div>
                )/* HERO END */}

                {/* === CATEGORY PILLS === */}
                {!isYoutubeActive && (
                    <div className="sticky top-[116px] md:top-[144px] z-30 bg-slate-50/85 dark:bg-[#090a0f]/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-3 md:py-4">
                        <div className="max-w-7xl mx-auto px-4 relative flex items-center gap-2">
                            {/* Scroll Left */}
                            <button
                                onClick={() => scrollPills('left')}
                                className="hidden md:flex shrink-0 w-8 h-8 rounded-full bg-white/75 dark:bg-[#0f1322]/40 border border-slate-200 dark:border-white/5 items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shadow-sm"
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
                                                    ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white dark:text-[#090a0f] shadow-lg shadow-emerald-500/25 scale-105'
                                                    : 'bg-white/70 dark:bg-[#0f1322]/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400'
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
                                className="hidden md:flex shrink-0 w-8 h-8 rounded-full bg-white/75 dark:bg-[#0f1322]/40 border border-slate-200 dark:border-white/5 items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* === MAIN CONTENT (Grid + Sidebar) === */}
                {!isYoutubeActive && (
                    <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10 w-full">
                        <div className="flex gap-8 items-start">

                            {/* Left: Course Grid */}
                            <div className="flex-1 min-w-0 w-full overflow-hidden" ref={gridRef}>
                                {/* Count & Sort header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                            {selectedCategory === 'all' ? 'جميع الكورسات' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
                                        </h2>
                                        <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
                                            {filteredCourses.length} كورس متاح · صفحة {currentPage} من {Math.max(1, totalPages)}
                                        </p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                        <span>الأحدث أولاً</span>
                                    </div>
                                </div>

                                {/* 3-Column Grid */}
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                            <div key={i} className="aspect-[3/4] rounded-3xl bg-white/80 dark:bg-[#0f1322]/40 border border-slate-200 dark:border-white/5 animate-pulse" />
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
                                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/80 dark:bg-[#0f1322]/40 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-[#090a0f] rounded-full flex items-center justify-center mb-6">
                                            <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">لا توجد نتائج في هذا القسم</h3>
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className="px-6 py-3 bg-gradient-to-l from-emerald-500 to-teal-500 text-white dark:text-[#090a0f] rounded-xl font-bold hover:opacity-90 transition-all"
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
                                            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white dark:bg-[#0f1322]/40 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs md:text-sm disabled:opacity-40 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            السابق
                                        </button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1 md:gap-1.5">
                                            {getPageNumbers().map((page, idx) =>
                                                page === '...' ? (
                                                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 dark:text-slate-500 text-xs md:text-sm">...</span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page as number)}
                                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all ${
                                                            currentPage === page
                                                                ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white dark:text-[#090a0f] shadow-lg shadow-emerald-500/25'
                                                                : 'bg-white dark:bg-[#0f1322]/40 border border-slate-200 dark:border-white/5 text-slate-605 dark:text-slate-300 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400'
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
                                            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white dark:bg-[#0f1322]/40 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs md:text-sm disabled:opacity-40 hover:border-emerald-500/40 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all"
                                        >
                                            التالي
                                            <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* === MOBILE ONLY SUGGESTED PATHS === */}
                                <div className="mt-16 lg:hidden">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Award className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white">مسارات مقترحة لك</h3>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                                        {LEARNING_PATHS.map((path) => {
                                            const Icon = path.icon;
                                            return (
                                                <div
                                                    key={path.title}
                                                    onClick={() => router.push('/paths')}
                                                    className="shrink-0 w-[240px] p-4 rounded-2xl bg-white/80 dark:bg-[#0f1322]/40 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center shrink-0`}>
                                                            <Icon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <p className="font-black text-slate-800 dark:text-white text-sm truncate">{path.title}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                        <Clock className="w-3 h-3 text-emerald-550 dark:text-emerald-400" />
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
                                        <Award className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                                        <h3 className="text-base font-black text-slate-900 dark:text-white">مسارات تعليمية مقترحة</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {LEARNING_PATHS.map((path) => {
                                            const Icon = path.icon;
                                            return (
                                                <div
                                                    key={path.title}
                                                    className="p-4 rounded-2xl bg-white/80 dark:bg-[#0f1322]/40 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group shadow-sm"
                                                >
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center shrink-0 shadow-lg`}>
                                                            <Icon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-black text-slate-800 dark:text-white text-sm group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{path.title}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{path.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {path.steps.map((step) => (
                                                            <span key={step} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-550 dark:text-slate-400">{step}</span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <Clock className="w-3 h-3 text-emerald-550 dark:text-emerald-400" />
                                                        <span>{path.duration}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quick tip */}
                                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0f1322]/40 border border-slate-200 dark:border-emerald-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">💡 نصيحة</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        استخدم شريط البحث (CTRL+K) للوصول السريع لأي كورس بالاسم أو التقنية.
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}

                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    courses={courses}
                    onSelectCourse={handleCourseClick}
                    onLaunchYouTubeLearn={() => {
                        setIsCommandPaletteOpen(false);
                        setIsForceOpenYoutubeLearn(true);
                    }}
                />
            </div>
        </PageLayout>
    );
};

export default TolzyLearnPage;

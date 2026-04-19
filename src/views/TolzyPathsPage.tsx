"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';
import { learningPaths } from '../data/learningPaths';
import { Course } from '../types/learn';
import {
    ChevronRight, ChevronDown, Clock, Briefcase, DollarSign, BookOpen,
    CheckCircle2, ExternalLink, Star, ArrowRight, Sparkles, TrendingUp, Award, Users
} from 'lucide-react';

// Map each path to its relevant course categories for matching
const PATH_COURSE_CATEGORIES: Record<string, string[]> = {
    'fullstack-web': ['برمجة الويب', 'عام'],
    'frontend-mastery': ['برمجة الويب', 'تصميم واجهات', 'عام'],
    'backend-engineering': ['برمجة الويب', 'عام'],
    'ai-data-science': ['الذكاء الاصطناعي', 'علم البيانات', 'عام'],
    'ui-ux-design': ['تصميم واجهات', 'عام'],
    'cybersecurity-pro': ['الأمن السيبراني', 'عام'],
};

// Map tech/keyword hints per path for smarter matching
const PATH_KEYWORDS: Record<string, string[]> = {
    'fullstack-web': ['javascript', 'node', 'react', 'html', 'css', 'web', 'mongo', 'express', 'full'],
    'frontend-mastery': ['react', 'css', 'tailwind', 'typescript', 'next', 'frontend', 'vue', 'angular'],
    'backend-engineering': ['node', 'python', 'api', 'database', 'sql', 'server', 'docker', 'cloud'],
    'ai-data-science': ['ai', 'machine', 'deep', 'python', 'nlp', 'llm', 'data', 'tensorflow', 'pytorch'],
    'ui-ux-design': ['figma', 'design', 'ux', 'ui', 'prototype', 'user'],
    'cybersecurity-pro': ['security', 'cyber', 'network', 'hacking', 'linux', 'ethical'],
};

const LEVEL_COLORS: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const LEVEL_LABELS: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
};

const TolzyPathsPage: React.FC = () => {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/admin/courses');
                const data = await res.json();
                if (Array.isArray(data)) setCourses(data);
            } catch (e) {
                console.error('Failed to load courses', e);
            }
        };
        fetchCourses();
    }, []);

    const getRecommendedCourses = (pathId: string): Course[] => {
        const cats = PATH_COURSE_CATEGORIES[pathId] || [];
        const keywords = PATH_KEYWORDS[pathId] || [];

        return courses
            .filter(c => {
                const matchCat = cats.includes(c.category || '');
                const matchKeyword = keywords.some(kw =>
                    (c.title || '').toLowerCase().includes(kw) ||
                    (c.description || '').toLowerCase().includes(kw)
                );
                return matchCat || matchKeyword;
            })
            .slice(0, 6);
    };

    const activePathData = learningPaths.find(p => p.id === selectedPath);

    return (
        <PageLayout>
            <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] overflow-x-hidden w-full" dir="rtl">

                {/* Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-500/8 rounded-full blur-[100px] md:blur-[130px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-purple-500/8 rounded-full blur-[80px] md:blur-[110px]" />
                </div>

                <div className="relative z-10 pt-24 md:pt-28 pb-16 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

                    {/* === HERO === */}
                    <div className="text-center mb-12 md:mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs md:text-sm font-bold mb-4 md:mb-6"
                        >
                            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {learningPaths.length} مسارات احترافية متكاملة
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 md:mb-5 tracking-tighter"
                        >
                            اختر{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                                مسارك المهني
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
                        >
                            خطط دراسية شاملة من الصفر حتى الاحتراف، مع كورسات مقترحة من Tolzy Learn لكل مرحلة.
                        </motion.p>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8"
                        >
                            {[
                                { icon: Award, label: '6 مسارات احترافية' },
                                { icon: BookOpen, label: 'كورسات مقترحة' },
                            ].map(stat => (
                                <div key={stat.label} className="flex items-center gap-1.5 md:gap-2 text-[13px] md:text-sm text-slate-500 dark:text-slate-400">
                                    <stat.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-500" />
                                    <span className="font-semibold">{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* === PATHS GRID === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {learningPaths.map((path, index) => {
                            const isSelected = selectedPath === path.id;
                            return (
                                <motion.div
                                    key={path.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.07 }}
                                    onClick={() => setSelectedPath(isSelected ? null : path.id)}
                                    className={`group relative rounded-2xl md:rounded-3xl p-5 md:p-6 cursor-pointer transition-all duration-300 overflow-hidden border ${
                                        isSelected
                                            ? 'bg-white dark:bg-white/8 border-indigo-500/50 shadow-2xl shadow-indigo-500/10'
                                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/30 hover:shadow-xl'
                                    }`}
                                >
                                    {/* Gradient orb */}
                                    <div className={`absolute -right-16 -top-16 w-36 h-36 bg-gradient-to-br ${path.color} ${isSelected ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'} blur-3xl transition-opacity duration-500 rounded-full pointer-events-none`} />

                                    <div className="relative z-10">
                                        {/* Icon + badges */}
                                        <div className="flex items-start justify-between mb-5">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.color} flex items-center justify-center text-white shadow-lg transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                                                {path.icon}
                                            </div>
                                            <div className="flex flex-col gap-1.5 items-end">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${LEVEL_COLORS[path.level]}`}>
                                                    {LEVEL_LABELS[path.level]}
                                                </span>
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {path.duration}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className={`text-xl font-black mb-2 transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white group-hover:text-indigo-500'}`}>
                                            {path.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5 line-clamp-2">
                                            {path.description}
                                        </p>

                                        {/* Steps preview pills */}
                                        <div className="flex flex-wrap gap-1.5 mb-5">
                                            {path.steps.slice(0, 3).map(step => (
                                                <span key={step.id} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    {step.title.split(' ').slice(0, 2).join(' ')}
                                                </span>
                                            ))}
                                            {path.steps.length > 3 && (
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                    +{path.steps.length - 3} أخرى
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-0.5">متوسط الراتب</p>
                                                <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{path.averageSalary}</p>
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                                {isSelected ? 'إخفاء التفاصيل' : 'عرض المسار'}
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* === EXPANDED PATH DETAILS === */}
                    <AnimatePresence mode="wait">
                        {selectedPath && activePathData && (
                            <motion.div
                                key={selectedPath}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl"
                            >
                                {/* Path Header */}
                                <div className={`bg-gradient-to-r ${activePathData.color} p-5 md:p-8`}>
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                                    {activePathData.icon}
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-xs md:text-sm font-medium">المسار التعليمي</p>
                                                    <h2 className="text-xl md:text-2xl font-black text-white">{activePathData.title}</h2>
                                                </div>
                                            </div>
                                            <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed">{activePathData.description}</p>
                                        </div>
                                        <div className="flex flex-wrap md:flex-col gap-3 text-white shrink-0">
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
                                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                <span className="font-bold">{activePathData.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
                                                <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                <span className="font-bold">{activePathData.averageSalary}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 md:p-8">
                                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                                        {/* Steps Timeline */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                                </span>
                                                خطوات المسار التفصيلية
                                            </h3>

                                            <div className="space-y-3">
                                                {activePathData.steps.map((step, idx) => (
                                                    <div
                                                        key={step.id}
                                                        className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden"
                                                    >
                                                        <button
                                                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                                                            className="w-full flex items-center gap-4 p-4 text-right hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                                        >
                                                            {/* Step number */}
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 bg-gradient-to-br ${activePathData.color} text-white shadow`}>
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0 text-right">
                                                                <h4 className="font-black text-slate-800 dark:text-white text-sm">{step.title}</h4>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                                    <Clock className="w-3 h-3" />
                                                                    {step.duration}
                                                                </p>
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${expandedStep === step.id ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {expandedStep === step.id && (
                                                                <motion.div
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: 'auto' }}
                                                                    exit={{ height: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-white/5">
                                                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-3">
                                                                            {step.description}
                                                                        </p>
                                                                        {step.resources && step.resources.length > 0 && (
                                                                            <div className="mt-3">
                                                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">روابط مفيدة:</p>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {step.resources.map(r => (
                                                                                        <a
                                                                                            key={r.url}
                                                                                            href={r.url}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                                                                                            onClick={e => e.stopPropagation()}
                                                                                        >
                                                                                            <ExternalLink className="w-3 h-3" />
                                                                                            {r.title}
                                                                                        </a>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recommended Courses Sidebar */}
                                        <div className="w-80 shrink-0 hidden lg:block">
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                    <Star className="w-4 h-4 text-emerald-500" />
                                                </span>
                                                كورسات مقترحة
                                            </h3>

                                            {getRecommendedCourses(selectedPath).length > 0 ? (
                                                <div className="space-y-3">
                                                    {getRecommendedCourses(selectedPath).map(course => (
                                                        <div
                                                            key={course.id}
                                                            onClick={() => router.push(`/learn/course/${course.id}`)}
                                                            className="group flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all"
                                                        >
                                                            {course.thumbnail && (
                                                                <img
                                                                    src={course.thumbnail}
                                                                    alt={course.title}
                                                                    className="w-16 h-12 rounded-xl object-cover shrink-0"
                                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                />
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-black text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                                                                    {course.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                    <span className="text-xs text-slate-400">{course.category}</span>
                                                                    {course.rating && (
                                                                        <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                                                                            <Star className="w-3 h-3 fill-current" />
                                                                            {course.rating}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0 self-center rtl:rotate-180" />
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={() => router.push('/learn')}
                                                        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm font-bold hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                                                    >
                                                        عرض كل الكورسات ←
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                                                    <BookOpen className="w-8 h-8 text-slate-300 mb-3" />
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                                        جاري إضافة كورسات لهذا المسار...
                                                    </p>
                                                    <button
                                                        onClick={() => router.push('/learn')}
                                                        className="text-sm font-bold text-emerald-500 hover:text-emerald-600"
                                                    >
                                                        تصفح جميع الكورسات
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile: Recommended Courses */}
                                    {getRecommendedCourses(selectedPath).length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10 lg:hidden">
                                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">كورسات مقترحة لهذا المسار</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {getRecommendedCourses(selectedPath).map(course => (
                                                    <div
                                                        key={course.id}
                                                        onClick={() => router.push(`/learn/course/${course.id}`)}
                                                        className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-black text-slate-800 dark:text-white line-clamp-2">{course.title}</p>
                                                            <span className="text-xs text-slate-400 mt-1 block">{course.category}</span>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 self-center shrink-0" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CTA */}
                    {!selectedPath && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 text-center p-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                        >
                            <p className="text-lg font-black text-slate-800 dark:text-white mb-2">لا تعرف من أين تبدأ؟</p>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">اضغط على أي مسار لعرض التفاصيل الكاملة والكورسات المقترحة.</p>
                            <button
                                onClick={() => router.push('/learn')}
                                className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 mx-auto"
                            >
                                <BookOpen className="w-5 h-5" />
                                تصفح جميع الكورسات
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default TolzyPathsPage;

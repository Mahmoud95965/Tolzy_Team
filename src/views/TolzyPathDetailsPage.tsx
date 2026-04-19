"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';
import SEO from '../components/SEO';
import { ArrowLeft, BookOpen, Clock, DollarSign, PlayCircle, Code, Star } from 'lucide-react';
import { learningPaths as paths } from '../data/learningPaths';

const TolzyPathDetailsPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const pathId = params?.pathId as string;
    const path = paths.find(p => p.id === pathId);

    if (!path) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] dark:bg-[#050505] text-gray-900 dark:text-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">المسار غير موجود</h1>
                    <button onClick={() => router.push('/paths')} className="text-indigo-600 hover:underline">العودة للمسارات</button>
                </div>
            </div>
        );
    }

    // SEO: Detailed Course/LearningPath Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": path.title,
        "description": path.description,
        "provider": {
            "@type": "Organization",
            "name": "Tolzy",
            "sameAs": "https://tolzy.me"
        },
        "occupationalCredentialAwarded": "Certificate of Completion",
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "Flipped classroom",
            "courseWorkload": path.duration
        },
        "syllabusSections": path.steps.map(step => ({
            "@type": "Syllabus",
            "name": step.title,
            "description": step.description,
            "timeRequired": step.duration
        }))
    };

    return (
        <PageLayout>
            <SEO
                title={`${path.title} - مسار تعليمي شامل - Tolzy Learn`}
                description={`${path.description} احترف ${path.title} مع خطة دراسية متكاملة ومصادر تعلم مختارة. متوسط الراتب ${path.averageSalary}.`}
                keywords={`${path.title}, learning path, roadmap, course, tutorial, ${path.steps.map(s => s.title).join(', ')}`}
                structuredData={jsonLd}
            />

            <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans" dir="rtl">
                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gray-900 text-white pt-24 pb-32">
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${path.color}`} />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => router.push('/paths')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            عودة للمسارات
                        </button>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${path.color} flex items-center justify-center shadow-2xl`}>
                                {path.icon}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-4xl md:text-5xl font-black mb-4">{path.title}</h1>
                                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">{path.description}</p>
                            </div>
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                                    <DollarSign className="w-5 h-5 text-green-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">متوسط الراتب</p>
                                        <p className="font-bold">{path.averageSalary}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">المدة المتوقعة</p>
                                        <p className="font-bold">{path.duration}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Roadmap Timeline */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 p-8 md:p-12">
                        <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            خارطة الطريق
                        </h2>

                        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent">
                            {path.steps.length > 0 ? path.steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0a0a0a] bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <span className="text-sm font-bold">{index + 1}</span>
                                    </div>

                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-indigo-500/30 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{step.title}</h3>
                                            <span className="text-xs font-mono text-gray-500 bg-gray-200 dark:bg-white/10 px-2 py-1 rounded">{step.duration}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{step.description}</p>

                                        {step.resources && step.resources.length > 0 && (
                                            <div className="space-y-2">
                                                {step.resources.map((resource, i) => (
                                                    <a
                                                        key={i}
                                                        href={resource.url}
                                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-500 transition-colors bg-white dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-white/5"
                                                    >
                                                        {resource.type === 'video' ? <PlayCircle className="w-4 h-4" /> :
                                                            resource.type === 'article' ? <BookOpen className="w-4 h-4" /> :
                                                                <Code className="w-4 h-4" />}
                                                        {resource.title}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-12 text-gray-500">
                                    محتوى هذا المسار قيد الإعداد. سيتم إضافته قريباً!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default TolzyPathDetailsPage;

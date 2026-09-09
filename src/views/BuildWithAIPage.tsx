'use client';
import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import IdeaInputBox from '@/src/components/BuildWithAI/IdeaInputBox';
import BuildPlanViewer from '@/src/components/BuildWithAI/BuildPlanViewer';
import { ArrowRight, FolderOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getCentralAuthUrl } from '@/src/utils/authRedirect';

export default function BuildWithAIPage() {
    const { user, userProfile } = useAuth();
    const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
    const isPro = normalizedPlan.includes('pro') || normalizedPlan.includes('max') || normalizedPlan.includes('ultra') || normalizedPlan.includes('admin') || userProfile?.role === 'admin';

    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIdea, setCurrentIdea] = useState('');
    const [currentLevel, setCurrentLevel] = useState('beginner');
    const [projectId, setProjectId] = useState<string | null>(null);

    const handleGenerate = async (idea: string, level: string) => {
        setIsLoading(true);
        setError(null);
        setCurrentIdea(idea);
        setCurrentLevel(level);

        try {
            const res = await fetch('/api/build-with-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea, userLevel: level, userId: user?.uid }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
                return;
            }

            setResult(data.result);
            if (data.projectId) setProjectId(data.projectId);
        } catch (e: any) {
            setError('فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = () => {
        if (currentIdea) handleGenerate(currentIdea, currentLevel);
    };

    const handleRemix = () => {
        setResult(null);
        setError(null);
        setProjectId(null);
    };

    // Not logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">🚀</div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">سجل دخولك أولاً</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">تحتاج لتسجيل الدخول لاستخدام ميزة "ابنِ مع الذكاء الاصطناعي"</p>
                    <Link href={getCentralAuthUrl()} prefetch={false} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                        تسجيل الدخول <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                {/* Top Navigation */}
                <div className="flex justify-end mb-6">
                    <Link href="/build/projects" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                        <FolderOpen className="w-4 h-4" /> مشاريعي
                    </Link>
                </div>

                {/* Error State */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8 p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl text-center shadow-sm">
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-2xl">⚡</span>
                            <p className="text-sm text-red-700 dark:text-red-300 font-bold leading-relaxed">{error}</p>
                            {(error.includes('توكن') || error.includes('شحن') || error.includes('ترقية') || error.includes('باقة')) && (
                                <Link 
                                    href="/pricing" 
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs shadow-md shadow-violet-500/20 transition-all"
                                >
                                    <span>شحن الرصيد / ترقية الباقة الآن 🚀</span>
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading Skeleton */}
                {isLoading && !result && (
                    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-white/10 rounded-2xl" />
                            <div className="w-64 h-8 mx-auto bg-slate-200 dark:bg-white/10 rounded-xl" />
                            <div className="w-96 h-4 mx-auto bg-slate-200 dark:bg-white/10 rounded-lg" />
                        </div>
                        <div className="h-48 bg-slate-200 dark:bg-white/10 rounded-2xl" />
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-32 bg-slate-200 dark:bg-white/10 rounded-2xl" />
                            <div className="h-32 bg-slate-200 dark:bg-white/10 rounded-2xl" />
                            <div className="h-32 bg-slate-200 dark:bg-white/10 rounded-2xl" />
                        </div>
                        <p className="text-center text-sm text-slate-500 font-bold animate-pulse">⚡ جاري تحليل فكرتك وبناء الخطة... قد يستغرق 10-20 ثانية</p>
                    </div>
                )}

                {/* Input State */}
                {!result && !isLoading && <IdeaInputBox onSubmit={handleGenerate} isLoading={isLoading} />}

                {/* Results State */}
                {result && !isLoading && (
                    <>
                        {/* Project Saved Banner */}
                        {projectId && (
                            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">تم حفظ المشروع تلقائياً</span>
                                </div>
                                <Link href={`/build/projects/${projectId}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">
                                    <ExternalLink className="w-3 h-3" /> رابط المشروع
                                </Link>
                            </div>
                        )}
                    <BuildPlanViewer
                        result={result}
                        onRegenerate={handleRegenerate}
                        onRemix={handleRemix}
                        isLoading={isLoading}
                        idea={currentIdea}
                        userId={user?.uid}
                        projectId={projectId}
                        onNewResult={(newResult: any) => setResult(newResult)}
                    />
                    </>
                )}
            </div>
        </div>
    );
}

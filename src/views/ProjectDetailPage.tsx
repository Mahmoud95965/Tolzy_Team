'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BuildPlanViewer from '@/src/components/BuildWithAI/BuildPlanViewer';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) return;
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/build-with-ai/projects?id=${projectId}`);
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'فشل في جلب المشروع');
                    return;
                }
                setProject(data.project);
            } catch (e) {
                setError('فشل الاتصال بالخادم');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-500 font-bold">جاري تحميل المشروع...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-3xl">❌</div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">{error || 'المشروع غير موجود'}</h2>
                    <Link href="/build/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all mt-4">
                        العودة لمشاريعي <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                    <Link href="/build/projects" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <ArrowRight className="w-4 h-4 rotate-180 rtl:rotate-0" /> العودة لمشاريعي
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={async () => {
                                await navigator.clipboard.writeText(window.location.href);
                                alert('تم نسخ رابط المشروع المباشر بنجاح! 🔗');
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-black hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-xs"
                        >
                            <span>نسخ رابط المشروع 🔗</span>
                        </button>
                        <Link
                            href="/build"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
                        >
                            <span>مشروع جديد ⚡</span>
                        </Link>
                    </div>
                </div>

                <BuildPlanViewer
                    result={project.result_json}
                    onRegenerate={() => {}}
                    onRemix={() => {}}
                    isLoading={false}
                    idea={project.idea}
                    projectId={projectId}
                />
            </div>
        </div>
    );
}

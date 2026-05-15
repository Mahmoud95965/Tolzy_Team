'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import { FolderOpen, Rocket, Clock, ArrowRight, Sparkles, Layers, Trash2 } from 'lucide-react';

interface ProjectSummary {
    id: string;
    idea: string;
    user_level: string;
    created_at: string;
    title?: string;
}

const levelLabels: Record<string, { label: string; emoji: string }> = {
    beginner: { label: 'مبتدئ', emoji: '🌱' },
    intermediate: { label: 'متوسط', emoji: '⚡' },
    advanced: { label: 'متقدم', emoji: '🚀' },
};

export default function MyProjectsPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;
        const fetchProjects = async () => {
            try {
                const res = await fetch(`/api/build-with-ai/projects?userId=${user.uid}`);
                const data = await res.json();
                setProjects(data.projects || []);
            } catch (e) {
                console.error('Failed to fetch projects:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, [user?.uid]);

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">🔒</div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">سجل دخولك أولاً</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">تحتاج لتسجيل الدخول لعرض مشاريعك</p>
                    <Link href="/auth" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                        تسجيل الدخول <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <FolderOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">مشاريعي</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">جميع خطط البناء التي أنشأتها</p>
                        </div>
                    </div>
                    <Link href="/build" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-4 h-4" /> مشروع جديد
                    </Link>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-44 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && projects.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                            <Rocket className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">لا توجد مشاريع بعد</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">ابدأ بإنشاء أول خطة بناء لمشروعك!</p>
                        <Link href="/build" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                            <Sparkles className="w-4 h-4" /> ابدأ البناء
                        </Link>
                    </div>
                )}

                {/* Projects Grid */}
                {!isLoading && projects.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {projects.map((project) => {
                            const level = levelLabels[project.user_level] || levelLabels.beginner;
                            const date = new Date(project.created_at);
                            const formattedDate = date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
                            const formattedTime = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <Link
                                    key={project.id}
                                    href={`/build/projects/${project.id}`}
                                    className="group bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden"
                                >
                                    {/* Hover glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                                                {level.emoji} {level.label}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {project.title || project.idea}
                                        </h3>

                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                                            {project.idea}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">{formattedDate} - {formattedTime}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-indigo-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                عرض الخطة <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

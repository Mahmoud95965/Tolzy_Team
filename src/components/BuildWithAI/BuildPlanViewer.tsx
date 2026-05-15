'use client';
import React, { useState } from 'react';
import { Layers, Wrench, ListChecks, MessageSquareCode, RefreshCw, Target, TrendingUp, Zap, ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import ToolStackCard from './ToolStackCard';
import StepTimeline from './StepTimeline';
import PromptCard from './PromptCard';
import AIFollowUp from './AIFollowUp';

interface BuildResult {
    ideaBreakdown: { title: string; summary: string; targetAudience: string; problemSolved: string; uniqueValue: string };
    features: { name: string; description: string; priority: string; effort: string }[];
    techStack: { frontend: { name: string; reason: string }; backend: { name: string; reason: string }; database: { name: string; reason: string }; hosting: { name: string; reason: string }; ai?: { name: string; reason: string }; extras?: { name: string; reason: string }[] };
    steps: { order: number; title: string; description: string; duration: string; deliverable: string }[];
    prompts: { title: string; description: string; content: string; targetTool: string }[];
    growth: { launchStrategy: string; marketingChannels: string[]; monetization: string; firstMilestone: string };
}

interface BuildPlanViewerProps {
    result: BuildResult;
    onRegenerate: () => void;
    onRemix: () => void;
    isLoading: boolean;
    idea: string;
    userId?: string;
    onNewResult?: (result: any) => void;
}

const TABS = [
    { id: 'plan', label: 'الخطة', icon: <Layers className="w-4 h-4" /> },
    { id: 'tools', label: 'التقنيات', icon: <Wrench className="w-4 h-4" /> },
    { id: 'steps', label: 'الخطوات', icon: <ListChecks className="w-4 h-4" /> },
    { id: 'prompts', label: 'البرومبتات', icon: <MessageSquareCode className="w-4 h-4" /> },
];

const priorityBadge: Record<string, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};
const priorityLabel: Record<string, string> = { high: 'أساسي', medium: 'متوسط', low: 'ثانوي' };

export default function BuildPlanViewer({ result, onRegenerate, onRemix, isLoading, idea, userId, onNewResult }: BuildPlanViewerProps) {
    const [activeTab, setActiveTab] = useState('plan');
    const [copiedAll, setCopiedAll] = useState(false);

    const handleCopyAllPrompts = async () => {
        const allPrompts = result.prompts?.map(p => `## ${p.title}\n${p.content}`).join('\n\n---\n\n') || '';
        await navigator.clipboard.writeText(allPrompts);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.ideaBreakdown?.title || 'project'}-plan.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-full text-xs font-bold text-green-600 dark:text-green-400 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> تم توليد الخطة بنجاح
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">{result.ideaBreakdown?.title || 'خطة المشروع'}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{result.ideaBreakdown?.summary}</p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
                            <button onClick={onRegenerate} disabled={isLoading} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all border border-slate-200 dark:border-white/10 disabled:opacity-50">
                                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> إعادة التوليد
                            </button>
                            <button onClick={onRemix} disabled={isLoading} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 transition-all border border-slate-200 dark:border-white/10 disabled:opacity-50">
                                <ArrowLeft className="w-3 h-3" /> فكرة جديدة
                            </button>
                            <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 transition-all border border-slate-200 dark:border-white/10">
                                <ExternalLink className="w-3 h-3" /> تصدير JSON
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 mb-6 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide">
                        {TABS.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'bg-white dark:bg-[#111] text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in duration-300">
                        {activeTab === 'plan' && (
                            <div className="space-y-6">
                                {/* Idea Breakdown */}
                                <div className="grid md:grid-cols-3 gap-3">
                                    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-red-500" /><span className="text-xs font-bold text-slate-400">الجمهور المستهدف</span></div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{result.ideaBreakdown?.targetAudience}</p>
                                    </div>
                                    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-slate-400">المشكلة المحلولة</span></div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{result.ideaBreakdown?.problemSolved}</p>
                                    </div>
                                    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-green-500" /><span className="text-xs font-bold text-slate-400">القيمة الفريدة</span></div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{result.ideaBreakdown?.uniqueValue}</p>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-500" /> الميزات ({result.features?.length || 0})</h3>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {result.features?.map((f, i) => (
                                            <div key={i} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-start justify-between gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{f.name}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{f.description}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${priorityBadge[f.priority] || priorityBadge['medium']}`}>{priorityLabel[f.priority] || f.priority}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{f.effort}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Growth */}
                                {result.growth && (
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-2xl p-6">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> استراتيجية النمو</h3>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div><span className="text-xs font-bold text-indigo-500 block mb-1">الإطلاق</span><p className="text-slate-700 dark:text-slate-300">{result.growth.launchStrategy}</p></div>
                                            <div><span className="text-xs font-bold text-indigo-500 block mb-1">الربح</span><p className="text-slate-700 dark:text-slate-300">{result.growth.monetization}</p></div>
                                            <div><span className="text-xs font-bold text-indigo-500 block mb-1">القنوات</span><p className="text-slate-700 dark:text-slate-300">{result.growth.marketingChannels?.join('، ')}</p></div>
                                            <div><span className="text-xs font-bold text-indigo-500 block mb-1">هدف الـ 30 يوم</span><p className="text-slate-700 dark:text-slate-300">{result.growth.firstMilestone}</p></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tools' && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {result.techStack?.frontend && <ToolStackCard category="frontend" name={result.techStack.frontend.name} reason={result.techStack.frontend.reason} />}
                                {result.techStack?.backend && <ToolStackCard category="backend" name={result.techStack.backend.name} reason={result.techStack.backend.reason} />}
                                {result.techStack?.database && <ToolStackCard category="database" name={result.techStack.database.name} reason={result.techStack.database.reason} />}
                                {result.techStack?.hosting && <ToolStackCard category="hosting" name={result.techStack.hosting.name} reason={result.techStack.hosting.reason} />}
                                {result.techStack?.ai && <ToolStackCard category="ai" name={result.techStack.ai.name} reason={result.techStack.ai.reason} />}
                                {result.techStack?.extras?.map((e, i) => <ToolStackCard key={i} category={e.name} name={e.name} reason={e.reason} />)}
                            </div>
                        )}

                        {activeTab === 'steps' && <StepTimeline steps={result.steps || []} />}

                        {activeTab === 'prompts' && (
                            <div className="space-y-4">
                                {/* Bulk action */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-500">{result.prompts?.length || 0} برومبت جاهز</span>
                                    <button onClick={handleCopyAllPrompts} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copiedAll ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                                        {copiedAll ? <><Check className="w-3 h-3" /> تم نسخ الكل!</> : <><Copy className="w-3 h-3" /> نسخ الكل</>}
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {result.prompts?.map((p, i) => <PromptCard key={i} title={p.title} description={p.description} content={p.content} targetTool={p.targetTool} />)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Next Step CTA */}
                    <div className="mt-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-center text-white">
                        <h3 className="text-lg font-black mb-2">🚀 الخطوة التالية</h3>
                        <p className="text-sm text-white/80 mb-4">انسخ البرومبتات واستخدمها مباشرة في أداتك المفضلة لبدء بناء مشروعك</p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <button onClick={() => setActiveTab('prompts')} className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-white/90 transition-all">
                                📋 عرض البرومبتات
                            </button>
                            <button onClick={() => setActiveTab('steps')} className="px-5 py-2.5 bg-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-all border border-white/30">
                                📝 خطوات التنفيذ
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Co-Pilot Sidebar */}
                {onNewResult && (
                    <div className="lg:w-80 shrink-0 lg:sticky lg:top-8 lg:self-start">
                        <AIFollowUp idea={idea} onNewResult={onNewResult} userId={userId} />
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';
import React, { useState } from 'react';
import { 
    Layers, Wrench, ListChecks, MessageSquareCode, RefreshCw, 
    Target, TrendingUp, Zap, ArrowLeft, ExternalLink, Copy, Check, 
    Database, DollarSign, FileText, Download, Printer, Shield, 
    CheckCircle2, Sparkles, Terminal, Code2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-hot-toast';
import ToolStackCard from './ToolStackCard';
import StepTimeline from './StepTimeline';
import PromptCard from './PromptCard';
import AIFollowUp from './AIFollowUp';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

export interface BuildResult {
    ideaBreakdown: { 
        title: string; 
        summary: string; 
        targetAudience: string; 
        problemSolved: string; 
        uniqueValue: string 
    };
    features: { 
        name: string; 
        description: string; 
        priority: 'high' | 'medium' | 'low' | string; 
        effort: string 
    }[];
    techStack: { 
        frontend: { name: string; reason: string }; 
        backend: { name: string; reason: string }; 
        database: { name: string; reason: string }; 
        hosting: { name: string; reason: string }; 
        ai?: { name: string; reason: string }; 
        extras?: { name: string; reason: string }[] 
    };
    databaseSchema?: {
        explanation: string;
        sqlScript: string;
    };
    financialEstimate?: {
        estimatedMonthlyCost: string;
        costBreakdown: { item: string; cost: string }[];
        monetizationModel: string;
        breakEvenTarget: string;
    };
    steps: { 
        order: number; 
        title: string; 
        description: string; 
        duration: string; 
        deliverable: string 
    }[];
    prompts: { 
        targetTool: string;
        title: string; 
        description: string; 
        content: string; 
    }[];
    prdDocument?: {
        title: string;
        markdownContent: string;
    };
    growth?: { 
        launchStrategy: string; 
        marketingChannels: string[]; 
        monetization: string; 
        firstMilestone: string 
    };
}

interface BuildPlanViewerProps {
    result: BuildResult;
    onRegenerate: () => void;
    onRemix: () => void;
    isLoading: boolean;
    idea: string;
    userId?: string;
    projectId?: string | null;
    onNewResult?: (result: any) => void;
}

const TABS = [
    { id: 'plan', label: 'الخطة والرؤية', icon: <Layers className="w-4 h-4" /> },
    { id: 'database', label: 'كود الـ SQL والـ DB', icon: <Database className="w-4 h-4 text-emerald-500" /> },
    { id: 'prompts', label: 'برومبتات الـ AI', icon: <MessageSquareCode className="w-4 h-4 text-indigo-500" /> },
    { id: 'cost', label: 'حاسبة التكلفة والجدوى', icon: <DollarSign className="w-4 h-4 text-amber-500" /> },
    { id: 'tools', label: 'التقنيات', icon: <Wrench className="w-4 h-4" /> },
    { id: 'steps', label: 'مراحل التنفيذ', icon: <ListChecks className="w-4 h-4" /> },
    { id: 'prd', label: 'وثيقة الـ PRD', icon: <FileText className="w-4 h-4 text-purple-500" /> },
];

const priorityBadge: Record<string, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};
const priorityLabel: Record<string, string> = { high: 'أساسي', medium: 'متوسط', low: 'ثانوي' };

export default function BuildPlanViewer({ result, onRegenerate, onRemix, isLoading, idea, userId, projectId, onNewResult }: BuildPlanViewerProps) {
    const [activeTab, setActiveTab] = useState('plan');
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedSQL, setCopiedSQL] = useState(false);
    const [copiedPRD, setCopiedPRD] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleCopyProjectLink = async () => {
        if (!projectId) return;
        const projectUrl = `${window.location.origin}/build/projects/${projectId}`;
        await navigator.clipboard.writeText(projectUrl);
        setCopiedLink(true);
        toast.success('تم نسخ الرابط المباشر للمشروع 🔗');
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const handleCopyAllPrompts = async () => {
        const allPrompts = result.prompts?.map(p => `## ${p.title} (${p.targetTool})\n${p.content}`).join('\n\n---\n\n') || '';
        await navigator.clipboard.writeText(allPrompts);
        setCopiedAll(true);
        toast.success('تم نسخ جميع البرومبتات للحافظة 📋');
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handleCopySQL = async () => {
        if (!result.databaseSchema?.sqlScript) return;
        await navigator.clipboard.writeText(result.databaseSchema.sqlScript);
        setCopiedSQL(true);
        toast.success('تم نسخ كود الـ SQL للـ Supabase Editor ⚡');
        setTimeout(() => setCopiedSQL(false), 2000);
    };

    const handleCopyPRD = async () => {
        const md = result.prdDocument?.markdownContent || '';
        await navigator.clipboard.writeText(md);
        setCopiedPRD(true);
        toast.success('تم نسخ وثيقة الـ PRD بالكامل 📋');
        setTimeout(() => setCopiedPRD(false), 2000);
    };

    const handleDownloadPRD = () => {
        const md = result.prdDocument?.markdownContent || `# ${result.ideaBreakdown?.title}\n\n${result.ideaBreakdown?.summary}`;
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanTitle = (result.ideaBreakdown?.title || 'project').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
        a.download = `${cleanTitle}_PRD.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('تم تنزيل وثيقة PRD.md بنجاح 📥');
    };

    const handlePrintPRD = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('يرجى السماح بالنوافذ المنبثقة لطباعة الـ PDF');
            return;
        }

        const title = result.ideaBreakdown?.title || 'وثيقة مواصفات المشروع';
        const prdContent = result.prdDocument?.markdownContent || '';

        const htmlContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>${title} - Product Requirements Document (PRD)</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 35px;
                        color: #1e293b;
                        background: #ffffff;
                        line-height: 1.7;
                    }
                    .header {
                        border-bottom: 2px solid #6366f1;
                        padding-bottom: 15px;
                        margin-bottom: 25px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .logo { font-size: 20px; font-weight: 900; color: #4f46e5; }
                    h1 { font-size: 24px; color: #0f172a; margin-top: 0; }
                    h2 { font-size: 18px; color: #1e293b; border-right: 4px solid #6366f1; padding-right: 8px; margin-top: 25px; }
                    h3 { font-size: 15px; color: #334155; }
                    pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
                    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">TOLZY Build 🚀</div>
                        <small style="color: #64748b;">Product Requirements Document (PRD)</small>
                    </div>
                    <div style="font-size: 11px; color: #64748b;">
                        ${new Date().toLocaleDateString('ar-EG')}
                    </div>
                </div>

                <div>
                    <pre style="font-family: inherit; font-size: 13px; background: transparent; border: none; padding: 0;">${prdContent}</pre>
                </div>

                <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
                    تم إنشاء وتخطيط هذا المشروع بواسطة TOLZY Build Architect · https://tolzy.me/build
                </div>

                <script>
                    window.onload = () => { window.print(); };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
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
        <div className="w-full max-w-6xl mx-auto" dir="rtl">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-xs font-black text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" /> تم بناء الخطة الهندسية والمعمارية المتكاملة بنجاح
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                            {result.ideaBreakdown?.title || 'خطة المشروع'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            {result.ideaBreakdown?.summary}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
                            {projectId && (
                                <button onClick={handleCopyProjectLink} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-black hover:bg-indigo-100 transition-all border border-indigo-200 dark:border-indigo-800/50 shadow-xs">
                                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ رابط المشروع 🔗'}</span>
                                </button>
                            )}
                            <button onClick={onRegenerate} disabled={isLoading} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all border border-slate-200 dark:border-white/10 disabled:opacity-50">
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> إعادة التوليد
                            </button>
                            <button onClick={onRemix} disabled={isLoading} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 transition-all border border-slate-200 dark:border-white/10 disabled:opacity-50">
                                <ArrowLeft className="w-3.5 h-3.5" /> فكرة جديدة
                            </button>
                            <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 transition-all border border-slate-200 dark:border-white/10">
                                <ExternalLink className="w-3.5 h-3.5" /> تصدير JSON
                            </button>
                            {result.prdDocument && (
                                <button onClick={handleDownloadPRD} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-l from-indigo-500 to-purple-600 text-white text-xs font-black hover:opacity-90 transition-all shadow-md shadow-indigo-500/10">
                                    <Download className="w-3.5 h-3.5" /> تنزيل PRD.md
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-1.5 mb-6 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide">
                        {TABS.map((tab) => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)} 
                                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center ${
                                    activeTab === tab.id 
                                        ? 'bg-white dark:bg-[#111] text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200/60 dark:border-white/10' 
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in duration-300">
                        
                        {/* TAB 1: PLAN & OVERVIEW */}
                        {activeTab === 'plan' && (
                            <div className="space-y-6">
                                {/* Idea Breakdown */}
                                <div className="grid md:grid-cols-3 gap-3.5">
                                    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-red-500" /><span className="text-xs font-bold text-slate-400">الجمهور المستهدف</span></div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{result.ideaBreakdown?.targetAudience}</p>
                                    </div>
                                    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-slate-400">المشكلة المحلولة</span></div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{result.ideaBreakdown?.problemSolved}</p>
                                    </div>
                                    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-xs font-bold text-slate-400">القيمة الفريدة (Moat)</span></div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{result.ideaBreakdown?.uniqueValue}</p>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-indigo-500" /> الميزات الوظيفية ({result.features?.length || 0})
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-3.5">
                                        {result.features?.map((f, i) => (
                                            <div key={i} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-start justify-between gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{f.name}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${priorityBadge[f.priority] || priorityBadge['medium']}`}>
                                                        {priorityLabel[f.priority] || f.priority}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{f.effort}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Growth Strategy */}
                                {result.growth && (
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-2xl p-6">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-indigo-500" /> استراتيجية النمو والإطلاق
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div><span className="text-xs font-bold text-indigo-500 block mb-1">الإطلاق الأولي</span><p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{result.growth.launchStrategy}</p></div>
                                            <div><span className="text-xs font-bold text-indigo-500 block mb-1">الربح والتسعير</span><p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{result.growth.monetization}</p></div>
                                            <div><span className="text-xs font-bold text-indigo-500 block mb-1">القنوات التسويقية</span><p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{result.growth.marketingChannels?.join('، ')}</p></div>
                                            <div><span className="text-xs font-bold text-indigo-500 block mb-1">هدف الـ 30 يوماً</span><p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{result.growth.firstMilestone}</p></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: INSTANT SQL & DATABASE SCHEMA */}
                        {activeTab === 'database' && (
                            <div className="space-y-6">
                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-emerald-500 font-black text-sm mb-1">
                                            <Database className="w-4.5 h-4.5" />
                                            <span>كود الـ Database والـ Backend جاهز للنسخ فوراً (Supabase / PostgreSQL)</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {result.databaseSchema?.explanation || 'قم بلصق هذا الكود في Supabase SQL Editor لتجهيز الجداول، الـ Foreign Keys، وسياسات الأمان RLS في 10 ثوانٍ.'}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleCopySQL}
                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 shrink-0"
                                    >
                                        {copiedSQL ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        <span>{copiedSQL ? 'تم نسخ الـ SQL!' : 'نسخ كود الـ SQL بالكامل'}</span>
                                    </button>
                                </div>

                                {/* SQL Code Block */}
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl" dir="ltr">
                                    <div className="bg-[#1e1e24] px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <span className="w-3 h-3 rounded-full bg-green-500/80" />
                                            <span className="text-xs font-mono text-slate-400 ml-2">supabase_schema.sql</span>
                                        </div>
                                        <button
                                            onClick={handleCopySQL}
                                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy</span>
                                        </button>
                                    </div>

                                    <SyntaxHighlighter
                                        language="sql"
                                        style={oneDark as any}
                                        customStyle={{ margin: 0, padding: '16px', fontSize: '12px', background: '#0e0e12', lineHeight: '1.6' }}
                                    >
                                        {result.databaseSchema?.sqlScript || '-- No SQL provided'}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PROMPTS FOR AI TOOLS */}
                        {activeTab === 'prompts' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareCode className="w-4 h-4 text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            برومبتات مفصلة معمارياً لأدوات البناء (Cursor, v0.dev, Bolt, Claude)
                                        </span>
                                    </div>
                                    <button 
                                        onClick={handleCopyAllPrompts} 
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            copiedAll ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                    >
                                        {copiedAll ? <><Check className="w-3.5 h-3.5" /> تم نسخ الكل!</> : <><Copy className="w-3.5 h-3.5" /> نسخ جميع البرومبتات</>}
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {result.prompts?.map((p, i) => (
                                        <PromptCard 
                                            key={i} 
                                            title={p.title} 
                                            description={p.description} 
                                            content={p.content} 
                                            targetTool={p.targetTool} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 4: COST & FEASIBILITY ESTIMATOR */}
                        {activeTab === 'cost' && (
                            <div className="space-y-6">
                                {/* Monthly Cost Card */}
                                <div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">
                                            التكلفة الشهرية التقديرية للـ MVP 📊
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                                            {result.financialEstimate?.estimatedMonthlyCost || '$0 - $15 / شهرياً'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                                            تم حساب التكلفة بناءً على الاستفادة من الباقات المجانية (Free Tiers) لأدوات Vercel و Supabase وتكلفة استهلاك الذكاء الاصطناعي.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-white dark:bg-black/40 border border-amber-500/20 rounded-2xl text-right shrink-0">
                                        <span className="text-[10px] font-bold text-slate-400 block mb-1">نقطة التعادل (Break-even):</span>
                                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                            {result.financialEstimate?.breakEvenTarget || '3 إلى 5 مشتركين لتغطية كافة التكاليف'}
                                        </div>
                                    </div>
                                </div>

                                {/* Cost Breakdown Grid */}
                                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                        تفصيل بنود التكاليف السحابية والتشغيلية
                                    </h4>

                                    <div className="space-y-3">
                                        {result.financialEstimate?.costBreakdown?.map((item, idx) => (
                                            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-700 dark:text-slate-200">{item.item}</span>
                                                <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">{item.cost}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {result.financialEstimate?.monetizationModel && (
                                        <div className="mt-5 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 text-xs">
                                            <span className="font-bold text-indigo-500 block mb-1">نموذج تحقيق الدخل (Monetization):</span>
                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{result.financialEstimate.monetizationModel}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 5: TECH STACK */}
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

                        {/* TAB 6: STEPS */}
                        {activeTab === 'steps' && <StepTimeline steps={result.steps || []} />}

                        {/* TAB 7: PRD DOCUMENT */}
                        {activeTab === 'prd' && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-purple-500" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            وثيقة مواصفات المشروع البرمجية (Product Requirements Document - PRD)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={handleCopyPRD}
                                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-purple-600 text-xs font-bold transition-all flex items-center gap-1.5"
                                        >
                                            {copiedPRD ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedPRD ? 'تم النسخ!' : 'نسخ PRD'}</span>
                                        </button>
                                        <button 
                                            onClick={handleDownloadPRD}
                                            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/10"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>تنزيل .md</span>
                                        </button>
                                        <button 
                                            onClick={handlePrintPRD}
                                            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            <span>طباعة PDF</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-800 dark:text-slate-200 text-xs leading-relaxed max-h-[600px] overflow-y-auto">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm as any]}
                                        components={{
                                            h1: ({ children }) => <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3 mt-4 border-b border-slate-200 dark:border-white/10 pb-2">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 mb-2 mt-4">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5 mt-3">{children}</h3>,
                                            p: ({ children }) => <p className="mb-2.5 text-slate-600 dark:text-slate-300 leading-relaxed text-xs">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc pr-4 mb-3 space-y-1 text-slate-600 dark:text-slate-300">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal pr-4 mb-3 space-y-1 text-slate-600 dark:text-slate-300">{children}</ol>,
                                            li: ({ children }) => <li className="mb-1">{children}</li>,
                                            code: ({ children }) => <code className="bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-[11px] text-indigo-500">{children}</code>
                                        }}
                                    >
                                        {result.prdDocument?.markdownContent || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Next Step CTA */}
                    <div className="mt-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-center text-white shadow-xl">
                        <h3 className="text-lg font-black mb-2">🚀 الخطوة التالية</h3>
                        <p className="text-sm text-white/80 mb-4">انسخ كود الـ SQL وقاعدة البيانات أو البرومبتات وابدأ بناء تطبيقك فوراً</p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <button onClick={() => setActiveTab('database')} className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-black hover:bg-white/90 transition-all shadow-md">
                                🗄️ نسخ كود الـ Database
                            </button>
                            <button onClick={() => setActiveTab('prompts')} className="px-5 py-2.5 bg-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/30 transition-all border border-white/30">
                                🤖 عرض البرومبتات
                            </button>
                            <button onClick={() => setActiveTab('prd')} className="px-5 py-2.5 bg-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/30 transition-all border border-white/30">
                                📄 وثيقة الـ PRD
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

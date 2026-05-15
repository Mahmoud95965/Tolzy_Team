'use client';
import React, { useState } from 'react';
import { Zap, DollarSign, Blocks, Rocket, Sparkles, Send, Loader2 } from 'lucide-react';

interface AIFollowUpProps {
    idea: string;
    onNewResult: (result: any) => void;
    userId?: string;
}

const REMIX_OPTIONS = [
    { id: 'cheaper', label: 'خليه أرخص', icon: <DollarSign className="w-4 h-4" />, prompt: 'أعد توليد نفس المشروع لكن بأقل تكلفة ممكنة - استخدم أدوات مجانية وOpen Source فقط', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40 hover:bg-green-100' },
    { id: 'faster', label: 'خليه أسرع', icon: <Zap className="w-4 h-4" />, prompt: 'أعد توليد نفس المشروع لكن بأسرع طريقة ممكنة - ركز على MVP يمكن إطلاقه في 48 ساعة', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100' },
    { id: 'nocode', label: 'خليه No-Code', icon: <Blocks className="w-4 h-4" />, prompt: 'أعد توليد نفس المشروع لكن باستخدام أدوات No-Code فقط (Bubble, Webflow, Zapier, Airtable, etc) بدون أي برمجة', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40 hover:bg-purple-100' },
    { id: 'saas', label: 'حوّله SaaS', icon: <Rocket className="w-4 h-4" />, prompt: 'أعد توليد نفس المشروع لكن كمنتج SaaS جاهز للاشتراكات الشهرية مع نموذج ربح واضح وخطة تسعير', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40 hover:bg-blue-100' },
];

export default function AIFollowUp({ idea, onNewResult, userId }: AIFollowUpProps) {
    const [followUp, setFollowUp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeRemix, setActiveRemix] = useState<string | null>(null);

    const handleRemix = async (remixPrompt: string, remixId: string) => {
        setIsLoading(true);
        setActiveRemix(remixId);
        try {
            const res = await fetch('/api/build-with-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: `${idea}\n\n--- تعديل مطلوب ---\n${remixPrompt}`, userLevel: 'intermediate', userId }),
            });
            const data = await res.json();
            if (res.ok) onNewResult(data.result);
        } catch (e) {
            console.error('Remix error:', e);
        } finally {
            setIsLoading(false);
            setActiveRemix(null);
        }
    };

    const handleFollowUp = async () => {
        if (!followUp.trim()) return;
        await handleRemix(followUp.trim(), 'custom');
        setFollowUp('');
    };

    return (
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                    <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">AI Co-Pilot</h3>
                    <p className="text-[10px] text-slate-400">عدّل فكرتك أو اسأل سؤال متابعة</p>
                </div>
            </div>

            {/* Remix Buttons */}
            <div className="grid grid-cols-2 gap-2">
                {REMIX_OPTIONS.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleRemix(opt.prompt, opt.id)}
                        disabled={isLoading}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${opt.color}`}
                    >
                        {isLoading && activeRemix === opt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : opt.icon}
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
                <span className="text-[10px] font-bold text-slate-400">أو اسأل سؤال</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
            </div>

            {/* Follow-up Input */}
            <div className="relative">
                <input
                    type="text"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                    placeholder="مثال: أضف ميزة الدفع الإلكتروني..."
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-right"
                    dir="rtl"
                />
                <button
                    onClick={handleFollowUp}
                    disabled={!followUp.trim() || isLoading}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-30"
                >
                    {isLoading && activeRemix === 'custom' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
}

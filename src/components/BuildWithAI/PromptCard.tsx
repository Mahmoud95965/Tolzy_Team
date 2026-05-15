'use client';
import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface PromptCardProps {
    title: string;
    description: string;
    content: string;
    targetTool: string;
}

const toolColors: Record<string, string> = {
    'ChatGPT': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Gemini': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Claude': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Midjourney': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function PromptCard({ title, description, content, targetTool }: PromptCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const colorClass = toolColors[targetTool] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

    return (
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h4>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${colorClass}`}>{targetTool}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{description}</p>
            <div className="relative bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-hide">
                {content}
            </div>
            <button
                onClick={handleCopy}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600'}`}
            >
                {copied ? <><Check className="w-3.5 h-3.5" /> تم النسخ!</> : <><Copy className="w-3.5 h-3.5" /> نسخ البرومبت</>}
            </button>
        </div>
    );
}

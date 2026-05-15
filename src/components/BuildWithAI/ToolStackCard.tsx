'use client';
import React from 'react';
import { Wrench, ExternalLink } from 'lucide-react';

interface ToolStackCardProps {
    category: string;
    name: string;
    reason: string;
}

const categoryIcons: Record<string, string> = {
    frontend: '🎨',
    backend: '⚙️',
    database: '🗄️',
    hosting: '☁️',
    ai: '🤖',
};

const categoryLabels: Record<string, string> = {
    frontend: 'الواجهة الأمامية',
    backend: 'الخادم الخلفي',
    database: 'قاعدة البيانات',
    hosting: 'الاستضافة',
    ai: 'الذكاء الاصطناعي',
};

export default function ToolStackCard({ category, name, reason }: ToolStackCardProps) {
    const icon = categoryIcons[category] || '🔧';
    const label = categoryLabels[category] || category;

    return (
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all group">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-lg">{icon}</div>
                <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{label}</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{name}</h4>
                </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{reason}</p>
        </div>
    );
}

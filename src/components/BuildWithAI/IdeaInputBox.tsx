'use client';
import React, { useState } from 'react';
import { Rocket, Sparkles, Lightbulb, Code, Palette, ShoppingCart, GraduationCap, Mic } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface IdeaInputBoxProps {
    onSubmit: (idea: string, level: string) => void;
    isLoading: boolean;
}

const QUICK_IDEAS = [
    { text: 'تطبيق لإدارة المهام بالذكاء الاصطناعي', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { text: 'منصة تعليمية عربية تفاعلية', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { text: 'متجر إلكتروني لبيع المنتجات الرقمية', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
    { text: 'أداة لتوليد التصاميم تلقائياً', icon: <Palette className="w-3.5 h-3.5" /> },
    { text: 'نظام حجز مواعيد ذكي', icon: <Code className="w-3.5 h-3.5" /> },
];

const LEVELS = [
    { id: 'beginner', label: 'مبتدئ', desc: 'No-Code وأدوات بسيطة', emoji: '🌱' },
    { id: 'intermediate', label: 'متوسط', desc: 'أطر عمل شائعة', emoji: '⚡' },
    { id: 'advanced', label: 'متقدم', desc: 'بنية احترافية متكاملة', emoji: '🚀' },
];

export default function IdeaInputBox({ onSubmit, isLoading }: IdeaInputBoxProps) {
    const [idea, setIdea] = useState('');
    const [level, setLevel] = useState('beginner');

    const { isListening, transcript, toggleListening, hasSupport } = useSpeechRecognition();

    React.useEffect(() => {
        if (isListening && transcript) {
            setIdea(transcript);
        }
    }, [transcript, isListening]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim().length >= 5 && !isLoading) {
            onSubmit(idea.trim(), level);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 text-white">
                    <Rocket className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    ابنِ مشروعك مع <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">الذكاء الاصطناعي</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
                    أدخل فكرتك وسنولّد لك خطة بناء كاملة: الميزات، التقنيات، الخطوات، والبرومبتات الجاهزة.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Idea Textarea */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="صف فكرة مشروعك هنا... (مثال: تطبيق يساعد الطلاب على تنظيم دراستهم باستخدام الذكاء الاصطناعي)"
                        rows={4}
                        disabled={isLoading}
                        className="relative w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl py-5 px-6 pb-12 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-base placeholder:text-slate-400 font-medium resize-none scrollbar-hide"
                        dir="rtl"
                    />
                    {hasSupport && (
                        <div className="absolute bottom-3 left-3 z-10">
                            <button
                                type="button"
                                onClick={toggleListening}
                                title={isListening ? "إيقاف التسجيل" : "تحدث"}
                                className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                                    isListening 
                                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Level Selector */}
                <div className="grid grid-cols-3 gap-3">
                    {LEVELS.map((l) => (
                        <button
                            key={l.id}
                            type="button"
                            onClick={() => setLevel(l.id)}
                            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all text-center ${level === l.id
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10'
                                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                        >
                            <span className="text-2xl">{l.emoji}</span>
                            <span className={`text-sm font-bold ${level === l.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{l.label}</span>
                            <span className="text-[10px] text-slate-400">{l.desc}</span>
                        </button>
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={idea.trim().length < 5 || isLoading}
                    className="w-full py-4 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isLoading ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري بناء الخطة...</>
                    ) : (
                        <><Sparkles className="w-5 h-5" /> ابدأ البناء</>
                    )}
                </button>
            </form>

            {/* Quick Ideas */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400">أفكار سريعة:</span>
                {QUICK_IDEAS.map((q) => (
                    <button
                        key={q.text}
                        onClick={() => setIdea(q.text)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                    >
                        {q.icon} {q.text}
                    </button>
                ))}
            </div>
        </div>
    );
}

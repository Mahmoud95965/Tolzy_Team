'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface WelcomeScreenProps {
    onQuickAction: (text: string) => void;
    userName?: string;
    userPlan?: string;
    children?: React.ReactNode;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction, userName, userPlan = 'free', children }) => {
    const suggestions = [
        { text: 'اشرح لي كود برمجي معقد بالتفصيل 💻', label: 'تحليل الأكواد' },
        { text: 'اكتب خوارزمية ذكية بلغة TypeScript ⚡', label: 'برمجة ذكية' },
        { text: 'اقترح لي أدوات الذكاء الاصطناعي لمشروعي 🚀', label: 'اكتشاف أدوات' },
        { text: 'ضع لي مسار تعلم متكامل للذكاء الاصطناعي 🎓', label: 'مسار تعلم' }
    ];

    const normalizedPlan = (userPlan || 'free').toLowerCase();
    const isMax = normalizedPlan.includes('max');
    const isPro = !isMax && normalizedPlan.includes('pro');

    const planLabel = isMax ? 'خطة MAX (الاستوديو) 👑' : isPro ? 'الخطة الاحترافية (Pro) ⭐' : 'الخطة المجانية (Free)';

    return (
        <div className="mx-auto mt-2 w-full flex-1 px-4 md:px-8 max-w-5xl relative flex h-full flex-col items-center gap-6 max-sm:!px-1 md:px-14 pt-2 md:pt-6 select-none text-center" dir="rtl">
            
            {/* Real Plan Status Notice Badge Pill */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center mb-1"
            >
                <div className="inline-flex items-center gap-2 rounded-full h-8 px-4 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 select-none bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs backdrop-blur-md">
                    <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isPro || isMax ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400 dark:bg-neutral-500'}`} />
                        <span>{planLabel}</span>
                    </span>
                    <div className="size-[3px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                    <Link
                        href="/pricing"
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors cursor-pointer"
                    >
                        {isPro || isMax ? 'إدارة الاشتراك' : 'ترقية الحساب ⚡'}
                    </Link>
                </div>
            </motion.div>

            {/* AXIOM Authentic Identity & Greeting */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="my-1 w-full"
            >
                <div className="mx-auto flex w-full flex-col items-center gap-3 max-w-2xl">
                    {/* AXIOM Official Logo */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-lg bg-neutral-900 flex items-center justify-center p-0.5">
                        <img 
                            src="/image/tools/11zon_cropped (1).webp" 
                            alt="AXIOM AI" 
                            className="w-full h-full object-cover rounded-xl"
                        />
                    </div>

                    <h1 
                        className="text-neutral-900 dark:text-white font-black tracking-tight"
                        style={{ fontSize: 'clamp(1.75rem, 1.2rem + 1.8vw, 2.25rem)', lineHeight: 1.25 }}
                    >
                        {userName ? `أهلاً بك، ${userName} 👋` : 'بمَ يمكن لـ AXIOM مساعدتك اليوم؟'}
                    </h1>

                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-md leading-relaxed">
                        مساعد الذكاء الاصطناعي للتفكير البرمجي، التحليل، وحل المشكلات المعقدة
                    </p>
                </div>
            </motion.div>

            {/* Composer Children Container */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-2xl relative z-20"
            >
                {children}
            </motion.div>

            {/* Quick Suggestions Grid */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl px-1 z-10"
            >
                {suggestions.map((sug, i) => (
                    <button
                        key={i}
                        onClick={() => onQuickAction(sug.text)}
                        className="flex flex-col items-start text-right p-3.5 rounded-2xl bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer active:scale-[0.99]"
                    >
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{sug.label}</span>
                        <span className="text-xs text-neutral-700 dark:text-neutral-200 font-semibold group-hover:text-neutral-900 dark:group-hover:text-white transition-colors leading-relaxed">{sug.text}</span>
                    </button>
                ))}
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;

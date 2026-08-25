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
        { text: 'اشرح لي كود برمجي بالتفصيل 💻', label: 'تحليل الأكواد' },
        { text: 'اكتب خوارزمية ذكية بلغة TypeScript ⚡', label: 'برمجة ذكية' },
        { text: 'اقترح لي أدوات الذكاء الاصطناعي لمشروعي 🚀', label: 'اكتشاف أدوات' },
        { text: 'ضع لي مسار تعلم متكامل للذكاء الاصطناعي 🎓', label: 'مسار تعلم' }
    ];

    const normalizedPlan = (userPlan || 'free').toLowerCase();
    const isMax = normalizedPlan.includes('max');
    const isPro = !isMax && normalizedPlan.includes('pro');

    const planLabel = isMax ? 'خطة MAX 👑' : isPro ? 'خطة Pro ⭐' : 'الخطة المجانية';

    return (
        <div className="mx-auto w-full flex-1 px-2.5 sm:px-6 md:px-8 max-w-4xl relative flex h-full flex-col items-center justify-center gap-4 sm:gap-6 pt-2 pb-6 sm:pt-4 select-none text-center" dir="rtl">
            
            {/* Plan Status Notice Badge Pill */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full flex justify-center"
            >
                <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full h-7 sm:h-8 px-3 sm:px-4 text-center text-[10px] sm:text-xs font-semibold text-neutral-700 dark:text-neutral-300 select-none bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs backdrop-blur-md">
                    <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isPro || isMax ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400 dark:bg-neutral-500'}`} />
                        <span>{planLabel}</span>
                    </span>
                    <div className="size-[2.5px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                    <Link
                        href="/pricing"
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors cursor-pointer"
                    >
                        {isPro || isMax ? 'إدارة الاشتراك' : 'ترقية الحساب ⚡'}
                    </Link>
                </div>
            </motion.div>

            {/* AXIOM Logo & Greeting */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="w-full"
            >
                <div className="mx-auto flex w-full flex-col items-center gap-2 sm:gap-3 max-w-2xl">
                    {/* AXIOM Official Logo */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-md bg-neutral-900 flex items-center justify-center p-0.5">
                        <img 
                            src="/image/tools/11zon_cropped (1).webp" 
                            alt="AXIOM AI" 
                            className="w-full h-full object-cover rounded-xl"
                        />
                    </div>

                    <h1 
                        className="text-neutral-900 dark:text-white font-black tracking-tight text-lg sm:text-2xl md:text-3xl leading-snug px-1"
                    >
                        {userName ? `أهلاً بك، ${userName} 👋` : 'بمَ يمكن لـ AXIOM مساعدتك اليوم؟'}
                    </h1>

                    <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-xs sm:max-w-md leading-relaxed px-2">
                        مساعد الذكاء الاصطناعي للتفكير البرمجي، التحليل، وحل المشكلات المعقدة
                    </p>
                </div>
            </motion.div>

            {/* Composer Children Container */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-full max-w-2xl relative z-20 px-0.5 sm:px-0"
            >
                {children}
            </motion.div>

            {/* Quick Suggestions Grid */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl px-0.5 sm:px-1 z-10"
            >
                {suggestions.map((sug, i) => (
                    <button
                        key={i}
                        onClick={() => onQuickAction(sug.text)}
                        className="flex flex-col items-start text-right p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs hover:shadow-sm transition-all duration-200 group cursor-pointer active:scale-[0.99]"
                    >
                        <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{sug.label}</span>
                        <span className="text-[11px] sm:text-xs text-neutral-700 dark:text-neutral-200 font-semibold group-hover:text-neutral-900 dark:group-hover:text-white transition-colors leading-snug">{sug.text}</span>
                    </button>
                ))}
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;

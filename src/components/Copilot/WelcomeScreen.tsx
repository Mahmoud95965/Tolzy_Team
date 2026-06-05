'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
    onQuickAction: (text: string) => void;
    userName?: string;
    children?: React.ReactNode;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction, userName, children }) => {
    const suggestions = [
        { text: 'اشرح لي كود برمجي معقد بالتفصيل 💻', label: 'تحليل الأكواد' },
        { text: 'اكتب خوارزمية ذكية بلغة TypeScript ⚡', label: 'برمجة ذكية' },
        { text: 'اقترح لي أدوات الذكاء الاصطناعي لبناء موقع ويب 🚀', label: 'اكتشاف أدوات' },
        { text: 'ضع لي خطة دراسية متكاملة لتعلم الآلة 🎓', label: 'مسار تعلم' }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4 sm:px-6 pt-8 pb-32 sm:pb-40 select-none text-center relative overflow-hidden" dir="rtl">
            
            {/* Ultra-Futuristic Glowing AXIOM Geometric Logo */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-6 group cursor-pointer"
            >
                {/* Neon Ambient Outer Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-[30px] opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                
                {/* Premium Inner Shield Logo */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden">
                    <img 
                        src="/image/tools/11zon_cropped (1).webp" 
                        alt="AXIOM Logo" 
                        className="w-full h-full object-cover rounded-3xl relative z-10 animate-fade-in" 
                    />
                </div>
            </motion.div>

            {/* Premium Heading */}
            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight max-w-md sm:max-w-xl mx-auto leading-tight"
            >
                {userName ? `أهلاً بك، ${userName} 👋` : 'بمَ يمكنني مساعدتك اليوم؟'}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 max-w-sm sm:max-w-md mx-auto mb-8 leading-relaxed font-medium"
            >
                أنا <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">AXIOM</span>، مساعدك الذكي للتفكير والتحليل وحل المشكلات البرمجية المعقدة.
            </motion.p>

            {/* Children Input Area */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="w-full max-w-2xl mb-8 relative z-20"
            >
                {children}
            </motion.div>

            {/* Elegant Premium Suggestions Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-2 z-10"
            >
                {suggestions.map((sug, i) => (
                    <button
                        key={i}
                        onClick={() => onQuickAction(sug.text)}
                        className="flex flex-col items-start text-right p-4 rounded-2xl bg-white dark:bg-[#131314]/40 hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 group cursor-pointer active:scale-[0.98]"
                    >
                        <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 mb-1 group-hover:text-indigo-400 transition-colors duration-300">{sug.label}</span>
                        <span className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300 leading-relaxed">{sug.text}</span>
                    </button>
                ))}
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;

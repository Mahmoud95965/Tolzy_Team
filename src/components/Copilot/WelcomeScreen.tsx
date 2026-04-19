import React from 'react';
import { Code, BookOpen, PenTool, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
    onQuickAction: (text: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction }) => {
    const actions = [
        {
            label: "برمجة موقع",
            icon: <Code size={20} />,
            prompt: "أريد برمجة موقع إلكتروني. ما هي أفضل أدوات الذكاء الاصطناعي التي تساعدني في الأكواد؟"
        },
        {
            label: "تعلم الذكاء الاصطناعي",
            icon: <BookOpen size={20} />,
            prompt: "أريد أن أبدأ بتعلم الذكاء الاصطناعي. من أين أبدأ وما هي أفضل الكورسات؟"
        },
        {
            label: "صناعة المحتوى",
            icon: <PenTool size={20} />,
            prompt: "أحتاج لأدوات ذكاء اصطناعي تساعدني في كتابة المحتوى باللغة العربية."
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center" dir="rtl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#fea619] to-[#eb8d00] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-[#fea619]/30 animate-fade-in group hover:scale-105 transition-transform duration-500">
                        <Bot size={64} strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-[#fea619] dark:from-white dark:to-[#fea619] mb-3">
                    مساعدك الذكي من Tolzy
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                    اسألني عن أفضل أدوات الذكاء الاصطناعي، الكورسات التعليمية، أو كيف تنجز مهامك بشكل أسرع وأذكى.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {actions.map((action, index) => (
                    <motion.button
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        onClick={() => onQuickAction(action.prompt)}
                        className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl hover:border-[#fea619] dark:hover:border-[#fea619]/50 hover:shadow-lg transition-all group"
                    >
                        <div className="p-3.5 bg-orange-50 dark:bg-[#fea619]/10 rounded-full text-orange-600 dark:text-[#fea619] group-hover:bg-[#fea619] group-hover:text-white transition-colors duration-300">
                            {action.icon}
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                            {action.label}
                        </span>
                    </motion.button>
                ))}
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={() => onQuickAction("GUIDE_ME")}
                className="mt-10 px-8 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-slate-500/20 transition-all flex items-center gap-2 group"
            >
                <span className="group-hover:rotate-12 transition-transform">✨</span> ابدأ رحلة الاستكشاف
            </motion.button>
        </div>
    );
};

export default WelcomeScreen;

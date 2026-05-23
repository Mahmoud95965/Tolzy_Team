import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons: Material Symbols Outlined

interface GuidedFlowProps {
    onComplete: (summary: string) => void;
}

const questions = [
    {
        id: 'goal',
        question: "ما هو هدفك الرئيسي اليوم؟",
        options: ["بناء موقع إلكتروني", "إنشاء محتوى", "تصميم جرافيك", "تعلم الذكاء الاصطناعي", "أتمتة المهام"]
    },
    {
        id: 'experience',
        question: "ما هو مستوى خبرتك؟",
        options: ["مبتدئ تماماً", "متوسط", "خبير"]
    },
    {
        id: 'budget',
        question: "هل تعمل ضمن ميزانية محددة؟",
        options: ["مجاني فقط", "أبحث عن الأفضل (مدفوع)", "فترة تجريبية تكفي"]
    }
];

const GuidedFlow: React.FC<GuidedFlowProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleSelect = (option: string) => {
        const currentQ = questions[step];
        const newAnswers = { ...answers, [currentQ.id]: option };
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            const summary = `هدفي هو ${newAnswers.goal}. مستواي ${newAnswers.experience}. بخصوص الميزانية: ${newAnswers.budget}. ساعدني بأفضل الأدوات.`;
            onComplete(summary);
        }
    };

    const currentQuestion = questions[step];

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all">
            {/* Progress Bar */}
            <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                    className="h-full bg-blue-600"
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 md:p-10"
                >
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 block">
                        الخطوة {step + 1} من {questions.length}
                    </span>

                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className="w-full text-right p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all group flex justify-between items-center"
                            >
                                <span className="text-lg font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                                    {option}
                                </span>
                                <span className="material-symbols-outlined text-[22px] text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">chevron_right</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default GuidedFlow;

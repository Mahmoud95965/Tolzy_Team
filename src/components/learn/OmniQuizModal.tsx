"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GraduationCap, CheckCircle2, X, Sparkles, Trophy, 
    RefreshCw, ArrowRight, ArrowLeft, Clock, AlertCircle, Award
} from 'lucide-react';
import Confetti from 'react-confetti';

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    timestamp?: string;
}

interface OmniQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoId?: string | null;
    title?: string;
    description?: string;
    chunks?: any[];
    onSeekTimestamp?: (timestamp: string) => void;
}

export default function OmniQuizModal({
    isOpen,
    onClose,
    videoId,
    title,
    description,
    chunks,
    onSeekTimestamp
}: OmniQuizModalProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
            const handleResize = () => {
                setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => {
        if (isOpen && questions.length === 0) {
            fetchQuiz();
        }
    }, [isOpen]);

    const fetchQuiz = async () => {
        setIsLoading(true);
        setAnswers({});
        setShowResults(false);
        setCurrentIndex(0);

        try {
            const res = await fetch('/api/learn/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoId,
                    title: title || 'المادة التعليمية',
                    description,
                    chunks
                })
            });

            if (!res.ok) throw new Error('فشل توليد الاختبار');
            const data = await res.json();
            if (data.quiz && Array.isArray(data.quiz)) {
                setQuestions(data.quiz);
            }
        } catch (e) {
            console.error('Failed to load quiz:', e);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentQuestion = questions[currentIndex];
    const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;
    const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;

    const handleSelect = (optionIdx: number) => {
        if (isAnswered) return;
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionIdx
        }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Calculate score
    const totalQuestions = questions.length || 1;
    const correctCount = questions.filter(q => answers[q.id] === q.correctIndex).length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const isSuccess = scorePercentage >= 60;

    let badgeText = "محاولة جيدة، راجع الفيديو وحاول ثانية 💪";
    if (scorePercentage === 100) badgeText = "عبقري الكورس الفائق 🏆";
    else if (scorePercentage >= 80) badgeText = "مستوى متقدم واستيعاب ممتاز 🌟";
    else if (scorePercentage >= 60) badgeText = "مستوى جيد واستيعاب واعد 🚀";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
                {showResults && isSuccess && windowDimensions.width > 0 && (
                    <Confetti
                        width={windowDimensions.width}
                        height={windowDimensions.height}
                        recycle={false}
                        numberOfPieces={350}
                        gravity={0.15}
                    />
                )}

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl bg-[#0b0c12] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white flex items-center gap-2">
                                    <span>اختبار الفهم التفاعلي الذكي</span>
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                </h2>
                                <p className="text-xs text-slate-400">قياس الاستيعاب الفوري لمفاهيم المادة</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
                        {isLoading ? (
                            <div className="py-16 text-center flex flex-col items-center">
                                <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
                                <h3 className="text-sm font-black text-white mb-1">محرك AXIOM يقوم بصياغة الأسئلة الذكية...</h3>
                                <p className="text-xs text-slate-400">تحليل محتوى الفيديو واستخراج الأسئلة الأكثر دقة</p>
                            </div>
                        ) : showResults ? (
                            /* RESULTS SCREEN */
                            <div className="py-6 text-center flex flex-col items-center">
                                <div className="relative mb-6">
                                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border shadow-2xl ${
                                        isSuccess 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                    }`}>
                                        <Trophy className="w-12 h-12 animate-bounce" />
                                    </div>
                                </div>

                                <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black text-slate-200 mb-3">
                                    {badgeText}
                                </div>

                                <h3 className="text-3xl font-black text-white mb-2">
                                    {scorePercentage}%
                                </h3>
                                <p className="text-xs text-slate-400 mb-6">
                                    أجبت بشكل صحيح على <strong className="text-emerald-400">{correctCount}</strong> من أصل <strong className="text-white">{totalQuestions}</strong> أسئلة
                                </p>

                                {/* Questions Summary List */}
                                <div className="w-full space-y-3 text-right max-h-[220px] overflow-y-auto pr-1 mb-6">
                                    {questions.map((q, idx) => {
                                        const isCorrect = answers[q.id] === q.correctIndex;
                                        return (
                                            <div 
                                                key={q.id}
                                                className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                                                    isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    {isCorrect ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-red-400 shrink-0" />
                                                    )}
                                                    <span className="text-slate-300 font-bold truncate">س {idx + 1}: {q.question}</span>
                                                </div>
                                                {q.timestamp && onSeekTimestamp && (
                                                    <button
                                                        onClick={() => {
                                                            onClose();
                                                            onSeekTimestamp(q.timestamp!);
                                                        }}
                                                        className="text-[10px] text-emerald-400 hover:underline shrink-0 font-bold flex items-center gap-1"
                                                    >
                                                        <Clock className="w-3 h-3" />
                                                        <span>{q.timestamp}</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-3 w-full">
                                    <button
                                        onClick={fetchQuiz}
                                        className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                    >
                                        <RefreshCw className="w-4 h-4 text-emerald-400" />
                                        <span>إعادة الاختبار بأسئلة جديدة</span>
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        متابعة التعلم والمناقشة 🚀
                                    </button>
                                </div>
                            </div>
                        ) : currentQuestion ? (
                            /* ACTIVE QUESTION VIEW */
                            <div className="space-y-5 text-right">
                                {/* Question count and progress */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                        السؤال {currentIndex + 1} من {questions.length}
                                    </span>

                                    {currentQuestion.timestamp && onSeekTimestamp && (
                                        <button
                                            onClick={() => onSeekTimestamp(currentQuestion.timestamp!)}
                                            className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 transition-all"
                                        >
                                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>اللقطة في الفيديو: {currentQuestion.timestamp}</span>
                                        </button>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-l from-emerald-400 to-teal-400 transition-all duration-300"
                                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                    />
                                </div>

                                {/* Question Title */}
                                <h3 className="text-sm sm:text-base font-black text-white leading-relaxed">
                                    {currentQuestion.question}
                                </h3>

                                {/* Options */}
                                <div className="grid grid-cols-1 gap-2.5">
                                    {currentQuestion.options.map((opt, oIdx) => {
                                        const isSelected = selectedOption === oIdx;
                                        const isCorrect = currentQuestion.correctIndex === oIdx;

                                        let style = "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5 hover:border-emerald-500/20";
                                        if (isAnswered) {
                                            if (isCorrect) {
                                                style = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold";
                                            } else if (isSelected) {
                                                style = "bg-red-500/20 border-red-500/40 text-red-400 font-bold";
                                            } else {
                                                style = "bg-white/[0.01] border-white/[0.02] text-slate-600 opacity-50 pointer-events-none";
                                            }
                                        }

                                        return (
                                            <button
                                                key={oIdx}
                                                disabled={isAnswered}
                                                onClick={() => handleSelect(oIdx)}
                                                className={`p-3.5 rounded-2xl border text-right text-xs transition-all flex items-center justify-between gap-3 ${style}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center font-mono text-[10px] text-slate-400 shrink-0">
                                                        {oIdx + 1}
                                                    </span>
                                                    <span>{opt}</span>
                                                </div>
                                                {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                                {isAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Explanation Banner */}
                                {isAnswered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed font-medium space-y-1"
                                    >
                                        <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>تفسير الإجابة:</span>
                                        </div>
                                        <p>{currentQuestion.explanation}</p>
                                    </motion.div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Nav */}
                    {!isLoading && !showResults && questions.length > 0 && (
                        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>السابق</span>
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={!isAnswered}
                                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                            >
                                <span>{currentIndex === questions.length - 1 ? 'عرض النتيجة 🏆' : 'السؤال التالي'}</span>
                                <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

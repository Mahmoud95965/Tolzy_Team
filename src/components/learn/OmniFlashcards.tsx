"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, RotateCw, Clock, CheckCircle2, BookOpen, RefreshCw } from 'lucide-react';

export interface Flashcard {
    id: number;
    term: string;
    definition: string;
    category?: string;
    timestamp?: string;
}

interface OmniFlashcardsProps {
    flashcards: Flashcard[];
    onSeekTimestamp?: (timestamp: string) => void;
    onRegenerate?: () => void;
    isLoading?: boolean;
}

export default function OmniFlashcards({ flashcards, onSeekTimestamp, onRegenerate, isLoading }: OmniFlashcardsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState<Record<number, boolean>>({});

    if (isLoading || !flashcards || flashcards.length === 0) {
        return (
            <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-3xl text-slate-400 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                    <p className="text-xs font-bold text-white mb-1">
                        {isLoading ? 'جاري استخراج وبناء البطاقات التعليمية عبر AXIOM...' : 'لم يتم توليد بطاقات تعليمية بعد'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                        {isLoading ? 'يتم تلخيص المفاهيم الأساسية للمادة في بطاقات قابلة للتقليب' : 'يمكنك الضغط على الزر أدناه لتوليد البطاقات فوراً'}
                    </p>
                </div>
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        disabled={isLoading}
                        className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{isLoading ? 'جاري التوليد...' : 'توليد البطاقات الآن ⚡'}</span>
                    </button>
                )}
            </div>
        );
    }

    const currentCard = flashcards[currentIndex] || flashcards[0];
    const isKnown = !!knownCards[currentCard.id];

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    };

    const toggleKnown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setKnownCards(prev => ({
            ...prev,
            [currentCard.id]: !prev[currentCard.id]
        }));
    };

    return (
        <div className="w-full flex flex-col gap-4 text-right select-none" dir="rtl">
            {/* Header & Card Count */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        {currentIndex + 1} / {flashcards.length}
                    </span>
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        بطاقات المفاهيم والمصطلحات
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {currentCard.timestamp && onSeekTimestamp && (
                        <button
                            onClick={() => onSeekTimestamp(currentCard.timestamp!)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-white/5 transition-all"
                            title="الانتقال للتوقيت في الفيديو"
                        >
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>{currentCard.timestamp}</span>
                        </button>
                    )}
                    {currentCard.category && (
                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                            {currentCard.category}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-l from-emerald-400 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
            </div>

            {/* 3D Flip Card Container */}
            <div 
                className="relative w-full h-[220px] sm:h-[240px] cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    className="w-full h-full relative"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* FRONT SIDE (Term) */}
                    <div 
                        className={`absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between border backdrop-blur-xl transition-all shadow-xl ${
                            isKnown 
                                ? 'bg-gradient-to-br from-emerald-950/20 via-slate-900/40 to-black/60 border-emerald-500/30' 
                                : 'bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-black/40 border-white/10 hover:border-emerald-500/20'
                        }`}
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                            <span className="flex items-center gap-1.5 text-slate-400">
                                <RotateCw className="w-3 h-3 text-emerald-400" />
                                انقر لقلب البطاقة ومعرفة المفهوم
                            </span>
                            <button
                                onClick={toggleKnown}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${
                                    isKnown 
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isKnown ? 'تم إتقانها ✓' : 'تحديد كـ متقنة'}</span>
                            </button>
                        </div>

                        <div className="text-center py-3">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/80 mb-1 block">المصطلح / المفهوم</span>
                            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                {currentCard.term}
                            </h3>
                        </div>

                        <div className="flex items-center justify-center">
                            <span className="text-[11px] text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                اضغط للتعريف الشامل 💡
                            </span>
                        </div>
                    </div>

                    {/* BACK SIDE (Definition) */}
                    <div 
                        className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-black/80 backdrop-blur-xl shadow-2xl"
                        style={{ 
                            backfaceVisibility: "hidden", 
                            transform: "rotateY(180deg)" 
                        }}
                    >
                        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-white/5 pb-2">
                            <span>الشرح والتعريف البرمجي 🧠</span>
                            <span className="text-[10px] text-slate-400 font-normal">انقر للعودة للمصطلح</span>
                        </div>

                        <div className="py-2 text-right">
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                                {currentCard.definition}
                            </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                            <span className="text-emerald-400 font-bold">Tolzy OmniLearn Flashcard</span>
                            {currentCard.timestamp && onSeekTimestamp && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSeekTimestamp(currentCard.timestamp!);
                                    }}
                                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                                >
                                    <Clock className="w-3 h-3" />
                                    <span>شاهد الشرح في الفيديو ({currentCard.timestamp})</span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
                <button
                    onClick={handlePrev}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/20 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                >
                    <ChevronRight className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>البطاقة السابقة</span>
                </button>

                <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    title="تقليب البطاقة"
                >
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>قلب</span>
                </button>

                <button
                    onClick={handleNext}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/20 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                >
                    <span>البطاقة التالية</span>
                    <ChevronLeft className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}

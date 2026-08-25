'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ChevronRight, ChevronLeft, ArrowUpLeft, X, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  title: string;
  desc: string;
  link?: string;
  emoji: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    badge: 'جديد',
    badgeColor: 'text-emerald-700 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    emoji: '🚀',
    title: 'إطلاق TOLZY Prompts',
    desc: 'شارك برومبتاتك مع مجتمع من المبدعين العرب وابدأ التفاعل مع آلاف المحترفين.',
    link: '/community',
  },
  {
    id: '2',
    badge: 'تحديث',
    badgeColor: 'text-indigo-700 dark:text-indigo-400',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-500/15',
    emoji: '✨',
    title: 'TOLZY AXIOM 2.5',
    desc: 'نماذج أذكى، تفكير أعمق، وتجربة محادثة أسرع مع أقوى المحركات.',
    link: '/axiom',
  },
  {
    id: '3',
    badge: 'مجاني',
    badgeColor: 'text-violet-700 dark:text-violet-400',
    badgeBg: 'bg-violet-100 dark:bg-violet-500/15',
    emoji: '🎓',
    title: '+150 كورس تقني مجاني',
    desc: 'مكتبة ضخمة من الدورات في البرمجة، الذكاء الاصطناعي، والتصميم — مجاناً.',
    link: '/learn',
  },
  {
    id: '4',
    badge: 'أدوات',
    badgeColor: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-500/15',
    emoji: '🤖',
    title: '+1000 أداة ذكاء اصطناعي',
    desc: 'أكبر دليل عربي لأدوات AI — مرتبة، مقيّمة، وموثّقة بالعربية.',
    link: '/tools',
  },
  {
    id: '5',
    badge: 'قريباً',
    badgeColor: 'text-rose-700 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-500/15',
    emoji: '🔥',
    title: 'Tolzy Hex — قيد التطوير',
    desc: 'مشروع ثوري من Tolzy AI سيحدث ضجة كبيرة في عالم الذكاء الاصطناعي العربي!',
  },
];

const INTERVAL_MS = 5000;

export default function NewsPanelSection() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (dismissed || isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIdx(prev => (prev + 1) % NEWS_ITEMS.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [dismissed, isPaused]);

  if (dismissed) return null;

  const current = NEWS_ITEMS[currentIdx];

  const goTo = (idx: number) => {
    setDirection(idx > currentIdx ? 1 : -1);
    setCurrentIdx(idx);
  };

  const goNext = () => { setDirection(1); setCurrentIdx(p => (p + 1) % NEWS_ITEMS.length); };
  const goPrev = () => { setDirection(-1); setCurrentIdx(p => (p - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length); };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/[0.07] bg-white dark:bg-[#13131A] shadow-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir="rtl"
    >
      {/* Top gradient stripe */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-amber-400 to-rose-500" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Megaphone className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
            آخر الأخبار
          </h2>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
            مباشر
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <X size={14} />
        </button>
      </div>

      {/* Animated News Content */}
      <div className="relative px-5 py-4 min-h-[100px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col gap-2"
          >
            {/* Badge + Emoji */}
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">{current.emoji}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${current.badgeBg} ${current.badgeColor}`}>
                {current.badge}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-black text-slate-900 dark:text-white leading-snug">
              {current.title}
            </h3>

            {/* Description */}
            <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
              {current.desc}
            </p>

            {/* CTA */}
            {current.link && (
              <Link
                href={current.link}
                className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group"
              >
                اكتشف الآن
                <ArrowUpLeft size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: dots + navigation */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-white/5">
        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {NEWS_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIdx
                  ? 'bg-violet-500 w-4 h-1.5'
                  : 'bg-slate-200 dark:bg-white/15 hover:bg-slate-300 dark:hover:bg-white/25 w-1.5 h-1.5'
              }`}
            />
          ))}
        </div>

        {/* Nav arrows */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 ml-2">
            {currentIdx + 1} / {NEWS_ITEMS.length}
          </span>
          <button
            onClick={goPrev}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={goNext}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

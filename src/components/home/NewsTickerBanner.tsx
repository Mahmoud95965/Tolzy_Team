'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface NewsTick {
  id: string;
  badge: string;
  badgeColor: string;
  text: string;
  link?: string;
}

const NEWS_ITEMS: NewsTick[] = [
  {
    id: '1',
    badge: '🚀 جديد',
    badgeColor: 'bg-emerald-500',
    text: 'إطلاق TOLZY Prompts — شارك برومبتاتك مع مجتمع من المبدعين العرب!',
    link: '/community',
  },
  {
    id: '2',
    badge: '✨ تحديث',
    badgeColor: 'bg-indigo-500',
    text: 'TOLZY AXIOM 2.5 متاح الآن — تفكير أعمق، نماذج أسرع، وتجربة أفضل!',
    link: '/axiom',
  },
  {
    id: '3',
    badge: '🎓 تعلم',
    badgeColor: 'bg-violet-500',
    text: '+150 كورس تقني مجاني متاح في Tolzy Learn — ابدأ رحلتك التعليمية اليوم!',
    link: '/learn',
  },
  {
    id: '4',
    badge: '🤖 ذكاء اصطناعي',
    badgeColor: 'bg-amber-500',
    text: 'اكتشف أحدث أدوات الذكاء الاصطناعي — أكثر من 1000 أداة في مكان واحد!',
    link: '/tools',
  },
  {
    id: '5',
    badge: '🔥 قريباً',
    badgeColor: 'bg-rose-500',
    text: 'Tolzy Hex — مشروع ثوري من Tolzy AI سيحدث ضجة كبيرة في عالم الذكاء الاصطناعي العربي!',
  },
];

const INTERVAL_MS = 4500;
// Navbar height = 80px (h-20), banner height = 44px
// Total fixed top offset for content below = 80 + 44 = 124px (≈ pt-[124px])
export const BANNER_HEIGHT = 44;

export default function NewsTickerBanner() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIdx((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [dismissed]);

  if (dismissed) return (
    // Reserve zero space when dismissed
    <div id="news-ticker-placeholder" style={{ height: 0 }} />
  );

  const current = NEWS_ITEMS[currentIdx];

  const goNext = () => {
    setDirection(1);
    setCurrentIdx((prev) => (prev + 1) % NEWS_ITEMS.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIdx((prev) => (prev - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length);
  };

  const variants = {
    enter: (dir: number) => ({ y: dir > 0 ? 16 : -16, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? -16 : 16, opacity: 0 }),
  };

  return (
    /**
     * fixed تحت الـ Navbar مباشرةً
     * top-[80px]  = ارتفاع الـ Navbar (h-20)
     * z-40        = أقل من الـ Navbar (z-50) لكن فوق بقية المحتوى
     */
    <div
      id="news-ticker-banner"
      className="fixed left-0 right-0 z-40 overflow-hidden"
      style={{ top: '80px', height: `${BANNER_HEIGHT}px` }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-[#1a1f2e] to-slate-900 dark:from-[#0a0a0a] dark:via-[#0f1117] dark:to-[#0a0a0a]" />
      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-pulse pointer-events-none" />

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center gap-3">
        {/* Left: Icon + Label */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Megaphone size={12} className="text-amber-400" />
          </div>
          <span className="hidden sm:block text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">أخبار</span>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
        </div>

        {/* Center: Animated News */}
        <div className="flex-1 min-w-0 relative h-6 flex items-center overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center gap-2"
            >
              {/* Badge */}
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black text-white ${current.badgeColor} shadow-sm`}>
                {current.badge}
              </span>

              {/* Text */}
              {current.link ? (
                <a
                  href={current.link}
                  className="text-[13px] text-slate-300 hover:text-amber-300 transition-colors truncate font-medium leading-none"
                >
                  {current.text}
                </a>
              ) : (
                <span className="text-[13px] text-slate-300 truncate font-medium leading-none">
                  {current.text}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Dots + Navigation + Close */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {/* Dots Indicator */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            {NEWS_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentIdx ? 1 : -1); setCurrentIdx(i); }}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIdx
                    ? 'bg-amber-400 w-4 h-1.5'
                    : 'bg-white/20 hover:bg-white/40 w-1.5 h-1.5'
                }`}
              />
            ))}
          </div>

          <div className="w-px h-3.5 bg-white/10 mx-0.5 hidden sm:block" />

          <button
            onClick={goPrev}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronRight size={13} />
          </button>
          <button
            onClick={goNext}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={13} />
          </button>

          <div className="w-px h-3.5 bg-white/10 mx-0.5" />

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="إغلاق"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

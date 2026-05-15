"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageLayout from '../components/layout/PageLayout';
import Link from 'next/link';
import { Sparkles, Cpu, Layout, Shield, Zap, ArrowLeft, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { getChangelogItems, ChangelogItem } from '../services/changelog.service';

// ─── Icon helper ──────────────────────────────────────────────────────────────
const getIcon = (type?: string, cls?: string) => {
  const p = { className: cls };
  switch (type) {
    case 'cpu':    return <Cpu {...p} />;
    case 'layout': return <Layout {...p} />;
    case 'shield': return <Shield {...p} />;
    case 'zap':    return <Zap {...p} />;
    default:       return <Sparkles {...p} />;
  }
};

// ─── Type styles ──────────────────────────────────────────────────────────────
const TYPE_STYLES: Record<string, { pill: string; label: string }> = {
  major: { pill: 'bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300', label: 'تحديث جوهري' },
  minor: { pill: 'bg-sky-100   dark:bg-sky-500/15   text-sky-600   dark:text-sky-300',       label: 'ميزات جديدة'  },
  patch: { pill: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300', label: 'إصلاحات' },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse flex gap-5 px-8 py-10 overflow-hidden">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex-none w-[340px] h-[440px] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
    ))}
  </div>
);

// ─── Empty ────────────────────────────────────────────────────────────────────
const Empty = () => (
  <div className="flex flex-col items-center justify-center py-40 gap-4">
    <Sparkles className="w-16 h-16 text-slate-200 dark:text-slate-800" />
    <p className="text-lg font-semibold text-slate-400 dark:text-slate-600">لا توجد تحديثات بعد</p>
  </div>
);

// ─── Carousel Card ────────────────────────────────────────────────────────────
const CarouselCard = ({ item, isActive }: { item: ChangelogItem; isActive: boolean }) => {
  const href = item.htmlContent ? `/changelog/${item.id}` : item.link;
  const ts = TYPE_STYLES[item.type] ?? TYPE_STYLES.minor;

  return (
    <div
      className={`relative flex-none w-[300px] md:w-[340px] rounded-3xl overflow-hidden border transition-all duration-500
        ${isActive
          ? 'border-slate-200 dark:border-slate-700 shadow-2xl scale-100 opacity-100'
          : 'border-slate-100 dark:border-slate-800 shadow-md scale-[0.92] opacity-50'
        }
        bg-white dark:bg-[#0f0f0f] cursor-pointer`}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-100' : 'scale-110'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getIcon(item.iconType, 'w-14 h-14 text-slate-200 dark:text-slate-800')}
          </div>
        )}
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-[#0f0f0f] to-transparent pointer-events-none" />
        {/* Version */}
        <span className="absolute top-3 left-3 font-mono text-[10px] font-bold bg-black/50 text-white backdrop-blur-md px-2.5 py-1 rounded-full" dir="ltr">
          {item.version}
        </span>
        {/* Type */}
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${ts.pill}`}>
          {ts.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pt-1 flex flex-col gap-2.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
          {item.changes[0] || 'تحسينات عامة لتعزيز تجربتك.'}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">
            {new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })}
          </span>
          {href ? (
            <Link
              href={href}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline group"
            >
              معرفة المزيد
              <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-1" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ─── Featured Row ──────────────────────────────────────────────────────────────
const FeaturedRow = ({ item, index }: { item: ChangelogItem; index: number }) => {
  const isEven = index % 2 === 0;
  const href = item.htmlContent ? `/changelog/${item.id}` : item.link;
  const ts = TYPE_STYLES[item.type] ?? TYPE_STYLES.minor;

  return (
    <div className="group flex flex-col md:flex-row items-center gap-10 md:gap-16 py-12 border-b border-slate-100 dark:border-slate-900 last:border-none">
      <div className={`flex-1 flex flex-col gap-4 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ts.pill}`}>{ts.label}</span>
          <span className="font-mono text-xs text-slate-400 dark:text-slate-600" dir="ltr">{item.version}</span>
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-600">
            <Calendar size={11} />
            {new Date(item.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">{item.title}</h2>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">{item.changes[0]}</p>
        {item.changes.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {item.changes.slice(1).map((ch, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <Tag size={10} className="text-indigo-400 shrink-0" />
                {ch}
              </span>
            ))}
          </div>
        )}
        {href && (
          <Link href={href} className="mt-2 self-start inline-flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-indigo-300/40 active:scale-95">
            استكشف الميزة
            <ArrowLeft size={14} />
          </Link>
        )}
      </div>
      <div className={`flex-1 w-full max-w-lg rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm group-hover:shadow-xl transition-shadow duration-500 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
        ) : (
          <div className="aspect-video bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            {getIcon(item.iconType, 'w-24 h-24 text-slate-200 dark:text-slate-800')}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ChangelogPage: React.FC = () => {
  const [items, setItems]         = useState<ChangelogItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try   { setItems(await getChangelogItems()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const carouselItems    = items.filter(i => !i.isExploreCard && !i.isHero);
  const detailedFeatures = items.filter(i =>  i.isExploreCard ||  i.isHero);
  const total = carouselItems.length;

  // ── Scroll LTR track so active card is centred ───────────────────────────
  const scrollToCard = useCallback((idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    
    // +1 because the first element is the leading spacer
    const cardNode = el.children[idx + 1] as HTMLElement;
    if (!cardNode) return;

    const containerW = el.clientWidth;
    const target = cardNode.offsetLeft - (containerW / 2) + (cardNode.clientWidth / 2);
    
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, []);

  // ── Auto timer ───────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total === 0) return;
    timerRef.current = setInterval(() => {
      setActiveIdx(p => (p + 1) % total);
    }, 3000);
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  // ── Sync scroll on index change ──────────────────────────────────────────
  useEffect(() => { scrollToCard(activeIdx); }, [activeIdx, scrollToCard]);

  const goTo = (idx: number) => { setActiveIdx(idx); startTimer(); };
  const prev = () => goTo((activeIdx - 1 + total) % total);
  const next = () => goTo((activeIdx + 1) % total);

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#080808] text-slate-900 dark:text-white overflow-x-hidden" dir="rtl">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="pt-16 pb-10 px-4 sm:pt-20 sm:pb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={11} />
            سجل التحديثات
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
            ما الجديد في{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">Tolzy</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            اكتشف آخر الميزات والتحسينات التي تضيفها فرقة Tolzy باستمرار لتجعل تجربتك أسرع وأذكى وأجمل.
          </p>
        </section>

        {loading ? <Skeleton /> : items.length === 0 ? <Empty /> : (
          <>
            {/* ── Carousel ────────────────────────────────────────────────── */}
            {total > 0 && (
              <section className="pb-14 select-none">
                {/* Header */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">أحدث الميزات</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{total} تحديث</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={prev} aria-label="السابق" className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-90">
                      <ChevronRight size={17} />
                    </button>
                    <button onClick={next} aria-label="التالي" className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-90">
                      <ChevronLeft size={17} />
                    </button>
                  </div>
                </div>

                {/* 
                  ── Track:
                  - dir="ltr" so scrollLeft always counts left→right (no RTL negatives)
                  - overflow-x-scroll hidden scrollbar
                  - padding on both sides so first/last cards can centre
                -->  */}
                <div className="relative">
                  {/* Fade masks — hidden on small screens so edge cards aren't cut */}
                  <div className="pointer-events-none hidden sm:block absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-[#f9f9f9] dark:from-[#080808] to-transparent" />
                  <div className="pointer-events-none hidden sm:block absolute inset-y-0 left-0  w-20 z-10 bg-gradient-to-r from-[#f9f9f9] dark:from-[#080808] to-transparent" />

                  <div
                    ref={trackRef}
                    dir="ltr"
                    className="flex gap-4 sm:gap-5 overflow-x-scroll pb-4 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                  >
                    {/* Leading spacer */}
                    <div className="flex-none w-[calc(50vw-158px)] md:w-[calc(50vw-180px)]" />

                    {carouselItems.map((item, idx) => (
                      <div key={item.id || idx} onClick={() => goTo(idx)}>
                        <CarouselCard item={item} isActive={idx === activeIdx} />
                      </div>
                    ))}

                    {/* Trailing spacer */}
                    <div className="flex-none w-[calc(50vw-158px)] md:w-[calc(50vw-180px)]" />
                  </div>
                </div>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {carouselItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`انتقل إلى ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        i === activeIdx
                          ? 'w-6 h-2 bg-indigo-600 dark:bg-indigo-400'
                          : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-indigo-300'
                      }`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Divider */}
            {detailedFeatures.length > 0 && total > 0 && (
              <div className="max-w-5xl mx-auto px-6 mb-10">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
              </div>
            )}

            {/* ── Detailed Features ─────────────────────────────────────── */}
            {detailedFeatures.length > 0 && (
              <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">ميزات بارزة</h2>
                  <p className="text-xs text-slate-400 mt-0.5">تحديثات منتقاة تستحق الاستكشاف بعمق</p>
                </div>
                {detailedFeatures.map((item, index) => (
                  <FeaturedRow key={item.id} item={item} index={index} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default ChangelogPage;

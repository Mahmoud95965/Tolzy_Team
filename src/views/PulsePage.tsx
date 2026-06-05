"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Cpu, Layout, Shield, Zap, ArrowLeft, Calendar, 
  Tag, Users, MessageSquare, Bot, ArrowUpRight, ChevronDown, 
  ChevronUp, Clock, Milestone, X
} from 'lucide-react';
import { getChangelogItems, ChangelogItem } from '../services/changelog.service';

// ─── Type styles ──────────────────────────────────────────────────────────────
const TYPE_STYLES: Record<string, { pill: string; label: string }> = {
  major: { pill: 'bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/25', label: 'نبض رئيسي' },
  minor: { pill: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/25', label: 'ميزة جديدة' },
  patch: { pill: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/25', label: 'تحسينات' },
};

const CATEGORY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  ai: { label: 'ذكاء اصطناعي 🤖', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  ui: { label: 'تصميم وواجهة 🎨', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
  community: { label: 'المجتمع 👥', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  bugfix: { label: 'إصلاحات وموثوقية 🔧', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  other: { label: 'تحديث عام 🚀', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10' },
};

// Helper for Icon Selection
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

interface GroupedMonth {
  monthYear: string;
  monthVal: number;
  yearVal: number;
  items: ChangelogItem[];
}

// ─── Skeletons for Premium Loading State ───────────────────────────────────────
const SkeletonLoader = () => (
  <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse space-y-12">
    {/* Bento Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 lg:row-span-2 h-[450px] bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
      <div className="h-[210px] bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
      <div className="h-[210px] bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
      <div className="lg:col-span-3 h-[180px] bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
    </div>
    {/* Timeline Skeleton */}
    <div className="space-y-6 pt-12">
      <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-24 bg-slate-100 dark:bg-slate-800/30 rounded-2xl" />
      <div className="h-24 bg-slate-100 dark:bg-slate-800/30 rounded-2xl" />
    </div>
  </div>
);

// Helper to get month achievement metric
const getMonthStat = (monthYear: string) => {
  if (monthYear.includes("مايو")) return "+4,000 مستخدم";
  if (monthYear.includes("أبريل")) return "1000+ أداة";
  if (monthYear.includes("مارس")) return "+15% أداء";
  if (monthYear.includes("فبراير")) return "99% دقة";
  return "+2K مستخدم"; // fallback
};

// ─── Accordion Timeline Item ───────────────────────────────────────────────────
const TimelineItem: React.FC<{ group: GroupedMonth }> = ({ group }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Extract a quick summary/headline of the main tool/item launched in this month
  const mainItem = group.items.find(item => item.isHero) || group.items[0];
  const summaryText = mainItem ? (mainItem.changes[0] || 'إضافات وتحسينات مميزة لتعزيز أداء المنصة وسرعتها.') : '';

  return (
    <div className="relative pl-0 pr-8 md:pr-12 pb-12 last:pb-4 group">
      {/* Connector Dot */}
      <div className={`absolute right-0 top-1.5 -mr-[9px] w-[18px] h-[18px] rounded-full border-4 border-slate-50 dark:border-[#060811] transition-all duration-500 shadow-sm z-10 flex items-center justify-center
        ${isOpen 
          ? 'bg-indigo-600 border-indigo-100 dark:border-indigo-950 scale-125 shadow-[0_0_15px_#4f46e5]' 
          : 'bg-slate-300 dark:bg-slate-800'
        }`}
      >
        {isOpen && (
          <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
        )}
        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isOpen ? 'bg-white' : 'bg-slate-500 dark:bg-slate-400'}`} />
      </div>

      <div className="flex flex-col gap-3">
        {/* Date Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wide">{group.monthYear}</span>
          <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{group.items.length} {group.items.length > 2 ? 'تحديثات' : 'تحديث'}</span>
        </div>

        {/* Minimal Timeline Card */}
        <div className="bg-white/80 dark:bg-[#0c0d12]/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-indigo-500/20 transition-all duration-300 relative">
          
          {/* Achievement Badge (corner) */}
          <div className="absolute top-4 left-4 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
            {getMonthStat(group.monthYear)}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 text-right flex-1 pl-12 md:pl-20">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {mainItem?.title || `نبض شهر ${group.monthYear}`}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {summaryText}
              </p>
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 self-start md:self-center px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <span>{isOpen ? 'إخفاء التفاصيل' : 'استكشف هذا النبض'}</span>
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Accordion Expansion */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map((item, idx) => {
                      const ts = TYPE_STYLES[item.type] ?? TYPE_STYLES.minor;
                      const cat = item.category ? CATEGORY_MAP[item.category] : null;
                      const href = item.htmlContent ? `/pulse/${item.id}` : item.link;
                      const isFirst = idx === 0;

                      return (
                        <div 
                          key={item.id} 
                          className={`p-5 bg-slate-50/70 dark:bg-white/[0.02] backdrop-blur-md border border-slate-100/80 dark:border-white/5 rounded-2xl flex flex-col justify-between gap-3 transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/30 dark:hover:border-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/5
                            ${isFirst ? 'md:col-span-2 bg-indigo-50/10 dark:bg-indigo-500/5 border-indigo-500/20 dark:border-indigo-500/15' : 'md:col-span-1'}
                          `}
                        >
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${ts.pill}`}>
                                  {ts.label}
                                </span>
                                {cat && (
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
                                    {cat.label}
                                  </span>
                                )}
                              </div>
                              {item.version && (
                                <span className="font-mono text-[10px] font-bold text-slate-400" dir="ltr">{item.version}</span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                                  {getIcon(item.iconType, 'w-3.5 h-3.5')}
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{item.title}</h4>
                              </div>
                              <ul className="space-y-1.5">
                                {item.changes.map((ch, i) => (
                                  <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                    <span>{ch}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {href && (
                            <Link 
                              href={href} 
                              className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start mt-2"
                            >
                              <span>استكشف التحديث</span>
                              <ArrowLeft size={10} className="rtl:rotate-0" />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Collapse Button */}
                  <div className="flex justify-center pt-6 mt-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-50 dark:bg-white/5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 active:scale-95 shadow-sm"
                    >
                      <span>إغلاق النبض</span>
                      <ChevronUp size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const PulsePage: React.FC = () => {
  const [groups, setGroups] = useState<GroupedMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLaunched, setIsLaunched] = useState(false);

  useEffect(() => {
    // June 6, 2026 local time
    const launchDate = new Date('2026-06-06T00:00:00+03:00');
    
    const updateCountdown = () => {
      const difference = launchDate.getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsLaunched(true);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
        setIsLaunched(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const items = await getChangelogItems();
        // Group by month, grouping May and June 2026 together as 'مايو / يونيو ٢٠٢٦'
        const groupedMap: Record<string, ChangelogItem[]> = {};
        items.forEach(item => {
          const d = new Date(item.date);
          if (isNaN(d.getTime())) return;
          
          let monthYear = '';
          const month = d.getMonth(); // 0-indexed: 4 is May, 5 is June
          const year = d.getFullYear();
          
          if (year === 2026 && (month === 4 || month === 5)) {
            monthYear = 'مايو / يونيو ٢٠٢٦';
          } else {
            monthYear = d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
          }
          
          if (!groupedMap[monthYear]) {
            groupedMap[monthYear] = [];
          }
          groupedMap[monthYear].push(item);
        });

        const groupedList: GroupedMonth[] = Object.keys(groupedMap).map(my => {
          // get dates of first item to sort accurately
          const representativeDate = new Date(groupedMap[my][0].date);
          return {
            monthYear: my,
            monthVal: representativeDate.getMonth(),
            yearVal: representativeDate.getFullYear(),
            items: groupedMap[my]
          };
        });

        // Sort: newest first
        groupedList.sort((a, b) => {
          if (a.yearVal !== b.yearVal) return b.yearVal - a.yearVal;
          return b.monthVal - a.monthVal;
        });

        setGroups(groupedList);
      } catch (error) {
        console.error('Error loading pulse updates:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Extract Hero Bento Grid components for current month
  const currentMonthGroup = groups[0];
  const timelineGroups = groups.slice(1);

  // Distribute items for current month (Bento layout)
  let heroUpdate: ChangelogItem | null = null;
  let copilotUpdate: ChangelogItem | null = null;
  let promptsUpdate: ChangelogItem | null = null;
  let communityUpdate: ChangelogItem | null = null;

  const tolzyFlowUpdate: ChangelogItem = {
    id: "tolzy-flow-launch",
    version: "",
    date: "2026-06-06",
    title: "إطلاق منصة TOLZY Flow الثورية 🚀",
    type: "major",
    category: "other",
    isHero: true,
    iconType: "zap",
    changes: [
      "دمج الأداة الثورية المنتظرة التي تسمح بتوليد وصناعة الملفات والتقارير الاحترافية والبحثية المؤتمتة بالكامل (Word, Excel, PowerPoint) بضغطة زر واحدة.",
      "تفعيل نظام التشغيل الآلي للذكاء الاصطناعي لتسهيل سير العمل اليومي للشركات والأفراد."
    ]
  };

  if (currentMonthGroup) {
    if (isLaunched) {
      heroUpdate = tolzyFlowUpdate;
      
      // 2. Copilot / AI category
      copilotUpdate = currentMonthGroup.items.find(item => 
        item.category === 'ai' || 
        item.title.toLowerCase().includes('copilot') || 
        item.title.includes('كوبيلوت') || 
        item.title.includes('AXIOM')
      ) || null;

      // 3. Prompts / Explorations
      promptsUpdate = currentMonthGroup.items.find(item => 
        item.id !== copilotUpdate?.id && 
        (item.category === 'other' || item.title.toLowerCase().includes('prompt') || item.title.includes('مؤشر') || item.isExploreCard)
      ) || null;

      // 4. Community & ecosystem
      communityUpdate = currentMonthGroup.items.find(item => 
        item.id !== copilotUpdate?.id && 
        item.id !== promptsUpdate?.id && 
        (item.category === 'community' || item.category === 'ui')
      ) || null;

      // Fallbacks if slots are empty
      const remaining = currentMonthGroup.items.filter(item => 
        item.id !== copilotUpdate?.id && 
        item.id !== promptsUpdate?.id && 
        item.id !== communityUpdate?.id
      );

      if (!copilotUpdate && remaining.length > 0) copilotUpdate = remaining.shift() || null;
      if (!promptsUpdate && remaining.length > 0) promptsUpdate = remaining.shift() || null;
      if (!communityUpdate && remaining.length > 0) communityUpdate = remaining.shift() || null;
    } else {
      // 1. Hero Spotlight: Marked isHero or major, or default to first
      heroUpdate = currentMonthGroup.items.find(item => item.isHero) || currentMonthGroup.items[0];
      
      // 2. Copilot / AI category
      copilotUpdate = currentMonthGroup.items.find(item => 
        item.id !== heroUpdate?.id && 
        (item.category === 'ai' || item.title.toLowerCase().includes('copilot') || item.title.includes('كوبيلوت') || item.title.includes('AXIOM'))
      ) || null;

      // 3. Prompts / Explorations
      promptsUpdate = currentMonthGroup.items.find(item => 
        item.id !== heroUpdate?.id && 
        item.id !== copilotUpdate?.id && 
        (item.category === 'other' || item.title.toLowerCase().includes('prompt') || item.title.includes('مؤشر') || item.isExploreCard)
      ) || null;

      // 4. Community & ecosystem
      communityUpdate = currentMonthGroup.items.find(item => 
        item.id !== heroUpdate?.id && 
        item.id !== copilotUpdate?.id && 
        item.id !== promptsUpdate?.id && 
        (item.category === 'community' || item.category === 'ui')
      ) || null;

      // Fallbacks if slots are empty
      const remaining = currentMonthGroup.items.filter(item => 
        item.id !== heroUpdate?.id && 
        item.id !== copilotUpdate?.id && 
        item.id !== promptsUpdate?.id && 
        item.id !== communityUpdate?.id
      );

      if (!copilotUpdate && remaining.length > 0) copilotUpdate = remaining.shift() || null;
      if (!promptsUpdate && remaining.length > 0) promptsUpdate = remaining.shift() || null;
      if (!communityUpdate && remaining.length > 0) communityUpdate = remaining.shift() || null;
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#060811] text-slate-900 dark:text-white pb-24 overflow-x-hidden relative" dir="rtl">
          {/* Animated Glow Effects */}
          <motion.div 
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" 
          />
          
          {/* Hero Heading */}
          <section className="pt-20 pb-16 px-4 text-center max-w-4xl mx-auto relative">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <Sparkles size={12} className="animate-pulse" />
              TOLZY Pulse • نبض التحديثات
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.15]">
              نبض التطوير المستمر لـ{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-extrabold relative">
                Tolzy
              </span>
            </h1>
          </section>

          <SkeletonLoader />
        </div>
      </PageLayout>
    );
  }

  if (!currentMonthGroup || !heroUpdate) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#060811] text-slate-900 dark:text-white pb-24 overflow-x-hidden relative" dir="rtl">
          {/* Animated Glow Effects */}
          <motion.div 
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" 
          />
          
          {/* Hero Heading */}
          <section className="pt-20 pb-16 px-4 text-center max-w-4xl mx-auto relative">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <Sparkles size={12} className="animate-pulse" />
              TOLZY Pulse • نبض التحديثات
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.15]">
              نبض التطوير المستمر لـ{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-extrabold relative">
                Tolzy
              </span>
            </h1>
          </section>

          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-inner">
              <Milestone size={28} />
            </div>
            <p className="text-base font-bold text-slate-400 dark:text-slate-500">لا توجد نبضات مضافة حالياً</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#060811] text-slate-900 dark:text-white pb-24 overflow-x-hidden relative" dir="rtl">
        
        {/* Animated Glow Effects */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" 
        />

        {/* ─── Hero Heading ──────────────────────────────────────────────────── */}
        <section className="pt-20 pb-16 px-4 text-center max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-1.5 rounded-full mb-6 shadow-sm"
          >
            <Sparkles size={12} className="animate-pulse" />
            TOLZY Pulse • نبض التحديثات
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.15]"
          >
            نبض التطوير المستمر لـ{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-extrabold relative">
              Tolzy
              <span className="absolute bottom-1 right-0 left-0 h-1.5 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full -z-10" />
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            تابع الإنجازات البرمجية والابتكارات التقنية في منصة تولزي شهراً بشهر. نحن نبني منظومة متكاملة لخدمة أفكارك الإبداعية بأحدث تقنيات الذكاء الاصطناعي.
          </motion.p>
        </section>

        {/* ─── Main Content ──────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* ─── Hero Bento: "نبض الشهر الحالي" ────────────────────────────── */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <span>نبض الشهر الحالي</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  {currentMonthGroup.monthYear}
                </span>
              </h2>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Hero Spotlight Update Card (lg:col-span-2 lg:row-span-2) */}
              <motion.div
                whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.25)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0c0d12]/50 shadow-xl p-8 flex flex-col justify-between group min-h-[460px] text-right hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* Decorative mesh bg */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-bl-[120px] filter blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                {/* Body Content */}
                <div className="relative space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {heroUpdate.version && (
                      <span className="font-mono text-xs font-bold bg-indigo-600 text-white px-3 py-1 rounded-full shadow-md shadow-indigo-600/20" dir="ltr">
                        {heroUpdate.version}
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 px-2.5 py-1 rounded-full">
                      <Clock size={11} />
                      {new Date(heroUpdate.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                      <Sparkles size={11} className="animate-spin-slow" />
                      نجم الشهر
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-3.5xl font-black text-slate-900 dark:text-white leading-tight">
                      {heroUpdate.title}
                    </h3>
                    <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                      {heroUpdate.changes[0] || 'تحديثات هيكلية ضخمة لتعزيز تجربة المستخدم وسرعة التطبيق.'}
                    </p>
                  </div>

                  {heroUpdate.changes.length > 1 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">أهم الميزات المضمنة:</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {heroUpdate.changes.slice(1, 5).map((change, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <Tag size={12} className="text-indigo-500 shrink-0 mt-1" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Engineering Resolved Technical Issues Sub-Panel */}
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-500/10 space-y-2 text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        تم حلّها تقنياً (Resolved Issues)
                      </span>
                      <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-lg">
                        +40% سرعة
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <Shield size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">إصلاح حلقة القراءة اللانهائية (Firebase Infinite Read Loop Fix)</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">تم تحسين استعلامات قاعدة البيانات ومزامنة الخادم لتقليل القراءات غير الضرورية.</p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <Zap size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">تسريع محرك الاسترجاع المعزز بالولادة (RAG Performance Speedups)</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">تحسين الفهرسة الدلالية واستعلامات التشابه لتقديم إجابات فورية فائقة السرعة.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Cover Image or Gradient Graphic Block */}
                <div className="relative mt-8 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-md flex-1 min-h-[160px] bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-pink-500/10 flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                  {heroUpdate.imageUrl ? (
                    <img 
                      src={heroUpdate.imageUrl} 
                      alt={heroUpdate.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                        {getIcon(heroUpdate.iconType, 'w-6 h-6')}
                      </div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">منظومة ذكاء اصطناعي تفاعلية متكاملة</span>
                    </div>
                  )}
                </div>

                {/* Read More Link */}
                {(heroUpdate.htmlContent || heroUpdate.link) && (
                  <div className="flex justify-end pt-6">
                    <Link 
                      href={heroUpdate.htmlContent ? `/pulse/${heroUpdate.id}` : (heroUpdate.link || '')} 
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-6 py-2.5 rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-98 transition-all duration-300"
                    >
                      <span>استكشف هذا النبض</span>
                      <ArrowLeft size={14} className="rtl:rotate-0" />
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* 2. Copilot Card (lg:col-span-1 lg:row-span-1) */}
              <motion.div
                whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.25)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="lg:col-span-1 relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0c0d12]/50 shadow-lg p-6 flex flex-col justify-between group text-right hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                      <Bot size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">تحديث الكوبيلوت</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
                      {copilotUpdate?.title || 'مساعد Tolzy الذكي'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                      {copilotUpdate ? (copilotUpdate.changes[0] || copilotUpdate.title) : 'تم تحسين خوارزميات الاستجابة لدى مساعد الذكاء الاصطناعي لتصبح أكثر دقة وسرعة في حل المشاكل البرمجية والتحليلات.'}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  {copilotUpdate ? (
                    <Link 
                      href={copilotUpdate.htmlContent ? `/pulse/${copilotUpdate.id}` : (copilotUpdate.link || '/copilot')}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 justify-end group/btn"
                    >
                      <span>تعرف على المساعد</span>
                      <ArrowLeft size={12} className="group-hover/btn:-translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <Link 
                      href="/axiom"
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 justify-end group/btn"
                    >
                      <span>تصفح مساعد AXIOM</span>
                      <ArrowLeft size={12} className="group-hover/btn:-translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* 3. Prompts / SDK Card (lg:col-span-1 lg:row-span-1) */}
              <motion.div
                whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(245, 158, 11, 0.25)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="lg:col-span-1 relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0c0d12]/50 shadow-lg p-6 flex flex-col justify-between group text-right hover:border-amber-500/30 dark:hover:border-amber-500/20 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                      <Zap size={20} className="group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">المؤشرات & الأدوات</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                      {promptsUpdate?.title || 'مستودع المؤشرات المتقدمة'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                      {promptsUpdate ? (promptsUpdate.changes[0] || promptsUpdate.title) : 'تحديث دوري لمستودع الـ Prompts الجاهزة والمصنفة لمساعدتك في الحصول على أكواد وتصاميم برمجية متميزة بضغطة زر.'}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  {promptsUpdate ? (
                    <Link 
                      href={promptsUpdate.htmlContent ? `/pulse/${promptsUpdate.id}` : (promptsUpdate.link || '/tools')}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 justify-end group/btn"
                    >
                      <span>تصفح المؤشرات</span>
                      <ArrowLeft size={12} className="group-hover/btn:-translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <Link 
                      href="/tools"
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 justify-end group/btn"
                    >
                      <span>دليل الأدوات</span>
                      <ArrowLeft size={12} className="group-hover/btn:-translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* 4. Community & Creators Card (lg:col-span-3 lg:row-span-1) */}
              <motion.div
                whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(139, 92, 246, 0.25)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="lg:col-span-3 relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0c0d12]/50 shadow-lg p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group text-right hover:border-violet-500/30 dark:hover:border-violet-500/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner shrink-0">
                    <Users size={24} className="group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-500 transition-colors">
                        {communityUpdate?.title || 'المجتمع وصناع المحتوى'}
                      </h3>
                      <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md">المجتمع</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                      {communityUpdate ? (communityUpdate.changes[0] || communityUpdate.title) : 'انضمام المئات من صناع المحتوى البرمجي لتبادل الخبرات وتصميم النماذج البرمجية بشكل تعاوني داخل المنظومة.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {communityUpdate ? (
                    <Link 
                      href={communityUpdate.htmlContent ? `/pulse/${communityUpdate.id}` : (communityUpdate.link || '/community')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs font-bold text-violet-600 dark:text-violet-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <span>تفاصيل التحديث</span>
                      <ArrowLeft size={12} className="rtl:rotate-0" />
                    </Link>
                  ) : (
                    <Link 
                      href="/community"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-xs font-bold text-violet-600 dark:text-violet-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <span>استكشف المجتمع</span>
                      <ArrowLeft size={12} className="rtl:rotate-0" />
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Additional minor updates for current month */}
            {currentMonthGroup.items.filter(item => 
              item.id !== heroUpdate?.id &&
              item.id !== copilotUpdate?.id &&
              item.id !== promptsUpdate?.id &&
              item.id !== communityUpdate?.id
            ).length > 0 && (
              <div className="mt-8 p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0c0d12]/30 text-right space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  ميزات وتحسينات إضافية هذا الشهر (More Updates)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentMonthGroup.items.filter(item => 
                    item.id !== heroUpdate?.id &&
                    item.id !== copilotUpdate?.id &&
                    item.id !== promptsUpdate?.id &&
                    item.id !== communityUpdate?.id
                  ).map(item => (
                    <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 mt-0.5 animate-pulse">
                        {getIcon(item.iconType, 'w-4 h-4')}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
                          {item.version && (
                            <span className="font-mono text-[9px] font-bold text-slate-400" dir="ltr">{item.version}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.changes[0]}
                        </p>
                        {item.changes.length > 1 && (
                          <ul className="space-y-1 mt-1.5">
                            {item.changes.slice(1).map((ch, idx) => (
                              <li key={idx} className="text-[11px] text-slate-400 dark:text-slate-500 flex items-start gap-1">
                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mt-1.5 shrink-0" />
                                <span>{ch}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ─── Timeline Archive: "النبضات السابقة" ────────────────────────── */}
          {timelineGroups.length > 0 && (
            <section className="space-y-12">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-slate-400 to-slate-500" />
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">الأرشيف الزمني (The Timeline Archive)</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">تصفح مسيرة تطور تولزي شهراً بشهر</p>
                </div>
              </div>

              <div className="relative border-r-2 border-slate-200 dark:border-slate-800 pr-1 text-right mr-3">
                {/* Glowing line overlay */}
                <div className="absolute right-[-2px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500 via-violet-500 to-transparent pointer-events-none" />

                <div className="space-y-2">
                  {timelineGroups.map((group, index) => (
                    <TimelineItem key={index} group={group} />
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Floating Countdown Banner */}
        <AnimatePresence>
          {(showCountdown && !isLaunched) && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-xl z-50 bg-[#0c0d12]/90 dark:bg-[#0c0d12]/95 backdrop-blur-xl border border-indigo-500/30 dark:border-indigo-500/25 shadow-[0_20px_50px_rgba(79,70,229,0.3)] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-right text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </span>
                  <span className="text-xs font-black text-indigo-300 tracking-wide uppercase">حدث الإطلاق القادم • Launch Event</span>
                </div>
                <button
                  onClick={() => setShowCountdown(false)}
                  className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm sm:text-base font-black text-slate-100">
                    استعد لإطلاق <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 font-extrabold">TOLZY Flow</span> 🚀
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    الجيل الجديد من منصات التشغيل الآلي للذكاء الاصطناعي في 6 يونيو 2026.
                  </p>
                </div>

                {/* Countdown numbers */}
                <div className="flex gap-2 shrink-0" dir="ltr">
                  <div className="flex flex-col items-center min-w-[50px] bg-white/5 rounded-xl p-2 border border-white/5 shadow-inner">
                    <span className="text-lg font-black text-white font-mono">{timeLeft.days}</span>
                    <span className="text-[8px] font-bold text-indigo-300/80 uppercase">يوم</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[50px] bg-white/5 rounded-xl p-2 border border-white/5 shadow-inner">
                    <span className="text-lg font-black text-white font-mono">{timeLeft.hours}</span>
                    <span className="text-[8px] font-bold text-indigo-300/80 uppercase">ساعة</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[50px] bg-white/5 rounded-xl p-2 border border-white/5 shadow-inner">
                    <span className="text-lg font-black text-white font-mono">{timeLeft.minutes}</span>
                    <span className="text-[8px] font-bold text-indigo-300/80 uppercase">دقيقة</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[50px] bg-white/5 rounded-xl p-2 border border-white/5 shadow-inner">
                    <span className="text-lg font-black text-white font-mono">{timeLeft.seconds}</span>
                    <span className="text-[8px] font-bold text-indigo-300/80 uppercase">ثانية</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageLayout>
  );
};

export default PulsePage;

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Bot, Sparkles, MessageSquare, Code, Search, Zap,
    GraduationCap, Users, BookOpen, Newspaper, ArrowUpRight,
    Layers, TerminalSquare, Wand2, Rocket, Trophy, Hash, Clock, Star
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTools } from '../../hooks/useTools';
import { motion } from 'framer-motion';
import { Tool } from '../../types/tool';
import LogoMarquee from './LogoMarquee';
import dynamic from 'next/dynamic';
const NewsPanelSection = dynamic(() => import('./NewsPanelSection'), { ssr: false });

// --------------- static data ---------------
const QUICK_ACTIONS = [
    {
        id: 'copilot',
        label: 'Tolzy Copilot',
        labelAr: 'المساعد الذكي',
        icon: MessageSquare,
        color: 'from-violet-500 to-indigo-600',
        bg: 'bg-violet-50 dark:bg-violet-500/10',
        text: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-100 dark:border-violet-500/20',
        href: '/copilot',
        desc: 'اسأل، ناقش، احصل على إجابات فورية.'
    },
    {
        id: 'build',
        label: 'TOLZY Build',
        labelAr: 'ابنِ مشروعك',
        icon: Rocket,
        color: 'from-orange-500 to-rose-500',
        bg: 'bg-orange-50 dark:bg-orange-500/10',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-100 dark:border-orange-500/20',
        href: '/build',
        desc: 'حوّل فكرتك إلى خطة بناء كاملة.'
    },
    {
        id: 'prompts',
        label: 'Prompt Builder',
        labelAr: 'صانع الأوامر',
        icon: Wand2,
        color: 'from-pink-500 to-purple-500',
        bg: 'bg-pink-50 dark:bg-pink-500/10',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-100 dark:border-pink-500/20',
        href: 'https://prompts.tolzy.me/generator',
        desc: 'اصنع Prompts احترافية في ثوانٍ.'
    },
    {
        id: 'code',
        label: 'Code Assistant',
        labelAr: 'مساعد الكود',
        icon: TerminalSquare,
        color: 'from-cyan-500 to-blue-600',
        bg: 'bg-cyan-50 dark:bg-cyan-500/10',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-100 dark:border-cyan-500/20',
        href: '/copilot',
        desc: 'اكتب، راجع، وصحح الأكواد بذكاء.'
    },
    {
        id: 'learn',
        label: 'Tolzy Learn',
        labelAr: 'تعلم وتطور',
        icon: GraduationCap,
        color: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-500/20',
        href: '/learn',
        desc: 'كورسات وشروحات عربية مجانية.'
    },
    {
        id: 'community',
        label: 'Community',
        labelAr: 'المجتمع',
        icon: Users,
        color: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-100 dark:border-amber-500/20',
        href: '/community',
        desc: 'شارك أفكارك مع آلاف المحترفين.'
    },
];

const TRENDING = [
    { rank: 1, title: "Prompt احترافي لكتابة SEO باللغة العربية", uses: "2.4k", tag: "كتابة", hot: true },
    { rank: 2, title: "كيف تبني SaaS App خطوة بخطوة بالذكاء الاصطناعي", uses: "1.8k", tag: "بناء", hot: true },
    { rank: 3, title: "نظام Prompts كامل لتوليد صور Midjourney", uses: "1.3k", tag: "صور", hot: true },
    { rank: 4, title: "أفضل أدوات AI للمطورين في 2026", uses: "1.1k", tag: "أدوات", hot: false },
    { rank: 5, title: "شرح Cursor AI وBolt AI بالعربي للمبتدئين", uses: "987", tag: "كود", hot: false },
    { rank: 6, title: "قالب No-Code لبناء متجر إلكتروني في ساعة", uses: "856", tag: "أتمتة", hot: false },
];

const FEED = [
    { avatar: "م", name: "محمود م.", action: "نشر Prompt جديد", subject: "هندسة الأوامر المتقدمة", time: "منذ 8 دقيقة", color: "bg-violet-500" },
    { avatar: "أ", name: "أحمد ع.", action: "بنى مشروع كامل", subject: "Landing Page لمتجره الإلكتروني", time: "منذ 32 دقيقة", color: "bg-blue-500" },
    { avatar: "ن", name: "نورا س.", action: "شاركت 3 موارد", subject: "أدوات التصميم بالذكاء الاصطناعي", time: "منذ ساعة", color: "bg-pink-500" },
    { avatar: "س", name: "سارة خ.", action: "قيّمت كورس", subject: "React من الصفر إلى الاحتراف", time: "منذ ساعتين", color: "bg-emerald-500" },
    { avatar: "ي", name: "يوسف د.", action: "طرح سؤال", subject: "أفضل نموذج لتحليل البيانات", time: "منذ 3 ساعات", color: "bg-cyan-500" },
    { avatar: "ك", name: "كريم ر.", action: "شارك مقالة", subject: "مستقبل الذكاء الاصطناعي في 2026", time: "منذ 4 ساعات", color: "bg-orange-500" },
];

const STATS = [
    { label: "أداة ذكية", value: "0", icon: Layers, color: "text-violet-600 dark:text-violet-400" },
    { label: "عضو نشط", value: "0", icon: Users, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "منشور مجتمعي", value: "0", icon: Sparkles, color: "text-amber-600 dark:text-amber-400" },
];


// --------------- component ---------------
export default function LoggedInHome() {
    const router = useRouter();
    const { user, userProfile } = useAuth();
    const { popularTools } = useTools();
    const [searchVal, setSearchVal] = useState('');
    const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
    const [latestPosts, setLatestPosts] = useState<any[]>([]);
    const [postsTotal, setPostsTotal] = useState(0);
    const [homeLoading, setHomeLoading] = useState(true);
    const isPro = String(userProfile?.plan || '').toLowerCase().includes('pro') || String(userProfile?.plan || '').toLowerCase().includes('ultra');

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "صباح الخير";
        if (hour < 18) return "مساء الخير";
        return "مرحباً";
    };

    const firstName = user?.displayName?.split(' ')[0] || 'هناك';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchVal.trim()) {
            router.push(`/copilot?q=${encodeURIComponent(searchVal.trim())}`);
        }
    };

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [trendingRes, latestRes] = await Promise.all([
                    fetch('/api/community/feed?sort=top&limit=5', { cache: 'no-store' }),
                    fetch('/api/community/feed?sort=latest&limit=5', { cache: 'no-store' }),
                ]);
                if (trendingRes.ok) {
                    const data = await trendingRes.json();
                    setTrendingPosts(data.prompts || []);
                    setPostsTotal(data.total || 0);
                }
                if (latestRes.ok) {
                    const data = await latestRes.json();
                    setLatestPosts(data.prompts || []);
                }
            } catch (err) {
                console.error('[Home] fetch error:', err);
            } finally {
                setHomeLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-[#0A0A0F]" dir="rtl">
            {/* ── Subtle top gradient accent ── */}
            <div className="fixed inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 z-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-16 pb-24 space-y-10 sm:space-y-14">

                {/* ── 1. Header Row ── */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                            {greeting()},
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {firstName} 👋
                        </h1>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-6">
                        {[
                            { label: "أداة ذكية", value: (popularTools?.length || 0).toString(), icon: Layers, color: "text-violet-600 dark:text-violet-400" },
                            { label: "عضو نشط", value: "14.2k+", icon: Users, color: "text-emerald-600 dark:text-emerald-400" },
                            { label: "منشور مجتمعي", value: postsTotal > 0 ? postsTotal.toString() : "0", icon: Sparkles, color: "text-amber-600 dark:text-amber-400" },
                        ].map((s) => (
                            <div key={s.label} className="text-center hidden sm:block">
                                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 2. Search Bar ── */}
                <form onSubmit={handleSearch}>
                    <div className="relative flex items-center bg-white dark:bg-[#13131A] border border-slate-200 dark:border-white/8 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-500/30 transition-all focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-300 dark:focus-within:border-violet-500/40">
                        <div className="px-4 text-slate-400">
                            <Bot className="w-5 h-5 text-violet-500" />
                        </div>
                        <input
                            type="text"
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                            placeholder="اسألني أي شيء للبدء..."
                            className="flex-1 bg-transparent text-slate-900 dark:text-white py-3 sm:py-4 outline-none text-sm sm:text-base placeholder:text-slate-400 font-medium truncate"
                        />
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4">
                            <kbd className="hidden md:flex px-2 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-400">↵</kbd>
                            <button
                                type="submit"
                                className="h-8 sm:h-9 px-3 sm:px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/25 flex items-center gap-1.5"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">ابحث</span>
                            </button>
                        </div>
                    </div>
                </form>

                {/* ── 3. Quick Actions Grid ── */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">الإجراءات السريعة</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {QUICK_ACTIONS.map((action, idx) => {
                            const Icon = action.icon;
                            const isCode = action.id === 'code';
                            const needsPro = (action.id === 'build' || action.id === 'code') && !isPro;
                            
                            return (
                                <motion.div
                                    key={action.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link
                                        href={needsPro ? '/pricing' : action.href}
                                        className={`group flex flex-col gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-[#13131A] rounded-xl border ${action.border} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden h-full ${isCode ? 'opacity-80' : ''}`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center ${action.text} group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        {/* Labels */}
                                        <div>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{action.labelAr}</span>
                                                {needsPro && (
                                                    <span className="text-[9px] font-black bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">PRO</span>
                                                )}
                                                {isCode && (
                                                    <span className="text-[9px] font-black bg-gradient-to-r from-violet-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">قريباً</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{action.desc}</p>
                                        </div>
                                        {/* Arrow */}
                                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 dark:group-hover:text-slate-400 absolute top-3 left-3 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* ── 4. Popular Tools (Aggregated) ── */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-indigo-500" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">أشهر الأدوات المجمعة</h2>
                        </div>
                        <Link href="/tools?tab=popular" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                            عرض الكل
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(popularTools || []).slice(0, 8).map((tool: Tool, idx: number) => (
                            <motion.div
                                key={tool.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                            >
                                <Link
                                    href={`/tools/${tool.id}`}
                                    className="group flex flex-col gap-3 p-4 bg-white dark:bg-[#13131A] rounded-xl border border-slate-200 dark:border-white/8 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden h-full"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm font-bold shrink-0">
                                            {tool.name.charAt(0)}
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {tool.pricing === 'Free' ? 'مجاني' : tool.pricing === 'Freemium' ? 'مجاني/مدفوع' : tool.pricing}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tool.name}</h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tool.description}</p>
                                    </div>
                                    <div className="mt-auto flex items-center gap-2 text-[11px] text-slate-400">
                                        <Star className="w-3 h-3 text-amber-400" />
                                        <span>{tool.rating || 4.5}</span>
                                        <span>·</span>
                                        <span>{(tool.reviewCount || 0) > 0 ? tool.reviewCount + ' تقييم' : 'جديد'}</span>
                                    </div>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 absolute top-3 left-3 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── 5. Suggested Courses ── */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">كورسات مقترحة لك</h2>
                        </div>
                        <Link href="/learn" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                            استكشف الكورسات
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { title: "Prompt Engineering من الصفر", provider: "Tolzy Learn", level: "مبتدئ", duration: "4 ساعات", color: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-100 dark:border-violet-500/20" },
                            { title: "بناء منتجات AI بـ No-Code", provider: "Tolzy Learn", level: "متوسط", duration: "6 ساعات", color: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-100 dark:border-orange-500/20" },
                            { title: "React.js + Next.js 2026", provider: "Tolzy Learn", level: "متوسط", duration: "12 ساعة", color: "bg-cyan-50 dark:bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-100 dark:border-cyan-500/20" },
                        ].map((course, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                            >
                                <Link
                                    href="/learn"
                                    className={`group flex flex-col gap-3 p-4 bg-white dark:bg-[#13131A] rounded-xl border ${course.border} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full`}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${course.color} flex items-center justify-center ${course.text}`}>
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{course.title}</h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{course.provider} · {course.level}</p>
                                    </div>
                                    <div className="mt-auto flex items-center gap-1.5 text-[11px] text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{course.duration}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── 6. Integrated Tools from Global Companies ── */}
                <LogoMarquee />

                {/* ── 7. News Panel ── */}
                <div className="w-full lg:max-w-3xl">
                    <NewsPanelSection />
                </div>

                {/* ── 8. Bottom Two-Column ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Trending */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#13131A] rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">الأكثر رواجاً</h2>
                            </div>
                            <Link href="/community" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                                عرض الكل
                            </Link>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-slate-50 dark:divide-white/5">
                            {homeLoading ? (
                                <div className="px-5 py-8 text-center text-sm text-slate-400">جاري التحميل...</div>
                            ) : trendingPosts.length === 0 ? (
                                <div className="px-5 py-8 text-center text-sm text-slate-400">لا توجد منشورات حالياً</div>
                            ) : (
                                trendingPosts.map((item: any, idx: number) => (
                                    <Link
                                        href={`/community`}
                                        key={item.id || idx}
                                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors group"
                                    >
                                        <div className={`w-6 text-center text-sm font-black ${idx < 3 ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}>
                                            {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{item.title}</span>
                                                {(item.upvotes_count || 0) > 10 && <span className="text-[9px] font-black bg-red-50 text-red-500 dark:bg-red-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">🔥 HOT</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Hash className="w-3 h-3 text-slate-400" />
                                                <span className="text-[11px] text-slate-500">{item.post_type === 'prompt' ? 'برومبت' : item.post_type === 'code' ? 'كود' : item.post_type === 'article' ? 'مقال' : item.post_type === 'question' ? 'سؤال' : item.post_type === 'idea' ? 'فكرة' : 'مصدر'}</span>
                                                <span className="text-[11px] text-slate-400">·</span>
                                                <Zap className="w-3 h-3 text-slate-400" />
                                                <span className="text-[11px] text-slate-500">{(item.upvotes_count || 0) + (item.saves_count || 0)} تفاعل</span>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors flex-shrink-0" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Activity Feed */}
                    <div className="bg-white dark:bg-[#13131A] rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">نشاط المجتمع</h2>
                            </div>
                        </div>

                        {/* Feed */}
                        <div className="divide-y divide-slate-50 dark:divide-white/5">
                            {homeLoading ? (
                                <div className="px-4 py-8 text-center text-sm text-slate-400">جاري التحميل...</div>
                            ) : latestPosts.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-slate-400">لا يوجد نشاط حالياً</div>
                            ) : (
                                latestPosts.map((item: any, idx: number) => {
                                    const avatarLetter = (item.author_name || '?').charAt(0);
                                    const avatarColor = ['bg-violet-500', 'bg-blue-500', 'bg-pink-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-orange-500'][idx % 6];
                                    const timeAgo = item.created_at
                                        ? new Date(item.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
                                        : 'حديثاً';
                                    return (
                                        <div key={item.id || idx} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
                                            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                {avatarLetter}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] text-slate-800 dark:text-slate-200 leading-snug">
                                                    <span className="font-bold">{item.author_name || 'مستخدم'}</span> نشر{' '}
                                                    <span className="text-violet-600 dark:text-violet-400 font-semibold">{item.title}</span>
                                                </p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[11px] text-slate-400">{timeAgo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* CTA */}
                        <div className="px-4 py-3 border-t border-slate-100 dark:border-white/5">
                            <Link
                                href="/community"
                                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 text-sm font-bold transition-all"
                            >
                                <Users className="w-4 h-4" />
                                اكتشف المجتمع
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── 5. Secondary Links Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "دليل الأدوات", icon: Layers, href: "/tools", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                        { label: "الأخبار", icon: Newspaper, href: "/news", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-500/10" },
                        { label: "التعلم", icon: BookOpen, href: "/learn", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                        { label: "المجتمع", icon: Users, href: "/community", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
                    ].map((link, idx) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={idx}
                                href={link.href}
                                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-[#13131A] border border-slate-200 dark:border-white/8 rounded-xl hover:shadow-sm hover:border-slate-300 dark:hover:border-white/15 transition-all group"
                            >
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg ${link.bg} flex items-center justify-center ${link.color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{link.label}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 mr-auto group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors hidden sm:block" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Bot, Sparkles, MessageSquare, Search, Zap,
    GraduationCap, Users, BookOpen, Newspaper, ArrowUpRight,
    Layers, TerminalSquare, Wand2, Rocket, Trophy, Hash, Clock, Star,
    ChevronRight, Award, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTools } from '../../hooks/useTools';
import { useTheme } from '../../context/ThemeContext';
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
        href: '/copilot',
        desc: 'اسأل، ناقش، واحصل على حلول وأكواد فورية.'
    },
    {
        id: 'build',
        label: 'TOLZY Build',
        labelAr: 'ابنِ مشروعك',
        icon: Rocket,
        color: 'from-orange-500 to-rose-500',
        href: '/build',
        desc: 'حوّل فكرتك البرمجية إلى خطة بناء ذكية متكاملة.'
    },
    {
        id: 'prompts',
        label: 'Prompt Builder',
        labelAr: 'صانع الأوامر',
        icon: Wand2,
        color: 'from-pink-500 to-purple-500',
        href: 'https://prompts.tolzy.me/generator',
        desc: 'اصنع أوامر برمجية احترافية ومخصصة في ثوانٍ.'
    },
    {
        id: 'code',
        label: 'Code Assistant',
        labelAr: 'مساعد الكود',
        icon: TerminalSquare,
        color: 'from-cyan-500 to-blue-600',
        href: '/copilot',
        desc: 'اكتب، راجع، وصحح الأخطاء البرمجية بذكاء.'
    },
    {
        id: 'learn',
        label: 'Tolzy Learn',
        labelAr: 'تعلم وتطور',
        icon: GraduationCap,
        color: 'from-emerald-500 to-teal-600',
        href: '/learn',
        desc: 'كورسات وشروحات تقنية عربية مجانية بالكامل.'
    },
    {
        id: 'community',
        label: 'Community',
        labelAr: 'المجتمع',
        icon: Users,
        color: 'from-amber-500 to-orange-500',
        href: '/community',
        desc: 'شارك أفكارك وتفاعل مع آلاف المطورين والمحترفين.'
    },
];

// Theme helpers
function getActionTheme(id: string, isDark: boolean) {
    const map: Record<string, { bg: string; text: string; ring: string }> = {
        copilot: {
            bg: isDark ? 'bg-violet-500/10' : 'bg-violet-50',
            text: isDark ? 'text-violet-400' : 'text-violet-600',
            ring: isDark ? 'border-violet-500/20' : 'border-violet-200',
        },
        build: {
            bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
            text: isDark ? 'text-orange-400' : 'text-orange-600',
            ring: isDark ? 'border-orange-500/20' : 'border-orange-200',
        },
        prompts: {
            bg: isDark ? 'bg-pink-500/10' : 'bg-pink-50',
            text: isDark ? 'text-pink-400' : 'text-pink-600',
            ring: isDark ? 'border-pink-500/20' : 'border-pink-200',
        },
        code: {
            bg: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50',
            text: isDark ? 'text-cyan-400' : 'text-cyan-600',
            ring: isDark ? 'border-cyan-500/20' : 'border-cyan-200',
        },
        learn: {
            bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
            text: isDark ? 'text-emerald-400' : 'text-emerald-600',
            ring: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
        },
        community: {
            bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
            text: isDark ? 'text-amber-400' : 'text-amber-600',
            ring: isDark ? 'border-amber-500/20' : 'border-amber-200',
        },
    };
    return map[id] ?? { bg: 'bg-indigo-500/10', text: 'text-indigo-400', ring: 'border-indigo-500/20' };
}

// --------------- component ---------------
export default function LoggedInHome() {
    const router = useRouter();
    const { user, userProfile } = useAuth();
    const { popularTools } = useTools();
    const { isDarkMode } = useTheme();
    const [searchVal, setSearchVal] = useState('');
    const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
    const [latestPosts, setLatestPosts] = useState<any[]>([]);
    const [postsTotal, setPostsTotal] = useState(0);
    const [homeLoading, setHomeLoading] = useState(true);

    const isPro = String(userProfile?.plan || '').toLowerCase().includes('pro') ||
        String(userProfile?.plan || '').toLowerCase().includes('ultra') ||
        String(userProfile?.plan || '').toLowerCase().includes('premium');

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 18) return 'مساء الخير';
        return 'مرحباً بك';
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

    // ── Color system ──────────────────────────────────────────────────────────
    // Dark: Deep Void Blue base (#070A13) + frosted glass cards (#0e1322/40)
    // with ultra-thin borders (white/[0.06]) + neon glow on hover
    const bg      = isDarkMode ? 'bg-[#070A13] text-slate-50'   : 'bg-[#F8FAFC] text-slate-800';
    const card    = isDarkMode
        ? 'bg-[#0e1322]/40 backdrop-blur-xl border border-white/[0.06] shadow-2xl shadow-black/40'
        : 'bg-white border border-slate-200/70 shadow-sm';
    const cardHover = isDarkMode
        ? 'hover:border-white/[0.12] hover:bg-[#0e1322]/60 hover:shadow-indigo-500/5'
        : 'hover:border-indigo-400/40 hover:shadow-md';
    const divider = isDarkMode ? 'divide-white/[0.05]' : 'divide-slate-100';
    const muted   = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const heading = isDarkMode ? 'text-white'     : 'text-slate-900';
    const subtext = isDarkMode ? 'text-slate-500' : 'text-slate-400';
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div
            className={`w-full min-h-screen relative overflow-hidden font-sans pb-24 transition-colors duration-500 ${bg}`}
            dir="rtl"
        >
            {/* ── Scoped keyframes ── */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float-orb-1 {
                    0%,100%{transform:translate(0,0) scale(1)}
                    33%{transform:translate(30px,-50px) scale(1.08)}
                    66%{transform:translate(-20px,20px) scale(.96)}
                }
                @keyframes float-orb-2 {
                    0%,100%{transform:translate(0,0) scale(1.04)}
                    50%{transform:translate(-30px,35px) scale(.92)}
                }
                /* Deep Void Blue blueprint grid */
                .grid-bg-dark {
                    background-size: 32px 32px;
                    background-image:
                        linear-gradient(to right, rgba(99,102,241,0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(99,102,241,0.04) 1px, transparent 1px);
                }
                .grid-bg-light{background-size:32px 32px;background-image:linear-gradient(to right,rgba(99,102,241,.02) 1px,transparent 1px),linear-gradient(to bottom,rgba(99,102,241,.02) 1px,transparent 1px)}
                .radial-fade{mask-image:radial-gradient(ellipse 90% 70% at 50% 0%,black 40%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 90% 70% at 50% 0%,black 40%,transparent 100%)}
                /* Neon card glow on hover */
                .card-glow-violet:hover  { box-shadow: 0 0 32px rgba(139,92,246,0.12), inset 0 0 0 1px rgba(139,92,246,0.15); }
                .card-glow-orange:hover  { box-shadow: 0 0 32px rgba(249,115,22,0.12), inset 0 0 0 1px rgba(249,115,22,0.15); }
                .card-glow-pink:hover    { box-shadow: 0 0 32px rgba(236,72,153,0.12), inset 0 0 0 1px rgba(236,72,153,0.15); }
                .card-glow-cyan:hover    { box-shadow: 0 0 32px rgba(6,182,212,0.12),  inset 0 0 0 1px rgba(6,182,212,0.15); }
                .card-glow-emerald:hover { box-shadow: 0 0 32px rgba(16,185,129,0.12), inset 0 0 0 1px rgba(16,185,129,0.15); }
                .card-glow-amber:hover   { box-shadow: 0 0 32px rgba(245,158,11,0.12), inset 0 0 0 1px rgba(245,158,11,0.15); }
                .card-glow-indigo:hover  { box-shadow: 0 0 32px rgba(99,102,241,0.14), inset 0 0 0 1px rgba(99,102,241,0.18); }
            `}} />

            {/* ── Top accent line ── */}
            <div className="fixed inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 z-50 shadow-[0_1px_16px_rgba(99,102,241,.5)]" />

            {/* ── Ambient background: Deep Void Blue orbs ── */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 radial-fade ${isDarkMode ? 'grid-bg-dark' : 'grid-bg-light'}`} />
                {/* Indigo orb — top right */}
                <div
                    className={`absolute top-[-12%] right-[-10%] w-[55%] h-[60%] rounded-full blur-[140px] ${isDarkMode ? 'bg-indigo-600/[0.08]' : 'bg-indigo-500/5'}`}
                    style={{ animation: 'float-orb-1 22s ease-in-out infinite' }}
                />
                {/* Purple orb — bottom left */}
                <div
                    className={`absolute bottom-[-12%] left-[-10%] w-[55%] h-[60%] rounded-full blur-[160px] ${isDarkMode ? 'bg-violet-600/[0.07]' : 'bg-purple-500/4'}`}
                    style={{ animation: 'float-orb-2 28s ease-in-out infinite' }}
                />
                {/* Cyan accent — center */}
                {isDarkMode && (
                    <div className="absolute top-[40%] left-[40%] w-[30%] h-[25%] rounded-full blur-[120px] bg-cyan-600/[0.04]" />
                )}
            </div>

            {/* ══════════════════════════════════════════
                MAIN CONTENT
            ══════════════════════════════════════════ */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 space-y-10 relative z-10">

                {/* ── 1. Welcome Banner ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    className={`rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden ${card}`}
                >
                    {/* Gradient glow behind card */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-1/3 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-purple-500/4 rounded-full blur-3xl" />
                    </div>

                    {/* Avatar + greeting */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-indigo-500/20">
                                <div className={`w-full h-full rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black ${isDarkMode ? 'bg-[#070A13]' : 'bg-slate-800'}`}>
                                    {firstName.charAt(0)}
                                </div>
                            </div>
                            {/* Online dot */}
                            <span className={`absolute -bottom-1 -left-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 flex items-center justify-center ${isDarkMode ? 'border-[#070A13]' : 'border-white'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            </span>
                        </div>

                        <div className="text-right">
                            <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${subtext}`}>
                                {greeting()}،
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${heading}`}>
                                    {firstName} 👋
                                </h1>
                                {isPro ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black text-amber-300 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                                        <Award size={10} className="text-amber-400" />
                                        PRO 👑
                                    </span>
                                ) : (
                                    <Link
                                        href="/pricing"
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${isDarkMode ? 'text-slate-400 bg-white/5 border-white/10 hover:border-indigo-500/30 hover:text-indigo-400' : 'text-slate-500 bg-slate-100 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                                    >
                                        الخطة المجانية
                                        <ChevronRight size={9} />
                                    </Link>
                                )}
                            </div>
                            <p className={`text-[11px] mt-1.5 leading-relaxed font-medium max-w-sm ${muted}`}>
                                أهلاً بك مجدداً في Tolzy! استكشف أدوات الذكاء الاصطناعي، تعلّم، أو ابنِ مشروعك التالي.
                            </p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className={`grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-4 relative z-10 shrink-0 self-end sm:self-auto pt-4 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        {[
                            { label: 'أداة ذكية', value: (popularTools?.length || 0).toString(), icon: Layers, color: isDarkMode ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                            { label: 'عضو نشط', value: '14.2k+', icon: Users, color: isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                            { label: 'منشور', value: postsTotal > 0 ? postsTotal.toString() : '24', icon: Sparkles, color: isDarkMode ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-600 bg-amber-50 border-amber-100' },
                        ].map(s => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className={`flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-xl border transition-all ${card}`}>
                                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${s.color}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-black ${heading}`}>{s.value}</div>
                                        <div className={`text-[9px] font-bold ${subtext}`}>{s.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── 2. Smart Search Bar ── */}
                <motion.form
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    onSubmit={handleSearch}
                    className="space-y-2.5"
                >
                    <div className={`relative flex items-center rounded-2xl transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400/50 ${card} ${isDarkMode ? 'hover:border-indigo-500/25' : 'hover:border-indigo-400/40'}`}>
                        <div className="px-4">
                            <Bot className={`w-5 h-5 animate-pulse ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <input
                            type="text"
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                            placeholder="ماذا تريد أن تبني أو تتعلم اليوم؟ اسأل Copilot أي شيء..."
                            className={`flex-1 bg-transparent py-4 outline-none text-sm font-medium text-right truncate ${isDarkMode ? 'text-slate-100 placeholder:text-slate-600' : 'text-slate-800 placeholder:text-slate-400'}`}
                        />
                        <div className="flex items-center gap-2 px-3">
                            <kbd className={`hidden sm:flex px-2 py-1 rounded-lg text-[10px] font-mono border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>↵</kbd>
                            <button
                                type="submit"
                                className="h-9 px-4 bg-gradient-to-tr from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center gap-1.5"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span>بحث ذكي</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap items-center gap-2 px-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${subtext}`}>اقتراحات:</span>
                        {[
                            { text: '✨ مساعد الكود', val: 'كيف أكتب كوداً نظيفاً؟' },
                            { text: '📚 كورس Next.js', val: 'أريد تعلم Next.js من الصفر' },
                            { text: '🤖 أدوات مجانية', val: 'أفضل أدوات الذكاء الاصطناعي المجانية' },
                            { text: '🚀 برومبت احترافي', val: 'كيف أكتب برومبت احترافي؟' },
                        ].map((chip, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSearchVal(chip.val)}
                                className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-all active:scale-95 ${
                                    isDarkMode
                                        ? 'bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/[0.06]'
                                        : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30'
                                }`}
                            >
                                {chip.text}
                            </button>
                        ))}
                    </div>
                </motion.form>

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-indigo-500 animate-pulse`} />
                        <h2 className={`text-sm sm:text-base font-black ${heading}`}>الإجراءات السريعة</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {QUICK_ACTIONS.map((action, idx) => {
                            const Icon = action.icon;
                            const needsPro = (action.id === 'build' || action.id === 'code') && !isPro;
                            const theme = getActionTheme(action.id, isDarkMode);
                            // Map each action to its neon glow class (dark mode only)
                            const glowClass = isDarkMode ? {
                                copilot:   'card-glow-violet',
                                build:     'card-glow-orange',
                                prompts:   'card-glow-pink',
                                code:      'card-glow-cyan',
                                learn:     'card-glow-emerald',
                                community: 'card-glow-amber',
                            }[action.id] ?? '' : '';

                            return (
                                <motion.div
                                    key={action.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 + 0.1 }}
                                >
                                    <Link
                                        href={needsPro ? '/pricing' : action.href}
                                        className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full ${card} ${cardHover} ${glowClass}`}
                                    >
                                        {/* Per-card neon backdrop glow (dark only) */}
                                        {isDarkMode && (
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl bg-gradient-to-br ${action.color}/10 to-transparent blur-xl`} />
                                        )}

                                        {/* Icon */}
                                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all group-hover:scale-110 ${theme.bg} ${theme.text} ${theme.ring}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Label */}
                                        <div className="space-y-0.5">
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                                <span className={`text-xs font-black ${heading} group-hover:text-indigo-400 transition-colors`}>{action.labelAr}</span>
                                                {needsPro && (
                                                    <span className="text-[8px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full">PRO</span>
                                                )}
                                                {action.id === 'code' && (
                                                    <span className="text-[8px] font-black bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-1.5 py-0.5 rounded-full">جديد</span>
                                                )}
                                            </div>
                                            <p className={`text-[10px] leading-relaxed line-clamp-2 ${muted}`}>{action.desc}</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* ── 4. Popular Tools ── */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                                <Zap className="w-3.5 h-3.5" />
                            </div>
                            <h2 className={`text-sm sm:text-base font-black ${heading}`}>أشهر الأدوات الذكية</h2>
                        </div>
                        <Link href="/tools?tab=popular" className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                            عرض الكل
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
                        {(popularTools || []).slice(0, 8).map((tool: Tool, idx: number) => (
                            <motion.div
                                key={tool.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 + 0.15 }}
                            >
                                <Link
                                    href={`/tools/${tool.id}`}
                                    className={`group flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full ${card} ${cardHover} ${isDarkMode ? 'card-glow-indigo' : ''}`}
                                >
                                    {/* Neon backdrop glow on hover (dark only) */}
                                    {isDarkMode && (
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent blur-xl" />
                                    )}
                                    <div className="flex items-start justify-between relative z-10">
                                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-black shrink-0 group-hover:scale-105 transition-all ${isDarkMode ? 'bg-[#070A13] border-white/[0.08] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                            {tool.name.charAt(0)}
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${isDarkMode ? 'bg-white/[0.04] border-white/[0.07] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            {tool.pricing === 'Free' ? 'مجاني' : tool.pricing === 'Freemium' ? 'مجاني/مدفوع' : tool.pricing}
                                        </span>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className={`text-xs font-bold line-clamp-1 group-hover:text-indigo-400 transition-colors ${heading}`}>{tool.name}</h3>
                                        <p className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${muted}`}>{tool.description}</p>
                                    </div>
                                    <div className={`mt-auto flex items-center gap-1 text-[10px] relative z-10 ${muted}`}>
                                        <Star className="w-3 h-3 text-amber-400" />
                                        <span className="font-bold">{tool.rating || 4.5}</span>
                                        <span>·</span>
                                        <span>{(tool.reviewCount || 0) > 0 ? tool.reviewCount + ' تقييم' : 'جديد'}</span>
                                    </div>
                                    <ArrowUpRight className={`w-3.5 h-3.5 absolute top-3.5 left-3.5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 z-10 ${isDarkMode ? 'text-slate-600 group-hover:text-indigo-400' : 'text-slate-300 group-hover:text-indigo-600'}`} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── 5. Suggested Courses ── */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                <GraduationCap className="w-3.5 h-3.5" />
                            </div>
                            <h2 className={`text-sm sm:text-base font-black ${heading}`}>كورسات مقترحة لك</h2>
                        </div>
                        <Link href="/learn" className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                            استكشف المزيد
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[
                            { title: 'Prompt Engineering من الصفر', level: 'مبتدئ', duration: '4 ساعات', glowFrom: 'from-violet-500/10', iconCls: isDarkMode ? 'text-violet-400 bg-violet-500/10 border-violet-500/20' : 'text-violet-600 bg-violet-50 border-violet-100' },
                            { title: 'بناء منتجات AI بـ No-Code', level: 'متوسط', duration: '6 ساعات', glowFrom: 'from-orange-500/10', iconCls: isDarkMode ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-orange-600 bg-orange-50 border-orange-100' },
                            { title: 'React.js + Next.js 16 للإنتاج', level: 'متقدم', duration: '12 ساعة', glowFrom: 'from-cyan-500/10', iconCls: isDarkMode ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-cyan-600 bg-cyan-50 border-cyan-100' },
                        ].map((course, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 + 0.2 }}
                            >
                                <Link
                                    href="/learn"
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 h-full relative overflow-hidden ${card} ${cardHover}`}
                                >
                                    {/* Neon glow per course color (dark only) */}
                                    {isDarkMode && (
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl bg-gradient-to-br ${course.glowFrom} to-transparent blur-xl`} />
                                    )}
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 relative z-10 ${course.iconCls}`}>
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-right relative z-10">
                                        <h3 className={`text-xs font-bold truncate group-hover:text-indigo-400 transition-colors ${heading}`}>{course.title}</h3>
                                        <div className={`flex items-center gap-2 mt-1 text-[10px] ${muted}`}>
                                            <span>{course.level}</span>
                                            <span>·</span>
                                            <Clock className="w-3 h-3" />
                                            <span>{course.duration}</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight className={`w-3.5 h-3.5 shrink-0 relative z-10 transition-colors ${isDarkMode ? 'text-slate-600 group-hover:text-indigo-400' : 'text-slate-300 group-hover:text-indigo-600'}`} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── 6. Logo Marquee ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    <LogoMarquee />
                </motion.div>

                {/* ── 7. News Section ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`w-full rounded-3xl p-6 relative overflow-hidden ${card}`}
                >
                    <div className="flex items-center gap-2 mb-5">
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                            <Newspaper className="w-3.5 h-3.5" />
                        </div>
                        <h2 className={`text-sm sm:text-base font-black ${heading}`}>آخر المستجدات التقنية في عالم AI</h2>
                    </div>
                    <NewsPanelSection />
                </motion.div>

                {/* ── 8. Community Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Trending Posts */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className={`rounded-3xl p-5 flex flex-col ${card}`}
                    >
                        <div className={`flex items-center justify-between pb-4 border-b mb-1 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                                    <Trophy className="w-3.5 h-3.5" />
                                </div>
                                <h2 className={`text-xs sm:text-sm font-black ${heading}`}>المشاركات الأكثر رواجاً</h2>
                            </div>
                            <Link href="/community" className={`text-xs font-bold ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                                استكشف الكل
                            </Link>
                        </div>

                        <div className={`divide-y flex-1 ${divider}`}>
                            {homeLoading ? (
                                <div className="py-8 text-center text-xs text-slate-500">جاري التحميل...</div>
                            ) : trendingPosts.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500">لا توجد منشورات شائعة حالياً.</div>
                            ) : (
                                trendingPosts.map((item: any, idx: number) => (
                                    <Link
                                        key={item.id || idx}
                                        href="/community"
                                        className={`flex items-center gap-3 py-3 transition-colors group ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <div className="w-6 text-center text-xs font-black shrink-0">
                                            {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold truncate group-hover:text-indigo-500 transition-colors ${heading}`}>{item.title}</span>
                                                {(item.upvotes_count || 0) > 10 && (
                                                    <span className="text-[8px] font-black bg-red-500/20 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">🔥</span>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-2 mt-0.5 text-[10px] ${muted}`}>
                                                <Hash className="w-2.5 h-2.5" />
                                                <span>{item.post_type === 'prompt' ? 'برومبت' : item.post_type === 'code' ? 'كود' : item.post_type === 'article' ? 'مقال' : item.post_type === 'question' ? 'سؤال' : 'منشور'}</span>
                                                <span className="opacity-40">·</span>
                                                <TrendingUp className="w-2.5 h-2.5" />
                                                <span>{(item.upvotes_count || 0) + (item.saves_count || 0)} تفاعل</span>
                                            </div>
                                        </div>
                                        <ArrowUpRight className={`w-3 h-3 shrink-0 transition-colors ${isDarkMode ? 'text-slate-600 group-hover:text-indigo-400' : 'text-slate-300 group-hover:text-indigo-600'}`} />
                                    </Link>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Latest Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`rounded-3xl p-5 flex flex-col ${card}`}
                    >
                        <div className={`flex items-center justify-between pb-4 border-b mb-1 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                    <Users className="w-3.5 h-3.5" />
                                </div>
                                <h2 className={`text-xs sm:text-sm font-black ${heading}`}>آخر نشاطات الأعضاء</h2>
                            </div>
                        </div>

                        <div className={`divide-y flex-1 ${divider}`}>
                            {homeLoading ? (
                                <div className="py-8 text-center text-xs text-slate-500">جاري التحميل...</div>
                            ) : latestPosts.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500">لا توجد نشاطات حالياً.</div>
                            ) : (
                                latestPosts.map((item: any, idx: number) => {
                                    const avatarLetter = (item.author_name || '?').charAt(0);
                                    const avatarColor = ['bg-indigo-500', 'bg-blue-500', 'bg-pink-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-orange-500'][idx % 6];
                                    const timeAgo = item.created_at
                                        ? new Date(item.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
                                        : 'حديثاً';
                                    return (
                                        <div key={item.id || idx} className={`flex items-start gap-3 py-3 transition-colors ${isDarkMode ? 'hover:bg-white/[0.01]' : 'hover:bg-slate-50/30'}`}>
                                            <div className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-[10px] font-black shrink-0 border ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                                                {avatarLetter}
                                            </div>
                                            <div className="flex-1 min-w-0 text-right">
                                                <p className={`text-[11px] leading-snug ${muted}`}>
                                                    <span className={`font-bold ${heading}`}>{item.author_name || 'مستخدم'}</span>
                                                    {' '}نشر{' '}
                                                    <span className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{item.title}</span>
                                                </p>
                                                <div className={`flex items-center gap-1 mt-0.5 text-[10px] ${subtext}`}>
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span>{timeAgo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className={`pt-4 border-t mt-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <Link
                                href="/community"
                                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${isDarkMode ? 'bg-white/5 hover:bg-indigo-500/10 border-white/5 hover:border-indigo-500/20 text-slate-300 hover:text-indigo-400' : 'bg-slate-50 hover:bg-indigo-50 border-slate-100 hover:border-indigo-100 text-slate-600 hover:text-indigo-600'}`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                <span>شارك في مجتمع Tolzy</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* ── 9. Quick Nav Links ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                    {[
                        { label: 'دليل الأدوات الذكية', icon: Layers, href: '/tools', color: isDarkMode ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                        { label: 'أخبار التكنولوجيا', icon: Newspaper, href: '/news', color: isDarkMode ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : 'text-sky-600 bg-sky-50 border-sky-100' },
                        { label: 'التعلم والمسارات', icon: BookOpen, href: '/learn', color: isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                        { label: 'مجتمع Tolzy', icon: Users, href: '/community', color: isDarkMode ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-600 bg-amber-50 border-amber-100' },
                    ].map((link, idx) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={idx}
                                href={link.href}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-md ${card} ${cardHover}`}
                            >
                                <div className={`w-8 h-8 shrink-0 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-all ${link.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className={`font-bold text-xs text-right transition-colors ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>{link.label}</span>
                                <ArrowUpRight className={`w-3 h-3 mr-auto shrink-0 hidden sm:block transition-colors ${isDarkMode ? 'text-slate-700 group-hover:text-indigo-400' : 'text-slate-300 group-hover:text-indigo-600'}`} />
                            </Link>
                        );
                    })}
                </motion.div>

            </div>
        </div>
    );
}

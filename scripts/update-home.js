const fs = require('fs');
const path = require('path');

const content = "use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bot, Sparkles, Zap, GraduationCap, Users, BookOpen,
    ArrowUpRight, TerminalSquare, Wand2, ShieldCheck, Flame,
    Bookmark, TrendingUp, Compass, ChevronLeft, Search, Layers,
    Video, Award, Star
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTools } from "../../hooks/useTools";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { getSubdomainUrl } from "../../utils/domain";

const NewsPanelSection = dynamic(() => import("./NewsPanelSection"), { ssr: false });
const LogoMarquee = dynamic(() => import("./LogoMarquee"), { ssr: false });

export default function LoggedInHome() {
    const router = useRouter();
    const { user, userProfile } = useAuth();
    const { tools, savedToolIds, popularTools } = useTools();
    const { isDarkMode } = useTheme();
    const [searchVal, setSearchVal] = useState("");

    const isPro = String(userProfile?.plan || "").toLowerCase().includes("pro") ||
        String(userProfile?.plan || "").toLowerCase().includes("ultra") ||
        String(userProfile?.plan || "").toLowerCase().includes("premium");

    const rawCount = (userProfile as any)?.aiRequestCount ?? (userProfile as any)?.copilotRequestCount ?? 0;
    const remainingQuota = isPro ? "غير محدود (∞)" : \\ من 5\;

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "صباح الخير والإنتاجية ☀️";
        if (hour >= 12 && hour < 18) return "مساء الخير والإنجاز 🌤️";
        return "مساء الإبداع والتطوير 🌙";
    };

    const firstName = user?.displayName?.split(" ")[0] || "صديقنا المبدع";

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchVal.trim()) {
            router.push(\/copilot?q=\\);
        }
    };

    const bg = isDarkMode ? "bg-[#070A13] text-slate-50" : "bg-[#F8FAFC] text-slate-800";
    const card = isDarkMode
        ? "bg-[#0e1322]/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40"
        : "bg-white border border-slate-200/80 shadow-sm";
    const muted = isDarkMode ? "text-slate-400" : "text-slate-500";
    const heading = isDarkMode ? "text-white" : "text-slate-900";

    return (
        <div className={\w-full min-h-screen relative overflow-hidden font-sans pb-24 transition-colors duration-500 \\} dir="rtl">
            {/* Top Accent Gradient Line */}
            <div className="fixed inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 z-50 shadow-[0_1px_16px_rgba(99,102,241,0.5)]" />

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className={\bsolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] \\} />
                <div className={\bsolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[160px] \\} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 space-y-10 relative z-10">

                {/* ── 1. Welcome Banner & Profile Status ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={\ounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden \\}
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/25">
                                <div className={\w-full h-full rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black \\}>
                                    {firstName.charAt(0)}
                                </div>
                            </div>
                            <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#070A13] flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            </span>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-indigo-400 mb-1">
                                {greeting()}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className={\	ext-2xl sm:text-3xl font-extrabold tracking-tight \\}>
                                    {firstName} 👋
                                </h1>
                                {isPro ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30">
                                        <Award className="w-3.5 h-3.5 text-amber-400" />
                                        <span>عضوية Pro VIP ⭐</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60">
                                        عضوية مجانية
                                    </span>
                                )}
                            </div>
                            <p className={\	ext-xs sm:text-sm mt-1.5 leading-relaxed max-w-xl \\}>
                                حسابك الموحد يمنحك وصولاً فورياً لكافة أدوات الذكاء الاصطناعي، الكورسات المتقدمة، وبناء المشاريع عبر جميع خدمات منظومة Tolzy.
                            </p>
                        </div>
                    </div>

                    {!isPro && (
                        <div className="relative z-10 shrink-0">
                            <Link
                                href="/pricing"
                                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Flame className="w-4 h-4 text-amber-300" />
                                <span>ترقية إلى Pro (طلبات غير محدودة)</span>
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* ── 2. Live Numbers & Stats Bento Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* رصيد الذكاء الاصطناعي */}
                    <div className={\p-5 rounded-2xl transition-all group \ hover:border-indigo-500/40\}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">رصيد الذكاء الاصطناعي اليومي</span>
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl sm:text-3xl font-extrabold text-white">{remainingQuota}</div>
                            <p className="text-xs text-slate-500 mt-1">مشترك وموحد لجميع أدوات المنصة</p>
                        </div>
                    </div>

                    {/* الأدوات المفضلة */}
                    <div className={\p-5 rounded-2xl transition-all group \ hover:border-emerald-500/40\}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">أدواتك المفضلة المحفوظة</span>
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                <Bookmark className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl sm:text-3xl font-extrabold text-white">
                                {savedToolIds?.length || 0} <span className="text-sm font-normal text-slate-400">أداة</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">محفوظة للوصول السريع</p>
                        </div>
                    </div>

                    {/* الكورسات والمحتوى المتاح */}
                    <div className={\p-5 rounded-2xl transition-all group \ hover:border-blue-500/40\}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">المسارات والكورسات التقنية</span>
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl sm:text-3xl font-extrabold text-white">
                                +150 <span className="text-sm font-normal text-slate-400">كورس</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">مسارات معتمدة ومحدثة دورياً</p>
                        </div>
                    </div>

                    {/* مكتبة الأدوات المتاحة */}
                    <div className={\p-5 rounded-2xl transition-all group \ hover:border-amber-500/40\}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">مكتبة أدوات الذكاء الاصطناعي</span>
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                                <Layers className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl sm:text-3xl font-extrabold text-white">
                                +600 <span className="text-sm font-normal text-slate-400">أداة ذكية</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">مفحوصة ومصنفة بدقة لعام 2026</p>
                        </div>
                    </div>
                </div>

                {/* ── 3. Quick AI Launcher & Search Bar ── */}
                <div className={\p-6 rounded-3xl \\}>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-bold text-white">إجراءات سريعة بالذكاء الاصطناعي (Quick AI Actions)</h2>
                    </div>

                    <form onSubmit={handleSearch} className="relative mb-6">
                        <input
                            type="text"
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            placeholder="اسأل Tolzy AI أي شيء، أو ابحث عن أداة ذكية، كورس، أو فكرة مشروع..."
                            className="w-full pl-28 pr-12 py-3.5 rounded-2xl bg-slate-950/60 border border-slate-700/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                        <button
                            type="submit"
                            className="absolute left-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                        >
                            بحث ذكي
                        </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Link 
                            href={getSubdomainUrl("build", "/build")} 
                            className="p-4 rounded-2xl bg-slate-800/40 hover:bg-indigo-600/15 border border-slate-700/50 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <Wand2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">ابنِ فكرة مشروع</div>
                                    <div className="text-xs text-slate-400">خطة الـ Architecture والـ Prompts</div>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        </Link>

                        <Link 
                            href={getSubdomainUrl("omnilearn", "/learn/omnilearn")} 
                            className="p-4 rounded-2xl bg-slate-800/40 hover:bg-pink-600/15 border border-slate-700/50 hover:border-pink-500/40 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                    <Video className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">تلخيص وسؤال فيديو</div>
                                    <div className="text-xs text-slate-400">تحويل الفيديو لكويزات وملخص</div>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
                        </Link>

                        <Link 
                            href={getSubdomainUrl("flow", "/axiom")} 
                            className="p-4 rounded-2xl bg-slate-800/40 hover:bg-purple-600/15 border border-slate-700/50 hover:border-purple-500/40 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <TerminalSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">استشر AXIOM Flow</div>
                                    <div className="text-xs text-slate-400">المستندات والأتمتة الذكية</div>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </Link>

                        <Link 
                            href={getSubdomainUrl("tools", "/tools")} 
                            className="p-4 rounded-2xl bg-slate-800/40 hover:bg-emerald-600/15 border border-slate-700/50 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">استكشف الأدوات</div>
                                    <div className="text-xs text-slate-400">+600 أداة ذكاء اصطناعي</div>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        </Link>
                    </div>
                </div>

                {/* ── 4. Ecosystem Subdomains Showcase ── */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Compass className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-xl font-bold text-white">خدمات منظومة Tolzy بحسابك الموحد</h2>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
                            تسجيل دخول موحد SSO Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* OmniLearn */}
                        <div className={\p-6 rounded-3xl transition-all relative overflow-hidden group \ hover:border-pink-500/40\}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400 group-hover:scale-105 transition-transform">
                                    <Video className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                    omnilearn.tolzy.me
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">TOLZY OmniLearn</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                حول أي فيديو يوتيوب أو مساق تعليمي إلى ملخص فوري، كويزات تفاعلية، بطاقات فلاشية، وسؤال تفريغ الفيديو لحظياً.
                            </p>
                            <Link 
                                href={getSubdomainUrl("omnilearn", "/learn/omnilearn")} 
                                className="inline-flex items-center gap-2 text-sm font-bold text-pink-400 hover:text-pink-300 transition-colors"
                            >
                                <span>دخول الأداة</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Tolzy Tools */}
                        <div className={\p-6 rounded-3xl transition-all relative overflow-hidden group \ hover:border-emerald-500/40\}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    tools.tolzy.me
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">دليل أدوات الذكاء الاصطناعي</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                أضخم محرك بحث عربي لأدوات الـ AI مصنفة ومفحوصة بدقة مع خطط التسعير والبدائل المجانية المباشرة.
                            </p>
                            <Link 
                                href={getSubdomainUrl("tools", "/tools")} 
                                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <span>استعراض الأدوات</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Tolzy Learn */}
                        <div className={\p-6 rounded-3xl transition-all relative overflow-hidden group \ hover:border-blue-500/40\}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    learn.tolzy.me
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">أكاديمية Tolzy التعليمية</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                كورسات ومسارات برمجية احترافية في هندسة الذكاء الاصطناعي، تطوير الويب، والأمن السيبراني وعلم البيانات.
                            </p>
                            <Link 
                                href={getSubdomainUrl("learn", "/learn")} 
                                className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <span>استعراض المسارات</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Tolzy Build */}
                        <div className={\p-6 rounded-3xl transition-all relative overflow-hidden group \ hover:border-indigo-500/40\}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                                    <Wand2 className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    build.tolzy.me
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Build with AI (معمار المشاريع)</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                أدخل فكرة مشروعك واحصل على خطة هندسية كاملة، الـ Tech Stack الأنسب، وخطوات التنفيذ مع برومبتات جاهزة للبرمجة.
                            </p>
                            <Link 
                                href={getSubdomainUrl("build", "/build")} 
                                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                <span>ابدأ تخطيط مشروعك</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* AXIOM Flow */}
                        <div className={\p-6 rounded-3xl transition-all relative overflow-hidden group \ hover:border-amber-500/40\}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                                    <TerminalSquare className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    flow.tolzy.me
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">AXIOM Flow</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                محرك المستندات الذكية والتقارير المتقدمة وأتمتة تصدير ملفات Excel و Word والـ PDFs التفاعلية لشركتك.
                            </p>
                            <Link 
                                href={getSubdomainUrl("flow", "/axiom")} 
                                className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
                            >
                                <span>فتح AXIOM Flow</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Community */}
                        <div className={\p-6 rounded-3xl transition-all relative overflow-hidden group \ hover:border-purple-500/40\}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    community.tolzy.me
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">مجتمع Tolzy</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                شارك أفكارك ومشاريعك واستكشف أفضل برومبتات وتطبيقات الذكاء الاصطناعي مع مجتمع المطورين.
                            </p>
                            <Link 
                                href={getSubdomainUrl("community", "/community")} 
                                className="inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                <span>زيارة المجتمع</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── 5. News & Community Feed Section ── */}
                <NewsPanelSection />

                {/* ── 6. Logo Marquee ── */}
                <div className="pt-6">
                    <LogoMarquee />
                </div>

            </div>
        </div>
    );
}
\;

fs.writeFileSync(path.join("src", "components", "home", "LoggedInHome.tsx"), content, "utf8");
console.log("SUCCESS: LoggedInHome.tsx updated!");

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bot, Sparkles, Zap, GraduationCap, Users, BookOpen,
    ArrowUpRight, TerminalSquare, Wand2, ShieldCheck, Flame,
    Bookmark, TrendingUp, Compass, ChevronLeft, Search, Layers,
    Video, Award, Star, Crown
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
    const { tools, popularTools } = useTools();
    const { isDarkMode } = useTheme();
    const [searchVal, setSearchVal] = useState("");
    const [tokenUsage, setTokenUsage] = useState<any>(null);

    useEffect(() => {
        if (!user?.uid) return;
        fetch(`/api/user/token-usage?userId=${user.uid}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setTokenUsage(data);
            })
            .catch(console.error);
    }, [user?.uid]);

    const rawPlan = tokenUsage?.plan || String(userProfile?.plan || "").toLowerCase();
    const isMax = rawPlan.includes("max") || rawPlan.includes("ultra");
    const isPro = !isMax && (rawPlan.includes("pro") || rawPlan.includes("plus"));
    const isAdmin = rawPlan === "admin" || user?.email === "mahmoud.m.moussa5310@gmail.com";
    const isPaid = isMax || isPro || isAdmin;

    const remainingTokens = tokenUsage?.tokensRemaining !== undefined 
        ? tokenUsage.tokensRemaining 
        : (isMax ? 2_500_000 : isPro ? 500_000 : 10_000);
    const allowanceTokens = tokenUsage?.tokenAllowance !== undefined
        ? tokenUsage.tokenAllowance
        : (isMax ? 2_500_000 : isPro ? 500_000 : 10_000);

    const remainingQuota = isAdmin ? "غير محدود (Admin)" : `${remainingTokens.toLocaleString()} توكن`;
    const savedCount = ((userProfile as any)?.bookmarks?.length || (userProfile as any)?.savedTools?.length || 0);

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
            router.push(`/axiom?q=${encodeURIComponent(searchVal.trim())}`);
        }
    };

    // ── ضبط نظام الألوان المخصص للوضعين (النهاري والليلي) ──
    const bg = isDarkMode ? "bg-[#070A13] text-slate-50" : "bg-[#F8FAFC] text-slate-900";
    const card = isDarkMode
        ? "bg-[#0e1322]/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40"
        : "bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.08)]";
    const headerBanner = isDarkMode
        ? "bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900/40 border-indigo-500/20 shadow-2xl"
        : "bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-white border-indigo-100/90 shadow-[0_8px_30px_rgba(99,102,241,0.06)]";
    const muted = isDarkMode ? "text-slate-400" : "text-slate-600";
    const heading = isDarkMode ? "text-white" : "text-slate-900";
    const subtext = isDarkMode ? "text-slate-500" : "text-slate-500";
    const actionCardBg = isDarkMode
        ? "bg-slate-800/40 hover:bg-indigo-600/15 border-slate-700/50 hover:border-indigo-500/40"
        : "bg-slate-50/80 hover:bg-indigo-50/80 border-slate-200/80 hover:border-indigo-200 hover:shadow-sm";

    return (
        <div className={`w-full min-h-screen relative overflow-hidden font-sans pb-24 transition-colors duration-500 ${bg}`} dir="rtl">
            {/* Top Accent Gradient Line */}
            <div className="fixed inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 z-50 shadow-[0_1px_16px_rgba(99,102,241,0.5)]" />

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] ${isDarkMode ? "bg-indigo-600/[0.08]" : "bg-indigo-500/5"}`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[160px] ${isDarkMode ? "bg-violet-600/[0.07]" : "bg-purple-500/4"}`} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 space-y-10 relative z-10">

                {/* ── 1. Welcome Banner & Profile Status ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border ${headerBanner}`}
                >
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/25">
                                <div className={`w-full h-full rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black ${isDarkMode ? "bg-[#070A13]" : "bg-indigo-600"}`}>
                                    {firstName.charAt(0)}
                                </div>
                            </div>
                            <span className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 ${isDarkMode ? 'border-[#070A13]' : 'border-white'} flex items-center justify-center`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            </span>
                        </div>

                        <div>
                            <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                {greeting()}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${heading}`}>
                                    {firstName} 👋
                                </h1>
                                {isAdmin ? (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'text-purple-300 bg-purple-500/10 border border-purple-500/30' : 'text-purple-800 bg-purple-100 border border-purple-300'}`}>
                                        <Crown className="w-3.5 h-3.5 text-purple-500" />
                                        <span>حساب الإدارة 👑</span>
                                    </span>
                                ) : isMax ? (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'text-purple-300 bg-purple-500/10 border border-purple-500/30' : 'text-purple-800 bg-purple-100 border border-purple-300'}`}>
                                        <Crown className="w-3.5 h-3.5 text-purple-500" />
                                        <span>عضوية MAX Studio 👑</span>
                                    </span>
                                ) : isPro ? (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30' : 'text-amber-800 bg-amber-100 border border-amber-300'}`}>
                                        <Award className="w-3.5 h-3.5 text-amber-500" />
                                        <span>عضوية Pro VIP ⭐</span>
                                    </span>
                                ) : (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'text-slate-400 bg-slate-800/80 border border-slate-700/60' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
                                        عضوية مجانية (10K)
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed max-w-xl ${muted}`}>
                                حسابك الموحد يمنحك وصولاً فورياً لكافة أدوات الذكاء الاصطناعي، الكورسات المتقدمة، وبناء المشاريع عبر جميع خدمات منظومة Tolzy.
                            </p>
                        </div>
                    </div>

                    {!isMax && !isAdmin && (
                        <div className="relative z-10 shrink-0">
                            <Link
                                href="/pricing"
                                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Flame className="w-4 h-4 text-amber-300" />
                                <span>{isPro ? 'ترقية إلى MAX (2.5M توكن)' : 'ترقية الباقة وزيادة التوكن'}</span>
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* ── 2. Live Numbers & Stats Bento Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* رصيد الذكاء الاصطناعي */}
                    <div className={`p-5 rounded-2xl transition-all group ${card} hover:border-indigo-500/40`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>رصيد التوكن الحقيقي</span>
                            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} group-hover:scale-110 transition-transform`}>
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className={`text-xl sm:text-2xl font-extrabold ${heading}`}>{remainingQuota}</div>
                            <p className={`text-xs mt-1 ${subtext}`}>
                                {isAdmin ? 'وصول مفتوح للحساب الإداري' : `من إجمالي ${allowanceTokens.toLocaleString()} توكن`}
                            </p>
                        </div>
                    </div>

                    {/* الأدوات المفضلة */}
                    <div className={`p-5 rounded-2xl transition-all group ${card} hover:border-emerald-500/40`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>أدواتك المفضلة المحفوظة</span>
                            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} group-hover:scale-110 transition-transform`}>
                                <Bookmark className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className={`text-2xl sm:text-3xl font-extrabold ${heading}`}>
                                {savedCount} <span className={`text-sm font-normal ${muted}`}>أداة</span>
                            </div>
                            <p className={`text-xs mt-1 ${subtext}`}>محفوظة للوصول السريع</p>
                        </div>
                    </div>

                    {/* الكورسات والمحتوى المتاح */}
                    <div className={`p-5 rounded-2xl transition-all group ${card} hover:border-blue-500/40`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>المسارات والكورسات التقنية</span>
                            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'} group-hover:scale-110 transition-transform`}>
                                <GraduationCap className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className={`text-2xl sm:text-3xl font-extrabold ${heading}`}>
                                +150 <span className={`text-sm font-normal ${muted}`}>كورس</span>
                            </div>
                            <p className={`text-xs mt-1 ${subtext}`}>مسارات معتمدة ومحدثة دورياً</p>
                        </div>
                    </div>

                    {/* مكتبة الأدوات المتاحة */}
                    <div className={`p-5 rounded-2xl transition-all group ${card} hover:border-amber-500/40`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>مكتبة أدوات الذكاء الاصطناعي</span>
                            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'} group-hover:scale-110 transition-transform`}>
                                <Layers className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className={`text-2xl sm:text-3xl font-extrabold ${heading}`}>
                                +600 <span className={`text-sm font-normal ${muted}`}>أداة ذكية</span>
                            </div>
                            <p className={`text-xs mt-1 ${subtext}`}>مفحوصة ومصنفة بدقة لعام 2026</p>
                        </div>
                    </div>
                </div>

                {/* ── 3. Quick AI Launcher & Search Bar ── */}
                <div className={`p-6 rounded-3xl ${card}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        <h2 className={`text-lg font-bold ${heading}`}>إجراءات سريعة بالذكاء الاصطناعي (Quick AI Actions)</h2>
                    </div>

                    <form onSubmit={handleSearch} className="relative mb-6">
                        <input
                            type="text"
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            placeholder="اسأل Tolzy AI أي شيء، أو ابحث عن أداة ذكية، كورس، أو فكرة مشروع..."
                            className={`w-full pl-28 pr-12 py-3.5 rounded-2xl border text-sm outline-none transition-all ${
                                isDarkMode
                                    ? "bg-slate-950/60 border-slate-700/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500"
                                    : "bg-slate-50 border-slate-200/90 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 text-slate-900 placeholder-slate-400 shadow-inner"
                            }`}
                        />
                        <Search className={`w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400`} />
                        <button
                            type="submit"
                            className="absolute left-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
                        >
                            بحث ذكي
                        </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Link 
                            href={getSubdomainUrl("build", "/build")} 
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${actionCardBg}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white' : 'bg-indigo-100/70 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'} transition-colors`}>
                                    <Wand2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${heading}`}>ابنِ فكرة مشروع</div>
                                    <div className={`text-xs ${muted}`}>خطة الـ Architecture والـ Prompts</div>
                                </div>
                            </div>
                            <ArrowUpRight className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                        </Link>

                        <Link 
                            href={getSubdomainUrl("omnilearn", "/learn/omnilearn")} 
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${actionCardBg}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white' : 'bg-pink-100/70 text-pink-600 group-hover:bg-pink-600 group-hover:text-white'} transition-colors`}>
                                    <Video className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${heading}`}>تلخيص وسؤال فيديو</div>
                                    <div className={`text-xs ${muted}`}>تحويل الفيديو لكويزات وملخص</div>
                                </div>
                            </div>
                            <ArrowUpRight className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-pink-400' : 'text-slate-400 group-hover:text-pink-600'}`} />
                        </Link>

                        <Link 
                            href={getSubdomainUrl("flow", "/axiom")} 
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${actionCardBg}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white' : 'bg-purple-100/70 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'} transition-colors`}>
                                    <TerminalSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${heading}`}>استشر AXIOM Flow</div>
                                    <div className={`text-xs ${muted}`}>المستندات والأتمتة الذكية</div>
                                </div>
                            </div>
                            <ArrowUpRight className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-purple-400' : 'text-slate-400 group-hover:text-purple-600'}`} />
                        </Link>

                        <Link 
                            href={getSubdomainUrl("tools", "/tools")} 
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${actionCardBg}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-emerald-100/70 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'} transition-colors`}>
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${heading}`}>استكشف الأدوات</div>
                                    <div className={`text-xs ${muted}`}>+600 أداة ذكاء اصطناعي</div>
                                </div>
                            </div>
                            <ArrowUpRight className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                        </Link>
                    </div>
                </div>

                {/* ── 4. Ecosystem Subdomains Showcase ── */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Compass className="w-5 h-5 text-indigo-500" />
                            <h2 className={`text-xl font-bold ${heading}`}>خدمات منظومة Tolzy بحسابك الموحد</h2>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full border ${isDarkMode ? 'text-slate-400 bg-slate-800/60 border-slate-700/50' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
                            تسجيل دخول موحد SSO Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* OmniLearn */}
                        <div className={`p-6 rounded-3xl transition-all relative overflow-hidden group ${card} hover:border-pink-500/40`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'} group-hover:scale-105 transition-transform`}>
                                    <Video className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-pink-50 text-pink-700 border-pink-200'}`}>
                                    omnilearn.tolzy.me
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${heading}`}>TOLZY OmniLearn</h3>
                            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                                حول أي فيديو يوتيوب أو مساق تعليمي إلى ملخص فوري، كويزات تفاعلية، بطاقات فلاشية، وسؤال تفريغ الفيديو لحظياً.
                            </p>
                            <Link 
                                href={getSubdomainUrl("omnilearn", "/learn/omnilearn")} 
                                className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${isDarkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}
                            >
                                <span>دخول الأداة</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Tolzy Tools */}
                        <div className={`p-6 rounded-3xl transition-all relative overflow-hidden group ${card} hover:border-emerald-500/40`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} group-hover:scale-105 transition-transform`}>
                                    <Zap className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                    tools.tolzy.me
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${heading}`}>دليل أدوات الذكاء الاصطناعي</h3>
                            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                                أضخم محرك بحث عربي لأدوات الـ AI مصنفة ومفحوصة بدقة مع خطط التسعير والبدائل المجانية المباشرة.
                            </p>
                            <Link 
                                href={getSubdomainUrl("tools", "/tools")} 
                                className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                            >
                                <span>استعراض الأدوات</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Tolzy Learn */}
                        <div className={`p-6 rounded-3xl transition-all relative overflow-hidden group ${card} hover:border-blue-500/40`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'} group-hover:scale-105 transition-transform`}>
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    learn.tolzy.me
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${heading}`}>أكاديمية Tolzy التعليمية</h3>
                            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                                كورسات ومسارات برمجية احترافية في هندسة الذكاء الاصطناعي، تطوير الويب، والأمن السيبراني وعلم البيانات.
                            </p>
                            <Link 
                                href={getSubdomainUrl("learn", "/learn")} 
                                className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                                <span>استعراض المسارات</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Tolzy Build */}
                        <div className={`p-6 rounded-3xl transition-all relative overflow-hidden group ${card} hover:border-indigo-500/40`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} group-hover:scale-105 transition-transform`}>
                                    <Wand2 className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                    build.tolzy.me
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${heading}`}>Build with AI (معمار المشاريع)</h3>
                            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                                أدخل فكرة مشروعك واحصل على خطة هندسية كاملة، الـ Tech Stack الأنسب، وخطوات التنفيذ مع برومبتات جاهزة للبرمجة.
                            </p>
                            <Link 
                                href={getSubdomainUrl("build", "/build")} 
                                className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                            >
                                <span>ابدأ تخطيط مشروعك</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* AXIOM Flow */}
                        <div className={`p-6 rounded-3xl transition-all relative overflow-hidden group ${card} hover:border-amber-500/40`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'} group-hover:scale-105 transition-transform`}>
                                    <TerminalSquare className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    flow.tolzy.me
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${heading}`}>AXIOM Flow</h3>
                            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                                محرك المستندات الذكية والتقارير المتقدمة وأتمتة تصدير ملفات Excel و Word والـ PDFs التفاعلية لشركتك.
                            </p>
                            <Link 
                                href={getSubdomainUrl("flow", "/axiom")} 
                                className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}
                            >
                                <span>فتح AXIOM Flow</span>
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Community */}
                        <div className={`p-6 rounded-3xl transition-all relative overflow-hidden group ${card} hover:border-purple-500/40`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'} group-hover:scale-105 transition-transform`}>
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDarkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                    community.tolzy.me
                                </span>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${heading}`}>مجتمع Tolzy</h3>
                            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                                شارك أفكارك ومشاريعك واستكشف أفضل برومبتات وتطبيقات الذكاء الاصطناعي مع مجتمع المطورين.
                            </p>
                            <Link 
                                href={getSubdomainUrl("community", "/community")} 
                                className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
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

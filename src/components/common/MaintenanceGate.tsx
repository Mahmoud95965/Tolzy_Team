'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { 
    Cpu, 
    Sparkles, 
    ShieldCheck, 
    Clock, 
    ArrowLeft, 
    Flame, 
    Server, 
    Database, 
    Bot, 
    Zap, 
    CheckCircle2,
    RefreshCw
} from 'lucide-react';

interface MaintenanceGateProps {
    children: React.ReactNode;
}

// 35 Hours in Milliseconds
const THIRTY_FIVE_HOURS_MS = 35 * 60 * 60 * 1000;
const STORAGE_KEY = 'tolzy_maintenance_target_time';

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
    const pathname = usePathname();
    const { user, userProfile, loading, isAdmin } = useAuth();
    
    // Check if current user has VIP Pro / Admin access
    const plan = String(userProfile?.plan || '').toLowerCase();
    const isPro = plan.includes('pro') || plan.includes('ultra') || plan.includes('premium') || isAdmin;

    // Countdown State
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
        hours: 34,
        minutes: 59,
        seconds: 59
    });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Initialize or read target time
        let targetTime = 0;
        const storedTarget = localStorage.getItem(STORAGE_KEY);
        if (storedTarget) {
            targetTime = parseInt(storedTarget, 10);
        } else {
            targetTime = Date.now() + THIRTY_FIVE_HOURS_MS;
            localStorage.setItem(STORAGE_KEY, targetTime.toString());
        }

        const updateTimer = () => {
            const difference = targetTime - Date.now();
            if (difference <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                const totalSeconds = Math.floor(difference / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                setTimeLeft({ hours, minutes, seconds });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    // 1. Bypass Maintenance for Auth & Admin routes
    const isBypassRoute = 
        pathname.startsWith('/auth') || 
        pathname.startsWith('/admin') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml';

    if (isBypassRoute) {
        return <>{children}</>;
    }

    // 2. While checking auth, show minimal neutral pulse
    if (loading) {
        return <div className="min-h-screen bg-[#070A13]" />;
    }

    // 3. Pro / Ultra / Admin members get unrestricted access
    if (user && isPro) {
        return <>{children}</>;
    }

    // 4. Free members and non-logged-in visitors see the 35-Hour Maintenance Page
    return (
        <div className="min-h-screen bg-[#070A13] text-slate-100 relative overflow-hidden flex flex-col justify-between selection:bg-indigo-500 selection:text-white" dir="rtl">
            {/* Top Glowing Ambient Accents */}
            <div className="fixed inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 z-50 shadow-[0_1px_20px_rgba(99,102,241,0.6)]" />
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/5 blur-[180px]" />
            </div>

            {/* Header */}
            <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/25">
                        <div className="w-full h-full rounded-2xl bg-[#070A13] flex items-center justify-center font-black text-white text-lg">
                            T
                        </div>
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">Tolzy</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>تحديث البنية التحتية نشط</span>
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center text-center relative z-10 space-y-10 my-auto">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-inner">
                    <Cpu className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>بناء التحديث الأضخم لمنظومة Tolzy 2026</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4 max-w-3xl">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
                        تحديث شامل للبنية التحتية <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                            نعود بعد 35 ساعة فقط ⚡
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        نعمل حالياً على ترقية وتوسيع الخوادم السحابية، ربط نماذج الذكاء الاصطناعي الفائقة، وضبط قواعد البيانات لتوفير سرعة استجابة فائقة واستقرار لا مثيل له.
                    </p>
                </div>

                {/* Countdown Timer */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-md">
                    {/* Hours */}
                    <div className="p-4 sm:p-6 rounded-3xl bg-[#0e1322]/80 border border-indigo-500/20 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                        <div className="text-3xl sm:text-5xl font-black text-white font-mono">
                            {isMounted ? String(timeLeft.hours).padStart(2, '0') : '35'}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-indigo-400 mt-2">ساعة</div>
                    </div>

                    {/* Minutes */}
                    <div className="p-4 sm:p-6 rounded-3xl bg-[#0e1322]/80 border border-purple-500/20 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                        <div className="text-3xl sm:text-5xl font-black text-white font-mono">
                            {isMounted ? String(timeLeft.minutes).padStart(2, '0') : '00'}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-purple-400 mt-2">دقيقة</div>
                    </div>

                    {/* Seconds */}
                    <div className="p-4 sm:p-6 rounded-3xl bg-[#0e1322]/80 border border-pink-500/20 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                        <div className="text-3xl sm:text-5xl font-black text-white font-mono">
                            {isMounted ? String(timeLeft.seconds).padStart(2, '0') : '00'}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-pink-400 mt-2">ثانية</div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="w-full max-w-lg p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3 text-right">
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">حالة الترقية السحابية</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            جاري التنفيذ 72%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full w-[72%] transition-all duration-1000" />
                    </div>
                    <div className="grid grid-cols-3 text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ترقية الـ RAG</span>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-400">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>خوادم Azure AI</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                            <span>توسيع قواعد البيانات</span>
                        </div>
                    </div>
                </div>

                {/* VIP Pro Access Box */}
                <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 backdrop-blur-xl shadow-2xl space-y-4">
                    <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                        <span>استثناء خاص لمشتركي باقة Pro VIP ⭐</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                        إذا كنت مشتركاً في باقة **Pro** أو **Ultra**، يمكنك تسجيل الدخول في أي وقت والاستمتاع بتجربة كافة أدوات الذكاء الاصطناعي وخدمات المنظومة بلا أي توقف.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="https://tolzy.me/auth"
                            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Flame className="w-4 h-4 text-slate-950" />
                            <span>تسجيل الدخول لمشتركي Pro</span>
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto w-full px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900 gap-4 relative z-10">
                <div>
                    © 2026 جميع الحقوق محفوظة لمنظومة Tolzy
                </div>
                <div className="flex items-center gap-6">
                    <a href="https://twitter.com/tolzytools" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
                        تويتر (X)
                    </a>
                    <Link href="https://tolzy.me/contact" className="hover:text-slate-300 transition-colors">
                        الدعم الفني
                    </Link>
                </div>
            </footer>
        </div>
    );
}

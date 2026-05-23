'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useUserData } from '@/src/hooks/useUserData';
import { toast } from 'react-hot-toast';

export default function ConnectAppPage() {
    const { user, userProfile } = useAuth();
    const { userData } = useUserData();
    const { isDarkMode, toggleDarkMode } = useTheme();

    const [isGmailConnected, setIsGmailConnected] = useState(false);
    const [isConnectingGmail, setIsConnectingGmail] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const connected = localStorage.getItem('tolzy_gmail_connected') === 'true';
            setIsGmailConnected(connected);
        }
    }, []);

    const getUserInitials = () => {
        if (userData?.displayName) return userData.displayName.slice(0, 2).toUpperCase();
        if (user?.email) return user.email.slice(0, 2).toUpperCase();
        return 'U';
    };

    const handleDisconnectGmail = () => {
        if (window.confirm('هل أنت متأكد من إلغاء ربط حساب Gmail؟')) {
            setIsGmailConnected(false);
            localStorage.removeItem('tolzy_gmail_connected');
            toast.success('تم إلغاء ربط تطبيق Gmail بنجاح');
        }
    };

    const handleGoogleAuthAllow = () => {
        setIsAuthLoading(true);
        setTimeout(() => {
            setIsAuthLoading(false);
            setIsGmailConnected(true);
            localStorage.setItem('tolzy_gmail_connected', 'true');
            setIsConnectingGmail(false);
            toast.success('تم ربط حساب Gmail بنجاح! 🚀', {
                style: {
                    borderRadius: '16px',
                    background: '#6366f1',
                    color: '#fff',
                    fontWeight: 'bold',
                },
            });
        }, 2000);
    };

    return (
        <div className="min-h-screen w-full bg-[#FDFDFD] dark:bg-[#050505] text-slate-800 dark:text-slate-100 overflow-x-hidden font-sans selection:bg-[#fea619]/30 relative pb-20 transition-colors duration-300" dir="rtl">
            {/* Ambient Glowing Backgrounds */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fea619]/5 dark:bg-[#fea619]/8 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[10%] left-[-10%] w-[45%] h-[45%] bg-indigo-500/5 dark:bg-indigo-500/8 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-700" />
            </div>

            {/* Header section */}
            <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 flex items-center justify-between border-b border-slate-200/50 dark:border-white/[0.04] bg-white/40 dark:bg-[#050505]/40 backdrop-blur-md rounded-2xl mt-4">
                <div className="flex items-center gap-3">
                    <Link href="/copilot" className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-350 transition-all border border-slate-200/60 dark:border-white/5 active:scale-95 shadow-sm" title="العودة للدردشة">
                        <span className="material-symbols-outlined text-[20px] scale-x-[-1]">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">ربط التطبيقات الذكية</h1>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">مزامنة أدوات تولزي مع خدماتك المفضلة</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Dark mode button */}
                    <button
                        onClick={() => toggleDarkMode()}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-350 transition-all border border-slate-200/60 dark:border-white/5 active:scale-95 flex items-center justify-center"
                        title="تغيير المظهر"
                    >
                        {isDarkMode ? (
                            <span className="material-symbols-outlined text-[18px]">light_mode</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                        )}
                    </button>
                    {/* Brand logo */}
                    <div className="flex items-center gap-2 select-none pr-3 border-r border-slate-200 dark:border-white/10">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3C12 3 12 9 6 12C12 15 12 21 12 21C12 21 12 15 18 12C12 9 12 3 12 3Z" fill="currentColor" />
                            </svg>
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-white font-sans">TOLZY</span>
                    </div>
                </div>
            </header>

            {/* Main content grid */}
            <main className="relative z-10 w-full max-w-4xl mx-auto px-4 mt-8 sm:mt-12">
                <div className="text-center mb-8">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">تكاملات الذكاء الاصطناعي الفائقة 🧩</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                        قم بتأمين الوصول إلى حساباتك للتفاعل الذكي وأتمتة المهام اليومية باستخدام المساعد الذكي TOLZY Copilot.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {/* Google Gmail Integration Card */}
                    <div className="relative overflow-hidden bg-white/70 dark:bg-[#0c0c0e]/80 border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
                        {/* Glow orb */}
                        <div className="absolute top-[-10%] right-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                            {/* Left: Info */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-right flex-1">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner mb-4 relative group">
                                    <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <svg className="w-9 h-9 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="24" height="24" rx="6" fill="#1E1E1E" />
                                        <path d="M4 6H20V18H4V6Z" fill="#121212" />
                                        <path d="M20 6L12 13L4 6" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4 18V6L10 11.5L4 18Z" fill="#FBBC05" />
                                        <path d="M20 18V6L14 11.5L20 18Z" fill="#34A853" />
                                        <path d="M4 18H20V11L12 17L4 11V18Z" fill="#4285F4" />
                                    </svg>
                                </div>

                                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5 mb-1.5">
                                    <span>جوجل Gmail</span>
                                    {isGmailConnected ? (
                                        <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                            نشط ومتصل
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/5">
                                            غير متصل
                                        </span>
                                    )}
                                </h3>

                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 max-w-md leading-relaxed">
                                    تمكين المساعد من قراءة رسائل البريد الإلكتروني وتلخيصها وصياغة مسودات ردود فورية بالنيابة عنك مباشرة من الشات.
                                </p>

                                {/* Features Checklist */}
                                <div className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 text-right">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2.5 block text-right uppercase">مميزات ربط البريد الإلكتروني:</span>
                                    <ul className="space-y-2.5">
                                        <li className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-300 font-semibold justify-start">
                                            <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0">check</span>
                                            <span>تلخيص رسائل البريد الطويلة بنقرة واحدة</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-300 font-semibold justify-start">
                                            <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0">check</span>
                                            <span>صياغة مسودات ردود احترافية فورية</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-300 font-semibold justify-start">
                                            <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0">check</span>
                                            <span>البحث الذكي في صندوق البريد باستخدام الذكاء الاصطناعي</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right: Actions & User context */}
                            <div className="flex flex-col items-center md:items-end justify-center w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-r border-slate-200/80 dark:border-white/5 pt-6 md:pt-0 md:pr-6 gap-5">
                                {isGmailConnected && (
                                    <div className="w-full flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl justify-start w-full">
                                            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-inner overflow-hidden shrink-0">
                                                {user?.photoURL ? (
                                                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="uppercase font-black">{getUserInitials().slice(0, 1)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-right">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userData?.displayName || user?.displayName || 'مستخدم TOLZY'}</p>
                                                <p className="text-[10px] text-slate-500 truncate" dir="ltr">{user?.email || 'user@gmail.com'}</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black rounded-md shrink-0">حساب نشط</span>
                                        </div>
                                    </div>
                                )}

                                <div className="w-full">
                                    {isGmailConnected ? (
                                        <button
                                            onClick={handleDisconnectGmail}
                                            className="w-full py-3.5 px-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 dark:text-red-400 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] shadow-sm text-center cursor-pointer"
                                        >
                                            إلغاء ربط Gmail
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsConnectingGmail(true)}
                                            className="w-full py-3.5 px-6 bg-gradient-to-tr from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all text-center cursor-pointer"
                                        >
                                            ربط حساب Gmail الخاص بك
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 select-none">
                                    <span>🔒</span>
                                    <span>بياناتك وصلاحيات المزامنة مشفرة بالكامل لضمان سرية خصوصيتك.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coming soon additional integrations */}
                    <div className="opacity-50 relative overflow-hidden bg-slate-100/40 dark:bg-[#0c0c0e]/30 border border-dashed border-slate-300 dark:border-white/[0.05] rounded-3xl p-6 sm:p-8 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-right">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-slate-400">github</span>
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">مستودعات GitHub</h4>
                                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">البحث في الكود وأتمتة مستندات المشروع البرمجية</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-white/5 text-slate-500 text-[9px] font-black rounded-md shrink-0">قريباً</span>
                    </div>
                </div>
            </main>

            {/* Google Auth Dialog Modal */}
            <AnimatePresence>
                {isConnectingGmail && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        {/* Backdrop with frosted blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isAuthLoading && setIsConnectingGmail(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        />

                        {/* Dialog Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[160] text-right font-sans"
                            dir="rtl"
                        >
                            <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40">
                                {/* Google colorful G logo */}
                                <svg className="w-12 h-12 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <h2 className="text-base font-black text-slate-900 dark:text-white">تسجيل الدخول باستخدام Google</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 font-medium">للربط والتكامل مع TOLZY Copilot</p>
                            </div>

                            <div className="p-6 bg-white dark:bg-slate-900">
                                {isAuthLoading ? (
                                    <div className="py-8 flex flex-col items-center justify-center text-center">
                                        <span className="material-symbols-outlined text-[32px] animate-spin text-slate-400 mb-3">progress_activity</span>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">جاري الاتصال بمصادقة جوجل...</p>
                                        <p className="text-xs text-slate-500 mt-1">يرجى الانتظار وتثبيت الاتصال المباشر</p>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 text-right">الحساب الحالي للتكامل:</span>
                                        
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl mb-5 text-right justify-start">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-inner relative overflow-hidden border border-emerald-600/20 shrink-0">
                                                {user?.photoURL ? (
                                                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="uppercase font-black text-xs">{getUserInitials().slice(0, 1)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-right">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userData?.displayName || user?.displayName || 'مستخدم TOLZY'}</p>
                                                <p className="text-[10px] text-slate-500 truncate" dir="ltr">{user?.email || 'user@gmail.com'}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={handleGoogleAuthAllow}
                                                className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                                            >
                                                السماح بالربط
                                            </button>
                                            <button
                                                onClick={() => setIsConnectingGmail(false)}
                                                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/5 active:scale-[0.98] cursor-pointer"
                                            >
                                                إلغاء الأمر
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

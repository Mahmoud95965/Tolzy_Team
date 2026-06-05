"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';


export default function SuccessPage() {
    const { user, userProfile } = useAuth();
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [resolvedPlan, setResolvedPlan] = useState<'pro' | null>(null);

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    useEffect(() => {
        // Wait for webhook + profile sync, then show plan-specific welcome
        // Increased timeout to 20 seconds to give webhook time to process
        let attempts = 0;
        const maxAttempts = 20; // 20 seconds instead of 10

        const interval = setInterval(() => {
            const plan = (userProfile?.plan || '').toLowerCase();
            console.log(`🔄 Checking plan (attempt ${attempts + 1}/${maxAttempts}): "${plan}"`);
            
            if (plan === 'pro' || plan === 'plus' || plan === 'ultra' || plan === 'tolzy_pro' || plan === 'tolzy_plus') {
                console.log(`✅ Plan detected: ${plan}`);
                setResolvedPlan('pro');
                setIsLoading(false);
                clearInterval(interval);
                return;
            }

            attempts += 1;
            if (attempts >= maxAttempts) {
                console.warn(`⚠️ Plan not updated after 20 seconds, proceeding anyway`);
                setIsLoading(false);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [userProfile?.plan]);

    const handleContinue = () => {
        // Force fully reload to ensure the AuthContext fetches the latest plan from Supabase user_limits
        window.location.href = '/axiom';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center p-4 dir-rtl" dir="rtl">
            <div className="max-w-md w-full bg-white dark:bg-[#111] rounded-[32px] shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-100 dark:border-white/5 p-10 relative text-center">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    
                    {isLoading ? (
                        <>
                            <div className="w-24 h-24 mb-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">جاري تأكيد الاشتراك...</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                                نقوم الآن بتجهيز حسابك وفتح كافة الميزات الاستثنائية لك 💎
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 mb-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner border 4 border-white dark:border-[#111]">
                                <CheckCircle className="w-12 h-12 text-emerald-500" />
                            </div>
                            
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 text-amber-700 dark:text-amber-400 rounded-full text-xs font-black tracking-wide uppercase mb-4">
                                <Crown className="w-3.5 h-3.5" /> تم التفعيل بنجاح
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">أهلاً بك في النادي، يا بطل Tolzy! 💎</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                                {resolvedPlan
                                    ? `مبروك! حسابك الآن في وضع البرو (Pro). لقد فتحت للتو بوابة الإمكانيات الكاملة. من الآن، أنت لا تستخدم أدوات الذكاء الاصطناعي فحسب، بل أنت شريك في تطويرها. جرب الآن ميزة "المفكر"، ولا تتردد في مراسلتنا باقتراحاتك للأدوات القادمة.. نحن نبني تولزي من أجلك! (${user?.email})`
                                    : `تمت عملية الدفع بنجاح، وجاري الآن مزامنة اشتراك Pro على حسابك (${user?.email}).`}
                            </p>

                            <button
                                onClick={handleContinue}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group"
                            >
                                ابدأ استخدام Tolzy AI الآن
                                <ArrowRight className="w-5 h-5 mr-2 rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

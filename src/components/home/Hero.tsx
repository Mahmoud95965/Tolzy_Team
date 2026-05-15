 'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Bot, ShieldCheck, Zap, BrainCircuit, Rocket } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

export default function HeroSection() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const heroTitle = isLoggedIn
      ? 'أهلاً بعودتك! ابدأ رحلتك مع Tolzy'
    : 'ابدأ مجاناً مع Tolzy';

  const heroSubtitle = isLoggedIn
      ? 'استكشف الأدوات وابدأ الإبداع الآن.'
    : 'سجّل دخولك وابدأ مع Tolzy مجاناً واستكشف أفضل الأدوات.';

  const categories = [
    { name: 'Tolzy Copilot', icon: <Bot size={28} />, color: 'from-blue-500 to-indigo-500' },
    { name: 'المفكر (Pro)', icon: <BrainCircuit size={28} />, color: 'from-violet-500 to-fuchsia-500' },
    { name: 'سرعة وأولوية', icon: <Zap size={28} />, color: 'from-amber-500 to-orange-500' },
    { name: 'حماية وموثوقية', icon: <ShieldCheck size={28} />, color: 'from-emerald-500 to-teal-500' },
    { name: 'بناء أسرع', icon: <Rocket size={28} />, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#060B19] flex flex-col items-center pt-24 md:pt-32 overflow-hidden font-sans dir-rtl">
      
      {/* تأثيرات الإضاءة في الخلفية */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/15 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* نسخة مبسطة جداً للموبايل */}
      <div className="z-10 w-full px-4 max-w-md mx-auto md:hidden">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#101727] p-5 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-snug text-center">
            ابدأ رحلتك مع Tolzy
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 text-center leading-7">
            اكتشف الأدوات الذكية خطوة بخطوة وابدأ الإبداع في مشاريعك.
          </p>

          <div className="mt-5 space-y-2">
            <Link
              href={isLoggedIn ? '/tools' : '/auth'}
              className="w-full inline-flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-3 font-semibold text-sm"
            >
              {isLoggedIn ? 'ابدأ التجربة الآن' : 'جرّب المنصة مجاناً'}
            </Link>
            <Link
              href={isLoggedIn ? '/tools' : '/auth'}
              className="w-full inline-flex items-center justify-center border border-indigo-300 dark:border-indigo-400/40 text-indigo-700 dark:text-indigo-300 rounded-xl py-3 font-semibold text-sm"
            >
              {isLoggedIn ? 'تصفح الأدوات' : 'سجّل الدخول'}
            </Link>
          </div>
        </div>
      </div>

      {/* النصوص الأساسية */}
      <div className="hidden md:block z-10 text-center px-4 max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-5 leading-tight">
          {heroTitle} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500 dark:from-blue-400 dark:to-purple-300">
            بوابة الإمكانيات الكاملة أصبحت بين يديك.
          </span>
        </h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          {heroSubtitle}
        </p>


      </div>

      {/* كروت الأقسام (Glassmorphism) */}
      <div className="hidden md:grid z-10 grid-cols-2 md:grid-cols-5 gap-4 px-4 max-w-6xl mx-auto mb-16">
        {categories.map((cat, index) => (
          <div 
            key={index} 
            className="group cursor-default bg-white/80 dark:bg-[#131B2F]/60 backdrop-blur-md border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.color} text-white shadow-lg`}>
              {cat.icon}
            </div>
            <span className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* أزرار الإجراءات السفلية */}
      <div className="hidden md:flex z-10 flex-wrap items-center justify-center gap-4 pb-20">
        <Link href="/tools" className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-5 py-2.5 rounded-xl text-sm md:text-base font-medium transition-colors">
          تصفح كل الأدوات
        </Link>

      </div>
      
    </div>
  );
}
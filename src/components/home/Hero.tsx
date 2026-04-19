 'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Bot, ShieldCheck, Zap, BrainCircuit, Rocket } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

export default function HeroSection() {
  const { user, userProfile } = useAuth();
  const [prompt, setPrompt] = React.useState('');
  const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
  const isProPlan = normalizedPlan.includes('pro') || normalizedPlan.includes('ultra');
  const isLoggedIn = !!user;

  const heroTitle = isLoggedIn
    ? isProPlan
      ? 'أهلاً بعودتك! أنت الآن على Pro'
      : 'أهلاً بعودتك! ابدأ مجاناً مع Tolzy'
    : 'ابدأ مجاناً مع Tolzy';

  const heroSubtitle = isLoggedIn
    ? isProPlan
      ? 'استمتع الآن بكل مميزات Pro، وافتح Tolzy AI مباشرة من الشريط بالأسفل.'
      : 'حسابك على الخطة المجانية، ويمكنك الآن تجربة Tolzy AI مباشرة.'
    : 'سجّل دخولك وابدأ مع Copilot وجرّب Tolzy AI مجاناً.';

  const goToAi = () => {
    const trimmed = prompt.trim();
    const url = trimmed
      ? `https://ai.tolzy.me?prompt=${encodeURIComponent(trimmed)}`
      : 'https://ai.tolzy.me';
    window.location.href = url;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToAi();
    }
  };

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
            {isProPlan ? 'أهلاً بك في Tolzy Pro' : 'ابدأ رحلتك مع Tolzy مجاناً'}
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 text-center leading-7">
            {isProPlan
              ? 'أنت على الخطة المدفوعة بالفعل، وكل الأدوات المتقدمة بين يديك.'
              : 'جرب المنصة الآن بدون أي تكلفة، واكتشف الأدوات الذكية خطوة بخطوة. عند جاهزيتك، يمكنك الترقية بسهولة.'}
          </p>

          <div className="mt-5 space-y-2">
            <Link
              href={isLoggedIn ? '/tools' : '/auth'}
              className="w-full inline-flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-3 font-semibold text-sm"
            >
              {isLoggedIn ? 'ابدأ التجربة الآن' : 'جرّب المنصة مجاناً'}
            </Link>
            <Link
              href={isLoggedIn ? 'https://ai.tolzy.me' : '/auth'}
              className="w-full inline-flex items-center justify-center border border-indigo-300 dark:border-indigo-400/40 text-indigo-700 dark:text-indigo-300 rounded-xl py-3 font-semibold text-sm"
            >
              {isLoggedIn ? 'الدخول إلى Tolzy AI' : 'سجّل الدخول'}
            </Link>
          </div>
        </div>
      </div>

      {/* النصوص الأساسية */}
      <div className="hidden md:block z-10 text-center px-4 max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-5 leading-tight">
          {heroTitle} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500 dark:from-blue-400 dark:to-purple-300">
            {isProPlan ? 'بوابة الإمكانيات الكاملة أصبحت بين يديك.' : 'وارتقِ إلى Pro وقت ما تحتاج القوة الكاملة.'}
          </span>
        </h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          {heroSubtitle}
        </p>

        {/* مربع إدخالي بصري */}
        <div className="relative max-w-3xl mx-auto mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>
          <div className="relative flex items-center bg-white/90 dark:bg-[#131B2F]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-xl">
            <Sparkles className="text-violet-500 ml-3" size={24} />
            <input 
              type="text" 
              placeholder="اكتب سؤالك واضغط Enter للمتابعة إلى Tolzy AI"
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 text-sm md:text-base"
              dir="rtl"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={goToAi}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm md:text-base font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
            >
              <span>اذهب إلى Tolzy AI</span>
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
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
        <Link href={isLoggedIn ? '/pricing' : '/auth'} className="bg-transparent border border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 px-6 py-2.5 rounded-xl text-sm md:text-base font-medium flex items-center gap-2 transition-all">
          <Sparkles size={18} />
          <span>{isLoggedIn ? 'استعرض خطة Pro' : 'سجّل دخولك وابدأ مجاناً'}</span>
          <Sparkles size={18} />
        </Link>
      </div>
      
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft, 
  Bot, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Search,
  Wrench,
  Play,
  X
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

interface TourStep {
  title: string;
  description: string;
  target: string;
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    title: 'دليل أدوات AI الشامل',
    description: 'اكتشف أكثر من 630 أداة ذكاء اصطناعي مرتبة حسب الاستخدام - من ChatGPT إلى Midjourney وأدوات البرمجة والتصميم',
    target: '/tools',
    icon: <Wrench className="w-8 h-8" />
  },
  {
    title: 'تعلم مجاناً مع Tolzy Learn',
    description: 'كورسات تفاعلية في البرمجة، الذكاء الاصطناعي، والتصميم - محتوى عربي 100% للطلاب والمحترفين',
    target: '/learn',
    icon: <BookOpen className="w-8 h-8" />
  },
  {
    title: 'مساعدك الذكي Tolzy Copilot',
    description: 'اسأل أي سؤال عن الأدوات، احصل على توصيات مخصصة، واختبر قدراتك مع مساعد AI متخصص',
    target: '/copilot',
    icon: <Bot className="w-8 h-8" />
  }
];

const features = [
  { 
    name: '630+ أداة AI', 
    icon: <Search size={24} />, 
    color: 'from-blue-500 to-indigo-500',
    description: 'دليل شامل ومرتب'
  },
  { 
    name: 'كورسات مجانية', 
    icon: <BookOpen size={24} />, 
    color: 'from-violet-500 to-fuchsia-500',
    description: 'تعلم الذكاء الاصطناعي'
  },
  { 
    name: 'مساعد ذكي', 
    icon: <Bot size={24} />, 
    color: 'from-emerald-500 to-teal-500',
    description: 'إجابات فورية'
  },
  { 
    name: '100% عربي', 
    icon: <Zap size={24} />, 
    color: 'from-amber-500 to-orange-500',
    description: 'محتوى مخصص لك'
  }
];

export default function EnhancedHero() {
  const { user, userProfile } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
  const isProPlan = normalizedPlan.includes('pro') || normalizedPlan.includes('ultra');
  const isLoggedIn = !!user;

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

  const startTour = () => {
    setShowTour(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTour(false);
    }
  };

  const skipTour = () => {
    setShowTour(false);
    localStorage.setItem('tolzy_tour_seen', 'true');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#060B19] flex flex-col items-center pt-20 md:pt-28 overflow-hidden font-sans dir-rtl">
      
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/15 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="z-10 w-full px-4 max-w-6xl mx-auto">
        
        {/* Value Proposition Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 rounded-full">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              المنصة العربية الأولى لأدوات الذكاء الاصطناعي
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            اكتشف عالم <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">الذكاء الاصطناعي</span>
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl">في مكان واحد</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            TOLZY هو دليلك الشامل لأدوات AI. اكتشف 630+ أداة، تعلم مجاناً من كورساتنا، 
            واحصل على مساعدة من Copilot للإجابة على كل أسئلتك
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link 
            href="/tools" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-transform"
          >
            <Search className="w-5 h-5" />
            استكشف الأدوات
          </Link>
          
          <button
            onClick={startTour}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-white/5 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <Play className="w-5 h-5" />
            شاهد جولة سريعة
          </button>
          
          <Link 
            href={isLoggedIn ? '/copilot' : '/auth'} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Bot className="w-5 h-5" />
            جرب Copilot
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/80 dark:bg-[#131B2F]/60 backdrop-blur-md border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{feature.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Input Box - Only for Desktop */}
        <div className="hidden md:block max-w-3xl mx-auto mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-20 dark:opacity-30"></div>
            <div className="relative flex items-center bg-white/90 dark:bg-[#131B2F]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-xl">
              <Sparkles className="text-violet-500 ml-3" size={24} />
              <input 
                type="text" 
                placeholder="ابحث عن أداة أو اسأل Copilot أي شيء..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 text-base"
                dir="rtl"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={goToAi}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
              >
                <span>ابحث</span>
                <ArrowLeft size={20} />
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3">
            جرب: "أدوات تحويل النص لصوت" أو "كورسات الذكاء الاصطناعي للمبتدئين"
          </p>
        </div>
      </div>

      {/* Interactive Tour Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131B2F] rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button 
              onClick={skipTour}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                {tourSteps[currentStep].icon}
              </div>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                الخطوة {currentStep + 1} من {tourSteps.length}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {tourSteps[currentStep].title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {tourSteps[currentStep].description}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={skipTour}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                تخطي
              </button>
              <Link
                href={tourSteps[currentStep].target}
                onClick={nextStep}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-center hover:shadow-lg transition-all"
              >
                {currentStep < tourSteps.length - 1 ? 'التالي' : 'ابدأ الاستخدام'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

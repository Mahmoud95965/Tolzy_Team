'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft, 
  Bot, 
  BookOpen, 
  Search,
  Wrench,
  Play,
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import LogoMarquee from './LogoMarquee';

interface TourStep {
  title: string;
  description: string;
  target: string;
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    title: 'دليل أدوات AI الشامل',
    description: 'اكتشف أكثر من 1000 أداة ذكاء اصطناعي مرتبة حسب الاستخدام - من ChatGPT إلى Midjourney وأدوات البرمجة والتصميم',
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

// Typing Placeholder Component for premium interactive search bar
function TypingPlaceholder({ active, isDarkMode }: { active: boolean, isDarkMode: boolean }) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const phrases = [
    'أدوات تحويل النص إلى صوت...',
    'كورسات البرمجة بالذكاء الاصطناعي للمبتدئين...',
    'مشاريع وتطبيقات ويب مفتوحة المصدر...',
    'تولزي كوبايلوت ومساعد البرمجة الذكي...',
    'أفضل أدوات تصميم وتوليد الصور الفنية...'
  ];

  useEffect(() => {
    if (!active) return;
    const currentPhrase = phrases[loopIndex % phrases.length];

    const handleTyping = () => {
      if (!isDeleting) {
        setText(currentPhrase.substring(0, text.length + 1));
        setTypingSpeed(80);

        if (text === currentPhrase) {
          setIsDeleting(true);
          setTypingSpeed(2200); // Wait on complete phrase
        }
      } else {
        setText(currentPhrase.substring(0, text.length - 1));
        setTypingSpeed(40);

        if (text === '') {
          setIsDeleting(false);
          setLoopIndex((prev) => prev + 1);
          setTypingSpeed(400); // Wait before starting next phrase
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopIndex, typingSpeed, active]);

  if (!active) return null;

  return (
    <div className={`absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none font-sans text-sm md:text-base flex items-center gap-1 dir-rtl transition-colors duration-300 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
      <span>{text}</span>
      <span className="w-[1.5px] h-4 bg-indigo-500 inline-block animate-pulse align-middle" />
    </div>
  );
}

export default function EnhancedHero() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const isLoggedIn = !!user;

  const goToCopilot = () => {
    const trimmed = prompt.trim();
    if (trimmed) {
      window.location.href = `/copilot?q=${encodeURIComponent(trimmed)}`;
    } else {
      window.location.href = '/copilot';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToCopilot();
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

  // Entrance animations using framer-motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className={`relative min-h-[90vh] md:min-h-screen flex flex-col justify-between items-center pt-24 md:pt-32 overflow-hidden font-sans dir-rtl w-full transition-colors duration-500 ${isDarkMode ? 'bg-[#090a0f] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>
      {/* Background Animated Glow Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Violet glow */}
        <motion.div
          className={`absolute top-[10%] left-[5%] md:left-[15%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[100px] md:blur-[150px] transition-all duration-500 ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-500/8'}`}
          animate={{
            scale: [1, 1.12, 0.93, 1],
            x: [0, 15, -15, 0],
            y: [0, -25, 20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />

        {/* Blue glow */}
        <motion.div
          className={`absolute bottom-[20%] right-[5%] md:right-[15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[130px] transition-all duration-500 ${isDarkMode ? 'bg-blue-500/15' : 'bg-blue-500/6'}`}
          animate={{
            scale: [1, 0.92, 1.15, 1],
            x: [0, -20, 20, 0],
            y: [0, 20, -20, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />

        {/* Technical mesh background overlay */}
        <div className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] transition-opacity duration-300 ${isDarkMode ? 'bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] opacity-100' : 'bg-[linear-gradient(to_right,rgba(99,102,241,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.025)_1px,transparent_1px)] opacity-100'}`} />
      </div>

      {/* Main Container */}
      <motion.div 
        className="z-10 w-full px-4 max-w-5xl mx-auto flex-grow flex flex-col justify-center items-center text-center pb-8 md:pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Value Proposition Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-650'}`}>
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs md:text-sm font-semibold tracking-wide">
              المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم الذكي
            </span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          variants={itemVariants} 
          className={`text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight md:leading-snug transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
        >
          اكتشف عالم <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-blue-400 via-indigo-200 to-purple-400' : 'from-indigo-600 via-violet-500 to-purple-600'}`}>الذكاء الاصطناعي</span>
          <br />
          <span className={`text-3xl md:text-5xl lg:text-6xl font-bold bg-clip-text mt-2 block transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            في مكان واحد تفاعلي
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          variants={itemVariants}
          className={`text-base md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 text-center transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
        >
          بوابة Tolzy الذكية تربطك بـ 1000+ أداة AI احترافية، كورسات برمجة مجانية عالية الجودة،
          ومساعد Copilot التوليدي للإجابة وتوجيه أفكارك بالكامل باللغة العربية.
        </motion.p>

        {/* Premium Glassmorphic Search Bar */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-3xl px-4 md:px-0 mb-8 relative"
        >
          <div className="relative group/search">
            {/* Glowing borders */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-md opacity-25 group-hover/search:opacity-40 transition-opacity duration-300" />
            
            <div className={`relative flex items-center border rounded-2xl p-2.5 shadow-2xl transition-all group-hover/search:border-indigo-500/30 ${isDarkMode ? 'bg-slate-950/40 border-white/10' : 'bg-white border-slate-200/80 shadow-md shadow-slate-200/20'}`}>
              <Search className="text-indigo-400 mr-3.5 flex-shrink-0" size={22} />
              
              <div className="relative flex-1 h-12">
                <input 
                  id="smart-search-input"
                  type="text" 
                  className={`w-full h-full bg-transparent border-none outline-none px-4 text-sm md:text-base text-right font-sans focus:ring-0 transition-colors duration-300 ${isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'}`}
                  dir="rtl"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                
                {/* Custom Typing Placeholder */}
                <TypingPlaceholder active={prompt === ''} isDarkMode={isDarkMode} />
              </div>

              <button
                id="search-action-btn"
                onClick={goToCopilot}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 md:px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
              >
                <span className="text-sm md:text-base">ابحث ذكياً</span>
                <ArrowLeft size={18} className="rtl:rotate-0 ltr:rotate-180" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Navigation Chips */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-12 max-w-2xl"
        >
          <Link 
            href="/tools" 
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 shadow-sm ${isDarkMode ? 'border-white/5 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08] hover:text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <Wrench className="w-4 h-4 text-blue-400" />
            دليل الأدوات (+1000)
          </Link>
          
          <button
            onClick={startTour}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 ${isDarkMode ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20' : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            <Play className="w-4 h-4" />
            جولة تعريفية تفاعلية
          </button>
          
          <Link 
            href={isLoggedIn ? '/copilot' : '/auth'} 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
          >
            <Bot className="w-4 h-4 text-purple-200" />
            مساعدك التوليدي Copilot
          </Link>
        </motion.div>
      </motion.div>

      {/* Logos Marquee (Positioned directly below the hero content to bridge smooth transitions) */}
      <div className="w-full relative z-20">
        <LogoMarquee />
      </div>

      {/* Interactive Tour Modal in Dark/Light Glassmorphism */}
      <AnimatePresence>
        {showTour && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              className={`border rounded-3xl max-w-lg w-full p-8 shadow-2xl relative backdrop-blur-2xl text-right dir-rtl transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/90 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-800'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <button 
                id="tour-close-btn"
                onClick={skipTour}
                className={`absolute top-4 left-4 p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  {tourSteps[currentStep].icon}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  الخطوة {currentStep + 1} من {tourSteps.length}
                </span>
                <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {tourSteps[currentStep].title}
                </h3>
                <p className={`mt-3 text-sm leading-relaxed max-w-sm mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>
                  {tourSteps[currentStep].description}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  id="tour-skip-btn"
                  onClick={skipTour}
                  className={`flex-1 py-3 px-4 rounded-xl border font-semibold transition-all text-center ${isDarkMode ? 'border-white/10 bg-transparent text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  تخطي الجولة
                </button>
                <Link
                  href={tourSteps[currentStep].target}
                  onClick={nextStep}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-center hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  {currentStep < tourSteps.length - 1 ? 'التالي' : 'ابدأ الاستكشاف 🚀'}
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}


'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  BookOpen, 
  Bot, 
  ArrowLeft,
  Sparkles,
  Zap,
  Cpu,
  Heart,
  Copy,
  Check,
  TrendingUp,
  Bookmark,
  Users,
  Code
} from 'lucide-react';
import { motion, useMotionValue, useTransform, Variants } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// ==========================================
// 1. REUSABLE 3D TILT HOVER ELEMENT
// ==========================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

function TiltCard({ children, className = '' }: TiltCardProps) {
  const { isDarkMode } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Rotate between -8 to 8 degrees based on mouse percentages
  const rotateX = useTransform(y, [0, 1], [8, -8]);
  const rotateY = useTransform(x, [0, 1], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coords relative to the element
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.015 }}
      className={`transition-all duration-300 ease-out border backdrop-blur-xl rounded-3xl p-6 md:p-8 relative overflow-hidden group ${
        isDarkMode 
          ? 'border-white/5 bg-[#121620]/60 shadow-2xl shadow-slate-950/50' 
          : 'border-slate-200/80 bg-white shadow-xl shadow-slate-200/50'
      } ${className}`}
    >
      <div style={{ transform: 'translateZ(25px)' }} className="h-full w-full relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// ==========================================
// 2. LIVE COUNT-UP TICKER COMPONENT
// ==========================================
interface LiveCounterProps {
  target: number;
  suffix?: string;
}

function LiveCounter({ target, suffix = '' }: LiveCounterProps) {
  const { isDarkMode } = useTheme();
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = target;
    const duration = 2000; // 2 seconds
    const increment = end / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hasStarted, target]);

  return (
    <div 
      ref={elementRef} 
      className={`font-mono text-3xl md:text-4xl font-extrabold tracking-tight transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-slate-900'
      }`}
    >
      {count.toLocaleString()}{suffix}
    </div>
  );
}

// ==========================================
// 3. BUILD WITH AI EMULATOR
// ==========================================
function BuildWithAIEmulator() {
  const { isDarkMode } = useTheme();
  const [phase, setPhase] = useState(0);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>([false, false, false]);

  const phases = [
    { title: '💡 تحليل الفكرة وتحديد أبعاد المشروع...', code: [] },
    { 
      title: '⚙️ استخلاص واقتراح التقنيات المناسبة...', 
      code: [
        '// خطة المشروع التقنية (Project Plan)',
        '{',
        '  "name": "تطبيق المهام الذكي",',
        '  "technologies": ["React", "Firebase"],',
        '  "estimatedTime": "12 ساعة"',
        '}'
      ] 
    },
    { 
      title: '📋 توليد البرومبتات وهندسة الأوامر الجاهزة...', 
      code: [
        '// خطة المشروع التقنية (Project Plan)',
        '{',
        '  "name": "تطبيق المهام الذكي",',
        '  "technologies": ["React", "Firebase"],',
        '  "estimatedTime": "12 ساعة",',
        '  "prompts": [',
        '    "اكتب دالة لتصفية المهام...",',
        '    "صمم قاعدة بيانات Firebase..."',
        '  ]',
        '}'
      ] 
    },
    { title: '✨ اكتملت خطة البناء الفنية بالكامل!', code: [] }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => {
        const next = (prev + 1) % 4;
        if (next === 0) {
          setCodeLines([]);
          setCompletedTasks([false, false, false]);
        } else if (next === 1) {
          setCodeLines(phases[1].code);
          setCompletedTasks([true, false, false]);
        } else if (next === 2) {
          setCodeLines(phases[2].code);
          setCompletedTasks([true, true, false]);
        } else if (next === 3) {
          setCompletedTasks([true, true, true]);
        }
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-stretch">
      {/* Code Editor Mock */}
      <div className={`rounded-2xl border p-4 font-mono text-[10px] md:text-xs text-left flex flex-col justify-between overflow-hidden min-h-[220px] relative transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-950/90 border-white/5 text-slate-300 shadow-inner' 
          : 'bg-slate-900 border-slate-800 text-slate-100 shadow-lg shadow-slate-900/10'
      }`}>
        <div className="absolute top-2 right-3 flex gap-1.5 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        
        <div className="mt-4 flex-grow space-y-1 overflow-y-auto max-h-[140px] pr-2">
          <div className="text-slate-500">// ProjectPlan.json</div>
          {codeLines.map((line, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.3 }}
              className={line.startsWith(' ') ? 'text-emerald-400 pl-4' : 'text-indigo-400 pl-2'}
            >
              {line}
            </motion.div>
          ))}
          {phase === 0 && (
            <div className="text-slate-500 animate-pulse pl-4">جاري توليد خطة العمل التقنية...</div>
          )}
        </div>

        <div className={`border-t pt-3 mt-2 flex items-center justify-between text-[10px] ${
          isDarkMode ? 'border-white/5' : 'border-slate-800'
        }`}>
          <span className="text-indigo-400 font-bold flex items-center gap-1">
            <Code className="w-3.5 h-3.5" /> JSON + Tech Plan
          </span>
          <span className="text-slate-500 font-sans">تم التوليد بذكاء</span>
        </div>
      </div>

      {/* Visual Live Render Mock */}
      <div className={`border rounded-2xl p-4 flex flex-col justify-between text-right dir-rtl min-h-[220px] transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#181f33]/60 border-white/5 text-white' 
          : 'bg-slate-100/70 border-slate-200 text-slate-800'
      }`}>
        <div>
          <div className={`flex items-center justify-between mb-4 border-b pb-2 ${
            isDarkMode ? 'border-white/5' : 'border-slate-200'
          }`}>
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold font-sans transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400' 
                : 'bg-indigo-50 border border-indigo-200 text-indigo-600'
            }`}>
              معاينة حية
            </span>
            <span className={`text-xs font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>خطة البناء المقترحة</span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: '1. صياغة الهيكل المعماري والتقنيات 🏗️', checked: completedTasks[0] },
              { label: '2. توليد البرومبتات والأوامر الملقنة 📋', checked: completedTasks[1] },
              { label: '3. تحديد أوقات التنفيذ والمهام المقدرة ⏱️', checked: completedTasks[2] }
            ].map((task, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-white/5' 
                  : 'bg-white border-slate-200 shadow-sm shadow-slate-100/50'
              }`}>
                <span className={`text-xs md:text-sm font-sans transition-colors duration-300 ${
                  task.checked 
                    ? (isDarkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through') 
                    : (isDarkMode ? 'text-slate-200' : 'text-slate-750')
                }`}>
                  {task.label}
                </span>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-350 ${
                  task.checked 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : (isDarkMode ? 'border-white/20 bg-slate-950' : 'border-slate-300 bg-slate-50')
                }`}>
                  {task.checked && <Check className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`text-right border-t pt-2 text-[10px] font-sans transition-all duration-300 ${
          isDarkMode ? 'border-white/5 text-slate-400' : 'border-slate-200 text-slate-500'
        }`}>
          الحالة الحالية: <span className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{phases[phase].title}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN WHATISTOLZY REDESIGN
// ==========================================
export default function WhatIsTolzy() {
  const { isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);
  const promptText = "قم بتحليل المقال واقترح 10 عناوين مشوقة متوافقة مع معايير السيو (SEO) وقواعد كتابة المحتوى العربي الفاخر...";

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Entrance animations
  const bentoVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12,
      },
    },
  };

  return (
    <section className={`py-24 transition-colors duration-500 relative overflow-hidden font-sans border-t ${
      isDarkMode ? 'bg-[#090a0f] text-white border-white/5' : 'bg-[#F8FAFC] text-slate-800 border-slate-200'
    }`}>
      {/* Decorative glows */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className={`absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[130px] transition-colors duration-500 ${
          isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-500/5'
        }`} />
        <div className={`absolute bottom-[10%] left-[-15%] w-[400px] h-[400px] rounded-full blur-[130px] transition-colors duration-500 ${
          isDarkMode ? 'bg-purple-600/10' : 'bg-purple-500/5'
        }`} />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors duration-500 ${
            isDarkMode ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-indigo-200 bg-indigo-50'
          } mb-4 backdrop-blur-md`}>
            <Cpu className={`w-3.5 h-3.5 animate-pulse ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span className={`text-xs font-bold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>منظومة شاملة ومتكاملة</span>
          </div>
          
          <h2 className={`text-3xl md:text-5xl font-extrabold mb-4 leading-tight md:leading-normal transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            ماذا يقدم لك <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-200 dark:to-purple-400">TOLZY</span>؟
          </h2>
          
          <p className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed transition-colors duration-500 ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            منصة ذكية موحدة تجمع بين أكبر دليل عربي لأدوات الذكاء الاصطناعي، ومحتوى تعليمي مجاني للبرمجة، ومجتمع ملقنات متكامل لتمكين المستخدم العربي.
          </p>
        </div>

        {/* BENTO GRID LAYOUT */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(240px,_auto)]"
          variants={bentoVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          
          {/* CARD 1: BUILD WITH AI EMULATOR (Span 2 columns, Row span 2) */}
          <motion.div variants={cardVariants} className="md:col-span-2 md:row-span-2">
            <TiltCard className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                    isDarkMode ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border border-indigo-200 text-indigo-650'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h3 className={`text-xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ميزة ابنِ بالذكاء الاصطناعي (Build with AI)</h3>
                    <p className={`text-xs mt-0.5 transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>توليد خطط البناء والمواصفات والأوامر لمشروعك</p>
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-6 text-right transition-colors duration-500 ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>
                  مساعد فني مبتكر يتيح لك طرح فكرة تطبيقك أو موقعك، ليقوم تلقائياً بتحليل الفكرة وصياغة خطة عمل برمجية شاملة وهيكلية؛ توضح التقنيات المستخدمة والبرومبتات الدقيقة المطلوبة والوقت التقريبي المتوقع، لمساعدتك في التخطيط والهندسة دون بناء الكود الفعلي.
                </p>
              </div>

              {/* Dynamic Mock Emulator Box */}
              <div className="flex-grow">
                <BuildWithAIEmulator />
              </div>
            </TiltCard>
          </motion.div>

          {/* CARD 2: LIVE STATISTICS COUNTERS (Vertical Card, Span 1 column) */}
          <motion.div variants={cardVariants} className="md:col-span-1">
            <TiltCard className={`h-full flex flex-col justify-between transition-all duration-300 ${
              isDarkMode ? 'border-indigo-500/10' : 'border-indigo-200/60'
            }`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${
                isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-500/3'
              }`} />

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                  isDarkMode ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-650'
                }`}>
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-right">
                  <h3 className={`text-lg font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>إحصاءات حية</h3>
                  <p className={`text-xs mt-0.5 transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>تحديث فوري لنمو وتفاعل المنصة</p>
                </div>
              </div>

              <div className="space-y-6 text-right" dir="rtl">
                <div>
                  <span className={`text-xs block mb-1 transition-colors duration-305 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>دليل الأدوات الذكية</span>
                  <LiveCounter target={630} suffix="+" />
                </div>
                
                <div className={`border-t pt-4 transition-colors duration-300 ${isDarkMode ? 'border-white/5' : 'border-slate-150'}`}>
                  <span className={`text-xs block mb-1 transition-colors duration-305 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الكورسات التعليمية البرمجية</span>
                  <LiveCounter target={150} suffix="+" />
                </div>

                <div className={`border-t pt-4 transition-colors duration-300 ${isDarkMode ? 'border-white/5' : 'border-slate-150'}`}>
                  <span className={`text-xs block mb-1 transition-colors duration-305 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>مستخدم مسجل في المنصة</span>
                  <LiveCounter target={2500} suffix="+" />
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* CARD 3: LATEST COMMUNITY PROMPT (Span 1 column) */}
          <motion.div variants={cardVariants} className="md:col-span-1">
            <TiltCard className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className={`text-[10px] font-bold tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>مُلقن مجتمعي جديد</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">جديد</span>
                </div>

                <h3 className={`text-lg font-bold text-right mb-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>مساعد محركات البحث (SEO AI Master)</h3>
                <p className={`text-xs text-right mb-4 transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>تمت إضافته بواسطة مجتمع تولزي</p>

                {/* Prompt Preview Block */}
                <div className={`p-3.5 rounded-2xl border text-right text-xs font-sans leading-relaxed relative min-h-[90px] overflow-hidden mb-5 transition-all duration-300 ${
                  isDarkMode ? 'bg-slate-950/80 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-650'
                }`}>
                  <p className="line-clamp-3">{promptText}</p>
                  <div className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t pointer-events-none transition-colors duration-300 ${
                    isDarkMode ? 'from-slate-950/90 to-transparent' : 'from-slate-50 to-transparent'
                  }`} />
                </div>
              </div>

              {/* Interaction Row */}
              <div className={`flex items-center justify-between border-t pt-4 mt-auto transition-colors duration-300 ${
                isDarkMode ? 'border-white/5' : 'border-slate-150'
              }`}>
                <button 
                  id="copy-prompt-btn"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    copied 
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                      : (isDarkMode 
                          ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200' 
                          : 'bg-slate-100 border border-slate-200/80 hover:bg-slate-200 text-slate-700')
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'تم النسخ!' : 'انسخ الأمر'}
                </button>

                <div className={`flex items-center gap-3 text-xs font-sans transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer">
                    <Heart className="w-3.5 h-3.5 text-rose-500/70" /> 2.4k
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500/80" /> +800
                  </span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* CARD 4: LATEST COURSE IN TOLZY LEARN (Span 1 column) */}
          <motion.div variants={cardVariants} className="md:col-span-1">
            <TiltCard className={`h-full flex flex-col justify-between transition-all duration-300 ${
              isDarkMode ? 'border-purple-500/10' : 'border-purple-200/60'
            }`}>
              <div className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${
                isDarkMode ? 'bg-purple-500/5' : 'bg-purple-500/3'
              }`} />
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                    isDarkMode ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' : 'bg-purple-50 border border-purple-200 text-purple-650'
                  }`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md font-semibold">تعلم مجاني</span>
                </div>

                <h3 className={`text-lg font-bold text-right mb-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>هندسة الأوامر (Prompt Engineering) للمحترفين</h3>
                <p className={`text-xs text-right mb-4 transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>كورسات تولزي التعليمية الشاملة</p>

                <p className={`text-xs leading-relaxed text-right mb-6 transition-colors duration-500 ${isDarkMode ? 'text-slate-350' : 'text-slate-650'}`}>
                  اكتشف وتعلّم كيفية كتابة وصياغة الأوامر البرمجية بدقة للتعامل مع النماذج اللغوية الكبيرة واستخراج أفضل النتائج وأعلى درجات الدقة منها مجاناً بالكامل.
                </p>
              </div>

              {/* Course Meta Info */}
              <div className={`flex items-center justify-between border-t pt-4 mt-auto transition-colors duration-300 ${
                isDarkMode ? 'border-white/5' : 'border-slate-150'
              }`}>
                <Link
                  id="go-to-course-btn"
                  href="/learn"
                  className={`inline-flex items-center gap-1 text-xs font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700 hover:underline'
                  }`}
                >
                  ابدأ التعلم مجاناً <ArrowLeft className="w-3.5 h-3.5 ml-1 rtl:rotate-0 ltr:rotate-180" />
                </Link>
                
                <span className={`text-[10px] px-2 py-1 rounded-md font-sans transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-400 bg-white/5' : 'text-slate-600 bg-slate-100'
                }`}>
                  6 ساعات دراسية
                </span>
              </div>
            </TiltCard>
          </motion.div>

        </motion.div>

        {/* Bottom Call to Action */}
        <div className="text-center mt-16">
          <p className={`mb-6 text-base md:text-lg transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            انضم الآن إلى أكبر منظومة ذكاء اصطناعي تفاعلية في العالم العربي
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              id="bento-explore-tools-btn"
              href="/tools"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'
              }`}
            >
              ابدأ الاستكشاف الآن
              <ArrowLeft className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
            </Link>
            
            <Link
              id="bento-register-btn"
              href="/auth"
              className={`inline-flex items-center justify-center gap-2 border px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 ${
                isDarkMode 
                  ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' 
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 shadow-sm shadow-slate-200/50'
              }`}
            >
              أنشئ حساب مجاني
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

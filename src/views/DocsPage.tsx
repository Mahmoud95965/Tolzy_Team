"use client";
import React, { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { 
  BookOpen, Rocket, HelpCircle, 
  Menu, X, Search, Code, 
  Sparkles, Zap, Check, Copy, Hash, 
  Command, Layout, Lightbulb,
  ArrowUpRight, Play, Braces, AlertCircle,
  Wand2, BrainCircuit, GraduationCap, Users,
  CreditCard, ShieldCheck, Database, Terminal,
  Sliders, MessageSquare, Mic, Layers, Key,
  ExternalLink, ArrowLeft, CheckCircle2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Section {
  subtitle: string;
  content: () => React.ReactNode;
}

interface DocContent {
  id: string;
  group: string;
  title: string;
  icon: any;
  badge?: { text: string; type: 'default' | 'beta' | 'new' | 'live' | 'pro' };
  sections: Section[];
}

// --- Components ---

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => {
  const styles: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    beta: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
    live: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50',
    pro: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
};

const CodeBlock = ({ code, language = 'javascript' }: { code: string, language?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c0d14] my-6 shadow-sm" dir="ltr">
      <div className="bg-white dark:bg-[#12141f] px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Braces className="w-3.5 h-3.5 text-indigo-500" />
           <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-widest">{language}</span>
        </div>
        <button onClick={handleCopy} className="text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5">
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-500">تم النسخ</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">نسخ الكود</span>
            </>
          )}
        </button>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-800 dark:text-[#E2E8F0] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const Callout = ({ type = 'info', title, children }: { type?: 'info' | 'warning' | 'tip' | 'error', title?: string, children: React.ReactNode }) => {
  const config = {
    info: { icon: Zap, bg: 'bg-indigo-50/70 dark:bg-indigo-950/20', border: 'border-r-indigo-500', text: 'text-indigo-950 dark:text-indigo-200', iconColor: 'text-indigo-600 dark:text-indigo-400' },
    warning: { icon: AlertCircle, bg: 'bg-amber-50/70 dark:bg-amber-950/20', border: 'border-r-amber-500', text: 'text-amber-950 dark:text-amber-200', iconColor: 'text-amber-600 dark:text-amber-400' },
    tip: { icon: Lightbulb, bg: 'bg-emerald-50/70 dark:bg-emerald-950/20', border: 'border-r-emerald-500', text: 'text-emerald-950 dark:text-emerald-200', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    error: { icon: AlertCircle, bg: 'bg-red-50/70 dark:bg-red-950/20', border: 'border-r-red-500', text: 'text-red-950 dark:text-red-200', iconColor: 'text-red-600 dark:text-red-400' },
  };
  const { icon: Icon, bg, border, text, iconColor } = config[type];
  return (
    <div className={`p-5 rounded-2xl border-r-4 my-6 flex gap-4 ${bg} ${border} ${text} border border-slate-200/50 dark:border-white/5 shadow-sm`}>
      <div className="mt-0.5 shrink-0">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-black mb-1.5 tracking-tight text-[15px]">{title}</h5>}
        <div className="text-[14px] leading-relaxed opacity-90 font-medium">{children}</div>
      </div>
    </div>
  );
};

// --- Documentation Content Data ---
const docContent: DocContent[] = [
  {
    id: 'intro',
    group: 'نظرة عامة',
    title: 'مرحباً بك في منظومة TOLZY AI',
    icon: Rocket,
    badge: { text: '2026', type: 'live' },
    sections: [
      {
        subtitle: 'ما هي منظومة TOLZY AI المتكاملة؟',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              منظومة <strong>TOLZY AI</strong> هي المنصة العربية الرائدة لهندسة وتطوير البرمجيات بالذكاء الاصطناعي والتعليم التقني المتخصص. نهدف إلى تمكين المطورين، ورواد الأعمال، والطلاب من بناء منتجات برمجية متكاملة واكتساب المهارات التقنية بأعلى كفاءة وأسرع وتيرة ممكنة.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-black text-slate-900 dark:text-white">
                  <BrainCircuit className="w-5 h-5 text-indigo-500" />
                  <span>TOLZY AXIOM 2.5 Pro</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">مستشار الذكاء الاصطناعي وهندسة البرمجيات والبحث الفوري في الذاكرة.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-black text-slate-900 dark:text-white">
                  <Wand2 className="w-5 h-5 text-violet-500" />
                  <span>TOLZY Build With AI</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">تحويل الأفكار إلى مخططات برمجية، جداول Supabase SQL، ووثائق PRD كاملة.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-black text-slate-900 dark:text-white">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  <span>TOLZY OmniLearn</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">معالجة وتلخيص الفيديوهات والكورسات التعليمية واستخراج كويزات ذكية.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-black text-slate-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <span>دليل الأدوات والمجتمع</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">+1000 أداة ذكاء اصطناعي مفهرسة ومجتمع يضم آلاف المطورين التقنيين.</p>
              </div>
            </div>
            <Callout type="tip" title="مبدأ الوصول الشامل العادل (Universal Access)">
              جميع ميزات المنظومة الاحترافية متاحة لجميع المستخدمين بلا استثناء اعتماداً على رصيد التوكن الحقيقي. يحصل كل مستخدم مسجل على 10,000 توكن مجاني مدى الحياة لتجربة كافة الأدوات فوراً!
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'axiom-guide',
    group: 'مستشار AXIOM',
    title: 'دليل مستشار TOLZY AXIOM 2.5 Pro',
    icon: BrainCircuit,
    badge: { text: 'AXIOM 2.5 Pro', type: 'new' },
    sections: [
      {
        subtitle: 'المعمارية والقدرات الاستشارية (AXIOM Engine)',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              يمثل <strong>TOLZY AXIOM 2.5 Pro</strong> النواة الذكية الفائقة للمنصة. تم تصميمه كمهندس معماري تقني (Principal Software Architect) واستشاري تقني لتقديم إجابات متعمقة، حلول برمجية جاهزة للإنتاج (Production-Ready)، وتحليلات هندسية رصينة.
            </p>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">⚡ أوضاع التفاعل المتخصصة (Specialized Modes):</h4>
            <ul className="list-disc pr-6 space-y-2 mb-4 text-sm">
              <li><strong>الوضع العام (@عام):</strong> استشارات تقنية شاملة، تحليل أفكار المنتجات، وصياغة الاستراتيجيات.</li>
              <li><strong>وضع البرمجة والهندسة (@برمجة):</strong> توليد أكواد برمجية نظيفة وحديثة (TypeScript, Next.js 15, React 19, Supabase, Python) مع معالجة الأخطاء وأفضل ممارسات الأمان.</li>
              <li><strong>وضع الأدوات (@أدوات):</strong> استرجاع واقتراح أفضل أدوات الذكاء الاصطناعي من دليل المنظومة مع روابطها المباشرة.</li>
              <li><strong>وضع التعلم (@تعلم):</strong> شرح المفاهيم البرمجية والهندسية المعقدة بأسلوب تدريجي وتفاعلي.</li>
            </ul>
            <Callout type="info" title="التسجيل والإدخال الصوتي الفوري 🎙️">
              يدعم AXIOM محرك إدخال صوتي متطور يتعرف على الصوت باللغة العربية والإنجليزية لحظياً ويقوم بتفريغ الكلمات بدقة وسلاسة دون مقاطعة كتابتك.
            </Callout>
          </>
        )
      },
      {
        subtitle: 'البحث المباشر في الذاكرة المعرفية (RAG Integration)',
        content: () => (
          <>
            <p className="leading-relaxed mb-3">
              يمتلك AXIOM وصولاً مباشراً لقاعدة معرفية سحابية عبر تقنية البحث الدلالي (RAG)، مما يمكنه من ربط إجاباته بأكثر من <strong>1000 أداة ذكاء اصطناعي</strong> ومئات الكورسات المعتمدة المتاحة على المنصة وتزويدك بروابطها المباشرة تلقائياً.
            </p>
            <CodeBlock language="markdown" code={`### نموذج استجابة AXIOM الذكية:
- [Cursor AI](/tools/cursor): محرر الأكواد الذكي المدعوم بالـ AI.
- [كورس Next.js 15 الشامل](/learn/course/next15): الدليل العملي لبناء تطبيقات الويب الحديثة.`} />
          </>
        )
      }
    ]
  },
  {
    id: 'build-with-ai',
    group: 'بناء المشاريع',
    title: 'أداة TOLZY Build With AI',
    icon: Wand2,
    badge: { text: 'Blueprint AI', type: 'pro' },
    sections: [
      {
        subtitle: 'تحويل الأفكار إلى منتجات ومشاريع إنتاجية',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              أداة <strong>Build With AI</strong> هي بيئة معمارية متطورة تمكنك من كتابة فكرة أي موقع أو تطبيق أو أداة SaaS باللغة العربية، لتتولى المنظومة هندستها وتوليد مخطط برمجي وتجاري متكامل يشمل:
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">1. دراسة الجدوى والقيمة التنافسية (Commercial Viability)</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تحديد الجمهور المستهدف بدقة، ونقاط الألم الجوهرية، والميزة التنافسية الفريدة (Moat).</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">2. مخطط Supabase SQL جاهز للتشغيل (Instant DB Schema)</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">كود SQL كامل يشمل الجداول، العلاقات، والمفاتيح، وسياسات أمان Row Level Security (RLS).</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">3. برومبتات مخصصة لـ Cursor و v0.dev و Claude</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">برومبتات مهندسة بدقة فائقة لتوليد الواجهات والباك إند بضغطة زر واحدة بدون تخمين.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">4. وثيقة متطلبات المنتج الكاملة (Full PRD Document)</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ملف PRD بصيغة Markdown قابل للتصدير والطباعة ومشاركته مع فريق العمل أو المستثمرين.</p>
                </div>
              </div>
            </div>
            <Callout type="tip" title="تخصيص المخطط وفق خبرتك البرمجية">
              يمكنك اختيار مستواك (مبتدئ Beginner، متوسط Intermediate، متقدم Advanced) لتقوم المنظومة بمواءمة حزمة التقنيات (Tech Stack) والشروحات لتناسب قدراتك بدقة.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'omnilearn',
    group: 'التعلم الذكي',
    title: 'منصة TOLZY OmniLearn',
    icon: GraduationCap,
    badge: { text: 'Video & Courses', type: 'new' },
    sections: [
      {
        subtitle: 'المعالجة العميقة لمحتوى الفيديوهات والكورسات التعليمية',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              منصة <strong>OmniLearn</strong> تحول أي رابط يوتيوب أو مساق تعليمي إلى تجربة تفاعلية متكاملة، حيث يقوم الذكاء الاصطناعي بتفكيك تفريغ النص (Transcript) وتوفير:
            </p>
            <ul className="list-disc pr-6 space-y-2 mb-4 text-sm leading-relaxed">
              <li><strong>الملخص التنفيذي والأفكار الرئيسية:</strong> استخراج أهم المفاهيم في نقاط موجزة ومدعومة بأمثلة.</li>
              <li><strong>البطاقات التعليمية التفاعلية (Flashcards):</strong> للمراجعة السريعة وتثبيت المعلومات التقنية.</li>
              <li><strong>كويزات واختبارات تفاعلية ذكية (Smart Quizzes):</strong> أسئلة متعددة الخيارات تختبر استيعابك للمحتوى مع شرح أسباب الإجابة الصحيحة.</li>
              <li><strong>محادثة ذكية مع القفز الزمني (Timestamp Navigation):</strong> اسأل عن أي جزئية واضغط على الوقت للانتقال مباشرة للثانية المحددة في الفيديو.</li>
            </ul>
          </>
        )
      }
    ]
  },
  {
    id: 'tools-community',
    group: 'الأدوات والمجتمع',
    title: 'دليل الأدوات ومجتمع المطورين',
    icon: Users,
    sections: [
      {
        subtitle: 'دليل أدوات الذكاء الاصطناعي (+1000 أداة)',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              يوفر دليل الأدوات أكبر قاعدة بيانات عربية مصنفة لأدوات الذكاء الاصطناعي مع إمكانية التصفية حسب التصنيف (برمجة، تصميم، كتابة، تسويق، صوت وفيديو)، نوع التسعير (مجاني، مدفوع، تجربة مجانية)، وحفظ الأدوات المفضلة في حسابك.
            </p>
          </>
        )
      },
      {
        subtitle: 'مجتمع TOLZY التقني (Community & Prompt Hub)',
        content: () => (
          <>
            <p className="leading-relaxed mb-3">
              مجتمع تفاعلي يضم آلاف المطورين والمهتمين بالذكاء الاصطناعي لمشاركة البرومبتات، مناقشة المشاريع البرمجية، وطلب المساعدة. كما يوفر المجتمع ميزة <strong>التلخيص الذكي للمنشورات بالذكاء الاصطناعي</strong> بضغطة زر واحدة.
            </p>
          </>
        )
      }
    ]
  },
  {
    id: 'plans-pricing',
    group: 'الباقات والتوكن',
    title: 'نظام التوكن والاشتراكات',
    icon: CreditCard,
    badge: { text: 'Unified Tokens', type: 'live' },
    sections: [
      {
        subtitle: 'كيف يعمل نظام استهلاك التوكن في المنظومة؟',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              تعتمد منظومة TOLZY على نموذج استهلاك التوكن الشفاف والعادل:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                <span className="text-xs font-black text-slate-500 uppercase">الباقة الأساسية</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1 mb-2">Free</h4>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-2">10,000</div>
                <p className="text-xs text-slate-500">توكن ترحيبي مدى الحياة لتجربة كافة الميزات والأدوات بلا قيود.</p>
              </div>
              <div className="p-5 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border-2 border-violet-500/50 text-center relative shadow-lg">
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-violet-600 text-white font-black text-[10px]">الأكثر شعبية ⭐</span>
                <span className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase">باقة المحترفين</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1 mb-2">Pro</h4>
                <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mb-2">500,000</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">توكن للاستخدام المكثف، سرعة استجابة فائقة، وأولوية في المعالجة.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">باقة الطاقة القصوى</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1 mb-2">MAX</h4>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">2,500,000</div>
                <p className="text-xs text-slate-500">2.5 مليون توكن للشركات الناشئة وفرق التطوير وأصحاب المشاريع الضخمة.</p>
              </div>
            </div>
            <Callout type="tip" title="كوبون الخصم الرسمي: TOLZY2030 🎁">
              استخدم كود الخصم <strong>TOLZY2030</strong> في صفحة الأسعار للحصول على خصم فوري <strong>50%</strong> على باقتي Pro و MAX.
            </Callout>
            <Callout type="warning" title="التحقق الإداري الآمن وتفعيل الاشتراكات">
              تتم ترقية الحسابات بعد مراجعة وتأكيد إيصال الدفع من قبل الإدارة لضمان أمان العمليات ودقة شحن رصيد التوكن في حسابك فوراً.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'api-sdk',
    group: 'للمطورين',
    title: 'تكامل الـ API و SDK المطورين',
    icon: Code,
    badge: { text: 'API Ready', type: 'new' },
    sections: [
      {
        subtitle: 'الربط البرمجي مع واجهات TOLZY API',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              يمكن للمطورين دمج إمكانيات TOLZY AXIOM وبناء المشاريع داخل تطبيقاتهم البرمجية عبر واجهات برمجية RESTful قياسية:
            </p>
            <CodeBlock language="typescript" code={`// مثال استدعاء TOLZY AXIOM API عبر TypeScript/Node.js
const response = await fetch('https://tolzy.me/api/axiom/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${process.env.TOLZY_API_KEY}\`
  },
  body: JSON.stringify({
    message: 'كيف أقوم بتهيئة Next.js 15 App Router مع Supabase RLS؟',
    mode: 'code',
    userId: 'USER_ID'
  })
});

const data = await response.json();
console.log(data);`} />
            <Callout type="info" title="أمان مفاتيح API">
              احرص دائماً على حفظ مفاتيحك البرمجية داخل ملفات البيئة `.env.local` وعدم تضمينها في الكود الموجه للمتصفح.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'faq',
    group: 'الدعم والمساعدة',
    title: 'الأسئلة الشائعة والدعم الفني',
    icon: HelpCircle,
    sections: [
      {
        subtitle: 'ماذا يحدث عند نفاد رصيد التوكن الخاص بي؟',
        content: () => (
          <p className="leading-relaxed">
            عند نفاد رصيد التوكن، ستتوقف الأدوات عن المعالجة تلقائياً وتظهر لك رسالة توجيهية ترشدك إلى صفحة الأسعار لاختيار باقة Pro أو MAX وشحن الرصيد لاستئناف العمل فوراً.
          </p>
        )
      },
      {
        subtitle: 'هل يتم خصم التوكن عند مراجعة المواد التعليمية أو المشاريع السابقة؟',
        content: () => (
          <p className="leading-relaxed">
            لا، تصفح المشاريع السابقة المحفوظة في حسابك واستعراض ملخصات الكورسات التي تمت معالجتها مسبقاً يتم مجاناً بالكامل دون أي استهلاك إضافي للتوكن.
          </p>
        )
      },
      {
        subtitle: 'كيف يمكنني التواصل مع الدعم الفني؟',
        content: () => (
          <p className="leading-relaxed">
            فريق الدعم الفني متواجد لمساعدتك عبر المجتمع أو من خلال البريد الإلكتروني الرسمي: <span className="font-mono text-indigo-500 font-bold">support@tolzy.me</span>.
          </p>
        )
      }
    ]
  }
];

const groupedNav = docContent.reduce((acc: Record<string, DocContent[]>, item) => {
  if (!acc[item.group]) acc[item.group] = [];
  acc[item.group].push(item);
  return acc;
}, {});

// --- Main Page Component ---

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(docContent[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { id: string; title: string; subtitle: string; group: string }[] = [];
    docContent.forEach(doc => {
      if (doc.title.toLowerCase().includes(q) || doc.group.toLowerCase().includes(q)) {
        results.push({ id: doc.id, title: doc.title, subtitle: doc.sections[0]?.subtitle || '', group: doc.group });
      }
      doc.sections.forEach(sec => {
        if (sec.subtitle.toLowerCase().includes(q) && !results.some(r => r.id === doc.id)) {
          results.push({ id: doc.id, title: doc.title, subtitle: sec.subtitle, group: doc.group });
        }
      });
    });
    return results;
  }, [searchQuery]);

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const section of docContent) {
        const element = document.getElementById(section.id);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          const offsetTop = top + window.scrollY - 200;
          const offsetBottom = bottom + window.scrollY - 200;
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 120, behavior: 'smooth' });
      setActiveSection(id);
      setIsSidebarOpen(false);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <PageLayout showCopilot={false} hideFooter={true} hideNavbar={true} navbarOffset={false}>
      <div className="bg-slate-50 dark:bg-[#08090d] min-h-screen font-sans text-slate-900 dark:text-slate-200 selection:bg-indigo-500/20 selection:text-indigo-400" dir="rtl">
        
        {/* Top Header */}
        <header className="fixed top-0 inset-x-0 w-full z-50 flex justify-between items-center px-4 lg:px-10 h-16 bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">TOLZY <span className="text-indigo-600 dark:text-indigo-400">Docs</span></span>
                <span className="text-[10px] text-slate-500 font-bold -mt-1">التوثيق الرسمي الموحد</span>
              </div>
            </Link>
          </div>
          
          {/* Quick Search Button */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button 
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl group hover:border-indigo-500/50 hover:bg-white dark:hover:bg-white/10 shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Search className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold">ابحث في التوثيق والميزات...</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-black bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 shadow-xs">
                <Command className="w-3 h-3" /> K
              </div>
            </button>
          </div>

          {/* Navigation Links & Version */}
          <div className="flex items-center gap-3 md:gap-5">
            <Link 
              href="/axiom" 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-black border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-all"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>تجربة AXIOM</span>
            </Link>
            <Link 
              href="/pricing" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-violet-500/20 hover:opacity-90 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>الأسعار والتوكن</span>
            </Link>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex flex-1 pt-16">
          
          {/* Right Sticky Sidebar Navigation */}
          <aside className="hidden lg:flex flex-col bg-white dark:bg-[#0a0b10] fixed right-0 top-16 bottom-0 w-72 border-l border-slate-200 dark:border-white/10 overflow-y-auto scrollbar-thin z-40">
            <div className="p-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">فهرس التوثيق</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOLZY AI 2026</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 py-6 px-3 space-y-6">
              {Object.entries(groupedNav).map(([group, items]) => (
                <div key={group}>
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-3">
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-right transition-all group active:scale-[0.98] ${
                          activeSection === item.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-black shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeSection === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                          <span className="text-xs truncate">{item.title}</span>
                        </div>
                        {item.badge && <Badge variant={item.badge.type}>{item.badge.text}</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
              <Link href="/community" className="w-full flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white py-2.5 rounded-xl text-xs font-black hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-xs">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>انضم لمجتمع TOLZY</span>
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 lg:mr-72 flex justify-center w-full min-w-0">
            <div className="w-full max-w-[840px] px-6 lg:px-12 py-12 md:py-16">
              
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 mb-6 text-xs font-bold text-slate-400">
                <Link href="/" className="hover:text-indigo-600 transition-colors">الرئيسية</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-black">التوثيق الرسمي</span>
              </nav>

              {/* Header Hero */}
              <div className="mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-4 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>دليل المطورين والمهندسين التقني</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                  توثيق ودليل منظومة <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-500 via-violet-500 to-purple-600">TOLZY AI</span>
                </h1>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  الدليل الشامل لاستخدام كافة أدوات وخدمات المنظومة: من مستشار الذكاء الاصطناعي AXIOM وبيئة بناء المشاريع، إلى معالجة الفيديو في OmniLearn ونظام التوكن الموحد.
                </p>
              </div>

              {/* Documentation Sections */}
              <div className="space-y-24 pb-32">
                {docContent.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28 group/section">
                    <div className="flex items-center justify-between pb-4 mb-8 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 shadow-xs">
                          <section.icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                      <button onClick={() => scrollToSection(section.id)} className="opacity-0 group-hover/section:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400" aria-label="رابط القسم">
                         <Hash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-12">
                      {section.sections.map((sub, idx) => (
                        <div key={idx} className="relative pr-8 border-r-2 border-indigo-500/30 dark:border-indigo-500/20">
                          <div className="absolute -right-[13px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                            {idx + 1}
                          </div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{sub.subtitle}</h3>
                          <div className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                            <sub.content />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {/* Left Sticky Table of Contents (XL screens) */}
            <aside className="hidden xl:block w-64 shrink-0 py-16 pl-8">
              <div className="sticky top-28 space-y-6">
                <div>
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">في هذه الصفحة</h5>
                  <ul className="space-y-1 border-r-2 border-slate-200 dark:border-white/10 pr-2">
                    {docContent.map(section => (
                      <li key={`toc-${section.id}`}>
                        <button 
                          onClick={() => scrollToSection(section.id)}
                          className={`block w-full text-right py-1.5 px-2.5 rounded-lg text-xs transition-all ${
                            activeSection === section.id 
                            ? 'text-indigo-600 dark:text-indigo-400 font-black bg-indigo-50/70 dark:bg-indigo-950/40' 
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-bold hover:bg-slate-100/50 dark:hover:bg-white/5'
                          }`}
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Need Help Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200/80 dark:border-indigo-800/40 shadow-sm">
                   <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-3" />
                   <h5 className="font-black text-sm text-slate-900 dark:text-white mb-1.5">هل تحتاج مساعدة؟</h5>
                   <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">فريق TOLZY جاهز للإجابة على كافة استفساراتك التقنية.</p>
                   <Link href="/community" className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                     <span>زيارة المجتمع التقني</span>
                     <ArrowLeft className="w-3.5 h-3.5" />
                   </Link>
                </div>
              </div>
            </aside>
          </main>
        </div>

        {/* Footer */}
        <footer className="w-full py-12 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#07080c] lg:mr-72">
          <div className="max-w-[840px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500">
              <BrainCircuit className="w-4 h-4 text-indigo-500" />
              <span>© {new Date().getFullYear()} TOLZY AI Platform — كافة الحقوق محفوظة</span>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-400">
              <Link href="/pricing" className="hover:text-indigo-600 transition-colors">الأسعار والاشتراكات</Link>
              <Link href="/community" className="hover:text-indigo-600 transition-colors">المجتمع</Link>
              <Link href="/axiom" className="hover:text-indigo-600 transition-colors">AXIOM</Link>
            </div>
          </div>
        </footer>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 bottom-0 z-[60] w-80 bg-white dark:bg-[#090a0f] shadow-2xl p-6 lg:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-base">توثيق TOLZY</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {Object.entries(groupedNav).map(([group, items]) => (
                  <div key={group} className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2">{group}</h3>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button key={item.id} onClick={() => scrollToSection(item.id)} className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-right">
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && <Badge variant={item.badge.type}>{item.badge.text}</Badge>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Live Search Modal */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-md flex items-start justify-center pt-[12vh] px-4"
              onClick={() => setSearchOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }}
                className="w-full max-w-2xl bg-white dark:bg-[#0f111a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 bg-slate-50/50 dark:bg-white/5">
                  <Search className="w-5 h-5 text-indigo-500" />
                  <input 
                    autoFocus 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن AXIOM, Build With AI, OmniLearn, الأسعار..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 dark:text-white font-bold text-base placeholder-slate-400" 
                  />
                  <div className="px-2 py-1 rounded-md bg-slate-200/80 dark:bg-white/10 text-[10px] text-slate-600 dark:text-slate-300 font-mono font-black">ESC</div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-3">
                  {searchQuery.trim() && searchResults.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm font-bold">لا توجد نتائج مطابقة لـ "{searchQuery}"</div>
                  ) : searchQuery.trim() && searchResults.length > 0 ? (
                    <div className="space-y-1.5">
                      {searchResults.map((res, i) => (
                        <button
                          key={i}
                          onClick={() => scrollToSection(res.id)}
                          className="w-full text-right p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/40 transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">{res.group}</span>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{res.title}</h4>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{res.subtitle}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 rtl:rotate-180 transition-transform" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">اقتراحات سريعة للبحث:</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {['AXIOM', 'Build With AI', 'OmniLearn', 'كوبون الخصم', 'الـ API', 'التوكن'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default DocsPage;
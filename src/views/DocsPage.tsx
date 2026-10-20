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
  ShieldCheck, Database, Terminal,
  Sliders, MessageSquare, Mic, Layers, Key,
  ExternalLink, ArrowLeft, CheckCircle2, ChevronRight,
  Package, Heart, Flame, Vote, AtSign, Globe,
  FolderGit2, Award, Compass, Laptop, Cpu
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
  badge?: { text: string; type: 'default' | 'beta' | 'new' | 'live' | 'free' | 'pro' };
  sections: Section[];
}

// --- Visual Components ---

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => {
  const styles: Record<string, string> = {
    default: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
    beta: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
    new: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
    free: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    pro: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
};

const CodeBlock = ({ code, language = 'javascript' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 dark:bg-[#0c0d14] my-6 shadow-sm" dir="ltr">
      <div className="bg-neutral-800/80 dark:bg-[#12141f] px-4 py-2.5 border-b border-neutral-700/60 dark:border-neutral-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Braces className="w-3.5 h-3.5 text-blue-400" />
           <span className="text-[11px] font-mono text-neutral-400 font-bold uppercase tracking-widest">{language}</span>
        </div>
        <button onClick={handleCopy} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/10">
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400 font-sans">تم النسخ</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold font-sans">نسخ</span>
            </>
          )}
        </button>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="text-sm font-mono text-neutral-100 dark:text-[#E2E8F0] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const Callout = ({ type = 'info', title, children }: { type?: 'info' | 'warning' | 'tip' | 'free'; title?: string; children: React.ReactNode }) => {
  const config = {
    info: { icon: Zap, bg: 'bg-blue-50/70 dark:bg-blue-950/20', border: 'border-r-blue-500', text: 'text-blue-950 dark:text-blue-200', iconColor: 'text-blue-600 dark:text-blue-400' },
    warning: { icon: AlertCircle, bg: 'bg-amber-50/70 dark:bg-amber-950/20', border: 'border-r-amber-500', text: 'text-amber-950 dark:text-amber-200', iconColor: 'text-amber-600 dark:text-amber-400' },
    tip: { icon: Lightbulb, bg: 'bg-purple-50/70 dark:bg-purple-950/20', border: 'border-r-purple-500', text: 'text-purple-950 dark:text-purple-200', iconColor: 'text-purple-600 dark:text-purple-400' },
    free: { icon: Sparkles, bg: 'bg-emerald-50/70 dark:bg-emerald-950/25', border: 'border-r-emerald-500', text: 'text-emerald-950 dark:text-emerald-200', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  };
  const { icon: Icon, bg, border, text, iconColor } = config[type];
  return (
    <div className={`p-5 rounded-2xl border-r-4 my-6 flex gap-4 ${bg} ${border} ${text} border border-neutral-200/50 dark:border-white/5 shadow-sm`}>
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
    title: 'مرحباً بك في منصة TOLZY',
    icon: Rocket,
    badge: { text: 'منصة مفتوحة', type: 'free' },
    sections: [
      {
        subtitle: 'ما هي منظومة TOLZY التقنية؟',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              منظومة <strong>TOLZY</strong> هي الدليل والمجتمع العربي المفتوح الأكبر لهندسة البرمجيات بالذكاء الاصطناعي واكتشاف الأدوات التقنية. تم تصميم المنصة برؤية تهدف إلى كسر حواجز الاشتراك وجعل أحدث أدوات وممارسات الذكاء الاصطناعي متاحة للجميع بدون أي قيود مادية أو حواجز دفع.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-blue-500/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-2 font-black text-neutral-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <span>دليل أكثر من 1,000 أداة ذكية</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  فهرس شامل ومصنف لأدوات الذكاء الاصطناعي مع إمكانيات البحث الفوري والمقارنة والتصنيف المتقدم.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-indigo-500/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-2 font-black text-neutral-900 dark:text-white">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <span>مجتمع المطورين وحزم الأدوات</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  مشاركة حزم سير العمل (Tech Stacks)، استطلاعات الرأي التفاعلية، والإشارة الذكية للأدوات داخل المنشورات.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-purple-500/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-2 font-black text-neutral-900 dark:text-white">
                  <BrainCircuit className="w-5 h-5 text-purple-500" />
                  <span>مستشار AXIOM 2.5 Pro</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  مستشار معماري لهندسة الأكواد وحل المشكلات المعقدة والربط بقاعدة المعرفة التقنية.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-2 font-black text-neutral-900 dark:text-white">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  <span>منصة OmniLearn الذكية</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  تفريغ وتحليل الفيديوهات والكورسات واستخراج الملخصات والكويزات التفاعلية والقفز الزمني.
                </p>
              </div>
            </div>

            <Callout type="free" title="مبدأ الوصول المفتوح والمجاني 100% (Zero Friction)">
              تمت إزالة كافة جدران الدفع ونظم التوكن والاشتراكات من منصة TOLZY. يمكنك الآن تصفح كافة الأدوات، إنشاء الحزم، واستخدام كافة المزايا مجاناً وبالكامل.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'community-upgrades',
    group: 'المجتمع التفاعلي',
    title: 'ترقية المجتمع وحزم الأدوات',
    icon: Users,
    badge: { text: 'تحديث جديد', type: 'new' },
    sections: [
      {
        subtitle: '1. الإشارة الذكية للأدوات في المحرر (@Tool Mention)',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              يمكنك الآن كتابة رمز <strong>@</strong> متبوعاً باسم أي أداة من دليل أدوات TOLZY في محرر المنشورات أو التعليقات ليظهر لك صندوق إكمال تلقائي فوري وسريع.
            </p>
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-4 font-mono text-sm" dir="ltr">
              <span className="text-neutral-500">مثال: </span>
              <span className="text-blue-500 font-bold">@[Cursor](cursor)</span>
              <span className="text-neutral-400"> هو أفضل محرر أكواد أستخدمه يومياً</span>
            </div>
            <p className="leading-relaxed text-sm text-neutral-600 dark:text-neutral-300">
              تتحول الأداة تلقائياً في بطاقة المنشور إلى <strong>بطاقة Mini Bento زجاجية</strong> تفاعلية تعرض شعار الأداة، اسمها، شارة التسعير، ورابطاً مباشراً لصفحة تفاصيلها.
            </p>
          </>
        )
      },
      {
        subtitle: '2. منشورات حزم الأدوات التقنية (Tech Stacks)',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              خيار نوع منشور جديد مخصص في المجتمع: <strong>حزمة أدوات (Tech Stack)</strong>. يتيح لك تجميع من 2 إلى 6 أدوات من الدليل توضح سير عملك المتكامل (مثال: *"حزمتي المتكاملة لتصميم الواجهات وبرمجتها بالكامل"*).
            </p>
            <ul className="list-disc pr-6 space-y-2 mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              <li><strong>ملاحظة سير العمل:</strong> كتابة سطر واحد يوضح دور كل أداة في الحزمة (Role in Workflow).</li>
              <li><strong>شبكة Bento Grid تفاعلية:</strong> عرض الحزمة بتصميم شبكي عصري يلفت انتباه أعضاء المجتمع.</li>
              <li><strong>زر نسخ روابط الحزمة:</strong> يتيح لزوار المنشور نسخ كافة روابط أدوات الحزمة بنقرة زر واحدة لمشاركتها وحفظها.</li>
            </ul>
          </>
        )
      },
      {
        subtitle: '3. استطلاعات الرأي ومناظرات "أداة ضد أداة" (Polls & Debates)',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              أداة تصويت تفاعلية مدمجة داخل محرر المنشورات تتيح إضافة من 2 إلى 4 خيارات تصويت، إما نصوص عادية أو ربط خيار التصويت مباشرة بأداة من الدليل لعقد مناظرات مثل: <em>"Cursor vs Windsurf"</em> أو <em>"Midjourney vs Flux"</em>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-xs">
                <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">⚡ أشرطة تقدم حية</span>
                <span className="text-neutral-600 dark:text-neutral-400">حساب فوري للنسب المئوية مع حركات انسيابية ناعمة.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-xs">
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">🔒 تصويت عادل</span>
                <span className="text-neutral-600 dark:text-neutral-400">تقييد التصويت بصوت واحد لكل مستخدم مع حفظ محلي فوري.</span>
              </div>
            </div>
          </>
        )
      },
      {
        subtitle: '4. نقاشات الأدوات ثنائية الاتجاه (Bi-Directional Tool Discussions)',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              تم ربط دليل الأدوات بالمجتمع بشكل ثنائي: عند فتح صفحة أي أداة في الدليل (مثل <code>/tools/chatgpt</code>)، ستجد في أسفل الصفحة قسماً مخصصاً بعنوان:
              <strong> "نقاشات وتجارب المجتمع حول الأداة"</strong> يعرض كافة منشورات وتجارب المطورين التي تذكر هذه الأداة تلقائياً.
            </p>
          </>
        )
      }
    ]
  },
  {
    id: 'creator-profile',
    group: 'الملف التقني للمبدع',
    title: 'الملف التقني الموحد (Creator Tech Profile)',
    icon: Award,
    badge: { text: 'Bento Style', type: 'live' },
    sections: [
      {
        subtitle: 'الهيكل المعماري لملف المبدع التقني',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              صفحة موحدة وعامة لكل صانع ومطور في المجتمع يمكن الوصول إليها عبر الرابط المباشر <code>/community/user/[id]</code> أو المسار القصير <code>/u/[username]</code>.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-neutral-900 dark:text-white">بطاقة الملف الزجاجية (Bento Header)</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">تتضمن الصورة الشخصية، اسم الحساب، النبذة التعريفية، شارة التوثيق، وزر مشاركة الرابط بنقرة واحدة.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-neutral-900 dark:text-white">شريط مؤشرات الأثر (Impact Stats Bar)</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">3 عدادات دقيقة: إجمالي المنشورات، نقاط التأييد المجتمعي (Karma)، وعدد الأدوات الموصى بها.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-neutral-900 dark:text-white">معرض الأدوات التي يستخدمها (Featured Tools Showcase)</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">استخراج تلقائي لكافة الأدوات التي ذكرها المبدع في منشوراته وحزمه وعرضها في شريط أفقي تفاعلي.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-neutral-900 dark:text-white">تبويبات التصفية السريعة (Activity Tabs)</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">تصفية سلسة بين: جميع المنشورات، حزم الأدوات، واستطلاعات الرأي.</p>
                </div>
              </div>
            </div>
          </>
        )
      }
    ]
  },
  {
    id: 'tools-directory',
    group: 'دليل الأدوات',
    title: 'دليل أدوات الذكاء الاصطناعي (+1000 أداة)',
    icon: BookOpen,
    badge: { text: '+1000 أداة', type: 'live' },
    sections: [
      {
        subtitle: 'البحث والاستكشاف والفلترة الذكية',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              يحتوي دليل TOLZY على أكثر من ألف أداة ذكاء اصطناعي مفهرسة بدقة، تغطي مختلف المجالات الهندسية والتقنية:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 text-xs font-bold text-neutral-700 dark:text-neutral-300">
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-500" />
                <span>البرمجة والأكواد</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>التصميم والرسوم</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                <Play className="w-4 h-4 text-rose-500" />
                <span>الفيديو والأنيميشن</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-500" />
                <span>الصوتيات والموسيقى</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>الإنتاجية والأتمتة</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500" />
                <span>التسويق والأعمال</span>
              </div>
            </div>
            <Callout type="tip" title="تصفية حسب نموذج التسعير">
              يمكنك فرز الأدوات حسب: مجانية بالكامل (Free)، تجريبية مجانية (Freemium)، أو مدفوعة (Paid)، لمساعدتك في العثور على الأداة الأنسب لميزانيتك.
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
              يمثل <strong>TOLZY AXIOM 2.5 Pro</strong> النواة الاستشارية الذكية للمنصة، حيث يعمل كمهندس معماري تقني (Principal Software Architect) للإجابة على التساؤلات البرمجية وبناء المعماريات السحابية الرصينة.
            </p>
            <h4 className="font-bold text-neutral-900 dark:text-white mb-2">⚡ أوضاع التفاعل المتخصصة:</h4>
            <ul className="list-disc pr-6 space-y-2 mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              <li><strong>الوضع العام (@عام):</strong> استشارات تقنية شاملة وتحليل استراتيجيات المنتجات الرقمية.</li>
              <li><strong>وضع البرمجة والهندسة (@برمجة):</strong> توليد أكواد TypeScript, Next.js, React, Supabase, Python عالية الجودة وجاهزة للإنتاج.</li>
              <li><strong>وضع الأدوات (@أدوات):</strong> استرجاع واقتراح أفضل الأدوات من دليل المنصة وربطها بروابط مباشرة.</li>
              <li><strong>وضع التعلم (@تعلم):</strong> تبسيط المفاهيم البرمجية والهندسية المعقدة بأسلوب تعليمي متدرج.</li>
            </ul>
            <Callout type="info" title="التسجيل والإدخال الصوتي اللحظي 🎙️">
              يدعم AXIOM محرك إدخال صوتي لحظي يتعرف على الصوت باللغتين العربية والإنجليزية بدقة تامة لتسهيل طرح استفساراتك دون الحاجة للكتابة اليدوية.
            </Callout>
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
        subtitle: 'تحويل الأفكار إلى منتجات ومشاريع جاهزة للتنفيذ',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              أداة <strong>Build With AI</strong> هي بيئة معمارية متطورة تمكنك من كتابة فكرة أي موقع أو تطبيق أو أداة SaaS باللغة العربية، لتتولى المنظومة هندستها وتوليد مخطط برمجي وتجاري متكامل يشمل:
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-neutral-900 dark:text-white">1. دراسة الجدوى والقيمة التنافسية</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">تحديد الجمهور المستهدف بدقة، ونقاط الألم الجوهرية، والميزة التنافسية الفريدة (Moat).</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-neutral-900 dark:text-white">2. مخطط Supabase SQL جاهز للتشغيل</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">كود SQL كامل يشمل الجداول، العلاقات، والمفاتيح، وسياسات أمان Row Level Security (RLS).</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-neutral-900 dark:text-white">3. برومبتات مخصصة لـ Cursor و Claude و v0</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">برومبتات مهندسة بدقة فائقة لتوليد الواجهات والباك إند بضغطة زر واحدة بدون تخمين.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-neutral-900 dark:text-white">4. وثيقة متطلبات المنتج الكاملة (PRD Document)</h5>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">ملف PRD بصيغة Markdown قابل للتصدير والطباعة ومشاركته مع فريق العمل أو المستثمرين.</p>
                </div>
              </div>
            </div>
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
    badge: { text: 'فيديو وكورسات', type: 'new' },
    sections: [
      {
        subtitle: 'المعالجة العميقة لمحتوى الفيديوهات والمساقات التعليمية',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              منصة <strong>OmniLearn</strong> تحول أي رابط فيديو يوتيوب أو مساق تعليمي إلى بيئة دراسة تفاعلية متكاملة:
            </p>
            <ul className="list-disc pr-6 space-y-2 mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              <li><strong>الملخص التنفيذي والأفكار الرئيسية:</strong> استخراج أهم المفاهيم في نقاط موجزة ومدعومة بالأمثلة.</li>
              <li><strong>البطاقات التعليمية التفاعلية (Flashcards):</strong> للمراجعة السريعة وتثبيت المعلومات التقنية.</li>
              <li><strong>كويزات واختبارات تفاعلية ذكية (Smart Quizzes):</strong> أسئلة متعددة الخيارات مع شرح أسباب الإجابة الصحيحة.</li>
              <li><strong>محادثة ذكية مع القفز الزمني (Timestamp Navigation):</strong> اسأل عن أي جزئية واضغط على الوقت للانتقال للثانية المحددة في الفيديو.</li>
            </ul>
          </>
        )
      }
    ]
  },
  {
    id: 'api-sdk',
    group: 'للمطورين',
    title: 'التكامل البرمجي وواجهات API',
    icon: Code,
    badge: { text: 'REST API', type: 'new' },
    sections: [
      {
        subtitle: 'الربط البرمجي واستدعاء واجهات TOLZY',
        content: () => (
          <>
            <p className="leading-relaxed mb-4">
              يمكن للمطورين دمج إمكانيات مجتمع TOLZY ودليل الأدوات واستشارات AXIOM داخل تطبيقاتهم عبر واجهات RESTful قياسية:
            </p>
            <CodeBlock language="typescript" code={`// مثال استدعاء TOLZY API عبر TypeScript / Next.js
const response = await fetch('https://tolzy.me/api/tools/search?q=cursor', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});

const { tools } = await response.json();
console.log('الأدوات المتطابقة:', tools);`} />
            <Callout type="info" title="أمان الطلبات">
              جميع واجهات القراءة العامة في دليل الأدوات والمجتمع متاحة بحرية للزوار وتطبيقات الويب السريعة.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'faq',
    group: 'الأسئلة الشائعة',
    title: 'الأسئلة الأكثر تكراراً والدعم',
    icon: HelpCircle,
    sections: [
      {
        subtitle: 'هل منصة TOLZY مجانية حقاً؟',
        content: () => (
          <p className="leading-relaxed">
            نعم، منصة TOLZY مفتوحة ومجانية 100% للجميع بدون أي جدران دفع أو خطط اشتراك مدفوعة أو اشتراطات توكن. هدفنا تمكين المجتمع التقني العربي بأفضل الأدوات.
          </p>
        )
      },
      {
        subtitle: 'كيف يمكنني مشاركة حزمة أدوات (Tech Stack) في المجتمع؟',
        content: () => (
          <p className="leading-relaxed">
            من صفحة المجتمع، اختر نوع المنشور "حزمة أدوات (Tech Stack)"، ثم اختر من أداتين إلى 6 أدوات من الدليل واكتب ملاحظة سريعة لكل أداة تشرح دورها في سير عملك، ثم انشر الحزمة لتظهر في خلاصات المجتمع وعلى ملفك التقني العام.
          </p>
        )
      },
      {
        subtitle: 'كيف أقوم بإنشاء تصويت ومقارنة بين أداتين؟',
        content: () => (
          <p className="leading-relaxed">
            في محرر منشورات المجتمع، فعّل زر "إضافة تصويت / مقارنة"، وحدد خيارات المقارنة بالبحث في الدليل وربط كل خيار بالأداة المناسبة ليتمكن الأعضاء من التصويت بنقرة واحدة.
          </p>
        )
      },
      {
        subtitle: 'كيف يمكنني التواصل مع الدعم الفني أو المساهمة؟',
        content: () => (
          <p className="leading-relaxed">
            يمكنك التواصل دائماً عبر المجتمع التقني المفتوح أو عبر البريد الإلكتروني الرسمي: <span className="font-mono text-blue-500 font-bold">support@tolzy.me</span>.
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

// --- Main Docs Page Component ---

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
      <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen font-sans text-neutral-900 dark:text-neutral-200 selection:bg-blue-500/20 selection:text-blue-400" dir="rtl">
        
        {/* ─── Top Header (Glassmorphic) ─── */}
        <header className="fixed top-0 inset-x-0 w-full z-50 flex justify-between items-center px-4 lg:px-10 h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
                  TOLZY <span className="text-blue-600 dark:text-blue-400">Docs</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-bold -mt-1">التوثيق الرسمي الشامل</span>
              </div>
            </Link>
          </div>
          
          {/* Quick Search Trigger */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button 
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-xl group hover:border-blue-500/50 hover:bg-white dark:hover:bg-neutral-800 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <Search className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold">ابحث في التوثيق والمجتمع والميزات...</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-black bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 shadow-xs">
                <Command className="w-3 h-3" /> K
              </div>
            </button>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/community" 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-black border border-blue-200/60 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>المجتمع التقني</span>
            </Link>
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-blue-500/20 hover:opacity-90 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>دليل الأدوات</span>
            </Link>
          </div>
        </header>

        {/* ─── Workspace Body ─── */}
        <div className="flex flex-1 pt-16">
          
          {/* Right Sticky Sidebar Navigation */}
          <aside className="hidden lg:flex flex-col bg-white dark:bg-neutral-900/95 fixed right-0 top-16 bottom-0 w-72 border-l border-neutral-200/80 dark:border-neutral-800 overflow-y-auto scrollbar-thin z-40">
            <div className="p-6 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-neutral-900 dark:text-white">فهرس التوثيق</h2>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">مفتوح ومجاني 100%</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 py-6 px-3 space-y-6">
              {Object.entries(groupedNav).map(([group, items]) => (
                <div key={group}>
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 px-3">
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-right transition-all group active:scale-[0.98] ${
                          activeSection === item.id
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-black shadow-xs'
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${activeSection === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'}`} />
                          <span className="text-xs truncate">{item.title}</span>
                        </div>
                        {item.badge && <Badge variant={item.badge.type}>{item.badge.text}</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
              <Link 
                href="/community" 
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white py-2.5 rounded-xl text-xs font-black hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-xs"
              >
                <Users className="w-4 h-4 text-blue-500" />
                <span>انضم لمجتمع TOLZY المفتوح</span>
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 lg:mr-72 flex justify-center w-full min-w-0">
            <div className="w-full max-w-[840px] px-6 lg:px-12 py-12 md:py-16">
              
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 mb-6 text-xs font-bold text-neutral-400">
                <Link href="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
                <span>/</span>
                <span className="text-neutral-900 dark:text-white font-black">التوثيق الرسمي</span>
              </nav>

              {/* Header Hero */}
              <div className="mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-black mb-4 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>دليل المطورين والمهندسين الشامل</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight mb-4">
                  توثيق ودليل منظومة <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 via-indigo-600 to-purple-600">TOLZY</span>
                </h1>
                <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                  الدليل المرجعي الكامل لمنظومة TOLZY: مجتمع المطورين التفاعلي، حزم الأدوات التقنية (Tech Stacks)، دليل أكثر من 1,000 أداة، ومستشار الذكاء الاصطناعي AXIOM.
                </p>
              </div>

              {/* Documentation Sections */}
              <div className="space-y-24 pb-32">
                {docContent.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28 group/section">
                    <div className="flex items-center justify-between pb-4 mb-8 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/30 shadow-xs">
                          <section.icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                      <button onClick={() => scrollToSection(section.id)} className="opacity-0 group-hover/section:opacity-100 transition-opacity p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400" aria-label="رابط القسم">
                         <Hash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-12">
                      {section.sections.map((sub, idx) => (
                        <div key={idx} className="relative pr-8 border-r-2 border-blue-500/30 dark:border-blue-500/20">
                          <div className="absolute -right-[13px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                            {idx + 1}
                          </div>
                          <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight">{sub.subtitle}</h3>
                          <div className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400 font-medium">
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
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">في هذه الصفحة</h5>
                  <ul className="space-y-1 border-r-2 border-neutral-200 dark:border-neutral-800 pr-2">
                    {docContent.map(section => (
                      <li key={`toc-${section.id}`}>
                        <button 
                          onClick={() => scrollToSection(section.id)}
                          className={`block w-full text-right py-1.5 px-2.5 rounded-lg text-xs transition-all ${
                            activeSection === section.id 
                            ? 'text-blue-600 dark:text-blue-400 font-black bg-blue-50/70 dark:bg-blue-950/40' 
                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 font-bold hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Need Help Card (Bento Style) */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/40 shadow-sm">
                   <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-3" />
                   <h5 className="font-black text-sm text-neutral-900 dark:text-white mb-1.5">مجتمع المطورين المفتوح</h5>
                   <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">شارك حزم أدواتك واستفساراتك مع نخبة المطورين في TOLZY.</p>
                   <Link href="/community" className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                     <span>زيارة المجتمع</span>
                     <ArrowLeft className="w-3.5 h-3.5" />
                   </Link>
                </div>
              </div>
            </aside>
          </main>
        </div>

        {/* ─── Footer ─── */}
        <footer className="w-full py-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 lg:mr-72">
          <div className="max-w-[840px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-black text-neutral-500">
              <BrainCircuit className="w-4 h-4 text-blue-500" />
              <span>© {new Date().getFullYear()} منصة TOLZY — دليل ومجتمع الذكاء الاصطناعي المفتوح</span>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold text-neutral-600 dark:text-neutral-400">
              <Link href="/tools" className="hover:text-blue-600 transition-colors">دليل الأدوات</Link>
              <Link href="/community" className="hover:text-blue-600 transition-colors">المجتمع</Link>
              <Link href="/axiom" className="hover:text-blue-600 transition-colors">AXIOM</Link>
            </div>
          </div>
        </footer>

        {/* ─── Mobile Sidebar Overlay ─── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 bottom-0 z-[60] w-80 bg-white dark:bg-neutral-900 shadow-2xl p-6 lg:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <span className="font-black text-neutral-900 dark:text-white text-base">توثيق TOLZY</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {Object.entries(groupedNav).map(([group, items]) => (
                  <div key={group} className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 px-2">{group}</h3>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button key={item.id} onClick={() => scrollToSection(item.id)} className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-bold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-right">
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4 text-blue-500 shrink-0" />
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

        {/* ─── Live Search Modal (Cmd/Ctrl + K) ─── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-neutral-950/60 backdrop-blur-md flex items-start justify-center pt-[12vh] px-4"
              onClick={() => setSearchOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }}
                className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 bg-neutral-50/50 dark:bg-neutral-800/40">
                  <Search className="w-5 h-5 text-blue-500" />
                  <input 
                    autoFocus 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن: حزم الأدوات، المجتمع، AXIOM، الإشارات، OmniLearn..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-neutral-900 dark:text-white font-bold text-base placeholder-neutral-400" 
                  />
                  <div className="px-2 py-1 rounded-md bg-neutral-200/80 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300 font-mono font-black">ESC</div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-3">
                  {searchQuery.trim() && searchResults.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-sm font-bold">لا توجد نتائج مطابقة لـ "{searchQuery}"</div>
                  ) : searchQuery.trim() && searchResults.length > 0 ? (
                    <div className="space-y-1.5">
                      {searchResults.map((res, i) => (
                        <button
                          key={i}
                          onClick={() => scrollToSection(res.id)}
                          className="w-full text-right p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-800/40 transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">{res.group}</span>
                              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{res.title}</h4>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">{res.subtitle}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 rtl:rotate-180 transition-transform" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">مواضيع مقترحة للبحث:</p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {['حزم الأدوات', 'المجتمع', 'ملف المبدع', 'AXIOM', 'Build With AI', 'OmniLearn', 'الـ API'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-colors"
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
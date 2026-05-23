"use client";
import React, { useState, useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { 
  BookOpen, Rocket, HelpCircle, 
  Menu, X, Search, Code, 
  Sparkles, Zap, Check, Copy, Hash, 
  Command, Layout, Lightbulb,
  ArrowUpRight, Play, Braces, AlertCircle
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
  badge?: { text: string; type: 'default' | 'beta' | 'new' | 'live' };
  sections: Section[];
}

// --- Components ---

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => {
  const styles: any = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    beta: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50',
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
    live: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${styles[variant] || styles.default}`}>
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
    <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E0E0E] my-6 shadow-sm" dir="ltr">
      <div className="bg-white dark:bg-[#1A1A1A] px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Braces className="w-3 h-3 text-slate-400" />
           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{language}</span>
        </div>
        <button onClick={handleCopy} className="text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1.5">
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-tighter">نسخ</span>
            </>
          )}
        </button>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-800 dark:text-[#D4D4D4] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const Callout = ({ type = 'info', title, children }: { type?: 'info' | 'warning' | 'tip' | 'error', title?: string, children: React.ReactNode }) => {
  const config = {
    info: { icon: Zap, bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-r-blue-500', text: 'text-blue-900 dark:text-blue-200', iconColor: 'text-blue-600 dark:text-blue-400' },
    warning: { icon: AlertCircle, bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-r-amber-500', text: 'text-amber-900 dark:text-amber-200', iconColor: 'text-amber-600 dark:text-amber-400' },
    tip: { icon: Lightbulb, bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-r-emerald-500', text: 'text-emerald-900 dark:text-emerald-200', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    error: { icon: AlertCircle, bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-r-red-500', text: 'text-red-900 dark:text-red-200', iconColor: 'text-red-600 dark:text-red-400' },
  };
  const { icon: Icon, bg, border, text, iconColor } = config[type];
  return (
    <div className={`p-5 rounded-l-lg border-r-4 my-8 flex gap-4 ${bg} ${border} ${text} shadow-sm`}>
      <div className="mt-0.5 shrink-0">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-bold mb-1 tracking-tight text-[16px]">{title}</h5>}
        <div className="text-[14px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};

// --- Data ---
const docContent: DocContent[] = [
  {
    id: 'intro',
    group: 'مقدمة',
    title: 'مرحباً بك في منظومة Tolzy',
    icon: Rocket,
    sections: [
      {
        subtitle: 'ما هي منظومة Tolzy؟',
        content: () => (
          <>
            <p>منظومة <strong>Tolzy</strong> هي المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم التقني. نمكّن التعليم من خلال الذكاء الاصطناعي ونجعل موارد التعلم عالية الجودة متاحة للجميع. تضم المنصة أكثر من <strong>630 أداة AI</strong>، بمحتوى <strong>100% عربي</strong>، ومجتمع يضم <strong>+2500 مطور ومحترف</strong>. وتشمل الميزات: <strong>Tolzy Copilot V2.5</strong>، بيئة <strong>Tolzy Build</strong>، وصانع الأوامر المتقدم.</p>
            <Callout type="tip" title="ابدأ رحلتك الآن">
              سجّل حساباً مجانياً واستكشف أدواتنا ومواردنا فوراً دون أي تكلفة مسبقة.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'getting-started',
    group: 'البداية',
    title: 'نقطة الانطلاق',
    icon: Play,
    sections: [
      {
        subtitle: 'كيف تبدأ مع Tolzy؟',
        content: () => (
          <>
            <p>لا تحتاج إلى أي خبرة تقنية مسبقة للبدء. اتبع الخطوات التالية:</p>
            <ul className="list-disc pr-5 mt-4 space-y-2">
              <li>أنشئ حساباً مجانياً عبر البريد الإلكتروني أو Google.</li>
              <li>استكشف أكثر من 630 أداة ذكاء اصطناعي مصنّفة بوضوح.</li>
              <li>استخدم <strong>Tolzy Copilot V2.5</strong> للإجابة الفورية على استفساراتك.</li>
              <li>انضم لـ <strong>Tolzy Community</strong> وشارك مع أكثر من +2000, مطور ومحترف.</li>
            </ul>
          </>
        )
      },
      {
        subtitle: 'دمج Tolzy في مشاريعك',
        content: () => (
          <>
            <p>للمطورين الراغبين في دمج قدرات Tolzy داخل تطبيقاتهم، نوفر واجهة API بسيطة وموثّقة:</p>
            <CodeBlock language="bash" code={`npm install @tolzy/sdk`} />
            <Callout type="info" title="ملاحظة">
              مفاتيح API متاحة من لوحة تحكم حسابك بعد التسجيل.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'api-reference',
    group: 'تقني',
    title: 'مرجع الـ API',
    icon: Code,
    badge: { text: 'v2.5', type: 'new' },
    sections: [
      {
        subtitle: 'هيكل الطلب (Request Structure)',
        content: () => (
          <>
            <p>جميع طلبات Tolzy API تعتمد صيغة JSON مع رأس مصادقة إلزامي. يتوافق النظام مع <strong>Tolzy Copilot V2.5</strong> ونماذج OpenRouter المدعومة:</p>
            <CodeBlock language="json" code={`{\n  "Authorization": "Bearer YOUR_TOLZY_API_KEY",\n  "Content-Type": "application/json",\n  "X-Tolzy-Version": "2.5"\n}`} />
            <Callout type="warning" title="أمان مفاتيح API">
              لا تشارك مفتاحك مع أحد ولا ترفعه في كود مفتوح المصدر. استخدم متغيرات البيئة دائماً.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'guides',
    group: 'المصادر',
    title: 'الأدلة والكورسات',
    icon: BookOpen,
    sections: [
      {
        subtitle: 'هندسة المطالبات (Prompt Engineering)',
        content: () => (
          <>
            <p>يوفر Tolzy Community مئات البرومبتات الجاهزة. أما إذا أردت إنشاء برومبتاتك الخاصة، فإليك الصيغة المثلى:</p>
            <ul className="list-disc pr-5 mt-4 space-y-2">
              <li><strong>السياق:</strong> أخبر النموذج من هو وما وضعه.</li>
              <li><strong>المهمة:</strong> حدد ما تريده بدقة.</li>
              <li><strong>القيود:</strong> ضع حدوداً واضحة (الطول، اللغة، الأسلوب).</li>
              <li><strong>المخرجات:</strong> اذكر شكل الإجابة المطلوب (قائمة / فقرة / كود).</li>
            </ul>
            <Callout type="info" title="نصيحة Tolzy">
              استخدم <strong>Tolzy Copilot V2.5</strong> مباشرةً لتحسين برومبتاتك وتطويرها تلقائياً.
            </Callout>
          </>
        )
      }
    ]
  },
  {
    id: 'examples',
    group: 'المصادر',
    title: 'نماذج عملية',
    icon: Layout,
    sections: [
      {
        subtitle: 'تطبيق محادثة بسيط',
        content: () => (
          <>
            <p>هذا نموذج لتطبيق محادثة متكامل باستخدام Tolzy و React:</p>
            <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">React Chat Starter</h4>
                  <p className="text-xs text-slate-500">نموذج جاهز للتحميل والاستخدام</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                عرض الكود <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </>
        )
      }
    ]
  },
  {
    id: 'faq',
    group: 'الدعم',
    title: 'الأسئلة الشائعة',
    icon: HelpCircle,
    sections: [
      {
        subtitle: 'هل المنصة مجانية؟',
        content: () => (
          <>
            <p>نعم! تقدم Tolzy خطة مجانية تتيح الوصول لأكثر من 630 أداة ذكية ومحتوى تعليمي 100% عربي. كما تتوفر خطة <strong>Pro</strong> بميزات متقدمة تشمل طلبات Copilot غير محدودة، والوصول لنماذج الذكاء الاصطناعي الأقوى.</p>
            <Callout type="tip" title="خطة Pro">
              ترقّ لـ Pro واحصل على تجربة Copilot غير محدودة مع أولوية في الاستجابة وأقوى النماذج.
            </Callout>
          </>
        )
      },
      {
        subtitle: 'ما هو Tolzy Copilot V2.5؟',
        content: () => (
          <p>Tolzy Copilot V2.5 هو المساعد الذكي الرسمي للمنصة، يعمل بنموذج <strong>Gemini 2.5 Flash Lite</strong> مع دعم كامل للغة العربية. يمكنه الإجابة على أسئلتك، اقتراح الأدوات، والمساعدة في كتابة الكود وبناء المشاريع.
          </p>
        )
      },
      {
        subtitle: 'ما هو Tolzy Community؟',
        content: () => (
          <p>مجتمع تولزي هو المكان الذي يشارك فيه أكثر من 350,000 مستخدم عربي برومبتاتهم وأكوادهم وأفكارهم. يمكنك نشر منشوراتك، التصويت على الأفضل، وحفظ ما يعجبك لاستخدامه لاحقاً.</p>
        )
      }
    ]
  }
];

const groupedNav = docContent.reduce((acc: any, item) => {
  if (!acc[item.group]) acc[item.group] = [];
  acc[item.group].push(item);
  return acc;
}, {});

// --- Main Page Component ---

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(docContent[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
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

  // Keyboard shortcut
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
      window.scrollTo({ top: element.offsetTop - 140, behavior: 'smooth' });
      setActiveSection(id);
      setIsSidebarOpen(false);
    }
  };

  return (
    // ملاحظة: قمنا بتمرير خصائص hideFooter و hideNavbar للمكون الخارجي لإخفائهما
    <PageLayout showCopilot={false} hideFooter={true} hideNavbar={true} navbarOffset={false}>
      <div className="bg-white dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-200 selection:bg-indigo-100 selection:text-indigo-900" dir="rtl">
        
        {/* Internal Top Header (Fixed at top-0 since external is hidden) */}
        <header className="fixed top-0 inset-x-0 w-full z-50 flex justify-between items-center px-6 lg:px-10 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-all active:scale-95">
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">مستندات Tolzy</span>
            </div>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button 
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md group hover:border-indigo-600 dark:hover:border-indigo-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">ابحث في التوثيق...</span>
              </div>
              <div className="flex items-center gap-1 opacity-60 text-[10px] font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                <Command className="w-2.5 h-2.5" /> K
              </div>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden sm:inline-block text-[11px] font-mono font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shadow-inner">v2.5.0</span>
            <div className="hidden md:flex items-center gap-5">
              <Link href="https://github.com/tolzy" className="text-slate-500 hover:text-indigo-600 transition-colors">
                <Code className="w-5 h-5" />
              </Link>
              <button className="text-slate-500 hover:text-indigo-600 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Adjust pt-16 because the header is exactly 16 (64px) tall */}
        <div className="flex flex-1 pt-16">
          
          {/* Right Sidebar Navigation (Starts exactly below the header) */}
          <aside className="hidden lg:flex flex-col bg-slate-50 dark:bg-slate-900/40 fixed right-0 top-16 bottom-0 w-72 border-l border-slate-200 dark:border-slate-800 overflow-y-auto scrollbar-hide z-40">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                  <Code className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">المستندات</h2>
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-1">دليل المطور</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 py-8">
              {Object.entries(groupedNav).map(([group, items]: any) => (
                <div key={group} className="mb-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 px-8">
                    {group}
                  </h3>
                  <div className="px-3 space-y-1">
                    {items.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center justify-between px-5 py-3 rounded-md transition-all group active:scale-[0.98] ${
                          activeSection === item.id
                            ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-r-4 border-indigo-600 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeSection === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:opacity-100'}`} />
                          <span className="text-[14px]">{item.title}</span>
                        </div>
                        {item.badge && <Badge variant={item.badge.type}>{item.badge.text}</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <Link href="/community" className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-3 rounded-md text-sm font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 mb-6 shadow-sm">
                <span>انضم للمجتمع</span>
              </Link>
              <div className="flex justify-around">
                <Link href="#" className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors group">
                  <Code className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest">جيت هاب</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors group">
                  <HelpCircle className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                  <span className="text-[10px] font-black uppercase tracking-widest">الدعم</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:mr-72 flex justify-center w-full">
            <div className="w-full max-w-[800px] px-8 lg:px-16 py-20">
              
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 mb-8 text-[12px] font-black text-slate-400 uppercase tracking-widest">
                <Link href="#" className="hover:text-indigo-600 transition-colors">المستندات</Link>
                <span className="opacity-30">/</span>
                <span className="text-slate-900 dark:text-white">الدليل</span>
              </nav>

              {/* Update Notice */}
              <div className="mb-12 p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-indigo-900 dark:text-indigo-300 text-lg mb-1">جاري العمل على الموقع! 🚀</h3>
                  <p className="text-indigo-800/80 dark:text-indigo-200/80 text-sm leading-relaxed font-medium">
                    نحن نقوم حالياً بتحديث وإضافة التوثيقات الجديدة بسبب إضافة دعم <strong>API KEY</strong> لتجربة الميزة القادمة <strong>TOLZY V3</strong>. شكراً لتفهمكم.
                  </p>
                </div>
              </div>

              <div className="mb-24">
                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
                  توثيق منظومة Tolzy
                </h1>
                <p className="text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم التقني. دليلك الشامل من الأدوات (630+) إلى Copilot V2.5 وبيئة بناء المشاريع.
                </p>
              </div>

              <div className="space-y-32 pb-40">
                {docContent.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-32 group/section">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-10 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      {section.title}
                      <button onClick={() => scrollToSection(section.id)} className="opacity-0 group-hover/section:opacity-100 transition-opacity">
                         <Hash className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      </button>
                    </h2>

                    <div className="space-y-20">
                      {section.sections.map((sub, idx) => (
                        <div key={idx} className="relative pr-10 border-r-2 border-slate-200 dark:border-slate-800 group/step">
                          <div className="absolute -right-[17px] top-0 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm transition-transform group-hover/step:scale-110 group-hover/step:bg-indigo-600 group-hover/step:text-white group-hover/step:border-indigo-600">
                            <span className="text-[12px] font-black text-slate-500 group-hover/step:text-white">{idx + 1}</span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{sub.subtitle}</h3>
                          <div className="text-[17px] leading-8 text-slate-600 dark:text-slate-400 font-medium">
                            <sub.content />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {/* Left Sidebar (Table of Contents) */}
            <aside className="hidden xl:block w-72 shrink-0 py-20 pl-10">
              <div className="sticky top-32">
                <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">في هذه الصفحة</h5>
                <ul className="space-y-1 border-r-2 border-slate-100 dark:border-slate-800/60">
                  {docContent.map(section => (
                    <li key={`toc-${section.id}`}>
                      <button 
                        onClick={() => scrollToSection(section.id)}
                        className={`block w-full text-right pr-6 py-2 text-[14px] transition-all border-r-2 -mr-[2px] ${
                          activeSection === section.id 
                          ? 'text-indigo-600 font-black border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:border-slate-300'
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-20 p-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
                   <Sparkles className="w-6 h-6 text-indigo-600 mb-5" />
                   <h5 className="font-black text-base text-slate-900 dark:text-white mb-3 tracking-tight">تحتاج مساعدة؟</h5>
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">فريق Tolzy جاهز للمساعدة في أي تحدي تقني أو استفسار.</p>
                   <button className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 uppercase tracking-widest transition-colors">
                     تواصل مع الدعم <ArrowUpRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </aside>
          </main>
        </div>

        {/* Internal Footer */}
        <footer className="w-full py-16 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 lg:mr-72">
          <div className="max-w-[800px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500">
              © {new Date().getFullYear()} Tolzy AI PBC
            </p>
            <div className="flex gap-8">
              <Link href="#" className="text-[12px] font-black text-slate-600 hover:text-indigo-600 underline underline-offset-8 decoration-slate-200 transition-all">سياسة الخصوصية</Link>
              <Link href="#" className="text-[12px] font-black text-slate-600 hover:text-indigo-600 underline underline-offset-8 decoration-slate-200 transition-all">شروط الاستخدام</Link>
              <Link href="#" className="text-[12px] font-black text-slate-600 hover:text-indigo-600 underline underline-offset-8 decoration-slate-200 transition-all">الأمان</Link>
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
                className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm lg:hidden"
              />
              <motion.aside 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="fixed top-0 right-0 bottom-0 z-[60] w-80 bg-white dark:bg-slate-950 shadow-2xl p-8 lg:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Code className="w-6 h-6" />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl">مستندات Tolzy</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {Object.entries(groupedNav).map(([group, items]: any) => (
                  <div key={group} className="mb-10">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5 px-2">{group}</h3>
                    <div className="space-y-1">
                      {items.map((item: any) => (
                        <button key={item.id} onClick={() => scrollToSection(item.id)} className="w-full flex items-center gap-4 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 font-black rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                          <item.icon className="w-5 h-5 text-slate-400" /> {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Search Modal */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
              onClick={() => setSearchOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-700 overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                  <Search className="w-6 h-6 text-slate-400" />
                  <input autoFocus type="text" placeholder="ابحث في التوثيق..." className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-100 font-bold text-lg" />
                  <div className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 font-mono font-black border border-slate-200 dark:border-slate-700">ESC</div>
                </div>
                <div className="p-16 text-center text-slate-500 text-base italic font-medium">ابدأ الكتابة للبحث في التوثيق...</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default DocsPage;
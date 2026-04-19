"use client";
import React, { useState, useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { BookOpen, Rocket, Wrench, Brain, Settings, HelpCircle, ChevronRight, Menu, X } from 'lucide-react';

const defaultContent = [
  {
    id: 'getting-started',
    title: 'نقطة البداية (Getting Started) 🚀',
    icon: Rocket,
    sections: [
      {
        subtitle: 'مقدمة عن المنظومة',
        content: 'إيه هي الأدوات المتاحة وإزاي بتكمل بعض؟ منظومة Tolzy صُممت لتكون محطة واحدة لكل أدوات الذكاء الاصطناعي التي تحتاجها، من توليد الأكواد إلى كتابة المحتوى وتنظيم المطالبات، في بيئة متكاملة تضمن أعلى إنتاجية.'
      },
      {
        subtitle: 'إنشاء حساب',
        content: 'خطوات التسجيل بسيطة، يمكنك البدء فوراً باستخدام حساب جوجل الخاص بك أو عبر البريد الإلكتروني بخطوة واحدة لتهيئة مساحة العمل الخاصة بك.'
      },
      {
        subtitle: 'جولة سريعة (Quick Tour)',
        content: 'تعرف على واجهة المستخدم الرئيسية المصممة لتوفير وصول سريع لأهم الأدوات والميزات بضغطة زر واحدة، مع دعم كامل للوضع المظلم.'
      }
    ]
  },
  {
    id: 'products-guide',
    title: 'دليل أدوات المنظومة (Products Guide) 🛠️',
    icon: Wrench,
    sections: [
      {
        subtitle: 'T O L Z Y AI',
        content: 'إزاي تكتب وصف دقيق لتوليد واجهة احترافية؟ قدم وصفاً شاملاً للألوان والتفاصيل الهيكلية.\nكيفية استخدام ميزة المعاينة الحية (Live Preview) لترى النتائج في الوقت الفعلي وتختبر توافقها.\nطريقة نسخ أكواد Tailwind CSS و HTML الجاهزة ودمجها مباشرة في مشاريعك.'
      },
      {
        subtitle: 'Copilot',
        content: 'إزاي تستخدم المساعد الذكي الخاص بنا في كتابة وتحليل الأكواد أو النصوص المعقدة بسهولة.\nكيفية الاستفادة من السياق (Context) في المحادثات للحصول على إجابات دقيقة واحترافية.'
      },
      {
        subtitle: 'Prompts Manager',
        content: 'إزاي تحفظ، تصنف، وتنظم المطالبات الخاصة بك للرجوع إليها مستقبلاً.\nكيفية استدعاء أي مطالبة محفوظة مسبقاً بسرعة دون الحاجة لكتابتها من الصفر.'
      }
    ]
  },
  {
    id: 'prompt-engineering',
    title: 'فن كتابة المطالبات (Prompt Engineering) 🧠',
    icon: Brain,
    sections: [
      {
        subtitle: 'هيكلة المطالبة المثالية',
        content: 'إزاي توضح السياق، المهمة، والنتيجة المطلوبة خطوة بخطوة للحصول على استجابة مثالية وخالية من الغموض.'
      },
      {
        subtitle: 'أمثلة عملية (Best Practices)',
        content: 'مقارنة توضيحية:\nمطالبة ضعيفة: "اصنع زرار"\nمطالبة احترافية: "صمم زرار متجاوب بتصميم حديث باستخدام Tailwind CSS مع تأثير Glassmorphism وتأثيرات مرور המאوس (Hover)."'
      },
      {
        subtitle: 'قوالب جاهزة (Templates)',
        content: 'نوفر لك مجموعة ضخمة من المطالبات الجاهزة للنسخ لتتمكن من البدء فوراً للحصول على أفضل النتائج بأقل جهد مُمكّن.'
      }
    ]
  },
  {
    id: 'account-settings',
    title: 'إدارة الحساب والإعدادات (Account & Settings) ⚙️',
    icon: Settings,
    sections: [
      {
        subtitle: 'الخطط والاشتراكات (Billing)',
        content: 'شرح شامل للفروق بين الباقات المجانية والمدفوعة، بالإضافة إلى توضيح حدود الاستخدام وميزات كل باقة بالتفصيل.'
      },
      {
        subtitle: 'إدارة مساحة العمل',
        content: 'كيفية تغيير البريد الإلكتروني المرتبط بحسابك، وضبط إعدادات المظهر بما في ذلك التبديل التلقائي بين الوضعين الفاتح والداكن (Dark/Light Mode).'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'الأسئلة الشائعة واستكشاف الأخطاء (Troubleshooting) ❓',
    icon: HelpCircle,
    sections: [
      {
        subtitle: 'ليه الكود مش بيظهر بشكل كامل؟',
        content: 'الحل: يعود ذلك في الغالب إلى حدود استجابة النماذج (Token limits). يمكنك طلب استكمال الكود أو تقسيمه إلى أجزاء أصغر.'
      },
      {
        subtitle: 'حل مشاكل تسجيل الدخول',
        content: 'إذا واجهت أخطاء، تأكد من مسح الـ Cache أو تجربة تسجيل الدخول من خلال نافذة متصفح خفي (Incognito Mode).'
      },
      {
        subtitle: 'طلب المساعدة الفنية',
        content: 'إزاي أتواصل مع الدعم الفني لو واجهتني مشكلة معقدة؟ يمكنك استخدام صفحة "تواصل معنا" أو مراسلتنا عبر القنوات الرسمية وسنقوم بالرد في أسرع وقت.'
      }
    ]
  }
];

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(defaultContent[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of defaultContent) {
        const element = document.getElementById(section.id);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          const offsetTop = top + window.scrollY - 150;
          const offsetBottom = bottom + window.scrollY - 150;

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
      setActiveSection(id);
      setIsSidebarOpen(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden sticky top-20 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            فهرس التوثيق
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-10 relative">
          
          {/* Sidebar Navigation */}
          <aside className={`
            ${isSidebarOpen ? 'block' : 'hidden'} 
            lg:block fixed lg:sticky top-[140px] lg:top-32 left-0 right-0 lg:w-80 h-[calc(100vh-140px)] 
            bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent z-30 lg:z-auto
            overflow-y-auto p-4 lg:p-0 shadow-2xl lg:shadow-none border-t lg:border-none border-slate-200 dark:border-slate-800
          `}>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 dark:text-white mb-6 px-4 text-lg">
                محتويات الدليل
              </h3>
              {defaultContent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-right flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.title.split(' (')[0]}</span>
                  </div>
                  {activeSection === item.id && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 mx-4 lg:mx-0">
              <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">تحتاج مساعدة إضافية؟</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                إذا لم تجد ما تبحث عنه هنا، فريق الدعم الخاص بنا مستعد دائماً لمساعدتك في أي وقت.
              </p>
              <a href="/contact" className="inline-flex w-full justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors">
                تواصل معنا
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 w-full max-w-4xl pb-24">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                التوثيق الشامل لـ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">T O L Z Y AI</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                أهلاً بك في الدليل الرسمي لمنصة Tolzy. ستجد هنا كل ما تحتاجه لاحتراف أدوات الذكاء الاصطناعي وبناء مشاريعك بكفاءة وسرعة.
              </p>
            </div>

            <div className="space-y-16">
              {defaultContent.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <section.icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {section.sections.map((sub, index) => (
                      <div 
                        key={index}
                        className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          {sub.subtitle}
                        </h3>
                        <div className="text-slate-600 dark:text-slate-400 leading-loose prose dark:prose-invert">
                          {sub.content.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-2 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </PageLayout>
  );
};

export default DocsPage;

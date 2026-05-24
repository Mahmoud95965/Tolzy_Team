"use client";
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { FileText, CheckCircle, AlertTriangle, UserX, Scale, Shield, Landmark } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900/50 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
        {/* Decorative background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header/Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex p-4 bg-amber-500/10 dark:bg-amber-500/20 rounded-3xl border border-amber-500/20 shadow-inner mb-6 relative group">
              <div className="absolute inset-0 bg-amber-500/20 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FileText className="h-12 w-12 text-amber-600 dark:text-amber-400 relative z-10" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              شروط وأحكام الاستخدام
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              مرحباً بك في Tolzy. تحكم هذه الشروط استخدامك لمنصتنا وأدواتنا التعليمية. نرجو قراءتها بعناية لضمان تجربة تعليمية آمنة وممتازة للجميع.
            </p>
            <div className="mt-4 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 inline-block px-3 py-1 rounded-full border border-amber-500/20 select-none">
              آخر تحديث: مايو 2026
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* Section 1: قبول الشروط */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Scale className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">قبول الشروط والأحكام</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[14px]">
                باستخدامك لمنصة Tolzy أو تسجيل الدخول إليها أو الاستفادة من الميزات التعليمية المتاحة، فإنك توافق بكامل أهليتك القانونية على الالتزام الفوري بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، نرجو التوقف عن استخدام خدماتنا حمايةً لمصالحك.
              </p>
            </div>

            {/* Section 2: حسابات المستخدمين */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <UserX className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">حسابات وتأمين المستخدمين</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-[14px]">
                عند التسجيل وإنشاء حسابك الشخصي على منصتنا، يجب مراعاة الشروط التالية:
              </p>
              <ul className="space-y-3 text-[13.5px] text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>يجب تقديم معلومات شخصية دقيقة وكاملة والتحديث عند الحاجة.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>تتحمل كامل المسؤولية عن سرية تفاصيل حسابك وكلمة المرور الخاصة بك.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>يحق لنا تعليق أو إلغاء حسابك فوراً إذا تم الكشف عن أي سلوك انتهاكي أو احتيالي.</span>
                </li>
              </ul>
            </div>

            {/* Section 3: استخدام المنصة والسلوك المحظور */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">الاستخدام المسؤول والسلوك المحظور</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-[14px]">
                يجب استخدام منصة Tolzy بطرق مشروعة وأخلاقية، ويُحظر بشكل قاطع القيام بما يلي:
              </p>
              <ul className="space-y-3 text-[13.5px] text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>نشر، إرسال، أو ترويج أي محتوى غير قانوني، مسيء، أو ينتهك الآداب العامة.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>انتهاك حقوق الملكية الفكرية الخاصة بنا أو بأي مستخدم أو متعلم آخر.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>محاولة اختراق النظام، أو استغلال ثغرات أمنية، أو إرسال هجمات حجب خدمة.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>إساءة استخدام أدوات وموارد وخوادم الذكاء الاصطناعي التابعة للمنصة بشكل مفرط.</span>
                </li>
              </ul>
            </div>

            {/* Section 4: الملكية الفكرية */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">الملكية الفكرية والعلامات التجارية</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[14px]">
                جميع المواد والبيانات المتاحة على منصة Tolzy، بما يشمل الأكواد البرمجية، التصاميم البصرية، المقالات والدروس، الشعارات التجارية، والبرمجيات، هي ملك حصري ومحمي لـ Tolzy أو الجهات المرخصة لنا. يُمنع منعاً باتاً نسخ أو إعادة توزيع أو استخدام أي محتوى تجاري خاص بنا دون إذن مسبق وصريح منا.
              </p>
            </div>

            {/* Section 5: إخلاء المسؤولية القانونية */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">إخلاء المسؤولية القانونية وحماية الخدمة</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[14px]">
                يتم تقديم منصة Tolzy وجميع أدوات الذكاء الاصطناعي والكورسات المرتبطة بها "كما هي" وبحالتها الراهنة دون أي ضمانات صريحة أو ضمنية بالاستمرارية الدائمة أو الخلو التام من الأخطاء المؤقتة. لا نتحمل المسؤولية القانونية عن أي أضرار مادية، تجارية، أو معنوية ناتجة بشكل مباشر أو غير مباشر عن استخدامك أو عدم قدرتك على استخدام خدماتنا.
              </p>
            </div>

            {/* Section 6: تعديل الشروط */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Landmark className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">تحديث وتعديل الشروط والأحكام</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[14px]">
                نحن نحتفظ بكامل الحق في مراجعة أو تعديل أو استبدال هذه الشروط في أي وقت نراه مناسباً لضمان أفضل تشغيل قانوني وتقني للمنصة. سنقوم بإبلاغ مستخدمينا عبر إشعارات لوحة التحكم أو بالبريد الإلكتروني بأي تغييرات جوهرية تطرأ على هذه الشروط قبل دخولها حيز التنفيذ لتبقوا على دراية تامة بحقوقكم التفاعلية.
              </p>
            </div>

          </div>

          {/* Footer Callout */}
          <div className="bg-amber-900 text-center rounded-3xl p-8 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="relative z-10 max-w-xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-2">هل لديك استفسار حول شروط الاستخدام؟</h3>
              <p className="text-amber-200 text-[13.5px] leading-relaxed mb-5">
                تواصل مع الفريق القانوني وفريق علاقات المتعلمين لمزيد من الاستيضاحات أو الشروحات حول سياسات Tolzy.
              </p>
              <a 
                href="/contact" 
                className="bg-white text-amber-900 px-6 py-2.5 rounded-xl font-bold hover:bg-amber-50 transition-colors shadow-sm inline-block text-xs"
              >
                تواصل مع فريق الدعم الفني
              </a>
            </div>
          </div>

        </div>
      </div>
    </PageLayout >
  );
};

export default TermsPage;

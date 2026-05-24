"use client";
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { Shield, Lock, Eye, FileText, Server, AlertTriangle } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900/50 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
        {/* Decorative background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header/Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-3xl border border-indigo-500/20 shadow-inner mb-6 relative group">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Shield className="h-12 w-12 text-indigo-600 dark:text-indigo-400 relative z-10" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              سياسة الخصوصية والأمان
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              في Tolzy، نضع خصوصية وأمان بياناتك في قمة أولوياتنا. يوضح هذا المستند كيف نجمع بياناتك، ونحميها، ونلتزم بالحفاظ على سريتها.
            </p>
            <div className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 inline-block px-3 py-1 rounded-full border border-indigo-500/20 select-none">
              آخر تحديث: مايو 2026
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* Section 1: جمع المعلومات */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">جمع المعلومات</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-[14px]">
                نحن نجمع فقط المعلومات الضرورية التي تقدمها لنا طواعية عند التفاعل مع المنصة:
              </p>
              <ul className="space-y-3 text-[13.5px] text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>إنشاء حساب على منصتنا (الاسم، البريد الإلكتروني).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>استخدام أدوات الذكاء الاصطناعي والميزات التعليمية.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>التواصل معنا للحصول على الدعم الفني أو الملاحظات.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>الاشتراك في النشرة البريدية لتلقي آخر التحديثات.</span>
                </li>
              </ul>
            </div>

            {/* Section 2: استخدام المعلومات */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">استخدام المعلومات</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-[14px]">
                تُستعمل البيانات التي نجمعها بشكل صارم في المساعدة على تقديم تجربة تعليمية فائقة:
              </p>
              <ul className="space-y-3 text-[13.5px] text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>تطوير وتحسين كفاءة خدماتنا وأدواتنا التعليمية.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>تخصيص وتهيئة محتوى الواجهة ليناسب احتياجاتك كمتعلم.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>إرسال تحديثات النظام الهامة، أو الرد على استفساراتك.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>تقديم دعم فني مخصص وحل مشكلاتك البرمجية والتقنية.</span>
                </li>
              </ul>
            </div>

            {/* Section 3: حماية المعلومات */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Server className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">حماية المعلومات والأمن</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[14px]">
                نحن نطبق بروتوكولات حماية أمنية متقدمة للغاية لضمان سلامة بياناتك الشخصية من أي وصول غير مصرح به أو تسريب أو تعديل. نقوم بتشفير كلمات المرور والبيانات الحساسة بالكامل ونعتمد على أفضل الخدمات السحابية العالمية ذات المعايير العسكرية في الحماية والتكامل لضمان سرية محادثاتك وأدواتك بنسبة 100%.
              </p>
            </div>

            {/* Section 4: مشاركة المعلومات */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">مشاركة المعلومات والطرف الثالث</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-[14px]">
                نحن لا نقوم مطلقاً ببيع، تأجير، أو مشاركة بياناتك الشخصية مع أي شركات أو جهات خارجية لأغراض تجارية، وتقتصر المشاركة فقط على:
              </p>
              <ul className="space-y-3 text-[13.5px] text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>الحالات التي نحصل فيها على موافقتك الصريحة والكاملة.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>عندما نكون ملزمين قانونياً بموجب الأنظمة والقوانين السائدة.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>لحماية مصالح وأمن مستخدمي منصتنا وسلامة خدماتنا.</span>
                </li>
              </ul>
            </div>

            {/* Section 5: ملفات تعريف الارتباط */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">ملفات تعريف الارتباط (Cookies)</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[14px]">
                نستخدم ملفات تعريف الارتباط والتقنيات المشابهة لتحسين تجربتك الشخصية داخل الموقع، مثل حفظ تفضيلات المظهر (داكن/فاتح)، وحفظ الجلسة بشكل آمن لمنع الحاجة لتسجيل الدخول باستمرار. يمكنك بسهولة تعديل إعدادات متصفحك لتعطيل ملفات تعريف الارتباط، لكن ذلك قد يؤدي لتعطيل بعض الميزات الحيوية بالمنصة.
              </p>
            </div>

            {/* Section 6: تحديثات السياسة */}
            <div className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-gray-100 dark:border-slate-700/50 rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">تعديلات وتحديثات السياسة</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[14px]">
                قد نقوم بتحديث سياسة الخصوصية والأمان بشكل دوري لتواكب التحديثات القانونية أو التقنية الجديدة في المنصة. عند حدوث أي تعديلات جوهرية، سنحرص على إخطارك بطرق واضحة مثل البريد الإلكتروني أو من خلال إشعار بارز في لوحة التحكم الخاصة بك لتبقى دائماً على علم تام بخصوصيتك.
              </p>
            </div>

          </div>

          {/* Footer Callout */}
          <div className="bg-indigo-900 text-center rounded-3xl p-8 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="relative z-10 max-w-xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-2">لديك أي استفسار حول الخصوصية؟</h3>
              <p className="text-indigo-200 text-[13.5px] leading-relaxed mb-5">
                فريق الأمان والدعم الفني في Tolzy مستعد دائماً للإجابة على جميع تساؤلاتك ومساعدتك على توفير أقصى درجات الحماية لحسابك.
              </p>
              <a 
                href="/contact" 
                className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm inline-block text-xs"
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

export default PrivacyPolicyPage;

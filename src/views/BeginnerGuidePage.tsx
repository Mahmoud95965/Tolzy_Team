"use client";
import React from 'react';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import {
  Search,
  Sparkles,
  ArrowRight,
  Target,
  Lightbulb,
  GraduationCap
} from 'lucide-react';

interface GuideStep {
  title: string;
  description: string;
  icon: JSX.Element;
}

interface FAQ {
  question: string;
  answer: string;
}

const BeginnerGuidePage: React.FC = () => {

  const steps: GuideStep[] = [
    {
      title: 'استكشف الأدوات',
      description: 'تصفح مجموعتنا من أدوات الذكاء الاصطناعي المختارة بعناية للتعليم. يمكنك البحث حسب الفئة أو نوع الأداة.',
      icon: <Search className="h-6 w-6 text-indigo-600" />
    },
    {
      title: 'اختر الأداة المناسبة',
      description: 'قارن بين الأدوات واقرأ التقييمات لاختيار الأداة التي تناسب احتياجاتك التعليمية.',
      icon: <Target className="h-6 w-6 text-teal-600" />
    },
    {
      title: 'ابدأ باستخدام الأداة',
      description: 'اتبع دليلنا المفصل لبدء استخدام الأداة وتحقيق أقصى استفادة منها.',
      icon: <Lightbulb className="h-6 w-6 text-amber-600" />
    },
    {
      title: 'طور مهاراتك',
      description: 'استخدم الأداة بانتظام وتابع نصائحنا للتحسين المستمر في تعلمك.',
      icon: <GraduationCap className="h-6 w-6 text-purple-600" />
    }
  ];

  const faqs: FAQ[] = [
    {
      question: "كيف أختار الأداة المناسبة لاحتياجاتي؟",
      answer: "ابدأ بتحديد هدفك التعليمي، ثم استخدم فلاتر البحث لتصفية الأدوات حسب الفئة والسعر. اقرأ تقييمات المستخدمين واختر أداة تناسب مستواك وميزانيتك."
    },
    {
      question: "هل جميع الأدوات مجانية؟",
      answer: "نقدم مجموعة متنوعة من الأدوات، بعضها مجاني بالكامل، وبعضها يقدم نسخة مجانية مع ميزات إضافية مدفوعة، وأخرى تتطلب اشتراكًا."
    },
    {
      question: "هل يمكنني مشاركة الأدوات مع زملائي؟",
      answer: "نعم، يمكنك بسهولة مشاركة أي أداة مع أصدقائك وزملائك عبر مشاركة الرابط مباشرة."
    }
  ];

  return (
    <PageLayout>
      <div className="bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white py-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-indigo-400 blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/3 right-1/3 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-teal-400 blur-3xl animate-pulse-slow delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center w-full mb-6">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-indigo-100 bg-opacity-20 backdrop-blur-sm rounded-full">
                  <Sparkles className="h-5 w-5 text-amber-300 ml-2 animate-wiggle" />
                  <span className="text-amber-300 text-sm sm:text-base font-medium">خطوة بخطوة نحو التعلم الذكي</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
                دليل المبتدئين لاستخدام أدوات الذكاء الاصطناعي في التعليم
              </h1>

              <p className="text-xl text-indigo-100 text-center max-w-3xl mx-auto mb-8">
                سنساعدك في اختيار واستخدام أفضل أدوات الذكاء الاصطناعي لتحسين تجربتك التعليمية
              </p>

              <div className="flex justify-center">
                <Link
                  href="/tools"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-indigo-600 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span>استكشف الأدوات</span>
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
              كيف تبدأ؟
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-center mb-4 w-12 h-12 rounded-full bg-indigo-100 mx-auto">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
              ))}
            </div>          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">{faq.question}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <Link href="/tools">
            <button className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              <span>ابدأ استكشاف الأدوات</span>
              <ArrowRight className="mr-2 w-5 h-5" />
            </button>
          </Link>
        </section>
      </div>
    </PageLayout>
  );
};

export default BeginnerGuidePage;

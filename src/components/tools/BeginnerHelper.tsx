'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Lightbulb, 
  X, 
  Sparkles,
  Target,
  GraduationCap,
  Wand2,
  ArrowLeft
} from 'lucide-react';

interface QuickCategory {
  name: string;
  icon: React.ReactNode;
  description: string;
  link: string;
  color: string;
}

const quickCategories: QuickCategory[] = [
  {
    name: 'للطلاب',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'تعليم ودراسة وأبحاث',
    link: '/tools?category=Education',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  {
    name: 'للبرمجة',
    icon: <Wand2 className="w-5 h-5" />,
    description: 'أدوات المبرمجين والمطورين',
    link: '/tools?category=Programming',
    color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'
  },
  {
    name: 'للتصميم',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'تصميم وإبداع',
    link: '/tools?category=Design',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800'
  },
  {
    name: 'إنتاجية',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'كتابة وإدارة المهام',
    link: '/tools?category=Productivity',
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  }
];

export default function BeginnerHelper() {
  const [isVisible, setIsVisible] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  if (!isVisible) return null;

  return (
    <>
      {/* Quick Start Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                جديد على أدوات الذكاء الاصطناعي؟
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                ابدأ من هنا مع هذه الفئات المناسبة لك
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              كيف أستخدم الموقع؟
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickCategories.map((cat, index) => (
            <Link
              key={index}
              href={cat.link}
              className={`flex flex-col items-center text-center p-4 rounded-xl border ${cat.color} hover:scale-105 transition-transform`}
            >
              {cat.icon}
              <span className="font-bold text-sm mt-2">{cat.name}</span>
              <span className="text-xs mt-1 opacity-80">{cat.description}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131B2F] rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowGuide(false)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                كيف تستخدم Tolzy؟
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">ابحث عن أداة</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    استخدم مربع البحث أو تصفح الفئات. يمكنك البحث باسم الأداة أو الغرض منها (مثال: &quot;تحويل نص لصوت&quot;)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">اقرأ التقييم</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    كل أداة لها صفحة تفاصيل مع شرح الاستخدام، مميزاتها، وعيوبها. تحقق من التقييمات قبل الاستخدام.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">استخدم Copilot</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    إذا كنت محتار، اسأل Tolzy Copilot! هو يعرف كل الأدوات وينصحك بالمناسبة لمشروعك.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">تعلم مجاناً</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    روح لقسم &quot;تعلم&quot; واشترك في الكورسات المجانية لتتعلم استخدام AI في عملك ودراستك.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowGuide(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                فهمت
              </button>
              <Link
                href="/copilot"
                onClick={() => setShowGuide(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-center hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                جرب Copilot الآن
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

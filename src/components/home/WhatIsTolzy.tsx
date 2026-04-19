'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  BookOpen, 
  Bot, 
  ArrowLeft,
  Sparkles,
  Zap,
  Globe,
  GraduationCap
} from 'lucide-react';

const mainFeatures = [
  {
    icon: <Wrench className="w-10 h-10" />,
    title: 'دليل أدوات AI الشامل',
    subtitle: '630+ أداة مرتبة حسب الاستخدام',
    description: 'اكتشف أدوات الذكاء الاصطناعي الأكثر شيوعاً: ChatGPT, Claude, Midjourney, وأدوات البرمجة والتصميم. كل أداة مرفقة بتقييم وشرح مفصل.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    features: [
      'بحث متقدم بالفئات والاستخدام',
      'مقارنات جانبية للأدوات',
      'تقييمات من مستخدمين حقيقيين',
      'تحديث يومي للأدوات الجديدة'
    ],
    link: '/tools',
    linkText: 'استكشف الأدوات',
    stats: '630+ أداة'
  },
  {
    icon: <BookOpen className="w-10 h-10" />,
    title: 'Tolzy Learn - منصة التعلم',
    subtitle: 'كورسات متنوعة عربية وعالمية',
    description: 'تعلم البرمجة والذكاء الاصطناعي من منصات عالمية (Coursera, Udemy) وعربية - مجاني ومدفوع. محتوى متنوع للجميع.',
    color: 'from-violet-500 to-fuchsia-600',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    features: [
      'أكثر من 150 كورس متنوع',
      'من منصات عالمية وعربية',
      'مجاني ومدفوع حسب الكورس',
      'محتوى عربي وإنجليزي'
    ],
    link: '/learn',
    linkText: 'اكتشف الكورسات',
    stats: '150+ كورس'
  },
  {
    icon: <Bot className="w-10 h-10" />,
    title: 'Tolzy Copilot - مساعدك الذكي',
    subtitle: 'إجابات فورية وتوصيات ذكية',
    description: 'اسأل عن أي أداة AI، احصل على توصيات مخصصة لاحتياجاتك، واكتشف الأدوات المناسبة لمشروعك بمساعدة الذكاء الاصطناعي.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    features: [
      'إجابات عن جميع الأدوات',
      'توصيات مخصصة حسب احتياجك',
      'شرح مفصل لكيفية الاستخدام',
      'دعم 24/7 متواصل'
    ],
    link: '/copilot',
    linkText: 'تحدث مع Copilot',
    stats: 'ذكاء اصطناعي'
  }
];

const secondaryFeatures = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'محتوى عربي 100%',
    description: 'كل الأدوات والكورسات مترجمة وموضحة بالعربية'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'مجاني بالكامل',
    description: 'اكتشف الأدوات وتعلم بدون أي تكلفة - Pro اختياري'
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'لجميع المستويات',
    description: 'من المبتدئين للمحترفين - محتوى يناسب الجميع'
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'تحديث مستمر',
    description: 'نضيف أدوات جديدة يومياً ونحسن المحتوى باستمرار'
  }
];

export default function WhatIsTolzy() {
  return (
    <section className="py-20 bg-white dark:bg-[#0a0f1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            ماذا يقدم لك <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">TOLZY</span>؟
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            منصة متكاملة تجمع دليل أدوات AI، التعلم المجاني، والمساعد الذكي في مكان واحد
          </p>
        </div>

        {/* Main Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <div 
              key={index}
              className={`group relative bg-white dark:bg-[#131B2F] rounded-3xl border-2 ${feature.borderColor} hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-${feature.color.split('-')[1]}-500/20 overflow-hidden`}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative p-8">
                {/* Icon & Stats Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center shadow-lg`}>
                    {feature.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${feature.bgColor} text-slate-700 dark:text-slate-300`}>
                    {feature.stats}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                  {feature.subtitle}
                </p>
                
                {/* Description */}
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={feature.link}
                  className={`inline-flex items-center gap-2 w-full justify-center py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${feature.color} hover:shadow-lg hover:shadow-${feature.color.split('-')[1]}-500/30 transition-all group-hover:scale-[1.02]`}
                >
                  {feature.linkText}
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Features Grid */}
        <div className="bg-slate-50 dark:bg-[#131B2F]/50 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-4 gap-8">
            {secondaryFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white dark:bg-[#1a2436] flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
            جاهز لبدء رحلتك في عالم الذكاء الاصطناعي؟
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
            >
              ابدأ الاستكشاف
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              أنشئ حساب مجاني
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

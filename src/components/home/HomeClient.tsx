"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import SEO from '@/src/components/SEO';

const UnifiedDirectoryHome = dynamic(() => import('@/src/components/home/UnifiedDirectoryHome'), {
  loading: () => (
    <div className="min-h-screen animate-pulse bg-slate-50 dark:bg-[#07090e] flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin" />
    </div>
  ),
  ssr: true,
});

export default function HomeClient() {
  return (
    <>
      <SEO
        title="TOLZY — أكبر محرك بحث ودليل للأدوات التقنية والكورسات"
        description="أكبر محرك بحث ودليل عربي فوري لاكتشاف ومقارنة أكثر من 1,000 أداة ذكاء اصطناعي و150 مسار وكورس تعليمي تقني بسرعة فائقة وتصفية متقدمة."
        keywords="TOLZY, تولزي, محرك بحث أدوات الذكاء الاصطناعي, دليل أدوات AI, كورسات برمجة, مسارات تعلم, أدوات تقنية"
        url="/"
      />
      <UnifiedDirectoryHome />
    </>
  );
}

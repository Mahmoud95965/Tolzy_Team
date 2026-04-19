"use client";

import React from 'react';
import Link from 'next/link';
import { Construction, ArrowRight, Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center z-10"
      >
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-8 text-blue-600 dark:text-blue-400">
          <Construction className="w-12 h-12" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          هذه الصفحة <span className="text-blue-600 dark:text-blue-500">قيد التطوير</span>
        </h1>

        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-xl mb-10">
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
            سيتم ربط جميع أدوات المنظومة ببعضها قريباً
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            <span>فريق T O L Z Y AI</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
          <Link 
            href="/tools"
            className="flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-bold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            استكشف الأدوات الحالية
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="mt-20 opacity-50 font-black text-2xl tracking-[0.2em] text-slate-300 dark:text-slate-700 select-none">
        T O L Z Y
      </div>
    </div>
  );
}

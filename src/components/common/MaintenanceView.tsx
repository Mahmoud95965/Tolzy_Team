import React from 'react';
import PageLayout from '../layout/PageLayout';
import { Settings, Sparkles } from 'lucide-react';

interface MaintenanceViewProps {
  title: string;
}

const MaintenanceView: React.FC<MaintenanceViewProps> = ({ title }) => {
  return (
    <PageLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden bg-slate-50 dark:bg-[#050505]" dir="rtl">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-8 border border-indigo-200 dark:border-indigo-800 shadow-2xl shadow-indigo-500/20">
                <Settings className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-[spin_4s_linear_infinite]" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                تحديث جديد قادم! 🚀
            </h1>
            
            <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-6">
                {title}
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                انتظرنا في التحديث الجديد خلال أيام شكراً لك.
                <br />
                TOLZY معاك في أي وقت.
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800/50 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-amber-500" />
                TOLZY V2.5 - جديد الآن 🆕
            </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MaintenanceView;

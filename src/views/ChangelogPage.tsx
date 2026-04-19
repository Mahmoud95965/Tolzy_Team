"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import Link from 'next/link';
import { 
  Sparkles, 
  Cpu, 
  ArrowLeft,
  Settings
} from 'lucide-react';
import { getChangelogItems, ChangelogItem } from '../services/roadmap.service';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChangelogPage: React.FC = () => {
  const [items, setItems] = useState<ChangelogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getChangelogItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to load changelog", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
      return (
          <PageLayout>
              <div className="min-h-screen bg-[#f7f9fb] dark:bg-slate-950 flex flex-col justify-center items-center">
                  <LoadingSpinner />
              </div>
          </PageLayout>
      );
  }

  const getTypeStyles = (type: string) => {
      switch(type) {
          case 'major':
              return {
                  borderLine: 'bg-violet-600',
                  dot: 'bg-violet-600 shadow-[0_0_25px_rgba(124,58,237,0.7)] border-white ring-violet-500/20',
                  card: 'from-white to-violet-50 dark:from-slate-900 dark:to-violet-950/20 shadow-violet-200/50 border-violet-100 border-r-violet-600 hover:shadow-violet-300/10',
                  badge: 'text-violet-700 bg-violet-500/10',
                  icon: <Sparkles className="text-violet-300 dark:text-violet-600 hidden md:block" size={24} />
              };
          case 'minor':
              return {
                  borderLine: 'bg-[#fea619]',
                  dot: 'bg-[#fea619] shadow-[0_0_20px_rgba(254,166,25,0.6)] border-white ring-[#fea619]/20',
                  card: 'bg-white dark:bg-slate-900 shadow-slate-200/50 border-slate-100 border-r-[#fea619]',
                  badge: 'text-[#855300] bg-[#fea619]/10',
                  icon: <Cpu className="text-slate-300 dark:text-slate-600 hidden md:block" size={24} />
              };
          default:
              return {
                  borderLine: 'bg-indigo-500',
                  dot: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-white',
                  card: 'bg-white/90 dark:bg-slate-900/90 shadow-slate-200/50 border-slate-100 border-r-indigo-500',
                  badge: 'text-indigo-600 bg-indigo-50',
                  icon: <Settings className="text-indigo-300 dark:text-indigo-600 hidden md:block" size={24} />
              };
      }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#f7f9fb] dark:bg-slate-950 text-[#191c1e] dark:text-slate-200" dir="rtl">
        <main className="pt-12 pb-24 px-6 max-w-5xl mx-auto w-full text-right">
            <header className="text-center mb-20 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-black text-[#091426] dark:text-white mb-6 tracking-tight leading-tight">
                سجل التحديثات
              </h1>
              <p className="text-[#45474c] dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                تابع أحدث الميزات والتحسينات في منصة TOLZY AI.
              </p>
            </header>

            <div className="relative">
              {/* Central Path Line */}
              {items.length > 0 && (
                 <div className="absolute right-4 md:right-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-600 via-[#fea619] to-slate-700 rounded-full opacity-20 md:translate-x-1/2"></div>
              )}

              {items.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 text-lg animate-fade-in">
                      لم يتم نشر أي تحديثات حالياً. سيتم إدراجها هنا قريباً!
                  </div>
              ) : (
                  items.map((item, idx) => {
                      const styles = getTypeStyles(item.type);
                      return (
                          <div key={item.id || idx} className="relative mb-24 animate-slide-up">
                              {/* Timeline Dot */}
                              <div className={`absolute right-4 md:right-1/2 w-6 h-6 rounded-full z-10 md:translate-x-1/2 border-4 ring-4 ${styles.dot}`}></div>
                              
                              <div className="mr-14 md:mr-0 md:w-1/2 md:pr-14">
                                  {/* Update Card */}
                                  <div className={`p-6 md:p-10 rounded-3xl shadow-xl border border-r-8 transition-all duration-300 relative overflow-hidden group ${item.type === 'major' ? 'bg-gradient-to-br' : ''} ${styles.card}`}>
                                      {item.type === 'major' && <div className="absolute -left-20 -top-20 w-40 h-40 bg-violet-500 opacity-10 rounded-full blur-[50px] group-hover:opacity-20 transition-opacity"></div>}
                                      
                                      <div className="flex items-center justify-between mb-6 relative z-10">
                                          <span className={`${styles.badge} font-black text-xs tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-2`}>
                                              {item.type === 'major' && <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>}
                                              {new Date(item.date).toLocaleDateString('ar-EG')} • {item.version}
                                          </span>
                                          {styles.icon}
                                      </div>
                                      
                                      <h2 className="text-2xl md:text-3xl font-black text-[#091426] dark:text-white mb-6 leading-tight relative z-10">
                                          {item.title}
                                      </h2>
                                      
                                      <ul className="space-y-3 relative z-10">
                                          {item.changes.map((change, cIdx) => (
                                              <li key={cIdx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-2 shrink-0"></span>
                                                  <span className="leading-relaxed">{change}</span>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      );
                  })
              )}
            </div>

            {/* Spotlight AI Model */}
            <section className="mt-32 p-10 md:p-16 rounded-[40px] bg-[#091426] text-white relative overflow-hidden group">
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#fea619] opacity-10 rounded-full blur-[100px] group-hover:opacity-20 transition-opacity"></div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#855300] opacity-10 rounded-full blur-[100px] group-hover:opacity-20 transition-opacity"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center text-right">
                <div className="flex-1">
                  <div className="bg-[#fea619] text-[#091426] px-5 py-1.5 rounded-full text-xs font-black inline-block mb-8 shadow-lg shadow-[#fea619]/20 tracking-tight">
                    تحديث استراتيجي
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-8 leading-[1.2] tracking-tight">
                    إطلاق Tolzy Copilot V2.5 - جديد الآن! 🆕
                  </h2>
                  <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
                    الإصدار الجديد كلياً من Tolzy Copilot بقدرات محسّنة في فهم السياق، توليد الأكواد، ودعم اللغة العربية بشكل أعمق.
                  </p>
                  <Link href="/copilot" className="bg-[#fea619] text-[#091426] px-10 py-4 rounded-full font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-max mr-auto md:mr-0 ml-auto shadow-xl shadow-[#fea619]/20 group/btn">
                    <span>اكتشف Copilot V2.5 الجديد</span>
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="w-full md:w-1/3 aspect-square bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#fea619]/20 to-transparent"></div>
                   <Cpu strokeWidth={1} size={140} className="text-[#fea619] relative z-10 drop-shadow-[0_0_30px_rgba(254,166,25,0.4)]" />
                </div>
              </div>
            </section>
          </main>
      </div>
    </PageLayout>
  );
};

export default ChangelogPage;


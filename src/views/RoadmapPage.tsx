"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import Link from 'next/link';
import { 
  FileText, 
  PlusCircle, 
  Image as ImageIcon, 
  Smartphone, 
  CheckCircle2, 
  Terminal, 
  Lightbulb, 
  Send
} from 'lucide-react';
import { getRoadmapItems, RoadmapItem } from '../services/roadmap.service';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoadmapPage: React.FC = () => {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getRoadmapItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to load roadmap", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const planned = items.filter(i => i.status === 'planned');
  const inProgress = items.filter(i => i.status === 'in_progress');
  const done = items.filter(i => i.status === 'done');

  if (loading) {
      return (
          <PageLayout>
              <div className="min-h-screen bg-[#f7f9fb] dark:bg-slate-950 flex flex-col justify-center items-center">
                  <LoadingSpinner />
              </div>
          </PageLayout>
      );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#f7f9fb] dark:bg-slate-950 text-[#191c1e] dark:text-slate-200 selection:bg-[#ffddb8]/30">
        <main className="p-6 md:p-12 w-full max-w-7xl mx-auto" dir="rtl">
            <header className="mb-16 text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-black text-[#091426] dark:text-white mb-6 tracking-tight leading-tight">
                خارطة طريق TOLZY AI 🗺️
              </h1>
              <p className="text-lg text-[#45474c] dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                نحن نبني مستقبل الذكاء الاصطناعي العربي. تابع تطوراتنا والميزات القادمة التي ستجعل عملك أسهل وأكثر ذكاءً.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
              
              {/* Column 1: Planned */}
              <div className="flex flex-col gap-6 animate-slide-up">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    <h3 className="font-bold text-lg text-slate-600 dark:text-slate-400">مخطط لها (Planned)</h3>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-500 px-2.5 py-1 rounded-full">
                    {planned.length.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {planned.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-transparent dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <FileText className="text-slate-400 group-hover:text-indigo-500 transition-colors" size={20} />
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500">{item.badge}</span>
                      </div>
                      <h4 className="font-bold text-[#091426] dark:text-white mb-2 pointer-events-none">{item.title}</h4>
                      <p className="text-sm text-[#45474c] dark:text-slate-400 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  ))}
                  {planned.length === 0 && <div className="text-sm text-slate-400 text-center py-6">سيتم الإعلان عن الميزات القادمة قريباً</div>}
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="flex flex-col gap-6 animate-slide-up [animation-delay:100ms]">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#855300] dark:bg-[#fea619]"></span>
                    <h3 className="font-bold text-lg text-[#855300] dark:text-[#fea619]">قيد التنفيذ (In Progress)</h3>
                  </div>
                  <span className="text-xs font-bold bg-[#fea619]/10 text-[#855300] dark:text-[#fea619] px-2.5 py-1 rounded-full">
                    {inProgress.length.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-4">
                  {inProgress.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-transparent dark:border-white/5 border-r-4 border-r-[#fea619] transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <Smartphone className="text-[#855300] dark:text-[#fea619]" size={20} />
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#fea619]/10 text-[#855300] dark:text-[#fea619]">{item.badge}</span>
                      </div>
                      <h4 className="font-bold text-[#091426] dark:text-white mb-2 pointer-events-none">{item.title}</h4>
                      <p className="text-sm text-[#45474c] dark:text-slate-400 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  ))}
                  {inProgress.length === 0 && <div className="text-sm text-slate-400 text-center py-6">لا يوجد شيء قيد التنفيذ حالياً</div>}
                </div>
              </div>

              {/* Column 3: Done */}
              <div className="flex flex-col gap-6 animate-slide-up [animation-delay:200ms]">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h3 className="font-bold text-lg text-emerald-600">مكتملة (Done)</h3>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full">
                    {done.length.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-4">
                  {done.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white/60 dark:bg-slate-900/40 p-5 rounded-2xl shadow-sm border border-transparent dark:border-white/5 opacity-80 hover:opacity-100 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">{item.badge}</span>
                      </div>
                      <h4 className="font-bold text-[#091426] dark:text-white mb-2 pointer-events-none">{item.title}</h4>
                      <p className="text-sm text-[#45474c] dark:text-slate-400 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  ))}
                  {done.length === 0 && <div className="text-sm text-slate-400 text-center py-6">سيتم إدراج الميزات المكتملة هنا</div>}
                </div>
              </div>
            </div>

            <footer className="mt-24 max-w-4xl mx-auto p-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-white/5 rounded-[48px] text-center shadow-2xl animate-fade-in [animation-delay:400ms]">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-800 mb-8 shadow-xl shadow-amber-500/5">
                <Lightbulb className="text-[#fea619]" size={36} />
              </div>
              <h3 className="text-3xl font-black text-[#091426] dark:text-white mb-4 tracking-tight">لديك فكرة لميزة جديدة؟</h3>
              <p className="text-[#45474c] dark:text-slate-400 text-lg mb-10 leading-relaxed font-medium">نحن نستمع لمستخدمينا دائماً. شاركنا أفكارك لنبنيها معاً في التحديث القادم.</p>
              <Link href="/contact" className="bg-[#091426] dark:bg-white text-white dark:text-[#091426] font-black px-10 py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#091426]/10 flex items-center justify-center gap-3 w-max mx-auto group">
                <span>أرسل اقتراحك</span>
                <Send size={18} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
            </footer>
          </main>
      </div>
    </PageLayout>
  );
};

export default RoadmapPage;

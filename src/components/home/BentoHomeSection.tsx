"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, GraduationCap, Bot } from 'lucide-react';
import { Tool } from '../../types/tool';
import ToolImage from '../common/ToolImage';

interface BentoHomeSectionProps {
  newTools: Tool[];
  popularTools: Tool[];
}

const BentoCard = ({ tool }: { tool: Tool }) => {
  const primaryCategory = Array.isArray(tool.category) ? tool.category[0] : tool.category;
  
  return (
    <div className="group bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-500/50 transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <ToolImage 
          imageUrl={tool.imageUrl} 
          name={tool.name} 
          categoryName={primaryCategory} 
          size="md" 
          className="rounded-xl border border-slate-100 dark:border-slate-800" 
        />
        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {tool.pricing === 'Free' ? 'مجاني' : tool.pricing === 'Freemium' ? 'مجاني/مدفوع' : 'مدفوع'}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{tool.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow">
        {tool.description}
      </p>
      
      <Link href={`/tools/${tool.id}`} className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors w-fit">
        <span>زيارة الأداة</span>
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      </Link>
    </div>
  );
};

const BentoHomeSection: React.FC<BentoHomeSectionProps> = ({ newTools, popularTools }) => {
  return (
    <section className="py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Latest Additions */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500" />
              أحدث الإضافات
            </h2>
            <Link href="/tools?tab=recent" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
              عرض الكل &larr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newTools.slice(0, 8).map(tool => (
              <BentoCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>

        {/* Trending & Banner */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              أكثر رواجاً
            </h2>
            <Link href="/tools?tab=popular" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
              عرض الكل &larr;
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            
            {/* Academy Banner (Right Side RTL - الثلث الأول) */}
            <div className="xl:col-span-4 bg-gradient-to-br from-slate-950 to-violet-950 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group h-[400px] xl:h-[450px] shadow-2xl shadow-violet-900/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/5">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
                  طوّر مهاراتك<br/>للمستقبل
                </h3>
                <p className="text-violet-200/80 font-medium mb-8 text-sm leading-relaxed">
                  تعلم أهم التقنيات ومسارات البرمجة من الصفر. محتوى عربي تفاعلي مجاني بالكامل لإعدادك لسوق العمل.
                </p>
              </div>

              <Link 
                href="/learn" 
                className="relative z-10 w-full py-4 bg-white text-slate-900 rounded-xl font-black text-center hover:bg-slate-100 hover:scale-[1.02] transition-all shadow-md"
              >
                ابدأ التعلم مجاناً
              </Link>
              
              {/* Graphic Element */}
              <svg className="absolute bottom-[-10%] left-[-10%] w-64 h-64 text-white/5 transform rotate-12 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                <rect x="20" y="20" width="20" height="20" rx="4"/>
                <rect x="60" y="20" width="20" height="20" rx="4"/>
                <rect x="40" y="60" width="20" height="20" rx="4"/>
                <path d="M30 40 L50 60 M70 40 L50 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Trending Tools Slider (Left Side RTL - Col span 8) */}
            <div className="xl:col-span-8 flex flex-nowrap overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar h-[400px] xl:h-[450px]">
              {popularTools.slice(0, 8).map(tool => (
                <div key={tool.id} className="min-w-[280px] sm:min-w-[320px] snap-center h-full">
                  <BentoCard tool={tool} />
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default BentoHomeSection;

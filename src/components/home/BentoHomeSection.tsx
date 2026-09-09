"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, GraduationCap, Bot } from 'lucide-react';
import { Tool } from '../../types/tool';
import ToolImage from '../common/ToolImage';
import { useTheme } from '../../context/ThemeContext';

interface BentoHomeSectionProps {
  newTools: Tool[];
  popularTools: Tool[];
}

const BentoCard = ({ tool }: { tool: Tool }) => {
  const { isDarkMode } = useTheme();
  const primaryCategory = Array.isArray(tool.category) ? tool.category[0] : tool.category;
  
  const getPricingBadge = () => {
    switch (tool.pricing) {
      case 'Free':
        return (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-600'
          }`}>
            مجاني
          </span>
        );
      case 'Freemium':
        return (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
              : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
            مجاني/مدفوع
          </span>
        );
      default:
        return (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}>
            مدفوع
          </span>
        );
    }
  };

  return (
    <div className={`group rounded-2xl border p-5 transition-all duration-300 flex flex-col h-full relative overflow-hidden ${
      isDarkMode 
        ? 'bg-slate-950/45 border-white/5 hover:border-indigo-500/40 shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1' 
        : 'bg-white border-slate-200/80 hover:border-indigo-500/50 shadow-sm hover:shadow-xl shadow-slate-100/50 hover:-translate-y-1'
    }`}>
      {/* Decorative hover gradient overlay */}
      <div className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
        isDarkMode 
          ? 'bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-transparent' 
          : 'bg-gradient-to-r from-indigo-500/8 via-purple-500/8 to-transparent'
      }`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <ToolImage 
            name={tool.name} 
            categoryName={primaryCategory} 
            subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory?.[0] : tool.subcategory}
            size="md" 
          />
          {getPricingBadge()}
        </div>
        
        <h3 className={`text-lg font-bold mb-1.5 line-clamp-1 transition-colors duration-300 ${
          isDarkMode ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'
        }`}>
          {tool.name}
        </h3>
        
        <p className={`text-xs line-clamp-2 mb-4 flex-grow leading-relaxed transition-colors duration-300 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {tool.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
          <Link 
            href={`/tools/${tool.id}`} 
            className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all duration-300 group-hover:gap-2.5 ${
              isDarkMode 
                ? 'text-slate-300 group-hover:text-indigo-400' 
                : 'text-slate-700 group-hover:text-indigo-600'
            }`}
          >
            <span>زيارة الأداة</span>
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          </Link>
          
          {primaryCategory && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
              isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
              {primaryCategory}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const BentoHomeSection: React.FC<BentoHomeSectionProps> = ({ newTools, popularTools }) => {
  const { isDarkMode } = useTheme();

  return (
    <section className="py-12 w-full transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Latest Additions */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b pb-4 transition-colors duration-300" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <h2 className={`text-2xl md:text-3xl font-black flex items-center gap-3 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
              أحدث الإضافات
            </h2>
            <Link 
              href="/tools?tab=recent" 
              className={`text-sm font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
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
          <div className="flex items-center justify-between mb-8 border-b pb-4 transition-colors duration-300" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <h2 className={`text-2xl md:text-3xl font-black transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              أكثر رواجاً
            </h2>
            <Link 
              href="/tools?tab=popular" 
              className={`text-sm font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              عرض الكل &larr;
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            
            {/* Academy Banner (Right Side RTL - الثلث الأول) */}
            <div className={`xl:col-span-4 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group h-[400px] xl:h-[450px] shadow-2xl transition-all duration-500 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-950 via-[#191535] to-slate-950 shadow-violet-950/20 border border-white/5' 
                : 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 shadow-indigo-950/15 border border-indigo-950'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/25 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/5">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
                  طوّر مهاراتك<br/>للمستقبل
                </h3>
                <p className="text-indigo-200/80 font-medium mb-8 text-sm leading-relaxed">
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

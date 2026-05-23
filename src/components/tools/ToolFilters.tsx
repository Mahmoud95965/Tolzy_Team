import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterOptions, ToolCategory } from '../../types';
import { Search, RotateCcw, Sparkles } from 'lucide-react';

const categories: ToolCategory[] = [
  'Productivity', 'Video', 'Writing', 'Business', 
  'Design', 'Creativity', 'Programming', 'Education'
];

interface ToolFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  showMobileFilters: boolean;
  setShowMobileFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToolFilters: React.FC<ToolFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const { t } = useTranslation();

  const handleCategoryChange = (category: ToolCategory | 'All') => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const toggleAiSearch = () => {
    setFilters(prev => ({ ...prev, isAiSearch: !prev.isAiSearch }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'All',
      pricing: 'All',
      searchQuery: '',
      isAiSearch: false
    });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Search Controls Glass Card */}
      <div className="bg-slate-950/40 dark:bg-slate-900/30 border border-white/5 backdrop-blur-xl p-5 md:p-6 rounded-[28px] space-y-4">
        
        {/* Input & Toggle row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          {/* AI Search Toggler Button */}
          <button
            onClick={toggleAiSearch}
            className={`flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border transition-all duration-300 font-black text-sm md:w-56 cursor-pointer select-none ${
              filters.isAiSearch
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${filters.isAiSearch ? 'animate-pulse text-amber-300' : 'text-slate-400'}`} />
            <span>البحث الذكي بالذكاء الاصطناعي</span>
          </button>

          {/* Search Input Box */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={
                filters.isAiSearch
                  ? "صف ما تريد القيام به (مثال: أداة لتحسين جودة الصوت بالذكاء الاصطناعي)..."
                  : "ابحث عن أداة ذكاء اصطناعي..."
              }
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              className={`w-full pl-6 pr-14 py-4 bg-slate-950/20 dark:bg-slate-900/15 border-2 rounded-2xl text-[16px] text-white placeholder:text-slate-500 focus:outline-none transition-all duration-300 ${
                filters.isAiSearch
                  ? 'border-indigo-500/40 focus:border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'border-white/5 focus:border-indigo-500'
              }`}
              dir="rtl"
            />
            <div className="absolute top-0 right-0 h-full w-14 flex items-center justify-center text-slate-500">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* AI Info Badge helper */}
        {filters.isAiSearch && (
          <div className="flex justify-end items-center gap-2 text-xs font-bold text-indigo-400 animate-fade-in pr-2">
            <span>محرك المتجهات الدلالي نشط - يقوم بفهم مقاصدك وعرض أفضل النتائج المتطابقة ✨</span>
          </div>
        )}
      </div>

      {/* Category Navigation - Glass pills */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          {filters.category !== 'All' ? (
            <button 
              onClick={() => handleCategoryChange('All')}
              className="text-xs font-black text-indigo-400 hover:text-indigo-300 underline"
            >
              عرض الكل
            </button>
          ) : (
            <span />
          )}
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">تصفح حسب الفئة</h3>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Reset button if search query or filters are active */}
          {(filters.searchQuery || filters.category !== 'All' || filters.isAiSearch) && (
            <button
              onClick={resetFilters}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="إعادة ضبط"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
          )}

          <button
            onClick={() => handleCategoryChange('All')}
            className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-xs font-black border transition-all duration-200 select-none cursor-pointer ${
              filters.category === 'All'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
            }`}
          >
            الكل
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-xs font-black border transition-all duration-200 select-none cursor-pointer ${
                filters.category === cat
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolFilters;
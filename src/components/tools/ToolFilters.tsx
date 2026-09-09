import React from 'react';
import { FilterOptions, ToolCategory, ToolPricing } from '../../types';
import {
  Search,
  RotateCcw,
  Sparkles,
  X,
  Zap,
  Video,
  PenTool,
  Palette,
  Code2,
  Briefcase,
  GraduationCap,
  Box,
  Layers
} from 'lucide-react';

const mainCategories: { id: ToolCategory; label: string; icon: React.ElementType }[] = [
  { id: 'Productivity', label: 'الإنتاجية', icon: Zap },
  { id: 'Video', label: 'الفيديو', icon: Video },
  { id: 'Writing', label: 'الكتابة', icon: PenTool },
  { id: 'Design', label: 'التصميم', icon: Palette },
  { id: 'Programming', label: 'البرمجة', icon: Code2 },
  { id: 'Business', label: 'الأعمال', icon: Briefcase },
  { id: 'Education', label: 'التعليم', icon: GraduationCap },
  { id: '3D', label: 'ثلاثي الأبعاد', icon: Box },
  { id: 'Creativity', label: 'الإبداع', icon: Sparkles },
];

const pricingOptions: { id: ToolPricing | 'All'; label: string }[] = [
  { id: 'All', label: 'كل الأسعار' },
  { id: 'Free', label: 'مجاني' },
  { id: 'Freemium', label: 'فريميوم' },
  { id: 'Paid', label: 'مدفوع' },
];

interface ToolFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  showMobileFilters?: boolean;
  setShowMobileFilters?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToolFilters: React.FC<ToolFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const handleCategoryChange = (category: ToolCategory | 'All') => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handlePricingChange = (pricing: ToolPricing | 'All') => {
    setFilters(prev => ({ ...prev, pricing }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const clearSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
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

  const hasActiveFilters = Boolean(
    (filters.category && filters.category !== 'All') ||
    (filters.pricing && filters.pricing !== 'All') ||
    filters.searchQuery ||
    filters.isAiSearch
  );

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Search Bar & AI Toggle */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-3 sm:p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
          {/* Main Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={
                filters.isAiSearch
                  ? "صف ما تريد إنجازه (مثال: أداة لتوليد فيديوهات من نص)..."
                  : "ابحث عن أي أداة ذكاء اصطناعي..."
              }
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              className="w-full pr-11 pl-10 py-3 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 rounded-xl text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              dir="rtl"
            />
            <div className="absolute top-0 right-0 h-full w-11 flex items-center justify-center text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            {filters.searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute top-0 left-0 h-full w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Semantic Search Toggle */}
          <button
            onClick={toggleAiSearch}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-black text-xs sm:text-sm transition-all duration-200 select-none shrink-0 ${
              filters.isAiSearch
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${filters.isAiSearch ? 'animate-pulse text-amber-300' : 'text-slate-400'}`} />
            <span>البحث الذكي (AI)</span>
          </button>
        </div>

        {filters.isAiSearch && (
          <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 px-1 flex items-center gap-1.5 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>محرك المتجهات الدلالي نشط: يطابق معنى استفسارك وليس فقط الكلمات المفتاحية</span>
          </div>
        )}
      </div>

      {/* Categories & Filters Row */}
      <div className="flex flex-col gap-2.5">
        {/* Categories Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border transition-all duration-150 select-none ${
              filters.category === 'All'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:border-indigo-500/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>جميع الفئات</span>
          </button>

          {mainCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border transition-all duration-150 select-none ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:border-indigo-500/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pricing Segmented Row + Reset */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/70 p-1 rounded-xl border border-slate-200/80 dark:border-white/5 text-xs font-bold">
            {pricingOptions.map((p) => {
              const isSelected = (filters.pricing || 'All') === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePricingChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-black'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs font-black text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolFilters;
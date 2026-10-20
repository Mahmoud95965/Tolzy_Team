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
      <div className="bg-[#ffffff] border border-[#d2d2c8] p-3 sm:p-4 rounded-[28px] shadow-none space-y-3">
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
              className="w-full pr-11 pl-10 py-3 bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] rounded-[18px] text-sm sm:text-base text-[#14140f] placeholder:text-[#6e6e64] focus:outline-none transition-colors font-normal"
              dir="rtl"
            />
            <div className="absolute top-0 right-0 h-full w-11 flex items-center justify-center text-[#6e6e64]">
              <Search className="w-4 h-4" />
            </div>
            {filters.searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute top-0 left-0 h-full w-10 flex items-center justify-center text-[#6e6e64] hover:text-[#14140f] transition-colors"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Semantic Search Toggle */}
          <button
            onClick={toggleAiSearch}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-[18px] border font-medium text-xs sm:text-sm transition-colors select-none shrink-0 ${
              filters.isAiSearch
                ? 'bg-[#beff50] border-[#14140f] text-[#14140f]'
                : 'bg-[#f5f5eb] border-[#d2d2c8] text-[#14140f] hover:border-[#14140f]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#14140f]" />
            <span>البحث الذكي (AI)</span>
          </button>
        </div>

        {filters.isAiSearch && (
          <div className="text-xs font-medium text-[#14140f] px-1.5 py-1 rounded-xl bg-[#beff50]/30 border border-[#14140f]/10 flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#14140f] shrink-0" />
              <span>محرك الذكاء الاصطناعي نشط: يفهم استفسارك باللغة الطبيعية ويستخرج أفضل الأدوات المناسبة</span>
            </span>
            <span className="text-[10px] bg-[#14140f] text-[#beff50] px-2 py-0.5 rounded-full font-mono font-bold">
              AI Active
            </span>
          </div>
        )}
      </div>

      {/* Categories & Filters Row */}
      <div className="flex flex-col gap-2.5">
        {/* Categories Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-colors select-none ${
              filters.category === 'All'
                ? 'bg-[#beff50] border-[#14140f] text-[#14140f]'
                : 'bg-[#ffffff] border-[#d2d2c8] text-[#14140f] hover:border-[#14140f]'
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
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-colors select-none ${
                  isSelected
                    ? 'bg-[#beff50] border-[#14140f] text-[#14140f]'
                    : 'bg-[#ffffff] border-[#d2d2c8] text-[#14140f] hover:border-[#14140f]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#14140f]" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pricing Segmented Row + Reset */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 bg-[#f5f5eb] p-1 rounded-full border border-[#d2d2c8] text-xs font-normal">
            {pricingOptions.map((p) => {
              const isSelected = (filters.pricing || 'All') === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePricingChange(p.id)}
                  className={`px-3.5 py-1.5 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-[#beff50] text-[#14140f] border border-[#14140f]/20 font-medium'
                      : 'text-[#6e6e64] hover:text-[#14140f]'
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
              className="flex items-center gap-1.5 text-xs font-normal text-[#14140f] hover:text-[#6e6e64] transition-colors px-3 py-1.5 rounded-full bg-[#f5f5eb] border border-[#d2d2c8]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolFilters;
"use client";

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
  { id: 'All', label: 'الكل' },
  { id: 'Free', label: 'مجاني' },
  { id: 'Freemium', label: 'مزيج' },
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
    <div className="space-y-2.5 sm:space-y-3.5 text-right" dir="rtl">
      
      {/* ─── 1. SEARCH BAR & AI TOGGLE ─── */}
      <div className="bg-[#ffffff] border border-[#d2d2c8] p-2 sm:p-3 rounded-2xl sm:rounded-[24px] shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          
          {/* Main Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={
                filters.isAiSearch
                  ? "صف ما تريده (مثال: أداة لتوليد فيديوهات)..."
                  : "ابحث عن أي أداة ذكاء اصطناعي..."
              }
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              className="w-full pr-9 sm:pr-11 pl-9 py-2 sm:py-2.5 bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] rounded-xl sm:rounded-[16px] text-xs sm:text-sm text-[#14140f] placeholder:text-[#a0a096] focus:outline-none transition-colors"
              dir="rtl"
            />
            <div className="absolute top-0 right-0 h-full w-9 sm:w-11 flex items-center justify-center text-[#a0a096]">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            {filters.searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute top-0 left-0 h-full w-9 flex items-center justify-center text-[#a0a096] hover:text-[#14140f] transition-colors cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* AI Semantic Search Toggle */}
          <button
            onClick={toggleAiSearch}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-[16px] border font-bold text-xs transition-all select-none shrink-0 cursor-pointer ${
              filters.isAiSearch
                ? 'bg-[#beff50] border-[#14140f] text-[#14140f] shadow-2xs'
                : 'bg-[#f5f5eb] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f]'
            }`}
            title="تفعيل البحث الذكي الدلالي"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#14140f]" />
            <span className="hidden xs:inline">البحث الذكي</span>
            <span className="xs:hidden">AI</span>
          </button>

        </div>

        {filters.isAiSearch && (
          <div className="text-[11px] font-medium text-[#14140f] px-2.5 py-1 rounded-xl bg-[#beff50]/30 border border-[#14140f]/15 flex items-center justify-between gap-2 animate-in fade-in duration-150">
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3 h-3 text-[#14140f] shrink-0" />
              <span className="truncate">محرك الذكاء الاصطناعي يفهم استفسارك ويستخرج أنسب الأدوات</span>
            </span>
            <span className="text-[9px] bg-[#14140f] text-[#beff50] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0">
              AI ON
            </span>
          </div>
        )}
      </div>

      {/* ─── 2. CATEGORIES HORIZONTAL PILLS ─── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-1 px-1">
        <button
          onClick={() => handleCategoryChange('All')}
          className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors select-none cursor-pointer ${
            filters.category === 'All'
              ? 'bg-[#14140f] border-[#14140f] text-[#ffffff] shadow-2xs'
              : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f]'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>الكل</span>
        </button>

        {mainCategories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors select-none cursor-pointer ${
                isSelected
                  ? 'bg-[#beff50] border-[#14140f] text-[#14140f] font-bold shadow-2xs'
                  : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f]'
              }`}
            >
              <Icon className="w-3 h-3 text-[#14140f]" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. PRICING ROW & RESET ─── */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1 bg-[#f5f5eb] p-0.5 rounded-full border border-[#d2d2c8] text-xs">
          {pricingOptions.map((p) => {
            const isSelected = (filters.pricing || 'All') === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePricingChange(p.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#ffffff] text-[#14140f] font-bold border border-[#d2d2c8] shadow-2xs'
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
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#14140f] hover:text-[#6e6e64] transition-colors px-2.5 py-1 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إعادة ضبط</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default ToolFilters;

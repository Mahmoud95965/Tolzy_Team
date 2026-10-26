"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';
import ToolsGrid from '../components/tools/ToolsGrid';
import ToolFilters from '../components/tools/ToolFilters';
import ToolDrawer from '../components/tools/ToolDrawer';
import { FilterOptions, Tool } from '../types/index';
import { useTools } from '../hooks/useTools';
import { Loader, Sparkles, Layers } from 'lucide-react';

const ToolsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { refreshTools, filterToolsByOptions, isLoading, totalToolsCount } = useTools();

  // Drawer selected tool state
  const [selectedDrawerTool, setSelectedDrawerTool] = useState<Tool | null>(null);

  // Semantic search states
  const [semanticTools, setSemanticTools] = useState<Tool[]>([]);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Initialize filters from URL parameters
  const categoryParam = searchParams.get('category');
  const pricingParam = searchParams.get('pricing');
  const qParam = searchParams.get('q') || '';
  const aiParam = searchParams.get('ai') === 'true';

  const [filters, setFilters] = useState<FilterOptions>({
    category: (categoryParam as FilterOptions['category']) || 'All',
    pricing: (pricingParam as FilterOptions['pricing']) || 'All',
    searchQuery: qParam,
    isAiSearch: aiParam || false
  });

  // Update filters when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const pricingParam = searchParams.get('pricing');
    const qParam = searchParams.get('q') || '';
    const aiParam = searchParams.get('ai') === 'true';

    const newFilters = {
      category: (categoryParam as FilterOptions['category']) || 'All',
      pricing: (pricingParam as FilterOptions['pricing']) || 'All',
      searchQuery: qParam,
      isAiSearch: aiParam || filters.isAiSearch
    };

    setFilters(newFilters);
    refreshTools(newFilters);
  }, [searchParams, refreshTools]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register window custom event listener for opening Slide-over Drawer
  useEffect(() => {
    const handleOpenDrawer = (e: Event) => {
      const customEvent = e as CustomEvent<Tool>;
      if (customEvent.detail) {
        setSelectedDrawerTool(customEvent.detail);
      }
    };

    window.addEventListener('open-tool-drawer', handleOpenDrawer);
    return () => {
      window.removeEventListener('open-tool-drawer', handleOpenDrawer);
    };
  }, []);

  // Fetch AI Semantic Search when searchQuery changes and isAiSearch is active
  const triggerSemanticSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSemanticTools([]);
      return;
    }

    setIsSemanticLoading(true);
    try {
      const response = await fetch(`/api/tools/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSemanticTools(data.tools || []);
        setAiSummary(data.aiSummary || null);
      } else {
        console.error('Semantic Search failed:', response.statusText);
        setSemanticTools([]);
        setAiSummary(null);
      }
    } catch (err) {
      console.error('Semantic Search error:', err);
      setSemanticTools([]);
      setAiSummary(null);
    } finally {
      setIsSemanticLoading(false);
    }
  }, []);

  // Debounced semantic search effect
  useEffect(() => {
    if (filters.isAiSearch && filters.searchQuery) {
      const delayDebounce = setTimeout(() => {
        triggerSemanticSearch(filters.searchQuery || '');
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      setSemanticTools([]);
    }
  }, [filters.searchQuery, filters.isAiSearch, triggerSemanticSearch]);

  const filteredTools = filterToolsByOptions(filters);

  // Check if filters are default
  const noFiltersApplied =
    filters.category === 'All' &&
    (filters.pricing === 'All' || !filters.pricing) &&
    !filters.searchQuery &&
    !filters.isAiSearch;

  // Decide which tools and states to display
  const showSemanticResults = Boolean(filters.isAiSearch && filters.searchQuery);
  const activeToolsList = showSemanticResults ? semanticTools : filteredTools;
  const isCurrentlyLoading = showSemanticResults ? isSemanticLoading : isLoading;

  return (
    <PageLayout>
      <div className="relative min-h-screen bg-[#ffffff] text-[#14140f] text-right font-sans">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-16 sm:pb-24">
          {/* Header Section */}
          <div className="text-center mb-4 sm:mb-8 space-y-2 sm:space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] text-[10px] sm:text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f]" />
              <span>دليل الأدوات الذكي (+{totalToolsCount || 1024} أداة)</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-[#14140f] tracking-tight">
              استكشف أفضل أدوات الذكاء الاصطناعي
            </h1>

            <p className="text-xs sm:text-sm text-[#6e6e64] leading-relaxed hidden xs:block">
              ابحث، صنف، وقارن بين مئات البرمجيات والأدوات التقنية لتسريع إنتاجيتك وتطوير مشاريعك
            </p>
          </div>

          {/* Interactive Filters Panel */}
          <div className="mb-6">
            <ToolFilters
              filters={filters}
              setFilters={setFilters}
            />
          </div>

          {/* AI Semantic Insights & Recommendation Card */}
          {showSemanticResults && aiSummary && (
            <div className="mb-4 p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-emerald-50/90 border border-blue-200/90 shadow-2xs flex items-start gap-3 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-1 text-right flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700">
                    تحليل وتوصيات الذكاء الاصطناعي (TOLZY AI)
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono font-bold">
                    نشط
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                  {aiSummary}
                </p>
              </div>
            </div>
          )}

          {/* Results Header Bar */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#d2d2c8]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-1.5 h-4 sm:h-5 rounded-full bg-[#beff50] border border-[#14140f] shrink-0" />
              <h2 className="text-sm sm:text-lg font-bold text-[#14140f] truncate">
                {showSemanticResults ? (
                  <span>نتائج البحث الذكي عن "{filters.searchQuery}"</span>
                ) : filters.searchQuery ? (
                  <span>نتائج البحث عن "{filters.searchQuery}"</span>
                ) : filters.category && filters.category !== 'All' ? (
                  <span>أدوات فئة {filters.category}</span>
                ) : (
                  <span>جميع الأدوات المتاحة</span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isCurrentlyLoading && (
                <Loader className="w-3.5 h-3.5 animate-spin text-[#14140f]" />
              )}
              <span className="text-[11px] sm:text-xs font-bold text-[#14140f] bg-[#f5f5eb] px-2.5 py-0.5 rounded-full border border-[#d2d2c8]">
                {noFiltersApplied ? `+${totalToolsCount || 1024} أداة` : `${activeToolsList.length} أداة`}
              </span>
            </div>
          </div>

          {/* Tools Grid Display */}
          <div className="min-h-[400px]">
            {isCurrentlyLoading && activeToolsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4">
                <Loader className="w-8 h-8 animate-spin text-[#14140f]" />
                <span className="text-sm font-normal text-[#6e6e64]">
                  {showSemanticResults ? 'جاري تحليل وفهم البحث الدلالي بالذكاء الاصطناعي...' : 'جاري جلب الأدوات...'}
                </span>
              </div>
            ) : activeToolsList.length === 0 ? (
              <div className="text-center py-20 bg-[#f5f5eb] rounded-[28px] border border-[#d2d2c8] p-8 max-w-lg mx-auto">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-[#14140f] mb-2">لا توجد أدوات مطابقة لمعايير البحث</h3>
                <p className="text-sm text-[#6e6e64] font-normal mb-6 max-w-md mx-auto">
                  جرّب تغيير كلمات البحث أو إعادة تعيين الفلاتر لعرض كل الأدوات المتاحة.
                </p>
                <button
                  onClick={() => setFilters({ category: 'All', pricing: 'All', searchQuery: '', isAiSearch: false })}
                  className="px-6 py-2.5 bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] font-medium text-xs rounded-[28px] transition-colors"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            ) : (
              <ToolsGrid
                tools={activeToolsList}
                enableInfiniteScroll={!showSemanticResults}
              />
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Tool Review Drawer */}
      <ToolDrawer
        isOpen={!!selectedDrawerTool}
        onClose={() => setSelectedDrawerTool(null)}
        tool={selectedDrawerTool}
      />
    </PageLayout>
  );
};

export default ToolsPage;
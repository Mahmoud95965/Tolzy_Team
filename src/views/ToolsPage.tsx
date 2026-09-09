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

  // Initialize filters from URL parameters
  const categoryParam = searchParams.get('category');
  const pricingParam = searchParams.get('pricing');
  const qParam = searchParams.get('q') || '';

  const [filters, setFilters] = useState<FilterOptions>({
    category: (categoryParam as FilterOptions['category']) || 'All',
    pricing: (pricingParam as FilterOptions['pricing']) || 'All',
    searchQuery: qParam,
    isAiSearch: false
  });

  // Update filters when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const pricingParam = searchParams.get('pricing');
    const qParam = searchParams.get('q') || '';

    const newFilters = {
      category: (categoryParam as FilterOptions['category']) || 'All',
      pricing: (pricingParam as FilterOptions['pricing']) || 'All',
      searchQuery: qParam,
      isAiSearch: filters.isAiSearch
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
      } else {
        console.error('Semantic Search failed:', response.statusText);
        setSemanticTools([]);
      }
    } catch (err) {
      console.error('Semantic Search error:', err);
      setSemanticTools([]);
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
      <div className="relative min-h-screen bg-slate-50/50 dark:bg-[#07090e] text-right font-sans">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-36 md:pb-28">
          {/* Header Section */}
          <div className="text-center mb-10 space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>أكبر دليل عربي موثق لأدوات الذكاء الاصطناعي (+{totalToolsCount || 1000} أداة)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              استكشف أفضل أدوات{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-300 bg-clip-text text-transparent">
                الذكاء الاصطناعي
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
              ابحث، صنف، وقارن بين مئات البرمجيات والأدوات الذكية لتسريع إنتاجيتك وتطوير مشاريعك
            </p>
          </div>

          {/* Interactive Filters Panel */}
          <div className="mb-10">
            <ToolFilters
              filters={filters}
              setFilters={setFilters}
            />
          </div>

          {/* Results Header Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                {showSemanticResults ? (
                  <>
                    <span>نتائج البحث الذكي عن: </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">"{filters.searchQuery}"</span>
                  </>
                ) : filters.searchQuery ? (
                  <>
                    <span>نتائج البحث: </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">"{filters.searchQuery}"</span>
                  </>
                ) : filters.category && filters.category !== 'All' ? (
                  <span>أدوات فئة {filters.category}</span>
                ) : (
                  <span>جميع الأدوات المتاحة</span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isCurrentlyLoading && (
                <Loader className="w-4 h-4 animate-spin text-indigo-500" />
              )}
              <span className="text-xs font-black text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-xs">
                {noFiltersApplied ? `+${totalToolsCount || 1000} أداة` : `${activeToolsList.length} أداة`}
              </span>
            </div>
          </div>

          {/* Tools Grid Display */}
          <div className="min-h-[400px]">
            {isCurrentlyLoading && activeToolsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4">
                <Loader className="w-9 h-9 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {showSemanticResults ? 'جاري تحليل وفهم البحث الدلالي بالذكاء الاصطناعي...' : 'جاري جلب الأدوات...'}
                </span>
              </div>
            ) : activeToolsList.length === 0 ? (
              <div className="text-center py-24 bg-white/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-8">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">لا توجد أدوات مطابقة لمعايير البحث</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-6 max-w-md mx-auto">
                  جرّب تغيير كلمات البحث أو إعادة تعيين الفلاتر لعرض كل الأدوات المتاحة.
                </p>
                <button
                  onClick={() => setFilters({ category: 'All', pricing: 'All', searchQuery: '', isAiSearch: false })}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all"
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
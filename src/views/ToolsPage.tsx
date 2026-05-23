"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';
import ToolsGrid from '../components/tools/ToolsGrid';
import ToolFilters from '../components/tools/ToolFilters';
import AllCategoriesView from '../components/tools/AllCategoriesView';
import BeginnerHelper from '../components/tools/BeginnerHelper';
import ToolDrawer from '../components/tools/ToolDrawer';
import { FilterOptions, Tool } from '../types/index';
import { useTools } from '../hooks/useTools';
import { useAuth } from '../context/AuthContext';
import { Loader, Sparkles } from 'lucide-react';

const ToolsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { refreshTools, filterToolsByOptions, isLoading, error } = useTools();
  const { user } = useAuth();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
      isAiSearch: filters.isAiSearch // preserve current AI Search state
    };

    setFilters(newFilters);

    // Trigger server-side fetch with new filters
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

  // Debounced/triggered semantic search effect
  useEffect(() => {
    if (filters.isAiSearch && filters.searchQuery) {
      const delayDebounce = setTimeout(() => {
        triggerSemanticSearch(filters.searchQuery || '');
      }, 500); // 500ms debounce to prevent hammering the vector API
      return () => clearTimeout(delayDebounce);
    } else {
      setSemanticTools([]);
    }
  }, [filters.searchQuery, filters.isAiSearch, triggerSemanticSearch]);

  const filteredTools = filterToolsByOptions(filters);

  // Check if no filters are applied
  const noFiltersApplied = 
    filters.category === 'All' && 
    filters.pricing === 'All' && 
    !filters.searchQuery && 
    !filters.isAiSearch;

  // Decide which tools and states to display
  const showSemanticResults = filters.isAiSearch && filters.searchQuery;
  const activeToolsList = showSemanticResults ? semanticTools : filteredTools;
  const isCurrentlyLoading = showSemanticResults ? isSemanticLoading : isLoading;

  return (
    <PageLayout>
      <div className="relative min-h-screen bg-slate-50/50 dark:bg-[#090a0f] text-right">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 pt-32 md:pt-40">
          {/* Premium Header */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              أفضل أدوات <span className="text-indigo-600 dark:text-indigo-400">الذكاء الاصطناعي</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              دليلك الشامل لاستكشاف أكثر من 630 أداة مبتكرة مصنفة لتناسب جميع احتياجاتك الإبداعية والمهنية
            </p>
          </div>

          <div className="space-y-12">
            {/* Beginner Helper - Only show for guests when no filters applied */}
            {noFiltersApplied && !user && <BeginnerHelper />}

            {/* Filters Section - Sticky Premium Panel */}
            <div className="sticky top-[64px] z-40 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#090a0f]/95 backdrop-blur-md border-b border-white/5 transition-all duration-200">
               <ToolFilters
                filters={filters}
                setFilters={setFilters}
                showMobileFilters={showMobileFilters}
                setShowMobileFilters={setShowMobileFilters}
              />
            </div>

            {/* Content Logic */}
            <div className="relative min-h-[400px]">
              {noFiltersApplied ? (
                /* Root Directory View - Only Categories */
                <div className="mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                   <div className="flex items-center justify-end gap-3 mb-10">
                       <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">تصفح الفئات الرئيسية</h2>
                       <div className="w-12 h-1.5 bg-indigo-600 rounded-full" />
                   </div>
                   <AllCategoriesView />
                </div>
              ) : (
                /* Filtered View - Show Tools */
                <div>
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                          {isCurrentlyLoading && <Loader className="w-4 h-4 animate-spin text-indigo-500" />}
                          <span className="text-sm font-black text-slate-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                              {activeToolsList.length} أداة
                          </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                              {showSemanticResults ? (
                                <>
                                  <span className="text-indigo-400">نتائج البحث الذكي</span>
                                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                                </>
                              ) : (
                                filters.searchQuery ? 'نتائج البحث' : `أدوات ${filters.category}`
                              )}
                          </h2>
                          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                      </div>
                  </div>

                  {isCurrentlyLoading && activeToolsList.length === 0 ? (
                    <div className="flex justify-center items-center py-32">
                      <div className="flex flex-col items-center gap-4">
                        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="text-sm font-bold text-slate-400">
                          {showSemanticResults ? 'جاري إجراء بحث دلالي ذكي بالذكاء الاصطناعي...' : 'جاري تحميل الأدوات...'}
                        </span>
                      </div>
                    </div>
                  ) : activeToolsList.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 dark:bg-slate-900/10 rounded-[32px] border border-dashed border-white/5">
                      <p className="text-slate-400 font-bold mb-4">لا توجد أدوات مطابقة للبحث حالياً.</p>
                      <button 
                        onClick={() => setFilters({ category: 'All', pricing: 'All', searchQuery: '', isAiSearch: false })}
                        className="text-indigo-400 font-black hover:underline"
                      >
                        العودة للرئيسية
                      </button>
                    </div>
                  ) : (
                    <ToolsGrid 
                      tools={activeToolsList} 
                      enableInfiniteScroll={!showSemanticResults} // disable infinite scroll on semantic searches
                    />
                  )}
                </div>
              )}
            </div>
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
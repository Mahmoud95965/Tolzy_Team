"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';
import ToolsGrid from '../components/tools/ToolsGrid';
import ToolFilters from '../components/tools/ToolFilters';
import AllCategoriesView from '../components/tools/AllCategoriesView';
import CategoryToolsView from '../components/tools/CategoryToolsView';
import BeginnerHelper from '../components/tools/BeginnerHelper';
import { FilterOptions, ToolCategory } from '../types/index';
import { useTools } from '../hooks/useTools';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

const ToolsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { refreshTools, filterToolsByOptions, isLoading, error } = useTools();
  const { user } = useAuth();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filters from URL parameters
  const categoryParam = searchParams.get('category');
  const pricingParam = searchParams.get('pricing');
  const qParam = searchParams.get('q') || '';

  const [filters, setFilters] = useState<FilterOptions>({
    category: categoryParam as FilterOptions['category'] || 'All',
    pricing: (pricingParam as FilterOptions['pricing']) || 'All',
    searchQuery: qParam
  });

  // Update filters when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const pricingParam = searchParams.get('pricing');
    const qParam = searchParams.get('q') || '';

    const newFilters = {
      category: categoryParam as FilterOptions['category'] || 'All',
      pricing: (pricingParam as FilterOptions['pricing']) || 'All',
      searchQuery: qParam
    };

    setFilters(newFilters);

    // Trigger server-side fetch with new filters
    refreshTools(newFilters);
  }, [searchParams, refreshTools]);

  const filteredTools = filterToolsByOptions(filters);

  // Check if no filters are applied
  const noFiltersApplied = filters.category === 'All' && filters.pricing === 'All' && !filters.searchQuery;

  // Check if only category is selected (no pricing filter or search)
  const onlyCategorySelected = filters.category !== 'All' && filters.pricing === 'All' && !filters.searchQuery;

  return (
    <PageLayout>
      <div className="relative min-h-screen bg-slate-50/50 dark:bg-[#0B0F17]">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 pt-32 md:pt-40">
          {/* Simple Premium Header */}
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

            {/* Filters Section - Stable & Compact Sticky */}
            <div className="sticky top-[64px] z-40 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 bg-slate-50/98 dark:bg-[#0B0F17]/98 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm transition-all duration-200">
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
                   <div className="flex items-center gap-3 mb-10">
                       <div className="w-12 h-1.5 bg-indigo-600 rounded-full" />
                       <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">تصفح الفئات الرئيسية</h2>
                   </div>
                   <AllCategoriesView />
                </div>
              ) : (
                /* Filtered View - Show Tools */
                <div>
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                              {filters.searchQuery ? 'نتائج البحث' : `أدوات ${filters.category}`}
                          </h2>
                      </div>
                      <div className="flex items-center gap-2">
                          {isLoading && <Loader className="w-4 h-4 animate-spin text-indigo-500" />}
                          <span className="text-sm font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-full border border-slate-200/50 dark:border-white/5">
                              {filteredTools.length} أداة
                          </span>
                      </div>
                  </div>

                  {filteredTools.length === 0 && !isLoading ? (
                    <div className="text-center py-24 bg-white dark:bg-slate-900/50 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10">
                      <p className="text-slate-500 font-bold mb-4">لا توجد أدوات مطابقة للبحث حالياً.</p>
                      <button 
                        onClick={() => setFilters({ category: 'All', pricing: 'All', searchQuery: '' })}
                        className="text-indigo-600 font-black hover:underline"
                      >
                        العودة للرئيسية
                      </button>
                    </div>
                  ) : (
                    <ToolsGrid tools={filteredTools} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ToolsPage;
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterOptions, ToolCategory, ToolPricing } from '../../types';
import { Search, RotateCcw } from 'lucide-react';

// Categories and pricing options
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

  const resetFilters = () => {
    setFilters({
      category: 'All',
      pricing: 'All',
      searchQuery: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar - Simple Design */}
      <div className="max-w-3xl mx-auto relative">
        <input
          type="text"
          placeholder="ابحث عن أداة ذكاء اصطناعي..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 transition-colors shadow-sm"
          dir="rtl"
        />
        <div className="absolute top-0 right-0 h-full w-14 flex items-center justify-center text-slate-400">
          <Search className="w-6 h-6" />
        </div>
      </div>

      {/* Category Navigation - Simple Pills */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">تصفح حسب الفئة</h3>
            {filters.category !== 'All' && (
                <button 
                  onClick={() => handleCategoryChange('All')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                >
                  عرض الكل
                </button>
            )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold border transition-colors ${filters.category === 'All'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
          >
            الكل
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold border transition-colors ${filters.category === cat
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}

          {filters.searchQuery && (
            <button
              onClick={resetFilters}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
              title="إعادة ضبط"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolFilters;
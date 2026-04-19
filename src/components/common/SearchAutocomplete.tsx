"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useTools } from '../../hooks/useTools';
import type { ToolCategory, ToolPricing } from '../../types';
import type { Tool } from '../../types/tool';

// Categories and pricing options for search
const categories: ToolCategory[] = [
  '3D', 'Automation', 'Business', 'Collaboration', 'Communication', 'Creativity',
  'Data Science', 'Design', 'Education', 'Electronics', 'Freelancing', 'Gamification',
  'Games', 'Language Learning', 'Library', 'Lifestyle', 'Math', 'Memory',
  'Online Learning', 'Other', 'Productivity', 'Programming', 'Project Management',
  'Reading', 'Research', 'Science', 'Studying', 'Teaching', 'Technology',
  'Test Prep', 'Video', 'Writing'
];

const pricingOptions: ToolPricing[] = ['Free', 'Freemium', 'Paid', 'Subscription'];

interface SearchAutocompleteProps {
  placeholder?: string;
  inputClassName?: string;
  containerClassName?: string;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  placeholder,
  inputClassName = '',
  containerClassName = ''
}) => {
  const { t, i18n } = useTranslation();
  const { tools } = useTools();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const isRtl = i18n.dir() === 'rtl';

  const suggestions: Tool[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const scored = tools
      .map(tool => {
        const nameMatch = tool.name.toLowerCase().includes(q) ? 3 : 0;
        const tagMatch = tool.tags.some(tag => tag.toLowerCase().includes(q)) ? 2 : 0;
        const descMatch = tool.description.toLowerCase().includes(q) ? 1 : 0;
        const score = nameMatch + tagMatch + descMatch;
        return { tool, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map(x => x.tool);

    return scored;
  }, [tools, query]);

  const categoryMatches: ToolCategory[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return categories.filter(c => c.toLowerCase().includes(q)).slice(0, 4);
  }, [query]);

  const pricingMatches: ToolPricing[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pricingOptions.filter(p => p.toLowerCase().includes(q)).slice(0, 3);
  }, [query]);

  useEffect(() => {
    setOpen(suggestions.length > 0);
    setActiveIndex(-1);
  }, [suggestions.length]);

  const submitSearch = (value?: string) => {
    const q = (value ?? query).trim();
    if (!q) return;
    router.push(`/tools?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const sel = suggestions[activeIndex];
        router.push(`/tools/${sel.id}`);
        setOpen(false);
      } else {
        submitSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const highlight = (text: string) => {
    const q = query.trim();
    if (!q) return text;
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapeRegExp(q)})`, 'ig');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 text-gray-900 dark:text-yellow-100 rounded px-0.5">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500`} />
      <input
        type="text"
        dir={isRtl ? 'rtl' : 'ltr'}
        placeholder={placeholder || t('search.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(suggestions.length > 0)}
        onKeyDown={onKeyDown}
        className={`w-full ${isRtl ? 'pr-10 pl-20' : 'pl-10 pr-20'} py-3 text-gray-800 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${inputClassName}`}
      />
      <button
        type="button"
        onClick={() => submitSearch()}
        className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-white px-3 py-1.5 rounded-md text-sm font-medium`}
      >
        {t('common.search')}
      </button>

      {open && (suggestions.length > 0 || categoryMatches.length > 0 || pricingMatches.length > 0) && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-2 w-full max-h-80 overflow-auto rounded-lg bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
        >
          {categoryMatches.length > 0 && (
            <li className="px-4 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-right">
              فئات
            </li>
          )}
          {categoryMatches.map((cat) => (
            <li
              key={`cat-${cat}`}
              className="cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-gray-800"
              onClick={() => router.push(`/tools?category=${encodeURIComponent(cat)}`)}
            >
              <span className="text-gray-700 dark:text-gray-200">{t(`categories.${cat}`)}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">فلترة حسب الفئة</span>
            </li>
          ))}

          {pricingMatches.length > 0 && (
            <li className="px-4 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-right">
              الأسعار
            </li>
          )}
          {pricingMatches.map((price) => (
            <li
              key={`price-${price}`}
              className="cursor-pointer px-4 py-2 text-sm flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-gray-800"
              onClick={() => router.push(`/tools?pricing=${encodeURIComponent(price)}`)}
            >
              <span className="text-gray-700 dark:text-gray-200">
                {price === 'Free' ? 'مجاني' : price === 'Freemium' ? 'مجاني مع مميزات مدفوعة' : price === 'Paid' ? 'مدفوع' : 'اشتراك'}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">فلترة حسب السعر</span>
            </li>
          ))}

          {suggestions.length > 0 && (
            <li className="px-4 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-right">
              أدوات
            </li>
          )}
          {suggestions.map((tool, idx) => (
            <li
              key={tool.id}
              className={`cursor-pointer px-4 py-3 text-sm flex items-start justify-between gap-3 ${idx === activeIndex ? 'bg-indigo-50 dark:bg-gray-800' : 'bg-transparent'
                }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
              onClick={() => router.push(`/tools/${tool.id}`)}
            >
              <div className="flex-1 text-right">
                <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{highlight(tool.name)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{highlight(tool.description)}</div>
                <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                  <span className="ml-2">{tool.category}</span>
                  {tool.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-block ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">#{tag}</span>
                  ))}
                </div>
              </div>
            </li>
          ))}
          <li className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-100 dark:border-gray-800">
            {t('common.viewAll')}
          </li>
        </ul>
      )}
    </div>
  );
};

export default SearchAutocomplete;



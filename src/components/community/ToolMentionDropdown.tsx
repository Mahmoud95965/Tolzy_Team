'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ArrowUpRight, Search } from 'lucide-react';
import ToolImage from '../common/ToolImage';
import { Tool } from '../../types/tool';

interface ToolMentionDropdownProps {
  isOpen: boolean;
  searchQuery: string;
  onSelect: (tool: Tool) => void;
  onClose: () => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onMatchesChange?: (matches: Tool[]) => void;
  className?: string;
}

// Module-level query cache so repeated letters or backspaces resolve instantly (0ms)
const queryCache = new Map<string, Tool[]>();

export const ToolMentionDropdown: React.FC<ToolMentionDropdownProps> = ({
  isOpen,
  searchQuery,
  onSelect,
  onClose,
  activeIndex,
  setActiveIndex,
  onMatchesChange,
  className = '',
}) => {
  const [matchingTools, setMatchingTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeFetchIdRef = useRef(0);

  const cleanQuery = useMemo(() => (searchQuery || '').trim().toLowerCase(), [searchQuery]);

  // Fetch tools dynamically across ALL 1,000+ tools from API with debounce & memory cache
  useEffect(() => {
    if (!isOpen) {
      setMatchingTools([]);
      setIsLoading(false);
      onMatchesChange?.([]);
      return;
    }

    // 1. Check in-memory cache first for instant UI response
    if (queryCache.has(cleanQuery)) {
      const cached = queryCache.get(cleanQuery)!;
      setMatchingTools(cached);
      setIsLoading(false);
      onMatchesChange?.(cached);
      return;
    }

    // 2. Debounce fetch across all 1,000+ tools
    setIsLoading(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const fetchId = ++activeFetchIdRef.current;

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const url = `/api/tools/mention-search?q=${encodeURIComponent(cleanQuery)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();

        if (activeFetchIdRef.current === fetchId) {
          const rawTools = data.tools || [];
          const normalized: Tool[] = rawTools.map((t: any) => ({
            id: String(t.id),
            name: String(t.name),
            description: String(t.description || ''),
            longDescription: String(t.description || ''),
            category: t.category || 'General',
            pricing: t.pricing || 'Freemium',
            imageUrl: t.imageUrl || '',
            url: t.url || '',
            tags: [],
            features: [],
            rating: typeof t.rating === 'number' ? t.rating : 4.8,
            reviewCount: typeof t.reviewCount === 'number' ? t.reviewCount : 1,
            isNew: Boolean(t.isNew),
            isFeatured: Boolean(t.isFeatured),
            isPopular: Boolean(t.isPopular),
            votes: { helpful: [], notHelpful: [] },
            votingStats: { helpfulCount: 0, notHelpfulCount: 0, totalVotes: 0 },
            savedBy: [],
          }));

          queryCache.set(cleanQuery, normalized);
          setMatchingTools(normalized);
          onMatchesChange?.(normalized);
        }
      } catch (err) {
        if (activeFetchIdRef.current === fetchId) {
          setMatchingTools([]);
          onMatchesChange?.([]);
        }
      } finally {
        if (activeFetchIdRef.current === fetchId) {
          setIsLoading(false);
        }
      }
    }, 70); // 70ms debounce for natural typing feel

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isOpen, cleanQuery, onMatchesChange]);

  // Scroll active item into view when activeIndex changes
  useEffect(() => {
    if (dropdownRef.current && activeIndex >= 0) {
      const listContainer = dropdownRef.current.querySelector('.tools-scroll-list');
      if (listContainer) {
        const activeElement = listContainer.children[activeIndex] as HTMLElement;
        if (activeElement) {
          activeElement.scrollIntoView({ block: 'nearest' });
        }
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className={`absolute z-50 w-full max-w-md mt-1.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-2xl p-2 space-y-1.5 overflow-hidden ${className}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
        dir="rtl"
      >
        {/* Header Bar */}
        <div className="px-2.5 py-1.5 flex items-center justify-between text-xs font-bold text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80 pb-2">
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بحث في دليل الأدوات (+1,000 أداة)</span>
          </span>
          <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                <span className="text-blue-500">جاري البحث...</span>
              </>
            ) : (
              <span>{matchingTools.length} نتائج</span>
            )}
          </span>
        </div>

        {/* Tools Results List */}
        <div className="tools-scroll-list max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
          {matchingTools.map((tool, index) => {
            const isSelected = index === activeIndex;
            const categoryStr = Array.isArray(tool.category)
              ? tool.category[0]
              : tool.category || 'أداة ذكية';

            return (
              <button
                key={tool.id}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(tool);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/40 shadow-xs'
                    : 'hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {/* Logo + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                    <ToolImage
                      name={tool.name}
                      imageUrl={tool.imageUrl}
                      size="sm"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate text-neutral-900 dark:text-white">
                        {tool.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium truncate">
                        • {categoryStr}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {tool.description || 'أداة ذكاء اصطناعي معتمدة في دليل TOLZY'}
                    </p>
                  </div>
                </div>

                {/* Pricing & Selection indicator */}
                <div className="shrink-0 flex items-center gap-2 mr-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      tool.pricing === 'Free'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60'
                        : tool.pricing === 'Freemium'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60'
                    }`}
                  >
                    {tool.pricing === 'Free'
                      ? 'مجاني'
                      : tool.pricing === 'Freemium'
                      ? 'Freemium'
                      : 'مدفوع'}
                  </span>

                  {isSelected && (
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 shrink-0 hidden sm:inline" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Empty state when 0 matches found */}
          {!isLoading && matchingTools.length === 0 && (
            <div className="py-6 px-4 text-center space-y-1.5">
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                لم يتم العثور على أداة مطابقة لـ &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-[11px] text-neutral-400">
                جرب كتابة أحرف أخرى، أو تابع الكتابة كاسم عادي.
              </p>
            </div>
          )}

          {/* Initial loading state */}
          {isLoading && matchingTools.length === 0 && (
            <div className="py-6 px-4 text-center space-y-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                جاري البحث بالحروف في جميع أدوات الدليل...
              </p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-2.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
          <span>استخدم الأسهم ⇅ للتنقل</span>
          <span>اضغط Enter ↵ لإدراج بطاقة الأداة</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToolMentionDropdown;

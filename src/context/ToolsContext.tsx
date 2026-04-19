"use client";
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { Tool, FilterOptions } from '../types/index';
import { filterTools } from '../utils/filterTools';
import { getPaginatedTools, getFeaturedTools, getPopularTools, getNewTools, getCategoryCount as getCategoryCountService } from '../services/tools.service';

const TOOLS_PER_PAGE = 40;

interface ToolsContextType {
  tools: Tool[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  featuredTools: Tool[];
  popularTools: Tool[];
  newTools: Tool[];
  loadMore: () => Promise<void>;
  getToolById: (id: string) => Tool | undefined;
  getRelatedTools: (tool: Tool, limit?: number) => Tool[];
  filterToolsByOptions: (options: FilterOptions) => Tool[];
  refreshTools: (filters: FilterOptions) => Promise<void>;
  updateTool: (toolId: string, updates: Partial<Tool>) => void;
  getCategoryCount: (category: string) => Promise<number>;
}

export const ToolsContext = createContext<ToolsContextType | null>(null);

export const ToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [popularTools, setPopularTools] = useState<Tool[]>([]);
  const [newTools, setNewTools] = useState<Tool[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [lastCursorParam, setLastCursorParam] = useState<any[] | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    category: 'All',
    pricing: 'All',
    searchQuery: ''
  });

  const CACHE_KEY_TOOLS = 'tolzy_cached_tools_v2_';
  const CACHE_KEY_COUNTS_PREFIX = 'tolzy_cached_count_';
  const CACHE_EXPIRY = 60 * 60 * 1000; // 1 ساعة
  const CACHE_EXPIRY_COUNTS = 24 * 60 * 60 * 1000; // 24 ساعة

  const inFlightCountRequestsRef = useRef(new Map<string, Promise<number>>());

  const getCache = (key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > (key.startsWith(CACHE_KEY_COUNTS_PREFIX) ? CACHE_EXPIRY_COUNTS : CACHE_EXPIRY)) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  };

  const setCache = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
      console.error('Error saving to cache', e);
    }
  };

  const getCategoryCountDeduped = useCallback(async (category: string) => {
    const cacheKey = CACHE_KEY_COUNTS_PREFIX + category;
    const cachedCount = getCache(cacheKey);
    if (cachedCount !== null) {
      return cachedCount as number;
    }

    const inFlight = inFlightCountRequestsRef.current.get(category);
    if (inFlight) {
      return inFlight;
    }

    const promise = (async () => {
      try {
        const count = await getCategoryCountService(category);
        setCache(cacheKey, count);
        return count;
      } finally {
        inFlightCountRequestsRef.current.delete(category);
      }
    })();

    inFlightCountRequestsRef.current.set(category, promise);
    return promise;
  }, []);

  const prefetchCategoryCounts = useCallback(async (categories: string[]) => {
    const unique = Array.from(new Set(categories)).filter(Boolean);
    await Promise.all(unique.map((cat) => getCategoryCountDeduped(cat)));
  }, [getCategoryCountDeduped]);

  // دالة لجلب الأدوات الخاص (المميزة، الشائعة، الجديدة) بشكل مستقل
  const fetchSpecialTools = async () => {
    try {
      const [featured, popular, newly] = await Promise.all([
        getFeaturedTools(8),
        getPopularTools(8),
        getNewTools(8)
      ]);
      setFeaturedTools(featured);
      setPopularTools(popular);
      setNewTools(newly);
    } catch (err) {
      console.error('Error fetching special tools:', err);
    }
  };

  // تحميل الأدوات الرئيسية (مع الفلتر)
  const refreshTools = useCallback(async (filters: FilterOptions = { category: 'All', pricing: 'All', searchQuery: '' }) => {
    console.log('🔄 Refreshing tools with filters:', filters);
    setIsLoading(true);
    setError(null);
    setCurrentFilters(filters);
    setLastDoc(null);
    setLastCursorParam(null);

    try {
      // تحديد مفتاح الكاش بناًء على الفلتر
      let cacheKey = CACHE_KEY_TOOLS;
      const isDefault = filters.category === 'All' && filters.pricing === 'All' && !filters.searchQuery;
      const isSimpleCategory = filters.category !== 'All' && filters.pricing === 'All' && !filters.searchQuery;

      if (isDefault) {
        cacheKey = `${CACHE_KEY_TOOLS}All`;
      } else if (isSimpleCategory) {
        cacheKey = `${CACHE_KEY_TOOLS}${filters.category}`;
      } else {
        cacheKey = ''; // لا نقم بالتخزين المؤقت للفلاتر المعقدة حالياً
      }

      // محاولة التحميل من الكاش إذا كان المفتاح صالحاً
      if (cacheKey) {
        const cachedTools = getCache(cacheKey);
        if (cachedTools && Array.isArray(cachedTools) && cachedTools.length > 0) {
          console.log(`📦 Loaded tools from Cache (${cacheKey})`);
          setTools(cachedTools);
          // إعداد مؤشر للصفحة التالية بناءً على آخر عنصر في الكاش
          const lastTool = cachedTools[cachedTools.length - 1];
          if (lastTool) {
            setLastCursorParam([lastTool.id]);
          }
          setHasMore(true);
          setIsLoading(false);
          return;
        }
      }

      const categoryFilter = filters.category !== 'All' ? filters.category : undefined;
      const result = await getPaginatedTools(TOOLS_PER_PAGE, null, categoryFilter);

      setTools(result.tools);
      setLastDoc(result.lastDoc);

      // إذا كان لدينا lastDoc، نستخدمه، وإلا (في حالة نادرة) نستخدم القيم. لكن هنا نحن نحصل على snapshot حقيقي
      if (result.lastDoc) setLastCursorParam(null);

      setHasMore(result.hasMore);
      setIsLoading(false);

      if (cacheKey && result.tools.length > 0) {
        setCache(cacheKey, result.tools);
      }

      console.log(`✅ Loaded ${result.tools.length} tools successfully (More: ${result.hasMore})`);
    } catch (err: any) {
      console.error('❌ Error loading tools:', err);
      setError('حدث خطأ في تحميل الأدوات. يرجى التحقق من إعدادات Firebase.');
      setIsLoading(false);
    }
  }, []);

  // تحميل المزيد من الأدوات (مع الحفاظ على الفلتر الحالي)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || (!lastDoc && !lastCursorParam)) {
      return;
    }

    console.log('📥 Loading more tools...');
    setIsLoadingMore(true);

    try {
      const categoryFilter = currentFilters.category !== 'All' ? currentFilters.category : undefined;
      // استخدام lastDoc إذا وجد، وإلا lastCursorParam
      const cursor = lastDoc || lastCursorParam;

      const result = await getPaginatedTools(TOOLS_PER_PAGE, cursor, categoryFilter);

      setTools(prevTools => {
        // تجنب التكرار
        const existingIds = new Set(prevTools.map(t => t.id));
        const newTools = result.tools.filter(t => !existingIds.has(t.id));
        return [...prevTools, ...newTools];
      });

      setLastDoc(result.lastDoc);
      // إذا حصلنا على result.lastDoc، نلغي lastCursorParam لأننا سنعتمد على lastDoc مستقبلاً
      if (result.lastDoc) setLastCursorParam(null);

      setHasMore(result.hasMore);
      console.log(`✅ Loaded ${result.tools.length} more tools (hasMore: ${result.hasMore})`);
    } catch (err: any) {
      console.error('❌ Error loading more tools:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, lastDoc, lastCursorParam, currentFilters]);

  useEffect(() => {
    // تحميل الأدوات الخاصة مرة واحدة عند البدء
    fetchSpecialTools();
    // تحميل القائمة الرئيسية
    refreshTools();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getToolById = useCallback((id: string) => {
    const normalizedId = id.toString().padStart(3, '0');
    // البحث في جميع القوائم المتاحة
    return tools.find(tool => tool.id === normalizedId) ||
      featuredTools.find(tool => tool.id === normalizedId) ||
      popularTools.find(tool => tool.id === normalizedId) ||
      newTools.find(tool => tool.id === normalizedId);
  }, [tools, featuredTools, popularTools, newTools]);

  const value: ToolsContextType = React.useMemo(() => ({
    tools,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    featuredTools,
    popularTools,
    newTools,
    loadMore,
    getToolById,
    getRelatedTools: (tool: Tool, limit: number = 3) => {
      const toolCategories = Array.isArray(tool.category) ? tool.category : [tool.category];
      const allAvailableTools = [...tools, ...featuredTools];
      const uniqueTools = Array.from(new Set(allAvailableTools.map(t => t.id)))
        .map(id => allAvailableTools.find(t => t.id === id)!);

      return uniqueTools
        .filter(t => {
          if (t.id === tool.id) return false;
          const tCategories = Array.isArray(t.category) ? t.category : [t.category];
          const hasCommonCategory = tCategories.some(cat => toolCategories.includes(cat));
          const hasCommonTag = t.tags.some(tag => tool.tags.includes(tag));
          return hasCommonCategory || hasCommonTag;
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    },
    filterToolsByOptions: (options: FilterOptions) => filterTools(tools, options),
    refreshTools,
    updateTool: (toolId: string, updates: Partial<Tool>) => {
      setTools(prev => prev.map(t => t.id === toolId ? { ...t, ...updates } : t));
      setFeaturedTools(prev => prev.map(t => t.id === toolId ? { ...t, ...updates } : t));
      setPopularTools(prev => prev.map(t => t.id === toolId ? { ...t, ...updates } : t));
      setNewTools(prev => prev.map(t => t.id === toolId ? { ...t, ...updates } : t));
    },
    getCategoryCount: getCategoryCountDeduped
  }), [
    tools,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    featuredTools,
    popularTools,
    newTools,
    loadMore,
    getToolById,
    refreshTools,
    setTools,
    setFeaturedTools,
    setPopularTools,
    setNewTools,
    getCategoryCountDeduped,
  ]);

  return (
    <ToolsContext.Provider value={value}>
      {children}
    </ToolsContext.Provider>
  );
};

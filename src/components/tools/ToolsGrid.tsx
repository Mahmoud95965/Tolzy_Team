"use client";
import React, { useRef, useEffect } from 'react';
import { Tool } from '../../types/index';
import ToolCard from './ToolCard';
import { useTools } from '../../hooks/useTools';
import { Loader } from 'lucide-react';

interface ToolsGridProps {
  tools: Tool[];
  title?: string;
  enableInfiniteScroll?: boolean;
}

const ToolsGrid: React.FC<ToolsGridProps> = ({ tools, title, enableInfiniteScroll = true }) => {
  const { loadMore, hasMore, isLoadingMore } = useTools();
  const loadingRef = useRef<HTMLDivElement>(null);

  // Intersection Observer للتحميل التلقائي عند الوصول لنهاية القائمة
  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          console.log('🔄 Triggering loadMore from IntersectionObserver');
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, loadMore, enableInfiniteScroll]);

  if (tools.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">لا توجد أدوات متاحة</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">جرّب تعديل الفلاتر أو إعادة كتابة عبارة البحث.</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* منطقة تحميل المزيد */}
      {enableInfiniteScroll && (
        <div
          ref={loadingRef}
          className="flex justify-center items-center py-8 mt-4"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <Loader className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">جاري تحميل المزيد من الأدوات...</span>
            </div>
          )}
          {!hasMore && tools.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تم عرض جميع الأدوات ({tools.length} أداة)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolsGrid;
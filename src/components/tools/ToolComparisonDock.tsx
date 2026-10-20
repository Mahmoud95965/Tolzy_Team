"use client";

import React from 'react';
import { useCompare } from '@/src/context/CompareContext';
import ToolImage from '@/src/components/common/ToolImage';
import { ArrowLeftRight, X, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToolComparisonDock() {
  const { compareList, removeFromCompare, clearCompare, openModal } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        aria-label="شريط مقارنة الأدوات"
        className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl"
      >
        <div className="bg-[#14140f] text-[#f5f5eb] border border-[#30302a] rounded-2xl sm:rounded-[28px] p-2 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between gap-2 sm:gap-3 backdrop-blur-md">
          {/* Left / Action side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={openModal}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-[28px] bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 shadow-none whitespace-nowrap cursor-pointer select-none"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">قارن الآن ({compareList.length})</span>
              <span className="xs:hidden">قارن ({compareList.length})</span>
            </button>

            <button
              onClick={clearCompare}
              className="p-1.5 sm:p-2 rounded-full text-[#6e6e64] hover:text-[#f5f5eb] hover:bg-[#30302a] transition-colors"
              title="إفراغ المقارنة"
              aria-label="إفراغ قائمة المقارنة"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Right / Selected Tools preview pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {compareList.map((tool) => (
              <div
                key={tool.id}
                className="group relative flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[#1c1c16] border border-[#30302a] hover:border-[#beff50]/50 transition-colors shrink-0"
              >
                <div className="w-6 h-6 rounded-full bg-[#ffffff] p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                  <ToolImage
                    name={tool.name}
                    categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                    size="sm"
                  />
                </div>
                <span className="text-xs font-normal text-[#f5f5eb] max-w-[90px] truncate">
                  {tool.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCompare(tool.id);
                  }}
                  className="w-4 h-4 rounded-full bg-[#30302a] hover:bg-[#beff50] hover:text-[#14140f] text-[#d2d2c8] flex items-center justify-center transition-colors ml-0.5"
                  title={`إزالة ${tool.name}`}
                  aria-label={`إزالة ${tool.name} من المقارنة`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}

            {/* Empty slot indicator if < 4 */}
            {compareList.length < 4 && (
              <div
                onClick={openModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-[#30302a] text-[#6e6e64] hover:text-[#beff50] hover:border-[#beff50] transition-colors text-xs font-normal cursor-pointer select-none"
              >
                <Plus className="w-3 h-3" />
                <span>أضف أداة أخرى</span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

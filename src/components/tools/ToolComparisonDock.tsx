"use client";

import React from 'react';
import { useCompare } from '@/src/context/CompareContext';
import ToolImage from '@/src/components/common/ToolImage';
import { ArrowLeftRight, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToolComparisonDock() {
  const { compareList, removeFromCompare, clearCompare, openModal } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        aria-label="شريط مقارنة الأدوات"
        className="fixed bottom-[68px] sm:bottom-6 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto px-2.5 sm:px-0 z-40 select-none pointer-events-none"
        dir="rtl"
      >
        <div className="pointer-events-auto mx-auto max-w-sm sm:max-w-xl bg-[#14140f] text-[#ffffff] border border-[#30302a] rounded-full p-1.5 sm:p-2 px-2.5 sm:px-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Right side (RTL): Avatars + Counter + Name */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Tool Avatars Stack */}
            <div className="flex items-center -space-x-1.5 space-x-reverse shrink-0">
              {compareList.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => removeFromCompare(tool.id)}
                  type="button"
                  className="group relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffffff] border-2 border-[#14140f] overflow-hidden flex items-center justify-center cursor-pointer shrink-0 transition-transform active:scale-90"
                  title={`إزالة ${tool.name}`}
                  aria-label={`إزالة ${tool.name} من المقارنة`}
                >
                  <ToolImage
                    name={tool.name}
                    categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                    size="sm"
                  />
                  <div className="absolute inset-0 bg-[#14140f]/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <X className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>

            {/* Counter Badge */}
            <span className="px-2 py-0.5 rounded-full bg-[#beff50] text-[#14140f] text-[10px] font-black font-mono shrink-0">
              {compareList.length}/4
            </span>

            {/* Tool Names / Context */}
            <div className="min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-white block truncate max-w-[90px] sm:max-w-[180px]">
                {compareList.length === 1
                  ? compareList[0].name
                  : `${compareList[compareList.length - 1].name} +${compareList.length - 1}`}
              </span>
            </div>
          </div>

          {/* Left side (RTL): Compare & Dismiss */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={openModal}
              type="button"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] text-xs font-black transition-all flex items-center gap-1 sm:gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>قارن ({compareList.length})</span>
            </button>

            <button
              onClick={clearCompare}
              type="button"
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[#a0a096] hover:text-[#ffffff] hover:bg-white/10 transition-colors cursor-pointer"
              title="إفراغ المقارنة"
              aria-label="إفراغ قائمة المقارنة"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

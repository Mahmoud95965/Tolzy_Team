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
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        aria-label="شريط مقارنة الأدوات"
        className="fixed bottom-[74px] sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl select-none"
        dir="rtl"
      >
        <div className="bg-[#14140f]/95 text-[#f5f5eb] border border-[#beff50]/30 rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md flex items-center justify-between gap-3">
          
          {/* Left / Avatars of selected tools */}
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <div className="flex items-center -space-x-2 space-x-reverse shrink-0">
              {compareList.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => removeFromCompare(tool.id)}
                  className="group relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffffff] border-2 border-[#14140f] overflow-hidden flex items-center justify-center cursor-pointer shadow-xs shrink-0 transition-transform hover:scale-110"
                  title={`إزالة ${tool.name}`}
                >
                  <ToolImage
                    name={tool.name}
                    categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                    size="sm"
                  />
                  <div className="absolute inset-0 bg-[#14140f]/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <X className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>

            <div className="min-w-0 hidden xs:block">
              <span className="text-xs font-bold text-[#ffffff] block truncate">
                {compareList.map(t => t.name).join(' vs ')}
              </span>
              <span className="text-[10px] text-[#beff50] font-mono">
                {compareList.length}/4 أدوات محددة
              </span>
            </div>
          </div>

          {/* Right / Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={openModal}
              className="px-4 py-2 rounded-full bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>قارن الآن ({compareList.length})</span>
            </button>

            <button
              onClick={clearCompare}
              className="p-2 rounded-full text-[#a0a096] hover:text-[#ffffff] hover:bg-[#ffffff]/10 transition-colors cursor-pointer"
              title="إفراغ قائمة المقارنة"
              aria-label="إفراغ المقارنة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

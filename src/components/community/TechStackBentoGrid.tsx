'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Compass
} from 'lucide-react';
import ToolImage from '../common/ToolImage';
import { StackToolItem } from '../../types/community';
import { formatTechStackShareText } from '../../utils/stackAndPollHelpers';
import { toast } from 'react-hot-toast';

interface TechStackBentoGridProps {
  title?: string;
  tools: StackToolItem[];
}

export const TechStackBentoGrid: React.FC<TechStackBentoGridProps> = ({
  title,
  tools,
}) => {
  const [copied, setCopied] = useState(false);

  if (!tools || tools.length === 0) return null;

  const handleCopyBundle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareText = formatTechStackShareText(title || '', tools);
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('تم نسخ روابط الحزمة مع ملاحظات سير العمل! 📋');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('تعذر نسخ روابط الحزمة');
    }
  };

  return (
    <div className="my-2.5 sm:my-3 space-y-2.5 sm:space-y-3" dir="rtl">
      {/* Bento Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#14140f] text-[#beff50] flex items-center justify-center shadow-xs shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-[#14140f] truncate">
            <span className="sm:hidden">حزمة أدوات ({tools.length})</span>
            <span className="hidden sm:inline">حزمة الأدوات المقترحة ({tools.length} أدوات)</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyBundle}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#ffffff] hover:bg-[#beff50] border border-[#d2d2c8] hover:border-[#14140f] text-[11px] font-bold text-[#14140f] transition-all cursor-pointer shadow-2xs shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">تم نسخ الروابط!</span>
              <span className="sm:hidden">تم النسخ</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نسخ الروابط</span>
              <span className="sm:hidden">نسخ</span>
            </>
          )}
        </button>
      </div>

      {/* Bento Grid */}
      <div
        className={`grid gap-2 sm:gap-2.5 ${
          tools.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : tools.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {tools.map((item, idx) => (
          <Link
            key={item.tool_id || idx}
            href={`/tools/${item.tool_id}`}
            onClick={(e) => e.stopPropagation()}
            className="group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] hover:border-[#14140f] shadow-2xs hover:shadow-xs transition-all duration-200 overflow-hidden"
          >
            {/* Top row: Tool info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#ffffff] border border-[#d2d2c8] p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <ToolImage
                    name={item.tool_name}
                    imageUrl={item.tool_imageUrl}
                    size="sm"
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#14140f] truncate group-hover:underline transition-colors">
                    {item.tool_name}
                  </h4>
                  {item.tool_category && (
                    <span className="text-[10px] text-[#6e6e64] block truncate">
                      {item.tool_category}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.tool_pricing && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ffffff] text-[#14140f] border border-[#d2d2c8]">
                    {item.tool_pricing === 'Free'
                      ? 'مجاني'
                      : item.tool_pricing === 'Freemium'
                      ? 'تجريبي'
                      : 'مدفوع'}
                  </span>
                )}
                <div className="w-6 h-6 rounded-lg bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] group-hover:bg-[#beff50] group-hover:border-[#14140f] transition-all">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Workflow Note Callout */}
            {item.note ? (
              <div className="mt-2.5 p-2 rounded-xl bg-[#ffffff] border border-[#d2d2c8] text-[11px] text-[#14140f] leading-relaxed flex items-start gap-1.5">
                <span className="font-bold shrink-0">💡</span>
                <span className="line-clamp-2">{item.note}</span>
              </div>
            ) : (
              <div className="mt-2 text-[10px] text-[#6e6e64]">
                اضغط لتفاصيل الأداة والبدائل ↗
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TechStackBentoGrid;

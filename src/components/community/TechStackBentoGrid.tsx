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
    <div className="my-3 space-y-3" dir="rtl">
      {/* Bento Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-neutral-900 dark:text-white">
            حزمة الأدوات المقترحة ({tools.length} أدوات)
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyBundle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>تم نسخ الروابط!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ روابط الحزمة</span>
            </>
          )}
        </button>
      </div>

      {/* Bento Grid */}
      <div
        className={`grid gap-2.5 ${
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
            className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/40 via-white to-neutral-50/60 dark:from-neutral-900/90 dark:via-neutral-900 dark:to-neutral-950 border border-neutral-200/80 dark:border-neutral-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Top row: Tool info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 p-1.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <ToolImage
                    name={item.tool_name}
                    imageUrl={item.tool_imageUrl}
                    size="sm"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.tool_name}
                  </h4>
                  {item.tool_category && (
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {item.tool_category}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.tool_pricing && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700">
                    {item.tool_pricing === 'Free'
                      ? 'مجاني'
                      : item.tool_pricing === 'Freemium'
                      ? 'تجريبي'
                      : 'مدفوع'}
                  </span>
                )}
                <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Workflow Note Callout */}
            {item.note ? (
              <div className="mt-3 p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold shrink-0">💡</span>
                <span className="line-clamp-2">{item.note}</span>
              </div>
            ) : (
              <div className="mt-2 text-[10px] text-neutral-400">
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

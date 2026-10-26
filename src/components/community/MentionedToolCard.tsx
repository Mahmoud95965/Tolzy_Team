'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, ExternalLink } from 'lucide-react';
import ToolImage from '../common/ToolImage';
import { Tool } from '../../types/tool';
import { getFallbackToolById } from '../../data/fallbackTools';
import { useTools } from '../../hooks/useTools';

interface MentionedToolCardProps {
  toolSlug: string;
  fallbackName?: string;
  className?: string;
}

// Module-level cache so every tool is only fetched once across all cards on the page
const clientToolCache = new Map<string, Tool>();

// Helper to safely cast any raw tool or partial tool into a full valid Tool interface
function toFullTool(raw: any, fallbackId: string, fallbackName?: string): Tool {
  return {
    id: String(raw?.id || fallbackId),
    name: String(raw?.name || fallbackName || fallbackId),
    description: String(raw?.description || 'أداة ذكاء اصطناعي معتمدة في دليل TOLZY'),
    longDescription: String(raw?.longDescription || raw?.description || ''),
    category: raw?.category || 'General',
    pricing: raw?.pricing || 'Freemium',
    imageUrl: raw?.imageUrl || '',
    url: raw?.url || '',
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    features: Array.isArray(raw?.features) ? raw.features : [],
    rating: typeof raw?.rating === 'number' ? raw.rating : 4.8,
    reviewCount: typeof raw?.reviewCount === 'number' ? raw.reviewCount : 1,
    isNew: Boolean(raw?.isNew),
    isFeatured: Boolean(raw?.isFeatured),
    isPopular: Boolean(raw?.isPopular),
    votes: raw?.votes || { helpful: [], notHelpful: [] },
    votingStats: raw?.votingStats || { helpfulCount: 0, notHelpfulCount: 0, totalVotes: 0 },
    savedBy: Array.isArray(raw?.savedBy) ? raw.savedBy : [],
  };
}

export const MentionedToolCard: React.FC<MentionedToolCardProps> = ({
  toolSlug,
  fallbackName,
  className = '',
}) => {
  const { tools: contextTools } = useTools();

  // Find tool locally first
  const localTool = useMemo(() => {
    if (!toolSlug) return null;
    const lower = toolSlug.toLowerCase();

    // 1. Check in-memory cache
    if (clientToolCache.has(lower)) {
      return clientToolCache.get(lower)!;
    }

    // 2. Check context tools
    const fromContext = contextTools?.find(
      (t) => t.id.toLowerCase() === lower || t.name.toLowerCase() === lower
    );
    if (fromContext) {
      clientToolCache.set(lower, fromContext);
      return fromContext;
    }

    // 3. Check fallback tools
    const fromFallback = getFallbackToolById(toolSlug);
    if (fromFallback) {
      clientToolCache.set(lower, fromFallback);
      return fromFallback;
    }

    return null;
  }, [contextTools, toolSlug]);

  const [toolData, setToolData] = useState<Tool | null>(localTool);
  const [isLoading, setIsLoading] = useState(!localTool);

  // If not found locally, fetch tool details from API across all 1,000+ tools
  useEffect(() => {
    if (toolData || !toolSlug) return;

    const lower = toolSlug.toLowerCase();
    if (clientToolCache.has(lower)) {
      setToolData(clientToolCache.get(lower)!);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/tools/mention-search?id=${encodeURIComponent(toolSlug)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Tool not found');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.tool) {
          const t = toFullTool(data.tool, toolSlug, fallbackName);
          clientToolCache.set(lower, t);
          setToolData(t);
        }
      })
      .catch(() => {
        // Fallback placeholder
        if (isMounted) {
          const fallback = toFullTool(null, toolSlug, fallbackName);
          clientToolCache.set(lower, fallback);
          setToolData(fallback);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [toolSlug, toolData, fallbackName]);

  const resolved = toolData || localTool;
  const displayName = resolved?.name || fallbackName || toolSlug;
  const targetId = resolved?.id || toolSlug;
  const description =
    resolved?.description ||
    'أداة ذكاء اصطناعي متميزة — انقر لاستكشاف المميزات والتفاصيل الكاملة في الدليل.';
  const pricing = resolved?.pricing || 'Freemium';

  const pricingBadgeConfig = {
    Free: {
      label: 'مجاني',
      className:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    },
    Freemium: {
      label: 'مجاني / تجريبي',
      className:
        'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
    },
    Paid: {
      label: 'مدفوع',
      className:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    },
    Subscription: {
      label: 'اشتراك',
      className:
        'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
    },
  }[pricing] || {
    label: 'مجاني / تجريبي',
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80',
  };

  return (
    <Link
      href={`/tools/${targetId}`}
      onClick={(e) => e.stopPropagation()}
      className={`group relative flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] hover:border-[#14140f] shadow-2xs transition-all duration-200 text-right overflow-hidden ${className}`}
      dir="rtl"
    >
      {/* Right side: Tool Logo + Info */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center shrink-0 p-1 shadow-2xs overflow-hidden group-hover:scale-105 transition-transform">
          <ToolImage
            name={displayName}
            imageUrl={resolved?.imageUrl}
            size="sm"
            categoryName={
              Array.isArray(resolved?.category)
                ? resolved?.category[0]
                : resolved?.category || 'Programming'
            }
            className="w-full h-full object-contain rounded-md"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h4 className="font-bold text-xs sm:text-sm text-[#14140f] truncate group-hover:underline transition-colors">
              {displayName}
            </h4>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${pricingBadgeConfig.className}`}
            >
              {pricingBadgeConfig.label}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#6e6e64] truncate mt-0.5 max-w-[240px] sm:max-w-[280px]">
            {description}
          </p>
        </div>
      </div>

      {/* Left side: Action Button */}
      <div className="flex items-center gap-1.5 shrink-0 mr-2 sm:mr-3">
        <span className="hidden sm:inline-block text-[11px] font-bold text-[#14140f] transition-colors">
          عرض
        </span>
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] group-hover:bg-[#beff50] group-hover:border-[#14140f] flex items-center justify-center transition-all shadow-2xs">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
};

export default MentionedToolCard;

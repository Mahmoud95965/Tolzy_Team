"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Tool } from '../../types/tool';
import { Star, Bookmark, CheckCircle2, ArrowLeftRight, Sparkles, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ToolImage from '../common/ToolImage';
import { updateToolSave } from '../../services/tool-actions.service';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';
import { useCompare } from '@/src/context/CompareContext';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { user } = useAuth();
  const { updateTool } = useTools();
  const { toggleCompare, isInCompare } = useCompare();

  const [isSaved, setIsSaved] = useState(false);
  const saveLock = useRef(false);

  const isCompared = isInCompare(tool.id);

  const primaryCategory = Array.isArray(tool.category)
    ? tool.category[0]
    : tool.category;

  useEffect(() => {
    if (user && tool.savedBy) {
      setIsSaved(tool.savedBy.includes(user.uid));
    }
  }, [user, tool.savedBy]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً لحفظ الأداة');
      return;
    }

    if (saveLock.current) return;
    saveLock.current = true;

    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    try {
      await updateToolSave(tool.id, user.uid, nextSavedState);
      const currentSavedBy = tool.savedBy || [];
      const newSavedBy = nextSavedState
        ? [...currentSavedBy, user.uid]
        : currentSavedBy.filter((id) => id !== user.uid);

      updateTool(tool.id, { savedBy: newSavedBy });
      if (nextSavedState) {
        toast.success(`تم حفظ ${tool.name} في المفضلة 🔖`, { id: 'save-tool', duration: 2000 });
      }
    } catch (error: any) {
      setIsSaved(isSaved);
      toast.error('فشل حفظ الأداة');
    } finally {
      saveLock.current = false;
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(tool);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-tool-drawer', { detail: tool }));
  };

  const pricingBadge = {
    Free: { label: 'مجاني', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Freemium: { label: 'مزيج', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    Paid: { label: 'مدفوع', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    Subscription: { label: 'اشتراك', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  }[tool.pricing] || { label: 'مزيج', bg: 'bg-[#f5f5eb] text-[#14140f] border-[#d2d2c8]' };

  const displayPros = (tool.pros && tool.pros.length > 0)
    ? tool.pros.slice(0, 2)
    : (tool.features && tool.features.length > 0)
    ? tool.features.slice(0, 2)
    : [];

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all hover:shadow-xs cursor-pointer flex flex-col justify-between overflow-hidden text-right select-none"
      dir="rtl"
    >
      {/* Top Header: Logo + Identity + Actions */}
      <div className="flex items-start justify-between gap-2.5">
        
        {/* Right side in RTL: Tool Image + Name + Category + Badges */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <ToolImage
              name={tool.name}
              categoryName={primaryCategory}
              subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory[0] : tool.subcategory}
              size="sm"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-[#14140f] group-hover:underline truncate">
                {tool.name}
              </h3>
              {tool.isFeatured && (
                <span className="p-0.5 rounded-full bg-[#beff50] text-[#14140f]" title="أداة مميزة">
                  <Award className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="text-[#6e6e64] truncate max-w-[100px]">
                {primaryCategory}
              </span>
              <span className="text-[#a0a096]">•</span>
              <span className={`px-1.5 py-0.2 rounded-full border font-bold ${pricingBadge.bg}`}>
                {pricingBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Left side in RTL: Action Buttons (Compare & Bookmark) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Compare Button */}
          <button
            onClick={handleToggleCompare}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isCompared
                ? 'bg-[#beff50] border-[#14140f] text-[#14140f] shadow-2xs'
                : 'bg-[#f5f5eb] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f] hover:border-[#14140f]'
            }`}
            title={isCompared ? 'إزالة من المقارنة' : 'إضافة إلى المقارنة'}
            aria-label="مقارنة الأداة"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Save/Bookmark Button */}
          <button
            onClick={handleSave}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isSaved
                ? 'bg-[#14140f] border-[#14140f] text-[#beff50]'
                : 'bg-[#f5f5eb] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f] hover:border-[#14140f]'
            }`}
            title={isSaved ? 'إزالة من المحفوظات' : 'حفظ الأداة'}
            aria-label="حفظ الأداة"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

      </div>

      {/* Description Snippet (Clean & Compact for mobile) */}
      <div className="mt-2.5">
        <p className="text-[11px] sm:text-xs text-[#6e6e64] leading-relaxed line-clamp-2">
          {tool.description || tool.longDescription}
        </p>
      </div>

      {/* Bottom Footer: Feature chips + Rating */}
      <div className="mt-3 pt-2.5 border-t border-[#d2d2c8]/60 flex items-center justify-between gap-2 text-[10px]">
        {/* Rating */}
        <div className="flex items-center gap-1 font-bold text-[#14140f]">
          <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
          <span className="font-mono">{(tool.rating ?? 4.8).toFixed(1)}</span>
          {tool.reviewCount ? (
            <span className="text-[#a0a096] font-normal font-mono hidden xs:inline">
              ({tool.reviewCount})
            </span>
          ) : null}
        </div>

        {/* Feature Chip Preview */}
        {displayPros.length > 0 && (
          <div className="flex items-center gap-1 min-w-0 pr-1 truncate">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="text-[#43433b] truncate text-[10px]">
              {displayPros[0]}
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

export default ToolCard;

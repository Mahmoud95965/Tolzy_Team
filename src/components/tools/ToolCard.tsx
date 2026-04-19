"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Tool } from '../../types/tool';
import { Star, ExternalLink, Award, Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ToolImage from '../common/ToolImage';
import { updateToolSave } from '../../services/tool-actions.service';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { user, loading } = useAuth();
  const { updateTool } = useTools();

  // Debug Auth State
  useEffect(() => {
    if (loading) return;
    // console.log(`ToolCard (${tool.id}) Auth State:`, { user: user?.uid, email: user?.email });
  }, [user, loading, tool.id]);

  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(tool.savedBy?.length || 0);

  // 🔒 HARD LOCK لمنع أي تنفيذ مزدوج (Strict Mode Safe)
  const saveLock = useRef(false);

  const primaryCategory = Array.isArray(tool.category)
    ? tool.category[0]
    : tool.category;

  const primarySubcategory = Array.isArray(tool.subcategory)
    ? tool.subcategory[0]
    : tool.subcategory;

  useEffect(() => {
    if (user && tool.savedBy) {
      setIsSaved(tool.savedBy.includes(user.uid));
    }
  }, [user, tool.savedBy]);

  // ✅ HANDLER بعد الإصلاح
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('يجب تسجيل الدخول لحفظ الأداة');
      return;
    }

    // 🔒 منع أي ضغط مزدوج
    if (saveLock.current) return;
    saveLock.current = true;

    const nextSavedState = !isSaved;

    // ⚡ Optimistic UI
    setIsSaved(nextSavedState);
    setSavedCount(prev => (nextSavedState ? prev + 1 : prev - 1));

    try {
      await updateToolSave(tool.id, user.uid, nextSavedState);

      // Update Global State
      const currentSavedBy = tool.savedBy || [];
      const newSavedBy = nextSavedState
        ? [...currentSavedBy, user.uid]
        : currentSavedBy.filter(id => id !== user.uid);

      updateTool(tool.id, { savedBy: newSavedBy });

    } catch (error: any) {
      // 🔁 Rollback في حالة الخطأ
      setIsSaved(isSaved);
      setSavedCount(prev => (isSaved ? prev + 1 : prev - 1));

      console.error('Error saving tool:', error);
      toast.error(error.message || 'فشل حفظ الأداة');
    } finally {
      saveLock.current = false;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating)
          ? 'text-orange-400 fill-orange-400'
          : 'text-gray-300 dark:text-gray-600'
          }`}
      />
    ));
  };

  const pricingInfo: Record<string, { label: string }> = {
    Free: { label: 'مجاني' },
    Freemium: { label: 'مجاني مع مميزات مدفوعة' },
    Paid: { label: 'مدفوع' },
    Subscription: { label: 'اشتراك' },
  };

  const currentPricing = pricingInfo[tool.pricing] || pricingInfo.Freemium;

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-white/10 p-5 md:p-6 transition-colors duration-200 hover:border-indigo-500 overflow-hidden">
      {/* Featured Badge */}
      {tool.isFeatured && (
        <div className="absolute top-4 left-4 bg-indigo-600 text-white rounded-full px-3 py-1 flex items-center gap-1.5 z-10 scale-90 origin-top-left">
          <Award className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">تميز</span>
        </div>
      )}

      {/* Tool Image & Main Info */}
      <div className="flex flex-col gap-5 mb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            <ToolImage
              imageUrl={tool.imageUrl}
              name={tool.name}
              categoryName={primaryCategory}
              subcategoryName={primarySubcategory}
              size="lg"
              className="rounded-xl"
            />
            {isSaved && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleSave}
              className={`p-2 rounded-xl transition-all duration-200 ${isSaved
                ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500'
                : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600'
                }`}
              aria-label={isSaved ? 'إلغاء حفظ الأداة' : 'حفظ الأداة'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-500">{savedCount}</span>
                <Bookmark className="w-2.5 h-2.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {tool.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {renderStars(tool.rating)}
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              ({tool.reviewCount || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Description */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider
                ${tool.pricing === 'Free' 
                    ? 'bg-green-100 dark:bg-green-500/10 text-green-600' 
                    : 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600'
                }`}
            >
                {currentPricing.label}
            </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-bold">
            {tool.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {tool.tags?.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md uppercase">
            {tag}
          </span>
        ))}
      </div>

      {/* Action Footer */}
      <Link
        href={`/tools/${tool.id}`}
        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all duration-200 border border-slate-100 dark:border-white/5"
      >
        <span className="text-xs font-black text-slate-700 dark:text-slate-200">عرض التفاصيل</span>
        <ExternalLink size={14} className="text-slate-400" />
      </Link>
    </div>
  );
};

export default ToolCard;

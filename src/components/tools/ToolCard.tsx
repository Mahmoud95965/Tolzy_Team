"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Tool } from '../../types/tool';
import { Star, Bookmark, CheckCircle2, XCircle, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ToolImage from '../common/ToolImage';
import { updateToolSave } from '../../services/tool-actions.service';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { user } = useAuth();
  const { updateTool } = useTools();

  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(tool.savedBy?.length || 0);

  // Hard lock for double save (Strict Mode)
  const saveLock = useRef(false);

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
    e.stopPropagation(); // Prevent opening the side drawer!

    if (!user) {
      toast.error('يجب تسجيل الدخول لحفظ الأداة');
      return;
    }

    if (saveLock.current) return;
    saveLock.current = true;

    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);
    setSavedCount(prev => (nextSavedState ? prev + 1 : prev - 1));

    try {
      await updateToolSave(tool.id, user.uid, nextSavedState);
      const currentSavedBy = tool.savedBy || [];
      const newSavedBy = nextSavedState
        ? [...currentSavedBy, user.uid]
        : currentSavedBy.filter(id => id !== user.uid);

      updateTool(tool.id, { savedBy: newSavedBy });
    } catch (error: any) {
      setIsSaved(isSaved);
      setSavedCount(prev => (isSaved ? prev + 1 : prev - 1));
      console.error('Error saving tool:', error);
      toast.error(error.message || 'فشل حفظ الأداة');
    } finally {
      saveLock.current = false;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Dispatch decoupled custom event to open the Slide-over Drawer
    window.dispatchEvent(new CustomEvent('open-tool-drawer', { detail: tool }));
  };

  // Get concise pros/cons (exactly 2)
  const displayPros = (tool.pros && tool.pros.length > 0)
    ? tool.pros.slice(0, 2)
    : (tool.features && tool.features.length > 0)
      ? tool.features.slice(0, 2)
      : ['سرعة الأداء', 'دعم الذكاء الاصطناعي'];

  const displayCons = (tool.cons && tool.cons.length > 0)
    ? tool.cons.slice(0, 2)
    : ['يحتاج تسجيل', 'قد يكون مدفوعاً'];

  const pricingLabels: Record<string, string> = {
    Free: 'مجاني',
    Freemium: 'مزيج',
    Paid: 'مدفوع',
    Subscription: 'اشتراك'
  };

  const pricingLabel = pricingLabels[tool.pricing] || 'مزيج';

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-slate-950/60 dark:bg-slate-900/35 backdrop-blur-xl border border-white/5 hover:border-indigo-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden h-[185px] text-right select-none"
    >
      {/* Top Section: Glass square icon, name, stars, bookmark */}
      <div className="flex items-start justify-between gap-3">
        {/* Save button */}
        <button
          onClick={handleSave}
          className={`flex-shrink-0 p-2 rounded-lg border transition-all duration-200 ${
            isSaved
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
              : 'bg-white/5 border-white/5 text-slate-500 hover:text-indigo-400 hover:border-white/10'
          }`}
          aria-label={isSaved ? 'إلغاء حفظ الأداة' : 'حفظ الأداة'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Text Details & Title */}
        <div className="flex-1 min-w-0 pr-1 space-y-1">
          <div className="flex items-center gap-1.5 justify-end">
            <h3 className="text-[14px] font-black text-white group-hover:text-indigo-400 transition-colors line-clamp-1 truncate">
              {tool.name}
            </h3>
            {tool.isFeatured && (
              <Award className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            )}
          </div>

          {/* Rating stars & counts */}
          <div className="flex items-center gap-1 justify-end">
            <span className="text-[10px] font-bold text-slate-500">
              ({tool.reviewCount})
            </span>
            <span className="text-[10px] font-black text-amber-400">
              {tool.rating.toFixed(1)}
            </span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
          </div>

          {/* Pricing capsule */}
          <div className="flex justify-end pt-1">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide uppercase
              ${tool.pricing === 'Free' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
              }`}
            >
              {pricingLabel}
            </span>
          </div>
        </div>

        {/* Small Glass Square Icon */}
        <div className="flex-shrink-0 p-0.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md group-hover:border-white/20 transition-all duration-300">
          <ToolImage
            name={tool.name}
            categoryName={primaryCategory}
            subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory[0] : tool.subcategory}
            size="md"
          />
        </div>
      </div>

      {/* Badges Grid (Pros & Cons Capsules) */}
      <div className="border-t border-white/5 pt-2.5 space-y-1.5">
        {/* Pros badges */}
        <div className="flex flex-wrap gap-1.5 justify-end">
          {displayPros.map((pro, index) => (
            <span 
              key={`pro-${index}`} 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold max-w-[130px] truncate"
            >
              <span className="truncate">{pro}</span>
              <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0 text-emerald-400" />
            </span>
          ))}
        </div>

        {/* Cons badges */}
        <div className="flex flex-wrap gap-1.5 justify-end">
          {displayCons.map((con, index) => (
            <span 
              key={`con-${index}`} 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-400 text-[10px] font-bold max-w-[130px] truncate"
            >
              <span className="truncate">{con}</span>
              <XCircle className="w-2.5 h-2.5 flex-shrink-0 text-rose-400" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolCard;

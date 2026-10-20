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

  // Get concise pros/cons (only real data, no fake fallbacks)
  const displayPros = (tool.pros && tool.pros.length > 0)
    ? tool.pros.slice(0, 2)
    : (tool.features && tool.features.length > 0)
      ? tool.features.slice(0, 2)
      : [];

  const displayCons = (tool.cons && tool.cons.length > 0)
    ? tool.cons.slice(0, 2)
    : [];

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
      className="group relative bg-[#f5f5eb] border border-[#d2d2c8] hover:border-[#14140f] rounded-[28px] p-5 transition-colors shadow-none cursor-pointer flex flex-col justify-between overflow-hidden text-right select-none"
    >
      {/* Top Section: Icon, name, stars, bookmark */}
      <div className="flex items-start justify-between gap-3">
        {/* Save button */}
        <button
          onClick={handleSave}
          className={`flex-shrink-0 p-2 rounded-full border transition-colors ${
            isSaved
              ? 'bg-[#beff50] border-[#14140f] text-[#14140f]'
              : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f] hover:border-[#14140f]'
          }`}
          aria-label={isSaved ? 'إلغاء حفظ الأداة' : 'حفظ الأداة'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Text Details & Title */}
        <div className="flex-1 min-w-0 pr-1 space-y-1">
          <div className="flex items-center gap-1.5 justify-end">
            <h3 className="text-sm font-medium text-[#14140f] group-hover:underline line-clamp-1 truncate">
              {tool.name}
            </h3>
            {tool.isFeatured && (
              <Award className="w-3.5 h-3.5 text-[#14140f] flex-shrink-0" />
            )}
          </div>

          {/* Rating stars & counts: Strict Real Numbers */}
          <div className="flex items-center gap-1 justify-end">
            {tool.rating && tool.rating > 0 ? (
              <>
                {tool.reviewCount && tool.reviewCount > 0 ? (
                  <span className="text-[10px] font-normal text-[#6e6e64]">
                    ({tool.reviewCount})
                  </span>
                ) : null}
                <span className="text-[10px] font-medium text-[#14140f]">
                  {tool.rating.toFixed(1)}
                </span>
                <Star className="w-3 h-3 text-[#14140f] fill-[#14140f] flex-shrink-0" />
              </>
            ) : (
              <span className="text-[10px] text-[#6e6e64] bg-[#ffffff] border border-[#d2d2c8] px-2 py-0.5 rounded-full">
                جديد
              </span>
            )}
          </div>

          {/* Pricing capsule */}
          <div className="flex justify-end pt-0.5">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-medium uppercase border bg-[#ffffff] text-[#14140f] border-[#d2d2c8]">
              {pricingLabel}
            </span>
          </div>
        </div>

        {/* Tool Image */}
        <div className="flex-shrink-0 p-1 rounded-[18px] bg-[#ffffff] border border-[#d2d2c8]">
          <ToolImage
            name={tool.name}
            categoryName={primaryCategory}
            subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory[0] : tool.subcategory}
            size="md"
          />
        </div>
      </div>

      {/* Badges Grid (Pros & Cons Capsules, rendered only if real data exists) */}
      {(displayPros.length > 0 || displayCons.length > 0) && (
        <div className="border-t border-[#d2d2c8] pt-2.5 space-y-1.5 mt-3">
          {/* Pros badges */}
          {displayPros.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {displayPros.map((pro, index) => (
                <span 
                  key={`pro-${index}`} 
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] text-[10px] font-normal max-w-[130px] truncate"
                >
                  <span className="truncate">{pro}</span>
                  <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0 text-[#14140f]" />
                </span>
              ))}
            </div>
          )}

          {/* Cons badges */}
          {displayCons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {displayCons.map((con, index) => (
                <span 
                  key={`con-${index}`} 
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#6e6e64] text-[10px] font-normal max-w-[130px] truncate"
                >
                  <span className="truncate">{con}</span>
                  <XCircle className="w-2.5 h-2.5 flex-shrink-0 text-[#6e6e64]" />
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCard;

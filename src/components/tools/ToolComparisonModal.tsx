"use client";

import React, { useState, useMemo } from 'react';
import { useCompare } from '@/src/context/CompareContext';
import { useTools } from '@/src/hooks/useTools';
import ToolImage from '@/src/components/common/ToolImage';
import { 
  X, 
  ArrowLeftRight, 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Tag, 
  Globe, 
  Zap, 
  Trash2,
  Share2,
  DollarSign,
  Layers,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function ToolComparisonModal() {
  const { compareList, removeFromCompare, clearCompare, isModalOpen, closeModal, addToCompare } = useCompare();
  const { tools, featuredTools, popularTools, newTools } = useTools();

  // In-modal search to add another tool
  const [isAddSearchOpen, setIsAddSearchOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Pool of all tools to search from
  const allAvailableTools = useMemo(() => {
    const combined = [...tools, ...featuredTools, ...popularTools, ...newTools];
    const seen = new Set<string>();
    const unique = [];
    for (const t of combined) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    }
    return unique;
  }, [tools, featuredTools, popularTools, newTools]);

  const searchResults = useMemo(() => {
    if (!addSearchQuery.trim()) return [];
    const q = addSearchQuery.toLowerCase();
    return allAvailableTools
      .filter(t => !compareList.some(c => c.id === t.id))
      .filter(t => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [addSearchQuery, allAvailableTools, compareList]);

  const handleShareComparison = async () => {
    const toolNames = compareList.map(t => t.name).join(' vs ');
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({
        title: `مقارنة ${toolNames} — TOLZY`,
        text: `شاهد مقارنة تحليلية شاملة بين ${toolNames} على دليل TOLZY`,
        url: url
      }).catch(() => {});
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        toast.success('تم نسخ رابط المقارنة! 🔗');
        setTimeout(() => setCopiedLink(false), 2000);
      } catch {
        toast.error('تعذر نسخ الرابط');
      }
    }
  };

  if (!isModalOpen) return null;

  const colCount = Math.min(Math.max(compareList.length, 1) + (compareList.length < 4 ? 1 : 0), 4);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-[#14140f]/75 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window Container */}
        <div className="flex min-h-full items-center justify-center p-2 sm:p-6 text-center">
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-6xl bg-[#ffffff] text-[#14140f] border border-[#d2d2c8] rounded-2xl sm:rounded-[32px] overflow-hidden text-right shadow-2xl relative flex flex-col max-h-[92vh]"
          >
            {/* ─── 1. MODAL HEADER ─── */}
            <div className="p-3.5 sm:p-5 border-b border-[#d2d2c8] bg-[#f5f5eb] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#beff50] border border-[#14140f] flex items-center justify-center text-[#14140f] shrink-0 shadow-xs">
                  <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-lg font-bold text-[#14140f] tracking-tight">
                      مقارنة الأدوات المباشرة
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#14140f] text-[#ffffff] text-[10px] font-mono font-bold">
                      {compareList.length}/4
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#6e6e64] font-normal hidden xs:block">
                    مقارنة تحليلية للمواصفات والأسعار ومستوى دعم اللغة العربية
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {compareList.length > 1 && (
                  <button
                    onClick={handleShareComparison}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-[#d2d2c8] hover:border-[#14140f] hover:bg-[#ffffff] text-[#14140f] text-xs transition-colors cursor-pointer"
                    title="مشاركة المقارنة"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline text-[11px] font-medium">مشاركة</span>
                  </button>
                )}

                <button
                  onClick={clearCompare}
                  className="p-1.5 sm:px-3 sm:py-2 rounded-full border border-[#d2d2c8] hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 text-[#6e6e64] text-xs transition-colors cursor-pointer"
                  title="إفراغ قائمة المقارنة"
                  aria-label="إفراغ المقارنة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline mr-1 text-[11px]">إفراغ</span>
                </button>

                <button
                  onClick={closeModal}
                  className="p-1.5 sm:p-2 rounded-full bg-[#14140f] text-[#ffffff] hover:bg-[#30302a] transition-colors cursor-pointer"
                  aria-label="إغلاق المقارنة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── 2. SCROLLABLE MATRIX BODY ─── */}
            <div className="overflow-y-auto flex-1 p-3 sm:p-6 space-y-6">
              {compareList.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#6e6e64]">
                    <ArrowLeftRight className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-[#14140f]">قائمة المقارنة فارغة حالياً</h3>
                  <p className="text-xs text-[#6e6e64] max-w-sm mx-auto leading-relaxed">
                    تصفح دليل الأدوات واضغط على أيقونة المقارنة (⇄) بجانب أي أداة لإضافتها ومقارنتها فورياً.
                  </p>
                </div>
              ) : (
                <div className="border border-[#d2d2c8] rounded-2xl sm:rounded-[24px] overflow-hidden bg-[#ffffff]">
                  
                  {/* ─── STICKY HEADER ROW (Tool Cards) ─── */}
                  <div className="sticky top-0 z-20 bg-[#f5f5eb] border-b border-[#d2d2c8] shadow-xs">
                    <div className="grid divide-x divide-x-reverse divide-[#d2d2c8]" style={{
                      gridTemplateColumns: `repeat(${colCount}, minmax(160px, 1fr))`
                    }}>
                      {compareList.map((tool) => {
                        const primaryCat = Array.isArray(tool.category) ? tool.category[0] : (tool.category || 'عام');
                        return (
                          <div key={tool.id} className="p-3 sm:p-4 flex flex-col justify-between text-right relative min-w-0">
                            {/* Remove Tool Button */}
                            <button
                              onClick={() => removeFromCompare(tool.id)}
                              className="absolute top-2 left-2 p-1 rounded-full bg-[#ffffff] border border-[#d2d2c8] hover:bg-rose-50 hover:text-rose-600 text-[#a0a096] transition-colors cursor-pointer"
                              title={`إزالة ${tool.name}`}
                            >
                              <X className="w-3 h-3" />
                            </button>

                            {/* Tool Identity */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#ffffff] border border-[#d2d2c8] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                  <ToolImage
                                    name={tool.name}
                                    categoryName={primaryCat}
                                    size="sm"
                                  />
                                </div>
                                <div className="min-w-0 pr-0.5">
                                  <h3 className="text-xs sm:text-base font-bold text-[#14140f] truncate" title={tool.name}>
                                    {tool.name}
                                  </h3>
                                  <span className="text-[10px] sm:text-xs text-[#6e6e64] truncate block">
                                    {primaryCat}
                                  </span>
                                </div>
                              </div>

                              {/* Price & Rating Badges */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  tool.pricing === 'Free'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : tool.pricing === 'Paid'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {tool.pricing === 'Free' ? 'مجاني' : tool.pricing === 'Paid' ? 'مدفوع' : 'Freemium'}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-[#14140f] bg-[#ffffff] px-2 py-0.5 rounded-full border border-[#d2d2c8]">
                                  <span>{(tool.rating ?? 4.8).toFixed(1)}</span>
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                                </div>
                              </div>
                            </div>

                            {/* Direct Action */}
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full mt-3 py-1.5 sm:py-2 px-2.5 rounded-full bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#14140f]/20 shadow-2xs"
                            >
                              <span>زيارة الأداة</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        );
                      })}

                      {/* Add Tool Slot (if less than 4 tools) */}
                      {compareList.length < 4 && (
                        <div className="p-3 sm:p-4 flex flex-col items-center justify-center text-center bg-[#ffffff] min-h-[160px]">
                          {isAddSearchOpen ? (
                            <div className="w-full space-y-2">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={addSearchQuery}
                                  onChange={(e) => setAddSearchQuery(e.target.value)}
                                  placeholder="ابحث لإضافة أداة..."
                                  className="w-full px-2.5 py-1.5 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] text-xs focus:outline-none focus:border-[#14140f]"
                                  autoFocus
                                />
                                <button
                                  onClick={() => {
                                    setIsAddSearchOpen(false);
                                    setAddSearchQuery('');
                                  }}
                                  className="absolute left-2 top-2 text-[#6e6e64]"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {searchResults.length > 0 && (
                                <div className="max-h-36 overflow-y-auto space-y-1 bg-[#ffffff] border border-[#d2d2c8] rounded-xl p-1 text-right shadow-sm">
                                  {searchResults.map((t) => (
                                    <button
                                      key={t.id}
                                      onClick={() => {
                                        addToCompare(t);
                                        setIsAddSearchOpen(false);
                                        setAddSearchQuery('');
                                      }}
                                      className="w-full text-right px-2 py-1 rounded-lg hover:bg-[#f5f5eb] flex items-center justify-between text-xs transition-colors cursor-pointer"
                                    >
                                      <span className="font-bold text-[#14140f] truncate">{t.name}</span>
                                      <Plus className="w-3.5 h-3.5 text-[#14140f] shrink-0" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsAddSearchOpen(true)}
                              className="flex flex-col items-center gap-2 text-[#6e6e64] hover:text-[#14140f] transition-colors p-3 rounded-2xl hover:bg-[#f5f5eb] w-full cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#d2d2c8] flex items-center justify-center text-[#14140f]">
                                <Plus className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold">أضف أداة للمقارنة</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─── DIMENSION 1: ARABIC SUPPORT ─── */}
                  <div className="border-b border-[#d2d2c8]">
                    <div className="bg-[#f5f5eb]/80 px-4 py-2 border-b border-[#d2d2c8] text-xs font-bold text-[#14140f] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#14140f]" />
                      <span>دعم اللغة العربية</span>
                    </div>
                    <div className="grid divide-x divide-x-reverse divide-[#d2d2c8]" style={{
                      gridTemplateColumns: `repeat(${colCount}, minmax(160px, 1fr))`
                    }}>
                      {compareList.map((tool) => {
                        const supportsArabic =
                          tool.tags?.some(t => t.toLowerCase().includes('عرب') || t.toLowerCase().includes('arabic')) ||
                          (tool.description || '').includes('عرب') ||
                          tool.features?.some(f => f.includes('عرب'));
                        return (
                          <div key={tool.id} className="p-3 text-xs flex items-center gap-1.5">
                            {supportsArabic ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>دعم ممتاز للغة العربية</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600 text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                <span>واجهة إنجليزية (يفهم الأوامر)</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {compareList.length < 4 && <div className="bg-[#fafaf7]" />}
                    </div>
                  </div>

                  {/* ─── DIMENSION 2: DESCRIPTION & USE CASE ─── */}
                  <div className="border-b border-[#d2d2c8]">
                    <div className="bg-[#f5f5eb]/80 px-4 py-2 border-b border-[#d2d2c8] text-xs font-bold text-[#14140f] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#14140f]" />
                      <span>نبذة ومجال الاستخدام</span>
                    </div>
                    <div className="grid divide-x divide-x-reverse divide-[#d2d2c8]" style={{
                      gridTemplateColumns: `repeat(${colCount}, minmax(160px, 1fr))`
                    }}>
                      {compareList.map((tool) => (
                        <div key={tool.id} className="p-3.5 text-xs text-[#14140f] leading-relaxed">
                          <p className="line-clamp-4 text-[11px] sm:text-xs text-[#43433b]">
                            {tool.description || tool.longDescription}
                          </p>
                        </div>
                      ))}
                      {compareList.length < 4 && <div className="bg-[#fafaf7]" />}
                    </div>
                  </div>

                  {/* ─── DIMENSION 3: PROS (الإيجابيات) ─── */}
                  <div className="border-b border-[#d2d2c8]">
                    <div className="bg-[#f5f5eb]/80 px-4 py-2 border-b border-[#d2d2c8] text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>أبرز الإيجابيات والمميزات</span>
                    </div>
                    <div className="grid divide-x divide-x-reverse divide-[#d2d2c8]" style={{
                      gridTemplateColumns: `repeat(${colCount}, minmax(160px, 1fr))`
                    }}>
                      {compareList.map((tool) => {
                        const pros = (tool.pros && tool.pros.length > 0) ? tool.pros : (tool.features?.slice(0, 3) || ['سرعة استجابة عالية', 'واجهة سهلة']);
                        return (
                          <div key={tool.id} className="p-3.5 space-y-2">
                            {pros.slice(0, 3).map((p, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-[#14140f]">
                                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                                <span className="text-[11px] sm:text-xs leading-snug">{p}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                      {compareList.length < 4 && <div className="bg-[#fafaf7]" />}
                    </div>
                  </div>

                  {/* ─── DIMENSION 4: CONS (نقاط يجب مراعاتها) ─── */}
                  <div className="border-b border-[#d2d2c8]">
                    <div className="bg-[#f5f5eb]/80 px-4 py-2 border-b border-[#d2d2c8] text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>نقاط يجب مراعاتها أو تحسينها</span>
                    </div>
                    <div className="grid divide-x divide-x-reverse divide-[#d2d2c8]" style={{
                      gridTemplateColumns: `repeat(${colCount}, minmax(160px, 1fr))`
                    }}>
                      {compareList.map((tool) => {
                        const cons = (tool.cons && tool.cons.length > 0) ? tool.cons : ['تتطلب تسجيل حساب للاستفادة الكاملة'];
                        return (
                          <div key={tool.id} className="p-3.5 space-y-2">
                            {cons.slice(0, 3).map((c, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-[#6e6e64]">
                                <span className="text-amber-600 font-bold mt-0.5">•</span>
                                <span className="text-[11px] sm:text-xs leading-snug">{c}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                      {compareList.length < 4 && <div className="bg-[#fafaf7]" />}
                    </div>
                  </div>

                  {/* ─── DIMENSION 5: CORE FEATURES (المميزات) ─── */}
                  <div>
                    <div className="bg-[#f5f5eb]/80 px-4 py-2 border-b border-[#d2d2c8] text-xs font-bold text-[#14140f] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#14140f]" />
                      <span>المميزات والوظائف الأساسية</span>
                    </div>
                    <div className="grid divide-x divide-x-reverse divide-[#d2d2c8]" style={{
                      gridTemplateColumns: `repeat(${colCount}, minmax(160px, 1fr))`
                    }}>
                      {compareList.map((tool) => {
                        const feats = (tool.features && tool.features.length > 0) ? tool.features : ['نماذج ذكاء اصطناعي حديثة'];
                        return (
                          <div key={tool.id} className="p-3.5 flex flex-wrap gap-1.5">
                            {feats.slice(0, 4).map((f, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] text-[10px] sm:text-[11px]"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        );
                      })}
                      {compareList.length < 4 && <div className="bg-[#fafaf7]" />}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* ─── 3. MODAL FOOTER ─── */}
            <div className="p-3 sm:p-4 border-t border-[#d2d2c8] bg-[#f5f5eb] flex items-center justify-between text-xs text-[#6e6e64] shrink-0">
              <span className="font-medium text-[11px] sm:text-xs">
                مقارنة حية لـ {compareList.length} أدوات من دليل تولزي الذكي
              </span>
              <button
                onClick={closeModal}
                className="px-5 py-1.5 sm:px-6 sm:py-2 rounded-full bg-[#14140f] text-[#ffffff] hover:bg-[#30302a] font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق المقارنة
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

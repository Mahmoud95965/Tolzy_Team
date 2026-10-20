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
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function ToolComparisonModal() {
  const { compareList, removeFromCompare, clearCompare, isModalOpen, closeModal, addToCompare } = useCompare();
  const { tools, featuredTools, popularTools, newTools } = useTools();

  // In-modal search to add another tool
  const [isAddSearchOpen, setIsAddSearchOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');

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
      .filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .slice(0, 6);
  }, [addSearchQuery, allAvailableTools, compareList]);

  const handleShareComparison = () => {
    const toolNames = compareList.map(t => t.name).join(' vs ');
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `مقارنة ${toolNames} — TOLZY`,
        text: `شاهد مقارنة شاملة بين ${toolNames} على دليل TOLZY`,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط الصفحة للمشاركة!');
    }
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-[#14140f]/70 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window Container */}
        <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-6xl bg-[#ffffff] text-[#14140f] border border-[#d2d2c8] rounded-[28px] overflow-hidden text-right shadow-2xl relative flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#d2d2c8] bg-[#f5f5eb] flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#beff50] border border-[#14140f] flex items-center justify-center text-[#14140f] shrink-0">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-medium text-[#14140f] tracking-tight">
                    مقارنة الأدوات التقنية والذكاء الاصطناعي
                  </h2>
                  <p className="text-xs text-[#6e6e64] font-normal">
                    تحليل مقارن للمميزات، التسعير، التقييم، وتفاصيل الاستخدام جنبًا إلى جنب
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {compareList.length > 1 && (
                  <button
                    onClick={handleShareComparison}
                    className="p-2.5 rounded-full border border-[#d2d2c8] hover:border-[#14140f] hover:bg-[#ffffff] text-[#14140f] transition-colors"
                    title="مشاركة المقارنة"
                    aria-label="مشاركة المقارنة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={clearCompare}
                  className="p-2.5 rounded-full border border-[#d2d2c8] hover:border-[#14140f] hover:bg-[#ffffff] text-[#6e6e64] hover:text-[#14140f] transition-colors"
                  title="إفراغ القائمة"
                  aria-label="إفراغ قائمة المقارنة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={closeModal}
                  className="p-2.5 rounded-full bg-[#14140f] text-[#ffffff] hover:bg-[#30302a] transition-colors"
                  aria-label="إغلاق المقارنة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content Table */}
            <div className="overflow-x-auto overflow-y-auto flex-1 p-4 sm:p-6">
              {compareList.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#6e6e64]">
                    <ArrowLeftRight className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-medium text-[#14140f]">لا توجد أدوات في قائمة المقارنة حاليًا</h3>
                  <p className="text-xs text-[#6e6e64] max-w-sm mx-auto">
                    تصفح الأدوات في الدليل واضغط على أيقونة المقارنة في بطاقة الأداة أو في صفحة التفاصيل للبدء.
                  </p>
                </div>
              ) : (
                <div className="min-w-[640px] space-y-6">
                  {/* Row 1: Tool Headers (Sticky Cards) */}
                  <div className={`grid gap-4 ${
                    compareList.length === 1 ? 'grid-cols-2' :
                    compareList.length === 2 ? 'grid-cols-2' :
                    compareList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                  }`}>
                    {compareList.map((tool) => {
                      const primaryCategory = Array.isArray(tool.category) ? tool.category[0] : tool.category;
                      return (
                        <div
                          key={tool.id}
                          className="relative p-5 rounded-[24px] bg-[#f5f5eb] border border-[#d2d2c8] flex flex-col justify-between text-right"
                        >
                          {/* Remove button */}
                          <button
                            onClick={() => removeFromCompare(tool.id)}
                            className="absolute top-3 left-3 p-1.5 rounded-full bg-[#ffffff] border border-[#d2d2c8] hover:bg-[#14140f] hover:text-[#ffffff] text-[#6e6e64] transition-colors"
                            title="إزالة الأداة"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div>
                            {/* Logo & Category */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-1 rounded-[14px] bg-[#ffffff] border border-[#d2d2c8] shrink-0">
                                <ToolImage
                                  name={tool.name}
                                  categoryName={primaryCategory}
                                  size="md"
                                />
                              </div>
                              <div className="min-w-0 flex-1 pr-1">
                                <h3 className="text-base font-medium text-[#14140f] truncate">{tool.name}</h3>
                                <span className="text-[11px] font-normal text-[#6e6e64]">{primaryCategory}</span>
                              </div>
                            </div>

                            {/* Rating and Price Badge */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1 text-xs font-medium text-[#14140f] bg-[#ffffff] px-2.5 py-1 rounded-full border border-[#d2d2c8]">
                                <span>{(tool.rating || 4.8).toFixed(1)}</span>
                                <Star className="w-3.5 h-3.5 fill-[#14140f]" />
                                <span className="text-[10px] text-[#6e6e64]">({tool.reviewCount || 10})</span>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#ffffff] text-[#14140f] border border-[#d2d2c8]">
                                {tool.pricing === 'Free' ? 'مجاني' : tool.pricing === 'Freemium' ? 'مزيج مجاني/مدفوع' : 'مدفوع'}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-[28px] bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors mt-2"
                          >
                            <span>زيارة الأداة</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      );
                    })}

                    {/* Add Slot Card if < 4 */}
                    {compareList.length < 4 && (
                      <div className="p-5 rounded-[24px] border-2 border-dashed border-[#d2d2c8] hover:border-[#14140f] transition-colors flex flex-col items-center justify-center text-center bg-[#fafaf7] min-h-[190px]">
                        {isAddSearchOpen ? (
                          <div className="w-full space-y-2">
                            <div className="relative">
                              <input
                                type="text"
                                value={addSearchQuery}
                                onChange={(e) => setAddSearchQuery(e.target.value)}
                                placeholder="ابحث عن أداة للإضافة..."
                                className="w-full px-3 py-2 rounded-[14px] bg-[#ffffff] border border-[#d2d2c8] text-xs focus:outline-none focus:border-[#14140f]"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  setIsAddSearchOpen(false);
                                  setAddSearchQuery('');
                                }}
                                className="absolute left-2.5 top-2.5 text-[#6e6e64] hover:text-[#14140f]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {searchResults.length > 0 && (
                              <div className="max-h-40 overflow-y-auto space-y-1 bg-[#ffffff] border border-[#d2d2c8] rounded-[14px] p-1 shadow-sm">
                                {searchResults.map((tool) => (
                                  <button
                                    key={tool.id}
                                    onClick={() => {
                                      addToCompare(tool);
                                      setIsAddSearchOpen(false);
                                      setAddSearchQuery('');
                                    }}
                                    className="w-full text-right px-2.5 py-1.5 rounded-[8px] hover:bg-[#f5f5eb] flex items-center justify-between text-xs transition-colors"
                                  >
                                    <span className="font-medium text-[#14140f] truncate">{tool.name}</span>
                                    <Plus className="w-3.5 h-3.5 text-[#6e6e64] shrink-0" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddSearchOpen(true)}
                            className="flex flex-col items-center gap-2 text-[#6e6e64] hover:text-[#14140f] transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center">
                              <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium">أضف أداة للمقارنة</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Divider */}
                  <div className="space-y-4 pt-2">
                    {/* Dimension 1: نبذة وتوصيف */}
                    <div className="border border-[#d2d2c8] rounded-[20px] overflow-hidden">
                      <div className="bg-[#f5f5eb] px-4 py-2.5 border-b border-[#d2d2c8] font-medium text-xs text-[#14140f] flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" />
                        <span>الوصف والنظرة العامة</span>
                      </div>
                      <div className={`grid divide-x divide-x-reverse divide-[#d2d2c8] p-4 text-xs leading-relaxed text-[#14140f] ${
                        compareList.length === 1 ? 'grid-cols-2' :
                        compareList.length === 2 ? 'grid-cols-2' :
                        compareList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                      }`}>
                        {compareList.map((tool) => (
                          <div key={tool.id} className="px-3">
                            {tool.description || tool.longDescription}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dimension 2: دعم اللغة العربية */}
                    <div className="border border-[#d2d2c8] rounded-[20px] overflow-hidden">
                      <div className="bg-[#f5f5eb] px-4 py-2.5 border-b border-[#d2d2c8] font-medium text-xs text-[#14140f] flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        <span>دعم اللغة العربية</span>
                      </div>
                      <div className={`grid divide-x divide-x-reverse divide-[#d2d2c8] p-4 text-xs ${
                        compareList.length === 1 ? 'grid-cols-2' :
                        compareList.length === 2 ? 'grid-cols-2' :
                        compareList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                      }`}>
                        {compareList.map((tool) => {
                          const supportsArabic = 
                            tool.tags?.some(t => t.toLowerCase().includes('عرب') || t.toLowerCase().includes('arabic')) ||
                            tool.description?.includes('عرب') ||
                            tool.features?.some(f => f.includes('عرب'));
                          return (
                            <div key={tool.id} className="px-3 flex items-center gap-2 font-medium">
                              {supportsArabic ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-[#14140f]" />
                                  <span className="text-[#14140f]">يدعم اللغة العربية ممتاز</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-[#d2d2c8]" />
                                  <span className="text-[#6e6e64]">واجهة إنجليزية (يفهم الأوامر العربية)</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dimension 3: الإيجابيات والمميزات القوية */}
                    <div className="border border-[#d2d2c8] rounded-[20px] overflow-hidden">
                      <div className="bg-[#f5f5eb] px-4 py-2.5 border-b border-[#d2d2c8] font-medium text-xs text-[#14140f] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#14140f]" />
                        <span>أبرز الإيجابيات (Pros)</span>
                      </div>
                      <div className={`grid divide-x divide-x-reverse divide-[#d2d2c8] p-4 text-xs ${
                        compareList.length === 1 ? 'grid-cols-2' :
                        compareList.length === 2 ? 'grid-cols-2' :
                        compareList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                      }`}>
                        {compareList.map((tool) => {
                          const pros = (tool.pros && tool.pros.length > 0) ? tool.pros : ['سرعة استجابة عالية', 'واجهة مستخدم بديهية'];
                          return (
                            <div key={tool.id} className="px-3 space-y-2">
                              {pros.map((p, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14140f] shrink-0 mt-0.5" />
                                  <span className="text-[#14140f]">{p}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dimension 4: السلبيات ونقاط الضعف */}
                    <div className="border border-[#d2d2c8] rounded-[20px] overflow-hidden">
                      <div className="bg-[#f5f5eb] px-4 py-2.5 border-b border-[#d2d2c8] font-medium text-xs text-[#14140f] flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-[#6e6e64]" />
                        <span>أبرز السلبيات (Cons)</span>
                      </div>
                      <div className={`grid divide-x divide-x-reverse divide-[#d2d2c8] p-4 text-xs ${
                        compareList.length === 1 ? 'grid-cols-2' :
                        compareList.length === 2 ? 'grid-cols-2' :
                        compareList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                      }`}>
                        {compareList.map((tool) => {
                          const cons = (tool.cons && tool.cons.length > 0) ? tool.cons : ['تتطلب تسجيل حساب للاستخدام'];
                          return (
                            <div key={tool.id} className="px-3 space-y-2">
                              {cons.map((c, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-[#6e6e64] shrink-0 mt-0.5" />
                                  <span className="text-[#6e6e64]">{c}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dimension 5: المميزات التقنية (Features) */}
                    <div className="border border-[#d2d2c8] rounded-[20px] overflow-hidden">
                      <div className="bg-[#f5f5eb] px-4 py-2.5 border-b border-[#d2d2c8] font-medium text-xs text-[#14140f] flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" />
                        <span>المميزات والوظائف الأساسية</span>
                      </div>
                      <div className={`grid divide-x divide-x-reverse divide-[#d2d2c8] p-4 text-xs ${
                        compareList.length === 1 ? 'grid-cols-2' :
                        compareList.length === 2 ? 'grid-cols-2' :
                        compareList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                      }`}>
                        {compareList.map((tool) => {
                          const features = (tool.features && tool.features.length > 0) ? tool.features : ['تكامل مع نماذج الذكاء الاصطناعي'];
                          return (
                            <div key={tool.id} className="px-3 flex flex-wrap gap-1.5">
                              {features.map((f, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] text-[11px] font-normal"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 border-t border-[#d2d2c8] bg-[#f5f5eb] flex items-center justify-between text-xs text-[#6e6e64] shrink-0">
              <span className="font-normal">
                مقارنة حية لـ {compareList.length} أدوات من دليل TOLZY
              </span>
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-[28px] bg-[#14140f] text-[#ffffff] hover:bg-[#30302a] font-medium transition-colors"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

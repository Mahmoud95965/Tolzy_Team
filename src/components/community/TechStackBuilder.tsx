'use client';

import React, { useState, useMemo } from 'react';
import { Layers, Plus, Trash2, Search, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import ToolImage from '../common/ToolImage';
import { Tool } from '../../types/tool';
import { StackToolItem } from '../../types/community';
import { useTools } from '../../hooks/useTools';
import { getFallbackTools } from '../../data/fallbackTools';

interface TechStackBuilderProps {
  stackTools: StackToolItem[];
  onChange: (tools: StackToolItem[]) => void;
}

export const TechStackBuilder: React.FC<TechStackBuilderProps> = ({
  stackTools,
  onChange,
}) => {
  const { tools: contextTools } = useTools();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const allTools = useMemo(() => {
    const list = contextTools && contextTools.length > 0 ? contextTools : getFallbackTools();
    const seen = new Set<string>();
    return list.filter((t) => {
      if (!t.id || seen.has(t.id.toLowerCase())) return false;
      seen.add(t.id.toLowerCase());
      return true;
    });
  }, [contextTools]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const selectedIds = new Set(stackTools.map((s) => s.tool_id.toLowerCase()));
    return allTools
      .filter((t) => {
        if (selectedIds.has(t.id.toLowerCase())) return false;
        if (!q) return true;
        return (
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
        );
      })
      .slice(0, 8);
  }, [allTools, searchQuery, stackTools]);

  const handleAddTool = (tool: Tool) => {
    if (stackTools.length >= 6) return;
    const newItem: StackToolItem = {
      tool_id: tool.id,
      tool_name: tool.name,
      tool_imageUrl: tool.imageUrl,
      tool_pricing: tool.pricing,
      tool_category: Array.isArray(tool.category) ? tool.category[0] : tool.category,
      note: '',
    };
    onChange([...stackTools, newItem]);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleRemoveTool = (toolId: string) => {
    onChange(stackTools.filter((t) => t.tool_id !== toolId));
  };

  const handleUpdateNote = (toolId: string, note: string) => {
    onChange(
      stackTools.map((t) => (t.tool_id === toolId ? { ...t, note } : t))
    );
  };

  return (
    <div className="space-y-3.5 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
              حزمة الأدوات (Tech Stack)
            </h4>
            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400">
              اختر من 2 إلى 6 أدوات واشرح دور كل أداة في سير عملك
            </p>
          </div>
        </div>

        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            stackTools.length >= 2 && stackTools.length <= 6
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          }`}
        >
          {stackTools.length} / 6 أدوات
        </span>
      </div>

      {/* Selected Tools List */}
      {stackTools.length > 0 && (
        <div className="space-y-2.5">
          {stackTools.map((item, index) => (
            <div
              key={item.tool_id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                  {index + 1}
                </span>

                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 flex items-center justify-center shrink-0">
                  <ToolImage
                    name={item.tool_name}
                    imageUrl={item.tool_imageUrl}
                    size="sm"
                    className="w-full h-full object-contain rounded"
                  />
                </div>

                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                    {item.tool_name}
                  </h5>
                  {item.tool_category && (
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {item.tool_category}
                    </span>
                  )}
                </div>
              </div>

              {/* 1-Line Workflow Note Input */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="كيف تستخدمها في سير عملك؟ (مثال: توليد كود الواجهات)"
                  value={item.note}
                  onChange={(e) => handleUpdateNote(item.tool_id, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveTool(item.tool_id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
                  title="حذف الأداة من الحزمة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tool Search Picker */}
      {stackTools.length < 6 && (
        <div className="relative">
          {!isSearching ? (
            <button
              type="button"
              onClick={() => setIsSearching(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 bg-white/60 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-900 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أداة للحزمة ({stackTools.length}/6)</span>
            </button>
          ) : (
            <div className="space-y-2 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-md">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-500 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="ابحث عن أداة بالاسم (مثال: ChatGPT, Cursor, Midjourney)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearching(false);
                    setSearchQuery('');
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions Grid */}
              <div className="max-h-48 overflow-y-auto space-y-1 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleAddTool(tool)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-right transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 p-1 shrink-0 flex items-center justify-center">
                        <ToolImage
                          name={tool.name}
                          imageUrl={tool.imageUrl}
                          size="sm"
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-neutral-900 dark:text-white truncate block">
                          {tool.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 truncate block">
                          {Array.isArray(tool.category) ? tool.category[0] : tool.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 mr-2">
                      + اختيار
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {stackTools.length < 2 && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>يجب إضافة أداتين على الأقل لتكوين حزمة متكاملة.</span>
        </div>
      )}
    </div>
  );
};

export default TechStackBuilder;

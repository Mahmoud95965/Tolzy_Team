'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  Plus,
  Trash2,
  Link as LinkIcon,
  X,
  Search,
  Check,
  Sparkles
} from 'lucide-react';
import ToolImage from '../common/ToolImage';
import { Tool } from '../../types/tool';
import { CommunityPoll, PollOption } from '../../types/community';
import { useTools } from '../../hooks/useTools';
import { getFallbackTools } from '../../data/fallbackTools';

interface PollBuilderProps {
  poll: CommunityPoll | null;
  onChange: (poll: CommunityPoll | null) => void;
  defaultQuestion?: string;
}

export const PollBuilder: React.FC<PollBuilderProps> = ({
  poll,
  onChange,
  defaultQuestion = '',
}) => {
  const { tools: contextTools } = useTools();
  const [activeToolPickerOptionId, setActiveToolPickerOptionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!q) return allTools.slice(0, 6);
    return allTools
      .filter((t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
      .slice(0, 6);
  }, [allTools, searchQuery]);

  if (!poll) return null;

  const handleQuestionChange = (question: string) => {
    onChange({ ...poll, question });
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    onChange({
      ...poll,
      options: poll.options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt)),
    });
  };

  const handleAddOption = () => {
    if (poll.options.length >= 4) return;
    const newOption: PollOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: '',
      votes_count: 0,
    };
    onChange({
      ...poll,
      options: [...poll.options, newOption],
    });
  };

  const handleRemoveOption = (optionId: string) => {
    if (poll.options.length <= 2) return;
    onChange({
      ...poll,
      options: poll.options.filter((opt) => opt.id !== optionId),
    });
  };

  const handleLinkToolToOption = (optionId: string, tool: Tool) => {
    onChange({
      ...poll,
      options: poll.options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              text: opt.text || tool.name,
              tool_id: tool.id,
              tool_name: tool.name,
              tool_imageUrl: tool.imageUrl,
            }
          : opt
      ),
    });
    setActiveToolPickerOptionId(null);
    setSearchQuery('');
  };

  const handleUnlinkTool = (optionId: string) => {
    onChange({
      ...poll,
      options: poll.options.map((opt) =>
        opt.id === optionId
          ? { ...opt, tool_id: undefined, tool_name: undefined, tool_imageUrl: undefined }
          : opt
      ),
    });
  };

  return (
    <div
      className="space-y-3.5 p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-right"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-200">
              تصويت أو مقارنة أدوات (Poll)
            </h4>
            <p className="text-[10px] sm:text-[11px] text-amber-700/80 dark:text-amber-400">
              <span className="hidden sm:inline">أضف خيارات تصويت مع إمكانية ربط كل خيار بأداة من الدليل (Tool A vs Tool B)</span>
              <span className="sm:hidden">أضف خيارات تصويت ومقارنة بين الأدوات</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-neutral-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
          title="إلغاء التصويت"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question Field */}
      <div>
        <label className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1">
          سؤال التصويت:
        </label>
        <input
          type="text"
          placeholder={defaultQuestion || 'مثال: أيهما تفضل لتوليد الأكواد؟ أو ما هي أداتك اليومية؟'}
          value={poll.question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-amber-200/80 dark:border-amber-800/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
        />
      </div>

      {/* Poll Options List */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block">
          خيارات التصويت (2 إلى 4 خيارات):
        </label>

        {poll.options.map((option, idx) => (
          <div key={option.id} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                {idx + 1}
              </span>

              {/* Input for option text */}
              <input
                type="text"
                placeholder={`الخيار ${idx + 1} (مثال: ${idx === 0 ? 'ChatGPT' : 'Claude'})...`}
                value={option.text}
                onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />

              {/* Link to Tool Button */}
              {option.tool_id ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-800 dark:text-amber-300 shrink-0">
                  <div className="w-4 h-4 rounded bg-white dark:bg-neutral-800 p-0.5 flex items-center justify-center overflow-hidden">
                    <ToolImage
                      name={option.tool_name || ''}
                      imageUrl={option.tool_imageUrl}
                      size="sm"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="truncate max-w-[80px]">{option.tool_name}</span>
                  <button
                    type="button"
                    onClick={() => handleUnlinkTool(option.id)}
                    className="hover:text-rose-500 transition-colors mr-0.5"
                    title="فك الربط بالأداة"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setActiveToolPickerOptionId(
                      activeToolPickerOptionId === option.id ? null : option.id
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 text-[11px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-amber-600 transition-colors shrink-0"
                  title="ربط هذا الخيار بأداة من الدليل"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">ربط بأداة</span>
                </button>
              )}

              {/* Remove Option Button */}
              {poll.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors shrink-0"
                  title="حذف الخيار"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Inline Tool Picker Popup */}
            {activeToolPickerOptionId === option.id && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-800 shadow-md space-y-1.5 mr-8">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="ابحث عن أداة لربطها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveToolPickerOptionId(null)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1">
                  {filteredTools.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleLinkToolToOption(option.id, t)}
                      className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-right text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 p-0.5 flex items-center justify-center">
                          <ToolImage
                            name={t.name}
                            imageUrl={t.imageUrl}
                            size="sm"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="font-bold">{t.name}</span>
                      </div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                        ربط ↵
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Option Button */}
      {poll.options.length < 4 && (
        <button
          type="button"
          onClick={handleAddOption}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-800 hover:border-amber-500 bg-white/50 dark:bg-neutral-900/50 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة خيار آخر ({poll.options.length}/4)</span>
        </button>
      )}
    </div>
  );
};

export default PollBuilder;

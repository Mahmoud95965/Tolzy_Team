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
      className="space-y-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#ffffff] border border-[#d2d2c8] text-right shadow-2xs"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#14140f] text-[#beff50] flex items-center justify-center shadow-xs">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#14140f]">
              تصويت أو مقارنة أدوات (Poll)
            </h4>
            <p className="text-[10px] sm:text-[11px] text-[#6e6e64]">
              <span className="hidden sm:inline">أضف خيارات تصويت مع إمكانية ربط كل خيار بأداة من الدليل (Tool A vs Tool B)</span>
              <span className="sm:hidden">أضف خيارات تصويت ومقارنة بين الأدوات</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[#a0a096] hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
          title="إلغاء التصويت"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question Field */}
      <div>
        <label className="text-[11px] font-bold text-[#14140f] block mb-1">
          سؤال التصويت:
        </label>
        <input
          type="text"
          placeholder={defaultQuestion || 'مثال: أيهما تفضل لتوليد الأكواد؟ أو ما هي أداتك اليومية؟'}
          value={poll.question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] text-xs text-[#14140f] placeholder:text-[#a0a096] focus:outline-none focus:border-[#14140f]"
        />
      </div>

      {/* Poll Options List */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#14140f] block">
          خيارات التصويت (2 إلى 4 خيارات):
        </label>

        {poll.options.map((option, idx) => (
          <div key={option.id} className="space-y-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] font-bold text-[11px] flex items-center justify-center shrink-0">
                {idx + 1}
              </span>

              {/* Input for option text */}
              <input
                type="text"
                placeholder={`الخيار ${idx + 1} (مثال: ${idx === 0 ? 'ChatGPT' : 'Claude'})...`}
                value={option.text}
                onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] text-xs text-[#14140f] placeholder:text-[#a0a096] focus:outline-none focus:border-[#14140f]"
              />

              {/* Link to Tool Button */}
              {option.tool_id ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#beff50]/20 border border-[#14140f] text-[11px] font-bold text-[#14140f] shrink-0">
                  <div className="w-4 h-4 rounded bg-[#ffffff] border border-[#d2d2c8] p-0.5 flex items-center justify-center overflow-hidden">
                    <ToolImage
                      name={option.tool_name || ''}
                      imageUrl={option.tool_imageUrl}
                      size="sm"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="truncate max-w-[70px] sm:max-w-[80px]">{option.tool_name}</span>
                  <button
                    type="button"
                    onClick={() => handleUnlinkTool(option.id)}
                    className="hover:text-rose-500 transition-colors mr-0.5 cursor-pointer"
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
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] text-[11px] font-bold text-[#14140f] transition-colors shrink-0 cursor-pointer"
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
                  className="p-1.5 text-[#a0a096] hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                  title="حذف الخيار"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Inline Tool Picker Popup */}
            {activeToolPickerOptionId === option.id && (
              <div className="p-2.5 rounded-xl bg-[#ffffff] border border-[#d2d2c8] shadow-md space-y-1.5 mr-6 sm:mr-8">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#f5f5eb] rounded-lg border border-[#d2d2c8]">
                  <Search className="w-3.5 h-3.5 text-[#a0a096]" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="ابحث عن أداة لربطها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#14140f] placeholder:text-[#a0a096] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveToolPickerOptionId(null)}
                    className="text-[#a0a096] hover:text-[#14140f]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 no-scrollbar">
                  {filteredTools.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleLinkToolToOption(option.id, t)}
                      className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f5f5eb] text-right transition-colors cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded bg-[#ffffff] border border-[#d2d2c8] p-0.5 shrink-0 flex items-center justify-center">
                        <ToolImage
                          name={t.name}
                          imageUrl={t.imageUrl}
                          size="sm"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-bold text-[#14140f] truncate flex-1">{t.name}</span>
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
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
          className="w-full py-2 px-3 rounded-xl border border-dashed border-[#d2d2c8] hover:border-[#14140f] bg-[#f5f5eb] hover:bg-[#ffffff] text-xs font-bold text-[#14140f] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة خيار آخر ({poll.options.length}/4)</span>
        </button>
      )}
    </div>
  );
};

export default PollBuilder;

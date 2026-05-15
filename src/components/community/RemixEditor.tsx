'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitFork, Sparkles, Code2, Tag, Send, Loader2 } from 'lucide-react';
import type { CommunityPrompt, PromptTag } from '../../types/community';

interface RemixEditorProps {
  isOpen: boolean;
  originalPrompt: CommunityPrompt | null;
  onClose: () => void;
  onSubmit: (data: {
    parent_prompt_id: string;
    title: string;
    prompt_text: string;
    ai_output: string;
    ai_model: string;
    description: string;
    tag_slugs: string[];
    change_summary: string;
  }) => Promise<void>;
  tags: PromptTag[];
}

const RemixEditor: React.FC<RemixEditorProps> = ({ isOpen, originalPrompt, onClose, onSubmit, tags }) => {
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [description, setDescription] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill when opening with original prompt
  React.useEffect(() => {
    if (originalPrompt && isOpen) {
      setTitle(`ريمكس: ${originalPrompt.title}`);
      setPromptText(originalPrompt.prompt_text);
      setAiOutput('');
      setAiModel(originalPrompt.ai_model || '');
      setDescription('');
      setChangeSummary('');
      setSelectedTags(originalPrompt.tags?.map(t => t.slug) || []);
    }
  }, [originalPrompt, isOpen]);

  const toggleTag = (slug: string) => {
    setSelectedTags(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const handleSubmit = async () => {
    if (!originalPrompt || !title.trim() || !promptText.trim() || !changeSummary.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        parent_prompt_id: originalPrompt.id,
        title,
        prompt_text: promptText,
        ai_output: aiOutput,
        ai_model: aiModel,
        description,
        tag_slugs: selectedTags,
        change_summary: changeSummary,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !originalPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-white dark:bg-[#0d1117] rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-500/20 overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-purple-100 dark:border-purple-500/10 bg-gradient-to-l from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <GitFork size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">ريمكس البرومبت 🔄</h2>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                  بناءً على: {originalPrompt.title}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-white/5 rounded-xl transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Original prompt preview */}
          <div className="mx-5 mt-4 p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200/50 dark:border-white/[0.04]">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">البرومبت الأصلي</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono line-clamp-3" dir="ltr">{originalPrompt.prompt_text}</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">عنوان الريمكس *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
            </div>

            {/* Modified prompt */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Code2 size={14} className="text-purple-500" />
                البرومبت المعدّل *
              </label>
              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                rows={6}
                className="w-full bg-slate-50 dark:bg-white/5 border border-purple-200 dark:border-purple-500/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none"
                dir="ltr"
              />
            </div>

            {/* Change summary */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">ما الذي غيّرته؟ *</label>
              <input
                value={changeSummary}
                onChange={e => setChangeSummary(e.target.value)}
                placeholder="مثال: أضفت chain-of-thought للحصول على نتائج أدق"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
            </div>

            {/* AI Output */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-500" />
                ناتج AI الجديد (اختياري)
              </label>
              <textarea
                value={aiOutput}
                onChange={e => setAiOutput(e.target.value)}
                placeholder="الصق الناتج الجديد هنا..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none"
                dir="ltr"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag size={14} className="text-amber-500" />
                التصنيفات
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.slug}
                    onClick={() => toggleTag(tag.slug)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTags.includes(tag.slug) ? 'text-white shadow-md' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                    }`}
                    style={selectedTags.includes(tag.slug) ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.icon} {tag.label_ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !promptText.trim() || !changeSummary.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-l from-purple-600 to-pink-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <GitFork size={18} />}
              {submitting ? 'جاري النشر...' : 'نشر الريمكس 🔄'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RemixEditor;

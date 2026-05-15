'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ImageIcon, Video, MapPin, Smile, Users, MoreHorizontal,
  Tag, Code, Globe, Loader2, ChevronDown, Link2, ExternalLink, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import type { PromptTag, PostType } from '../../types/community';

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    post_type: PostType;
    title: string;
    prompt_text: string;
    ai_output: string;
    ai_model: string;
    description: string;
    code_snippet: string;
    code_language: string;
    link_url: string;
    tag_slugs: string[];
  }) => Promise<void>;
  tags: PromptTag[];
}

// ─── URL Utilities ───────────────────────────────────────────────────────────

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;

/** Extract all URLs found in a string */
function extractUrls(text: string): string[] {
  return [...text.matchAll(URL_REGEX)].map(m => m[0]);
}

/** Shorten a URL for display: keep scheme + host + truncated path */
function shortenUrl(url: string, maxLength = 40): string {
  try {
    const parsed = new URL(url);
    const base = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname + parsed.search + parsed.hash;
    const full = base + path;
    if (full.length <= maxLength) return full;
    return base + '/…' + path.slice(-(maxLength - base.length - 2));
  } catch {
    return url.length > maxLength ? url.slice(0, maxLength - 1) + '…' : url;
  }
}

/** Get the root domain for the favicon */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ─── Link Preview Card ────────────────────────────────────────────────────────

interface LinkPreviewProps {
  url: string;
  onRemove: () => void;
}

const LinkPreviewCard: React.FC<LinkPreviewProps> = ({ url, onRemove }) => {
  const domain = getDomain(url);
  const short = shortenUrl(url, 45);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="mb-4 flex items-center gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl px-3 py-2.5"
    >
      {/* Favicon */}
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
          alt={domain}
          className="w-5 h-5 object-contain"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* URL info */}
      <div className="flex-1 min-w-0 text-right">
        <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">
          رابط مكتشف
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-700 dark:text-slate-200 hover:underline font-mono truncate block"
          title={url}
          dir="ltr"
        >
          {short}
        </a>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
          title="فتح الرابط"
        >
          <ExternalLink size={15} className="text-blue-500" />
        </a>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          title="إزالة الرابط"
        >
          <XCircle size={15} className="text-red-400" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const CreatePromptModal: React.FC<CreatePromptModalProps> = ({ isOpen, onClose, onSubmit, tags }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dismissedUrl, setDismissedUrl] = useState<string | null>(null);

  // Detect the first URL in the prompt text
  const detectedUrls = useMemo(() => extractUrls(promptText), [promptText]);
  const primaryUrl = detectedUrls[0] ?? null;
  const showLinkPreview = primaryUrl !== null && primaryUrl !== dismissedUrl;

  const hasContent = title.trim() || promptText.trim();

  const handleSubmit = async () => {
    if (!hasContent) return;
    setSubmitting(true);
    try {
      await onSubmit({
        post_type: 'prompt',
        title: title.trim(), // empty string if no title entered → card won't show it
        prompt_text: promptText,
        ai_output: '',
        ai_model: '',
        description: promptText,
        code_snippet: codeSnippet,
        code_language: '',
        link_url: showLinkPreview ? (primaryUrl ?? '') : '',
        tag_slugs: selectedTags,
      });
      setTitle('');
      setPromptText('');
      setCodeSnippet('');
      setShowCode(false);
      setShowTags(false);
      setSelectedTags([]);
      setDismissedUrl(null);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (slug: string) => {
    setSelectedTags(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  if (!isOpen) return null;

  const avatarColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600'];
  const getAvatarColor = (name: string) => avatarColors[(name || '').charCodeAt(0) % avatarColors.length];

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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-[#242526] w-full max-w-[500px] rounded-xl flex flex-col overflow-hidden max-h-[90vh]"
          style={{ boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)' }}
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex-grow text-center">إنشاء منشور</h1>
            <div className="w-9" />
          </header>

          <main className="p-4 overflow-y-auto">
            {/* User Info */}
            {user && (
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-full shrink-0 ${getAvatarColor(user.displayName || 'م')} flex items-center justify-center text-white font-bold text-sm ml-3`}>
                  {user?.displayName?.[0] || 'م'}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 dark:text-slate-100 text-[15px]">{user.displayName}</span>
                  <div className="flex items-center bg-gray-200 dark:bg-gray-700 w-fit px-2 py-0.5 rounded-md mt-0.5 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <Globe size={14} className="text-gray-600 dark:text-slate-400 ml-1" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">العامة</span>
                    <ChevronDown size={12} className="text-gray-600 dark:text-slate-400 mr-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Title input (minimal) */}
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="عنوان مختصر (اختياري)..."
              className="w-full text-base border-none focus:ring-0 resize-none p-0 placeholder-gray-500 dark:placeholder-gray-400 bg-transparent text-right text-slate-900 dark:text-white font-bold mb-2"
            />

            {/* Text Input */}
            <div className="relative min-h-[120px] mb-4">
              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder={`بم تفكر يا ${user?.displayName?.split(' ')[0] || 'صديقي'}؟`}
                rows={4}
                className="w-full text-xl border-none focus:ring-0 resize-none p-0 placeholder-gray-500 dark:placeholder-gray-400 overflow-hidden bg-transparent text-right text-slate-900 dark:text-white"
              />
              <div className="flex justify-between items-center mt-2">
                <button className="cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                  <Smile size={24} className="text-gray-400" />
                </button>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:opacity-90"
                  style={{ background: 'linear-gradient(45deg, #FF007A, #FF7A00, #00C2FF)' }}
                >
                  <span className="text-white font-bold text-xs">Aa</span>
                </div>
              </div>
            </div>

            {/* ── Auto-detected Link Preview ── */}
            <AnimatePresence>
              {showLinkPreview && primaryUrl && (
                <LinkPreviewCard
                  key={primaryUrl}
                  url={primaryUrl}
                  onRemove={() => setDismissedUrl(primaryUrl)}
                />
              )}
            </AnimatePresence>

            {/* Multiple links badge */}
            {detectedUrls.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
              >
                <Link2 size={13} />
                <span>تم اكتشاف {detectedUrls.length} روابط — سيتم حفظ الأول تلقائياً</span>
              </motion.div>
            )}

            {/* Code snippet toggle */}
            {showCode && (
              <div className="mb-4">
                <textarea
                  value={codeSnippet}
                  onChange={e => setCodeSnippet(e.target.value)}
                  placeholder="الصق الكود هنا..."
                  rows={4}
                  className="w-full bg-slate-950 text-slate-200 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                  dir="ltr"
                />
              </div>
            )}

            {/* Tags toggle */}
            {showTags && tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.slug}
                      onClick={() => toggleTag(tag.slug)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedTags.includes(tag.slug)
                          ? 'text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                      }`}
                      style={selectedTags.includes(tag.slug) ? { backgroundColor: tag.color } : {}}
                    >
                      {tag.icon} {tag.label_ar}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add To Post Section */}
            <div className="border border-gray-300 dark:border-slate-600 rounded-lg p-3 flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-700 dark:text-slate-200 text-[15px]">إضافة إلى منشورك</span>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="صورة"
                  onClick={() => toast('الصور قريباً!', { icon: '📷' })}
                >
                  <ImageIcon size={22} className="text-green-500" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="فيديو"
                  onClick={() => toast('الفيديو قريباً!', { icon: '🎬' })}
                >
                  <Video size={22} className="text-blue-500" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="إشارة"
                  onClick={() => toast('الإشارات قريباً!', { icon: '👥' })}
                >
                  <Users size={22} className="text-blue-400" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="مكان"
                  onClick={() => toast('الأماكن قريباً!', { icon: '📍' })}
                >
                  <MapPin size={22} className="text-red-500" />
                </button>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors ${showCode ? 'bg-purple-50 dark:bg-purple-500/20' : ''}`}
                  title="كود"
                >
                  <Code size={22} className="text-purple-500" />
                </button>
                <button
                  onClick={() => setShowTags(!showTags)}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors ${showTags ? 'bg-amber-50 dark:bg-amber-500/20' : ''}`}
                  title="تصنيفات"
                >
                  <Tag size={22} className="text-amber-500" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="مزيد"
                  onClick={() => toast('المزيد قريباً!', { icon: '➕' })}
                >
                  <MoreHorizontal size={22} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!hasContent || submitting}
              className={`w-full font-semibold py-2.5 rounded-lg text-lg transition-colors ${
                hasContent && !submitting
                  ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'نشر'}
            </button>
          </main>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePromptModal;

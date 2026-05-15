'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart, MessageSquare, Share2, Trash2,
  Globe, MoreHorizontal,
} from 'lucide-react';
import type { CommunityPrompt } from '../../types/community';

interface PromptCardProps {
  prompt: CommunityPrompt;
  userVote?: 'up' | 'down' | null;
  isOwner?: boolean;
  onVote: (promptId: string, voteType: 'up' | 'down') => void;
  onComment: (promptId: string) => void;
  onShare: (promptId: string) => void;
  onDelete?: (promptId: string) => void;
  // kept in interface for backward-compat but not used
  isSaved?: boolean;
  onSave?: (promptId: string) => void;
  onRemix?: (prompt: CommunityPrompt) => void;
  onClick?: (promptId: string) => void;
}

// ─── URL auto-detection ──────────────────────────────────────────────────────
const URL_REGEX = /(https?:\/\/[^\s]+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|co|app|dev|ai|me|gov|edu|ly|gg|to|link|info|site|online|store|shop|tech)(?:\/[^\s]*)?)/g;

function shortenUrl(url: string, max = 45): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const base = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname + parsed.search;
    const full = base + path;
    return full.length <= max ? full : base + '/…' + path.slice(-(max - base.length - 2));
  } catch {
    return url.length > max ? url.slice(0, max - 1) + '…' : url;
  }
}

function renderTextWithLinks(text: string): React.ReactNode[] {
  const parts = text.split(URL_REGEX);
  URL_REGEX.lastIndex = 0;
  return parts.map((part, i) => {
    const isUrl = URL_REGEX.test(part);
    URL_REGEX.lastIndex = 0;
    if (isUrl) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
          dir="ltr"
        >
          {shortenUrl(part)}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const avatarColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-indigo-600', 'bg-cyan-600'];
const getAvatarColor = (name: string) => avatarColors[(name || '').charCodeAt(0) % avatarColors.length];

const formatCount = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  const d = Math.floor(h / 24);
  return d < 30 ? `منذ ${d} يوم` : `منذ ${Math.floor(d / 30)} شهر`;
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const PromptCard: React.FC<PromptCardProps> = ({
  prompt, userVote, isOwner = false,
  onVote, onComment, onShare, onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const contentText = (prompt.prompt_text || prompt.description || '').trim();
  const isLong = contentText.length > 280;
  const displayText = expanded || !isLong ? contentText : contentText.slice(0, 280);

  const liked = userVote === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-2 flex justify-between items-start">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Link href={`/profile?username=${prompt.author_username || ''}`} className="shrink-0 hover:opacity-90">
            <div className={`w-10 h-10 rounded-full ${getAvatarColor(prompt.author_name)} flex items-center justify-center text-white font-bold text-sm border border-gray-100 dark:border-gray-700`}>
              {prompt.author_name?.[0] || 'م'}
            </div>
          </Link>
          <div>
            <Link href={`/profile?username=${prompt.author_username || ''}`}>
              <span className="font-bold text-gray-900 dark:text-white text-[15px] hover:underline">{prompt.author_name}</span>
            </Link>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
              <Globe size={11} />
              <span>{timeAgo(prompt.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Menu — owner only */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600 py-2 z-50 min-w-[130px]">
                <button
                  onClick={() => { onDelete?.(prompt.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold"
                >
                  <Trash2 size={15} />
                  حذف المنشور
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Title — only if the user explicitly entered one ── */}
      {prompt.title?.trim() && (
        <div className="px-4 pb-1">
          <h2 className="text-base font-black text-slate-900 dark:text-white leading-snug">{prompt.title.trim()}</h2>
        </div>
      )}

      {/* ── Body text with auto-linked URLs ── */}
      <div className="px-4 pb-3 text-[15px] text-gray-800 dark:text-gray-100 leading-relaxed">
        <p className="whitespace-pre-wrap">
          {renderTextWithLinks(displayText)}
          {isLong && !expanded && (
            <span
              onClick={() => setExpanded(true)}
              className="font-semibold cursor-pointer hover:underline text-slate-500 dark:text-slate-400"
            > عرض المزيد</span>
          )}
          {isLong && expanded && (
            <span
              onClick={() => setExpanded(false)}
              className="font-semibold cursor-pointer hover:underline text-slate-500 dark:text-slate-400"
            > إخفاء</span>
          )}
        </p>
      </div>

      {/* ── Tags ── */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {prompt.tags.map(tag => (
            <span
              key={tag.slug}
              className="px-2.5 py-0.5 text-[11px] font-bold rounded-full"
              style={{ backgroundColor: `${tag.color}18`, color: tag.color }}
            >
              {tag.label_ar}
            </span>
          ))}
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400 font-medium">
        <span>{formatCount(prompt.upvotes_count || 0)} إعجاب</span>
        <span>{formatCount(prompt.comments_count || 0)} تعليق</span>
      </div>

      {/* ── Action buttons ── */}
      <div className="px-2 py-1 border-t border-gray-100 dark:border-gray-700/60 flex items-center">
        {/* Like */}
        <button
          onClick={() => onVote(prompt.id, 'up')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            liked
              ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <Heart size={19} className={liked ? 'fill-current' : ''} />
          أعجبني
        </button>

        {/* Comment */}
        <button
          onClick={() => onComment(prompt.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <MessageSquare size={19} />
          تعليق
        </button>

        {/* Share */}
        <button
          onClick={() => onShare(prompt.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <Share2 size={19} />
          مشاركة
        </button>
      </div>
    </motion.div>
  );
};

export default PromptCard;

'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  MoreHorizontal,
  Code,
  Copy,
  Check,
  Send,
  Loader2,
  ExternalLink,
  Sparkles,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { CommunityPrompt, PromptComment } from '../../types/community';
import { POST_TYPE_CONFIG } from '../../types/community';
import { extractMentionedTools } from '../../utils/toolMention';
import MentionedToolCard from './MentionedToolCard';
import TechStackBentoGrid from './TechStackBentoGrid';
import InteractivePoll from './InteractivePoll';
import ToolMentionDropdown from './ToolMentionDropdown';
import { useToolMention } from '../../hooks/useToolMention';
import type { Tool } from '../../types/tool';
import { extractMetadataFromText } from '../../utils/stackAndPollHelpers';

interface PromptCardProps {
  prompt: CommunityPrompt;
  userVote?: 'up' | 'down' | null;
  isOwner?: boolean;
  currentUser?: any;
  onVote: (promptId: string, voteType: 'up' | 'down') => void;
  onComment: (promptId: string) => void;
  onShare: (promptId: string) => void;
  onDelete?: (promptId: string) => void;
  onTagClick?: (tagSlug: string) => void;
  // Inline comments support
  comments?: PromptComment[];
  isLoadingComments?: boolean;
  isCommentsOpen?: boolean;
  onAddComment?: (promptId: string, text: string) => Promise<void>;
  onDeleteComment?: (commentId: string, promptId: string) => Promise<void>;
}

// URL & Tool Mention auto-detection
const TOKEN_REGEX = /(@\[[^\]]+\]\([^)]+\)|(?<=^|\s)@[a-zA-Z0-9_-]{2,30}|https?:\/\/[^\s]+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|co|app|dev|ai|me|gov|edu|ly|gg|to|link|info|site|online|store|shop|tech)(?:\/[^\s]*)?)/g;

function shortenUrl(url: string, max = 40): string {
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
  if (!text) return [];
  const parts = text.split(TOKEN_REGEX);

  const result: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // 1. Check if it's a Tool Mention: @[ToolName](slug)
    const mentionMatch = part.match(/^@\[([^\]]+)\]\(([^)]+)\)$/);
    if (mentionMatch) {
      const toolName = mentionMatch[1];
      const toolSlug = mentionMatch[2];
      result.push(
        <Link
          key={`mention-${i}-${toolSlug}`}
          href={`/tools/${toolSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 mx-1 px-2.5 py-0.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/80 transition-all shadow-2xs align-middle hover:scale-[1.02]"
          title={`عرض بطاقة وتفاصيل أداة ${toolName}`}
        >
          <span className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
            @
          </span>
          <span className="truncate max-w-[150px]">{toolName}</span>
          <ArrowUpRight className="w-3 h-3 text-blue-500 shrink-0" />
        </Link>
      );
      continue;
    }

    // 2. Direct format: @tool-slug
    const directMatch = part.match(/^@([a-zA-Z0-9_-]{2,30})$/);
    if (directMatch) {
      const toolSlug = directMatch[1];
      result.push(
        <Link
          key={`direct-mention-${i}-${toolSlug}`}
          href={`/tools/${toolSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60 transition-all align-middle hover:scale-[1.02]"
          title={`عرض تفاصيل أداة ${toolSlug}`}
        >
          <span className="text-blue-500 font-bold">@</span>
          <span>{toolSlug}</span>
          <ArrowUpRight className="w-2.5 h-2.5 text-blue-500 shrink-0" />
        </Link>
      );
      continue;
    }

    // 3. Check if it's a URL
    const isUrl = /(https?:\/\/[^\s]+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|co|app|dev|ai|me|gov|edu|ly|gg|to|link|info|site|online|store|shop|tech)(?:\/[^\s]*)?)/i.test(
      part
    );

    if (isUrl) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      result.push(
        <a
          key={`url-${i}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold break-all inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
          dir="ltr"
        >
          <span>{shortenUrl(part)}</span>
          <ExternalLink className="w-3 h-3 inline text-blue-500 shrink-0" />
        </a>
      );
      continue;
    }

    result.push(<React.Fragment key={`text-${i}`}>{part}</React.Fragment>);
  }

  return result;
}

const avatarColors = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-cyan-600',
];
const getAvatarColor = (name: string) =>
  avatarColors[(name || '').charCodeAt(0) % avatarColors.length];

const formatCount = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n || 0);
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

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  userVote,
  isOwner = false,
  currentUser,
  onVote,
  onComment,
  onShare,
  onDelete,
  onTagClick,
  comments = [],
  isLoadingComments = false,
  isCommentsOpen = false,
  onAddComment,
  onDeleteComment,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentMentionMatches, setCommentMentionMatches] = useState<Tool[]>([]);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Hook for @ tool mention autocomplete in comments
  const {
    isOpen: isCommentMentionOpen,
    query: commentMentionQuery,
    activeIndex: commentMentionActiveIndex,
    setActiveIndex: setCommentMentionActiveIndex,
    handleInputChange: handleCommentMentionChange,
    insertTool: insertCommentTool,
    handleKeyDown: handleCommentMentionKeyDown,
    closeMention: closeCommentMention,
  } = useToolMention();

  const handleSelectCommentMentionTool = (tool: Tool) => {
    const { newText, newCursor } = insertCommentTool(
      tool,
      commentText,
      commentInputRef.current?.selectionStart ?? undefined
    );
    setCommentText(newText);
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
        commentInputRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 0);
  };

  // Extract metadata (stack_tools and poll) from prompt props or serialized text
  const { stack_tools: extractedStack, poll: extractedPoll, cleanText } = React.useMemo(() => {
    return extractMetadataFromText(prompt.description, prompt.prompt_text);
  }, [prompt.description, prompt.prompt_text]);

  const activeStackTools = prompt.stack_tools || extractedStack || [];
  const activePoll = prompt.poll || extractedPoll || null;

  const authorIdentifier = prompt.author_username || prompt.author_uid || prompt.author_name || 'user';
  const authorProfilePath = `/community/user/${encodeURIComponent(authorIdentifier)}`;

  const contentText = (cleanText || prompt.prompt_text || prompt.description || '').trim();
  const isLong = contentText.length > 280;
  const displayText = expanded || !isLong ? contentText : contentText.slice(0, 280);

  const liked = userVote === 'up';

  // Extract all mentioned tools from text and prompt.mentioned_tools
  const parsedMentions = React.useMemo(() => {
    const rawContent = cleanText || prompt.prompt_text || prompt.description || '';
    const fromText = extractMentionedTools(rawContent);
    const slugsFromProp = prompt.mentioned_tools || [];

    const map: Record<string, string> = {};
    fromText.forEach((m) => {
      map[m.slug] = m.name;
    });

    // Exclude tools that are already part of activeStackTools to avoid redundancy
    const stackToolIds = new Set(activeStackTools.map((st) => st.tool_id.toLowerCase()));

    const allSlugs = Array.from(
      new Set([...fromText.map((m) => m.slug), ...slugsFromProp])
    ).filter((s) => !stackToolIds.has(s.toLowerCase()));

    return { allSlugs, map };
  }, [cleanText, prompt.prompt_text, prompt.description, prompt.mentioned_tools, activeStackTools]);

  const typeConfig = POST_TYPE_CONFIG[prompt.post_type] || {
    label: 'منشور',
    icon: '✨',
    color: '#3b82f6',
  };

  const handleCopyCode = async () => {
    if (!prompt.code_snippet) return;
    try {
      await navigator.clipboard.writeText(prompt.code_snippet);
      setCopiedCode(true);
      toast.success('تم نسخ الكود بنجاح! 📋');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('فشل نسخ الكود');
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onAddComment) return;
    try {
      setIsSubmittingComment(true);
      await onAddComment(prompt.id, commentText.trim());
      setCommentText('');
      closeCommentMention();
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <article
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700/80 transition-all relative"
      dir="rtl"
    >
      {/* ─── Header: Author Info + Type Badge + Menu ─── */}
      <div className="p-3.5 sm:p-5 pb-2.5 sm:pb-3 flex items-start justify-between gap-3">
        {/* Author */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href={authorProfilePath}
            className="shrink-0 hover:opacity-90 transition-opacity"
          >
            {prompt.author_avatar && prompt.author_avatar.startsWith('http') ? (
              <img
                src={prompt.author_avatar}
                alt={prompt.author_name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
              />
            ) : (
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${getAvatarColor(
                  prompt.author_name
                )} flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm`}
              >
                {prompt.author_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </Link>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href={authorProfilePath}
                className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm hover:underline truncate max-w-[150px] sm:max-w-none"
              >
                {prompt.author_name}
              </Link>
              {prompt.author_username && (
                <span className="text-[11px] sm:text-xs text-neutral-400 font-mono hidden sm:inline">
                  @{prompt.author_username}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>{timeAgo(prompt.created_at)}</span>
              </span>
              <span>•</span>
              <span
                className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                style={{
                  backgroundColor: `${typeConfig.color}15`,
                  color: typeConfig.color,
                }}
              >
                <span>{typeConfig.icon}</span>
                <span>{typeConfig.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
            title="خيارات"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute left-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 z-20 text-xs font-semibold animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  onShare(prompt.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة الرابط</span>
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete?.(prompt.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف المنشور</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Post Title (if present) ─── */}
      {prompt.title?.trim() && (
        <div className="px-4 sm:px-5 pb-2">
          <h2 className="text-base font-black text-neutral-900 dark:text-white leading-snug">
            {prompt.title.trim()}
          </h2>
        </div>
      )}

      {/* ─── Body text with URL auto-links ─── */}
      {contentText && (
        <div className="px-4 sm:px-5 pb-3 text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
          <p className="whitespace-pre-wrap">
            {renderTextWithLinks(displayText)}
            {isLong && !expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline mr-1 text-xs"
              >
                ...عرض المزيد
              </button>
            )}
            {isLong && expanded && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline mr-1 text-xs"
              >
                إخفاء
              </button>
            )}
          </p>
        </div>
      )}

      {/* ─── Tech Stack Bento Grid (if present) ─── */}
      {activeStackTools.length > 0 && (
        <div className="px-4 sm:px-5 pb-3">
          <TechStackBentoGrid title={prompt.title} tools={activeStackTools} />
        </div>
      )}

      {/* ─── Interactive Poll (if present) ─── */}
      {activePoll && (
        <div className="px-4 sm:px-5 pb-3">
          <InteractivePoll
            promptId={prompt.id}
            poll={activePoll}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* ─── Mentioned Tools Mini Bento Cards ─── */}
      {parsedMentions.allSlugs.length > 0 && (
        <div className="px-4 sm:px-5 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>الأدوات المذكورة في المنشور:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {parsedMentions.allSlugs.map((slug) => (
              <MentionedToolCard
                key={slug}
                toolSlug={slug}
                fallbackName={parsedMentions.map[slug]}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Code Snippet Block (if present) ─── */}
      {prompt.code_snippet && (
        <div className="px-4 sm:px-5 pb-4">
          <div className="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 text-left font-mono text-xs">
            <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-900/90 border-b border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                {prompt.code_language || 'code'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 hidden xs:inline">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="hidden xs:inline">نسخ</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 sm:p-3.5 overflow-x-auto text-neutral-200 text-xs leading-relaxed max-h-72">
              <code>{prompt.code_snippet}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ─── Tags ─── */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3.5 sm:px-5 pb-2.5 sm:pb-3">
          {prompt.tags.map((tag: any, idx) => {
            const tagSlug = typeof tag === 'string' ? tag : tag?.slug || tag?.id || `tag-${idx}`;
            const tagLabel = typeof tag === 'string' ? tag : tag?.label_ar || tag?.slug || tagSlug;
            const tagColor = typeof tag === 'object' && tag?.color ? tag.color : '#3b82f6';
            return (
              <button
                key={tagSlug || `tag-${idx}`}
                type="button"
                onClick={() => onTagClick?.(tagSlug)}
                className="px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: `${tagColor}15`,
                  color: tagColor,
                }}
              >
                #{tagLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Bottom Action Bar ─── */}
      <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-neutral-500">
        {/* Like Button */}
        <button
          type="button"
          onClick={() => onVote(prompt.id, 'up')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all ${
            liked
              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/30'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              liked ? 'fill-current scale-110 text-rose-500' : ''
            }`}
          />
          <span className="font-mono text-[11px] sm:text-xs">{formatCount(prompt.upvotes_count || 0)}</span>
          <span className="hidden sm:inline">إعجاب</span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={() => onComment(prompt.id)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all ${
            isCommentsOpen
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="font-mono text-[11px] sm:text-xs">{formatCount(prompt.comments_count || 0)}</span>
          <span className="hidden sm:inline">تعليقات</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => onShare(prompt.id)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">مشاركة</span>
        </button>
      </div>

      {/* ─── Inline Comments Drawer ─── */}
      {isCommentsOpen && (
        <div className="bg-neutral-50/60 dark:bg-neutral-950/40 border-t border-neutral-100 dark:border-neutral-800/80 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          
          {/* Add Comment Input Box */}
          {currentUser ? (
            <form onSubmit={handleSendComment} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
              </div>

              <div className="relative flex-1">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCommentText(val);
                    handleCommentMentionChange(val, e.target.selectionStart ?? val.length);
                  }}
                  onKeyDown={(e) => {
                    if (isCommentMentionOpen && commentMentionMatches.length > 0) {
                      const intercepted = handleCommentMentionKeyDown(
                        e,
                        commentMentionMatches.length,
                        () => {
                          const selected = commentMentionMatches[commentMentionActiveIndex];
                          if (selected) {
                            handleSelectCommentMentionTool(selected);
                          }
                        }
                      );
                      if (intercepted) return;
                    }
                  }}
                  placeholder="اكتب تعليقك... (استخدم @ للإشارة لأداة)"
                  className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-neutral-400"
                />

                {/* Quick @ mention trigger button inside input */}
                <button
                  type="button"
                  onClick={() => {
                    const currentPos = commentInputRef.current?.selectionStart ?? commentText.length;
                    const textBefore = commentText.slice(0, currentPos);
                    const textAfter = commentText.slice(currentPos);
                    const needsSpace = textBefore.length > 0 && !textBefore.endsWith(' ');
                    const inserted = needsSpace ? ' @' : '@';
                    const newText = `${textBefore}${inserted}${textAfter}`;
                    const newPos = currentPos + inserted.length;
                    setCommentText(newText);
                    setTimeout(() => {
                      if (commentInputRef.current) {
                        commentInputRef.current.focus();
                        commentInputRef.current.setSelectionRange(newPos, newPos);
                        handleCommentMentionChange(newText, newPos);
                      }
                    }, 0);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="الإشارة لأداة ذكية من الدليل (@)"
                >
                  @
                </button>

                {/* Tool Mention Autocomplete Dropdown */}
                <ToolMentionDropdown
                  isOpen={isCommentMentionOpen}
                  searchQuery={commentMentionQuery}
                  activeIndex={commentMentionActiveIndex}
                  setActiveIndex={setCommentMentionActiveIndex}
                  onMatchesChange={setCommentMentionMatches}
                  onClose={closeCommentMention}
                  onSelect={handleSelectCommentMentionTool}
                  className="top-full mt-1.5 left-0 right-0 max-w-sm sm:max-w-md shadow-2xl"
                />
              </div>

              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1 shrink-0"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 rotate-180" />
                )}
                <span className="hidden sm:inline">إرسال</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-2 text-xs text-neutral-400">
              <Link href="/auth" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                سجّل دخولك
              </Link>{' '}
              للمشاركة والتعليق على هذا المنشور.
            </div>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-xs text-neutral-400">
              لا توجد تعليقات بعد. كن أول من يعلق! 💬
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pl-1">
              {comments.map((comment, idx) => {
                const commentAuthorIdentifier = comment.author_username || comment.author_uid || comment.author_name || 'user';
                const commentAuthorProfilePath = `/community/user/${encodeURIComponent(commentAuthorIdentifier)}`;
                const commentMentions = extractMentionedTools(comment.content || '');

                return (
                  <div
                    key={comment.id || `comment-${idx}`}
                    className="flex items-start justify-between gap-2.5 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/80 text-xs hover:border-neutral-200 dark:hover:border-neutral-700/60 transition-all"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <Link href={commentAuthorProfilePath} className="shrink-0">
                        <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-[11px] text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5 hover:ring-2 hover:ring-blue-500/40 transition-all">
                          {comment.author_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={commentAuthorProfilePath}
                            className="font-bold text-neutral-900 dark:text-white hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {comment.author_name}
                          </Link>
                          <span className="text-[10px] text-neutral-400">
                            {timeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                          {renderTextWithLinks(comment.content)}
                        </p>

                        {/* Interactive Tool Mention Badges under comment */}
                        {commentMentions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {commentMentions.map((m) => (
                              <Link
                                key={`cmt-m-${m.slug}`}
                                href={`/tools/${m.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200/60 dark:border-blue-800/60"
                                title={`استكشف أداة ${m.name}`}
                              >
                                <Sparkles className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                                <span>{m.name}</span>
                                <ArrowUpRight className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {currentUser?.uid === comment.author_uid && onDeleteComment && (
                      <button
                        type="button"
                        onClick={() => onDeleteComment(comment.id, prompt.id)}
                        className="text-neutral-400 hover:text-rose-500 p-1 transition-colors shrink-0"
                        title="حذف التعليق"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default PromptCard;

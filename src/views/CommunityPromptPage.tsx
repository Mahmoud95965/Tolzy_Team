'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUp,
  Users,
  Search,
  X,
  Code,
  Send,
  Zap,
  Tag,
  BarChart2,
  Lightbulb,
  Layers,
  HelpCircle,
  Globe,
  Share2,
  MessageSquare,
  Flame,
  CheckCircle2,
  Plus
} from 'lucide-react';
import PromptCard from '../components/community/PromptCard';
import ToolMentionDropdown from '../components/community/ToolMentionDropdown';
import TechStackBuilder from '../components/community/TechStackBuilder';
import PollBuilder from '../components/community/PollBuilder';
import { useToolMention } from '../hooks/useToolMention';
import { extractMentionedToolSlugs, formatToolMentionToken } from '../utils/toolMention';
import { useTools } from '../hooks/useTools';
import { Tool } from '../types/tool';
import type {
  CommunityPrompt,
  PromptTag,
  FeedSortMode,
  PostType,
  PromptComment,
  StackToolItem,
  CommunityPoll,
} from '../types/community';

// Feed Sort Options
const SORT_OPTIONS: { key: FeedSortMode; label: string; icon: React.ReactNode }[] = [
  { key: 'latest', label: 'الأحدث', icon: <Clock className="w-3.5 h-3.5" /> },
  { key: 'trending', label: 'الأكثر رواجاً', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: 'top', label: 'الأعلى تفاعلاً', icon: <ArrowUp className="w-3.5 h-3.5" /> },
];

// First-class post types with dedicated Poll / Comparison type
const COMPOSER_POST_TYPES: { type: PostType; label: string; icon: React.ReactNode; color: string; badge: string }[] = [
  { type: 'idea', label: 'نقاش وفكرة', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'text-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { type: 'poll', label: 'استطلاع وتصويت', icon: <BarChart2 className="w-3.5 h-3.5" />, color: 'text-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  { type: 'prompt', label: 'برومبت AI', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  { type: 'code', label: 'كود تقني', icon: <Code className="w-3.5 h-3.5" />, color: 'text-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { type: 'stack', label: 'حزمة أدوات', icon: <Layers className="w-3.5 h-3.5" />, color: 'text-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { type: 'question', label: 'سؤال واستفسار', icon: <HelpCircle className="w-3.5 h-3.5" />, color: 'text-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const CommunityPromptPage: React.FC = () => {
  const { user } = useAuth();

  // Feed State
  const [prompts, setPrompts] = useState<CommunityPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<FeedSortMode>('latest');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<PostType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Tags State
  const [tags, setTags] = useState<(PromptTag & { prompts_count?: number })[]>([]);

  // User Reactions
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  // Inline Comments State
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PromptComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  // Quick Post Composer State
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [composerType, setComposerType] = useState<PostType>('idea');
  const [composerTitle, setComposerTitle] = useState('');
  const [composerContent, setComposerContent] = useState('');
  const [composerMentionedTools, setComposerMentionedTools] = useState<string[]>([]);
  const [composerStackTools, setComposerStackTools] = useState<StackToolItem[]>([]);
  const [composerPoll, setComposerPoll] = useState<CommunityPoll | null>(null);
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [showTagsPicker, setShowTagsPicker] = useState(false);
  const [composerCode, setComposerCode] = useState('');
  const [composerLanguage, setComposerLanguage] = useState('javascript');
  const [composerSelectedTags, setComposerSelectedTags] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const { tools: availableTools } = useTools();
  const [mentionMatches, setMentionMatches] = useState<Tool[]>([]);

  // Tool Mention hook
  const {
    isOpen: isMentionOpen,
    query: mentionQuery,
    activeIndex: mentionActiveIndex,
    setActiveIndex: setMentionActiveIndex,
    handleInputChange: handleMentionChange,
    insertTool,
    handleKeyDown: handleMentionKeyDown,
    closeMention,
  } = useToolMention();

  // Sidebar Computed Data
  const [trendingTags, setTrendingTags] = useState<(PromptTag & { count: number })[]>([]);
  const [topCreators, setTopCreators] = useState<any[]>([]);

  // When composerType changes to 'poll', initialize empty poll if not present
  const handleTypeSelect = (type: PostType) => {
    setComposerType(type);
    setIsComposerExpanded(true);
    if (type === 'poll') {
      setShowPollBuilder(true);
      if (!composerPoll) {
        setComposerPoll({
          question: composerTitle || '',
          options: [
            { id: 'opt-1', text: '', votes_count: 0 },
            { id: 'opt-2', text: '', votes_count: 0 },
          ],
          total_votes: 0,
        });
      }
    }
  };

  // ─── Fetch Tags ────────────────────────────────────────────
  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/community/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags || []);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  }, []);

  // ─── Compute Sidebar Aggregations ──────────────────────────
  const computeSidebarData = useCallback((allPrompts: CommunityPrompt[]) => {
    const tagCount: Record<string, { tag: PromptTag; count: number }> = {};
    allPrompts.forEach((p) => {
      (p.tags || []).forEach((t: any) => {
        const slug = typeof t === 'string' ? t : t?.slug || t?.id;
        if (!slug) return;
        const normalizedTag: PromptTag = typeof t === 'string'
          ? { id: slug, slug, label_ar: slug, label_en: slug, color: '#3b82f6', icon: '✨' }
          : t;
        if (!tagCount[slug]) tagCount[slug] = { tag: normalizedTag, count: 0 };
        tagCount[slug].count++;
      });
    });

    setTrendingTags(
      Object.values(tagCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .map((item) => ({ ...item.tag, count: item.count }))
    );

    const creators: Record<
      string,
      {
        name: string;
        username: string;
        avatar: string | null;
        uid: string;
        prompts: number;
        upvotes: number;
      }
    > = {};

    allPrompts.forEach((p, idx) => {
      const creatorKey = p.author_uid || p.author_username || p.author_name || `author-${idx}`;

      if (!creators[creatorKey]) {
        creators[creatorKey] = {
          name: p.author_name || 'مستخدم',
          username: p.author_username || '',
          avatar: p.author_avatar || null,
          uid: p.author_uid || creatorKey,
          prompts: 0,
          upvotes: 0,
        };
      }
      creators[creatorKey].prompts++;
      creators[creatorKey].upvotes += p.upvotes_count || 0;
    });

    setTopCreators(
      Object.values(creators)
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 5)
    );
  }, []);

  // ─── Fetch Feed ────────────────────────────────────────────
  const fetchFeed = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          sort,
          page: String(pageNum),
          limit: '20',
        });
        if (activeTag) params.set('tag', activeTag);
        if (activeType) params.set('type', activeType);

        const res = await fetch(`/api/community/feed?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const fetchedPrompts = data.prompts || [];
          if (append) {
            setPrompts((prev) => {
              const updated = [...prev, ...fetchedPrompts];
              computeSidebarData(updated);
              return updated;
            });
          } else {
            setPrompts(fetchedPrompts);
            computeSidebarData(fetchedPrompts);
          }
          setHasMore(data.hasMore);
          setPage(pageNum);
        }
      } catch (err) {
        toast.error('حدث خطأ أثناء تحميل المنشورات');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sort, activeTag, activeType, computeSidebarData]
  );

  // ─── Fetch User Votes / State ──────────────────────────────
  const fetchUserState = useCallback(
    async (promptIds: string[]) => {
      if (!user?.uid || !promptIds.length) return;
      try {
        const params = new URLSearchParams({
          user_uid: user.uid,
          prompt_ids: promptIds.join(','),
        });
        const res = await fetch(`/api/community/user-state?${params}`);
        if (res.ok) {
          const { votes } = await res.json();
          setUserVotes((prev) => ({ ...prev, ...votes }));
        }
      } catch (err) {
        // silent fail
      }
    },
    [user?.uid]
  );

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  useEffect(() => {
    if (prompts.length > 0) {
      fetchUserState(prompts.map((p) => p.id));
    }
  }, [prompts, fetchUserState]);

  // Check for pre-filled tool mention from URL (e.g. from tool detail page discussions CTA)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const mentionParam = sp.get('mention');
      const toolIdParam = sp.get('toolId');
      if (mentionParam || toolIdParam) {
        const toolName = mentionParam || toolIdParam || '';
        const toolId = toolIdParam || mentionParam || '';
        const token = formatToolMentionToken(toolName, toolId);
        setComposerContent(`أشارككم تجربتي ورأيي حول أداة ${token}: `);
        setComposerMentionedTools([toolId]);
        setIsComposerExpanded(true);
        toast.success(`شارك تجربتك مع أداة ${toolName} في المجتمع! ✨`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  // ─── Handle Voting (Optimistic) ───────────────────────────
  const handleVote = async (promptId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً للتفاعل');
      return;
    }

    const currentVote = userVotes[promptId];
    const isRemoving = currentVote === voteType;
    const diff = isRemoving ? -1 : currentVote ? 2 : 1;

    // Optimistic UI update
    setUserVotes((prev) => {
      const next = { ...prev };
      if (isRemoving) delete next[promptId];
      else next[promptId] = voteType;
      return next;
    });

    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId
          ? { ...p, upvotes_count: Math.max(0, (p.upvotes_count || 0) + diff) }
          : p
      )
    );

    try {
      await fetch('/api/community/prompts/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id: promptId, vote_type: voteType, user_uid: user.uid }),
      });
    } catch {
      // rollback on error
      setUserVotes((prev) => ({ ...prev, [promptId]: currentVote }));
    }
  };

  // ─── Inline Comments Toggle ───────────────────────────────
  const handleToggleComments = async (promptId: string) => {
    if (openCommentsPostId === promptId) {
      setOpenCommentsPostId(null);
      return;
    }

    setOpenCommentsPostId(promptId);

    if (!commentsMap[promptId]) {
      setLoadingComments((prev) => new Set(prev).add(promptId));
      try {
        const res = await fetch(`/api/community/comments?prompt_id=${promptId}`);
        if (res.ok) {
          const { data } = await res.json();
          setCommentsMap((prev) => ({ ...prev, [promptId]: data || [] }));
        }
      } catch {
        toast.error('فشل تحميل التعليقات');
      } finally {
        setLoadingComments((prev) => {
          const next = new Set(prev);
          next.delete(promptId);
          return next;
        });
      }
    }
  };

  // ─── Add Comment ──────────────────────────────────────────
  const handleAddComment = async (promptId: string, text: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للتعليق');
      return;
    }

    const optimisticComment: PromptComment = {
      id: `temp-${Date.now()}`,
      prompt_id: promptId,
      author_uid: user.uid,
      author_name: user.displayName || 'مستخدم',
      author_avatar: user.photoURL || null,
      content: text,
      parent_comment_id: null,
      created_at: new Date().toISOString(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [promptId]: [...(prev[promptId] || []), optimisticComment],
    }));

    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId
          ? { ...p, comments_count: (p.comments_count || 0) + 1 }
          : p
      )
    );

    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: promptId,
          author_uid: user.uid,
          author_name: user.displayName || 'مستخدم',
          author_avatar: user.photoURL || null,
          content: text,
        }),
      });

      if (!res.ok) throw new Error();
      const { data } = await res.json();
      if (data) {
        setCommentsMap((prev) => ({
          ...prev,
          [promptId]: (prev[promptId] || []).map((c) =>
            c.id === optimisticComment.id ? data : c
          ),
        }));
      }
      toast.success('تم نشر التعليق 💬');
    } catch {
      toast.error('فشل إرسال التعليق');
      setCommentsMap((prev) => ({
        ...prev,
        [promptId]: (prev[promptId] || []).filter((c) => c.id !== optimisticComment.id),
      }));
    }
  };

  // ─── Delete Comment ───────────────────────────────────────
  const handleDeleteComment = async (commentId: string, promptId: string) => {
    if (!user || !confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      await fetch(
        `/api/community/comments?id=${commentId}&prompt_id=${promptId}&author_uid=${user.uid}`,
        { method: 'DELETE' }
      );
      setCommentsMap((prev) => ({
        ...prev,
        [promptId]: (prev[promptId] || []).filter((c) => c.id !== commentId),
      }));
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId
            ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) - 1) }
            : p
        )
      );
      toast.success('تم حذف التعليق');
    } catch {
      toast.error('حدث خطأ أثناء حذف التعليق');
    }
  };

  // ─── Delete Post ──────────────────────────────────────────
  const handleDeletePost = async (promptId: string) => {
    if (!user || !confirm('هل تريد بالتأكيد حذف هذا المنشور؟')) return;
    try {
      const res = await fetch(
        `/api/community/prompts?id=${promptId}&author_uid=${user.uid}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== promptId));
        toast.success('تم حذف المنشور بنجاح');
      } else {
        toast.error('تعذر حذف المنشور');
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  // ─── Share Post ───────────────────────────────────────────
  const handleShare = async (promptId: string) => {
    const url = `${window.location.origin}/community#post-${promptId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط المنشور! 🔗');
    } catch {
      toast.error('تعذر نسخ الرابط');
    }
  };

  // ─── Publish Post (Unified, Supports Direct Polls without Bundle) ─────
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً للمشاركة');
      return;
    }

    const isPollMode = composerType === 'poll' || (showPollBuilder && composerPoll);

    // If it's a poll, validate poll options
    if (isPollMode) {
      const validOptions = (composerPoll?.options || []).filter((opt) => opt.text.trim());
      if (validOptions.length < 2) {
        toast.error('يرجى كتابة خيارين على الأقل للتصويت');
        return;
      }
    } else {
      // Normal post requires content
      if (!composerContent.trim() && !composerTitle.trim()) {
        toast.error('يرجى كتابة محتوى المنشور');
        return;
      }
    }

    // Stack validation applies ONLY if composerType is strictly 'stack'
    if (composerType === 'stack') {
      if (composerStackTools.length < 2) {
        toast.error('يرجى اختيار أداتين على الأقل لتكوين حزمة الأدوات');
        return;
      }
    }

    try {
      setIsPublishing(true);

      const finalMentionedTools = Array.from(
        new Set([
          ...extractMentionedToolSlugs(composerContent),
          ...composerMentionedTools,
        ])
      );

      const stackSlugs = (composerStackTools || []).map((st) => st.tool_id);
      const allMentionedSlugs = Array.from(new Set([...finalMentionedTools, ...stackSlugs]));

      const effectiveText = composerContent.trim() || composerPoll?.question || composerTitle.trim() || 'استطلاع رأي';

      const payload = {
        post_type: composerType,
        title: composerTitle.trim() || (isPollMode ? composerPoll?.question || '' : ''),
        prompt_text: effectiveText,
        description: effectiveText,
        code_snippet: composerType === 'code' ? composerCode.trim() : null,
        code_language: composerType === 'code' ? composerLanguage : null,
        tag_slugs: composerSelectedTags,
        mentioned_tools: allMentionedSlugs,
        stack_tools: composerType === 'stack' && composerStackTools.length >= 2 ? composerStackTools : null,
        poll: isPollMode && composerPoll && composerPoll.options.filter(o => o.text.trim()).length >= 2 ? composerPoll : null,
        author_uid: user.uid,
        author_name: user.displayName || 'مستخدم',
        author_avatar: user.photoURL || null,
      };

      const res = await fetch('/api/community/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'فشل النشر');
      }

      const result = await res.json();
      toast.success(isPollMode ? 'تم نشر التصويت بنجاح! 📊' : 'تم نشر مشاركتك بنجاح! 🚀');

      if (result.prompt) {
        setPrompts((prev) => [result.prompt, ...prev]);
      }

      // Reset form
      setComposerTitle('');
      setComposerContent('');
      setComposerMentionedTools([]);
      setComposerStackTools([]);
      setComposerPoll(null);
      setShowPollBuilder(false);
      setComposerCode('');
      setComposerSelectedTags([]);
      setIsComposerExpanded(false);
      setComposerType('idea');
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء النشر');
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleComposerTag = (slug: string) => {
    setComposerSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  // ─── Filtered Prompts (Multi-Field Search & Type Filter) ─────────────────
  const filteredPrompts = useMemo(() => {
    let list = prompts;

    if (activeType) {
      list = list.filter((p) => {
        if (activeType === 'poll') return p.post_type === 'poll' || !!p.poll;
        if (activeType === 'stack') return p.post_type === 'stack' || (p.stack_tools && p.stack_tools.length > 0);
        return p.post_type === activeType;
      });
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter((p) => {
      const titleMatch = (p.title || '').toLowerCase().includes(q);
      const contentMatch = (p.prompt_text || p.description || '').toLowerCase().includes(q);
      const authorMatch = (p.author_name || '').toLowerCase().includes(q);
      const tagMatch = (p.tags || []).some((t) =>
        (t.label_ar || t.slug).toLowerCase().includes(q)
      );
      return titleMatch || contentMatch || authorMatch || tagMatch;
    });
  }, [prompts, searchQuery, activeType]);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6" dir="rtl">
        
        {/* ─── 1. WORLD-CLASS EDITORIAL COMMUNITY HEADER ─── */}
        <div className="bg-[#f5f5eb] border border-[#d2d2c8] rounded-2xl sm:rounded-[28px] p-4 sm:p-7 relative overflow-hidden shadow-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Brand */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#beff50] border border-[#14140f] animate-pulse" />
                <span className="text-xs font-bold text-[#14140f] uppercase tracking-wider">
                  مجتمع TOLZY المفتوح
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-[#14140f] tracking-tight">
                نقاشات، استطلاعات رأي، وتجارب أدوات الذكاء الاصطناعي
              </h1>
              <p className="text-xs sm:text-sm text-[#6e6e64] leading-relaxed">
                ملتقى المطورين والتقنيين العرب لتبادل الخبرات، إجراء استطلاعات المقارنة، واستعراض حزم الأدوات.
              </p>
            </div>

            {/* Quick Live Search Bar */}
            <div className="w-full md:w-80 relative shrink-0">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a0a096]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في النقاشات، الاستطلاعات، أو الأعضاء..."
                className="w-full pl-8 pr-10 py-2.5 rounded-full bg-[#ffffff] border border-[#d2d2c8] focus:border-[#14140f] text-xs text-[#14140f] placeholder:text-[#a0a096] focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#a0a096] hover:text-[#14140f]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ─── 2. MAIN GRID (FEED & SIDEBAR) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Feed Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            
            {/* ─── NATIVE APP-LIKE POST COMPOSER ─── */}
            <div className="bg-[#ffffff] border border-[#d2d2c8] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 shadow-2xs space-y-3.5">
              
              {/* Type Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {COMPOSER_POST_TYPES.map((t) => {
                  const isSelected = composerType === t.type;
                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => handleTypeSelect(t.type)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 select-none cursor-pointer ${
                        isSelected
                          ? 'bg-[#14140f] text-[#ffffff] shadow-xs'
                          : 'bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f] hover:bg-[#eaeae0]'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Composer Input Area */}
              <div className="relative">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#14140f] text-[#beff50] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0 relative">
                    {/* Optional Title Field */}
                    {isComposerExpanded && (
                      <input
                        type="text"
                        value={composerTitle}
                        onChange={(e) => setComposerTitle(e.target.value)}
                        placeholder={
                          composerType === 'poll'
                            ? 'سؤال الاستطلاع (مثال: أيهما أفضل للبرمجة: Cursor أم Windsurf؟)...'
                            : composerType === 'stack'
                            ? 'عنوان حزمة الأدوات (مثال: حزمتي المتكاملة لتصميم الواجهات)...'
                            : 'عنوان المنشور (اختياري)...'
                        }
                        className="w-full px-3.5 py-2 mb-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] text-xs font-bold text-[#14140f] placeholder:text-[#a0a096] focus:outline-none focus:border-[#14140f]"
                      />
                    )}

                    {/* Main Content Area */}
                    <textarea
                      rows={isComposerExpanded ? (composerType === 'poll' ? 2 : 3) : 1}
                      placeholder={
                        user
                          ? composerType === 'poll'
                            ? 'أضف وصفاً توضيحياً للاستطلاع أو اضغط بالأسفل لضبط الخيارات...'
                            : `ماذا يدور في ذهنك يا ${user.displayName?.split(' ')[0] || ''}؟ (اكتب @ للإشارة لأداة)...`
                          : 'سجّل دخولك لمشاركة منشور أو استطلاع رأي مع المجتمع...'
                      }
                      value={composerContent}
                      onChange={(e) => {
                        setComposerContent(e.target.value);
                        handleMentionChange(
                          e.target.value,
                          e.target.selectionStart || e.target.value.length
                        );
                        if (!isComposerExpanded) setIsComposerExpanded(true);
                      }}
                      onFocus={() => setIsComposerExpanded(true)}
                      onKeyDown={(e) => {
                        if (isMentionOpen && mentionMatches.length > 0) {
                          const intercepted = handleMentionKeyDown(e, mentionMatches.length, () => {
                            const selected = mentionMatches[mentionActiveIndex];
                            if (selected) {
                              const { newText } = insertTool(selected, composerContent);
                              setComposerContent(newText);
                              setComposerMentionedTools((prev) =>
                                Array.from(new Set([...prev, selected.id]))
                              );
                            }
                          });
                          if (intercepted) return;
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] text-xs text-[#14140f] placeholder:text-[#a0a096] focus:outline-none focus:border-[#14140f] resize-none leading-relaxed transition-all"
                    />

                    {/* Floating Tool Mention Dropdown */}
                    <ToolMentionDropdown
                      isOpen={isMentionOpen}
                      searchQuery={mentionQuery}
                      activeIndex={mentionActiveIndex}
                      setActiveIndex={setMentionActiveIndex}
                      onMatchesChange={setMentionMatches}
                      onClose={closeMention}
                      onSelect={(tool) => {
                        const { newText } = insertTool(tool, composerContent);
                        setComposerContent(newText);
                        setComposerMentionedTools((prev) =>
                          Array.from(new Set([...prev, tool.id]))
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Mentioned Tools Chips */}
                {composerMentionedTools.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 mr-12 text-[11px]">
                    <span className="font-bold text-[#6e6e64]">الأدوات المشار إليها:</span>
                    {composerMentionedTools.map((toolId) => (
                      <span
                        key={toolId}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] font-mono text-[10px]"
                      >
                        <span>@{toolId}</span>
                        <button
                          type="button"
                          onClick={() => setComposerMentionedTools((prev) => prev.filter((x) => x !== toolId))}
                          className="hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── DEDICATED BUILDER ACCORDIONS (Poll / Stack / Code) ─── */}
              {isComposerExpanded && (
                <div className="space-y-3 pt-1 border-t border-[#d2d2c8]">
                  
                  {/* 1. POLL BUILDER (Active when type === 'poll' OR toggled) */}
                  {(composerType === 'poll' || showPollBuilder) && (
                    <div className="p-3.5 bg-[#f5f5eb] rounded-2xl border border-[#d2d2c8] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#14140f] flex items-center gap-1.5">
                          <BarChart2 className="w-4 h-4 text-rose-500" />
                          <span>إعداد خيارات الاستطلاع / المقارنة</span>
                        </span>
                        {composerType !== 'poll' && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowPollBuilder(false);
                              setComposerPoll(null);
                            }}
                            className="text-[11px] text-[#6e6e64] hover:text-rose-600"
                          >
                            إلغاء الاستطلاع
                          </button>
                        )}
                      </div>

                      <PollBuilder
                        poll={composerPoll || {
                          question: composerTitle || '',
                          options: [
                            { id: 'opt-1', text: '', votes_count: 0 },
                            { id: 'opt-2', text: '', votes_count: 0 },
                          ],
                          total_votes: 0,
                        }}
                        onChange={setComposerPoll}
                        defaultQuestion={composerTitle || composerContent.slice(0, 60)}
                      />
                    </div>
                  )}

                  {/* 2. TECH STACK BUILDER (Active when type === 'stack') */}
                  {composerType === 'stack' && (
                    <div className="p-3.5 bg-[#f5f5eb] rounded-2xl border border-[#d2d2c8]">
                      <TechStackBuilder
                        stackTools={composerStackTools}
                        onChange={setComposerStackTools}
                      />
                    </div>
                  )}

                  {/* 3. CODE SNIPPET (Active when type === 'code') */}
                  {composerType === 'code' && (
                    <div className="p-3.5 bg-[#f5f5eb] rounded-2xl border border-[#d2d2c8] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#14140f] flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-blue-600" />
                          <span>المقتطف البرمجي</span>
                        </span>
                        <select
                          value={composerLanguage}
                          onChange={(e) => setComposerLanguage(e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[#ffffff] border border-[#d2d2c8] text-xs font-mono text-[#14140f]"
                        >
                          <option value="javascript">JavaScript / TypeScript</option>
                          <option value="python">Python</option>
                          <option value="html">HTML / CSS</option>
                          <option value="sql">SQL</option>
                          <option value="bash">Bash / Shell</option>
                        </select>
                      </div>
                      <textarea
                        rows={4}
                        value={composerCode}
                        onChange={(e) => setComposerCode(e.target.value)}
                        placeholder="// اكتب الكود البرمجي هنا..."
                        className="w-full p-3 rounded-xl bg-[#14140f] font-mono text-xs text-[#beff50] border border-[#14140f] focus:outline-none resize-none text-left"
                        dir="ltr"
                      />
                    </div>
                  )}

                  {/* 4. TAGS PICKER */}
                  {showTagsPicker && tags.length > 0 && (
                    <div className="p-3 bg-[#f5f5eb] rounded-2xl border border-[#d2d2c8] space-y-1.5">
                      <span className="text-[11px] font-bold text-[#6e6e64] block">حدد الوسوم المناسبة للمنشور:</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {tags.map((t) => {
                          const isSelected = composerSelectedTags.includes(t.slug);
                          return (
                            <button
                              key={t.slug}
                              type="button"
                              onClick={() => toggleComposerTag(t.slug)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#14140f] text-[#ffffff]'
                                  : 'bg-[#ffffff] text-[#6e6e64] border border-[#d2d2c8] hover:border-[#14140f]'
                              }`}
                            >
                              #{t.label_ar || t.slug}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2">
                    
                    {/* Secondary Toggles (Tags & Poll if in other modes) */}
                    <div className="flex items-center gap-1.5">
                      {composerType !== 'poll' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!showPollBuilder) {
                              setShowPollBuilder(true);
                              setComposerPoll({
                                question: composerTitle || '',
                                options: [
                                  { id: 'opt-1', text: '', votes_count: 0 },
                                  { id: 'opt-2', text: '', votes_count: 0 },
                                ],
                                total_votes: 0,
                              });
                            } else {
                              setShowPollBuilder(false);
                              setComposerPoll(null);
                            }
                          }}
                          className="p-2 rounded-full hover:bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f] transition-colors"
                          title="إضافة تصويت"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowTagsPicker(!showTagsPicker)}
                        className={`p-2 rounded-full transition-colors ${
                          showTagsPicker || composerSelectedTags.length > 0
                            ? 'bg-[#beff50] text-[#14140f]'
                            : 'hover:bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f]'
                        }`}
                        title="إضافة وسوم"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Publish / Cancel */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsComposerExpanded(false);
                          setShowPollBuilder(false);
                          setShowTagsPicker(false);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#6e6e64] hover:bg-[#f5f5eb] transition-colors"
                      >
                        إلغاء
                      </button>

                      <button
                        type="button"
                        onClick={handlePublishPost}
                        disabled={isPublishing}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isPublishing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري النشر...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 rotate-180" />
                            <span>نشر في المجتمع</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* ─── 3. FEED FILTER TABS & SORT CONTROLS ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Filter Pills (All, Polls, Ideas, Stacks, Code, Prompts) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
                <button
                  type="button"
                  onClick={() => {
                    setActiveType(null);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeType === null
                      ? 'bg-[#14140f] text-[#ffffff] shadow-xs'
                      : 'bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8]'
                  }`}
                >
                  الكل
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveType('poll');
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeType === 'poll'
                      ? 'bg-[#beff50] text-[#14140f] border border-[#14140f] shadow-xs'
                      : 'bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8]'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>استطلاعات وتصويتات</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveType('idea');
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeType === 'idea'
                      ? 'bg-[#14140f] text-[#ffffff] shadow-xs'
                      : 'bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8]'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>نقاشات وأفكار</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveType('stack');
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeType === 'stack'
                      ? 'bg-[#14140f] text-[#ffffff] shadow-xs'
                      : 'bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>حزم الأدوات</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveType('code');
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeType === 'code'
                      ? 'bg-[#14140f] text-[#ffffff] shadow-xs'
                      : 'bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8]'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>أكواد</span>
                </button>
              </div>

              {/* Sort Switcher (Latest / Trending / Top) */}
              <div className="flex items-center gap-1 bg-[#f5f5eb] p-1 rounded-full border border-[#d2d2c8] shrink-0 self-start sm:self-auto">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSort(opt.key);
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      sort === opt.key
                        ? 'bg-[#ffffff] text-[#14140f] font-bold shadow-2xs border border-[#d2d2c8]'
                        : 'text-[#6e6e64] hover:text-[#14140f]'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Active Filters Pill Bar */}
            {(activeTag || activeType) && (
              <div className="flex items-center gap-2 pt-1 text-xs text-[#6e6e64]">
                <span>التصفية الحالية:</span>
                {activeType && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#14140f] text-[#ffffff] font-bold text-[11px]">
                    نوع: {COMPOSER_POST_TYPES.find(t => t.type === activeType)?.label || activeType}
                  </span>
                )}
                {activeTag && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#beff50] text-[#14140f] font-bold text-[11px]">
                    وسم: #{activeTag}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTag(null);
                    setActiveType(null);
                  }}
                  className="text-rose-600 hover:underline mr-1 font-bold text-[11px]"
                >
                  إلغاء التصفية
                </button>
              </div>
            )}

            {/* ─── 4. POSTS FEED ─── */}
            <div className="space-y-3.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#f5f5eb] border border-[#d2d2c8] rounded-2xl">
                  <Loader2 className="w-8 h-8 animate-spin text-[#14140f] mb-2" />
                  <span className="text-xs text-[#6e6e64]">جاري تحميل خلاصات مجتمع تولزي...</span>
                </div>
              ) : filteredPrompts.length === 0 ? (
                <div className="text-center py-16 bg-[#f5f5eb] border border-[#d2d2c8] rounded-2xl p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#6e6e64]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#14140f]">لا توجد مشاركات تطابق الفلترة الحالية</h3>
                  <p className="text-xs text-[#6e6e64] max-w-xs mx-auto">
                    كن أول من يشارك فكرة، استطلاع رأي، أو تجربة مع أداة جديدة في المجتمع!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposerExpanded(true);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#14140f] text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء منشور جديد</span>
                  </button>
                </div>
              ) : (
                filteredPrompts.map((prompt, idx) => (
                  <PromptCard
                    key={prompt.id || `prompt-${idx}`}
                    prompt={prompt}
                    userVote={userVotes[prompt.id] || null}
                    isOwner={user?.uid === prompt.author_uid}
                    currentUser={user}
                    onVote={handleVote}
                    onComment={handleToggleComments}
                    onShare={handleShare}
                    onDelete={handleDeletePost}
                    onTagClick={(tag) => setActiveTag(tag)}
                    isCommentsOpen={openCommentsPostId === prompt.id}
                    comments={commentsMap[prompt.id] || []}
                    isLoadingComments={loadingComments.has(prompt.id)}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                  />
                ))
              )}

              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => fetchFeed(page + 1, true)}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-full bg-[#ffffff] hover:bg-[#beff50] border border-[#d2d2c8] hover:border-[#14140f] text-xs font-bold text-[#14140f] transition-all shadow-xs"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'تحميل المزيد من النقاشات'
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ─── SIDEBAR COLUMN (1 Col) ─── */}
          <div className="space-y-4">
            
            {/* Trending Tags Widget */}
            <div className="bg-[#f5f5eb] border border-[#d2d2c8] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-[#14140f] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#14140f]" />
                  <span>الوسوم الأكثر تداولاً</span>
                </h3>
                {activeTag && (
                  <button
                    type="button"
                    onClick={() => setActiveTag(null)}
                    className="text-[11px] font-bold text-[#6e6e64] hover:text-[#14140f]"
                  >
                    عرض الكل
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {trendingTags.length === 0 ? (
                  <span className="text-xs text-[#a0a096]">لا توجد وسوم مسجلة بعد</span>
                ) : (
                  trendingTags.map((tag, idx) => (
                    <button
                      key={tag.slug || tag.id || `tag-${idx}`}
                      type="button"
                      onClick={() => setActiveTag(activeTag === tag.slug ? null : tag.slug)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                        activeTag === tag.slug
                          ? 'bg-[#14140f] text-[#ffffff] font-bold'
                          : 'bg-[#ffffff] text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f]'
                      }`}
                    >
                      <span>#{tag.label_ar || tag.slug}</span>
                      <span className="text-[10px] text-[#a0a096]">({tag.count})</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Top Contributors Widget */}
            <div className="bg-[#f5f5eb] border border-[#d2d2c8] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-[#14140f] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#14140f]" />
                <span>أبرز المساهمين في المجتمع</span>
              </h3>

              <div className="space-y-2">
                {topCreators.length === 0 ? (
                  <span className="text-xs text-[#a0a096]">لا يوجد مساهمون بعد</span>
                ) : (
                  topCreators.map((creator, idx) => (
                    <Link
                      key={creator.uid || creator.username || creator.name || `creator-${idx}`}
                      href={`/community/user/${encodeURIComponent(creator.username || creator.uid || creator.name || 'user')}`}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#ffffff] transition-colors group border border-transparent hover:border-[#d2d2c8]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#14140f] text-[#beff50] font-bold text-xs flex items-center justify-center shrink-0">
                          {creator.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#14140f] group-hover:text-blue-600 transition-colors truncate">
                            {creator.name}
                          </p>
                          <p className="text-[10px] text-[#6e6e64] font-mono">
                            {creator.prompts} مشاركة • {creator.upvotes} تأييد
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Community Charter */}
            <div className="bg-[#ffffff] border border-[#d2d2c8] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 space-y-2 text-right">
              <h4 className="text-xs font-bold text-[#14140f] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ميثاق مجتمع تولزي</span>
              </h4>
              <p className="text-[11px] text-[#6e6e64] leading-relaxed">
                مجتمع تقني مفتوح لمشاركة المعرفة بأسلوب راقٍ، واختبار الأدوات الحقيقية بعيداً عن الترويج الزائف أو الإعلانات المضللة.
              </p>
            </div>

          </div>

        </div>

      </div>
    </PageLayout>
  );
};

export default CommunityPromptPage;

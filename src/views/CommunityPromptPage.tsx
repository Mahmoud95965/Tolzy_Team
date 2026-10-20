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
  Plus,
  Users,
  MessageSquare,
  Search,
  X,
  Code,
  Send,
  Zap,
  Globe,
  Tag,
  Check,
  ChevronDown,
  Layers,
  HelpCircle,
  Lightbulb,
  FileText,
  BarChart2,
  Share2
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
import { POST_TYPE_CONFIG } from '../types/community';

const SORT_OPTIONS: { key: FeedSortMode; label: string; icon: React.ReactNode }[] = [
  { key: 'latest', label: 'الأحدث', icon: <Clock className="w-3.5 h-3.5" /> },
  { key: 'trending', label: 'الأكثر رواجاً', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: 'top', label: 'الأعلى تقييماً', icon: <ArrowUp className="w-3.5 h-3.5" /> },
];

const POST_TYPES: { type: PostType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'idea', label: 'فكرة / نقاش', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'text-amber-500' },
  { type: 'stack', label: 'حزمة أدوات', icon: <Layers className="w-3.5 h-3.5" />, color: 'text-indigo-500' },
  { type: 'prompt', label: 'برومبت ذكي', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-purple-500' },
  { type: 'code', label: 'كود تقني', icon: <Code className="w-3.5 h-3.5" />, color: 'text-blue-500' },
  { type: 'question', label: 'سؤال واستفسار', icon: <HelpCircle className="w-3.5 h-3.5" />, color: 'text-rose-500' },
  { type: 'resource', label: 'أداة أو مصدر', icon: <Globe className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
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
  const [composerCode, setComposerCode] = useState('');
  const [composerLanguage, setComposerLanguage] = useState('javascript');
  const [composerSelectedTags, setComposerSelectedTags] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const { tools: availableTools } = useTools();
  const [mentionMatches, setMentionMatches] = useState<Tool[]>([]);

  // Tool Mention state
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

  // ─── Add Comment (Optimistic) ─────────────────────────────
  const handleAddComment = async (promptId: string, text: string) => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
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

  // ─── Create Quick Post ────────────────────────────────────
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً للمشاركة');
      return;
    }

    if (!composerContent.trim()) {
      toast.error('يرجى كتابة محتوى المنشور');
      return;
    }

    try {
      setIsPublishing(true);
      const finalMentionedTools = Array.from(
        new Set([
          ...extractMentionedToolSlugs(composerContent),
          ...composerMentionedTools,
        ])
      );

      if (composerType === 'stack' && composerStackTools.length < 2) {
        toast.error('يرجى اختيار أداتين على الأقل لتكوين حزمة الأدوات');
        return;
      }

      // Also merge stack tool IDs into finalMentionedTools for unified discovery
      const stackSlugs = composerStackTools.map((st) => st.tool_id);
      const allMentionedSlugs = Array.from(new Set([...finalMentionedTools, ...stackSlugs]));

      const payload = {
        post_type: composerType,
        title: composerTitle.trim(),
        prompt_text: composerContent.trim(),
        description: composerContent.trim(),
        code_snippet: composerType === 'code' ? composerCode.trim() : null,
        code_language: composerType === 'code' ? composerLanguage : null,
        tag_slugs: composerSelectedTags,
        mentioned_tools: allMentionedSlugs,
        stack_tools: composerType === 'stack' || composerStackTools.length > 0 ? composerStackTools : null,
        poll: showPollBuilder && composerPoll && composerPoll.options.length >= 2 ? composerPoll : null,
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
      toast.success('تم نشر مشاركتك بنجاح! 🚀');

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

  // ─── Filtered Prompts (Multi-Field Search) ─────────────────
  const filteredPrompts = useMemo(() => {
    if (!searchQuery.trim()) return prompts;
    const q = searchQuery.trim().toLowerCase();
    return prompts.filter((p) => {
      const titleMatch = (p.title || '').toLowerCase().includes(q);
      const contentMatch = (p.prompt_text || p.description || '').toLowerCase().includes(q);
      const authorMatch = (p.author_name || '').toLowerCase().includes(q);
      const tagMatch = (p.tags || []).some((t) =>
        (t.label_ar || t.slug).toLowerCase().includes(q)
      );
      return titleMatch || contentMatch || authorMatch || tagMatch;
    });
  }, [prompts, searchQuery]);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6" dir="rtl">
        
        {/* ─── Hero Section: Community Header ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مجتمع TOLZY التقني العربي</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                شارك أفكارك، برومبتاتك، وخبراتك البرمجية
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                ملتقى المطورين، صناع المحتوى، ومهندسي الذكاء الاصطناعي للنقاش المباشر وتبادل الأدوات والتجارب.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="w-full md:w-72 relative">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المنشورات، الأكواد، أو المبدعين..."
                className="w-full pl-8 pr-10 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-transparent focus:border-blue-500 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Grid: Feed & Sidebar ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Feed Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* ─── Quick Post Composer ─── */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="relative">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 relative">
                    {isComposerExpanded ? (
                      <textarea
                        rows={3}
                        placeholder={
                          user
                            ? `ماذا يدور في ذهنك يا ${user.displayName?.split(' ')[0] || ''}؟ اكتب فكرة، أو شارك تجربة مع أداة (اكتب @ للإشارة لأداة)...`
                            : 'سجّل دخولك لمشاركة منشور أو فكرة مع المجتمع...'
                        }
                        value={composerContent}
                        onChange={(e) => {
                          setComposerContent(e.target.value);
                          handleMentionChange(
                            e.target.value,
                            e.target.selectionStart || e.target.value.length
                          );
                        }}
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
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={
                          user
                            ? `ماذا يدور في ذهنك يا ${user.displayName?.split(' ')[0] || ''}؟ شارك تجربة أو أداة (اكتب @ للإشارة)...`
                            : 'سجّل دخولك لمشاركة منشور أو فكرة مع المجتمع...'
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
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}

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

                {/* Mentioned tools preview chips in composer */}
                {composerMentionedTools.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 mr-12 text-[11px]">
                    <span className="font-bold text-neutral-400">الأدوات المشار إليها:</span>
                    {composerMentionedTools.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 font-bold"
                      >
                        <span>@{id}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setComposerMentionedTools((prev) => prev.filter((x) => x !== id))
                          }
                          className="hover:text-rose-500 transition-colors p-0.5"
                          title="إزالة الإشارة"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Expanded Composer Options */}
              {isComposerExpanded && (
                <form onSubmit={handlePublishPost} className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-150">
                  
                  {/* Type Picker Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-neutral-400 ml-1">نوع المشاركة:</span>
                    {POST_TYPES.map((t) => (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setComposerType(t.type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          composerType === t.type
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Title (Optional) */}
                  <input
                    type="text"
                    value={composerTitle}
                    onChange={(e) => setComposerTitle(e.target.value)}
                    placeholder={
                      composerType === 'stack'
                        ? 'عنوان الحزمة (مثال: حزمتي المفضلة لصناعة المحتوى البرمجي)...'
                        : 'عنوان المنشور (اختياري - يفضل للأفكار والمقالات)...'
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Tech Stack Builder (when type === 'stack') */}
                  {composerType === 'stack' && (
                    <TechStackBuilder
                      stackTools={composerStackTools}
                      onChange={setComposerStackTools}
                    />
                  )}

                  {/* Code snippet field (if type === 'code') */}
                  {composerType === 'code' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-neutral-500">مقتطف الكود البرمجي:</label>
                        <select
                          value={composerLanguage}
                          onChange={(e) => setComposerLanguage(e.target.value)}
                          className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono border-none focus:outline-none"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="python">Python</option>
                          <option value="html">HTML/CSS</option>
                          <option value="sql">SQL</option>
                          <option value="bash">Bash/Shell</option>
                        </select>
                      </div>
                      <textarea
                        rows={4}
                        value={composerCode}
                        onChange={(e) => setComposerCode(e.target.value)}
                        placeholder="// اكتب الكود أو مقتطف البرمجة هنا..."
                        className="w-full p-3 rounded-xl bg-neutral-950 font-mono text-xs text-neutral-100 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                        dir="ltr"
                      />
                    </div>
                  )}

                  {/* Tags Selection */}
                  {tags.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-neutral-400 block">اختر وسوماً ذات صلة:</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {tags.slice(0, 10).map((t, idx) => {
                          const tagKey = t.slug || t.id || `tag-${idx}`;
                          const isSelected = composerSelectedTags.includes(t.slug);
                          return (
                            <button
                              key={tagKey}
                              type="button"
                              onClick={() => toggleComposerTag(t.slug)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                              }`}
                            >
                              #{t.label_ar || t.slug}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Poll Toggle & Builder */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (!showPollBuilder) {
                            setComposerPoll({
                              question: composerTitle || '',
                              options: [
                                { id: `opt-1`, text: '', votes_count: 0 },
                                { id: `opt-2`, text: '', votes_count: 0 },
                              ],
                              total_votes: 0,
                            });
                            setShowPollBuilder(true);
                          } else {
                            setShowPollBuilder(false);
                            setComposerPoll(null);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          showPollBuilder
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>{showPollBuilder ? 'إلغاء التصويت' : 'إضافة تصويت / مقارنة (Poll)'}</span>
                      </button>
                    </div>

                    {showPollBuilder && composerPoll && (
                      <PollBuilder
                        poll={composerPoll}
                        onChange={setComposerPoll}
                        defaultQuestion={composerTitle || composerContent.slice(0, 50)}
                      />
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsComposerExpanded(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isPublishing || !composerContent.trim()}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري النشر...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 rotate-180" />
                          <span>نشر للمجتمع</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ─── Sort & Category Filter Bar ─── */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none text-xs">
              <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded-2xl shadow-sm">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSort(opt.key);
                      setPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                      sort === opt.key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Active Filter Clear Tag */}
              {(activeTag || activeType) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTag(null);
                    setActiveType(null);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:underline shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>إلغاء التصفية</span>
                </button>
              )}
            </div>

            {/* ─── Posts List ─── */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-2" />
                  <span className="text-xs text-neutral-400">جاري تحميل منشورات المجتمع...</span>
                </div>
              ) : filteredPrompts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-2">
                  <Sparkles className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    لا توجد مشاركات تطابق بحثك حالياً
                  </p>
                  <p className="text-xs text-neutral-400">
                    كن أول من يشارك فكرة، برومبت، أو كود مع المجتمع!
                  </p>
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
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => fetchFeed(page + 1, true)}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 text-xs font-bold text-blue-600 dark:text-blue-400 transition-all shadow-sm"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'تحميل المزيد من المشاركات'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar Column (1 Col) ─── */}
          <div className="space-y-5">
            
            {/* Trending Tags Widget */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>الوسوم الرائجة</span>
                </h3>
                {activeTag && (
                  <button
                    type="button"
                    onClick={() => setActiveTag(null)}
                    className="text-[11px] font-bold text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    عرض الكل
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {trendingTags.length === 0 ? (
                  <span className="text-xs text-neutral-400">لا توجد وسوم بعد</span>
                ) : (
                  trendingTags.map((tag, idx) => (
                    <button
                      key={tag.slug || tag.id || `trending-${idx}`}
                      type="button"
                      onClick={() => setActiveTag(activeTag === tag.slug ? null : tag.slug)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeTag === tag.slug
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <span>#{tag.label_ar || tag.slug}</span>
                      <span className="text-[10px] opacity-60">({tag.count})</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Top Creators Widget */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>أبرز المساهمين في المجتمع</span>
              </h3>

              <div className="space-y-3">
                {topCreators.length === 0 ? (
                  <span className="text-xs text-neutral-400">لا يوجد مساهمون بعد</span>
                ) : (
                  topCreators.map((creator, idx) => (
                    <Link
                      key={creator.uid || creator.username || creator.name || `creator-${idx}`}
                      href={`/community/user/${encodeURIComponent(creator.username || creator.uid || creator.name || 'user')}`}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {creator.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {creator.name}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {creator.prompts} مشاركة • {creator.upvotes} تفاعل
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Community Rules & Info */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-neutral-900 dark:to-neutral-900 border border-blue-100 dark:border-neutral-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>ميثاق مجتمع Tolzy</span>
              </h4>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                مجتمع مفتوح لتبادل المعرفة باحترام ومشاركة الأكواد والأدوات المفيدة لجميع المهتمين بالتقنية والذكاء الاصطناعي في الوطن العربي.
              </p>
            </div>

          </div>

        </div>

      </div>
    </PageLayout>
  );
};

export default CommunityPromptPage;

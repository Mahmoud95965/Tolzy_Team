'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Sparkles, TrendingUp, Clock, ArrowUp,
  Plus, Users, MessageSquare, Globe, Info,
  Briefcase, GraduationCap, Heart,
  Video, Image as ImageIcon, Award,
  Home, Search, X, ArrowUpRight,
  Send, Trash2, Edit2, Smile
} from 'lucide-react';
import PromptCard from '../components/community/PromptCard';
import CreatorsSection from '../components/community/CreatorsSection';
import CreatePromptModal from '../components/community/CreatePromptModal';
// RemixEditor removed — feature disabled
import type { CommunityPrompt, PromptTag, FeedSortMode, PostType, PromptComment } from '../types/community';
import { POST_TYPE_CONFIG } from '../types/community';
import Link from 'next/link';

const SORT_TABS: { key: FeedSortMode; label: string; icon: React.ReactNode }[] = [
  { key: 'latest', label: 'الأحدث', icon: <Clock size={16} /> },
  { key: 'trending', label: 'رائج', icon: <TrendingUp size={16} /> },
  { key: 'top', label: 'الأفضل', icon: <ArrowUp size={16} /> },
];

const CommunityPromptPage: React.FC = () => {
  const { user } = useAuth();

  // Feed state
  const [prompts, setPrompts] = useState<CommunityPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<FeedSortMode>('latest');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<PostType | null>(null);

  // Tags
  const [tags, setTags] = useState<(PromptTag & { prompts_count?: number })[]>([]);

  // Comments state
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PromptComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  // User interactions
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [userSaves, setUserSaves] = useState<Set<string>>(new Set());

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Header nav
  const [activeSection, setActiveSection] = useState<'posts' | 'creators' | 'about'>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchInitialized, setIsSearchInitialized] = useState(false);
  
  // Mobile Search
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Sidebar
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

  // ─── Fetch Feed ────────────────────────────────────────────
  const fetchFeed = useCallback(async (pageNum: number = 1, append: boolean = false) => {
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

      params.append('_t', Date.now().toString());
      const res = await fetch(`/api/community/feed?${params}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setPrompts(prev => [...prev, ...data.prompts]);
        } else {
          setPrompts(data.prompts || []);
        }
        setHasMore(data.hasMore);
        setPage(pageNum);
        computeSidebarData(append ? [...prompts, ...data.prompts] : data.prompts);
      }
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      toast.error('حدث خطأ أثناء جلب المنشورات');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort, activeTag, activeType]);

  // ─── Fetch User State ─────────────────────────────────────
  const fetchUserState = useCallback(async (promptIds: string[]) => {
    if (!user?.uid || !promptIds.length) return;
    try {
      const params = new URLSearchParams({
        user_uid: user.uid,
        prompt_ids: promptIds.join(','),
      });
      const res = await fetch(`/api/community/user-state?${params}`);
      if (!res.ok) return;

      const { votes, saves } = await res.json();
      setUserVotes(prev => ({ ...prev, ...votes }));
      setUserSaves(prev => {
        const next = new Set(prev);
        (saves || []).forEach((id: string) => next.add(id));
        return next;
      });
    } catch (err) {
      console.error('Failed to fetch user state:', err);
    }
  }, [user?.uid]);


  const computeSidebarData = (allPrompts: CommunityPrompt[]) => {
    const tagCount: Record<string, { tag: PromptTag; count: number }> = {};
    allPrompts.forEach(p => {
      (p.tags || []).forEach(t => {
        if (!tagCount[t.slug]) tagCount[t.slug] = { tag: t, count: 0 };
        tagCount[t.slug].count++;
      });
    });
    setTrendingTags(
      Object.values(tagCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map(item => ({ ...item.tag, count: item.count }))
    );

    const creators: Record<string, { name: string; avatar: string | null; uid: string; prompts: number; upvotes: number }> = {};
    allPrompts.forEach(p => {
      if (!creators[p.author_uid]) {
        creators[p.author_uid] = { name: p.author_name, avatar: p.author_avatar, uid: p.author_uid, prompts: 0, upvotes: 0 };
      }
      creators[p.author_uid].prompts++;
      creators[p.author_uid].upvotes += p.upvotes_count || 0;
    });
    setTopCreators(Object.values(creators).sort((a, b) => b.upvotes - a.upvotes).slice(0, 5));
  };

  // ─── Effects ───────────────────────────────────────────────
  useEffect(() => { fetchTags(); }, [fetchTags]);
  useEffect(() => { fetchFeed(1); }, [fetchFeed]);
  useEffect(() => {
    if (prompts.length > 0) {
      fetchUserState(prompts.map(p => p.id));
    }
  }, [prompts.length, fetchUserState]);

  // Load saved search query + recent searches on mount / user change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchKey   = user?.uid ? `lastSearch_${user.uid}`   : 'lastSearch_guest';
      const recentsKey  = user?.uid ? `recentSearches_${user.uid}` : 'recentSearches_guest';
      const savedQuery   = localStorage.getItem(searchKey);
      const savedRecents = localStorage.getItem(recentsKey);
      if (savedQuery)   setSearchQuery(savedQuery);
      if (savedRecents) {
        try { setRecentSearches(JSON.parse(savedRecents)); } catch {}
      }
      setIsSearchInitialized(true);
    }
  }, [user?.uid]);

  // Persist search query on every change
  useEffect(() => {
    if (isSearchInitialized && typeof window !== 'undefined') {
      const searchKey = user?.uid ? `lastSearch_${user.uid}` : 'lastSearch_guest';
      localStorage.setItem(searchKey, searchQuery);
    }
  }, [searchQuery, user?.uid, isSearchInitialized]);

  // Helper: push a term to recentSearches (max 8) and persist
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const recentsKey = user?.uid ? `recentSearches_${user.uid}` : 'recentSearches_guest';
    setRecentSearches(prev => {
      const next = [term.trim(), ...prev.filter(t => t !== term.trim())].slice(0, 8);
      localStorage.setItem(recentsKey, JSON.stringify(next));
      return next;
    });
  };

  // Helper: remove a single recent search term
  const removeRecentSearch = (term: string) => {
    const recentsKey = user?.uid ? `recentSearches_${user.uid}` : 'recentSearches_guest';
    setRecentSearches(prev => {
      const next = prev.filter(t => t !== term);
      localStorage.setItem(recentsKey, JSON.stringify(next));
      return next;
    });
  };

  // Helper: clear all recent searches
  const clearRecentSearches = () => {
    const recentsKey = user?.uid ? `recentSearches_${user.uid}` : 'recentSearches_guest';
    setRecentSearches([]);
    localStorage.removeItem(recentsKey);
  };

  // ─── Handlers ──────────────────────────────────────────────
  const handleSortChange = (newSort: FeedSortMode) => {
    setSort(newSort);
    setPage(1);
  };

  const handleTagSelect = (slug: string | null) => {
    setActiveTag(slug);
    setPage(1);
  };

  const handleVote = async (promptId: string, voteType: 'up' | 'down') => {
    if (!user) { toast.error('سجّل دخولك أولاً'); return; }
    const prevVote = userVotes[promptId];
    setUserVotes(prev => {
      const next = { ...prev };
      if (prev[promptId] === voteType) delete next[promptId];
      else next[promptId] = voteType;
      return next;
    });
    setPrompts(prev => prev.map(p => {
      if (p.id !== promptId) return p;
      let up = p.upvotes_count, down = p.downvotes_count;
      if (prevVote === voteType) {
        if (voteType === 'up') up--; else down--;
      } else if (prevVote) {
        if (voteType === 'up') { up++; down--; } else { down++; up--; }
      } else {
        if (voteType === 'up') up++; else down++;
      }
      return { ...p, upvotes_count: Math.max(0, up), downvotes_count: Math.max(0, down) };
    }));

    try {
      const res = await fetch('/api/community/prompts/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id: promptId, user_uid: user.uid, user_name: user.displayName || 'مستخدم', vote_type: voteType }),
      });
      if (res.ok) {
        const { upvotes, downvotes, action } = await res.json();
        setPrompts(prev => prev.map(p =>
          p.id !== promptId ? p : { ...p, upvotes_count: upvotes, downvotes_count: downvotes }
        ));
        setUserVotes(prev => {
          const next = { ...prev };
          if (action === 'removed') delete next[promptId];
          else next[promptId] = voteType;
          return next;
        });
      }
    } catch {
      setUserVotes(prev => {
        const next = { ...prev };
        if (prevVote) next[promptId] = prevVote;
        else delete next[promptId];
        return next;
      });
      setPrompts(prev => prev.map(p =>
        p.id !== promptId ? p : { ...p, upvotes_count: p.upvotes_count, downvotes_count: p.downvotes_count }
      ));
      toast.error('حدث خطأ');
    }
  };

  const handleSave = async (promptId: string) => {
    if (!user) { toast.error('سجّل دخولك أولاً'); return; }
    const wasSaved = userSaves.has(promptId);
    setUserSaves(prev => {
      const next = new Set(prev);
      if (wasSaved) next.delete(promptId); else next.add(promptId);
      return next;
    });
    setPrompts(prev => prev.map(p =>
      p.id === promptId ? { ...p, saves_count: p.saves_count + (wasSaved ? -1 : 1) } : p
    ));
    try {
      await fetch('/api/community/prompts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id: promptId, user_uid: user.uid }),
      });
      toast.success(wasSaved ? 'تم إلغاء الحفظ' : 'تم الحفظ! 🔖');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const handleCreatePrompt = async (data: any) => {
    if (!user) return;
    const res = await fetch('/api/community/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, author_uid: user.uid, author_name: user.displayName || 'مستخدم', author_avatar: user.displayName?.[0] || 'م' }),
    });
    if (res.ok) {
      const result = await res.json();
      toast.success('تم النشر! 🚀');
      if (result.prompt) {
        setPrompts(prev => [result.prompt, ...prev]);
      }
      fetchFeed(1);
    } else {
      toast.error('حدث خطأ أثناء النشر');
    }
  };

  // handleRemix removed — remix feature disabled

  const handleDelete = async (promptId: string) => {
    if (!user || !confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    try {
      const res = await fetch(`/api/community/prompts?id=${promptId}&author_uid=${user.uid}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPrompts(prev => prev.filter(p => p.id !== promptId));
        toast.success('تم الحذف ✅');
      } else {
        const err = await res.json();
        toast.error(err.error || 'حدث خطأ أثناء الحذف');
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleShare = async (promptId: string) => {
    const url = `${window.location.origin}/community?prompt=${promptId}`;
    await navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط! 🔗');
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

  const toggleComments = async (promptId: string) => {
    setActiveCommentsPostId(promptId);

    // Fetch comments if they are not already fetched
    if (!commentsMap[promptId] || commentsMap[promptId].length === 0) {
      setLoadingComments(prev => new Set(prev).add(promptId));
      try {
        const res = await fetch(`/api/community/comments?prompt_id=${promptId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch comments');
        }
        const { data } = await res.json();

        if (data) {
          setCommentsMap(prev => ({ ...prev, [promptId]: data }));
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        toast.error('حدث خطأ أثناء جلب التعليقات');
      } finally {
        setLoadingComments(prev => { const n = new Set(prev); n.delete(promptId); return n; });
      }
    }
  };

  const handleAddComment = async (promptId: string) => {
    if (!user) { toast.error('سجّل دخولك أولاً'); return; }
    const text = commentInputs[promptId]?.trim();
    if (!text) return;

    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: promptId,
          author_uid: user.uid,
          author_name: user.displayName || 'مستخدم',
          author_avatar: user.photoURL || null,
          content: text
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add comment');
      }

      const { data } = await res.json();

      if (data) {
        setCommentsMap(prev => ({ ...prev, [promptId]: [...(prev[promptId] || []), data] }));
        setCommentInputs(prev => ({ ...prev, [promptId]: '' }));
        
        // Update comment count in local client state
        setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
      }
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      toast.error('حدث خطأ أثناء إضافة التعليق');
    }
  };

  const handleDeleteComment = async (commentId: string, promptId: string) => {
    if (!user) return;
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      const res = await fetch(`/api/community/comments?id=${commentId}&prompt_id=${promptId}&author_uid=${user.uid}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete comment');
      }
      
      toast.success('تم حذف التعليق');
      setCommentsMap(prev => ({
        ...prev,
        [promptId]: (prev[promptId] || []).filter(c => c.id !== commentId)
      }));
      
      setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) - 1) } : p));
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      toast.error('حدث خطأ أثناء حذف التعليق');
    }
  };

  const startEditingComment = (comment: PromptComment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleSaveCommentEdit = async (commentId: string, promptId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/community/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: commentId,
          author_uid: user.uid,
          content: editCommentContent.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to edit comment');
      }

      toast.success('تم تعديل التعليق');
      setCommentsMap(prev => ({
        ...prev,
        [promptId]: (prev[promptId] || []).map(c => c.id === commentId ? { ...c, content: editCommentContent.trim() } : c)
      }));
      setEditingCommentId(null);
    } catch (err: any) {
      console.error('Failed to save comment edit:', err);
      toast.error('حدث خطأ أثناء تعديل التعليق');
    }
  };

  const handleComment = (promptId: string) => {
    toggleComments(promptId);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) fetchFeed(page + 1, true);
  };

  const avatarColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600'];
  const getAvatarColor = (name: string) => avatarColors[(name || '').charCodeAt(0) % avatarColors.length];

  const formatCount = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(num);
  };

  // Filter prompts by search query (matching the main title field)
  const filteredPrompts = searchQuery.trim()
    ? prompts.filter(p => (p.title || '').toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : prompts;

  return (
    <PageLayout hideNavbar hideFooter navbarOffset={false}>
      <main className="min-h-screen bg-[#f0f2f5] dark:bg-[#050505] font-sans selection:bg-[#0866ff]/20" dir="rtl">

        {/* ─── Premium Glassmorphism Header ─── */}
        <div className="bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 sticky top-0 z-40 transition-all">
          <div className="max-w-[1250px] mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <Link href="/community" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                T
              </div>
              <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight hidden lg:block">
                Tolzy <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">Community</span>
              </span>
            </Link>

            {/* Center Nav Icons */}
            <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-white/[0.03] rounded-full p-1 border border-slate-200/50 dark:border-white/5">
              <button
                onClick={() => setActiveSection('posts')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeSection === 'posts'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Home size={18} />
                <span className="hidden sm:inline">المنشورات</span>
              </button>
              <button
                onClick={() => setActiveSection('creators')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeSection === 'creators'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Users size={18} />
                <span className="hidden sm:inline">المبدعون</span>
              </button>
              <button
                onClick={() => setActiveSection('about')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeSection === 'about'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Info size={18} />
                <span className="hidden sm:inline">عن المجتمع</span>
              </button>
            </div>

            {/* Search Bar - Desktop */}
            <div className="relative hidden sm:block flex-1 sm:w-64 sm:max-w-none group">
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) saveRecentSearch(searchQuery); }}
                placeholder="ابحث في المجتمع..."
                className="w-full bg-slate-100/70 dark:bg-white/[0.05] text-slate-900 dark:text-white text-sm font-medium pr-10 pl-8 py-2 sm:py-2.5 rounded-full border border-slate-200/50 dark:border-white/5 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-[#0a0a0a] transition-all placeholder:text-slate-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                  title="مسح البحث"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Search Icon - Mobile */}
            <button 
              onClick={() => setShowMobileSearch(true)}
              className="sm:hidden w-10 h-10 shrink-0 rounded-full bg-slate-100/70 dark:bg-white/[0.05] flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 active:scale-95 transition-transform"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* ─── Posts Section ─── */}
        {activeSection === 'posts' && (
        <div className="w-full md:flex gap-6 px-2 sm:px-4 pb-24 sm:pb-6">

          {/* Main Feed Column */}
          <div className="flex-1 flex flex-col gap-3 sm:gap-4 max-w-[700px] mx-auto w-full">
            
            {/* Create Post Card */}
            {user && (
              <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm p-4 border border-slate-200/60 dark:border-white/[0.05]">
                <div className="flex gap-3 mb-4">
                  <Link href="/profile" className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${getAvatarColor(user.displayName || 'م')} cursor-pointer hover:opacity-90`}>
                    {user.displayName?.[0] || 'م'}
                  </Link>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors rounded-full px-5 text-right text-slate-500 dark:text-slate-400 text-sm font-medium"
                  >
                    ماذا يدور في ذهنك يا {user.displayName?.split(' ')[0]}؟
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-white/[0.05] pt-2 flex justify-between">
                  <button onClick={() => setShowCreateModal(true)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300 font-bold text-xs">
                    <Video size={18} className="text-[#F02849]" /> فيديو مباشر
                  </button>
                  <button onClick={() => setShowCreateModal(true)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300 font-bold text-xs">
                    <ImageIcon size={18} className="text-[#45BD62]" /> صور/فيديو
                  </button>
                  <button onClick={() => setShowCreateModal(true)} className="flex-1 hidden sm:flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300 font-bold text-xs">
                    <Award size={18} className="text-[#F7B928]" /> مناسبة هامة
                  </button>
                </div>
              </div>
            )}

            {/* Feed Filters & Sorting */}
            <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm p-3 border border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1">
                {SORT_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => handleSortChange(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      sort === tab.key
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-[#0866ff]'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
              <div className="flex items-center gap-2">
                {(Object.entries(POST_TYPE_CONFIG) as [PostType, any][]).map(([type, config]) => (
                  <button 
                    key={type} 
                    onClick={() => setActiveType(activeType === type ? null : type)}
                    className={`shrink-0 p-2 rounded-lg transition-all ${
                      activeType === type ? 'bg-slate-100 dark:bg-white/10 scale-110' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                    title={config.label}
                  >
                    {config.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20 bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-slate-200/60 dark:border-white/[0.05]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0866ff]" />
                </div>
              ) : prompts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-slate-200/60 dark:border-white/[0.05]">
                  <Sparkles size={48} className="mx-auto text-blue-300 mb-4" />
                  <p className="text-slate-500 font-black text-lg">لا توجد منشورات بعد</p>
                  <p className="text-slate-400 text-sm mt-1">كن أول من يشارك مع المجتمع!</p>
                </div>
              ) : filteredPrompts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-slate-200/60 dark:border-white/[0.05] animate-in fade-in duration-300">
                  <Sparkles size={48} className="mx-auto text-[#0866ff] mb-4 opacity-75 animate-pulse" />
                  <p className="text-slate-700 dark:text-slate-350 font-black text-lg">جرب التصفح افضل لك</p>
                  <p className="text-slate-400 text-sm mt-1.5">لم نجد أي منشورات تطابق العنوان: "{searchQuery}"</p>
                </div>
              ) : (
                filteredPrompts.map(prompt => (
                  <div key={prompt.id} className="space-y-3">
                    <PromptCard
                      prompt={prompt}
                      userVote={userVotes[prompt.id] || null}
                      isOwner={user?.uid === prompt.author_uid}
                      onVote={handleVote}
                      onComment={handleComment}
                      onShare={handleShare}
                      onDelete={handleDelete}
                    />
                  </div>
                ))
              )}

              {/* Load more */}
              {hasMore && !loading && (
                <div className="text-center pt-4 mb-20">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-10 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.05] rounded-xl text-sm font-black text-[#0866ff] shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    {loadingMore ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'تحميل المزيد من المنشورات'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Left Column: Sidebar (hidden on smaller screens) */}
          <div className="hidden lg:flex flex-col gap-4 w-[360px] shrink-0 pl-6 pr-4">
            {/* Intro Card */}
            <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm p-4 border border-slate-200/60 dark:border-white/[0.05]">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">المقدمة</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed font-medium">
                مرحباً بك في قلب مجتمع تولزي. المكان الذي يجتمع فيه العباقرة لمشاركة البرومبتات والأكواد والأفكار المبتكرة. 🚀✨
              </p>
              
              <div className="space-y-4 mb-4">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Briefcase size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">دعم المطورين وصناع المحتوى العرب</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <GraduationCap size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">تعلم هندسة المطالبات (Prompt Engineering)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Globe size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">متاح للجميع في الوطن العربي</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Heart size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">يدار بحب من فريق Tolzy</span>
                </div>
              </div>
              <button className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-sm py-2 rounded-lg transition-colors">
                عرض المزيد
              </button>
            </div>

            {/* Trending Tags (Integrated from TrendingSidebar) */}
            <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm p-4 border border-slate-200/60 dark:border-white/[0.05]">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">التصنيفات الرائجة</h2>
                  <Link href="#" className="text-[#0866ff] text-xs font-bold hover:underline">الكل</Link>
               </div>
               <div className="flex flex-wrap gap-2">
                 {trendingTags.map(tag => (
                   <button 
                    key={tag.slug} 
                    onClick={() => handleTagSelect(tag.slug)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5 hover:border-[#0866ff]/30 transition-all group"
                   >
                     <span className="text-sm">{tag.icon}</span>
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#0866ff]">{tag.label_ar}</span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Top Creators (Integrated) */}
            <div className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm p-4 border border-slate-200/60 dark:border-white/[0.05]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">أبرز المبدعين</h2>
                <Link href="#" className="text-[#0866ff] text-xs font-bold hover:underline">عرض الكل</Link>
              </div>
              <div className="space-y-4">
                {topCreators.map((creator, idx) => (
                  <div key={creator.uid || `creator-${idx}`} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Link href={`/profile?uid=${creator.uid}`} className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(creator.name)} cursor-pointer hover:opacity-90`}>
                        {creator.avatar ? <img src={creator.avatar} className="w-full h-full rounded-full object-cover" /> : creator.name?.[0]}
                      </Link>
                      <div>
                        <Link href={`/profile?uid=${creator.uid}`}><h4 className="text-sm font-bold text-slate-900 dark:text-white hover:underline cursor-pointer">{creator.name}</h4></Link>
                        <p className="text-[11px] text-slate-500 font-medium">{creator.prompts} منشور • {creator.upvotes} تصويت</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-[#0866ff] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-all">
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer links */}
            <div className="px-4 py-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
              <Link href="#" className="hover:underline">خصوصية</Link>
              <Link href="#" className="hover:underline">شروط</Link>
              <Link href="#" className="hover:underline">ملفات تعريف الارتباط</Link>
              <Link href="#" className="hover:underline">المزيد</Link>
              <span>Tolzy © {new Date().getFullYear()}</span>
            </div>
          </div>

        </div>
        )}

        {/* ─── Creators Section ─── */}
        {activeSection === 'creators' && (
          <CreatorsSection onBack={() => setActiveSection('posts')} />
        )}

        {/* ─── About Section ─── */}
        {activeSection === 'about' && (
          <div className="max-w-[700px] mx-auto w-full px-4" dir="rtl">
            <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">عن مجتمع Tolzy</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                مرحباً بك في قلب مجتمع تولزي. المكان الذي يجتمع فيه العباقرة لمشاركة البرومبتات والأكواد والأفكار المبتكرة.
              </p>
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Briefcase size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">دعم المطورين وصناع المحتوى العرب</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <GraduationCap size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">تعلم هندسة المطالبات (Prompt Engineering)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Globe size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">متاح للجميع في الوطن العربي</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Heart size={20} className="text-slate-400" />
                  <span className="text-sm font-medium">يدار بحب من فريق Tolzy</span>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* ─── Mobile Search Modal ─── */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-white dark:bg-[#050505] flex flex-col sm:hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md">
                <div className="relative flex-1">
                  <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        saveRecentSearch(searchQuery);
                        setShowMobileSearch(false);
                      }
                    }}
                    placeholder="ابحث في المجتمع..."
                    className="w-full bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white text-sm font-bold pr-10 pl-8 py-3 rounded-xl border-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 transition-all"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Recent Searches */}
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">عمليات البحث الأخيرة</h3>
                  {recentSearches.length > 0 && (
                    <button onClick={clearRecentSearches} className="text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors">
                      مسح الكل
                    </button>
                  )}
                </div>
                {recentSearches.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">لا توجد عمليات بحث سابقة</p>
                ) : (
                  <div className="space-y-1">
                    {recentSearches.map((term, i) => (
                      <div key={i} className="flex items-center gap-1 group/item">
                        <button 
                          onClick={() => {
                            setSearchQuery(term);
                            saveRecentSearch(term);
                            setShowMobileSearch(false);
                          }}
                          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-right active:scale-95"
                        >
                          <Search size={14} className="text-slate-400 shrink-0" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1">{term}</span>
                          <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600" />
                        </button>
                        <button
                          onClick={() => removeRecentSearch(term)}
                          className="shrink-0 p-1.5 rounded-full text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover/item:opacity-100"
                          title="حذف"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <CreatePromptModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePrompt}
          tags={tags}
        />

        {/* Comments Modal (Desktop & Mobile responsive) */}
        <AnimatePresence>
          {activeCommentsPostId && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setActiveCommentsPostId(null)} 
              />
              
              {/* Modal Container */}
              <div className="relative bg-white dark:bg-[#18191a] w-full sm:max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-white/5">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#242526] z-10 shrink-0">
                  <button 
                    onClick={() => setActiveCommentsPostId(null)}
                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    منشور {prompts.find(p => p.id === activeCommentsPostId)?.author_name}
                  </h3>
                  <div className="w-8" /> {/* Spacer */}
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Show Post Card ONLY on Desktop (hidden on Mobile) */}
                  <div className="hidden sm:block pointer-events-auto">
                    {(() => {
                      const activePrompt = prompts.find(p => p.id === activeCommentsPostId);
                      if (!activePrompt) return null;
                      return (
                        <PromptCard
                          prompt={activePrompt}
                          userVote={userVotes[activePrompt.id] || null}
                          isOwner={user?.uid === activePrompt.author_uid}
                          onVote={handleVote}
                          onComment={() => {}}
                          onShare={handleShare}
                          onDelete={(id) => {
                            handleDelete(id);
                            setActiveCommentsPostId(null);
                          }}
                        />
                      );
                    })()}
                  </div>

                  {/* Comments Title / Count */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">التعليقات</span>
                    <span className="bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                      {prompts.find(p => p.id === activeCommentsPostId)?.comments_count || 0}
                    </span>
                  </div>

                  {/* Comments List */}
                  {loadingComments.has(activeCommentsPostId) ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500 shrink-0" />
                    </div>
                  ) : (
                    <>
                      {(commentsMap[activeCommentsPostId] || []).length === 0 && (
                        <div className="text-center py-12 flex flex-col items-center gap-2 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-slate-200/60 dark:border-white/5 animate-in fade-in duration-300">
                          <MessageSquare size={24} className="text-slate-350 dark:text-slate-600 animate-pulse shrink-0" />
                          <p className="text-slate-400 dark:text-slate-550 text-xs font-bold">لا توجد تعليقات بعد. كن أول من يشارك برأيه!</p>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {(commentsMap[activeCommentsPostId] || []).map(c => {
                          const isPostAuthor = c.author_uid === prompts.find(p => p.id === activeCommentsPostId)?.author_uid;
                          return (
                            <div key={c.id} className="flex items-start gap-2.5 group/comment animate-in fade-in slide-in-from-top-1 duration-300">
                              {/* Avatar (RTL: right side) */}
                              <div className={`w-8 h-8 rounded-full ${getAvatarColor(c.author_name)} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm`}>
                                {c.author_name[0]}
                              </div>
                              
                              {/* Content & Actions */}
                              <div className="flex-1 flex flex-col items-start">
                                {/* Comment Bubble */}
                                <div className="bg-[#f0f2f5] dark:bg-[#242526] rounded-[18px] px-3.5 py-2 max-w-[90%] sm:max-w-full">
                                  {/* Author Badge for Post Creator */}
                                  {isPostAuthor && (
                                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-blue-650 dark:text-blue-400 font-bold mb-0.5 select-none">
                                      <Edit2 size={8} className="shrink-0" />
                                      <span>كاتب المنشور</span>
                                    </div>
                                  )}
                                  
                                  {/* Display Name & Verification Badge */}
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">{c.author_name}</span>
                                    {isPostAuthor && (
                                      <span className="text-blue-500 text-xs font-bold shrink-0 select-none" title="كاتب المنشور">✓</span>
                                    )}
                                  </div>

                                  {/* Comment Text / Edit Input */}
                                  {editingCommentId === c.id ? (
                                    <div className="mt-1 space-y-2 min-w-[200px] w-full">
                                      <input
                                        type="text"
                                        value={editCommentContent}
                                        onChange={e => setEditCommentContent(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveCommentEdit(c.id, activeCommentsPostId)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                                        autoFocus
                                      />
                                      <div className="flex justify-end gap-3">
                                        <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-bold text-slate-500">إلغاء</button>
                                        <button onClick={() => handleSaveCommentEdit(c.id, activeCommentsPostId)} className="text-[10px] font-black text-indigo-500">حفظ</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-slate-800 dark:text-slate-200 text-[13px] sm:text-[14px] leading-relaxed mt-1 whitespace-pre-wrap font-medium">{c.content}</p>
                                  )}
                                </div>

                                {/* Action Buttons below Bubble */}
                                <div className="flex items-center gap-3 mt-1 px-2 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-bold select-none">
                                  <span className="font-normal text-[9px] sm:text-[10px]">{timeAgo(c.created_at)}</span>
                                  <button className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">أعجبني</button>
                                  <button className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">رد</button>
                                  {user?.uid === c.author_uid && editingCommentId !== c.id && (
                                    <>
                                      <button onClick={() => startEditingComment(c)} className="hover:text-indigo-500 transition-colors">تعديل</button>
                                      <button onClick={() => handleDeleteComment(c.id, activeCommentsPostId)} className="hover:text-red-500 transition-colors text-red-400">حذف</button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer (Input Field) */}
                <div className="p-3 border-t border-slate-150 dark:border-white/5 bg-white dark:bg-[#18191a] shrink-0 sticky bottom-0 z-20 pb-safe">
                  <div className="flex items-start gap-2.5">
                    {/* User Avatar */}
                    <div className={`w-8 h-8 rounded-full shrink-0 ${user ? getAvatarColor(user.displayName || 'م') : 'bg-slate-350'} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                      {user?.displayName?.[0] || 'م'}
                    </div>
                    
                    {/* Input Field Container (Bubble style) */}
                    <div className="flex-1 bg-[#f0f2f5] dark:bg-[#242526] rounded-2xl p-2.5 flex flex-col">
                      {user && (
                        <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 select-none">
                          تعليق باسم {user.displayName}
                        </div>
                      )}
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={commentInputs[activeCommentsPostId] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [activeCommentsPostId]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddComment(activeCommentsPostId)}
                          placeholder="اكتب تعليقاً..."
                          className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 p-0"
                        />
                      </div>
                      
                      {/* Icons bar inside input bubble */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/40 dark:border-white/5">
                        {/* Right side icons */}
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                          <button className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors" title="رمز تعبيري">
                            <Smile size={16} />
                          </button>
                          <button className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors" title="إرفاق صورة">
                            <ImageIcon size={16} />
                          </button>
                          <button className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors select-none" title="GIF">
                            <span className="text-[9px] font-black border border-slate-400 dark:border-slate-500 px-0.5 rounded leading-none">GIF</span>
                          </button>
                        </div>

                        {/* Left side send button */}
                        <button
                          onClick={() => handleAddComment(activeCommentsPostId)}
                          disabled={!commentInputs[activeCommentsPostId]?.trim()}
                          className="text-indigo-500 disabled:text-slate-300 dark:disabled:text-slate-650 transition-all hover:scale-115 active:scale-90"
                        >
                          <Send size={15} className="rtl:-scale-x-100 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </PageLayout>
  );
};

export default CommunityPromptPage;

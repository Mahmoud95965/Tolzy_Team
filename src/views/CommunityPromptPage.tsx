'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Sparkles, TrendingUp, Clock, ArrowUp,
  Plus, Users, MessageSquare, Globe, Info,
  Briefcase, GraduationCap, Heart,
  Video, Image as ImageIcon, Award,
  Home, Search, X, ArrowUpRight
} from 'lucide-react';
import PromptCard from '../components/community/PromptCard';
import CreatorsSection from '../components/community/CreatorsSection';
import CreatePromptModal from '../components/community/CreatePromptModal';
// RemixEditor removed — feature disabled
import type { CommunityPrompt, PromptTag, FeedSortMode, PostType } from '../types/community';
import { POST_TYPE_CONFIG } from '../types/community';
import Link from 'next/link';

const SORT_TABS: { key: FeedSortMode; label: string; icon: React.ReactNode }[] = [
  { key: 'trending', label: 'رائج', icon: <TrendingUp size={16} /> },
  { key: 'latest', label: 'الأحدث', icon: <Clock size={16} /> },
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
  const [sort, setSort] = useState<FeedSortMode>('trending');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<PostType | null>(null);

  // Tags
  const [tags, setTags] = useState<(PromptTag & { prompts_count?: number })[]>([]);

  // User interactions
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [userSaves, setUserSaves] = useState<Set<string>>(new Set());

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Header nav
  const [activeSection, setActiveSection] = useState<'posts' | 'creators' | 'about'>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile Search
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['تصميم واجهات', 'برومبت تسويق', 'مساعد مبرمج', 'تحليل بيانات']);

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

  const handleComment = (promptId: string) => {
    toast('التعليقات قريباً!', { icon: '💬' });
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
              <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight hidden sm:block">
                Tolzy <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">Community</span>
              </span>
            </Link>

            {/* Center Nav Icons — hidden on mobile (replaced by bottom nav) */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100/50 dark:bg-white/[0.03] rounded-full p-1 border border-slate-200/50 dark:border-white/5">
              <button
                onClick={() => setActiveSection('posts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
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
                placeholder="ابحث في المجتمع..."
                className="w-full bg-slate-100/70 dark:bg-white/[0.05] text-slate-900 dark:text-white text-sm font-medium pr-10 pl-4 py-2 sm:py-2.5 rounded-full border border-slate-200/50 dark:border-white/5 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-[#0a0a0a] transition-all placeholder:text-slate-400 shadow-inner"
              />
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
              ) : (
                prompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    userVote={userVotes[prompt.id] || null}
                    isOwner={user?.uid === prompt.author_uid}
                    onVote={handleVote}
                    onComment={handleComment}
                    onShare={handleShare}
                    onDelete={handleDelete}
                  />
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

        {/* ─── Mobile Bottom Navigation ─── */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 flex items-center justify-around py-2.5 px-4 safe-b shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setActiveSection('posts')}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
              activeSection === 'posts' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home size={22} className={activeSection === 'posts' ? 'fill-indigo-100 dark:fill-indigo-500/20' : ''} />
            <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform -translate-y-4 border-4 border-white dark:border-[#050505]"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={() => setActiveSection('creators')}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
              activeSection === 'creators' ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users size={22} className={activeSection === 'creators' ? 'fill-indigo-100 dark:fill-indigo-500/20' : ''} />
            <span className="text-[10px] font-bold">المبدعون</span>
          </button>
        </div>

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
                    placeholder="ابحث في المجتمع..."
                    className="w-full bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white text-sm font-bold pr-10 pl-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                  />
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
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-4 px-2">عمليات البحث الأخيرة</h3>
                <div className="space-y-1">
                  {recentSearches.map((term, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSearchQuery(term);
                        setShowMobileSearch(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-right active:scale-95"
                    >
                      <Search size={14} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1">{term}</span>
                      <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600" />
                    </button>
                  ))}
                </div>
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
      </main>
    </PageLayout>
  );
};

export default CommunityPromptPage;

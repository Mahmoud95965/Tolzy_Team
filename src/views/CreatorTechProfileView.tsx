'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Share2,
  Sparkles,
  Shield,
  Calendar,
  Layers,
  Heart,
  Wrench,
  MessageSquare,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Compass,
  Flame,
  CheckCircle2,
  Box,
  Tag as TagIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';
import PromptCard from '../components/community/PromptCard';
import ToolImage from '../components/common/ToolImage';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { getFallbackToolById } from '../data/fallbackTools';
import type { CommunityPrompt, PromptComment } from '../types/community';
import type { Tool } from '../types/tool';

interface CreatorProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  coverURL?: string | null;
  bio?: string;
  role?: string;
  badge?: string;
  createdAt?: string;
}

interface CreatorTechProfileViewProps {
  identifier: string;
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

export default function CreatorTechProfileView({ identifier }: CreatorTechProfileViewProps) {
  const { user: currentUser } = useAuth();
  const { tools } = useTools();

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPrompt[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'stacks' | 'polls'>('all');

  // Voting & Comments state
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [openCommentsPromptId, setOpenCommentsPromptId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PromptComment[]>>({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // ─── Fetch Profile Data ───────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!identifier) return;
    setIsLoadingProfile(true);
    try {
      const res = await fetch(
        `/api/community/user-profile?id=${encodeURIComponent(identifier)}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        // Fallback default
        setProfile({
          uid: identifier,
          username: identifier.toLowerCase().replace(/\s+/g, '_'),
          displayName: identifier,
          photoURL: null,
          bio: 'مشارك في مجتمع TOLZY التقني',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
      setProfile({
        uid: identifier,
        username: identifier,
        displayName: identifier,
        photoURL: null,
        bio: 'مشارك في مجتمع TOLZY التقني',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, [identifier]);

  // ─── Fetch User Posts ────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    if (!identifier) return;
    setIsLoadingPosts(true);
    try {
      const res = await fetch(
        `/api/community/user-posts?id=${encodeURIComponent(identifier)}&limit=50`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.warn('Failed to fetch user posts:', err);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [identifier]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  // ─── Extract Unique Featured Tools across User's Posts ────────────────────────
  const featuredTools = useMemo(() => {
    const slugSet = new Set<string>();

    posts.forEach((p) => {
      // From mentioned_tools
      (p.mentioned_tools || []).forEach((slug) => {
        if (slug && typeof slug === 'string') slugSet.add(slug.toLowerCase());
      });

      // From stack_tools
      (p.stack_tools || []).forEach((st) => {
        if (st.tool_id) slugSet.add(st.tool_id.toLowerCase());
      });
    });

    const list: Tool[] = [];
    slugSet.forEach((slug) => {
      const found = tools?.find(
        (t) => t.id.toLowerCase() === slug || t.name.toLowerCase() === slug
      );
      if (found) {
        list.push(found);
      } else {
        const fallback = getFallbackToolById(slug);
        if (fallback) list.push(fallback);
      }
    });

    return list;
  }, [posts, tools]);

  // ─── Calculate Metrics ────────────────────────────────────────────────────────
  const totalPostsCount = posts.length;
  const totalKarmaCount = useMemo(
    () => posts.reduce((acc, p) => acc + (p.upvotes_count || 0), 0),
    [posts]
  );
  const featuredToolsCount = featuredTools.length;

  // ─── Filtered Posts by Tab ────────────────────────────────────────────────────
  const stackPosts = useMemo(
    () => posts.filter((p) => p.post_type === 'stack' || (p.stack_tools && p.stack_tools.length > 0)),
    [posts]
  );

  const pollPosts = useMemo(
    () => posts.filter((p) => p.poll != null || p.post_type === 'question'),
    [posts]
  );

  const displayedPosts = useMemo(() => {
    if (activeTab === 'stacks') return stackPosts;
    if (activeTab === 'polls') return pollPosts;
    return posts;
  }, [activeTab, posts, stackPosts, pollPosts]);

  // ─── Actions ──────────────────────────────────────────────────────────────────
  const handleShareProfile = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toast.success('تم نسخ رابط الملف الشخصي! 📋');
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      toast.error('تعذر نسخ الرابط');
    }
  };

  const handleVote = async (promptId: string, voteType: 'up' | 'down') => {
    if (!currentUser) {
      toast.error('يرجى تسجيل الدخول للتصويت على المنشورات');
      return;
    }

    const currentVote = userVotes[promptId];
    const newVote = currentVote === voteType ? null : voteType;

    // Optimistic UI update
    setUserVotes((prev) => {
      const copy = { ...prev };
      if (!newVote) delete copy[promptId];
      else copy[promptId] = newVote;
      return copy;
    });

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== promptId) return p;
        let delta = 0;
        if (voteType === 'up') {
          if (currentVote === 'up') delta = -1;
          else if (currentVote === 'down') delta = 2;
          else delta = 1;
        } else {
          if (currentVote === 'up') delta = -1;
        }
        return { ...p, upvotes_count: Math.max(0, (p.upvotes_count || 0) + delta) };
      })
    );

    try {
      await fetch('/api/community/prompts/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id: promptId, vote_type: voteType }),
      });
    } catch {
      toast.error('فشل تسجيل التصويت');
    }
  };

  const handleComment = async (promptId: string) => {
    if (openCommentsPromptId === promptId) {
      setOpenCommentsPromptId(null);
      return;
    }

    setOpenCommentsPromptId(promptId);
    if (!commentsMap[promptId]) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/community/comments?prompt_id=${promptId}`);
        if (res.ok) {
          const data = await res.json();
          setCommentsMap((prev) => ({ ...prev, [promptId]: data.comments || [] }));
        }
      } catch {
        toast.error('فشل تحميل التعليقات');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (promptId: string, content: string) => {
    if (!currentUser) {
      toast.error('يرجى تسجيل الدخول للتعليق');
      return;
    }

    try {
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id: promptId, content }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setCommentsMap((prev) => ({
            ...prev,
            [promptId]: [data.comment, ...(prev[promptId] || [])],
          }));
          setPosts((prev) =>
            prev.map((p) =>
              p.id === promptId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
            )
          );
          toast.success('تمت إضافة تعليقك بنجاح');
        }
      }
    } catch {
      toast.error('فشل إرسال التعليق');
    }
  };

  const handleSharePrompt = async (promptId: string) => {
    try {
      const url = `${window.location.origin}/community#prompt-${promptId}`;
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط المنشور! 🔗');
    } catch {
      toast.error('تعذر نسخ الرابط');
    }
  };

  // Format Join Date
  const formattedJoinDate = useMemo(() => {
    if (!profile?.createdAt) return 'عضو حديث';
    try {
      const d = new Date(profile.createdAt);
      if (isNaN(d.getTime())) return 'عضو حديث';
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return 'عضو حديث';
    }
  }, [profile?.createdAt]);

  const isOwner = currentUser?.uid && profile?.uid && currentUser.uid === profile.uid;

  return (
    <PageLayout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20 pt-24" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* ─── Breadcrumb Back Navigation ─── */}
          <div className="mb-6">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى مجتمع TOLZY</span>
            </Link>
          </div>

          {/* ─── Skeleton Loading State ─── */}
          {isLoadingProfile && isLoadingPosts ? (
            <div className="space-y-6 animate-pulse">
              {/* Header Skeleton */}
              <div className="bg-white/60 dark:bg-neutral-900/60 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 h-64" />
              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-28 bg-white/60 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800" />
                <div className="h-28 bg-white/60 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800" />
                <div className="h-28 bg-white/60 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800" />
              </div>
              {/* Posts Skeleton */}
              <div className="space-y-4">
                <div className="h-48 bg-white/60 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800" />
                <div className="h-48 bg-white/60 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* ─── Profile Header Card (Bento & Glassmorphism) ─── */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-xl p-4 sm:p-8">
                {/* Ambient Decorative Glow */}
                <div className="absolute top-0 right-0 left-0 h-32 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-500/15 dark:via-purple-500/15 dark:to-pink-500/15 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  {/* Avatar + Main Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {profile?.photoURL && profile.photoURL.startsWith('http') ? (
                        <img
                          src={profile.photoURL}
                          alt={profile.displayName || 'صورة الحساب'}
                          className="w-16 h-16 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-white/60 dark:ring-neutral-800/60 shadow-lg"
                        />
                      ) : (
                        <div
                          className={`w-16 h-16 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl ${getAvatarColor(
                            profile?.displayName || 'م'
                          )} flex items-center justify-center text-white font-black text-2xl sm:text-4xl shadow-lg ring-4 ring-white/60 dark:ring-neutral-800/60`}
                        >
                          {profile?.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      {profile?.role === 'admin' ? (
                        <div
                          className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-md border-2 border-white dark:border-neutral-900"
                          title="مدير النظام"
                        >
                          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      ) : (
                        <div
                          className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-md border-2 border-white dark:border-neutral-900"
                          title="مبدع معتمد"
                        >
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <h1 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                          {profile?.displayName || 'مستخدم TOLZY'}
                        </h1>
                        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-lg text-[11px] sm:text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>{profile?.badge || (profile?.role === 'admin' ? 'مدير' : 'مبدع')}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                        <span>@{profile?.username || identifier}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-sans">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>انضم {formattedJoinDate}</span>
                        </span>
                      </div>

                      <p className="mt-2 sm:mt-3 text-xs sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
                        {profile?.bio || 'مبدع ومشارك شغوف في استكشاف وتطوير أدوات الذكاء الاصطناعي على منصة TOLZY.'}
                      </p>
                    </div>
                  </div>

                  {/* Profile Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-800 dark:text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-all active:scale-95"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">مشاركة الملف</span>
                          <span className="sm:hidden">مشاركة</span>
                        </>
                      )}
                    </button>

                    {isOwner && (
                      <Link
                        href="/profile"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                      >
                        <span className="hidden sm:inline">تعديل ملفي</span>
                        <span className="sm:hidden">تعديل</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Impact Stats Bar (3 Bento Counters) ─── */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {/* Counter 1: Total Posts */}
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-sm hover:border-blue-500/30 transition-all flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-right gap-1.5 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50 shadow-inner">
                    <Layers className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-base sm:text-2xl font-black text-neutral-900 dark:text-white font-mono block leading-none mb-0.5 sm:mb-1">
                      {totalPostsCount}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 block truncate">
                      <span className="sm:hidden">منشورات</span>
                      <span className="hidden sm:inline">إجمالي المنشورات والمشاركات</span>
                    </span>
                  </div>
                </div>

                {/* Counter 2: Total Upvotes / Karma */}
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-sm hover:border-rose-500/30 transition-all flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-right gap-1.5 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-800/50 shadow-inner">
                    <Heart className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-base sm:text-2xl font-black text-neutral-900 dark:text-white font-mono block leading-none mb-0.5 sm:mb-1">
                      {totalKarmaCount}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 block truncate">
                      <span className="sm:hidden">إعجابات</span>
                      <span className="hidden sm:inline">نقاط التفاعل المجتمعي</span>
                    </span>
                  </div>
                </div>

                {/* Counter 3: Tools Featured */}
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-sm hover:border-purple-500/30 transition-all flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-right gap-1.5 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/50 shadow-inner">
                    <Wrench className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-base sm:text-2xl font-black text-neutral-900 dark:text-white font-mono block leading-none mb-0.5 sm:mb-1">
                      {featuredToolsCount}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-neutral-400 block truncate">
                      <span className="sm:hidden">أدوات</span>
                      <span className="hidden sm:inline">أدوات ذكية يُوصي بها</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── Featured Tools Showcase ("الأدوات التي يستخدمها") ─── */}
              {featuredTools.length > 0 && (
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg font-black text-neutral-900 dark:text-white">
                        الأدوات التي يوصي بها ويستخدمها
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg font-mono">
                      {featuredTools.length} أداة
                    </span>
                  </div>

                  {/* Horizontal Scrollable Mini Bento Tool Cards */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                    {featuredTools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className="min-w-[220px] max-w-[260px] p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 hover:border-blue-500/50 hover:shadow-md transition-all group shrink-0 flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <ToolImage
                            name={tool.name}
                            size="sm"
                            categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-neutral-900 dark:text-white text-sm truncate block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {tool.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 truncate block">
                              {Array.isArray(tool.category) ? tool.category[0] : tool.category || 'ذكاء اصطناعي'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-700/50 flex items-center justify-between text-xs">
                          <span className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            {tool.pricing || 'مجاني'}
                          </span>
                          <span className="text-neutral-400 group-hover:text-blue-500 inline-flex items-center gap-0.5 transition-colors text-[11px] font-semibold">
                            <span>استكشاف</span>
                            <ArrowRight className="w-3 h-3 rotate-180" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Organized Content Tabs ─── */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl bg-neutral-200/60 dark:bg-neutral-800/60 backdrop-blur-md max-w-full overflow-x-auto no-scrollbar scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === 'all'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>الكل</span>
                    <span className="hidden sm:inline">(المنشورات)</span>
                    <span className="text-[11px] sm:text-xs px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono">
                      {posts.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('stacks')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === 'stacks'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                    <span>حزم الأدوات</span>
                    <span className="text-[11px] sm:text-xs px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono">
                      {stackPosts.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('polls')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === 'polls'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                    <span>الاستطلاعات</span>
                    <span className="hidden sm:inline">والمقارنات</span>
                    <span className="text-[11px] sm:text-xs px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono">
                      {pollPosts.length}
                    </span>
                  </button>
                </div>

                {/* ─── Posts Feed / Empty State ─── */}
                {displayedPosts.length === 0 ? (
                  <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-4">
                      {activeTab === 'stacks' ? (
                        <Box className="w-8 h-8" />
                      ) : activeTab === 'polls' ? (
                        <Flame className="w-8 h-8" />
                      ) : (
                        <MessageSquare className="w-8 h-8" />
                      )}
                    </div>
                    <h3 className="text-lg font-black text-neutral-800 dark:text-white mb-1">
                      {activeTab === 'stacks'
                        ? 'لا توجد حزم أدوات بعد'
                        : activeTab === 'polls'
                        ? 'لا توجد استطلاعات رأي بعد'
                        : 'لم ينشر هذا المبدع أي محتوى حتى الآن'}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                      {activeTab === 'stacks'
                        ? 'لم يقم هذا المبدع بمشاركة أي حزم تقنية في المجتمع حتى اللحظة.'
                        : activeTab === 'polls'
                        ? 'لم يقم هذا المبدع بإنشاء أي مقارنات أو استطلاعات رأي بعد.'
                        : 'ستظهر هنا منشورات ومشاركات هذا المبدع فور قيامه بنشرها.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedPosts.map((post) => (
                      <PromptCard
                        key={post.id}
                        prompt={post}
                        currentUser={currentUser}
                        isOwner={currentUser?.uid === post.author_uid}
                        userVote={userVotes[post.id] || null}
                        onVote={handleVote}
                        onComment={handleComment}
                        onShare={handleSharePrompt}
                        comments={commentsMap[post.id] || []}
                        isLoadingComments={loadingComments && openCommentsPromptId === post.id}
                        isCommentsOpen={openCommentsPromptId === post.id}
                        onAddComment={handleAddComment}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}

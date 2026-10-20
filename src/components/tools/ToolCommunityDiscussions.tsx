'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Sparkles,
  Loader2,
  PlusCircle,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { Tool } from '../../types/tool';
import { CommunityPrompt, PromptComment } from '../../types/community';
import PromptCard from '../community/PromptCard';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface ToolCommunityDiscussionsProps {
  tool: Tool;
}

export const ToolCommunityDiscussions: React.FC<ToolCommunityDiscussionsProps> = ({
  tool,
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PromptComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

  const fetchDiscussions = useCallback(async () => {
    if (!tool?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/community/feed?tool=${encodeURIComponent(tool.id)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.prompts || []);
      }
    } catch (err) {
      console.error('Failed to fetch tool discussions:', err);
    } finally {
      setLoading(false);
    }
  }, [tool?.id]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  // Voting handler
  const handleVote = async (promptId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً للتفاعل');
      return;
    }

    const currentVote = userVotes[promptId];
    const isRemoving = currentVote === voteType;
    const diff = isRemoving ? -1 : currentVote ? 2 : 1;

    setUserVotes((prev) => {
      const next = { ...prev };
      if (isRemoving) delete next[promptId];
      else next[promptId] = voteType;
      return next;
    });

    setPosts((prev) =>
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
      setUserVotes((prev) => ({ ...prev, [promptId]: currentVote }));
    }
  };

  // Comments handler
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

  const handleAddComment = async (promptId: string, text: string) => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    const tempComment: PromptComment = {
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
      [promptId]: [...(prev[promptId] || []), tempComment],
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === promptId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
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
      if (res.ok) {
        toast.success('تم إرسال التعليق');
      }
    } catch {
      toast.error('فشل إرسال التعليق');
    }
  };

  const handleShare = async (promptId: string) => {
    const url = `${window.location.origin}/community#post-${promptId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط المنشور! 🔗');
    } catch {
      toast.error('تعذر نسخ الرابط');
    }
  };

  const createPostUrl = `/community?mention=${encodeURIComponent(tool.name)}&toolId=${encodeURIComponent(tool.id)}`;

  return (
    <section className="mt-10 sm:mt-16 border-t border-[#d2d2c8] dark:border-neutral-800 pt-8 sm:pt-12" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>مجتمع ومناقشات TOLZY</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[#14140f] dark:text-white tracking-tight">
            نقاشات وتجارب المجتمع حول {tool.name}
          </h2>
          <p className="text-xs sm:text-sm text-[#6e6e64] dark:text-neutral-400 mt-1">
            آراء، شروحات، وبرومبتات يشاركها مجتمع المطورين والمستخدمين حول هذه الأداة.
          </p>
        </div>

        <Link
          href={createPostUrl}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">شارك تجربتك مع {tool.name}</span>
          <span className="sm:hidden">شارك تجربتك</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl">
          <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-blue-600 mb-2" />
          <span className="text-xs text-neutral-400">جاري تحميل نقاشات وتجارب المجتمع...</span>
        </div>
      ) : posts.length === 0 ? (
        /* Empty State Card */
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 shadow-sm">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <h3 className="text-base sm:text-xl font-bold text-neutral-900 dark:text-white">
                لا توجد نقاشات أو تجارب منشورة حول {tool.name} بعد
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                هل جربت هذه الأداة؟ ساعد زملاءك في مجتمع TOLZY بنشر رأيك أو حيلة ذكية استخدمتها!
              </p>
            </div>

            <div className="pt-1 sm:pt-2">
              <Link
                href={createPostUrl}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:scale-102 active:scale-98"
              >
                <span className="hidden sm:inline">كن أول من يشارك تجربته مع هذه الأداة في المجتمع</span>
                <span className="sm:hidden">شارك تجربتك مع الأداة الآن</span>
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Posts List */
        <div className="space-y-4">
          {posts.map((post) => (
            <PromptCard
              key={post.id}
              prompt={post}
              userVote={userVotes[post.id] || null}
              isOwner={user?.uid === post.author_uid}
              currentUser={user}
              onVote={handleVote}
              onComment={handleToggleComments}
              onShare={handleShare}
              isCommentsOpen={openCommentsPostId === post.id}
              comments={commentsMap[post.id] || []}
              isLoadingComments={loadingComments.has(post.id)}
              onAddComment={handleAddComment}
            />
          ))}

          <div className="text-center pt-4">
            <Link
              href={createPostUrl}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-bold text-blue-600 dark:text-blue-400 transition-colors shadow-xs"
            >
              <span>أضف تجربتك أو شارك برومبت جديد مع هذه الأداة ↗</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default ToolCommunityDiscussions;

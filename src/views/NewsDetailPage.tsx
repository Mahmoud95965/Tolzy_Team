"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageLayout from '@/src/components/layout/PageLayout';
import { Share2, Facebook, Linkedin, Link as LinkIcon, Loader, Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@/src/components/pdf/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center p-12">
      <Loader className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  )
});
import { useAuth } from '@/src/context/AuthContext';
import {
  getArticleById,
  getArticleComments,
  addArticleComment,
  toggleCommentLike,
  getUserLikedComments,
  deleteArticleComment,
  toggleArticleLike,
  hasUserLikedArticle,
  type Article,
  type Comment
} from '@/src/services/articles.service';

// Comment Item Sub-component
const CommentItem = ({
  comment,
  user,
  userLikedComments,
  onReply,
  onDelete,
  depth = 0
}: {
  comment: Comment,
  user: any,
  userLikedComments: Set<string>,
  onReply: (parentId: string, content: string) => Promise<void>,
  onDelete: (commentId: string) => Promise<void>,
  depth?: number
}) => {
  const [liked, setLiked] = useState(userLikedComments.has(comment.id));
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.uid === comment.user_id;

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول للإعجاب بالتعليق');
      return;
    }

    const previousLiked = liked;
    const previousCount = likesCount;

    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);

    try {
      const result = await toggleCommentLike(comment.id, user.uid);
      if (result) {
        setLiked(result.liked);
        setLikesCount(result.newCount);
      } else {
        setLiked(previousLiked);
        setLikesCount(previousCount);
      }
    } catch (error) {
      setLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 ${depth > 0 ? 'mr-0' : ''}`} style={{ marginRight: depth * 20 }}>
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
          {comment.user_avatar ? (
            <img src={comment.user_avatar} alt={comment.user_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
              {comment.user_name[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">
                {comment.user_name}
              </h4>
              <span className="text-xs text-slate-500">
                {new Date(comment.created_at).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked
                ? 'text-rose-500'
                : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
                }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount > 0 ? likesCount : 'إعجاب'}</span>
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>رد</span>
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? '...' : 'حذف'}</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-4 animate-in fade-in slide-in-from-top-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="اكتب ردك..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all min-h-[80px]"
                autoFocus
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!replyContent.trim() || submittingReply}
                  className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submittingReply ? 'جارٍ النشر...' : 'رد'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ArticleViewPage({ initialArticle }: { initialArticle?: any }) {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(initialArticle || null);
  const [loading, setLoading] = useState(!initialArticle);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Likes & Comments State
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userLikedComments, setUserLikedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch Article
    getArticleById(id)
      .then(a => {
        setArticle(a);
        setLikesCount(a?.likes_count || 0);
        setLoading(false);
        if (!a) {
          setError('المقال غير موجود');
        }
      })
      .catch(() => {
        setError('تعذر تحميل المقال');
        setLoading(false);
      });

    // Fetch Comments
    const fetchComments = async () => {
      try {
        const data = await getArticleComments(id);
        setComments(data);

        if (user) {
          const likedSet = await getUserLikedComments(id, user.uid);
          setUserLikedComments(likedSet);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();

    // Check Like Status
    if (user) {
      hasUserLikedArticle(id, user.uid).then(liked => setHasLiked(liked));
    }
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول للإعجاب بالمقال');
      return;
    }
    if (!article) return;

    const previousLiked = hasLiked;
    const previousCount = likesCount;

    setHasLiked(!hasLiked);
    setLikesCount(prev => hasLiked ? prev - 1 : prev + 1);

    try {
      const result = await toggleArticleLike(article.id, user.uid);
      if (result) {
        setLikesCount(result.newCount);
        setHasLiked(result.liked);
      } else {
        setHasLiked(previousLiked);
        setLikesCount(previousCount);
      }
    } catch (e) {
      setHasLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !article || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await addArticleComment(
        article.id,
        user.uid,
        user.displayName || 'مستخدم',
        newComment,
        user.photoURL || undefined
      );

      if (comment) {
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (e) {
      console.error(e);
      alert('فشل إضافة التعليق');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplyCallback = async (parentId: string, content: string) => {
    if (!user || !article) return;

    try {
      const reply = await addArticleComment(
        article.id,
        user.uid,
        user.displayName || 'مستخدم',
        content,
        user.photoURL || undefined,
        parentId
      );

      if (reply) {
        const data = await getArticleComments(article.id);
        setComments(data);
      }
    } catch (error) {
      console.error('Error replying:', error);
      alert('فشل إضافة الرد');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const success = await deleteArticleComment(commentId);
      if (success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        alert('فشل حذف التعليق');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleShare = async (platform?: string) => {
    const url = window.location.href;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }

    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">جارٍ تحميل المقال...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !article) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {error || 'المقال غير موجود'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">الرجاء التحقق من الرابط والمحاولة مرة أخرى</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Title Section - Simple & Clean */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* PDF Viewer */}
        {article.pdf_url && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full min-h-screen">
              <PDFViewer url={article.pdf_url} />
            </div>
          </div>
        )}

        {/* Manual Content if no PDF */}
        {!article.pdf_url && article.content && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
              className="prose dark:prose-invert max-w-none prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-slate-50 dark:bg-slate-900 py-12 border-t border-slate-200 dark:border-slate-800 pb-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              التعليقات ({comments.length})
            </h3>

            {/* Comment Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
              {user ? (
                <form onSubmit={handleCommentSubmit}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                          {user.displayName?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="اكتب تعليقك هنا..."
                        className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-slate-900 dark:text-slate-100 transition-all min-h-[100px]"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={!newComment.trim() || submittingComment}
                          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          {submittingComment ? 'جارٍ النشر...' : 'نشر التعليق'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    يرجى تسجيل الدخول للمشاركة في النقاش
                  </p>
                  <a
                    href="/auth/login"
                    className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    تسجيل الدخول
                  </a>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {loadingComments ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                </div>
              ) : comments.length > 0 ? (
                // Render Root Comments
                rootComments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    <CommentItem
                      comment={comment}
                      user={user}
                      userLikedComments={userLikedComments} // Static initial state, internal state updates itself
                      onReply={handleReplyCallback}
                      onDelete={handleDeleteComment}
                    />
                    {/* Render Replies */}
                    {getReplies(comment.id).map(reply => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        user={user}
                        userLikedComments={userLikedComments}
                        onReply={handleReplyCallback}
                        onDelete={handleDeleteComment}
                        depth={1}
                      />
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  لا توجد تعليقات بعد. كن أول من يعلق!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share Buttons - Bottom, Clean & Minimal */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${hasLiked
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-800'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-600'
                  }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>


              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Share2 className="w-5 h-5" />
                  مشاركة
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-700 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 p-2 min-w-[200px]">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-lg transition-colors text-right"
                    >
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="text-slate-900 dark:text-slate-100">فيسبوك</span>
                    </button>

                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-lg transition-colors text-right"
                    >
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <span className="text-slate-900 dark:text-slate-100">لينكد إن</span>
                    </button>

                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-lg transition-colors text-right"
                    >
                      <LinkIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="text-slate-900 dark:text-slate-100">
                        {copied ? 'تم النسخ!' : 'نسخ الرابط'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

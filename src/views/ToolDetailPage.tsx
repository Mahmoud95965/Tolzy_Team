"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { updateToolVote, updateToolSave } from '../services/tool-actions.service';
import PageLayout from '../components/layout/PageLayout';
import ToolsGrid from '../components/tools/ToolsGrid';
import ShareToolModal from '../components/tools/ShareToolModal';
import ToolImage from '../components/common/ToolImage';
import { Tool } from '../types/tool';
import {
  Star,
  ExternalLink,
  Share2,
  BookmarkPlus,
  BookmarkMinus,
  Loader,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  ChevronRight,
  Sparkles,
  Newspaper,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ToolDetailPageProps {
  initialTool?: Tool | null;
}

const ToolDetailPageNew: React.FC<ToolDetailPageProps> = ({ initialTool }) => {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const { tools } = useTools();

  // Initialize with server data if available
  const [tool, setTool] = useState<Tool | null>(initialTool || null);
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<'helpful' | 'notHelpful' | null>(null);
  const [loading, setLoading] = useState(!initialTool);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Optimistic Vote Counts
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(0);
  const [optimisticDislikeCount, setOptimisticDislikeCount] = useState(0);

  // Refs for Hard Locking to prevent double firing in Strict Mode
  const voteLock = useRef(false);
  const saveLock = useRef(false);

  const updateRelatedTools = useCallback((currentTool: Tool) => {
    if (!tools || tools.length === 0) return;

    const related = tools
      .filter(t =>
        t.id !== currentTool.id &&
        (t.category === currentTool.category ||
          t.tags.some(tag => currentTool.tags.includes(tag)))
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    setRelatedTools(related);
  }, [tools]);

  const updateUserVote = useCallback((toolData: Tool) => {
    if (user && toolData.votes) {
      if (toolData.votes.helpful?.includes(user.uid)) {
        setUserVote('helpful');
      } else if (toolData.votes.notHelpful?.includes(user.uid)) {
        setUserVote('notHelpful');
      } else {
        setUserVote(null);
      }
    } else {
      setUserVote(null);
    }
  }, [user]);

  // Sync optimistic counts with real tool data when it changes
  useEffect(() => {
    if (tool) {
      const helpfulCount = tool.votingStats?.helpfulCount ?? tool.votes?.helpful?.length ?? 0;
      const notHelpfulCount = tool.votingStats?.notHelpfulCount ?? tool.votes?.notHelpful?.length ?? 0;
      setOptimisticLikeCount(helpfulCount);
      setOptimisticDislikeCount(notHelpfulCount);
    }
  }, [tool]);

  // Ref to track if we've initialized from server/context
  const initializedRef = React.useRef(false);

  // 1. Initial Setup Effect
  useEffect(() => {
    if (initialTool) {
      setTool(initialTool);
      initializedRef.current = true;
    }
  }, [initialTool]);

  // 2. Hydration from Context Effect
  useEffect(() => {
    if (!id || initializedRef.current || tool) return;

    if (tools.length > 0) {
      const normalizedId = id.toString().padStart(3, '0');
      const toolFromContext = tools.find(t => t.id === normalizedId);
      if (toolFromContext) {
        setTool(toolFromContext);
        setLoading(false);
      }
    }
  }, [id, tools, tool]);

  // Track attempted fetches
  const attemptRef = React.useRef<{ [key: string]: number }>({});

  // 3. Subscription Effect
  useEffect(() => {
    if (!id) {
      if (!initialTool) {
        setError('الأداة غير موجودة');
        setLoading(false);
      }
      return;
    }

    const normalizedId = id.toString().padStart(3, '0');
    // Don't skip if we have tool, we want real-time updates! 
    // But we can optimize by only setting state if data changed significantly if needed.
    // For now, let's keep subscription active for real-time like updates.

    const attemptCount = attemptRef.current[normalizedId] || 0;
    if (attemptCount > 3) {
      console.warn(`Too many fetch attempts for tool ${normalizedId}, stopping.`);
      if (!tool) { // Only show error if we strictly needed to fetch
        setError('حدث خطأ أثناء تحميل الأداة (تجاوز الحد المسموح)');
        setLoading(false);
      }
      return;
    }
    attemptRef.current[normalizedId] = attemptCount + 1;

    const toolRef = doc(db, 'tools', normalizedId);

    const unsubscribe = onSnapshot(
      toolRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const toolData = { ...snapshot.data(), id: snapshot.id } as Tool;
          setTool(toolData);
          setError(null);
        } else {
          setTool(null);
          setError('الأداة غير موجودة');
        }
        setLoading(false);
      },
      (err: any) => {
        console.error('Error fetching tool:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, initialTool]);


  // 4. Derived Updates Effect
  useEffect(() => {
    if (tool) {
      updateRelatedTools(tool);
      updateUserVote(tool);
    }
  }, [tool, updateRelatedTools, updateUserVote]);

  const handleVote = async (voteType: 'helpful' | 'notHelpful') => {
    // 1. HARD LOCK CHECK
    if (voteLock.current) return;

    if (!user) {
      alert('يجب تسجيل الدخول للتصويت');
      return;
    }

    if (!tool?.id || isVoting) return;

    // 2. SET LOCK
    voteLock.current = true;

    // Store previous state for rollback
    const previousVote = userVote;
    const previousLikeCount = optimisticLikeCount;
    const previousDislikeCount = optimisticDislikeCount;

    // Calculate optimistic UI updates
    let newVote: 'helpful' | 'notHelpful' | null;
    let newLikeCount = previousLikeCount;
    let newDislikeCount = previousDislikeCount;

    if (userVote === voteType) {
      // Clicking same vote type = toggle off
      newVote = null;
      if (voteType === 'helpful') {
        newLikeCount--;
      } else {
        newDislikeCount--;
      }
    } else {
      // Switching vote or new vote
      newVote = voteType;

      // Remove from previous vote type if any
      if (userVote === 'helpful') {
        newLikeCount--;
      } else if (userVote === 'notHelpful') {
        newDislikeCount--;
      }

      // Add to new vote type
      if (voteType === 'helpful') {
        newLikeCount++;
      } else {
        newDislikeCount++;
      }
    }

    // Apply optimistic update
    setUserVote(newVote);
    setOptimisticLikeCount(Math.max(0, newLikeCount));
    setOptimisticDislikeCount(Math.max(0, newDislikeCount));
    setIsVoting(true);

    try {
      await updateToolVote(tool.id, user.uid, voteType === 'helpful');
    } catch (error) {
      // Revert on error
      setUserVote(previousVote);
      setOptimisticLikeCount(previousLikeCount);
      setOptimisticDislikeCount(previousDislikeCount);
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
      // 3. RELEASE LOCK
      voteLock.current = false;
    }
  };

  const handleSave = async () => {
    // 1. HARD LOCK CHECK
    if (saveLock.current) return;

    if (!user) return;
    if (!tool?.id) return;

    // 2. SET LOCK
    saveLock.current = true;
    setIsSaving(true);
    try {
      const isSaved = tool.savedBy?.includes(user.uid) || false;
      await updateToolSave(tool.id, user.uid, !isSaved);
    } catch (error) {
      console.error('Error saving tool:', error);
    } finally {
      setIsSaving(false);
      // 3. RELEASE LOCK
      saveLock.current = false;
    }
  };



  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      </PageLayout>
    );
  }

  if (error || !tool) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الأداة غير موجودة</h1>
          <Link
            href="/tools"
            className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
          >
            تصفح جميع الأدوات
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Top Navigation */}
        <nav className="mb-8 animate-fade-in flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الرئيسية</Link>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الأدوات</Link>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          <span className="text-gray-900 dark:text-white font-medium line-clamp-1">{tool.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-10">

            {/* Hero Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden animate-fade-in-up group">
              {/* Background gradient blob */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-900/20 transition-colors duration-700"></div>

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                {/* Logo Section */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="p-1 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 shadow-lg">
                    <ToolImage
                      imageUrl={tool.imageUrl}
                      name={tool.name}
                      categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                      subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory?.[0] : tool.subcategory}
                      size="lg"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center md:text-right space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {tool.name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-end gap-2">
                      {/* Badge Examples */}
                      {tool.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-700/50">
                          <Sparkles className="w-3 h-3" /> مميزة
                        </span>
                      )}
                      {tool.pricing === 'Free' && (
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-200 dark:border-green-700/50">
                          مجانية
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                    {tool.description}
                  </p>

                  <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-1"
                    >
                      <ExternalLink className="w-5 h-5" />
                      زيارة الموقع
                    </a>

                    {/* Vote Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={() => handleVote('helpful')}
                        disabled={isVoting}
                        className={`group relative inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold border transition-all duration-300 ${userVote === 'helpful'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800 dark:hover:text-emerald-400'
                          }`}
                        aria-label="أعجبني"
                      >
                        <ThumbsUp className={`w-5 h-5 transition-transform duration-300 ${userVote === 'helpful' ? 'scale-110 fill-current' : 'group-hover:scale-110'}`} />
                        <span className="text-base tabular-nums">{optimisticLikeCount}</span>

                        {/* Animation Effect */}
                        {userVote === 'helpful' && (
                          <span className="absolute inset-0 rounded-xl ring-2 ring-emerald-400 animate-ping opacity-20 pointer-events-none"></span>
                        )}
                      </button>

                      {/* Dislike Button */}
                      <button
                        onClick={() => handleVote('notHelpful')}
                        disabled={isVoting}
                        className={`group relative inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold border transition-all duration-300 ${userVote === 'notHelpful'
                          ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-rose-900/20 dark:hover:border-rose-800 dark:hover:text-rose-400'
                          }`}
                        aria-label="لم يعجبني"
                      >
                        <ThumbsDown className={`w-5 h-5 transition-transform duration-300 ${userVote === 'notHelpful' ? 'scale-110 fill-current' : 'group-hover:scale-110'}`} />
                        <span className="text-base tabular-nums">{optimisticDislikeCount}</span>

                        {/* Animation Effect */}
                        {userVote === 'notHelpful' && (
                          <span className="absolute inset-0 rounded-xl ring-2 ring-rose-400 animate-ping opacity-20 pointer-events-none"></span>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`p-3.5 rounded-xl border transition-colors ${tool.savedBy?.includes(user?.uid || '')
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400'
                        : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:hover:text-gray-300'
                        }`}
                      aria-label="Save tool"
                    >
                      {tool.savedBy?.includes(user?.uid || '')
                        ? <BookmarkMinus className="w-6 h-6" />
                        : <BookmarkPlus className="w-6 h-6" />
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Features Tags Row */}
              <div className="mt-8 flex flex-wrap gap-2 justify-center md:justify-start">
                {tool.features.slice(0, 4).map((f, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {f}
                  </span>
                ))}
                {Array.isArray(tool.category) ? tool.category.map((cat, idx) => (
                  <span key={`cat-${idx}`} className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm border border-indigo-100 dark:border-indigo-800">
                    {cat}
                  </span>
                )) : (
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm border border-indigo-100 dark:border-indigo-800">
                    {tool.category}
                  </span>
                )
                }
              </div>
            </div>

            {/* Content Tabs / Sections */}
            <div className="space-y-8 animate-fade-in delay-100">

              {/* Description */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-indigo-500" />
                  نبدة عن الأداة
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-8 text-lg">
                  {tool.longDescription || tool.description}
                </p>
              </div>

              {/* Pros & Cons Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {tool.pros && tool.pros.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600"><CheckCircle2 className="w-5 h-5" /></span>
                      النقاط الإيجابية
                    </h3>
                    <ul className="space-y-3">
                      {tool.pros.map((p, i) => (
                        <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
                          <span className="text-green-500 font-bold">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tool.cons && tool.cons.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600"><XCircle className="w-5 h-5" /></span>
                      نقاط التحسين
                    </h3>
                    <ul className="space-y-3">
                      {tool.cons.map((c, i) => (
                        <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
                          <span className="text-red-500 font-bold">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">معلومات سريعة</h3>

              <div className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> التسعير
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tool.pricing === 'Free' ? 'مجاني' :
                      tool.pricing === 'Freemium' ? 'مجاني / مدفوع' :
                        tool.pricing === 'Paid' ? 'مدفوع' : 'اشتراك'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Star className="w-4 h-4" /> التقييم
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                    <span className="text-amber-500">{tool.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">/5</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Users className="w-4 h-4" /> التفاعل
                  </span>
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <ThumbsUp className="w-4 h-4" /> {optimisticLikeCount}
                    </span>
                    <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
                      <ThumbsDown className="w-4 h-4" /> {optimisticDislikeCount}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium border border-gray-200 dark:border-gray-600"
                  >
                    <Share2 className="w-4 h-4" /> مشاركة الأداة
                  </button>
                </div>
              </div>
            </div>

            {/* Tags Cloud */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider text-opacity-70">الوسوم</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                أدوات ذات صلة
              </h2>
              <Link href="/tools" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                عرض المزيد
              </Link>
            </div>
            <ToolsGrid tools={relatedTools} />
          </div>
        )}
      </div>

      {isShareModalOpen && tool && (
        <ShareToolModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          tool={tool}
        />
      )}
    </PageLayout>
  );
};

export default ToolDetailPageNew;

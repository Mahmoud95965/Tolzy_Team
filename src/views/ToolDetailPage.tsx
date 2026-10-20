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
import ToolCommunityDiscussions from '../components/tools/ToolCommunityDiscussions';
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
        <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.05em] text-[#6e6e64]">
          <Link href="/" className="hover:text-[#14140f] transition-colors">الرئيسية</Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href="/tools" className="hover:text-[#14140f] transition-colors">الأدوات</Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-[#14140f] font-medium line-clamp-1">{tool.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Hero Card */}
            <div className="bg-[#f5f5eb] rounded-[28px] p-6 md:p-10 border border-[#d2d2c8] shadow-none relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                {/* Logo Section */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="p-2 rounded-[18px] bg-[#ffffff] border border-[#d2d2c8]">
                    <ToolImage
                      name={tool.name}
                      categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                      subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory?.[0] : tool.subcategory}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 text-center md:text-right space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl md:text-5xl font-medium text-[#14140f] tracking-tight">
                      {tool.name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-end gap-2">
                      {/* Badge Examples */}
                      {tool.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-[#beff50] text-[#14140f] rounded-full text-[10px] font-medium uppercase tracking-[0.1em]">
                          <Sparkles className="w-3 h-3" /> مميزة
                        </span>
                      )}
                      {tool.pricing === 'Free' && (
                        <span className="inline-flex items-center px-3 py-0.5 bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] rounded-full text-[10px] font-medium">
                          مجانية
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-base md:text-lg text-[#6e6e64] leading-relaxed font-normal">
                    {tool.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[28px] text-[#14140f] bg-[#beff50] hover:bg-[#abf03c] font-medium text-sm transition-colors shadow-none"
                    >
                      <ExternalLink className="w-4 h-4" />
                      زيارة الموقع
                    </a>

                    {/* Vote Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={() => handleVote('helpful')}
                        disabled={isVoting}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-xs font-normal transition-colors ${
                          userVote === 'helpful'
                            ? 'bg-[#beff50] border-[#14140f] text-[#14140f] font-medium'
                            : 'bg-[#ffffff] border-[#d2d2c8] text-[#14140f] hover:border-[#14140f]'
                        }`}
                        aria-label="أعجبني"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="tabular-nums font-mono">{optimisticLikeCount}</span>
                      </button>

                      {/* Dislike Button */}
                      <button
                        onClick={() => handleVote('notHelpful')}
                        disabled={isVoting}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-xs font-normal transition-colors ${
                          userVote === 'notHelpful'
                            ? 'bg-[#14140f] border-[#14140f] text-[#ffffff] font-medium'
                            : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f] hover:border-[#14140f]'
                        }`}
                        aria-label="لم يعجبني"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span className="tabular-nums font-mono">{optimisticDislikeCount}</span>
                      </button>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`p-3 rounded-full border transition-colors ${
                        tool.savedBy?.includes(user?.uid || '')
                          ? 'bg-[#beff50]/20 border-[#14140f] text-[#14140f]'
                          : 'bg-[#ffffff] border-[#d2d2c8] text-[#14140f] hover:border-[#14140f]'
                      }`}
                      aria-label="Save tool"
                    >
                      {tool.savedBy?.includes(user?.uid || '')
                        ? <BookmarkMinus className="w-5 h-5" />
                        : <BookmarkPlus className="w-5 h-5" />
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Features Tags Row */}
              <div className="mt-8 flex flex-wrap gap-2 justify-center md:justify-start">
                {tool.features.slice(0, 4).map((f, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] text-xs font-normal flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#14140f]" /> {f}
                  </span>
                ))}
                {Array.isArray(tool.category) ? tool.category.map((cat, idx) => (
                  <span key={`cat-${idx}`} className="px-3 py-1 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] text-xs font-normal">
                    {cat}
                  </span>
                )) : (
                  <span className="px-3 py-1 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] text-xs font-normal">
                    {tool.category}
                  </span>
                )}
              </div>
            </div>

            {/* Content Tabs / Sections */}
            <div className="space-y-6">

              {/* Description */}
              <div className="bg-[#f5f5eb] rounded-[28px] p-8 border border-[#d2d2c8]">
                <h2 className="text-xl font-medium text-[#14140f] mb-4 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#14140f]" />
                  نبذة عن الأداة
                </h2>
                <p className="text-[#14140f] leading-relaxed text-base font-normal">
                  {tool.longDescription || tool.description}
                </p>
              </div>

              {/* Pros & Cons Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {tool.pros && tool.pros.length > 0 && (
                  <div className="bg-[#f5f5eb] rounded-[28px] p-8 border border-[#d2d2c8] shadow-none">
                    <h3 className="text-lg font-medium text-[#14140f] mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#14140f]" />
                      النقاط الإيجابية
                    </h3>
                    <ul className="space-y-2">
                      {tool.pros.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-[#14140f] font-normal">
                          <span className="text-[#14140f] font-medium">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tool.cons && tool.cons.length > 0 && (
                  <div className="bg-[#f5f5eb] rounded-[28px] p-8 border border-[#d2d2c8] shadow-none">
                    <h3 className="text-lg font-medium text-[#6e6e64] mb-4 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-[#6e6e64]" />
                      نقاط التحسين
                    </h3>
                    <ul className="space-y-2">
                      {tool.cons.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-[#6e6e64] font-normal">
                          <span className="text-[#6e6e64] font-medium">•</span>
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
            <div className="bg-[#f5f5eb] rounded-[28px] p-6 border border-[#d2d2c8] shadow-none sticky top-24">
              <h3 className="font-medium text-[#14140f] mb-6 text-base uppercase tracking-[0.05em]">معلومات سريعة</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#d2d2c8]">
                  <span className="text-[#6e6e64] text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#14140f]" /> التسعير
                  </span>
                  <span className="font-medium text-[#14140f] text-sm">
                    {tool.pricing === 'Free' ? 'مجاني' :
                      tool.pricing === 'Freemium' ? 'مجاني / مدفوع' :
                        tool.pricing === 'Paid' ? 'مدفوع' : 'اشتراك'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#d2d2c8]">
                  <span className="text-[#6e6e64] text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#14140f]" /> التقييم
                  </span>
                  <div className="flex items-center gap-1 font-medium text-[#14140f] text-sm">
                    <span>{tool.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#6e6e64]">/5</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#d2d2c8]">
                  <span className="text-[#6e6e64] text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#14140f]" /> التفاعل
                  </span>
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <span className="flex items-center gap-1 text-[#14140f]">
                      <ThumbsUp className="w-3.5 h-3.5" /> {optimisticLikeCount}
                    </span>
                    <span className="flex items-center gap-1 text-[#6e6e64]">
                      <ThumbsDown className="w-3.5 h-3.5" /> {optimisticDislikeCount}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-[28px] bg-[#ffffff] text-[#14140f] hover:border-[#14140f] transition-colors font-medium text-sm border border-[#d2d2c8]"
                  >
                    <Share2 className="w-4 h-4" /> مشاركة الأداة
                  </button>
                </div>
              </div>
            </div>

            {/* Tags Cloud */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="bg-[#f5f5eb] rounded-[28px] p-6 border border-[#d2d2c8] shadow-none">
                <h3 className="font-medium text-[#14140f] mb-4 text-xs uppercase tracking-[0.1em]">الوسوم</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] text-xs font-normal rounded-full cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Community Discussions & Experiences Section */}
        {tool && <ToolCommunityDiscussions tool={tool} />}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mt-20 border-t border-[#d2d2c8] pt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-[#14140f] tracking-tight">
                أدوات ذات صلة
              </h2>
              <Link href="/tools" className="text-xs uppercase tracking-[0.1em] font-medium text-[#14140f] hover:underline">
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

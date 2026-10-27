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
import ToolPrivacyRecommendation from '../components/tools/ToolPrivacyRecommendation';
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
  ThumbsDown,
  ArrowRight,
  ShieldCheck,
  Tag,
  MessageSquarePlus,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ToolDetailPageProps {
  initialTool?: Tool | null;
}

// Pricing Metadata Helper
const getPricingDetails = (pricing: string = 'Freemium') => {
  switch (pricing?.toLowerCase()) {
    case 'free':
      return {
        label: 'مجانية بالكامل',
        en: 'Free',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dotBg: 'bg-emerald-500'
      };
    case 'freemium':
      return {
        label: 'مجاني / مدفوع',
        en: 'Freemium',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dotBg: 'bg-blue-500'
      };
    case 'paid':
      return {
        label: 'مدفوعة بالكامل',
        en: 'Paid',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
        dotBg: 'bg-purple-500'
      };
    case 'subscription':
      return {
        label: 'اشتراك دوري',
        en: 'Subscription',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dotBg: 'bg-amber-500'
      };
    default:
      return {
        label: pricing || 'تجربة مجانية',
        en: pricing || 'Freemium',
        badgeBg: 'bg-[#f5f5eb] text-[#14140f] border-[#d2d2c8]',
        dotBg: 'bg-[#14140f]'
      };
  }
};

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
  const [showStickyDock, setShowStickyDock] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Optimistic Vote Counts
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(0);
  const [optimisticDislikeCount, setOptimisticDislikeCount] = useState(0);

  // Refs for Hard Locking to prevent double firing in Strict Mode
  const voteLock = useRef(false);
  const saveLock = useRef(false);
  const initializedRef = useRef(false);
  const attemptRef = useRef<{ [key: string]: number }>({});

  // Detect scroll to show mobile floating dock
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowStickyDock(true);
      } else {
        setShowStickyDock(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateRelatedTools = useCallback((currentTool: Tool) => {
    if (!tools || tools.length === 0) return;

    const currentCats = Array.isArray(currentTool.category)
      ? currentTool.category
      : [currentTool.category];

    const currentTags = currentTool.tags || [];

    const related = tools
      .filter((t) => {
        if (t.id === currentTool.id) return false;
        const targetCats = Array.isArray(t.category) ? t.category : [t.category];
        const sharesCategory = targetCats.some((cat) => currentCats.includes(cat));
        const sharesTag = (t.tags || []).some((tag) => currentTags.includes(tag));
        return sharesCategory || sharesTag;
      })
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
      const toolFromContext = tools.find((t) => t.id === normalizedId);
      if (toolFromContext) {
        setTool(toolFromContext);
        setLoading(false);
      }
    }
  }, [id, tools, tool]);

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
    const attemptCount = attemptRef.current[normalizedId] || 0;
    if (attemptCount > 3) {
      if (!tool) {
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

  // Handle voting with toast & lock
  const handleVote = async (voteType: 'helpful' | 'notHelpful') => {
    if (voteLock.current) return;

    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً للتصويت والتفاعل');
      return;
    }

    if (!tool?.id || isVoting) return;

    voteLock.current = true;

    const previousVote = userVote;
    const previousLikeCount = optimisticLikeCount;
    const previousDislikeCount = optimisticDislikeCount;

    let newVote: 'helpful' | 'notHelpful' | null;
    let newLikeCount = previousLikeCount;
    let newDislikeCount = previousDislikeCount;

    if (userVote === voteType) {
      newVote = null;
      if (voteType === 'helpful') newLikeCount--;
      else newDislikeCount--;
    } else {
      newVote = voteType;
      if (userVote === 'helpful') newLikeCount--;
      else if (userVote === 'notHelpful') newDislikeCount--;

      if (voteType === 'helpful') newLikeCount++;
      else newDislikeCount++;
    }

    setUserVote(newVote);
    setOptimisticLikeCount(Math.max(0, newLikeCount));
    setOptimisticDislikeCount(Math.max(0, newDislikeCount));
    setIsVoting(true);

    if (newVote === 'helpful') {
      toast.success('شكراً لمشاركتك رأيك الإيجابي! 👍');
    } else if (newVote === 'notHelpful') {
      toast('تم تسجيل تصويتك 👎');
    }

    try {
      await updateToolVote(tool.id, user.uid, voteType === 'helpful');
    } catch (error) {
      setUserVote(previousVote);
      setOptimisticLikeCount(previousLikeCount);
      setOptimisticDislikeCount(previousDislikeCount);
      console.error('Error voting:', error);
      toast.error('تعذر تسجيل التصويت، حاول مرة أخرى');
    } finally {
      setIsVoting(false);
      voteLock.current = false;
    }
  };

  // Handle saving with toast & lock
  const handleSave = async () => {
    if (saveLock.current) return;

    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً لحفظ الأداة في قائمتك المفضلة');
      return;
    }
    if (!tool?.id) return;

    saveLock.current = true;
    setIsSaving(true);

    const isCurrentlySaved = tool.savedBy?.includes(user.uid) || false;
    const nextSavedState = !isCurrentlySaved;

    // Optimistic state
    const prevSavedBy = tool.savedBy || [];
    const newSavedBy = nextSavedState
      ? [...prevSavedBy, user.uid]
      : prevSavedBy.filter((uid) => uid !== user.uid);

    setTool((prev) => (prev ? { ...prev, savedBy: newSavedBy } : prev));

    if (nextSavedState) {
      toast.success('تمت إضافة الأداة إلى المفضلة 🔖');
    } else {
      toast('تمت إزالة الأداة من المفضلة');
    }

    try {
      await updateToolSave(tool.id, user.uid, nextSavedState);
    } catch (error) {
      setTool((prev) => (prev ? { ...prev, savedBy: prevSavedBy } : prev));
      console.error('Error saving tool:', error);
      toast.error('تعذر حفظ الأداة، يرجى المحاولة لاحقاً');
    } finally {
      setIsSaving(false);
      saveLock.current = false;
    }
  };

  // Copy Tool Link
  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toast.success('تم نسخ رابط الأداة بنجاح! 🔗');
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      setIsShareModalOpen(true);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3 text-center px-4" dir="rtl">
          <Loader className="w-8 h-8 animate-spin text-[#14140f]" />
          <p className="text-xs text-[#6e6e64] font-medium">جاري تجهيز بيانات الأداة...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !tool) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center" dir="rtl">
          <div className="w-14 h-14 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#14140f] mb-4">
            <XCircle className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14140f]">الأداة غير موجودة</h1>
          <p className="text-xs sm:text-sm text-[#6e6e64] mt-2 mb-6">
            قد يكون تم نقل الأداة أو تعديل اسمها أو أنها لم تعد متوفرة في الدليل حالياً.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] text-xs sm:text-sm font-medium transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>تصفح جميع الأدوات المتاحة</span>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const primaryCategory = Array.isArray(tool.category) ? tool.category[0] : (tool.category || 'عام');
  const pricingInfo = getPricingDetails(tool.pricing);
  const isSaved = tool.savedBy?.includes(user?.uid || '') || false;
  const ratingValue = (tool.rating ?? 4.8).toFixed(1);

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#ffffff] selection:bg-[#beff50] selection:text-[#14140f] pb-32 sm:pb-36" dir="rtl">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-8">

          {/* ========================================================= */}
          {/* 1. RESPONSIVE BREADCRUMBS & NAVIGATION                    */}
          {/* ========================================================= */}
          <nav className="mb-4 sm:mb-8 flex items-center justify-between gap-2 text-xs text-[#6e6e64] overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/" className="hover:text-[#14140f] transition-colors">
                الرئيسية
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0 text-[#a0a096]" />
              <Link href="/tools" className="hover:text-[#14140f] transition-colors">
                الأدوات
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0 text-[#a0a096]" />
              <Link
                href={`/tools?category=${encodeURIComponent(primaryCategory)}`}
                className="hover:text-[#14140f] transition-colors max-w-[120px] sm:max-w-none truncate"
              >
                {primaryCategory}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0 text-[#a0a096]" />
              <span className="text-[#14140f] font-bold line-clamp-1 max-w-[140px] sm:max-w-none">
                {tool.name}
              </span>
            </div>

            {/* Quick Share / Copy Icon */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopyLink}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-[#f5f5eb] hover:bg-[#ffffff] text-[#14140f] border border-[#d2d2c8] text-xs flex items-center gap-1 transition-colors"
                title="نسخ الرابط"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span className="hidden sm:inline text-[11px]">نسخ الرابط</span>
              </button>
            </div>
          </nav>

          {/* ========================================================= */}
          {/* 2. RESPONSIVE HERO CARD                                   */}
          {/* ========================================================= */}
          <div className="bg-[#f5f5eb] rounded-2xl sm:rounded-[28px] p-4 sm:p-7 md:p-10 border border-[#d2d2c8] relative overflow-hidden mb-6 sm:mb-8">
            <div className="relative z-10">

              {/* Top Row: Logo + Info (Mobile Responsive Flow) */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8 text-center sm:text-right">
                
                {/* Logo Box */}
                <div className="shrink-0">
                  <div className="p-2 sm:p-2.5 rounded-2xl sm:rounded-[22px] bg-[#ffffff] border border-[#d2d2c8] shadow-xs">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
                      <ToolImage
                        name={tool.name}
                        categoryName={primaryCategory}
                        subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory?.[0] : tool.subcategory}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Info & Title & Badges */}
                <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#14140f] tracking-tight">
                      {tool.name}
                    </h1>

                    {/* Featured / Pricing Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tool.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#beff50] text-[#14140f] border border-[#14140f] rounded-full text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" /> مميزة
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${pricingInfo.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pricingInfo.dotBg}`} />
                        <span>{pricingInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Concise Description */}
                  <p className="text-xs sm:text-base md:text-lg text-[#6e6e64] leading-relaxed max-w-3xl">
                    {tool.description}
                  </p>

                  {/* Primary CTA & Interactive Action Bar */}
                  <div className="pt-2 flex flex-col xs:flex-row flex-wrap items-stretch sm:items-center justify-center sm:justify-start gap-2 sm:gap-3">
                    
                    {/* Primary Button: Visit Website */}
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full text-[#14140f] bg-[#beff50] hover:bg-[#abf03c] border border-[#14140f] font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>زيارة الموقع الرسمي</span>
                    </a>

                    {/* Segmented Votes Pill (Helpful / Not Helpful) */}
                    <div className="inline-flex items-center justify-center rounded-full bg-[#ffffff] border border-[#d2d2c8] p-1 gap-1">
                      {/* Like */}
                      <button
                        onClick={() => handleVote('helpful')}
                        disabled={isVoting}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                          userVote === 'helpful'
                            ? 'bg-[#beff50] text-[#14140f] font-bold border border-[#14140f]'
                            : 'text-[#14140f] hover:bg-[#f5f5eb]'
                        }`}
                        title="أعجبني هذا البرنامج"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="tabular-nums font-mono text-[11px] font-bold">{optimisticLikeCount}</span>
                      </button>

                      <div className="w-px h-4 bg-[#d2d2c8]" />

                      {/* Dislike */}
                      <button
                        onClick={() => handleVote('notHelpful')}
                        disabled={isVoting}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                          userVote === 'notHelpful'
                            ? 'bg-[#14140f] text-[#ffffff] font-bold'
                            : 'text-[#6e6e64] hover:text-[#14140f] hover:bg-[#f5f5eb]'
                        }`}
                        title="لم يعجبني"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span className="tabular-nums font-mono text-[11px]">{optimisticDislikeCount}</span>
                      </button>
                    </div>

                    {/* Bookmark / Save Button */}
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full border transition-all text-xs font-medium cursor-pointer ${
                        isSaved
                          ? 'bg-[#beff50] border-[#14140f] text-[#14140f] font-bold'
                          : 'bg-[#ffffff] border-[#d2d2c8] hover:border-[#14140f] text-[#14140f]'
                      }`}
                      title={isSaved ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                      aria-label="حفظ الأداة"
                    >
                      {isSaved ? <BookmarkMinus className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                      <span className="hidden xs:inline">{isSaved ? 'محفوظة' : 'حفظ'}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] text-[#14140f] text-xs font-medium transition-colors cursor-pointer"
                      title="مشاركة الأداة"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden xs:inline">مشاركة</span>
                    </button>

                  </div>

                </div>
              </div>

              {/* Quick Feature Chips Row */}
              {tool.features && tool.features.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#d2d2c8]/70 flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                  {tool.features.slice(0, 5).map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 sm:px-3 py-1 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] text-[11px] sm:text-xs font-normal flex items-center gap-1.5 shadow-none"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#14140f]" /> {f}
                    </span>
                  ))}
                  {Array.isArray(tool.category) ? (
                    tool.category.map((cat, idx) => (
                      <Link
                        key={`cat-${idx}`}
                        href={`/tools?category=${encodeURIComponent(cat)}`}
                        className="px-2.5 sm:px-3 py-1 rounded-full bg-[#ffffff] hover:bg-[#beff50] border border-[#d2d2c8] hover:border-[#14140f] text-[#14140f] text-[11px] sm:text-xs transition-colors"
                      >
                        {cat}
                      </Link>
                    ))
                  ) : (
                    <Link
                      href={`/tools?category=${encodeURIComponent(tool.category)}`}
                      className="px-2.5 sm:px-3 py-1 rounded-full bg-[#ffffff] hover:bg-[#beff50] border border-[#d2d2c8] hover:border-[#14140f] text-[#14140f] text-[11px] sm:text-xs transition-colors"
                    >
                      {tool.category}
                    </Link>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. RESPONSIVE QUICK SPECS STRIP                           */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-8">
            {/* Metric 1: Pricing */}
            <div className="bg-[#f5f5eb] rounded-2xl p-3.5 sm:p-4 border border-[#d2d2c8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#6e6e64] block font-medium">التسعير</span>
                <span className="text-xs sm:text-sm font-bold text-[#14140f] truncate block">
                  {pricingInfo.label}
                </span>
              </div>
            </div>

            {/* Metric 2: Rating */}
            <div className="bg-[#f5f5eb] rounded-2xl p-3.5 sm:p-4 border border-[#d2d2c8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-amber-500 shrink-0">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#6e6e64] block font-medium">التقييم</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-bold text-[#14140f] font-mono">{ratingValue}</span>
                  <span className="text-[10px] text-[#a0a096]">/5</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Category */}
            <div className="bg-[#f5f5eb] rounded-2xl p-3.5 sm:p-4 border border-[#d2d2c8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#6e6e64] block font-medium">التصنيف</span>
                <span className="text-xs sm:text-sm font-bold text-[#14140f] truncate block">
                  {primaryCategory}
                </span>
              </div>
            </div>

            {/* Metric 4: Community Trust */}
            <div className="bg-[#f5f5eb] rounded-2xl p-3.5 sm:p-4 border border-[#d2d2c8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#6e6e64] block font-medium">التحقق</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700 truncate block">
                  رابط موثق ورسمي
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. MAIN CONTENT & SIDEBAR GRID                            */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

            {/* MAIN CONTENT (8 cols on desktop, full width on mobile) */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">

              {/* Detailed Description */}
              <div className="bg-[#f5f5eb] rounded-2xl sm:rounded-[28px] p-5 sm:p-7 md:p-8 border border-[#d2d2c8]">
                <h2 className="text-base sm:text-lg font-bold text-[#14140f] mb-3 sm:mb-4 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-[#14140f]" />
                  <span>نبذة تفصيلية عن الأداة</span>
                </h2>
                <div className="text-[#14140f] leading-relaxed text-xs sm:text-sm md:text-base font-normal space-y-3">
                  {(tool.longDescription || tool.description)
                    .split('\n')
                    .filter((p) => p.trim())
                    .map((paragraph, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>

              {/* Pros & Cons (Responsive Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Pros */}
                {tool.pros && tool.pros.length > 0 ? (
                  <div className="bg-[#f5f5eb] rounded-2xl sm:rounded-[28px] p-5 sm:p-7 border border-emerald-200/80">
                    <h3 className="text-sm sm:text-base font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      <span>النقاط الإيجابية</span>
                    </h3>
                    <ul className="space-y-2">
                      {tool.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#14140f]">
                          <span className="text-emerald-600 font-bold mt-0.5">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Cons / Points of Improvement */}
                {tool.cons && tool.cons.length > 0 ? (
                  <div className="bg-[#f5f5eb] rounded-2xl sm:rounded-[28px] p-5 sm:p-7 border border-amber-200/80">
                    <h3 className="text-sm sm:text-base font-bold text-amber-800 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                      <span>نقاط يجب مراعاتها</span>
                    </h3>
                    <ul className="space-y-2">
                      {tool.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#6e6e64]">
                          <span className="text-amber-600 font-bold mt-0.5">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

              </div>

              {/* Mobile-Friendly Tags Section */}
              {tool.tags && tool.tags.length > 0 && (
                <div className="bg-[#f5f5eb] rounded-2xl sm:rounded-[28px] p-5 sm:p-7 border border-[#d2d2c8]">
                  <h3 className="text-xs sm:text-sm font-bold text-[#14140f] mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" />
                    <span>الوسوم والكلمات الدلالية</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {tool.tags.map((tag, i) => (
                      <Link
                        key={i}
                        href={`/tools?search=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 bg-[#ffffff] hover:bg-[#beff50] border border-[#d2d2c8] hover:border-[#14140f] text-[#14140f] text-xs font-normal rounded-full transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* SIDEBAR (4 cols on desktop, clean complementary widgets) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Desktop Sticky Info Card */}
              <div className="bg-[#f5f5eb] rounded-2xl sm:rounded-[28px] p-5 sm:p-6 border border-[#d2d2c8] sticky top-24">
                <h3 className="font-bold text-[#14140f] mb-4 text-sm sm:text-base">
                  معلومات ومواصفات الأداة
                </h3>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#d2d2c8]">
                    <span className="text-[#6e6e64] text-xs sm:text-sm flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-[#14140f]" /> نموذج التسعير
                    </span>
                    <span className="font-bold text-[#14140f] text-xs sm:text-sm">
                      {pricingInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#d2d2c8]">
                    <span className="text-[#6e6e64] text-xs sm:text-sm flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-[#14140f]" /> تقييم الأداة
                    </span>
                    <div className="flex items-center gap-1 font-bold text-[#14140f] text-xs sm:text-sm">
                      <span>{ratingValue}</span>
                      <span className="text-[11px] text-[#6e6e64]">/5</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#d2d2c8]">
                    <span className="text-[#6e6e64] text-xs sm:text-sm flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#14140f]" /> تصويت المجتمع
                    </span>
                    <div className="flex items-center gap-3 font-medium text-xs sm:text-sm">
                      <span className="flex items-center gap-1 text-[#14140f]">
                        <ThumbsUp className="w-3 h-3 text-emerald-600" /> {optimisticLikeCount}
                      </span>
                      <span className="flex items-center gap-1 text-[#6e6e64]">
                        <ThumbsDown className="w-3 h-3 text-rose-500" /> {optimisticDislikeCount}
                      </span>
                    </div>
                  </div>

                  {/* Direct Website Link Button */}
                  <div className="pt-2">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] font-bold text-xs sm:text-sm transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4 text-[#beff50]" />
                      <span>فتح الموقع الرسمي ↗</span>
                    </a>
                  </div>

                  {/* Share Trigger */}
                  <div>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-full bg-[#ffffff] text-[#14140f] hover:border-[#14140f] transition-colors font-medium text-xs sm:text-sm border border-[#d2d2c8] cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>مشاركة الأداة مع زملائك</span>
                    </button>
                  </div>
                </div>

                {/* Community Prompt CTA Box */}
                <div className="mt-6 pt-5 border-t border-[#d2d2c8] space-y-2.5">
                  <span className="text-[11px] font-bold text-[#14140f] flex items-center gap-1.5">
                    <MessageSquarePlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>هل جربت هذه الأداة؟</span>
                  </span>
                  <p className="text-[11px] text-[#6e6e64] leading-relaxed">
                    شارك تجربتك أو اطرح سؤالك ليجيبك خبراء ومطورو مجتمع تولزي.
                  </p>
                  <Link
                    href={`/community?mention=${encodeURIComponent(tool.name)}&toolId=${encodeURIComponent(tool.id)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span>ابدأ نقاشاً حول {tool.name}</span>
                    <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </Link>
                </div>
              </div>

              {/* Contextual Tool Privacy Recommendation (Only renders if tool passed audit) */}
              <ToolPrivacyRecommendation tool={tool} />

            </div>

          </div>

          {/* ========================================================= */}
          {/* 5. COMMUNITY DISCUSSIONS & EXPERIENCES                     */}
          {/* ========================================================= */}
          {tool && <ToolCommunityDiscussions tool={tool} />}

          {/* ========================================================= */}
          {/* 6. RELATED & ALTERNATIVE TOOLS                            */}
          {/* ========================================================= */}
          {relatedTools.length > 0 && (
            <div className="mt-12 sm:mt-20 border-t border-[#d2d2c8] pt-8 sm:pt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-[#14140f] tracking-tight">
                    أدوات بديلة وذات صلة
                  </h2>
                  <p className="text-xs text-[#6e6e64] mt-0.5">
                    أدوات تخدم تصنيف {primaryCategory} يمكنك المقارنة بينها
                  </p>
                </div>
                <Link
                  href={`/tools?category=${encodeURIComponent(primaryCategory)}`}
                  className="text-xs font-bold text-[#14140f] hover:underline shrink-0"
                >
                  عرض المزيد ↗
                </Link>
              </div>

              {/* Disable Infinite Scroll to avoid triggering loadMore in tool page */}
              <ToolsGrid tools={relatedTools} enableInfiniteScroll={false} />
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* 7. STICKY MOBILE BOTTOM ACTION DOCK                       */}
        {/* ========================================================= */}
        <AnimatePresence>
          {showStickyDock && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed bottom-[74px] sm:bottom-6 left-3 right-3 z-40 max-w-lg mx-auto"
            >
              <div className="bg-[#14140f]/95 backdrop-blur-md text-[#ffffff] border border-[#beff50]/30 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2.5">
                
                {/* Mini Tool Info */}
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <div className="w-8 h-8 rounded-xl bg-[#ffffff] p-1 shrink-0 flex items-center justify-center">
                    <ToolImage
                      name={tool.name}
                      categoryName={primaryCategory}
                      size="sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#ffffff] truncate">
                      {tool.name}
                    </p>
                    <span className="text-[10px] text-[#beff50] font-mono">
                      {pricingInfo.label}
                    </span>
                  </div>
                </div>

                {/* Dock Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleSave}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isSaved ? 'bg-[#beff50] text-[#14140f]' : 'bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-white'
                    }`}
                    title={isSaved ? 'محفوظة' : 'حفظ'}
                  >
                    {isSaved ? <BookmarkMinus className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2 rounded-xl bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-white transition-colors cursor-pointer"
                    title="مشاركة"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#beff50] text-[#14140f] font-bold text-xs hover:bg-[#abf03c] transition-colors"
                  >
                    <span>زيارة الأداة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Tool Modal */}
        {isShareModalOpen && tool && (
          <ShareToolModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            tool={tool}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default ToolDetailPageNew;

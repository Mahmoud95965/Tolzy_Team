"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  XCircle, 
  ThumbsUp, 
  ThumbsDown,
  DollarSign,
  Award,
  Sparkles,
  Share2,
  ChevronLeft,
  ArrowLeftRight
} from 'lucide-react';
import { Tool } from '../../types/tool';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';
import { useCompare } from '@/src/context/CompareContext';
import { updateToolVote, updateToolSave } from '../../services/tool-actions.service';
import ToolImage from '../common/ToolImage';
import { toast } from 'react-hot-toast';

interface ToolDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool | null;
}

const ToolDrawer: React.FC<ToolDrawerProps> = ({ isOpen, onClose, tool }) => {
  const { user } = useAuth();
  const { getRelatedTools, updateTool } = useTools();
  const { toggleCompare, isInCompare, openModal } = useCompare();

  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [userVote, setUserVote] = useState<'helpful' | 'notHelpful' | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(0);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection for bottom-sheet animation
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hard Locks for double triggers (Strict Mode)
  const saveLock = useRef(false);
  const voteLock = useRef(false);

  // Sync state on tool change
  useEffect(() => {
    if (tool) {
      setIsSaved(user ? (tool.savedBy?.includes(user.uid) || false) : false);
      setSavedCount(tool.savedBy?.length || 0);

      // Set user vote
      if (user && tool.votes) {
        if (tool.votes.helpful?.includes(user.uid)) {
          setUserVote('helpful');
        } else if (tool.votes.notHelpful?.includes(user.uid)) {
          setUserVote('notHelpful');
        } else {
          setUserVote(null);
        }
      } else {
        setUserVote(null);
      }

      setHelpfulCount(tool.votingStats?.helpfulCount ?? tool.votes?.helpful?.length ?? 0);
      setNotHelpfulCount(tool.votingStats?.notHelpfulCount ?? tool.votes?.notHelpful?.length ?? 0);
    }
  }, [tool, user]);

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!tool) return null;

  const relatedTools = getRelatedTools ? getRelatedTools(tool, 3) : [];

  // Bookmarking Action
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('يجب تسجيل الدخول لحفظ الأداة');
      return;
    }

    if (saveLock.current) return;
    saveLock.current = true;

    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);
    setSavedCount(prev => (nextSavedState ? prev + 1 : prev - 1));

    try {
      await updateToolSave(tool.id, user.uid, nextSavedState);
      const currentSavedBy = tool.savedBy || [];
      const newSavedBy = nextSavedState
        ? [...currentSavedBy, user.uid]
        : currentSavedBy.filter(id => id !== user.uid);

      updateTool(tool.id, { savedBy: newSavedBy });
      toast.success(nextSavedState ? 'تم حفظ الأداة بنجاح' : 'تم إلغاء حفظ الأداة');
    } catch (error: any) {
      setIsSaved(isSaved);
      setSavedCount(prev => (isSaved ? prev + 1 : prev - 1));
      toast.error('فشل في حفظ الأداة، يرجى المحاولة لاحقاً');
    } finally {
      saveLock.current = false;
    }
  };

  // Voting Action (Helpful / Not Helpful)
  const handleVote = async (voteType: 'helpful' | 'notHelpful') => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للتصويت');
      return;
    }

    if (voteLock.current) return;
    voteLock.current = true;
    setIsActionInProgress(true);

    const previousVote = userVote;
    const previousHelpful = helpfulCount;
    const previousNotHelpful = notHelpfulCount;

    let newVote: 'helpful' | 'notHelpful' | null = null;
    let nextHelpful = helpfulCount;
    let nextNotHelpful = notHelpfulCount;

    if (userVote === voteType) {
      newVote = null;
      if (voteType === 'helpful') nextHelpful--;
      else nextNotHelpful--;
    } else {
      newVote = voteType;
      if (userVote === 'helpful') nextHelpful--;
      else if (userVote === 'notHelpful') nextNotHelpful--;

      if (voteType === 'helpful') nextHelpful++;
      else nextNotHelpful++;
    }

    // Optimistic UI Update
    setUserVote(newVote);
    setHelpfulCount(Math.max(0, nextHelpful));
    setNotHelpfulCount(Math.max(0, nextNotHelpful));

    try {
      await updateToolVote(tool.id, user.uid, voteType === 'helpful');
      
      // Update globally
      const helpfulArray = tool.votes?.helpful || [];
      const notHelpfulArray = tool.votes?.notHelpful || [];
      
      const newHelpful = voteType === 'helpful' && userVote !== 'helpful'
        ? [...helpfulArray, user.uid]
        : helpfulArray.filter(uid => uid !== user.uid);

      const newNotHelpful = voteType === 'notHelpful' && userVote !== 'notHelpful'
        ? [...notHelpfulArray, user.uid]
        : notHelpfulArray.filter(uid => uid !== user.uid);

      updateTool(tool.id, {
        votes: { helpful: newHelpful, notHelpful: newNotHelpful },
        votingStats: {
          helpfulCount: newHelpful.length,
          notHelpfulCount: newNotHelpful.length,
          totalVotes: newHelpful.length + newNotHelpful.length
        }
      });
    } catch (error) {
      setUserVote(previousVote);
      setHelpfulCount(previousHelpful);
      setNotHelpfulCount(previousNotHelpful);
      toast.error('حدث خطأ أثناء إرسال تصويتك');
    } finally {
      setIsActionInProgress(false);
      voteLock.current = false;
    }
  };

  const shareLink = () => {
    const url = `https://tolzy.me/tools/${tool.id}`;
    if (navigator.share) {
      navigator.share({
        title: tool.name,
        text: tool.description,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط الأداة للمشاركة!');
    }
  };

  const primaryCategory = Array.isArray(tool.category) ? tool.category[0] : tool.category;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#14140f]/60 z-50 transition-opacity"
          />

          {/* Sliding Panel / Mobile Bottom Sheet */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { x: '-100%', opacity: 0.95 }}
            animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { x: '-100%', opacity: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 max-h-[90vh] sm:max-h-full sm:inset-y-0 sm:left-0 sm:right-auto w-full sm:max-w-xl bg-[#ffffff] text-[#14140f] border-t sm:border-t-0 sm:border-r border-[#d2d2c8] rounded-t-[28px] sm:rounded-none z-50 shadow-2xl sm:shadow-none flex flex-col text-right select-none overflow-hidden"
            dir="rtl"
          >
            {/* Mobile Sheet Drag Handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#f5f5eb]">
              <div className="w-12 h-1.5 rounded-full bg-[#d2d2c8]" />
            </div>

            {/* Header Control Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#d2d2c8] bg-[#f5f5eb]">
              <button 
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] hover:border-[#14140f] transition-colors"
                aria-label="إغلاق النافذة"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h2 className="text-sm sm:text-base font-bold text-[#14140f] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#14140f]" />
                مراجعة الأداة
              </h2>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 no-scrollbar pb-28">
              
              {/* Profile Card */}
              <div className="bg-[#f5f5eb] border border-[#d2d2c8] p-4 sm:p-6 rounded-[20px] sm:rounded-[28px]">
                <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5">
                  <div className="p-2 rounded-[16px] sm:rounded-[18px] bg-[#ffffff] border border-[#d2d2c8] shrink-0">
                    <ToolImage
                      name={tool.name}
                      categoryName={primaryCategory}
                      subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory?.[0] : tool.subcategory}
                      size="md"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-right space-y-1.5 sm:space-y-2">
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-[#14140f] tracking-tight">{tool.name}</h3>
                      {tool.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#beff50] text-[#14140f] rounded-full text-[10px] font-bold uppercase tracking-[0.05em]">
                          <Award className="w-3 h-3" /> مميز
                        </span>
                      )}
                    </div>
                    
                    {/* Stars and counts: Strict Real Data */}
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      {tool.rating && tool.rating > 0 ? (
                        <>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                  i < Math.floor(tool.rating)
                                    ? 'text-[#14140f] fill-[#14140f]'
                                    : 'text-[#d2d2c8]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-normal text-[#6e6e64] mr-2">
                            {tool.rating.toFixed(1)} {tool.reviewCount && tool.reviewCount > 0 ? `(${tool.reviewCount} مراجعة)` : ''}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-normal text-[#6e6e64] bg-[#ffffff] border border-[#d2d2c8] px-3 py-0.5 rounded-full">
                          أداة جديدة
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs font-medium text-[#14140f] bg-[#ffffff] border border-[#d2d2c8] px-3 py-1 rounded-full inline-block">
                      {primaryCategory}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] rounded-full font-bold text-xs sm:text-sm transition-colors shadow-none"
                >
                  <span>زيارة الموقع</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>

                <button
                  onClick={handleSave}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 border rounded-full font-bold text-xs sm:text-sm transition-colors ${
                    isSaved
                      ? 'bg-[#beff50]/20 border-[#14140f] text-[#14140f]'
                      : 'bg-[#ffffff] border-[#d2d2c8] text-[#14140f] hover:border-[#14140f]'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                      <span>محفوظ ({savedCount})</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>حفظ</span>
                    </>
                  )}
                </button>
              </div>

              {/* Compare Button */}
              <button
                onClick={() => {
                  toggleCompare(tool);
                  openModal();
                }}
                className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-full border text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isInCompare(tool.id)
                    ? 'bg-[#beff50] border-[#14140f] text-[#14140f]'
                    : 'bg-[#f5f5eb] border-[#d2d2c8] text-[#14140f] hover:border-[#14140f]'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isInCompare(tool.id) ? 'الأداة في قائمة المقارنة (فتح الجدول)' : 'مقارنة هذه الأداة مع أدوات أخرى'}</span>
              </button>

              {/* Quick Specs Cards */}
              <div className="grid grid-cols-3 gap-4 bg-[#f5f5eb] border border-[#d2d2c8] p-4 rounded-[18px] text-center">
                <div className="space-y-1 border-l border-[#d2d2c8] last:border-none">
                  <span className="text-[10px] font-medium text-[#6e6e64] block uppercase tracking-[0.05em]">التسعير</span>
                  <span className="text-xs font-medium text-[#14140f] flex items-center justify-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#14140f]" />
                    {tool.pricing === 'Free' ? 'مجاني' : tool.pricing === 'Freemium' ? 'مزيج' : 'مدفوع'}
                  </span>
                </div>

                <div className="space-y-1 border-l border-[#d2d2c8] last:border-none">
                  <span className="text-[10px] font-medium text-[#6e6e64] block uppercase tracking-[0.05em]">التفاعل</span>
                  <div className="flex items-center justify-center gap-2.5 text-[11px] font-medium text-[#14140f]">
                    <span>+{helpfulCount}</span>
                    <span className="text-[#6e6e64]">-{notHelpfulCount}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-[#6e6e64] block uppercase tracking-[0.05em]">مشاركة</span>
                  <button 
                    onClick={shareLink}
                    className="mx-auto flex items-center justify-center p-1 rounded-full text-[#6e6e64] hover:text-[#14140f] transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Review / Long Description Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[#14140f] uppercase tracking-[0.05em]">نظرة عامة ومراجعة</h4>
                <p className="text-[#14140f] text-sm leading-relaxed font-normal whitespace-pre-line text-justify">
                  {tool.longDescription || tool.description}
                </p>
              </div>

              {/* Detailed Pros & Cons Grid */}
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {/* Pros */}
                {tool.pros && tool.pros.length > 0 && (
                  <div className="bg-[#f5f5eb] border border-[#d2d2c8] p-3.5 sm:p-5 rounded-[16px] sm:rounded-[18px] space-y-2">
                    <h5 className="text-[#14140f] text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#14140f]" />
                      النقاط الإيجابية والمميزات
                    </h5>
                    <ul className="space-y-1.5 text-[#14140f] text-xs font-normal leading-relaxed">
                      {tool.pros.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#14140f] mt-0.5">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cons */}
                {tool.cons && tool.cons.length > 0 && (
                  <div className="bg-[#f5f5eb] border border-[#d2d2c8] p-3.5 sm:p-5 rounded-[16px] sm:rounded-[18px] space-y-2">
                    <h5 className="text-[#6e6e64] text-xs font-bold flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-[#6e6e64]" />
                      نقاط بحاجة للتحسين / العيوب
                    </h5>
                    <ul className="space-y-1.5 text-[#6e6e64] text-xs font-normal leading-relaxed">
                      {tool.cons.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#6e6e64] mt-0.5">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Voting Feedbacks Widget */}
              <div className="bg-[#f5f5eb] border border-[#d2d2c8] p-4 sm:p-5 rounded-[20px] sm:rounded-[28px] space-y-3 text-center">
                <h5 className="text-xs font-bold text-[#14140f]">هل تجد مراجعة هذه الأداة مفيدة؟</h5>
                <div className="flex justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handleVote('helpful')}
                    disabled={isActionInProgress}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-full border text-xs transition-colors cursor-pointer ${
                      userVote === 'helpful'
                        ? 'bg-[#beff50] border-[#14140f] text-[#14140f] font-bold'
                        : 'bg-[#ffffff] border-[#d2d2c8] text-[#14140f] hover:border-[#14140f] font-medium'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>مفيد ({helpfulCount})</span>
                  </button>

                  <button
                    onClick={() => handleVote('notHelpful')}
                    disabled={isActionInProgress}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-full border text-xs transition-colors cursor-pointer ${
                      userVote === 'notHelpful'
                        ? 'bg-[#14140f] border-[#14140f] text-[#ffffff] font-bold'
                        : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f] hover:border-[#14140f] font-medium'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>غير مفيد ({notHelpfulCount})</span>
                  </button>
                </div>
              </div>

              {/* Related Tools discovery list */}
              {relatedTools.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#d2d2c8]">
                  <h4 className="text-xs font-medium text-[#14140f] uppercase tracking-[0.05em]">أدوات ذات صلة قد تهمك</h4>
                  <div className="space-y-2">
                    {relatedTools.map((relatedTool) => {
                      const relPricing = relatedTool.pricing === 'Free' ? 'مجاني' : 'مزيج';
                      return (
                        <div 
                          key={relatedTool.id}
                          className="flex items-center gap-4 p-3 rounded-[18px] bg-[#f5f5eb] border border-[#d2d2c8] hover:border-[#14140f] transition-colors cursor-pointer"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('open-tool-drawer', { detail: relatedTool }));
                          }}
                        >
                          <ToolImage
                            name={relatedTool.name}
                            categoryName={Array.isArray(relatedTool.category) ? relatedTool.category[0] : relatedTool.category}
                            subcategoryName={Array.isArray(relatedTool.subcategory) ? relatedTool.subcategory?.[0] : relatedTool.subcategory}
                            size="md"
                          />
                          <div className="flex-1 text-right space-y-0.5">
                            <h5 className="text-xs font-medium text-[#14140f]">{relatedTool.name}</h5>
                            <span className="text-[10px] font-normal text-[#6e6e64]">{relPricing}</span>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-[#6e6e64]" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ToolDrawer;

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
  ChevronLeft
} from 'lucide-react';
import { Tool } from '../../types/tool';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';
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

  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [userVote, setUserVote] = useState<'helpful' | 'notHelpful' | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(0);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Sliding Glassmorphic Panel (slides from the left for RTL natural aesthetic) */}
          <motion.div
            initial={{ x: '-100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="fixed inset-y-0 left-0 w-full sm:max-w-xl bg-slate-950/90 dark:bg-[#090a0f]/90 border-r border-white/5 backdrop-blur-2xl z-50 shadow-2xl flex flex-col text-right select-none overflow-hidden"
            dir="rtl"
          >
            {/* Header Control Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/40 backdrop-blur-md">
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                مراجعة الأداة الذكية
              </h2>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar pb-24">
              
              {/* Profile Card & Glass Square Icon */}
              <div className="relative bg-white/5 dark:bg-white/5 border border-white/5 p-6 rounded-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                  {/* Small Glass Square Icon */}
                  <div className="p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner">
                    <ToolImage
                      imageUrl={tool.imageUrl}
                      name={tool.name}
                      categoryName={primaryCategory}
                      size="lg"
                      className="rounded-xl object-cover"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-right space-y-2">
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                      <h3 className="text-2xl font-black text-white tracking-tight">{tool.name}</h3>
                      {tool.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-black uppercase">
                          <Award className="w-2.5 h-2.5" /> مميز
                        </span>
                      )}
                    </div>
                    
                    {/* Stars and counts */}
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4.5 w-4.5 ${
                              i < Math.floor(tool.rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-400 mr-2">
                        {tool.rating.toFixed(1)} ({tool.reviewCount} مراجعة)
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md inline-block">
                      {primaryCategory}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-3 gap-3">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-indigo-600/20"
                >
                  <span>زيارة الموقع</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={handleSave}
                  className={`flex items-center justify-center gap-2 py-4 border rounded-2xl font-black text-sm transition-all duration-300 ${
                    isSaved
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 fill-current" />
                      <span>محفوظ ({savedCount})</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>حفظ الأداة</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Specs Cards */}
              <div className="grid grid-cols-3 gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                <div className="space-y-1 border-l border-white/5 last:border-none">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">التسعير</span>
                  <span className="text-xs font-black text-white flex items-center justify-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                    {tool.pricing === 'Free' ? 'مجاني' : tool.pricing === 'Freemium' ? 'مزيج' : 'مدفوع'}
                  </span>
                </div>

                <div className="space-y-1 border-l border-white/5 last:border-none">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">التفاعل</span>
                  <div className="flex items-center justify-center gap-2.5 text-[11px] font-black text-white">
                    <span className="text-emerald-400">+{helpfulCount}</span>
                    <span className="text-rose-400">-{notHelpfulCount}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">مشاركة</span>
                  <button 
                    onClick={shareLink}
                    className="mx-auto flex items-center justify-center p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Review / Long Description Section */}
              <div className="space-y-3">
                <h4 className="text-base font-black text-white border-r-4 border-indigo-500 pr-3">نظرة عامة ومراجعة مفصلة</h4>
                <p className="text-slate-300 text-sm leading-8 font-bold whitespace-pre-line text-justify">
                  {tool.longDescription || tool.description}
                </p>
              </div>

              {/* Detailed Pros & Cons Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Pros */}
                {tool.pros && tool.pros.length > 0 && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl space-y-3">
                    <h5 className="text-emerald-400 text-xs font-black flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      النقاط الإيجابية والمميزات
                    </h5>
                    <ul className="space-y-2 text-slate-300 text-xs font-bold leading-6">
                      {tool.pros.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cons */}
                {tool.cons && tool.cons.length > 0 && (
                  <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl space-y-3">
                    <h5 className="text-rose-400 text-xs font-black flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      نقاط بحاجة للتحسين / العيوب
                    </h5>
                    <ul className="space-y-2 text-slate-300 text-xs font-bold leading-6">
                      {tool.cons.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 mt-1">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Voting Feedbacks Widget */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4 text-center">
                <h5 className="text-xs font-black text-white">هل تجد مراجعة هذه الأداة مفيدة؟</h5>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleVote('helpful')}
                    disabled={isActionInProgress}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-xs font-black transition-all duration-200 ${
                      userVote === 'helpful'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>مفيد ({helpfulCount})</span>
                  </button>

                  <button
                    onClick={() => handleVote('notHelpful')}
                    disabled={isActionInProgress}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-xs font-black transition-all duration-200 ${
                      userVote === 'notHelpful'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>غير مفيد ({notHelpfulCount})</span>
                  </button>
                </div>
              </div>

              {/* Related Tools discovery list */}
              {relatedTools.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-sm font-black text-white">أدوات ذات صلة قد تهمك</h4>
                  <div className="space-y-3">
                    {relatedTools.map((relatedTool) => {
                      const relPricing = relatedTool.pricing === 'Free' ? 'مجاني' : 'مزيج';
                      return (
                        <div 
                          key={relatedTool.id}
                          className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                          onClick={() => {
                            // Close and re-open drawer with the new tool!
                            // Custom window event can trigger this smoothly
                            window.dispatchEvent(new CustomEvent('open-tool-drawer', { detail: relatedTool }));
                          }}
                        >
                          <ToolImage
                            imageUrl={relatedTool.imageUrl}
                            name={relatedTool.name}
                            categoryName={Array.isArray(relatedTool.category) ? relatedTool.category[0] : relatedTool.category}
                            size="md"
                            className="rounded-lg object-cover"
                          />
                          <div className="flex-1 text-right space-y-1">
                            <h5 className="text-xs font-black text-white">{relatedTool.name}</h5>
                            <span className="text-[10px] font-bold text-slate-500">{relPricing}</span>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-slate-500" />
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

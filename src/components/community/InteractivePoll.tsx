'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, CheckCircle2, Swords, Sparkles, Users } from 'lucide-react';
import ToolImage from '../common/ToolImage';
import { CommunityPoll, PollOption } from '../../types/community';
import { toast } from 'react-hot-toast';
import { soundEffects } from '../../utils/soundEffects';

interface InteractivePollProps {
  promptId: string;
  poll: CommunityPoll;
  currentUser?: any;
}

export const InteractivePoll: React.FC<InteractivePollProps> = ({
  promptId,
  poll,
  currentUser,
}) => {
  const [options, setOptions] = useState<PollOption[]>(poll.options || []);
  const [totalVotes, setTotalVotes] = useState<number>(poll.total_votes || 0);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check local storage or initial prop for vote status
  useEffect(() => {
    if (poll.user_voted_option_id) {
      setVotedOptionId(poll.user_voted_option_id);
      setHasVoted(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const storageKey = `tolzy_poll_${promptId}`;
      const savedVote = localStorage.getItem(storageKey);
      if (savedVote) {
        setVotedOptionId(savedVote);
        setHasVoted(true);
      }
    }
  }, [promptId, poll.user_voted_option_id]);

  // Keep options in sync if prop changes
  useEffect(() => {
    setOptions(poll.options || []);
    setTotalVotes(poll.total_votes || 0);
  }, [poll]);

  // Check if this is a "Tool VS Tool" comparison debate
  const isToolVersusTool = useMemo(() => {
    return options.length === 2 && options.every((opt) => opt.tool_id);
  }, [options]);

  const handleVote = async (optionId: string) => {
    if (hasVoted) {
      toast('لقد قمت بالتصويت بالفعل في هذا الاستطلاع!', { icon: 'ℹ️' });
      return;
    }

    setIsSubmitting(true);

    // Optimistic UI update
    setVotedOptionId(optionId);
    setHasVoted(true);
    setTotalVotes((prev) => prev + 1);
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, votes_count: opt.votes_count + 1 } : opt
      )
    );

    if (typeof window !== 'undefined') {
      localStorage.setItem(`tolzy_poll_${promptId}`, optionId);
    }

    soundEffects.playLike();
    toast.success('تم تسجيل تصويتك بنجاح! 📊');

    try {
      await fetch('/api/community/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: promptId,
          option_id: optionId,
          user_uid: currentUser?.uid || null,
        }),
      });
    } catch {
      // Background sync, silent fallback since local state is already persisted
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!options || options.length === 0) return null;

  return (
    <div
      className="my-2.5 sm:my-3.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#ffffff] border border-[#d2d2c8] shadow-2xs space-y-2.5 sm:space-y-3"
      dir="rtl"
    >
      {/* Poll Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#14140f] text-[#beff50] flex items-center justify-center shadow-xs">
            {isToolVersusTool ? <Swords className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-black text-[#14140f]">
            {isToolVersusTool ? 'مقارنة وتصويت الأدوات (VS)' : 'استطلاع رأي المجتمع'}
          </span>
        </div>

        <span className="text-[11px] font-bold text-[#6e6e64] flex items-center gap-1 font-mono">
          <Users className="w-3 h-3" />
          <span>{totalVotes} تصويت</span>
        </span>
      </div>

      {/* Question if defined */}
      {poll.question && (
        <h4 className="text-xs sm:text-sm font-bold text-[#14140f] leading-snug">
          {poll.question}
        </h4>
      )}

      {/* Options List */}
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = votedOptionId === option.id;
          const voteCount = option.votes_count || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return (
            <button
              key={option.id}
              type="button"
              disabled={hasVoted || isSubmitting}
              onClick={() => handleVote(option.id)}
              className={`relative w-full overflow-hidden p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-right transition-all cursor-pointer ${
                hasVoted
                  ? isSelected
                    ? 'border-[#14140f] bg-[#beff50]/20'
                    : 'border-[#d2d2c8] bg-[#f5f5eb]'
                  : 'border-[#d2d2c8] bg-[#f5f5eb] hover:border-[#14140f] hover:bg-[#eaeae0] active:scale-[0.99]'
              }`}
            >
              {/* Animated Progress Bar Fill */}
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`absolute inset-y-0 right-0 pointer-events-none ${
                    isSelected
                      ? 'bg-[#beff50]/40'
                      : 'bg-[#d2d2c8]/40'
                  }`}
                />
              )}

              {/* Content Row */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                {/* Option text + Tool logo if present */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {hasVoted && (
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#14140f]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#d2d2c8]" />
                      )}
                    </div>
                  )}

                  {option.tool_id && (
                    <div className="w-6 h-6 rounded-md bg-[#ffffff] border border-[#d2d2c8] p-0.5 flex items-center justify-center shrink-0">
                      <ToolImage
                        name={option.tool_name || option.text}
                        imageUrl={option.tool_imageUrl}
                        size="sm"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <span
                    className={`text-xs font-bold truncate ${
                      isSelected
                        ? 'text-[#14140f]'
                        : 'text-[#2c2c26]'
                    }`}
                  >
                    {option.text}
                  </span>
                </div>

                {/* Percentage & Vote Count */}
                {hasVoted && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#6e6e64] font-mono">
                      {voteCount} صوت
                    </span>
                    <span className="font-mono font-black text-xs text-[#14140f]">
                      {percentage}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-[#6e6e64] border-t border-[#d2d2c8]">
        <span>{hasVoted ? '✓ تم تسجيل صوتك' : 'اضغط على خيارك للمشاركة في التصويت'}</span>
        <span>صوت واحد لكل عضو</span>
      </div>
    </div>
  );
};

export default InteractivePoll;

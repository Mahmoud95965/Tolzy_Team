'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, CheckCircle2, Swords, Sparkles, Users } from 'lucide-react';
import ToolImage from '../common/ToolImage';
import { CommunityPoll, PollOption } from '../../types/community';
import { toast } from 'react-hot-toast';

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
      className="my-3.5 p-4 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 dark:from-neutral-900/90 dark:via-neutral-900 dark:to-neutral-950 border border-amber-200/80 dark:border-neutral-800 shadow-xs space-y-3"
      dir="rtl"
    >
      {/* Poll Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
            {isToolVersusTool ? <Swords className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-black text-neutral-900 dark:text-white">
            {isToolVersusTool ? 'مقارنة وتصويت الأدوات (VS)' : 'استطلاع رأي المجتمع'}
          </span>
        </div>

        <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{totalVotes} تصويت</span>
        </span>
      </div>

      {/* Question if defined */}
      {poll.question && (
        <h4 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-snug">
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
              className={`relative w-full overflow-hidden p-3 rounded-xl border text-right transition-all cursor-pointer ${
                hasVoted
                  ? isSelected
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-500/30'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60'
                  : 'border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 active:scale-[0.99]'
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
                      ? 'bg-amber-500/20 dark:bg-amber-500/25'
                      : 'bg-neutral-200/50 dark:bg-neutral-800/60'
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
                        <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700" />
                      )}
                    </div>
                  )}

                  {option.tool_id && (
                    <div className="w-6 h-6 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 p-0.5 flex items-center justify-center shrink-0">
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
                        ? 'text-amber-900 dark:text-amber-200'
                        : 'text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {option.text}
                  </span>
                </div>

                {/* Percentage & Vote Count */}
                {hasVoted && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {voteCount} صوت
                    </span>
                    <span className="font-mono font-black text-xs text-neutral-900 dark:text-white">
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
      <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-800">
        <span>{hasVoted ? '✓ تم تسجيل صوتك' : 'اضغط على خيارك للمشاركة في التصويت'}</span>
        <span>صوت واحد لكل عضو</span>
      </div>
    </div>
  );
};

export default InteractivePoll;

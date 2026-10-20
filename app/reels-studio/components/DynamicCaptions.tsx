'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBTITLE_PHRASES } from '../data';

interface DynamicCaptionsProps {
  currentTime: number;
  visible?: boolean;
}

export default function DynamicCaptions({ currentTime, visible = true }: DynamicCaptionsProps) {
  if (!visible) return null;

  // Find active phrase
  const activePhrase = SUBTITLE_PHRASES.find(
    (p) => currentTime >= p.start && currentTime <= p.end
  );

  if (!activePhrase) return null;

  return (
    <div
      dir="rtl"
      className="absolute bottom-[16%] left-0 right-0 z-40 flex justify-center px-6 pointer-events-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhrase.id}
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[92%] px-6 py-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(254,166,25,0.25)] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-center"
        >
          {/* Subtle glowing backlight */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/15 via-lime-500/15 to-sky-500/15 blur-lg -z-10" />

          {activePhrase.words.map((word) => {
            const isWordActive = currentTime >= word.start && currentTime <= word.end;
            const hasPassed = currentTime > word.end;

            return (
              <motion.span
                key={word.id}
                animate={{
                  scale: isWordActive ? 1.18 : 1,
                  y: isWordActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`inline-block font-extrabold text-[22px] tracking-tight transition-colors duration-150 ${
                  isWordActive
                    ? word.highlightColor
                      ? 'text-transparent bg-clip-text drop-shadow-[0_0_12px_rgba(254,166,25,0.8)]'
                      : 'text-[#fea619] drop-shadow-[0_0_10px_rgba(254,166,25,0.8)]'
                    : hasPassed
                    ? 'text-white'
                    : 'text-white/45'
                }`}
                style={
                  isWordActive && word.highlightColor
                    ? {
                        backgroundImage: `linear-gradient(135deg, ${word.highlightColor}, #ffffff)`,
                      }
                    : undefined
                }
              >
                {word.text}
              </motion.span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

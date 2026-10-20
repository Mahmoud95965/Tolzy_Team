'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Copy, Check, BarChart3, Vote, Sparkles, TrendingUp } from 'lucide-react';
import { TECH_STACK_DATA, LIVE_POLL_DATA } from '../data';

interface Scene4Props {
  progress: number; // 0 to 1 within this scene (00:28 to 00:34)
}

export default function Scene4StacksPoll({ progress }: Scene4Props) {
  // Timeline events:
  // 0.15 - 0.40: Taps "Copy Tech Stack"
  // 0.40 - 1.00: Swipes down slightly, taps "Vote Cursor" in Live Poll
  const isCopied = progress >= 0.25;
  const isVoted = progress >= 0.60;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 select-none overflow-hidden" dir="rtl">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mt-10 space-y-1 text-center"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/30 text-purple-300 text-[11px] font-black">
          <Layers className="w-3.5 h-3.5" />
          <span>الميزة الثالثة: حزم الأدوات والتصويت الحي</span>
        </div>
        <h2 className="text-[23px] font-black text-white">
          شارك <span className="text-[#a855f7]">Tech Stack</span> أو اعمل تصويت!
        </h2>
      </motion.div>

      {/* Vertical Feed Content: Stacks Card & Live Poll Card */}
      <div className="relative z-10 space-y-3.5 my-auto w-full max-w-sm mx-auto">
        {/* CARD 1: Tech Stack Bento Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl bg-neutral-900/90 border border-white/15 backdrop-blur-2xl shadow-xl space-y-3"
        >
          {/* Stack Title & Creator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-sm">
                📦
              </span>
              <div>
                <h4 className="text-[13px] font-black text-white leading-tight">
                  {TECH_STACK_DATA.name}
                </h4>
                <span className="text-[10px] text-white/50">بواسطة {TECH_STACK_DATA.author}</span>
              </div>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
              {TECH_STACK_DATA.copiesCount} نسخة ⚡
            </span>
          </div>

          {/* 4 Stacked Tool Pills */}
          <div className="grid grid-cols-2 gap-2">
            {TECH_STACK_DATA.tools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-sm">{tool.icon}</span>
                <div>
                  <div className="text-[11px] font-bold text-white">{tool.name}</div>
                  <div className="text-[9px] text-white/50">{tool.category}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Copy Button Action */}
          <motion.div
            animate={{ scale: isCopied ? [1, 1.03, 1] : 1 }}
            className={`w-full py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 ${
              isCopied
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>تم نسخ 4 أدوات لحسابك! ✅</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ الحزمة بنقرة واحدة (Copy Stack)</span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* CARD 2: Live VS Poll Bento Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-3xl bg-neutral-900/90 border border-white/15 backdrop-blur-2xl shadow-xl space-y-3"
        >
          {/* Poll Header */}
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h4 className="text-[12px] font-black text-white">تصويت مجتمع المطورين الحي 🔥</h4>
            </div>
            <span className="text-[10px] text-white/50 font-mono">
              {isVoted ? '1,429 صوت 🗳️' : '1,428 صوت'}
            </span>
          </div>

          <p className="text-[12px] font-bold text-white/90">
            {LIVE_POLL_DATA.question}
          </p>

          {/* Poll Options */}
          <div className="space-y-2">
            {LIVE_POLL_DATA.options.map((opt, idx) => {
              const isSelectedOption = idx === 0 && isVoted;
              const percent = isVoted ? opt.percentage : 0;

              return (
                <div
                  key={opt.id}
                  className={`relative overflow-hidden p-2.5 rounded-2xl border transition-all duration-300 ${
                    isSelectedOption
                      ? 'bg-lime-950/40 border-lime-400/60 ring-1 ring-lime-400/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {/* Dynamic Progress Fill Bar */}
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: isVoted ? `${opt.percentage}%` : '0%' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-0 bottom-0 right-0 opacity-20 -z-0"
                    style={{ backgroundColor: opt.color }}
                  />

                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{opt.icon}</span>
                      <span className="font-bold text-white">{opt.text}</span>
                      {isSelectedOption && (
                        <span className="text-[9px] bg-lime-400 text-black px-1.5 py-0.2 rounded-full font-black">
                          صوتك ✓
                        </span>
                      )}
                    </div>
                    <span className="font-black text-white text-sm" style={{ color: isVoted ? opt.color : 'white' }}>
                      {isVoted ? `${opt.percentage}%` : 'تصويت'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Safe bottom spacer */}
      <div className="h-24 w-full" />
    </div>
  );
}

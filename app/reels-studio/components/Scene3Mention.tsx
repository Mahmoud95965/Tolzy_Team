'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AtSign, Send, MessageSquare, ArrowRight, ExternalLink, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import { COMPARISON_TOOLS } from '../data';

interface Scene3Props {
  progress: number; // 0 to 1 within this scene (00:17 to 00:28)
}

export default function Scene3Mention({ progress }: Scene3Props) {
  // Timeline phases
  // 0.00 - 0.20: Typing initial text
  // 0.20 - 0.35: Types @Cur...
  // 0.35 - 0.50: Autocomplete popup appears, taps Cursor
  // 0.50 - 0.65: Mentions transforms into Bento Card inside post
  // 0.65 - 1.00: Flips to /tools/cursor page with auto-linked post

  const showAutocomplete = progress >= 0.28 && progress < 0.48;
  const isTransformed = progress >= 0.48;
  const isFlippedToToolPage = progress >= 0.68;

  // Typing animation string
  let typedText = 'جربت اليوم أداة ';
  if (progress >= 0.20 && progress < 0.28) {
    typedText = 'جربت اليوم أداة @';
  } else if (progress >= 0.28 && progress < 0.48) {
    typedText = 'جربت اليوم أداة @Cur';
  } else if (isTransformed) {
    typedText = 'جربت اليوم أداة ';
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 select-none overflow-hidden" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mt-10 space-y-1 text-center"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/30 text-sky-400 text-[11px] font-black">
          <AtSign className="w-3.5 h-3.5" />
          <span>الميزة الثانية: المنشن التفاعلي الذكي</span>
        </div>
        <h2 className="text-[23px] font-black text-white">
          اكتب <span className="text-[#38bdf8]">@ لأي أداة</span> وتتحول لكارت ذكي!
        </h2>
      </motion.div>

      {/* Main Container: Flips between Post Editor and Tool Page */}
      <div className="relative z-10 my-auto w-full max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          {!isFlippedToToolPage ? (
            /* PHASE 1: Community Post Editor */
            <motion.div
              key="editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              transition={{ duration: 0.4 }}
              className="p-4 rounded-3xl bg-neutral-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-3.5"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-lg shadow-md border border-white/20">
                    👨‍💻
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white">م. أحمد النجار</h4>
                    <span className="text-[10px] text-sky-300 font-medium">@ahmed_dev • الآن</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  منشور جديد
                </span>
              </div>

              {/* Editor Content Area */}
              <div className="relative min-h-[140px] p-3 rounded-2xl bg-black/50 border border-white/10 text-[14px] text-white/90 leading-relaxed">
                <span>{typedText}</span>

                {/* Simulated Cursor Blinker */}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-sky-400 align-middle ml-1"
                />

                {/* Autocomplete Dropdown */}
                {showAutocomplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-12 right-6 z-20 w-64 rounded-2xl bg-[#141622] border border-sky-400/40 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.8)] space-y-1.5"
                  >
                    <div className="text-[10px] font-bold text-white/50 px-2 py-0.5">
                      اختر الأداة للإشارة المباشرة:
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-sky-500/20 border border-sky-400/50 text-white font-bold text-xs shadow-md">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚡</span>
                        <span>Cursor AI</span>
                      </div>
                      <span className="text-[9px] bg-sky-400 text-black px-1.5 py-0.5 rounded-full font-black">
                        أفضل تطابق
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl text-white/60 text-xs hover:bg-white/5">
                      <span className="text-sm">🌊</span>
                      <span>Windsurf</span>
                    </div>
                  </motion.div>
                )}

                {/* Transformed Rich Mini Bento Card inside post */}
                {isTransformed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-lime-400/40 backdrop-blur-xl shadow-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-xl shadow-inner">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-white text-xs">Cursor AI</span>
                          <span className="text-[9px] bg-lime-400/20 text-lime-300 px-1.5 py-0.5 rounded-md font-bold">
                            بطاقة ذكية
                          </span>
                        </div>
                        <span className="text-[10px] text-white/60">محرر برمجيات الذكاء الاصطناعي #1</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-lime-400 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl">
                      تصفح ↗
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Post Footer Actions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-white/50 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  سيتم ربط المنشور بصفحة الأداة تلقائياً
                </span>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-lg">
                  <span>نشر</span>
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ) : (
            /* PHASE 2: Seamless Transition to /tools/cursor page */
            <motion.div
              key="tool-page"
              initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-3xl bg-[#0d0f17] border border-sky-400/40 backdrop-blur-2xl shadow-2xl space-y-3"
            >
              {/* Breadcrumb / URL Bar */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/60 border border-white/10 text-[10px] text-white/60 font-mono">
                <span className="text-sky-300 font-bold">tolzy.me/tools/cursor</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> متصل
                </span>
              </div>

              {/* Tool Header Mini */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Cursor AI</h3>
                  <p className="text-[11px] text-white/70">أقوى بيئة تطوير ذكية متكاملة 2026</p>
                </div>
              </div>

              {/* Auto-Linked Community Section Highlight */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/40 via-neutral-900 to-black border border-sky-500/50 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-black text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    نقاشات المجتمع حول الأداة
                  </span>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  >
                    ⚡ مرتبط تلقائياً الآن
                  </motion.span>
                </div>

                {/* The automatically linked post */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/90">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-white/60">
                    <span className="font-bold text-sky-300">م. أحمد النجار</span>
                    <span>• منذ دقيقة واحدة</span>
                  </div>
                  <p className="line-clamp-2">
                    جربت اليوم أداة Cursor AI في إعادة هيكلة مشروع ضخم، النتيجة أسرع بـ 5 أضعاف عن السابق!
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/50">
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3 h-3 fill-rose-400" /> 84
                    </span>
                    <span>💬 19 رد</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safe bottom spacer */}
      <div className="h-24 w-full" />
    </div>
  );
}

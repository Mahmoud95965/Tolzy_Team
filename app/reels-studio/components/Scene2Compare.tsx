'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Star, Zap, Shield, Sparkles, Scale, X } from 'lucide-react';
import { COMPARISON_TOOLS } from '../data';

interface Scene2Props {
  progress: number; // 0 to 1 within this scene (00:07 to 00:17)
}

export default function Scene2Compare({ progress }: Scene2Props) {
  // Step thresholds based on progress
  const cursorSelected = progress >= 0.15;
  const windsurfSelected = progress >= 0.35;
  const copilotSelected = progress >= 0.52;
  const showBottomSheet = progress >= 0.58;

  // Touch indicator position
  let touchTarget: { x: number; y: number; active: boolean; label: string } = {
    x: 0,
    y: 0,
    active: false,
    label: '',
  };

  if (progress >= 0.10 && progress < 0.25) {
    touchTarget = { x: 75, y: 155, active: progress < 0.20, label: 'تحديد Cursor' };
  } else if (progress >= 0.30 && progress < 0.45) {
    touchTarget = { x: 75, y: 255, active: progress < 0.40, label: 'تحديد Windsurf' };
  } else if (progress >= 0.48 && progress < 0.58) {
    touchTarget = { x: 75, y: 355, active: progress < 0.55, label: 'تحديد Copilot' };
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 select-none overflow-hidden" dir="rtl">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mt-10 space-y-1 text-center"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-[11px] font-black">
          <Scale className="w-3.5 h-3.5" />
          <span>الميزة الأولى: المقارنة الفورية 3x</span>
        </div>
        <h2 className="text-[24px] font-black text-white">
          قارن بين 3 أدوات <span className="text-[#beff50]">وجهاً لوجه!</span>
        </h2>
      </motion.div>

      {/* Vertical Stack of 3 Tool Cards */}
      <div className="relative z-10 space-y-2.5 my-auto max-w-sm mx-auto w-full">
        {COMPARISON_TOOLS.map((tool, idx) => {
          const isSelected =
            (idx === 0 && cursorSelected) ||
            (idx === 1 && windsurfSelected) ||
            (idx === 2 && copilotSelected);

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.12 }}
              className={`relative p-3.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-white/10 border-lime-400/60 shadow-[0_8px_30px_rgba(190,255,80,0.2)] ring-1 ring-lime-400/40'
                  : 'bg-white/5 border-white/10 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border"
                    style={{
                      backgroundColor: `${tool.accentColor}20`,
                      borderColor: `${tool.accentColor}40`,
                    }}
                  >
                    <span>{tool.logo}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-white">{tool.name}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white/80">
                        {tool.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-white/70">
                      <span className="text-lime-300 font-bold">{tool.price}</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-300 font-bold">
                        <Star className="w-3 h-3 fill-amber-300 mr-0.5" />
                        {tool.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compare Checkbox / Tap Action */}
                <motion.div
                  animate={{ scale: isSelected ? [1, 1.25, 1] : 1 }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-colors ${
                    isSelected
                      ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(190,255,80,0.8)]'
                      : 'bg-white/10 text-white/60 border-white/20'
                  }`}
                >
                  {isSelected ? <Check className="w-5 h-5 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                </motion.div>
              </div>

              {/* Tag / Quick highlight */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                <span>أهم ميزة: <strong className="text-white/90">{tool.topFeature}</strong></span>
                <span className="text-emerald-400 font-medium">عربي: {tool.arabicSupport}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Simulated Touch Indicator */}
      <AnimatePresence>
        {touchTarget.active && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            style={{
              position: 'absolute',
              top: `${touchTarget.y}px`,
              left: `${touchTarget.x}px`,
              zIndex: 60,
              pointerEvents: 'none',
            }}
          >
            <div className="relative">
              {/* Expanding Ripple Ring */}
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="absolute -inset-3 rounded-full bg-lime-400/40"
              />
              <div className="w-8 h-8 rounded-full bg-white shadow-[0_0_20px_#beff50] border-2 border-lime-400 flex items-center justify-center text-xs font-black text-black">
                👆
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Comparison Bottom-Sheet */}
      <AnimatePresence>
        {showBottomSheet && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute bottom-0 left-0 right-0 z-30 max-h-[82%] bg-[#0f111a]/95 backdrop-blur-2xl border-t border-white/20 rounded-t-[32px] p-5 shadow-[0_-15px_50px_rgba(0,0,0,0.9)] flex flex-col"
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                <h4 className="text-[16px] font-black text-white">جدول المقارنة المباشرة (3 أدوات)</h4>
              </div>
              <span className="text-[11px] font-bold text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
                مقارنة فورية ⚡
              </span>
            </div>

            {/* Comparison Grid Table */}
            <div className="space-y-2.5 text-[11px]">
              {/* Headers */}
              <div className="grid grid-cols-4 gap-1.5 font-bold text-center text-white/60 pb-1 border-b border-white/10">
                <span className="text-right">المعيار</span>
                <span className="text-lime-300">Cursor</span>
                <span className="text-cyan-300">Windsurf</span>
                <span className="text-purple-300">Copilot</span>
              </div>

              {/* Row 1: السعر */}
              <div className="grid grid-cols-4 gap-1.5 items-center p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="font-bold text-right text-white/90">السعر 💰</span>
                <span className="font-extrabold text-lime-400">20$ Pro</span>
                <span className="font-extrabold text-cyan-400">15$ Pro</span>
                <span className="font-extrabold text-purple-400">10$/شهر</span>
              </div>

              {/* Row 2: دعم العربية */}
              <div className="grid grid-cols-4 gap-1.5 items-center p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="font-bold text-right text-white/90">دعم العربية</span>
                <span className="text-emerald-400 font-bold">كامل 100% 🌟</span>
                <span className="text-emerald-400 font-bold">ممتاز 95% 🌟</span>
                <span className="text-amber-400 font-bold">جيد 80%</span>
              </div>

              {/* Row 3: أهم ميزة */}
              <div className="grid grid-cols-4 gap-1.5 items-center p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="font-bold text-right text-white/90">أهم ميزة ✨</span>
                <span className="text-white/90 font-medium">Cascade Agent</span>
                <span className="text-white/90 font-medium">Agentic Flows</span>
                <span className="text-white/90 font-medium">GitHub Native</span>
              </div>

              {/* Row 4: العيوب */}
              <div className="grid grid-cols-4 gap-1.5 items-center p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="font-bold text-right text-rose-300">أبرز العيوب ⚠️</span>
                <span className="text-rose-200">استهلاك الـ Fast</span>
                <span className="text-rose-200">إضافات أقل</span>
                <span className="text-rose-200">بدون IDE مستقل</span>
              </div>
            </div>

            {/* Safe Bottom Padding */}
            <div className="h-20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe bottom spacer */}
      <div className="h-24 w-full" />
    </div>
  );
}

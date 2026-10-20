'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Globe, Award, ShieldCheck, Heart } from 'lucide-react';
import { CREATOR_PROFILE_DATA } from '../data';

interface Scene5Props {
  progress: number; // 0 to 1 within this scene (00:34 to 00:37.1)
}

export default function Scene5Outro({ progress }: Scene5Props) {
  // Phase 1 (0 to 0.40): Creator profile glance
  // Phase 2 (0.40 to 1.0): Full-screen glowing Tolzy Outro card
  const showFullOutro = progress >= 0.35;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 select-none overflow-hidden" dir="rtl">
      {/* Background radial energy flare */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-amber-500/30 via-lime-400/25 to-sky-400/20 blur-3xl pointer-events-none"
      />

      <AnimatePresence mode="wait">
        {!showFullOutro ? (
          /* PHASE 1: Mobile Creator Tech Profile */
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 my-auto w-full max-w-sm mx-auto p-4 rounded-3xl bg-neutral-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-3.5"
          >
            {/* Creator Header */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-lime-400 p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center text-2xl">
                    👨‍💻
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[11px] shadow">
                  ✓
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-white text-base">{CREATOR_PROFILE_DATA.name}</h3>
                </div>
                <p className="text-[11px] text-white/70">{CREATOR_PROFILE_DATA.role}</p>
                <span className="text-[10px] text-lime-400 font-mono">{CREATOR_PROFILE_DATA.handle}</span>
              </div>
            </div>

            {/* Stats Bento */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {CREATOR_PROFILE_DATA.stats.map((s) => (
                <div key={s.label} className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-sm">{s.icon}</div>
                  <div className="text-xs font-black text-white mt-0.5">{s.value}</div>
                  <div className="text-[9px] text-white/50">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recommended Tools */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-white/70">الأدوات التي يوصي بها:</div>
              <div className="flex gap-2">
                {CREATOR_PROFILE_DATA.favoriteTools.map((t) => (
                  <span
                    key={t.name}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/10 text-white border border-white/10"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* PHASE 2: High-Energy Outro Card & CTA */
          <motion.div
            key="outro-cta"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="relative z-10 my-auto w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-5 px-3"
          >
            {/* Glowing 3D Emblem */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500 via-lime-400 to-sky-400 opacity-60 blur-md -z-10"
              />
              <div className="w-24 h-24 rounded-3xl bg-[#090A0F] border-2 border-white/20 p-2 flex flex-col items-center justify-center shadow-2xl">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-200 to-amber-500">
                  T
                </span>
                <span className="text-[11px] font-black tracking-widest text-[#fea619]">
                  TOLZY
                </span>
              </div>
            </div>

            {/* Hero CTA Text */}
            <div className="space-y-2">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-[34px] font-black leading-tight text-white tracking-tight drop-shadow-[0_4px_24px_rgba(254,166,25,0.4)]"
              >
                جربها الآن مجاناً
                <br />
                على <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-lime-300 to-emerald-400">tolzy.me 🚀</span>
              </motion.h1>

              <p className="text-[14px] text-white/80 font-medium max-w-xs mx-auto">
                أكبر دليل عربي تفاعلي لأدوات الذكاء الاصطناعي 2026
              </p>
            </div>

            {/* Glowing Action Button */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-lime-400 text-black font-black text-base shadow-[0_0_35px_rgba(254,166,25,0.7)] flex items-center justify-center gap-2"
            >
              <span>ابدأ التجربة المجانية</span>
              <ArrowLeft className="w-5 h-5 stroke-[3]" />
            </motion.div>

            {/* Website Pill */}
            <div className="flex items-center gap-2 text-white/60 font-mono text-xs">
              <Globe className="w-3.5 h-3.5 text-lime-400" />
              <span>https://tolzy.me</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe bottom spacer */}
      <div className="h-24 w-full" />
    </div>
  );
}

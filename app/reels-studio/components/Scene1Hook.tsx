'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Compass, Star, Flame } from 'lucide-react';

interface Scene1Props {
  progress: number; // 0 to 1 within this scene
}

export default function Scene1Hook({ progress }: Scene1Props) {
  // Cascading icons
  const cascadeIcons = [
    { name: 'Cursor', icon: '⚡', color: '#beff50', delay: 0 },
    { name: 'v0.dev', icon: '🎨', color: '#38bdf8', delay: 0.1 },
    { name: 'Claude', icon: '🧠', color: '#f59e0b', delay: 0.2 },
    { name: 'Windsurf', icon: '🌊', color: '#06b6d4', delay: 0.3 },
    { name: 'Midjourney', icon: '✨', color: '#ec4899', delay: 0.4 },
    { name: 'ElevenLabs', icon: '🎙️', color: '#8b5cf6', delay: 0.5 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-hidden" dir="rtl">
      {/* Dynamic Ambient Background Glows */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#fea619]/30 via-lime-500/20 to-transparent blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -left-16 w-80 h-80 rounded-full bg-gradient-to-tr from-sky-500/25 via-purple-600/25 to-transparent blur-3xl pointer-events-none"
      />

      {/* Subtle grid pattern background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-12 flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-white/10 to-lime-500/20 border border-white/20 backdrop-blur-xl shadow-lg"
      >
        <span className="flex h-2 w-2 rounded-full bg-lime-400 animate-ping" />
        <span className="text-[13px] font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-lime-300">
          تحديث TOLZY الجديد 2026 ⚡
        </span>
      </motion.div>

      {/* Center 3D Cascade & Logo Hub */}
      <div className="relative z-10 w-full flex flex-col items-center my-auto">
        {/* Cascade of snapping icons */}
        <div className="relative w-full h-40 flex items-center justify-center mb-4">
          {cascadeIcons.map((tool, idx) => {
            const angle = (idx / cascadeIcons.length) * Math.PI * 2;
            const radius = 105;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * (radius * 0.65);

            return (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.2, y: -80 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: [x * 1.4, x],
                  y: [y * 1.4, y],
                }}
                transition={{
                  duration: 0.7,
                  delay: tool.delay,
                  type: 'spring',
                  stiffness: 140,
                  damping: 15,
                }}
                className="absolute flex flex-col items-center"
              >
                <div
                  className="w-13 h-13 rounded-2xl p-2.5 flex items-center justify-center text-xl shadow-2xl backdrop-blur-xl border border-white/20"
                  style={{
                    backgroundColor: `${tool.color}15`,
                    borderColor: `${tool.color}50`,
                    boxShadow: `0 8px 24px ${tool.color}30`,
                  }}
                >
                  <span>{tool.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-white/80 mt-1 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                  {tool.name}
                </span>
              </motion.div>
            );
          })}

          {/* Center Glowing TOLZY Core */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
            className="relative z-20 flex flex-col items-center"
          >
            <div className="relative w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-[#fea619] via-[#beff50] to-sky-400 shadow-[0_0_50px_rgba(254,166,25,0.45)]">
              <div className="w-full h-full rounded-[22px] bg-[#090A0F] flex flex-col items-center justify-center p-2 border border-white/10">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-200 to-amber-500">
                  T
                </span>
                <span className="text-[10px] font-black tracking-widest text-[#fea619]">
                  TOLZY.ME
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Big Mobile Title & Hook */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center space-y-3 px-4 max-w-sm"
        >
          <h1 className="text-[32px] font-black leading-tight text-white tracking-tight drop-shadow-md">
            عشان تختار أداة صح
            <br />
            من بين <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-lime-300 to-emerald-400">+1000 أداة AI!</span>
          </h1>

          <p className="text-[15px] text-white/80 leading-relaxed font-medium">
            3 ميزات جديدة كلياً في تولزي هتغير طريقتك في المقارنة واختيار الأدوات 🚀
          </p>
        </motion.div>

        {/* Feature Teasers Bento Pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
            <Zap className="w-3.5 h-3.5 text-lime-400" />
            <span className="text-[12px] font-bold text-white">مقارنة فورية 3x</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[12px] font-bold text-white">منشن @ ذكي</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[12px] font-bold text-white">حزم وتصويت حي</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom spacer for dynamic captions safe zone */}
      <div className="h-24 w-full" />
    </div>
  );
}

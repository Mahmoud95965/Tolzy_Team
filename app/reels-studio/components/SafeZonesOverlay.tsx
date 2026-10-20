'use client';

import React from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Disc3, Search, Sparkles } from 'lucide-react';

interface SafeZonesOverlayProps {
  visible: boolean;
}

export default function SafeZonesOverlay({ visible }: SafeZonesOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none select-none overflow-hidden">
      {/* Top 12% Unsafe Zone Guideline */}
      <div className="absolute top-0 left-0 right-0 h-[12%] border-b border-dashed border-red-500/40 bg-red-950/20 backdrop-blur-[1px] flex flex-col justify-between p-3 text-[11px] font-bold text-red-300">
        <div className="flex items-center justify-between opacity-80">
          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full border border-red-500/30">
            ⚠️ منطقة واجهة Reels / TikTok العلوية (12%)
          </span>
          <div className="flex items-center gap-4 text-white/70">
            <span>متابعة</span>
            <span className="text-white font-black border-b-2 border-white pb-0.5">لك (For You)</span>
            <Search className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Right Action Icons Column (TikTok / Reels UI Simulator) */}
      <div className="absolute right-3 bottom-[20%] flex flex-col items-center gap-4 text-white/90">
        {/* Creator Avatar with follow + badge */}
        <div className="relative flex flex-col items-center">
          <div className="w-11 h-11 rounded-full border-2 border-white bg-gradient-to-tr from-amber-500 to-lime-400 p-0.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center text-sm font-black">
              T
            </div>
          </div>
          <div className="absolute -bottom-1.5 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[12px] font-bold shadow-md">
            +
          </div>
        </div>

        {/* Like */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <span className="text-[11px] font-bold">48.2K</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-bold">1,280</span>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[11px] font-bold">9,450</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-bold">3,120</span>
        </div>

        {/* Rotating Sound Disc */}
        <div className="w-10 h-10 rounded-full bg-neutral-900 border-2 border-white/30 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
          <Disc3 className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Bottom 18% Unsafe Zone Guideline */}
      <div className="absolute bottom-0 left-0 right-0 h-[18%] border-t border-dashed border-red-500/40 bg-red-950/20 backdrop-blur-[1px] p-3 flex flex-col justify-between text-[11px] font-bold text-red-300">
        <div className="flex items-center justify-between">
          <span className="bg-black/60 px-2 py-0.5 rounded-full border border-red-500/30">
            ⚠️ منطقة الوصف وشريط الصوت (18%)
          </span>
          <span className="text-white/60 font-mono text-[10px]">Safe Zone Active</span>
        </div>

        {/* Simulated bottom caption */}
        <div className="space-y-1 text-white/80" dir="rtl">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[12px] text-white">@tolzy.me</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">حساب موثق</span>
          </div>
          <p className="text-[11px] text-white/70 line-clamp-1">
            دليلك لأكثر من 1000 أداة ذكاء اصطناعي مجانية 2026 ⚡ #ذكاء_اصطناعي #برمجة
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-white/60">
            <Disc3 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>الصوت الأصلي - منصة تولزي الرسمية</span>
          </div>
        </div>
      </div>

      {/* Central Safe Zone Frame Box */}
      <div className="absolute top-[12%] bottom-[18%] left-3 right-16 border border-emerald-500/30 rounded-2xl pointer-events-none">
        <div className="absolute top-2 left-2 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>منطقة الأمان (Central Safe Zone)</span>
        </div>
      </div>
    </div>
  );
}

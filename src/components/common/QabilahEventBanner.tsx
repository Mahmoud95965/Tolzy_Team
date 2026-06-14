"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ExternalLink, Trophy, Sparkles } from 'lucide-react';

const QABILAH_PROJECT_URL =
  'https://qabilah.com/hackathon/255665101472799432/projects/256413889141411840';

const BANNER_DISMISSED_KEY = 'qabilah_event_banner_dismissed';

const QabilahEventBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Show only if the user hasn't dismissed it before
    const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setAnimating(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      id="qabilah-event-banner"
      className={`relative z-[60] w-full transition-all duration-300 ${
        animating ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
      style={{
        background: 'linear-gradient(90deg, #E85D04 0%, #F77F00 40%, #FCBF49 70%, #F77F00 100%)',
        backgroundSize: '200% 100%',
        animation: animating ? 'none' : 'shimmer 3s linear infinite',
      }}
    >
      {/* Animated shimmer layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%)',
          backgroundSize: '200% 100%',
          animation: 'bannerShimmer 2.5s ease-in-out infinite',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Left: close button (appears on left in RTL) */}
        <button
          onClick={handleDismiss}
          aria-label="إغلاق الإشعار"
          className="shrink-0 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center: content */}
        <div className="flex-1 flex items-center justify-center gap-2 flex-wrap text-center">
          {/* Pulsing dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>

          <Trophy className="w-4 h-4 text-white shrink-0" />

          <span className="text-white font-bold text-sm">
            🎉 انطلقت فعاليات قبيلة هاكاثون!
          </span>

          <span className="hidden sm:inline text-white/90 text-sm">
            —
          </span>

          <span className="hidden sm:inline text-white/90 text-sm">
            صوّت لمشروعنا الآن وساعدنا على الفوز!
          </span>

          <Link
            href={QABILAH_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-[#E85D04] bg-white hover:bg-orange-50 shadow transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            صوّت الآن
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Right: Qabilah logo placeholder (decorative) */}
        <div className="shrink-0 hidden sm:flex items-center gap-1.5 text-white/80 text-xs font-semibold">
          <span>قبيلة</span>
        </div>
      </div>

      <style>{`
        @keyframes bannerShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default QabilahEventBanner;

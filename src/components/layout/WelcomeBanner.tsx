'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles, Info } from 'lucide-react';

export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isNewVisitor, setIsNewVisitor] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome message before
    const hasSeenWelcome = localStorage.getItem('tolzy_welcome_seen');
    const hasVisited = localStorage.getItem('tolzy_visited');
    
    if (!hasVisited) {
      // First time visitor
      setIsNewVisitor(true);
      setIsVisible(true);
      localStorage.setItem('tolzy_visited', 'true');
    } else if (!hasSeenWelcome) {
      // Returning visitor but hasn't dismissed welcome
      setIsVisible(true);
    }
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    localStorage.setItem('tolzy_welcome_seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              {isNewVisitor ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>
            <p className="text-sm font-medium truncate">
              {isNewVisitor ? (
                <>مرحباً بك في Tolzy! 👋 دليلك الشامل لأدوات AI - اكتشف 630+ أداة أو اسأل Copilot</>
              ) : (
                <>💡 جرب Copilot للحصول على توصيات ذكية للأدوات المناسبة لمشروعك</>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={isNewVisitor ? '/tools' : '/copilot'}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
            >
              {isNewVisitor ? 'استكشف الأدوات' : 'جرب Copilot'}
            </Link>
            <button
              onClick={dismissBanner}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

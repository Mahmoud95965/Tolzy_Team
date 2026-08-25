"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { 
  LogOut, User, Crown, Zap, Sparkles, ChevronDown, 
  Shield, ArrowUpRight, Loader2, Gauge
} from 'lucide-react';

interface UserProfileProps {
  className?: string;
  iconClassName?: string;
}

interface TokenUsageData {
  plan: 'free' | 'pro' | 'max' | 'admin';
  planName: string;
  tokensUsed: number;
  tokenAllowance: number;
  tokensRemaining: number;
  percentageUsed: number;
  isPro: boolean;
  isMax: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ className, iconClassName }) => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { userData } = useUserData();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayUser = user || (userProfile ? {
    displayName: userProfile.displayName,
    photoURL: userProfile.photoURL,
    email: userProfile.email
  } : null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real token usage whenever user is available or dropdown opens
  useEffect(() => {
    const fetchUsage = async () => {
      if (!user?.uid) return;
      try {
        setLoadingUsage(true);
        const res = await fetch(`/api/user/token-usage?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setTokenUsage(data);
        }
      } catch (err) {
        console.error('Failed to fetch token usage:', err);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchUsage();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!displayUser) {
    return null;
  }

  const normalizedPlan = tokenUsage?.plan || String(userProfile?.plan || 'free').toLowerCase();
  const isPro = normalizedPlan.includes('pro');
  const isMax = normalizedPlan.includes('max') || normalizedPlan.includes('ultra');
  const isFree = !isPro && !isMax && normalizedPlan !== 'admin';

  const used = tokenUsage?.tokensUsed || 0;
  const allowance = tokenUsage?.tokenAllowance || (isMax ? 2_500_000 : isPro ? 500_000 : 10_000);
  const remaining = tokenUsage?.tokensRemaining !== undefined ? tokenUsage.tokensRemaining : Math.max(0, allowance - used);
  const percentage = tokenUsage?.percentageUsed !== undefined 
    ? tokenUsage.percentageUsed 
    : Math.min(100, Math.round((used / allowance) * 100));

  // Visual color for progress bar
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-blue-600';
  };

  const getPlanBadge = () => {
    if (isAdmin) {
      return { text: 'Admin', color: 'bg-neutral-900 text-white dark:bg-white dark:text-black' };
    }
    if (isMax) {
      return { text: 'MAX 2.5M 👑', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' };
    }
    if (isPro) {
      return { text: 'PRO 500K ⭐', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' };
    }
    return { text: 'مجاني 10K', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300' };
  };

  const badge = getPlanBadge();

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      {/* Trigger Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors focus:outline-none"
      >
        <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors ${iconClassName || 'bg-neutral-100 dark:bg-neutral-800'}`}>
          {displayUser.photoURL ? (
            <img
              src={displayUser.photoURL}
              alt={displayUser.displayName || 'User profile'}
              className="w-full h-full rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
            />
          ) : (
            <span className="text-xs font-bold text-black dark:text-white font-mono">
              {displayUser.displayName?.[0]?.toUpperCase() || displayUser.email?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
          
          {(isPro || isMax) && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-black">
              <Crown className="w-2 h-2" />
            </div>
          )}
        </div>

        <div className="hidden md:flex flex-col items-start text-right">
          <span className={`text-xs font-bold ${className || 'text-black dark:text-white'}`}>
            {userData?.displayName || displayUser.displayName || 'حسابي'}
          </span>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
            {remaining.toLocaleString()} توكن
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 hidden md:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-right">
          
          {/* User Header */}
          <div className="px-4 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-bold text-black dark:text-white truncate">
                {userData?.displayName || displayUser.displayName || 'المستخدم'}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                {badge.text}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono truncate">
              {displayUser.email}
            </p>
          </div>

          {/* 📊 Real Token Usage Bar Section */}
          <div className="p-4 mx-3 my-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-white">
                <Gauge className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>استهلاك التوكن الذكي</span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
                {percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mb-2.5">
              <div 
                className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Numbers Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 font-mono pt-1">
              <div>
                <span className="text-neutral-400 block text-[10px]">المتبقي</span>
                <span className="font-bold text-black dark:text-white">
                  {remaining.toLocaleString()}
                </span>
              </div>
              <div className="text-left">
                <span className="text-neutral-400 block text-[10px]">الإجمالي</span>
                <span className="font-bold text-neutral-500">
                  {allowance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Upgrade CTA inside dropdown */}
            {(isFree || percentage > 80) && (
              <Link
                href="/pricing"
                onClick={() => setIsOpen(false)}
                className="mt-3 w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <span>ترقية وزيادة الحصة</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>لوحة تحكم المسؤول</span>
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <User className="w-4 h-4 text-neutral-400" />
              <span>الملف الشخصي والإعدادات</span>
            </Link>

            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-neutral-400" />
              <span>الباقات والترقية</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors mt-1 border-t border-neutral-100 dark:border-neutral-800/80 pt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
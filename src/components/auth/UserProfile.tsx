"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { 
  LogOut, User, ChevronDown, Shield, Sparkles
} from 'lucide-react';

interface UserProfileProps {
  className?: string;
  iconClassName?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className, iconClassName }) => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { userData } = useUserData();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  const badge = isAdmin 
    ? { text: 'Admin', color: 'bg-neutral-900 text-white dark:bg-white dark:text-black' }
    : { text: 'عضو', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300' };

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
        </div>

        <div className="hidden md:flex flex-col items-start text-right">
          <span className={`text-xs font-bold ${className || 'text-black dark:text-white'}`}>
            {userData?.displayName || displayUser.displayName || 'حسابي'}
          </span>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
            {displayUser.email ? displayUser.email.split('@')[0] : 'عضو في TOLZY'}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 hidden md:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 sm:w-72 rounded-2xl shadow-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-right">
          
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

          {/* Navigation Links */}
          <div className="py-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>لوحة تحكم المسؤول</span>
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <User className="w-4 h-4 text-neutral-400" />
              <span>الملف الشخصي والإعدادات</span>
            </Link>

            <Link
              href="/community"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>المجتمع التقني</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors mt-1 border-t border-neutral-100 dark:border-neutral-800/80 pt-2"
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
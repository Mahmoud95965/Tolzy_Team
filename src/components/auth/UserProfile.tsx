"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { LogOut, User } from 'lucide-react';

interface UserProfileProps {
  className?: string;
  iconClassName?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className, iconClassName }) => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { userData } = useUserData();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const displayUser = user || (userProfile ? {
    displayName: userProfile.displayName,
    photoURL: userProfile.photoURL,
    email: userProfile.email
  } : null);

  if (!displayUser) {
    return null;
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 focus:outline-none relative">
        <div className="relative flex items-center justify-center">
          {userProfile?.plan === 'ultra' || userProfile?.plan === 'tolzy_ultra' ? (
            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 rounded-full blur-[2px] opacity-75 animate-pulse"></div>
          ) : userProfile?.plan === 'pro' || userProfile?.plan === 'tolzy_pro' ? (
            <div className="absolute -inset-1 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full blur-[2px] opacity-75"></div>
          ) : null}

          <div className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10 ${iconClassName || 'bg-indigo-100 dark:bg-indigo-900/50'}`}>
            {displayUser.photoURL ? (
              <img
                src={displayUser.photoURL}
                alt={displayUser.displayName || 'User profile'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <User className={`w-5 h-5 ${iconClassName ? 'text-current' : 'text-indigo-600 dark:text-indigo-400'}`} />
            )}
          </div>

          {(!userProfile?.plan || userProfile.plan === 'free') && (
            <span className="absolute -top-3 -right-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full z-20 shadow-sm border border-white dark:border-slate-800">
              Upgrade
            </span>
          )}
          {(userProfile?.plan === 'pro' || userProfile?.plan === 'tolzy_pro') && (
            <span className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full z-20 shadow-md border border-white dark:border-slate-800">
              PRO
            </span>
          )}
          {(userProfile?.plan === 'ultra' || userProfile?.plan === 'tolzy_ultra') && (
            <span className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full z-20 shadow-md border border-white dark:border-slate-800 uppercase animate-pulse">
              ULTRA
            </span>
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className={`text-sm font-bold transition-colors ${className || 'text-slate-700 dark:text-slate-200'}`}>
            {userData?.displayName || displayUser.displayName || 'المستخدم'}
          </span>
          <span className={`text-xs opacity-70 ${className || 'text-slate-500 dark:text-slate-400'}`}>
            {displayUser.email?.split('@')[0]}
          </span>
        </div>
      </button>

      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">        <div className="py-1" role="menu" aria-orientation="vertical">
        {isAdmin && (
          <Link
            href="/admin"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            لوحة التحكم
          </Link>
        )}
        <Link
          href="/profile"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          role="menuitem"
        >
          <User className="h-4 w-4 ml-2" />
          الملف الشخصي
        </Link>
        {(!userProfile?.plan || userProfile.plan === 'free') && (
          <Link
            href="/pricing"
            className="block px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            role="menuitem"
          >
            ترقية إلى Pro
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          role="menuitem"
        >
          <LogOut className="h-4 w-4 ml-2" />
          تسجيل الخروج
        </button>
      </div>
      </div>
    </div>
  );
};

export default UserProfile;
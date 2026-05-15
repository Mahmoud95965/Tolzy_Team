"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { LogOut, User, Crown } from 'lucide-react';

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

  const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
  const isPro = normalizedPlan.includes('pro') || normalizedPlan.includes('ultra');

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 focus:outline-none relative">
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
            
            {isPro && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] shadow-sm">
                    <Crown className="w-2.5 h-2.5 text-white" />
                </div>
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
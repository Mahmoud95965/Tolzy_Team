"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Bell, User, MoreHorizontal, X, GraduationCap, Zap, Wand2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getCentralAuthUrl } from '../../utils/authRedirect';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close more menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Unread notifications count — wire to real data later
  const unreadCount = 0;

  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/community', icon: Users, label: 'المجتمع' },
    { href: '/notifications', icon: Bell, label: 'الإشعارات', badge: unreadCount },
    { href: user ? '/profile' : getCentralAuthUrl(pathname !== '/' && pathname !== '/auth' ? pathname : undefined), icon: User, label: user ? 'حسابي' : 'دخول' },
  ];

  const moreItems = [
    { href: '/axiom', icon: Bot, label: 'مساعد AXIOM الذكي', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { href: '/learn', icon: GraduationCap, label: 'Tolzy Learn', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { href: '/tools', icon: Zap, label: 'دليل الأدوات', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { href: '/build', icon: Wand2, label: 'صانع المشاريع بـ AI', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <>
      {/* More Menu Backdrop */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setIsMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More Menu Popup */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            ref={moreRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-[72px] left-4 right-4 z-50 md:hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/20 border border-slate-100 dark:border-white/5 p-3 space-y-1.5"
          >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-white/5 mb-1">
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <span className="text-sm font-black text-slate-800 dark:text-white">المزيد</span>
            </div>
            {moreItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98] ${
                    isActive
                      ? `${item.bg} ${item.color} font-black`
                      : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <Icon size={18} className={item.color} />
                  </div>
                  <span className="font-bold text-sm">{item.label}</span>
                  {isActive && (
                    <div className="mr-auto w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50
          bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl
          border-t border-slate-100 dark:border-white/5
          shadow-[0_-4px_24px_0_rgba(0,0,0,0.06)]
          flex items-center justify-around
          px-2 py-1
          md:hidden
        "
        style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))' }}
      >
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} prefetch={false} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.82 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="flex flex-col items-center justify-center gap-0.5 relative py-1.5"
              >
                <div className="relative">
                  <motion.div
                    animate={isActive ? { y: -1 } : { y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                  </motion.div>

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </div>

                <span className={`text-[9px] font-bold transition-colors duration-200 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeNavDot"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* More button */}
        <div className="flex-1">
          <motion.button
            whileTap={{ scale: 0.82 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="w-full flex flex-col items-center justify-center gap-0.5 relative py-1.5"
          >
            <motion.div animate={isMoreOpen ? { rotate: 90 } : { rotate: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
              <MoreHorizontal
                size={22}
                strokeWidth={1.8}
                className={`transition-colors duration-200 ${
                  isMoreOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              />
            </motion.div>
            <span className={`text-[9px] font-bold transition-colors duration-200 ${
              isMoreOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              المزيد
            </span>
          </motion.button>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;

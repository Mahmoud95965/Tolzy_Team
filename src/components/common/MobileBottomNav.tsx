"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Bell, User, MoreHorizontal, X, Zap, BrainCircuit, Sparkles } from 'lucide-react';
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
    { href: '/tools', icon: Zap, label: 'الأدوات' },
    { href: '/community', icon: Users, label: 'المجتمع' },
    { href: '/notifications', icon: Bell, label: 'الإشعارات', badge: unreadCount },
    { href: user ? '/profile' : getCentralAuthUrl(pathname !== '/' && pathname !== '/auth' ? pathname : undefined), icon: User, label: user ? 'حسابي' : 'دخول' },
  ];

  const moreItems = [
    { href: '/tools', icon: Zap, label: 'دليل الأدوات', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', external: false, badge: undefined },
    { href: 'https://flow.tolzy.me', icon: BrainCircuit, label: 'TOLZY Flow', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', external: true, badge: 'AI Office Suite' },
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
            className="fixed bottom-[72px] left-4 right-4 z-50 md:hidden bg-[#ffffff] rounded-[28px] shadow-none border border-[#d2d2c8] p-3 space-y-1.5"
          >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[#d2d2c8] mb-1">
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full text-[#6e6e64] hover:text-[#14140f] transition-colors"
              >
                <X size={18} />
              </button>
              <span className="text-sm font-medium text-[#14140f]">المزيد</span>
            </div>
            {moreItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-[18px] transition-colors hover:bg-[#f5f5eb] text-[#14140f]"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center">
                      <Icon size={18} className="text-[#14140f]" />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="mr-auto text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#beff50] text-[#14140f] border border-[#14140f]/10">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-[18px] transition-colors ${
                    isActive
                      ? 'bg-[#f5f5eb] text-[#14140f] font-medium'
                      : 'hover:bg-[#f5f5eb] text-[#14140f]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center">
                    <Icon size={18} className="text-[#14140f]" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="mr-auto w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f]" />
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
          bg-[#ffffff]
          border-t border-[#d2d2c8]
          shadow-none
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
                      size={20}
                      strokeWidth={isActive ? 2.2 : 1.6}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? 'text-[#14140f]'
                          : 'text-[#6e6e64]'
                      }`}
                    />
                  </motion.div>

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-[#14140f] text-[#ffffff] text-[9px] font-medium rounded-full flex items-center justify-center"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </div>

                <span className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-[#14140f]' : 'text-[#6e6e64]'
                }`}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeNavDot"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#beff50] border border-[#14140f]"
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
                size={20}
                strokeWidth={1.6}
                className={`transition-colors duration-200 ${
                  isMoreOpen ? 'text-[#14140f]' : 'text-[#6e6e64]'
                }`}
              />
            </motion.div>
            <span className={`text-[10px] font-medium transition-colors duration-200 ${
              isMoreOpen ? 'text-[#14140f]' : 'text-[#6e6e64]'
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

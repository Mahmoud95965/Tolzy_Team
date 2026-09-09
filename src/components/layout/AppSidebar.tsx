"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Zap, 
  GraduationCap,
  Map, 
  Activity,
  Sparkles,
  Users,
  Search,
  Bell,
  User,
  Wand2
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { userProfile } = useAuth();

  const navItems = [
    { name: 'التحديثات القادمة', href: '/upcoming', icon: Sparkles },
    { name: 'المجتمع', href: '/community', icon: Users },
  ];

  return (
    <>
      {/* Desktop Sidebar (Right side as per standard RTL) */}
      <aside className="hidden lg:flex flex-col w-64 p-6 sticky top-20 h-[calc(100vh-80px)] border-l border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 z-40 text-right">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-black text-[#fea619] tracking-tight">Tolzy AI</h2>
          <p className="text-sm text-slate-400 font-bold">لوحة التحكم</p>
        </div>

        <nav className="space-y-3">
          {/* Prominent T O L Z Y AI CTA */}
          <a
            href="https://ai.tolzy.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-4 py-3.5 transition-all rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black shadow-lg shadow-violet-500/30 group hover:scale-[1.02] active:scale-95 mb-4"
          >
            <div className="flex bg-white/20 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">New</div>
            <div className="flex items-center gap-2">
              <span>T O L Z Y AI</span>
              <Wand2 size={20} className="text-violet-200 group-hover:rotate-12 transition-transform" />
            </div>
          </a>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center justify-end gap-3 px-4 py-3.5 transition-all rounded-2xl ${
                  isActive 
                    ? 'bg-[#ffddb8] text-[#855300] font-black' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold'
                }`}
              >
                <span>{item.name}</span>
                <item.icon size={20} className={isActive ? 'text-[#855300]' : 'text-slate-400'} />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Top Tabs */}
      <nav className="lg:hidden sticky top-20 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-white/5 p-3 flex gap-3 overflow-x-auto snap-x scrollbar-hide text-right flex-row-reverse shadow-sm">
        {/* Mobile T O L Z Y AI CTA */}
        <a 
          href="https://ai.tolzy.me"
          target="_blank"
          rel="noopener noreferrer"
          className="snap-center shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-all bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black shadow-md shadow-violet-500/20 active:scale-95"
        >
          <span className="text-sm border-r border-white/20 pr-2 mr-1">NEW</span>
          <span className="text-sm whitespace-nowrap">T O L Z Y AI</span>
          <Wand2 size={16} className="text-violet-200" />
        </a>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`snap-center shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full transition-all ${
                isActive 
                  ? 'bg-[#ffddb8] dark:bg-[#fea619]/20 text-[#855300] dark:text-[#fea619] font-black border border-[#fea619]/30' 
                  : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold border border-transparent'
              }`}
            >
              <span className="text-sm whitespace-nowrap">{item.name}</span>
              <item.icon size={16} className={isActive ? 'text-[#855300] dark:text-[#fea619]' : 'text-slate-400'} />
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default AppSidebar;

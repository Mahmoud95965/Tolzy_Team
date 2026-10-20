"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Moon,
  Sun,
  BrainCircuit,
  Zap,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Search,
  ExternalLink,
  Users,
  History,
  BookOpen,
  Activity
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTools } from '../../hooks/useTools';
import { Tool } from '../../types';
import UserProfile from '../auth/UserProfile';
import NotificationBell from './NotificationBell';
import { getSubdomainUrl } from '../../utils/domain';
import { getCentralAuthUrl } from '../../utils/authRedirect';
import ToolImage from './ToolImage';




const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { tools, featuredTools, popularTools, newTools } = useTools();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Tool[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
  const isPro = normalizedPlan.includes('pro') || normalizedPlan.includes('max') || normalizedPlan.includes('ultra') || normalizedPlan.includes('admin') || userProfile?.role === 'admin';

  // Combine all available tools for search
  const allTools = React.useMemo(() => {
    const combined = [...tools, ...featuredTools, ...popularTools, ...newTools];
    return Array.from(new Set(combined.map(t => t.id)))
      .map(id => combined.find(t => t.id === id)!);
  }, [tools, featuredTools, popularTools, newTools]);

  useEffect(() => {
    if (searchQuery.trim().length > 0 && isSearchOpen) {
      const query = searchQuery.toLowerCase();
      const filtered = allTools.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allTools, isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tools?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  // Determine if we are on a page with a dark hero section where the navbar starts transparent
  const isDarkHeroPage = pathname === '/';
  const isTransparent = !isScrolled && isDarkHeroPage;


  // Dynamic Text Color Class
  const textColorClass = isTransparent
    ? (isDarkMode ? 'text-white hover:text-white/80' : 'text-slate-800 hover:text-indigo-600')
    : 'text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400';

  // Dynamic Icon Class for UserProfile
  const iconBgClass = isTransparent
    ? (isDarkMode ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-indigo-50 text-indigo-600 backdrop-blur-md')
    : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400';

  return (
    <>

      <nav
        className={`relative z-50 transition-all duration-200 border-b ${isScrolled
          ? 'bg-[#ffffff]/95 backdrop-blur-sm border-[#d2d2c8]'
          : 'bg-[#ffffff] border-[#d2d2c8]'
          }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-2xl font-medium tracking-tight text-[#14140f]">
                TOLZY
              </span>
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase px-2 py-0.5 rounded-full bg-[#f5f5eb] text-[#6e6e64] border border-[#d2d2c8]">
                DIRECTORY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-7">
              <Link href="/" className="text-[15px] font-medium text-[#14140f] hover:text-[#6e6e64] transition-colors">الرئيسية</Link>
              <Link href="/tools" className="text-[15px] font-medium text-[#14140f] hover:text-[#6e6e64] transition-colors">دليل الأدوات</Link>
              
              {/* Featured External SaaS: TOLZY Flow */}
              <a
                href="https://flow.tolzy.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] font-medium text-xs hover:border-[#14140f] transition-all group"
                title="TOLZY Flow - AI Office Suite"
              >
                <span>TOLZY Flow</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full bg-[#beff50] text-[#14140f]">
                  AI SUITE
                </span>
                <ExternalLink className="w-3 h-3 text-[#6e6e64] group-hover:text-[#14140f] transition-colors" />
              </a>
              
              {/* Resources Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-[15px] font-medium text-[#14140f] hover:text-[#6e6e64] transition-colors py-2">
                  المصادر
                  <ChevronDown className="w-4 h-4 text-[#6e6e64] transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full right-0 w-72 bg-[#ffffff] rounded-[18px] border border-[#d2d2c8] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 p-3 z-50">
                  <div className="flex flex-col gap-1">
                    <Link href={getSubdomainUrl('community', '/community')} className="flex items-start gap-3 p-3 rounded-[12px] hover:bg-[#f5f5eb] transition-colors group/link">
                      <div className="w-9 h-9 rounded-[8px] bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-[#14140f] text-sm">المجتمع التقني</div>
                        <div className="text-[11px] text-[#6e6e64]">تواصل مع المطورين والتقنيين</div>
                      </div>
                    </Link>
                    <Link href="/docs" className="flex items-start gap-3 p-3 rounded-[12px] hover:bg-[#f5f5eb] transition-colors group/link">
                      <div className="w-9 h-9 rounded-[8px] bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-[#14140f] text-sm">التوثيق</div>
                        <div className="text-[11px] text-[#6e6e64]">أدلة وشروحات استخدام الدليل</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search Bar */}
              <div className={`relative flex items-center transition-all duration-200 ${isSearchOpen ? 'w-64' : 'w-9'}`}>
                <form onSubmit={handleSearch} className={`absolute right-0 flex items-center ${isSearchOpen ? 'w-full' : 'w-9 justify-end'}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="بحث سريع عن أداة..."
                    className={`w-full bg-[#f5f5eb] text-[#14140f] rounded-[8px] border border-[#d2d2c8] py-2 pr-9 pl-3 text-sm focus:outline-none focus:border-[#14140f] transition-all ${isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible w-0'}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isSearchOpen && searchQuery) {
                        handleSearch({ preventDefault: () => { } } as React.FormEvent);
                      } else {
                        setIsSearchOpen(!isSearchOpen);
                        if (!isSearchOpen) {
                          setTimeout(() => {
                            const input = document.querySelector('input[placeholder="بحث سريع عن أداة..."]') as HTMLInputElement;
                            if (input) input.focus();
                          }, 100);
                        }
                      }
                    }}
                    className="absolute right-0 p-2 rounded-full text-[#14140f] hover:text-[#6e6e64] transition-colors z-10"
                    aria-label="بحث"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full right-0 w-64 mt-2 bg-[#ffffff] rounded-[18px] border border-[#d2d2c8] overflow-hidden z-50 block">
                    {suggestions.map((tool, idx) => (
                      <Link
                        key={`${tool.id}-${idx}`}
                        href={`/tools/${tool.id}`}
                        className="block px-4 py-2.5 hover:bg-[#f5f5eb] transition-colors border-b border-[#f5f5eb] last:border-none"
                      >
                        <div className="flex items-center gap-3">
                          <ToolImage
                            name={tool.name}
                            categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                            size="sm"
                            className="!w-7 !h-7 !rounded-[6px]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#14140f] truncate">{tool.name}</p>
                            <p className="text-[10px] text-[#6e6e64] truncate">{tool.description.substring(0, 30)}...</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {user || userProfile ? (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <UserProfile className="text-[#14140f]" iconClassName="bg-[#f5f5eb] text-[#14140f]" />
                </div>
              ) : (
                <Link
                  href={getCentralAuthUrl()}
                  prefetch={false}
                  className="px-3 sm:px-5 py-1.5 sm:py-2.5 bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] text-xs sm:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 sm:gap-2 shrink-0"
                >
                  <span className="hidden xs:inline">تسجيل الدخول</span>
                  <span className="xs:hidden">دخول</span>
                </Link>
              )}
            </div>

            {/* Mobile Toggle — hidden since bottom nav handles mobile nav */}
            <button
              aria-label="Toggle menu"
              onClick={() => setIsOpen(!isOpen)}
              className={`hidden p-2 rounded-xl transition-colors ${isTransparent
                ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800')
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav >

      {/* Mobile Menu */}
      {
        isOpen && (
          <div className="fixed inset-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl lg:hidden pt-24 px-6 pb-6 overflow-y-auto animate-fade-in">
            <div className="flex flex-col gap-6">
              {/* Mobile User Profile Section */}
              {(user || userProfile) && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center overflow-hidden">
                      {user?.photoURL ? (
                        <Image src={user.photoURL!} alt="User" width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-5 h-5 text-indigo-600 dark:text-indigo-400">
                          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {user?.displayName || 'المستخدم'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-medium"
                      >
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        لوحة التحكم
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      الملف الشخصي
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-slate-600 dark:text-slate-300 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}

              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-slate-800 dark:text-white">الرئيسية</span>
              </Link>
              {/* Featured External SaaS: TOLZY Flow */}
              <a 
                href="https://flow.tolzy.me" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-800 dark:text-white">TOLZY Flow</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">AI Office Suite</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">توليد المستندات والتقارير وملفات Word & Excel</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>

              {/* Mobile Resources Dropdown */}
              <div className="space-y-2">
                <button
                  onClick={() => setIsMobileResourcesOpen(!isMobileResourcesOpen)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">المصادر</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isMobileResourcesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileResourcesOpen && (
                  <div className="pr-4 space-y-2 animate-fade-in-down flex flex-col gap-2">
                    <Link href="/community" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">المجتمع</span>
                    </Link>
                    <Link href="/docs" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">التوثيق</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

              {!(user || userProfile) && (
                <Link
                  href={`/auth${pathname !== '/' && pathname !== '/auth' ? `?redirect=${encodeURIComponent(pathname)}` : ''}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  ابدأ الآن مجاناً
                </Link>
              )}

              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              >
                <span className="font-bold text-slate-600 dark:text-slate-300">المظهر</span>
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>
            </div>
          </div>
        )
      }
    </>
  );
};

export default Navbar;

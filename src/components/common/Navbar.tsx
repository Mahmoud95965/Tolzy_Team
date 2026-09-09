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
  GraduationCap,
  Users,
  History,
  BookOpen,
  Wand2,
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
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
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
        className={`relative z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5 shadow-sm'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-2 group pl-2">
              <div className="relative flex items-center">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <Image 
                  src="/tolzy-logo.svg" 
                  alt="TOLZY" 
                  width={100} 
                  height={100} 
                  className="w-10 h-10 relative z-10 transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className={`hidden lg:flex items-center gap-8 transition-all duration-300`}>
              <Link href="/" className={`text-[15px] font-bold transition-colors ${textColorClass}`}>الرئيسية</Link>
              
              {/* Products Dropdown */}
              <div className="relative group">
                <button className={`flex items-center gap-1 text-[15px] font-bold transition-colors ${textColorClass} py-2`}>
                  المنتجات
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full right-[-80px] w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 p-3 z-50">
                  <div className="flex flex-col gap-1">
                    <Link 
                      href={getSubdomainUrl('build', '/build')} 
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/link relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
                      <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 group-hover/link:scale-110 transition-transform relative z-10">
                        <Wand2 className="w-5 h-5" />
                      </div>
                      <div className="text-right flex-1 relative z-10">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-800 dark:text-white text-sm">TOLZY Build</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.3)]">PRO</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">ابنِ فكرة مشروعك بالكامل باستخدام الذكاء الاصطناعي في ثوانٍ.</div>
                      </div>
                    </Link>
                    <Link href={getSubdomainUrl('flow', '/axiom')} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/link relative">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover/link:scale-110 transition-transform">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div className="text-right flex-1">
                        <div className="font-bold text-slate-800 dark:text-white mb-0.5 text-sm">AXIOM Flow</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">توليد المستندات والتقارير وملفات Word & Excel بالذكاء الاصطناعي</div>
                      </div>
                    </Link>
                    <Link href={getSubdomainUrl('omnilearn', '/learn/omnilearn')} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/link relative">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover/link:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="text-right flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-800 dark:text-white text-sm">TOLZY OmniLearn</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 uppercase tracking-wider">NEW</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">معالجة وتلخيص الفيديوهات والمصادر بالذكاء الاصطناعي</div>
                      </div>
                    </Link>
                    <Link href={getSubdomainUrl('tools', '/tools')} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/link relative">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover/link:scale-110 transition-transform">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="text-right flex-1">
                        <div className="font-bold text-slate-800 dark:text-white mb-0.5 text-sm">دليل الأدوات</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">اكتشف أكثر من 1000 أداة وتطبيق ذكاء اصطناعي</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Resources Dropdown */}
              <div className="relative group">
                <button className={`flex items-center gap-1 text-[15px] font-bold transition-colors ${textColorClass} py-2`}>
                  المصادر
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full right-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 p-3 z-50">
                  <div className="flex flex-col gap-1">
                    <Link href={getSubdomainUrl('community', '/community')} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/link">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover/link:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800 dark:text-white mb-0.5 text-sm">المجتمع</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">تواصل مع المطورين وصناع المحتوى</div>
                      </div>
                    </Link>
                    <Link href="/pulse" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/link">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover/link:scale-110 transition-transform">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800 dark:text-white mb-0.5 text-sm">TOLZY Pulse</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">نبض التحديثات والميزات الجديدة</div>
                      </div>
                    </Link>
                    <Link href="/docs" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/link">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover/link:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800 dark:text-white mb-0.5 text-sm">التوثيق</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">أدلة وشروحات استخدام المنصة</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <Link href={getSubdomainUrl('learn', '/learn')} className={`text-[15px] font-bold transition-colors ${textColorClass}`}>Tolzy Learn</Link>
              <Link href="/news" className={`text-[15px] font-bold transition-colors ${textColorClass}`}>الأخبار</Link>
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Search Bar */}
              <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-10'}`}>
                <form onSubmit={handleSearch} className={`absolute right-0 flex items-center ${isSearchOpen ? 'w-full' : 'w-10 justify-end'}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="بحث عن أدوات..."
                    className={`w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-full py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible w-0'}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isSearchOpen && searchQuery) {
                        handleSearch({ preventDefault: () => { } } as React.FormEvent);
                      } else {
                        setIsSearchOpen(!isSearchOpen);
                        if (!isSearchOpen) {
                          // Focus input when opening
                          setTimeout(() => {
                            const input = document.querySelector('input[placeholder="بحث عن أدوات..."]') as HTMLInputElement;
                            if (input) input.focus();
                          }, 100);
                        }
                      }
                    }}

                    className={`absolute right-0 p-2.5 rounded-full transition-colors z-10 ${isTransparent && !isSearchOpen
                      ? (isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200/50 text-slate-700 hover:bg-slate-200')
                      : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full right-0 w-64 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in block">
                    {suggestions.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-none"
                      >
                        <div className="flex items-center gap-3">
                          <ToolImage
                            name={tool.name}
                            categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                            size="sm"
                            className="!w-8 !h-8 !rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{tool.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{tool.description.substring(0, 30)}...</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-full transition-colors ${isTransparent
                  ? (isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200/50 text-slate-700 hover:bg-slate-200')
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user || userProfile ? (
                <div className="flex items-center gap-1">
                  <NotificationBell />
                  <UserProfile className={textColorClass} iconClassName={iconBgClass} />
                </div>
              ) : (
                <Link
                  href={getCentralAuthUrl()}
                  prefetch={false}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center gap-2"
                >
                  ابدأ الآن
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

              {/* Mobile Products Dropdown */}
              <div className="space-y-2">
                <button
                  onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">المنتجات</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileProductsOpen && (
                  <div className="pr-4 space-y-2 animate-fade-in-down flex flex-col gap-2">
                    <Link href="/build" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <Wand2 className="w-4 h-4 text-violet-500" />
                        <span className="text-sm font-bold text-violet-700 dark:text-violet-300">TOLZY Build</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">AI</span>
                    </Link>
                    <Link href="/axiom" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                      <BrainCircuit className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">AXIOM</span>
                    </Link>
                    <Link href={getSubdomainUrl('tools', '/tools')} onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">دليل الأدوات</span>
                    </Link>
                  </div>
                )}
              </div>

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
                    <Link href="/pulse" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                      <Activity className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">TOLZY Pulse</span>
                    </Link>
                    <Link href="/docs" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">التوثيق</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/news"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-slate-800 dark:text-white">الأخبار والشروحات</span>
              </Link>

              <Link
                href={getSubdomainUrl('learn', '/learn')}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-slate-800 dark:text-white">Tolzy Learn</span>
              </Link>

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

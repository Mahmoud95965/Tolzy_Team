"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  X, 
  Sparkles, 
  Cpu, 
  GraduationCap, 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  ChevronLeft, 
  ArrowUpRight, 
  Clock, 
  BookOpen, 
  Award, 
  Zap, 
  Globe, 
  Code2, 
  Palette, 
  Layers, 
  Video, 
  Tag,
  Shield,
  RotateCcw,
  TrendingUp,
  Compass,
  SlidersHorizontal,
  Flame,
  Check,
  ArrowLeftRight
} from 'lucide-react';
import { useTools } from '@/src/hooks/useTools';
import { useAuth } from '@/src/context/AuthContext';
import { useCompare } from '@/src/context/CompareContext';
import { Tool } from '@/src/types/tool';
import { Course } from '@/src/types/learn';
import ToolImage from '@/src/components/common/ToolImage';
import ToolDrawer from '@/src/components/tools/ToolDrawer';
import PrivacySecuritySection from '@/src/components/home/PrivacySecuritySection';
import { toast } from 'react-hot-toast';
import { updateToolSave } from '@/src/services/tool-actions.service';
import { getFallbackTools } from '@/src/data/fallbackTools';
import { NORDVPN_TOOL } from '@/src/config/affiliates';

// Filter Pills Config for Tools with Lucide Icons
const TOOL_PILLS = [
  { id: 'all', label: 'الكل', icon: Sparkles },
  { id: 'free', label: 'مجاني (Free)', icon: Tag },
  { id: 'arabic', label: 'يدعم العربية', icon: Globe },
  { id: 'video', label: 'توليد فيديو', icon: Video },
  { id: 'programming', label: 'برمجة', icon: Code2 },
  { id: 'design', label: 'تصميم', icon: Palette },
  { id: 'productivity', label: 'إنتاجية', icon: Zap },
] as const;

// Filter Pills Config for Courses with Lucide Icons
const COURSE_PILLS = [
  { id: 'all', label: 'الكل', icon: Sparkles },
  { id: 'web', label: 'تطوير الويب', icon: Code2 },
  { id: 'ai', label: 'الذكاء الاصطناعي', icon: Cpu },
  { id: 'data', label: 'علم البيانات', icon: Layers },
  { id: 'design', label: 'تصميم UI/UX', icon: Palette },
  { id: 'security', label: 'الأمن السيبراني', icon: Shield },
] as const;

// Trending quick-search tags
const TRENDING_TAGS = [
  'ChatGPT',
  'Midjourney',
  'Cursor AI',
  'Claude',
  'Canva',
  'DeepSeek',
  'v0',
  'Sora'
];

import { FALLBACK_COURSES } from '@/src/data/fallbackCourses';

const HOME_TOOLS_LIMIT = 10;
const HOME_COURSES_LIMIT = 6;

export default function UnifiedDirectoryHome() {
  const { user } = useAuth();
  const { tools, featuredTools, popularTools, newTools, isLoading: isToolsLoading, updateTool, totalToolsCount } = useTools();
  const { toggleCompare, isInCompare, comparePair } = useCompare();

  const actualTotalTools = totalToolsCount && totalToolsCount > 100 ? totalToolsCount : 1024;

  // Mode Switcher: 'tools' | 'courses'
  const [activeTab, setActiveTab] = useState<'tools' | 'courses'>('tools');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active Filter Pills
  const [activeToolPill, setActiveToolPill] = useState<string>('all');
  const [activeCoursePill, setActiveCoursePill] = useState<string>('all');

  // Tool Drawer state
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);

  // Is Mac shortcut
  const [isMac, setIsMac] = useState(false);

  // Combine and deduplicate all tools in memory (with instant fallback)
  const allTools = useMemo<Tool[]>(() => {
    const combined = [NORDVPN_TOOL, ...tools, ...featuredTools, ...popularTools, ...newTools];
    const seen = new Set<string>();
    const deduplicated: Tool[] = [];
    for (const tool of combined) {
      if (tool && tool.id && !seen.has(tool.id)) {
        seen.add(tool.id);
        deduplicated.push(tool);
      }
    }
    if (deduplicated.length === 0) {
      return [NORDVPN_TOOL, ...getFallbackTools()];
    }
    return deduplicated;
  }, [tools, featuredTools, popularTools, newTools]);

  // Spotlight Tool: Strictly NordVPN as the featured Tool of the Day
  const spotlightTool = useMemo(() => {
    const nordvpn = allTools.find(t => t.id === 'nordvpn' || t.name.toLowerCase() === 'nordvpn');
    return nordvpn || NORDVPN_TOOL;
  }, [allTools]);

  // Launch 1-click comparison between two popular tools
  const handleLaunchQuickCompare = (name1: string, name2: string) => {
    const toolA = allTools.find(t => t.name.toLowerCase().includes(name1.toLowerCase())) || allTools[0];
    const toolB = allTools.find(t => t.name.toLowerCase().includes(name2.toLowerCase()) && t.id !== toolA?.id) || allTools[1];
    if (toolA && toolB) {
      comparePair(toolA, toolB);
    }
  };

  // Fetch Supabase courses in background and merge with fallback
  useEffect(() => {
    let isMounted = true;
    setIsCoursesLoading(true);
    fetch('/api/admin/courses')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const seenIds = new Set<string>();
          const merged: Course[] = [];
          for (const item of [...data, ...FALLBACK_COURSES]) {
            if (item && item.id && !seenIds.has(item.id)) {
              seenIds.add(item.id);
              merged.push(item);
            }
          }
          setCourses(merged);
        }
      })
      .catch(err => {
        console.warn('Could not load dynamic courses, using curated fallback:', err);
      })
      .finally(() => {
        if (isMounted) setIsCoursesLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to open-tool-drawer custom event
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) {
        setSelectedTool(e.detail);
        setIsDrawerOpen(true);
      }
    };
    window.addEventListener('open-tool-drawer' as any, handler);
    return () => window.removeEventListener('open-tool-drawer' as any, handler);
  }, []);

  // Instant In-Memory Filter for Tools
  const filteredTools = useMemo(() => {
    let result = allTools;

    // Filter pill matching
    if (activeToolPill !== 'all') {
      result = result.filter(tool => {
        const cats = Array.isArray(tool.category) ? tool.category : [tool.category];
        const tags = Array.isArray(tool.tags) ? tool.tags : [];
        const features = Array.isArray(tool.features) ? tool.features : [];
        const subcats = Array.isArray(tool.subcategory) 
          ? tool.subcategory 
          : tool.subcategory ? [tool.subcategory] : [];
        const haystack = `${tool.name} ${tool.description || ''} ${cats.join(' ')} ${tags.join(' ')} ${features.join(' ')} ${subcats.join(' ')}`.toLowerCase();

        switch (activeToolPill) {
          case 'free':
            return tool.pricing === 'Free';
          case 'arabic':
            return (
              haystack.includes('عرب') || 
              haystack.includes('arabic') || 
              tags.some(t => String(t).toLowerCase().includes('arabic'))
            );
          case 'video':
            return (
              cats.some(c => String(c).toLowerCase().includes('video') || String(c).includes('فيديو')) ||
              subcats.some(s => String(s).toLowerCase().includes('video')) ||
              haystack.includes('video') || 
              haystack.includes('فيديو')
            );
          case 'programming':
            return (
              cats.some(c => String(c).toLowerCase().includes('programming') || String(c).includes('برمج') || String(c).toLowerCase().includes('code')) ||
              subcats.some(s => String(s).toLowerCase().includes('code')) ||
              haystack.includes('programming') || 
              haystack.includes('code') || 
              haystack.includes('developer') || 
              haystack.includes('برمج')
            );
          case 'design':
            return (
              cats.some(c => String(c).toLowerCase().includes('design') || String(c).includes('تصميم') || String(c).toLowerCase().includes('3d')) ||
              subcats.some(s => String(s).toLowerCase().includes('design')) ||
              haystack.includes('design') || 
              haystack.includes('تصميم') || 
              haystack.includes('ui/ux') || 
              haystack.includes('graphic')
            );
          case 'productivity':
            return (
              cats.some(c => String(c).toLowerCase().includes('productivity') || String(c).includes('إنتاج') || String(c).toLowerCase().includes('automation')) ||
              subcats.some(s => String(s).toLowerCase().includes('task') || String(s).toLowerCase().includes('note')) ||
              haystack.includes('productivity') || 
              haystack.includes('إنتاج') || 
              haystack.includes('workflow') || 
              haystack.includes('أتمت')
            );
          default:
            return true;
        }
      });
    }

    // Search query matching (0ms instantaneous)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(tool => {
        const cats = Array.isArray(tool.category) ? tool.category : [tool.category];
        const tags = Array.isArray(tool.tags) ? tool.tags : [];
        const features = Array.isArray(tool.features) ? tool.features : [];
        const haystack = `${tool.name} ${tool.description || ''} ${tool.longDescription || ''} ${cats.join(' ')} ${tags.join(' ')} ${features.join(' ')} ${tool.pricing || ''}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    return result;
  }, [allTools, activeToolPill, searchQuery]);

  // Instant In-Memory Filter for Courses
  const filteredCourses = useMemo(() => {
    let result = courses;

    // Filter pill matching
    if (activeCoursePill !== 'all') {
      result = result.filter(course => {
        const cat = (course.category || '').toLowerCase();
        const title = (course.title || '').toLowerCase();
        const desc = (course.description || '').toLowerCase();
        const haystack = `${cat} ${title} ${desc}`;

        switch (activeCoursePill) {
          case 'web':
            return haystack.includes('ويب') || haystack.includes('web') || haystack.includes('front') || haystack.includes('fullstack') || haystack.includes('react') || haystack.includes('next');
          case 'ai':
            return haystack.includes('ذكاء') || haystack.includes('ai') || haystack.includes('machine learning') || haystack.includes('llm') || haystack.includes('deep');
          case 'data':
            return haystack.includes('بيانات') || haystack.includes('data') || haystack.includes('python') || haystack.includes('pandas');
          case 'design':
            return haystack.includes('تصميم') || haystack.includes('ui') || haystack.includes('ux') || haystack.includes('figma') || haystack.includes('design');
          case 'security':
            return haystack.includes('أمن') || haystack.includes('security') || haystack.includes('cyber') || haystack.includes('اختراق') || haystack.includes('شبك');
          default:
            return true;
        }
      });
    }

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(course => {
        const haystack = `${course.title || ''} ${course.description || ''} ${course.instructor || ''} ${course.category || ''} ${course.platform || ''} ${course.level || ''}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    return result;
  }, [courses, activeCoursePill, searchQuery]);

  // Slices for Home Page (Strict quota optimization: 10 tools, 6 courses)
  const displayedTools = useMemo(() => {
    return filteredTools.slice(0, HOME_TOOLS_LIMIT);
  }, [filteredTools]);

  const displayedCourses = useMemo(() => {
    return filteredCourses.slice(0, HOME_COURSES_LIMIT);
  }, [filteredCourses]);

  // Tool Save / Bookmark Handler
  const handleToggleSave = async (e: React.MouseEvent, tool: Tool) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('يجب تسجيل الدخول لحفظ الأداة في قائمتك المفضلة');
      return;
    }

    const isCurrentlySaved = Boolean(tool.savedBy?.includes(user.uid));
    const nextSavedState = !isCurrentlySaved;

    const newSavedBy = nextSavedState
      ? [...(tool.savedBy || []), user.uid]
      : (tool.savedBy || []).filter(id => id !== user.uid);

    updateTool(tool.id, { savedBy: newSavedBy });
    toast.success(nextSavedState ? 'تم حفظ الأداة في المفضلة' : 'تمت الإزالة من المفضلة');

    try {
      await updateToolSave(tool.id, user.uid, nextSavedState);
    } catch (err: any) {
      console.error('Save error:', err);
    }
  };

  const pricingBadgeConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    Free: { label: 'مجاني', bg: 'bg-[#ffffff]', text: 'text-[#14140f]', border: 'border-[#d2d2c8]' },
    Freemium: { label: 'مزيج مجاني', bg: 'bg-[#ffffff]', text: 'text-[#14140f]', border: 'border-[#d2d2c8]' },
    Paid: { label: 'مدفوع', bg: 'bg-[#ffffff]', text: 'text-[#14140f]', border: 'border-[#d2d2c8]' },
    Subscription: { label: 'اشتراك دوري', bg: 'bg-[#ffffff]', text: 'text-[#14140f]', border: 'border-[#d2d2c8]' },
  };

  const isFiltered = searchQuery.trim() !== '' || (activeTab === 'tools' ? activeToolPill !== 'all' : activeCoursePill !== 'all');

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveToolPill('all');
    setActiveCoursePill('all');
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#14140f] pb-24 overflow-x-hidden selection:bg-[#beff50] selection:text-[#14140f]" dir="rtl">
      
      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36">
        
        {/* ========================================================= */}
        {/* 1. HERO SECTION: Perk Editorial Layout                   */}
        {/* ========================================================= */}
        <section className="text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto mb-8 sm:mb-10 pt-1 sm:pt-2">
          
          {/* Eyebrow status pill */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium uppercase tracking-[0.05em] sm:tracking-[0.1em] bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8]">
            <span className="w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f] shrink-0" />
            <span className="hidden sm:inline">دليل ومحرك بحث الأدوات التقنية والكورسات الأول عربياً</span>
            <span className="sm:hidden">أكبر دليل ومحرك بحث للأدوات التقنية</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-2xl sm:text-5xl lg:text-7xl font-bold tracking-tight sm:tracking-[-0.03em] leading-tight sm:leading-[1.08] text-[#14140f]">
            TOLZY — محرك بحث ودليل الأدوات التقنية
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-[#6e6e64] max-w-2xl mx-auto font-normal leading-relaxed px-2">
            اكتشف وقارن بين أكثر من {actualTotalTools} أداة ذكاء اصطناعي و{courses.length > 0 ? courses.length : 6} مسارات تقنية معتمدة بسرعة فائقة وبدون أي إعلانات.
          </p>

          {/* Value Metric Strip (Parchment Cards, responsive, no elevation) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-4 max-w-3xl mx-auto pt-1 sm:pt-2">
            <div className="p-2 sm:p-5 rounded-xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] text-center shadow-none">
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[#14140f] font-bold text-base sm:text-2xl md:text-3xl font-mono">
                <Cpu className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#14140f]" />
                <span>+{actualTotalTools}</span>
              </div>
              <div className="text-[9px] sm:text-xs font-normal text-[#6e6e64] mt-0.5 sm:mt-1 uppercase tracking-[0.05em]">أداة ذكاء اصطناعي</div>
            </div>

            <div className="p-2 sm:p-5 rounded-xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] text-center shadow-none">
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[#14140f] font-bold text-base sm:text-2xl md:text-3xl font-mono">
                <GraduationCap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#14140f]" />
                <span>+{courses.length > 0 ? courses.length : 6}</span>
              </div>
              <div className="text-[9px] sm:text-xs font-normal text-[#6e6e64] mt-0.5 sm:mt-1 uppercase tracking-[0.05em]">مسار تعليمي</div>
            </div>

            <div className="p-2 sm:p-5 rounded-xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] text-center shadow-none">
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[#14140f] font-bold text-base sm:text-2xl md:text-3xl font-mono">
                <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#14140f]" />
                <span>0ms</span>
              </div>
              <div className="text-[9px] sm:text-xs font-normal text-[#6e6e64] mt-0.5 sm:mt-1 uppercase tracking-[0.05em]">بحث فوري فائق</div>
            </div>

            <div className="p-2 sm:p-5 rounded-xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] text-center shadow-none">
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[#14140f] font-bold text-base sm:text-2xl md:text-3xl font-mono">
                <Globe className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#14140f]" />
                <span>100%</span>
              </div>
              <div className="text-[9px] sm:text-xs font-normal text-[#6e6e64] mt-0.5 sm:mt-1 uppercase tracking-[0.05em]">محتوى عربي منسق</div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. INSTANT SEARCH BAR with Cmd+K / Ctrl+K badge           */}
        {/* ========================================================= */}
        <div className="max-w-3xl mx-auto mb-4 sm:mb-6">
          <div className="flex items-center bg-[#ffffff] border border-[#d2d2c8] focus-within:border-[#14140f] rounded-2xl sm:rounded-[28px] p-1.5 sm:p-2 transition-colors">
            <div className="p-1.5 sm:p-3 text-[#6e6e64]">
              <Search className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'tools'
                  ? `ابحث في أكثر من ${actualTotalTools} أداة ذكاء اصطناعي...`
                  : `ابحث في ${courses.length > 0 ? courses.length : 6} مسارات تعليمية...`
              }
              className="w-full bg-transparent text-[#14140f] placeholder-[#6e6e64] text-xs sm:text-base font-normal px-1.5 sm:px-2 py-1.5 sm:py-2 focus:outline-none"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1.5 rounded-full text-[#6e6e64] hover:text-[#14140f] hover:bg-[#f5f5eb] transition-all ml-1"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* AI Search Quick Action */}
            <Link
              href={searchQuery.trim() ? `/tools?q=${encodeURIComponent(searchQuery)}&ai=true` : '/tools?ai=true'}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[#14140f] bg-[#beff50] hover:bg-[#abf03c] border border-[#14140f] rounded-full transition-all shrink-0 ml-1 select-none"
              title="البحث الذكي بالذكاء الاصطناعي"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#14140f]" />
              <span className="hidden xs:inline">بحث ذكي (AI)</span>
            </Link>

            {/* Keyboard Shortcut Badge */}
            <div className="hidden sm:flex items-center pl-2">
              <kbd className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-[#6e6e64] bg-[#f5f5eb] border border-[#d2d2c8] rounded-full select-none">
                {isMac ? '⌘' : 'Ctrl'} + K
              </kbd>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. UNIFIED MODE SWITCHER (Responsive Segmented Toggle)    */}
        {/* ========================================================= */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto mb-4 sm:mb-6">
          <div className="grid grid-cols-2 p-1 sm:p-1.5 rounded-2xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] shadow-sm">
            {/* Tab 1: Tools */}
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 rounded-xl sm:rounded-[24px] text-xs sm:text-base font-medium transition-all select-none cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-[#beff50] text-[#14140f] shadow-sm border border-[#14140f]/15'
                  : 'text-[#6e6e64] hover:text-[#14140f]'
              }`}
            >
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="sm:hidden">الأدوات</span>
              <span className="hidden sm:inline">الأدوات التقنية</span>
              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'tools'
                  ? 'bg-[#14140f] text-[#ffffff] font-medium'
                  : 'bg-[#ffffff] text-[#6e6e64] border border-[#d2d2c8]'
              }`}>
                +{actualTotalTools}
              </span>
            </button>

            {/* Tab 2: Courses */}
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 rounded-xl sm:rounded-[24px] text-xs sm:text-base font-medium transition-all select-none cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-[#beff50] text-[#14140f] shadow-sm border border-[#14140f]/15'
                  : 'text-[#6e6e64] hover:text-[#14140f]'
              }`}
            >
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="sm:hidden">الكورسات</span>
              <span className="hidden sm:inline">مسارات التعلّم</span>
              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 rounded-full shrink-0 ${
                activeTab === 'courses'
                  ? 'bg-[#14140f] text-[#ffffff] font-medium'
                  : 'bg-[#ffffff] text-[#6e6e64] border border-[#d2d2c8]'
              }`}>
                {courses.length > 0 ? `+${courses.length}` : '+6'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Discovery Row: Trending Searches & Quick Comparisons */}
        <div className="max-w-3xl mx-auto mb-5 sm:mb-8 space-y-2">
          {/* Trending Searches Row */}
          <div className="flex items-center gap-2 text-xs text-[#6e6e64] overflow-x-auto pb-1 scrollbar-none">
            <span className="flex items-center gap-1 font-medium shrink-0 text-[#14140f] text-[11px] sm:text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>شائع:</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setActiveTab('tools');
                    setSearchQuery(tag);
                  }}
                  className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#f5f5eb] hover:bg-[#beff50] text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] transition-colors text-[11px] sm:text-xs font-normal"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Comparisons Row */}
          <div className="flex items-center gap-2 text-xs text-[#6e6e64] overflow-x-auto pb-1 scrollbar-none">
            <span className="flex items-center gap-1 font-medium shrink-0 text-[#14140f] text-[11px] sm:text-xs">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#14140f]" />
              <span>مقارنات سريعة:</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { name1: 'ChatGPT', name2: 'Claude' },
                { name1: 'Midjourney', name2: 'DALL-E' },
                { name1: 'Cursor', name2: 'v0' },
                { name1: 'Make.com', name2: 'Zapier' },
              ].map((pair, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLaunchQuickCompare(pair.name1, pair.name2)}
                  className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#ffffff] hover:bg-[#beff50] text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] transition-all text-[11px] sm:text-xs font-normal flex items-center gap-1 cursor-pointer shadow-none select-none shrink-0"
                >
                  <span className="font-medium">{pair.name1}</span>
                  <span className="text-[#6e6e64] text-[9px] sm:text-[10px]">vs</span>
                  <span className="font-medium">{pair.name2}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. QUICK FILTER PILLS & STATUS COUNTER                     */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Pills Slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
            {activeTab === 'tools' ? (
              TOOL_PILLS.map((pill) => {
                const Icon = pill.icon;
                const isActive = activeToolPill === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setActiveToolPill(pill.id)}
                    className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-colors select-none ${
                      isActive
                        ? 'bg-[#beff50] text-[#14140f] font-medium border border-[#14140f]'
                        : 'bg-[#ffffff] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] font-normal'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pill.label}</span>
                  </button>
                );
              })
            ) : (
              COURSE_PILLS.map((pill) => {
                const Icon = pill.icon;
                const isActive = activeCoursePill === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setActiveCoursePill(pill.id)}
                    className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-colors select-none ${
                      isActive
                        ? 'bg-[#beff50] text-[#14140f] font-medium border border-[#14140f]'
                        : 'bg-[#ffffff] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] font-normal'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pill.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Action & Real-time Result Counter */}
          <div className="flex items-center gap-3 shrink-0">
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-normal text-[#14140f] hover:text-[#6e6e64] px-3.5 py-1.5 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] transition-colors"
                title="إعادة ضبط الفلاتر والبحث"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            )}

            <div className="text-xs sm:text-sm font-normal text-[#6e6e64] flex items-center gap-2">
              <span>النتائج:</span>
              <span className="px-3 py-0.5 rounded-full bg-[#f5f5eb] text-[#14140f] font-medium font-mono border border-[#d2d2c8]">
                {activeTab === 'tools' 
                  ? (isFiltered ? filteredTools.length : actualTotalTools) 
                  : (isFiltered ? filteredCourses.length : courses.length)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. SPOTLIGHT BENTO CARD (Electric Lime Accent Panel)      */}
        {/* ========================================================= */}
        {activeTab === 'tools' && !isFiltered && spotlightTool && (
          <div 
            onClick={() => {
              setSelectedTool(spotlightTool);
              setIsDrawerOpen(true);
            }}
            className="mb-6 sm:mb-8 p-4 sm:p-8 rounded-2xl sm:rounded-[28px] bg-[#beff50] border border-[#14140f] shadow-none cursor-pointer relative overflow-hidden group transition-all"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative z-10">
              <div className="flex items-center gap-3.5 sm:gap-6">
                <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-[18px] bg-[#ffffff] border border-[#14140f]/20 shadow-none shrink-0">
                  <ToolImage
                    name={spotlightTool.name}
                    imageUrl={spotlightTool.imageUrl}
                    categoryName={Array.isArray(spotlightTool.category) ? spotlightTool.category[0] : spotlightTool.category}
                    size="lg"
                  />
                </div>

                <div className="text-right space-y-1 sm:space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.05em] sm:tracking-[0.1em] bg-[#14140f] text-[#ffffff]">
                      ⭐ أداة اليوم المختارة
                    </span>
                    {spotlightTool.rating && spotlightTool.rating > 0 ? (
                      <span className="text-xs font-medium text-[#14140f] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#14140f]" />
                        {spotlightTool.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#14140f] bg-[#ffffff] border border-[#14140f]/20 px-2.5 py-0.5 rounded-full">
                        جديد
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-3xl font-bold sm:font-medium tracking-tight text-[#14140f]">
                    {spotlightTool.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#14140f]/80 font-normal max-w-xl line-clamp-2 leading-relaxed">
                    {spotlightTool.description || spotlightTool.longDescription}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end pt-1 sm:pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTool(spotlightTool);
                    setIsDrawerOpen(true);
                  }}
                  className="flex-1 md:flex-initial px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-[28px] border border-[#14140f] bg-[#ffffff] text-[#14140f] hover:bg-[#f5f5eb] font-medium text-xs sm:text-sm transition-colors shadow-none text-center"
                >
                  <span className="hidden sm:inline">عرض المراجعة والتفاصيل</span>
                  <span className="sm:hidden">التفاصيل</span>
                </button>

                <a
                  href={spotlightTool.url}
                  target="_blank"
                  rel={spotlightTool.id === 'nordvpn' ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-[28px] bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] font-medium text-xs sm:text-sm transition-colors shadow-none text-center"
                >
                  <span>زيارة الموقع</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. RESPONSIVE BENTO-STYLE GRID                           */}
        {/* ========================================================= */}
        {activeTab === 'tools' ? (
          /* ---------------- TOOLS BENTO GRID ---------------- */
          filteredTools.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {displayedTools.map((tool, index) => {
                  const isSaved = user && tool.savedBy?.includes(user.uid);
                  const isCompared = isInCompare(tool.id);
                  const primaryCategory = Array.isArray(tool.category) ? tool.category[0] : tool.category;
                  const pricingBadge = pricingBadgeConfig[tool.pricing] || pricingBadgeConfig.Freemium;

                  // Concise real pros & cons preview (no fake placeholders)
                  const displayPros = (tool.pros && tool.pros.length > 0)
                    ? tool.pros.slice(0, 2)
                    : (tool.features && tool.features.length > 0)
                      ? tool.features.slice(0, 2)
                      : [];

                  const displayCons = (tool.cons && tool.cons.length > 0)
                    ? tool.cons.slice(0, 1)
                    : [];

                  return (
                    <div
                      key={`${tool.id}-${index}`}
                      onClick={() => {
                        setSelectedTool(tool);
                        setIsDrawerOpen(true);
                      }}
                      className="group relative bg-[#f5f5eb] border border-[#d2d2c8] hover:border-[#14140f] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 transition-colors shadow-none cursor-pointer flex flex-col justify-between overflow-hidden text-right select-none"
                    >
                      {/* Top Row: Logo, Name, Rating & Bookmark / Compare */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          {/* Bookmark & Compare Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Compare Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompare(tool);
                              }}
                              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                                isCompared
                                  ? 'bg-[#beff50] border-[#14140f] text-[#14140f]'
                                  : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f] hover:border-[#14140f]'
                              }`}
                              title={isCompared ? 'إزالة من قائمة المقارنة' : 'إضافة إلى المقارنة'}
                              aria-label="مقارنة الأداة"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Bookmark Button */}
                            <button
                              onClick={(e) => handleToggleSave(e, tool)}
                              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                                isSaved
                                  ? 'bg-[#beff50] border-[#14140f] text-[#14140f]'
                                  : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f] hover:border-[#14140f]'
                              }`}
                              title={isSaved ? 'إلغاء الحفظ' : 'حفظ في المفضلة'}
                              aria-label="حفظ الأداة"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                          </div>

                          {/* Title & Metadata */}
                          <div className="flex-1 min-w-0 pr-1 text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              {tool.isFeatured && (
                                <Award className="w-3.5 h-3.5 text-[#14140f] shrink-0" />
                              )}
                              <h3 className="text-base font-medium text-[#14140f] group-hover:underline truncate">
                                {tool.name}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2 justify-end mt-1">
                              {/* Rating: Strict Real Numbers */}
                              {tool.rating && tool.rating > 0 ? (
                                <div className="flex items-center gap-1 text-[11px] font-medium text-[#14140f]">
                                  <span>{tool.rating.toFixed(1)}</span>
                                  <Star className="w-3 h-3 fill-[#14140f]" />
                                  {tool.reviewCount && tool.reviewCount > 0 ? (
                                    <span className="text-[10px] text-[#6e6e64]">({tool.reviewCount})</span>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="text-[10px] text-[#6e6e64] bg-[#ffffff] border border-[#d2d2c8] px-2 py-0.5 rounded-full">
                                  جديد
                                </span>
                              )}

                              {/* Pricing Badge */}
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium border bg-[#ffffff] text-[#14140f] border-[#d2d2c8]">
                                {pricingBadge.label}
                              </span>
                            </div>
                          </div>

                          {/* Tool Logo */}
                          <div className="shrink-0 p-1.5 rounded-[18px] bg-[#ffffff] border border-[#d2d2c8]">
                            <ToolImage
                              name={tool.name}
                              categoryName={primaryCategory}
                              subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory[0] : tool.subcategory}
                              size="md"
                            />
                          </div>
                        </div>

                        {/* 2-Line Description */}
                        <p className="text-xs sm:text-sm text-[#6e6e64] font-normal line-clamp-2 leading-relaxed mb-4">
                          {tool.description || tool.longDescription}
                        </p>

                        {/* Pros & Cons Preview (Rendered only if data exists) */}
                        {(displayPros.length > 0 || displayCons.length > 0) && (
                          <div className="space-y-1.5 pt-3 border-t border-[#d2d2c8] mb-4">
                            {displayPros.map((pro, idx) => (
                              <div key={idx} className="flex items-center justify-end gap-1.5 text-[11px] text-[#14140f] font-normal truncate">
                                <span className="truncate">{pro}</span>
                                <CheckCircle2 className="w-3 h-3 shrink-0 text-[#14140f]" />
                              </div>
                            ))}
                            {displayCons.map((con, idx) => (
                              <div key={idx} className="flex items-center justify-end gap-1.5 text-[11px] text-[#6e6e64] font-normal truncate">
                                <span className="truncate">{con}</span>
                                <XCircle className="w-3 h-3 shrink-0 text-[#6e6e64]" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Row: Direct Link & Drawer trigger */}
                      <div className="pt-3 border-t border-[#d2d2c8] flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTool(tool);
                            setIsDrawerOpen(true);
                          }}
                          className="text-xs font-medium text-[#14140f] hover:text-[#6e6e64] flex items-center gap-1 transition-colors py-1.5 px-2 rounded-full"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>التفاصيل</span>
                        </button>

                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[28px] bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] transition-colors text-xs font-medium shadow-none"
                        >
                          <span>زيارة الأداة</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* More Tools CTA Card redirecting to /tools */}
              <div className="mt-8 p-6 sm:p-8 rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#beff50] border border-[#14140f]" />
                    <h4 className="text-base sm:text-lg font-medium text-[#14140f]">
                      {isFiltered
                        ? `عرض النتائج المطابقة (${filteredTools.length} أداة) — تصفح كامل الدليل (+${actualTotalTools} أداة)`
                        : `استكشف كامل الدليل (+${actualTotalTools} أداة ذكاء اصطناعي)`}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6e6e64] font-normal">
                    تصفح الدليل الشامل الكامل مع فلاتر تفصيلية، مقارنات مباشرة، وتصنيفات دقيقة بدون أي قيود
                  </p>
                </div>
                <Link
                  href={`/tools${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : activeToolPill !== 'all' ? `?category=${encodeURIComponent(activeToolPill)}` : ''}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[28px] bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] font-medium text-xs sm:text-sm transition-colors shrink-0 shadow-none"
                >
                  <span>تصفح جميع الأدوات في صفحة الأدوات</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            /* Empty State for Tools */
            <div className="text-center py-20 px-6 bg-[#f5f5eb] rounded-[28px] border border-[#d2d2c8] max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#14140f]">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-[#14140f]">لم نتمكن من العثور على أدوات مطابقة</h3>
              <p className="text-sm text-[#6e6e64] font-normal">
                جرب البحث بكلمات أخرى أو أعد ضبط الفلاتر لتصفح كامل الدليل.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[28px] bg-[#beff50] text-[#14140f] font-medium text-sm hover:bg-[#abf03c] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة ضبط البحث والتصنيفات</span>
              </button>
            </div>
          )
        ) : (
          /* ---------------- COURSES BENTO GRID ---------------- */
          filteredCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCourses.map((course, index) => (
                  <Link
                    key={`${course.id}-${index}`}
                    href={`/learn/course/${course.id}`}
                    className="group relative bg-[#f5f5eb] border border-[#d2d2c8] hover:border-[#14140f] rounded-[28px] overflow-hidden transition-colors shadow-none flex flex-col justify-between text-right block cursor-pointer"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-[#ffffff] overflow-hidden border-b border-[#d2d2c8]">
                        <Image
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Platform Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-[#14140f] text-[#ffffff] rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                            <BookOpen className="w-3 h-3" />
                            <span>{course.platform || 'Tolzy'}</span>
                          </span>
                        </div>

                        {/* Certificate Badge */}
                        {course.hasCertificate && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-3 py-1 bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] rounded-full text-[10px] font-medium flex items-center gap-1 shadow-sm">
                              <Award className="w-3.5 h-3.5 text-[#14140f]" />
                              <span>شهادة معتمدة</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Course Content */}
                      <div className="p-6 space-y-3">
                        {/* Category & Level */}
                        <div className="flex items-center justify-between text-xs font-normal">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#ffffff] text-[#14140f] border border-[#d2d2c8] font-medium">
                            {course.category || 'تقني'}
                          </span>
                          <span className="text-[#6e6e64] flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration || '20 ساعة'}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-medium text-[#14140f] group-hover:underline line-clamp-1">
                          {course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-[#6e6e64] font-normal line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>

                        {/* Rating & Students (Real numbers only) */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#d2d2c8] text-xs text-[#6e6e64] font-normal">
                          {course.rating && course.rating > 0 ? (
                            <div className="flex items-center gap-1 font-medium text-[#14140f]">
                              <Star className="w-3.5 h-3.5 fill-[#14140f]" />
                              <span>{course.rating.toFixed(1)}</span>
                              {course.reviewsCount && course.reviewsCount > 0 ? (
                                <span className="text-[#6e6e64] font-normal">({course.reviewsCount})</span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#6e6e64] bg-[#ffffff] border border-[#d2d2c8] px-2 py-0.5 rounded-full">
                              جديد
                            </span>
                          )}

                          {course.studentsCount && course.studentsCount > 0 ? (
                            <span>{course.studentsCount} طالب مشترك</span>
                          ) : (
                            <span className="text-[#6e6e64]">متاح مجاناً</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Direct Course Action CTA */}
                    <div className="p-6 pt-0">
                      <div
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-[28px] bg-[#beff50] group-hover:bg-[#abf03c] text-[#14140f] font-medium text-sm transition-colors shadow-none"
                      >
                        <span>بدء التعلّم الآن مجاناً</span>
                        <ChevronLeft className="w-4 h-4 rtl:rotate-0" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* More Courses CTA Card redirecting to /learn */}
              <div className="mt-8 p-6 sm:p-8 rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#beff50] border border-[#14140f]" />
                    <h4 className="text-base sm:text-lg font-medium text-[#14140f]">
                      استكشف كافة مسارات التعلّم والكورسات (+{courses.length > 0 ? courses.length : 6} مسار معتمد)
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6e6e64] font-normal">
                    دورات ومسارات تدريبية كاملة مجانية مع شهادات إتمام وتطبيق عملي خطوة بخطوة
                  </p>
                </div>
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[28px] bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] font-medium text-xs sm:text-sm transition-colors shrink-0 shadow-none"
                >
                  <span>تصفح جميع الكورسات في منصة التعلّم</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            /* Empty State for Courses */
            <div className="text-center py-20 px-6 bg-[#f5f5eb] rounded-[28px] border border-[#d2d2c8] max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#14140f]">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-[#14140f]">لم نتمكن من العثور على كورسات مطابقة</h3>
              <p className="text-sm text-[#6e6e64] font-normal">
                جرب البحث بكلمات أخرى أو اختر فئة تعليمية مختلفة.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[28px] bg-[#beff50] text-[#14140f] font-medium text-sm hover:bg-[#abf03c] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة ضبط البحث والتصنيفات</span>
              </button>
            </div>
          )
        )}

        {/* ─── TOLZY × NordVPN Privacy & Secure Browsing Section ─── */}
        <PrivacySecuritySection />
      </div>

      {/* Tool Slide-over Detail Drawer */}
      <ToolDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTool(null);
        }}
        tool={selectedTool}
      />
    </div>
  );
}

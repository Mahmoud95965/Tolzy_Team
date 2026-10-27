"use client";

import React from 'react';
import {
  Briefcase,
  CheckCircle2,
  PenTool,
  FileText,
  Palette,
  Image as ImageIcon,
  Video,
  Mic,
  Music,
  Code2,
  Terminal,
  TrendingUp,
  Building2,
  GraduationCap,
  BookOpen,
  Search,
  BarChart3,
  Database,
  Box,
  Cpu,
  Bot,
  MessageSquare,
  Share2,
  Languages,
  Sparkles,
  Zap,
  Globe,
  Layers,
  Wrench,
  LucideIcon
} from 'lucide-react';

interface CategoryStyle {
  icon: LucideIcon;
  bg: string;
  text: string;
  border: string;
}

const DEFAULT_STYLE: CategoryStyle = {
  icon: Sparkles,
  bg: 'bg-indigo-500/10',
  text: 'text-indigo-500 dark:text-indigo-400',
  border: 'border-indigo-500/20'
};

const CATEGORY_MAP: Record<string, CategoryStyle> = {
  // Video & Motion
  video: { icon: Video, bg: 'bg-rose-500/10', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/20' },
  'text to video': { icon: Video, bg: 'bg-rose-500/10', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/20' },
  'video editing': { icon: Video, bg: 'bg-rose-500/10', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/20' },

  // Writing & Copywriting
  writing: { icon: PenTool, bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/20' },
  copywriting: { icon: FileText, bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/20' },
  content: { icon: FileText, bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/20' },
  translation: { icon: Languages, bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/20' },

  // Design & Image
  design: { icon: Palette, bg: 'bg-purple-500/10', text: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20' },
  image: { icon: ImageIcon, bg: 'bg-purple-500/10', text: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20' },
  creativity: { icon: Sparkles, bg: 'bg-purple-500/10', text: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20' },
  'ui/ux': { icon: Layers, bg: 'bg-purple-500/10', text: 'text-purple-500 dark:text-purple-400', border: 'border-purple-500/20' },

  // Code & Development
  programming: { icon: Code2, bg: 'bg-sky-500/10', text: 'text-sky-500 dark:text-sky-400', border: 'border-sky-500/20' },
  code: { icon: Code2, bg: 'bg-sky-500/10', text: 'text-sky-500 dark:text-sky-400', border: 'border-sky-500/20' },
  development: { icon: Terminal, bg: 'bg-sky-500/10', text: 'text-sky-500 dark:text-sky-400', border: 'border-sky-500/20' },
  dev: { icon: Terminal, bg: 'bg-sky-500/10', text: 'text-sky-500 dark:text-sky-400', border: 'border-sky-500/20' },

  // Productivity & Automation
  productivity: { icon: Briefcase, bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20' },
  automation: { icon: Zap, bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20' },
  'task management': { icon: CheckCircle2, bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/20' },

  // Business & Marketing
  business: { icon: Building2, bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/20' },
  marketing: { icon: TrendingUp, bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/20' },
  sales: { icon: TrendingUp, bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/20' },
  finance: { icon: TrendingUp, bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'border-blue-500/20' },

  // Education & Learning
  education: { icon: GraduationCap, bg: 'bg-teal-500/10', text: 'text-teal-500 dark:text-teal-400', border: 'border-teal-500/20' },
  learning: { icon: BookOpen, bg: 'bg-teal-500/10', text: 'text-teal-500 dark:text-teal-400', border: 'border-teal-500/20' },
  teaching: { icon: GraduationCap, bg: 'bg-teal-500/10', text: 'text-teal-500 dark:text-teal-400', border: 'border-teal-500/20' },

  // Research & Data Science
  research: { icon: Search, bg: 'bg-cyan-500/10', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-500/20' },
  'data science': { icon: BarChart3, bg: 'bg-cyan-500/10', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-500/20' },
  analytics: { icon: Database, bg: 'bg-cyan-500/10', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-500/20' },

  // Audio & Music
  audio: { icon: Mic, bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500 dark:text-fuchsia-400', border: 'border-fuchsia-500/20' },
  music: { icon: Music, bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500 dark:text-fuchsia-400', border: 'border-fuchsia-500/20' },
  voice: { icon: Mic, bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500 dark:text-fuchsia-400', border: 'border-fuchsia-500/20' },

  // 3D
  '3d': { icon: Box, bg: 'bg-orange-500/10', text: 'text-orange-500 dark:text-orange-400', border: 'border-orange-500/20' },

  // Communication & Chat
  communication: { icon: MessageSquare, bg: 'bg-violet-500/10', text: 'text-violet-500 dark:text-violet-400', border: 'border-violet-500/20' },
  chat: { icon: Bot, bg: 'bg-violet-500/10', text: 'text-violet-500 dark:text-violet-400', border: 'border-violet-500/20' },
  social: { icon: Share2, bg: 'bg-violet-500/10', text: 'text-violet-500 dark:text-violet-400', border: 'border-violet-500/20' },
};

function resolveCategoryStyle(categoryName?: string, subcategoryName?: string): CategoryStyle {
  const query = `${subcategoryName || ''} ${categoryName || ''}`.toLowerCase().trim();

  if (!query) return DEFAULT_STYLE;

  // Exact or direct match
  for (const [key, style] of Object.entries(CATEGORY_MAP)) {
    if (query.includes(key)) {
      return style;
    }
  }

  // Arabic keyword matching
  if (query.includes('فيديو') || query.includes('مونتاج')) return CATEGORY_MAP.video;
  if (query.includes('كتاب') || query.includes('مقال') || query.includes('نص') || query.includes('ترجم')) return CATEGORY_MAP.writing;
  if (query.includes('تصميم') || query.includes('صور') || query.includes('رسم')) return CATEGORY_MAP.design;
  if (query.includes('برمج') || query.includes('كود') || query.includes('مطور')) return CATEGORY_MAP.programming;
  if (query.includes('إنتاج') || query.includes('مهام') || query.includes('أتمت')) return CATEGORY_MAP.productivity;
  if (query.includes('أعمال') || query.includes('تسويق') || query.includes('مال')) return CATEGORY_MAP.business;
  if (query.includes('تعليم') || query.includes('دراسة') || query.includes('تدريب')) return CATEGORY_MAP.education;
  if (query.includes('بحث') || query.includes('بيانات') || query.includes('تحليل')) return CATEGORY_MAP.research;
  if (query.includes('صوت') || query.includes('موسيق')) return CATEGORY_MAP.audio;
  if (query.includes('شات') || query.includes('محادث') || query.includes('تواصل')) return CATEGORY_MAP.chat;

  return DEFAULT_STYLE;
}

const NordVpnEmblem: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="7" fill="#4687FF"/>
    <g transform="translate(4, 4)">
      <path d="M2.2838 21.5414A11.9866 11.9866 0 010 14.4832C0 7.8418 5.3727 2.4586 12 2.4586c6.6279 0 12 5.3832 12 12.0246a11.9853 11.9853 0 01-2.2838 7.0582l-5.7636-9.3783-.5565.9419.5645 2.6186L12 8.9338l-2.45 4.1447.5707 2.6451-2.0764-3.5555-5.7605 9.3733z" fill="#FFFFFF"/>
    </g>
  </svg>
);

export interface ToolImageProps {
  imageUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  categoryName?: string;
  subcategoryName?: string;
  priority?: boolean;
}

const ToolImage: React.FC<ToolImageProps> = ({
  imageUrl,
  name,
  size = 'md',
  className = '',
  categoryName,
  subcategoryName,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const { icon: Icon, bg, text, border } = resolveCategoryStyle(categoryName, subcategoryName);

  const sizeConfig = {
    sm: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
    md: { box: 'w-12 h-12 rounded-xl', icon: 'w-6 h-6' },
    lg: { box: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8' }
  };

  const { box, icon: iconSize } = sizeConfig[size] || sizeConfig.md;

  // Direct render for NordVPN official logo vector (zero latency, offline resilient)
  if (name && name.toLowerCase().includes('nordvpn')) {
    return (
      <div
        className={`${box} bg-[#ffffff] border border-[#d2d2c8] p-1 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-xs select-none overflow-hidden ${className}`}
        title={name}
        aria-label={name}
      >
        <NordVpnEmblem className="w-full h-full object-contain" />
      </div>
    );
  }

  const resolvedImageUrl = imageUrl;

  if (resolvedImageUrl && !hasError) {
    return (
      <div
        className={`${box} bg-[#ffffff] border border-[#d2d2c8] p-1 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-xs select-none overflow-hidden ${className}`}
        title={name}
        aria-label={name}
      >
        <img
          src={resolvedImageUrl}
          alt={name}
          className="w-full h-full object-contain"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${box} ${bg} ${text} ${border} border flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-xs select-none ${className}`}
      title={name}
      aria-label={name}
    >
      <Icon className={`${iconSize} stroke-[1.8]`} />
    </div>
  );
};

export default ToolImage;

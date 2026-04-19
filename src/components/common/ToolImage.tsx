"use client";
import React, { useState } from 'react';

const CATEGORY_ICON_MAP: { [key: string]: string } = {
  Video: '🎬',
  Writing: '✍️',
  Design: '🎨',
  Productivity: '⚙️',
  Programming: '💻',
  Business: '💼',
  Education: '🎓',
  Research: '🔍',
  Creativity: '✨',
  '3D': '📐',
  Automation: '⚙️',
  'Data Science': '📊',
  Games: '🎮',
  'Language Learning': '🈶',
  'Online Learning': '💻',
  'Project Management': '📊',
  Reading: '📖',
  Science: '🔬',
  Teaching: '🧑‍🏫',
  Technology: '💡',
  Memory: '🧠',
  Math: '➗',
  Communication: '💬',
  Collaboration: '🤝',
  Library: '📚',
  Lifestyle: '🌿',
  Electronics: '💡',
  Freelancing: '🧑‍💻',
  Gamification: '🏆',
  Studying: '📚',
  'Test Prep': '📝',
  Other: '🧩'
};

const getCategoryIcon = (categoryName?: string): string => {
  if (!categoryName) return '🧩';
  return CATEGORY_ICON_MAP[categoryName] || '🧩';
};

const SUBCATEGORY_STYLE_MAP: {
  [key: string]: { icon: string; gradient: string };
} = {
  // Video
  'Video Editing': { icon: '🎬', gradient: 'from-violet-500 to-indigo-500' },
  'Video Generation': { icon: '🎥', gradient: 'from-indigo-500 to-sky-500' },
  'Video Enhancement': { icon: '✨', gradient: 'from-purple-500 to-pink-500' },
  'Text to Video': { icon: '📽️', gradient: 'from-indigo-500 to-fuchsia-500' },
  'Video Analytics': { icon: '📊', gradient: 'from-sky-500 to-emerald-500' },

  // Writing
  'Content Writing': { icon: '✍️', gradient: 'from-amber-500 to-orange-500' },
  'Copywriting': { icon: '📝', gradient: 'from-orange-500 to-rose-500' },
  'Paraphrasing': { icon: '♻️', gradient: 'from-emerald-500 to-teal-500' },
  'Grammar Check': { icon: '✅', gradient: 'from-green-500 to-emerald-500' },
  'Translation': { icon: '🌐', gradient: 'from-blue-500 to-cyan-500' },
  SEO: { icon: '🔍', gradient: 'from-indigo-500 to-slate-500' },

  // Design
  'Image Generation': { icon: '🖼️', gradient: 'from-emerald-500 to-teal-500' },
  'Image Editing': { icon: '✨', gradient: 'from-teal-500 to-cyan-500' },
  'Logo Design': { icon: '🎨', gradient: 'from-purple-500 to-pink-500' },
  'UI/UX Design': { icon: '🧩', gradient: 'from-fuchsia-500 to-violet-500' },
  'Graphic Design': { icon: '🧶', gradient: 'from-rose-500 to-orange-500' },

  // Productivity
  'Task Management': { icon: '📋', gradient: 'from-sky-500 to-indigo-500' },
  'Note Taking': { icon: '🗒️', gradient: 'from-cyan-500 to-sky-500' },
  Calendar: { icon: '📅', gradient: 'from-emerald-500 to-green-500' },
  Email: { icon: '✉️', gradient: 'from-indigo-500 to-blue-500' },
  Automation: { icon: '⚙️', gradient: 'from-slate-600 to-sky-500' },
  'Project Management': { icon: '📊', gradient: 'from-indigo-600 to-emerald-500' },

  // Programming
  'Code Generation': { icon: '💻', gradient: 'from-slate-700 to-sky-500' },
  'Code Review': { icon: '🔎', gradient: 'from-slate-600 to-indigo-500' },
  Debugging: { icon: '🐞', gradient: 'from-red-500 to-orange-500' },
  Documentation: { icon: '📚', gradient: 'from-amber-500 to-emerald-500' },
  Testing: { icon: '✅', gradient: 'from-emerald-500 to-teal-500' },

  // Business
  Marketing: { icon: '📣', gradient: 'from-pink-500 to-rose-500' },
  Sales: { icon: '💼', gradient: 'from-orange-500 to-amber-500' },
  'Customer Service': { icon: '🤝', gradient: 'from-emerald-500 to-green-500' },
  Analytics: { icon: '📊', gradient: 'from-indigo-500 to-blue-500' },

  // Education
  Learning: { icon: '🎓', gradient: 'from-green-500 to-emerald-500' },
  Teaching: { icon: '🧑‍🏫', gradient: 'from-emerald-500 to-teal-500' },
  Assessment: { icon: '📝', gradient: 'from-amber-500 to-orange-500' },
  'Course Creation': { icon: '📘', gradient: 'from-indigo-500 to-sky-500' },
  'Study Tools': { icon: '📖', gradient: 'from-teal-500 to-cyan-500' },

  // Research
  'Literature Review': { icon: '📚', gradient: 'from-indigo-600 to-violet-500' },
  'Data Analysis': { icon: '📉', gradient: 'from-blue-500 to-emerald-500' },
  'Citation Management': { icon: '🔖', gradient: 'from-amber-500 to-orange-500' },
  'Academic Writing': { icon: '✒️', gradient: 'from-purple-500 to-indigo-500' },

  // Creativity
  'Music Generation': { icon: '🎵', gradient: 'from-fuchsia-500 to-violet-500' },
  'Audio Generation': { icon: '🔊', gradient: 'from-indigo-500 to-sky-500' },
  'Voice Cloning': { icon: '🗣️', gradient: 'from-rose-500 to-pink-500' },

  // 3D
  '3D Modeling': { icon: '📐', gradient: 'from-purple-500 to-indigo-600' },
  NeRF: { icon: '🧠', gradient: 'from-indigo-600 to-slate-700' },

  // Other
  Other: { icon: '🧩', gradient: 'from-slate-500 to-slate-700' }
};

const getSubcategoryStyle = (
  subcategoryName?: string,
  categoryName?: string
): { icon: string; gradient: string } => {
  if (subcategoryName && SUBCATEGORY_STYLE_MAP[subcategoryName]) {
    return SUBCATEGORY_STYLE_MAP[subcategoryName];
  }

  return {
    icon: getCategoryIcon(categoryName),
    gradient: 'from-indigo-500 to-purple-600'
  };
};

import Image from 'next/image';

// ... existing code ...

interface ToolImageProps {
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
  priority = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const sizeClass = sizeClasses[size];

  // التحقق من صحة الرابط وتصحيحه إذا لزم الأمر
  const getSanitizedImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // تصحيح المسار إذا كان يبدأ بـ public/
    if (url.startsWith('public/')) return '/' + url.replace('public/', '');
    // التأكد من أن المسار المحلي يبدأ بـ /
    if (!url.startsWith('/')) return '/' + url;
    return url;
  };

  const sanitizedImageUrl = getSanitizedImageUrl(imageUrl || '');

  // إذا لم يكن هناك URL أو حدث خطأ في التحميل
  if (!sanitizedImageUrl || imageError) {
    const { icon, gradient } = getSubcategoryStyle(subcategoryName, categoryName);

    return (
      <div
        className={`${sizeClass} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-md ${className}`}
      >
        <span className="text-2xl">
          {icon}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} relative ${className}`}>
      {/* Skeleton loader - only show if not priority and not loaded */}
      {!priority && !imageLoaded && (
        <div className={`${sizeClass} rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse absolute inset-0 z-0`} />
      )}

      {/* الصورة الفعلية */}
      <Image
        src={sanitizedImageUrl}
        alt={name}
        fill
        priority={priority}
        sizes="(max-width: 768px) 48px, 64px"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.warn(`Failed to load image for ${name}: ${sanitizedImageUrl}`);
          setImageError(true);
        }}
        className={`rounded-xl object-cover shadow-md transition-opacity duration-300 ${priority || imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
      />
    </div>
  );
};

export default ToolImage;

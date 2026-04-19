"use client";
import React from 'react';
import Link from 'next/link';
import { useTools } from '../../hooks/useTools';
import {
  Briefcase, Video, PenTool, Layout,
  Code, GraduationCap, Palette, Zap,
  Search, MessageSquare, Image as ImageIcon,
  Cpu
} from 'lucide-react';

interface CategoryData {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  link: string;
  countKey: string;
}

const AllCategoriesView: React.FC = () => {
  const { getCategoryCount } = useTools();
  const [counts, setCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const fetchCounts = async () => {
      // List of main categories to fetch counts for
      const cats = [
        'Productivity', 'Video', 'Writing', 'Business',
        'Design', 'Creativity', 'Programming', 'Education'
      ];

      const results = await Promise.all(
        cats.map(async (cat) => [cat, await getCategoryCount(cat)] as const)
      );
      setCounts(Object.fromEntries(results));
    };

    fetchCounts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const categories: CategoryData[] = [
    {
      id: 'Productivity',
      title: 'Productivity',
      titleAr: 'الإنتاجية',
      icon: Zap,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      link: '/tools?category=Productivity',
      countKey: 'Productivity'
    },
    {
      id: 'Video',
      title: 'Video',
      titleAr: 'الفيديو',
      icon: Video,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      link: '/tools?category=Video',
      countKey: 'Video'
    },
    {
      id: 'Writing',
      title: 'Writing',
      titleAr: 'الكتابة',
      icon: PenTool,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      link: '/tools?category=Writing',
      countKey: 'Writing'
    },
    {
      id: 'Business',
      title: 'Business',
      titleAr: 'الأعمال',
      icon: Briefcase,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      link: '/tools?category=Business',
      countKey: 'Business'
    },
    {
      id: 'Design',
      title: 'Design',
      titleAr: 'التصميم',
      icon: Layout,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      link: '/tools?category=Design',
      countKey: 'Design'
    },
    {
      id: 'Creativity',
      title: 'Creativity',
      titleAr: 'الإبداع',
      icon: Palette,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      link: '/tools?category=Creativity',
      countKey: 'Creativity'
    },
    {
      id: 'Programming',
      title: 'Programming',
      titleAr: 'البرمجة',
      icon: Code,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      link: '/tools?category=Programming',
      countKey: 'Programming'
    },
    {
      id: 'Education',
      title: 'Education',
      titleAr: 'التعليم',
      icon: GraduationCap,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      link: '/tools?category=Education',
      countKey: 'Education'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={category.link}
          className="group relative flex flex-col items-center p-8 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-white/10 transition-colors duration-200 hover:border-indigo-500"
        >
          <div className={`w-16 h-16 rounded-2xl ${category.bg} flex items-center justify-center mb-6`}>
            <category.icon className={`w-8 h-8 ${category.color}`} />
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 text-center">
            {category.titleAr}
          </h3>

          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5">
            <span className="text-xs font-black text-slate-400">
                {counts[category.countKey] || 0} أداة
            </span>
          </div>
        </Link>
      ))}
    </div>
);
};

export default AllCategoriesView;

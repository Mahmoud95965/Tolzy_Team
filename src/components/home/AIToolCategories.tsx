"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTools } from '../../hooks/useTools';
import {
  Image,
  Briefcase,
  Zap,
  Clock,
  Video,
  Shuffle,
  Palette,
  MessageSquare,
  Code,
  Music
} from 'lucide-react';

interface CategoryCard {
  name: string;
  nameAr: string;
  count: number;
  icon: React.ReactNode;
  link: string;
  bgColor: string;
}

const AIToolCategories: React.FC = () => {
  const { t } = useTranslation();
  const { getCategoryCount } = useTools();
  const [counts, setCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const fetchCounts = async () => {
      const categoriesToFetch = [
        'Design', 'Business', 'Automation', 'Productivity',
        'Video', 'Creativity', 'Writing', 'Programming',
        'Music', 'Other'
      ];

      const results = await Promise.all(
        categoriesToFetch.map(async (cat) => [cat, await getCategoryCount(cat)] as const)
      );
      setCounts(Object.fromEntries(results));
    };

    fetchCounts();
  }, []);

  const allCategories: CategoryCard[] = [
    {
      name: 'AI Image Tools',
      nameAr: t('aiCategories.imageTools'),
      count: counts['Design'] || 0,
      icon: <Image className="w-5 h-5" />,
      link: '/tools?category=Design',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'AI Business Tools',
      nameAr: t('aiCategories.businessTools'),
      count: counts['Business'] || 0,
      icon: <Briefcase className="w-5 h-5" />,
      link: '/tools?category=Business',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'Automation Tools',
      nameAr: t('aiCategories.automationTools'),
      count: counts['Automation'] || 0,
      icon: <Zap className="w-5 h-5" />,
      link: '/tools?category=Automation',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'AI Productivity Tools',
      nameAr: t('aiCategories.productivityTools'),
      count: counts['Productivity'] || 0,
      icon: <Clock className="w-5 h-5" />,
      link: '/tools?category=Productivity',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'AI Video Tools',
      nameAr: t('aiCategories.videoTools'),
      count: counts['Video'] || 0,
      icon: <Video className="w-5 h-5" />,
      link: '/tools?category=Video',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'AI Art Generators',
      nameAr: t('aiCategories.artGenerators'),
      count: counts['Creativity'] || 0,
      icon: <Palette className="w-5 h-5" />,
      link: '/tools?category=Creativity',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'AI Text Generators',
      nameAr: t('aiCategories.textGenerators'),
      count: counts['Writing'] || 0,
      icon: <MessageSquare className="w-5 h-5" />,
      link: '/tools?category=Writing',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'AI Code Tools',
      nameAr: t('aiCategories.codeTools'),
      count: counts['Programming'] || 0,
      icon: <Code className="w-5 h-5" />,
      link: '/tools?category=Programming',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'AI Audio Generators',
      nameAr: t('aiCategories.audioGenerators'),
      count: counts['Music'] || 0,
      icon: <Music className="w-5 h-5" />,
      link: '/tools?category=Music',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'Misc AI Tools',
      nameAr: t('aiCategories.miscTools'),
      count: counts['Other'] || 0,
      icon: <Shuffle className="w-5 h-5" />,
      link: '/tools?category=Other',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
  ];

  // تصفية الفئات لعرض فقط التي تحتوي على أدوات (سنعرض الكل حالياً لأن الأصفار قد تعني تحميل)
  // لكن يمكن إعادتها إذا أردنا إخفاء الفئات الفارغة تماماً بعد التحميل
  // سنبقيها تعرض الكل لتجنب الوميض المزعج
  const categories = allCategories;

  // حساب العدد الإجمالي للأدوات (يمكننا جلبه من الخادم إذا أردنا دقة عالية، أو جمع الأعداد الموجودة)
  const totalTools = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 [content-visibility:auto] [contain-intrinsic-size:auto_500px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {categories.length} {t('aiCategories.tools')}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('aiCategories.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('aiCategories.subtitle', { count: totalTools, categories: categories.length })}
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
            {categories.map((category: CategoryCard, index: number) => (
              <Link
                key={index}
                href={category.link}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon Container */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2 min-h-[2.5rem]">
                    {category.nameAr}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{category.count}</span>
                    <span>{t('aiCategories.tools')}</span>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{t('aiCategories.noTools')}</p>
          </div>
        )}

        {/* Description */}
        {categories.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 rounded-2xl blur-xl" />
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center text-base max-w-4xl mx-auto">
                {t('aiCategories.description')}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIToolCategories;

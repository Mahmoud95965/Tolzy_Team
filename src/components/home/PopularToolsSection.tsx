"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Tool } from '../../types/tool';
import ToolImage from '../common/ToolImage';
import {
  PenLine,
  BookOpen,
  Calculator,
  FlaskRound as Flask,
  Languages,
  Clock,
  Book,
  GraduationCap,
  Users,
  Sparkles,
  Bookmark,
  Briefcase,
  MessageSquare,
  Palette,
  Database,
  Layers,
  School,
  Gamepad2,
  Library,
  Brain,
  Video,
  Code,
  FolderKanban,
  BookMarked,
  Cpu,
  TrendingUp,
  Star
} from 'lucide-react';

// Categories list
const categories = [
  'Writing', 'Research', 'Math', 'Science', 'Language Learning', 'Productivity',
  'Studying', 'Test Prep', 'Teaching', 'Business', 'Communication', 'Creativity',
  'Data Science', 'Design', 'Education', 'Games', 'Library', 'Memory',
  'Online Learning', 'Programming', 'Project Management', 'Reading',
  'Technology', 'Video', 'Other'
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Writing': <PenLine className="w-5 h-5" />,
  'Research': <BookOpen className="w-5 h-5" />,
  'Math': <Calculator className="w-5 h-5" />,
  'Science': <Flask className="w-5 h-5" />,
  'Language Learning': <Languages className="w-5 h-5" />,
  'Productivity': <Clock className="w-5 h-5" />,
  'Studying': <Book className="w-5 h-5" />,
  'Test Prep': <GraduationCap className="w-5 h-5" />,
  'Teaching': <Users className="w-5 h-5" />,
  'Other': <Sparkles className="w-5 h-5" />,
  'Business': <Briefcase className="w-5 h-5" />,
  'Communication': <MessageSquare className="w-5 h-5" />,
  'Creativity': <Palette className="w-5 h-5" />,
  'Data Science': <Database className="w-5 h-5" />,
  'Design': <Layers className="w-5 h-5" />,
  'Education': <School className="w-5 h-5" />,
  'Games': <Gamepad2 className="w-5 h-5" />,
  'Library': <Library className="w-5 h-5" />,
  'Memory': <Brain className="w-5 h-5" />,
  'Online Learning': <School className="w-5 h-5" />,
  'Programming': <Code className="w-5 h-5" />,
  'Project Management': <FolderKanban className="w-5 h-5" />,
  'Reading': <BookMarked className="w-5 h-5" />,
  'Technology': <Cpu className="w-5 h-5" />,
  'Video': <Video className="w-5 h-5" />
};

interface PopularToolsSectionProps {
  popularTools: Tool[];
  newTools: Tool[];
}

const PopularToolsSection: React.FC<PopularToolsSectionProps> = ({
  popularTools,
  newTools
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'popular' | 'recent'>('popular');

  const currentTools = activeTab === 'popular' ? popularTools : newTools;

  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b)).slice(0, 8);

  return (
    <section className="py-12 bg-white dark:bg-gray-900 [content-visibility:auto] [contain-intrinsic-size:auto_600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sticky top-24">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                {t('popularTools.mostPopularCategories')}
              </h3>
              <div className="space-y-0.5">
                {sortedCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/tools?category=${category}`}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-shrink-0">
                      {categoryIcons[category] || <Sparkles className="w-4 h-4" />}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm">
                      {t(`categories.${category}`)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Tools List */}
          <div className="lg:col-span-9">
            {/* Tabs */}
            <div className="flex items-center gap-6 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('popular')}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all ${activeTab === 'popular'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold text-base">{t('popularTools.popularTab')}</span>
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all ${activeTab === 'recent'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <Star className="w-5 h-5" />
                <span className="font-semibold text-base">{t('popularTools.recentTab')}</span>
              </button>
            </div>

            {/* Tools List */}
            <div className="space-y-3">
              {currentTools.slice(0, 6).map((tool) => {
                const primaryCategory = Array.isArray(tool.category)
                  ? tool.category[0]
                  : tool.category;

                const primarySubcategory = Array.isArray(tool.subcategory)
                  ? tool.subcategory[0]
                  : tool.subcategory;

                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Tool Icon */}
                      <div className="flex-shrink-0">
                        <ToolImage
                          name={tool.name}
                          categoryName={primaryCategory}
                          subcategoryName={primarySubcategory}
                          size="sm"
                        />
                      </div>

                      {/* Tool Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {tool.isNew && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              ⚡
                            </span>
                          )}
                          <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {tool.name}
                          </h4>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 mb-2">
                          {tool.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {tool.tags?.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col items-center gap-1 px-3 border-r border-gray-200 dark:border-gray-700">
                        <Bookmark className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{tool.savedBy?.length || 0}</span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* View All Link */}
            <div className="mt-6 text-center">
              <Link
                href="/tools"
                className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                {t('popularTools.viewAllTools')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularToolsSection;

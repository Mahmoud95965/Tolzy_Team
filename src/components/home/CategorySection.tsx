"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ToolCategory } from '../../types/tool';
import {
  PenLine, BookOpen, Calculator, FlaskRound as Flask, Languages, Clock, Book,
  GraduationCap, Users, Sparkles, ChevronDown, ChevronUp, Briefcase, MessageSquare,
  Palette, Database, Layers, School, Gamepad2, Library, Brain, MonitorPlay,
  Code, Kanban, BookMarked, Cpu, Video, Box, Zap, UsersRound, Plug, DollarSign, Trophy, Heart
} from 'lucide-react';

// Categories list
const categories: ToolCategory[] = [
  'Writing', 'Research', 'Math', 'Science', 'Language Learning', 'Productivity',
  'Studying', 'Test Prep', 'Teaching', 'Other'
];

const categoryIcons: Record<ToolCategory, React.ReactNode> = {
  '3D': <Box />,
  'Automation': <Zap />,
  'Business': <Briefcase />,
  'Collaboration': <UsersRound />,
  'Communication': <MessageSquare />,
  'Creativity': <Palette />,
  'Data Science': <Database />,
  'Design': <Layers />,
  'Education': <School />,
  'Electronics': <Plug />,
  'Freelancing': <DollarSign />,
  'Gamification': <Trophy />,
  'Games': <Gamepad2 />,
  'Language Learning': <Languages />,
  'Library': <Library />,
  'Lifestyle': <Heart />,
  'Math': <Calculator />,
  'Memory': <Brain />,
  'Online Learning': <MonitorPlay />,
  'Other': <Sparkles />,
  'Productivity': <Clock />,
  'Programming': <Code />,
  'Project Management': <Kanban />,
  'Reading': <BookMarked />,
  'Research': <BookOpen />,
  'Science': <Flask />,
  'Studying': <Book />,
  'Teaching': <Users />,
  'Technology': <Cpu />,
  'Test Prep': <GraduationCap />,
  'Video': <Video />,
  'Writing': <PenLine />
};

const CategorySection: React.FC = () => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b));

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{t('common.categories')}</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            اكتشف أدوات الذكاء الاصطناعي المتخصصة لمختلف الاحتياجات التعليمية
          </p>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {sortedCategories.map((category) => (
            <Link
              key={category}
              href={`/tools?category=${category}`}
              className="group relative p-[1px] rounded-xl bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/20 to-emerald-500/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-[11px] h-full ring-1 ring-gray-200/60 dark:ring-white/10">
                <div className="w-12 h-12 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-full">
                  {categoryIcons[category]}
                </div>
                <span className="text-gray-900 dark:text-white font-medium text-center">{t(`categories.${category}`)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('common.viewAll')}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Dropdown View */}
        <div className="sm:hidden">
          <button
            onClick={toggleDropdown}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 rounded-full ml-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-gray-900 dark:text-white font-medium">
                {t('common.categories')}
              </span>
            </div>
            {isDropdownOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="mt-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {sortedCategories.map((category, index) => (
                  <Link
                    key={category}
                    href={`/tools?category=${category}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${index !== sortedCategories.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                      }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 rounded-full ml-3">
                      {categoryIcons[category]}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {t(`categories.${category}`)}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('common.viewAll')}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;

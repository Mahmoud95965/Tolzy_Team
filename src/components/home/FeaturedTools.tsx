"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Tool } from '../../types/tool';
import ToolCard from '../tools/ToolCard';
import { ChevronLeft } from 'lucide-react';

interface FeaturedToolsProps {
  title: string;
  subtitle?: string;
  tools: Tool[];
  viewAllLink?: string;
  className?: string;
}

const FeaturedTools: React.FC<FeaturedToolsProps> = ({
  title,
  subtitle,
  tools,
  viewAllLink,
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <section className={`py-12 ${className} dark:bg-gray-900/50 backdrop-blur-sm transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="mt-2 text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="group mt-4 md:mt-0 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center font-medium"
            >
              <ChevronLeft className="ml-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t('common.viewAll')}
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTools;
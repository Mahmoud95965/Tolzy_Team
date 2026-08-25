"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ChevronLeft, ChevronRight, Star, ExternalLink, Award } from 'lucide-react';
import ToolImage from '../common/ToolImage';

const CallToAction: React.FC = () => {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);

  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Filter tools strictly for the slider
  // Hardcoded curated list as per user request with specific images
  const filteredFeaturedTools: any[] = [
    {
      id: 'tolzy-axiom',
      name: 'TOLZY AXIOM',
      description: 'معالجك الذكي الشامل لإنجاز المشاريع والبرمجة والتفكير.',
      category: 'Automation',
      subcategory: 'Productivity',
      pricing: 'Freemium',
      tags: ['AI', 'AXIOM', 'Assistant'],
      rating: 5,
      savedBy: Array(120).fill('user'),
      isNew: true
    },
    {
      id: 'stunning-so',
      name: 'Stunning.so',
      description: 'أداة إنشاء مواقع ويب احترافية بالذكاء الاصطناعي في ثوانٍ.',
      category: 'Design',
      subcategory: 'Web Design',
      pricing: 'Freemium',
      tags: ['Website', 'Builder', 'Design'],
      rating: 4.8,
      savedBy: Array(85).fill('user'),
      isNew: true
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'نموذج الذكاء الاصطناعي المتقدم من Google للتحليل والإبداع.',
      category: 'Writing',
      subcategory: 'Content Generation',
      pricing: 'Free',
      tags: ['Google', 'LLM', 'Analysis'],
      rating: 4.9,
      savedBy: Array(200).fill('user'),
      isNew: true
    }
  ];

  React.useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 1 : 3);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use filtered list for pagination
  const totalPages = Math.ceil(filteredFeaturedTools.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleTools = filteredFeaturedTools.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 [content-visibility:auto] [contain-intrinsic-size:auto_400px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Tools Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTools.map((tool, index) => {
              const primaryCategory = Array.isArray(tool.category)
                ? tool.category[0]
                : tool.category;

              const primarySubcategory = Array.isArray(tool.subcategory)
                ? tool.subcategory[0]
                : tool.subcategory;

              return (
                <div
                  key={tool.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* شارة اختيار المحرر */}
                  {index === 0 && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
                        <Award className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-bold text-white">اختيار المحرر</span>
                      </div>
                    </div>
                  )}

                  {/* Gradient Overlay at Top */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20" />

                  <div className="relative p-6">
                    {/* Tool Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <div className="rounded-2xl ring-4 ring-white dark:ring-gray-800 overflow-hidden">
                          <ToolImage
                            imageUrl={tool.imageUrl}
                            name={tool.name}
                            categoryName={primaryCategory}
                            subcategoryName={primarySubcategory}
                            size="md"
                            className="shadow-xl"
                            priority={index === 0} // Ensure LCP image gets priority
                          />
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < (tool.rating || 4)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                                }`}
                            />
                          ))}
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-1">
                            {tool.rating || 4}.0
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({tool.savedBy?.length || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {t(`pricing.${tool.pricing}`)}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">{tool.savedBy?.length || 0}</span>
                        <span>💾</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {tool.tags?.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Visit Button */}
                    <Link
                      href={`/tools/${tool.id}`}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-xl group-hover:scale-[1.02]"
                    >
                      {t('common.visit')}
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Bottom Gradient Border */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              );
            })}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex
                  ? 'bg-indigo-600 dark:bg-indigo-400 w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
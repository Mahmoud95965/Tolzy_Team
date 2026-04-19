"use client";
import React, { useEffect, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { getPublishedArticles, type Article } from '../services/articles.service';
import Link from 'next/link';
import { Clock, ArrowLeft, Loader } from 'lucide-react';

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getPublishedArticles(1, 50)
      .then(result => { if (mounted) { setArticles(result.articles); setLoading(false); } })
      .catch(() => { if (mounted) { setError('تعذر تحميل المقالات'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  // Filter Logic
  const tutorials = articles.filter(a => {
    // 1. Primary check: article_type (if set)
    if (a.article_type) {
      return a.article_type === 'explanation';
    }

    // 2. Fallback: Legacy keyword matching
    return (
      (a.category === 'tutorial' || a.category === 'guide' || a.category === 'explanation') ||
      (a.tags && (a.tags.includes('tutorial') || a.tags.includes('شرح'))) ||
      a.title.includes('شرح') || a.title.includes('طريقة') || a.title.includes('كيفية')
    );
  });

  const newsOnly = articles.filter(a => !tutorials.includes(a));

  const featuredNews = newsOnly.length > 0 ? newsOnly[0] : null;
  const regularNews = newsOnly.slice(1);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Header */}
          <div className="mb-12 text-center md:text-right animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              أخبار وشروحات الذكاء الاصطناعي
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0">
              اكتشف أحدث التطورات، وتعلم كيفية استخدام أدوات AI باحترافية من خلال شروحاتنا المفصلة.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <Loader className="h-10 w-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">جارٍ التحميل...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500 animate-fade-in">
              {error}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-gray-500 animate-fade-in">
              لا توجد مقالات متاحة حالياً.
            </div>
          ) : (
            <div className="space-y-16">

              {/* 1. Tutorials Section (New) */}
              {tutorials.length > 0 && (
                <section className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
                    {/* Using a Lucide icon related to learning/tutorials if BookOpen is not available, but usually BookOpen is fine. 
                         I will check imports first to be safe, but for now assuming BookOpen or similar. */}
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="text-indigo-600 dark:text-indigo-400"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      شروحات وأدلة الاستخدام
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials.map((tutorial, index) => (
                      <Link
                        href={`/news/${tutorial.id}`}
                        key={tutorial.id}
                        className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:-translate-y-1"
                      >
                        <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-slate-700">
                          {tutorial.cover_image_url ? (
                            <img
                              src={tutorial.cover_image_url}
                              alt={tutorial.title}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-sm">لا توجد صورة</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                            شرح تعليمي
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {tutorial.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                            {tutorial.excerpt}
                          </p>
                          <div className="flex items-center text-indigo-600 text-sm font-medium mt-auto group/btn">
                            اقرأ الشرح الكامل
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover/btn:-translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}


              {/* 2. News Section */}
              <section>
                <div className="flex items-center gap-3 mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    أحدث الأخبار
                  </h2>
                </div>

                {/* Featured Article - Cleaner Design */}
                {featuredNews && (
                  <Link href={`/news/${featuredNews.id}`} className="group block animate-fade-in mb-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                      {featuredNews.cover_image_url && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                          <img
                            src={featuredNews.cover_image_url}
                            alt={featuredNews.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                            خبر مميز
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(featuredNews.created_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                          {featuredNews.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                          {featuredNews.excerpt}
                        </p>
                        <div className="flex items-center text-blue-600 font-medium mt-2">
                          قراءة الخبر <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Grid Layout for Regular News */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularNews.map((article, index) => (
                    <Link
                      href={`/news/${article.id}`}
                      key={article.id}
                      className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all hover:translate-y-[-2px] animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {article.cover_image_url && (
                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(article.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed flex-grow">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                          قراءة الخبر <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default NewsPage;

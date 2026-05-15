"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/layout/PageLayout';
import { getPublishedArticles, type Article } from '../services/articles.service';
import Link from 'next/link';
import { Clock, ArrowLeft, Loader2, BookOpen, Newspaper, Sparkles, TrendingUp, Eye } from 'lucide-react';

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'tutorials'>('all');

  useEffect(() => {
    let mounted = true;
    getPublishedArticles(1, 50)
      .then(result => { if (mounted) { setArticles(result.articles); setLoading(false); } })
      .catch(() => { if (mounted) { setError('تعذر تحميل المقالات'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  const tutorials = articles.filter(a => {
    if (a.article_type) return a.article_type === 'explanation';
    return (
      (a.category === 'tutorial' || a.category === 'guide' || a.category === 'explanation') ||
      (a.tags && (a.tags.includes('tutorial') || a.tags.includes('شرح'))) ||
      a.title.includes('شرح') || a.title.includes('طريقة') || a.title.includes('كيفية')
    );
  });

  const newsOnly = articles.filter(a => !tutorials.includes(a));

  const displayedArticles = activeTab === 'tutorials' ? tutorials : activeTab === 'news' ? newsOnly : articles;
  const featuredArticle = displayedArticles.length > 0 ? displayedArticles[0] : null;
  const restArticles = displayedArticles.slice(1);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 30) return `منذ ${days} يوم`;
    return new Date(dateStr).toLocaleDateString('ar-EG');
  };

  return (
    <PageLayout navbarOffset={false}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-300">

        {/* ─── Hero Section ─── */}
        <div className="relative overflow-hidden bg-gradient-to-bl from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900 pt-28 pb-12 md:pt-32 md:pb-16">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400 rounded-full blur-3xl" />
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-40" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-bold mb-6 border border-white/10"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {articles.length > 0 ? `${articles.length} مقال ومحتوى تعليمي` : 'أخبار وشروحات الذكاء الاصطناعي'}
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight tracking-tight"
            >
              أخبار و
              <span className="relative">
                <span className="bg-gradient-to-l from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">شروحات</span>
                <motion.span initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -bottom-1 right-0 h-1 bg-gradient-to-l from-amber-300 to-yellow-400 rounded-full"
                />
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto leading-relaxed mb-8"
            >
              اكتشف أحدث التطورات في الذكاء الاصطناعي وتعلّم استخدام الأدوات باحترافية
            </motion.p>

            {/* Floating icons */}
            <div className="flex items-center justify-center gap-3 md:gap-5 mb-6">
              {['📰', '📝', '🎓', '🤖', '💡'].map((emoji, i) => (
                <motion.span key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-2xl md:text-3xl p-2 md:p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:scale-110 hover:bg-white/20 transition-all cursor-default"
                >{emoji}</motion.span>
              ))}
            </div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="flex items-center justify-center gap-6 md:gap-10 text-white/60 text-sm font-medium"
            >
              <div className="flex items-center gap-2"><span className="text-lg">📰</span><span><strong className="text-white">{newsOnly.length}</strong> خبر</span></div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2"><span className="text-lg">📝</span><span><strong className="text-white">{tutorials.length}</strong> شرح</span></div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2"><span className="text-lg">📚</span><span><strong className="text-white">{articles.length}</strong> إجمالي</span></div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 60V20C240 0 480 40 720 30C960 20 1200 50 1440 20V60H0Z" className="fill-slate-50 dark:fill-[#050505]" />
            </svg>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-12" dir="rtl">

          {/* Tab filter */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { key: 'all' as const, label: 'الكل', icon: Sparkles, count: articles.length },
              { key: 'news' as const, label: 'أخبار', icon: Newspaper, count: newsOnly.length },
              { key: 'tutorials' as const, label: 'شروحات', icon: BookOpen, count: tutorials.length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white dark:bg-white/5 text-slate-500 border border-slate-200/60 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/10'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                }`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">جارٍ التحميل...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 text-red-500 font-bold text-lg">{error}</div>
          ) : displayedArticles.length === 0 ? (
            <div className="text-center py-24">
              <Sparkles size={48} className="mx-auto text-indigo-300 mb-4" />
              <p className="text-slate-500 font-bold text-lg">لا توجد مقالات في هذا القسم</p>
            </div>
          ) : (
            <div className="space-y-10">

              {/* Featured Article */}
              {featuredArticle && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Link href={`/news/${featuredArticle.id}`} className="group block">
                    <div className="relative grid md:grid-cols-2 gap-6 items-center bg-white dark:bg-[#0d1117] rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-white/[0.06] hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-all duration-300">
                      {featuredArticle.cover_image_url && (
                        <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img src={featuredArticle.cover_image_url} alt={featuredArticle.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black shadow-lg">
                            {tutorials.includes(featuredArticle) ? '📝 شرح تعليمي' : '📰 خبر مميز'}
                          </div>
                        </div>
                      )}
                      <div className="p-6 md:p-8 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <Clock size={14} />
                          <span>{timeAgo(featuredArticle.created_at)}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {featuredArticle.excerpt}
                        </p>
                        <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-bold mt-2 group/btn">
                          اقرأ المزيد
                          <ArrowLeft className="w-4 h-4 mr-2 group-hover/btn:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Articles Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restArticles.map((article, index) => (
                  <motion.div key={article.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <Link href={`/news/${article.id}`}
                      className="group flex flex-col h-full bg-white dark:bg-[#0d1117] rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-white/[0.06] hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1"
                    >
                      {article.cover_image_url && (
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img src={article.cover_image_url} alt={article.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {tutorials.includes(article) && (
                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-violet-600 text-white text-[10px] font-black shadow-md">
                              📝 شرح
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3 font-medium">
                          <Clock size={12} />
                          <span>{timeAgo(article.created_at)}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed flex-grow">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-bold mt-auto pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                          {tutorials.includes(article) ? 'اقرأ الشرح' : 'اقرأ الخبر'}
                          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default NewsPage;

"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import PageLayout from '../components/layout/PageLayout';
import SEO from '../components/SEO';
import {
  BookOpen,
  Search,
  Users,
  Sparkles,
  CheckCircle,
  Star,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  Target,
  Heart,
  Lightbulb,
  Award
} from 'lucide-react';

interface ValueItem {
  title: string;
  description: string;
}

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  const valueIcons = [
    { icon: <Star className="h-6 w-6 sm:h-7 sm:w-7" />, color: 'from-yellow-400 to-orange-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { icon: <Zap className="h-6 w-6 sm:h-7 sm:w-7" />, color: 'from-blue-400 to-indigo-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: <Shield className="h-6 w-6 sm:h-7 sm:w-7" />, color: 'from-green-400 to-teal-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { icon: <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />, color: 'from-purple-400 to-pink-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' }
  ];

  const values = t('about.values.items', { returnObjects: true }) as ValueItem[];

  const stats = [
    { number: '500+', label: 'أداة ذكاء اصطناعي', icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { number: '5+', label: 'فئات متنوعة', icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { number: '100000+', label: 'مستخدم نشط', icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { number: '100%', label: 'محتوى عربي', icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ];

  return (
    <PageLayout>
      <SEO
        title="عن Tolzy - منصة أدوات الذكاء الاصطناعي"
        description="تعرف على Tolzy، منصتك الشاملة لاكتشاف أفضل أدوات الذكاء الاصطناعي بالعربية"
        url="/about"
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-blue-400 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-purple-400 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-indigo-400 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              <span className="text-xs sm:text-sm font-semibold">نحن هنا لمساعدتك</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              {t('about.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-10 leading-relaxed px-4">
              {t('about.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4">
              <Link
                href="/guide"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-2xl text-sm sm:text-base"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('about.viewGuide')}
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm border-2 border-white/20 text-sm sm:text-base"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" />
                {t('about.startNow')}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-10 sm:mt-12 md:mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <div className="flex justify-center mb-2 sm:mb-3 text-blue-200">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-xs sm:text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="mb-16 sm:mb-20 md:mb-24">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-3 sm:mb-4">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">مهمتنا</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4">
              {t('about.mission.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed px-4">
              {t('about.mission.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-6 sm:p-8 rounded-2xl border-2 border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
                    <BookOpen className="h-full w-full text-white" />
                  </div>
                  <h3 className="mr-3 sm:mr-4 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {t('about.mission.forStudents.title')}
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-right leading-relaxed text-base sm:text-lg">
                  {t('about.mission.forStudents.description')}
                </p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 p-6 sm:p-8 rounded-2xl border-2 border-purple-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
                    <Users className="h-full w-full text-white" />
                  </div>
                  <h3 className="mr-3 sm:mr-4 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {t('about.mission.forEducators.title')}
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-right leading-relaxed text-base sm:text-lg">
                  {t('about.mission.forEducators.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Tolzy Section */}
        <div className="mb-16 sm:mb-20 md:mb-24">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3 sm:mb-4">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">ما نقدمه</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4">
              لماذا Tolzy؟
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
              منصة متكاملة تجمع أفضل أدوات الذكاء الاصطناعي التعليمية في مكان واحد، مع دعم كامل باللغة العربية
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-300 transform hover:-translate-y-2 active:scale-[0.98] hover:shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-full w-full text-white" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-3 sm:mb-4">
                {t('about.offerings.curation.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed text-base sm:text-lg">
                {t('about.offerings.curation.description')}
              </p>
            </div>

            <div className="group relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 transform hover:-translate-y-2 active:scale-[0.98] hover:shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-full w-full text-white" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-3 sm:mb-4">
                {t('about.offerings.information.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed text-base sm:text-lg">
                {t('about.offerings.information.description')}
              </p>
            </div>

            <div className="group relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 transform hover:-translate-y-2 active:scale-[0.98] hover:shadow-2xl overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-full w-full text-white" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-3 sm:mb-4">
                {t('about.offerings.community.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed text-base sm:text-lg">
                {t('about.offerings.community.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-3 sm:mb-4">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400">قيمنا</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4">
              {t('about.values.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {values.map((value: ValueItem, index: number) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 active:scale-[0.98] overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${valueIcons[index].color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${valueIcons[index].color} p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white w-full h-full flex items-center justify-center">
                      {valueIcons[index].icon}
                    </div>
                  </div>
                  <h3 className="mr-3 sm:mr-4 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed text-base sm:text-lg">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
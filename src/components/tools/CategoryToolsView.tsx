import React, { useRef } from 'react';
import { useTools } from '../../hooks/useTools';
import { ToolCategory } from '../../types';
import type { Tool } from '../../types/tool';
import ToolCard from './ToolCard';
import { Loader } from 'lucide-react';

interface CategoryToolsViewProps {
  category: ToolCategory;
}

interface SubcategoryGroup {
  name: string;
  nameAr: string;
  tools: Tool[];
}

type SubcategoryTabId = 'all' | 'popular' | 'others';

interface SubcategoryTab {
  id: SubcategoryTabId;
  label: string;
}

const CategoryToolsView: React.FC<CategoryToolsViewProps> = ({ category }) => {
  const { tools, loadMore, hasMore, isLoadingMore, getCategoryCount } = useTools();
  const loadingRef = useRef<HTMLDivElement>(null);
  const [totalCount, setTotalCount] = React.useState<number>(0);

  // Fetch total count for the category
  React.useEffect(() => {
    const fetchCount = async () => {
      const count = await getCategoryCount(category);
      setTotalCount(count);
    };
    fetchCount();
  }, [category, getCategoryCount]);

  // Intersection Observer for infinite scrolling
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          console.log('🔄 Triggering loadMore from CategoryToolsView IntersectionObserver');
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  // تصفية الأدوات حسب الفئة الرئيسية (للعرض فقط)
  // تصفية الأدوات حسب الفئة الرئيسية (للعرض فقط) - نتحقق من أن الأداة تنتمي للفئة
  // ملاحظة: ToolsContext يجب أن يكون قد قام بتحميل الأدوات المناسبة لهذه الفئة بالفعل
  const categoryTools = tools.filter((tool: Tool) => {
    // إذا كنا قد قمنا بتحميل بيانات هذه الفئة خصيصاً، فمن المفترض أن تكون كل الأدوات مناسبة
    // ولكن للتحوط، نتحقق من التطابق
    const toolCategories = Array.isArray(tool.category) ? tool.category : [tool.category];
    return toolCategories.includes(category);
  });

  // تجميع الأدوات حسب الفئات الفرعية
  const groupToolsBySubcategory = (): SubcategoryGroup[] => {
    const subcategoryMap = new Map<string, Tool[]>();
    const processedToolIds = new Set<string>(); // لتتبع الأدوات وتجنب التكرار

    categoryTools.forEach((tool: Tool) => {
      // إذا كانت الأداة قد تمت إضافتها مسبقاً، نتجاوزها
      if (processedToolIds.has(tool.id)) {
        return;
      }

      let assignedSubcategory = 'Other';

      if (tool.subcategory) {
        const subcategories = Array.isArray(tool.subcategory)
          ? tool.subcategory
          : [tool.subcategory];

        // نختار الفئة الفرعية الأولى فقط
        if (subcategories.length > 0) {
          assignedSubcategory = subcategories[0];
        }
      }

      if (!subcategoryMap.has(assignedSubcategory)) {
        subcategoryMap.set(assignedSubcategory, []);
      }

      subcategoryMap.get(assignedSubcategory)!.push(tool);
      processedToolIds.add(tool.id);
    });

    // تحويل Map إلى مصفوفة مع ترجمة الأسماء
    const subcategoryGroups: SubcategoryGroup[] = [];
    subcategoryMap.forEach((tools, subcategoryName) => {
      subcategoryGroups.push({
        name: subcategoryName,
        nameAr: getSubcategoryNameAr(subcategoryName),
        tools: tools
      });
    });

    // ترتيب حسب عدد الأدوات (الأكثر أولاً)
    return subcategoryGroups.sort((a, b) => b.tools.length - a.tools.length);
  };

  // ترجمة أسماء الفئات الفرعية إلى العربية
  const getSubcategoryNameAr = (subcategory: string): string => {
    const translations: { [key: string]: string } = {
      // Video
      'Video Editing': 'تحرير الفيديو',
      'Video Generation': 'توليد الفيديو',
      'Video Enhancement': 'تحسين الفيديو',
      'Text to Video': 'نص إلى فيديو',
      'Video Analytics': 'تحليلات الفيديو',

      // Writing
      'Content Writing': 'كتابة المحتوى',
      'Copywriting': 'كتابة إعلانية',
      'Paraphrasing': 'إعادة الصياغة',
      'Grammar Check': 'التدقيق اللغوي',
      'Translation': 'الترجمة',
      'SEO': 'تحسين محركات البحث',

      // Design
      'Image Generation': 'توليد الصور',
      'Image Editing': 'تحرير الصور',
      'Logo Design': 'تصميم الشعارات',
      'UI/UX Design': 'تصميم واجهات المستخدم',
      'Graphic Design': 'التصميم الجرافيكي',

      // Productivity
      'Task Management': 'إدارة المهام',
      'Note Taking': 'تدوين الملاحظات',
      'Calendar': 'التقويم',
      'Email': 'البريد الإلكتروني',
      'Automation': 'الأتمتة',
      'Project Management': 'إدارة المشاريع',

      // Programming
      'Code Generation': 'توليد الكود',
      'Code Review': 'مراجعة الكود',
      'Debugging': 'تصحيح الأخطاء',
      'Documentation': 'التوثيق',
      'Testing': 'الاختبار',

      // Business
      'Marketing': 'التسويق',
      'Sales': 'المبيعات',
      'Customer Service': 'خدمة العملاء',
      'Analytics': 'التحليلات',

      // Education
      'Learning': 'التعلم',
      'Teaching': 'التدريس',
      'Assessment': 'التقييم',
      'Course Creation': 'إنشاء الدورات',
      'Study Tools': 'أدوات الدراسة',

      // Research
      'Literature Review': 'مراجعة الأدبيات',
      'Data Analysis': 'تحليل البيانات',
      'Citation Management': 'إدارة الاقتباسات',
      'Academic Writing': 'الكتابة الأكاديمية',

      // Creativity
      'Music Generation': 'توليد الموسيقى',
      'Audio Generation': 'توليد الصوت',
      'Voice Cloning': 'استنساخ الصوت',

      // 3D
      '3D Modeling': 'النمذجة ثلاثية الأبعاد',
      'NeRF': 'NeRF',

      // Other
      'Other': 'أخرى',
      'Productivity': 'الإنتاجية',
      'Business': 'الأعمال',

      // Misc extra subcategories
      'Grammar': 'القواعد اللغوية',
      'Education': 'التعليم',
      'Blogging': 'التدوين',
      'E-commerce': 'التجارة الإلكترونية',
      'Content Creation': 'إنشاء المحتوى',
      'Collaboration': 'التعاون',
      'Enterprise': 'المؤسسات',
      'Chatbot': 'روبوت محادثة',
      'Customer Support': 'دعم العملاء',
      'Design': 'التصميم',
      'Presentations': 'العروض التقديمية',
      'No-Code': 'بدون برمجة'
    };

    return translations[subcategory] || subcategory;
  };

  // الحصول على اسم الفئة بالعربية
  const getCategoryNameAr = (category: ToolCategory): string => {
    const categoryNames: { [key in ToolCategory]?: string } = {
      'Video': 'الفيديو',
      'Writing': 'الكتابة',
      'Design': 'التصميم',
      'Productivity': 'الإنتاجية',
      'Programming': 'البرمجة',
      'Business': 'الأعمال',
      'Education': 'التعليم',
      'Research': 'البحث',
      'Creativity': 'الإبداع',
      '3D': 'ثلاثي الأبعاد',
      'Automation': 'الأتمتة',
      'Other': 'أخرى'
    };

    return categoryNames[category] || category;
  };

  const subcategoryGroups = groupToolsBySubcategory();

  const [activeTab, setActiveTab] = React.useState<SubcategoryTabId>('all');
  const [showAllSubcategories, setShowAllSubcategories] = React.useState(false);
  const [isLargeScreen, setIsLargeScreen] = React.useState(false);
  const [isPageContentVisible, setIsPageContentVisible] = React.useState(true);

  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    setShowAllSubcategories(false);
  }, [activeTab]);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 60);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const popularGroups = subcategoryGroups.slice(0, 6);
  const otherGroups = subcategoryGroups.slice(6);

  const baseTabs: SubcategoryTab[] = [
    { id: 'all', label: 'كل الفئات' },
    { id: 'popular', label: 'الأكثر شيوعاً' }
  ];

  const tabs: SubcategoryTab[] =
    otherGroups.length > 0
      ? [...baseTabs, { id: 'others', label: 'فئات أخرى' }]
      : baseTabs;

  const getVisibleGroups = (): SubcategoryGroup[] => {
    if (activeTab === 'popular') {
      return popularGroups;
    }
    if (activeTab === 'others') {
      return otherGroups;
    }
    return subcategoryGroups;
  };

  const visibleGroups = getVisibleGroups();

  const allTabLimit = isLargeScreen ? 12 : 6;

  const displayedGroups =
    !showAllSubcategories
      ? visibleGroups.slice(0, allTabLimit)
      : visibleGroups;

  if (categoryTools.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            لا توجد أدوات في هذه الفئة حالياً
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            نعمل على إضافة المزيد من الأدوات قريباً
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="py-12 pt-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header without fade-in animation */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            أدوات {getCategoryNameAr(category)} بالذكاء الاصطناعي - تعزيز إنتاجيتك بالابتكار الذكي
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            اكتشف القوة التحويلية لأدوات {getCategoryNameAr(category)} بالذكاء الاصطناعي. أكثر من مجرد أدوات، فهي تعمل كمحفزات للتغيير،
            تحول المهام الروتينية إلى فرص استثنائية للإنتاجية. سواء كنت تقوم بتحسين سير العمل أو تعزيز التعاون،
            فإن الذكاء الاصطناعي هو شريكك الأساسي في إعادة تعريف العمل. ابدأ رحلتك نحو الكفاءة المحسنة مع الذكاء الاصطناعي بجانبك.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 transition-all duration-300 hover:scale-110">{totalCount}</span>
            <span>{totalCount === 1 ? 'أداة' : 'أدوات'}</span>
            <span>•</span>
            <span>{subcategoryGroups.length} {subcategoryGroups.length === 1 ? 'فئة فرعية' : 'فئات فرعية'}</span>
          </div>
        </div>

        <div className="flex justify-center mb-6 sticky top-4 z-30">
          <button
            type="button"
            onClick={() => setIsPageContentVisible((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm sm:text-base font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label={isPageContentVisible ? 'إخفاء الفئات الفرعية' : 'إظهار الفئات الفرعية'}
            aria-expanded={isPageContentVisible}
          >
            <span>
              {isPageContentVisible ? 'إخفاء الفئات الفرعية' : 'إظهار الفئات الفرعية'}
            </span>
            <span className="text-lg" aria-hidden="true">
              {isPageContentVisible ? '👁️‍🗨️' : '🙈'}
            </span>
          </button>
        </div>

        {/* Table of Contents */}
        <div
          className={`mb-8 bg-white/80 dark:bg-gray-800/90 backdrop-blur rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 ${!isPageContentVisible ? 'hidden' : ''
            }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">

              </span>
              محتويات الصفحة
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline-block">اختر فئة فرعية من التبويبات للاستكشاف السريع</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-900/60">
                {subcategoryGroups.length} فئات فرعية
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-md'
                    : 'bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
            {displayedGroups.map((group) => {
              const anchorId = group.name.replace(/\s+/g, '-').toLowerCase();
              return (
                <button
                  key={group.name}
                  type="button"
                  onClick={() => {
                    const section = document.getElementById(anchorId);
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="group flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-950/60 dark:hover:to-slate-900/80 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-900 transform hover:-translate-y-0.5"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-sm group-hover:shadow-md transition-all duration-200">
                    <span className="text-lg">
                      {getSubcategoryIcon(group.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {group.nameAr}
                    </div>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-200">
                        {group.tools.length} {group.tools.length === 1 ? 'أداة' : 'أدوات'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            {!showAllSubcategories && visibleGroups.length > displayedGroups.length && (
              <div className="col-span-2 sm:col-span-3 md:col-span-4 flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllSubcategories(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  عرض جميع الفئات ({visibleGroups.length})
                </button>
              </div>
            )}
            {displayedGroups.length === 0 && (
              <div className="col-span-full text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                لا توجد فئات فرعية في هذا القسم حالياً.
              </div>
            )}
          </div>
        </div>

        {/* Why you can trust us */}
        <div className="mb-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl text-green-500">✓</span>
            لماذا يمكنك الوثوق بنا
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              نحن ملتزمون بتقديم معلومات دقيقة وموثوقة حول أدوات الذكاء الاصطناعي. يتم مراجعة جميع الأدوات المدرجة بعناية
              من قبل فريقنا المتخصص، ونقوم بتحديث المعلومات بانتظام لضمان حصولك على أحدث البيانات. نحن لا نقبل أي مدفوعات
              مقابل إدراج الأدوات، مما يضمن حيادية توصياتنا واستقلاليتها.
            </p>
          </div>
        </div>


        {subcategoryGroups.map((group, index) => {
          return (
            <div
              key={index}
              id={group.name.replace(/\s+/g, '-').toLowerCase()}
              className="mb-16 scroll-mt-24"
            >
              {/* Subcategory Header */}
              <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                      {group.nameAr}
                    </h2>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 hover:scale-110 hover:shadow-md">
                      {group.tools.length} {group.tools.length === 1 ? 'أداة' : 'أدوات'}
                    </span>
                  </div>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {getSubcategoryDescription(group.name)}
                </p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.tools.map((tool) => (
                  <div
                    key={tool.id}
                  >
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading Indicator */}
      <div
        ref={loadingRef}
        className="flex justify-center items-center py-8 mt-4"
      >
        {isLoadingMore && (
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">جاري تحميل المزيد من الأدوات...</span>
          </div>
        )}
        {!hasMore && tools.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            تم عرض جميع الأدوات المتاحة
          </p>
        )}
      </div>

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-40 inline-flex items-center justify-center w-11 h-11 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="التمرير إلى أعلى الصفحة"
        >
          ↑
        </button>
      )}
    </div>
  );
};

const getSubcategoryIcon = (subcategory: string): string => {
  const icons: { [key: string]: string } = {
    'Video Editing': '🎬',
    'Video Generation': '🎥',
    'Video Enhancement': '✨',
    'Text to Video': '📽️',
    'Video Analytics': '📊',
    'Content Writing': '✍️',
    'Copywriting': '📝',
    'Paraphrasing': '♻️',
    'Grammar Check': '✅',
    'Translation': '🌐',
    'SEO': '🔍',
    'Image Generation': '🖼️',
    'Image Editing': '✨',
    'Logo Design': '🎨',
    'UI/UX Design': '🧩',
    'Graphic Design': '🧶',
    'Task Management': '📋',
    'Note Taking': '🗒️',
    'Calendar': '📅',
    'Email': '✉️',
    'Automation': '⚙️',
    'Project Management': '📊',
    'Code Generation': '💻',
    'Code Review': '🔎',
    'Debugging': '🐞',
    'Documentation': '📚',
    'Sales': '💼',
    'Marketing': '📣',
    'Customer Service': '🤝',
    'Learning': '🎓',
    'Teaching': '🧑‍🏫',
    'Assessment': '📝',
    'Course Creation': '📘',
    'Study Tools': '📖',
    'Literature Review': '📚',
    'Data Analysis': '📉',
    'Academic Writing': '✒️',
    'Music Generation': '🎵',
    'Audio Generation': '🔊',
    'Voice Cloning': '🗣️',
    '3D Modeling': '📐',
    'NeRF': '🧠',
    'Other': '🧩'
  };

  return icons[subcategory] || '🧩';
};

// وصف لكل فئة فرعية
const getSubcategoryDescription = (subcategory: string): string => {
  const descriptions: { [key: string]: string } = {
    'Video Editing': 'أدوات متقدمة لتحرير وتعديل مقاطع الفيديو باستخدام الذكاء الاصطناعي',
    'Video Generation': 'إنشاء مقاطع فيديو من النصوص والصور باستخدام تقنيات الذكاء الاصطناعي',
    'Text to Video': 'تحويل النصوص إلى مقاطع فيديو احترافية تلقائياً',
    'Content Writing': 'أدوات لكتابة المحتوى والمقالات والمدونات بجودة عالية',
    'Grammar Check': 'تدقيق لغوي وإملائي متقدم لتحسين جودة الكتابة',
    'Paraphrasing': 'إعادة صياغة النصوص بطرق مختلفة مع الحفاظ على المعنى',
    'Image Generation': 'توليد صور فنية واحترافية من الأوصاف النصية',
    'Image Editing': 'تحرير وتعديل الصور باستخدام تقنيات الذكاء الاصطناعي',
    'Graphic Design': 'أدوات تصميم جرافيكي متكاملة للمحترفين والمبتدئين',
    'Task Management': 'إدارة المهام والمشاريع بكفاءة عالية',
    'Project Management': 'أدوات شاملة لإدارة المشاريع والفرق',
    'Automation': 'أتمتة المهام الروتينية لتوفير الوقت والجهد',
    'Code Generation': 'توليد الأكواد البرمجية تلقائياً من الأوصاف',
    'Debugging': 'اكتشاف وإصلاح الأخطاء البرمجية بذكاء',
    'Documentation': 'إنشاء وثائق تقنية شاملة للمشاريع البرمجية',
    'Sales': 'أدوات لتحسين عمليات البيع وإدارة العملاء',
    'Marketing': 'حلول تسويقية ذكية لتنمية الأعمال',
    'Customer Service': 'تحسين خدمة العملاء من خلال الذكاء الاصطناعي',
    'Learning': 'أدوات تعليمية تفاعلية للطلاب والمتعلمين',
    'Teaching': 'مساعدة المعلمين في إعداد وتقديم الدروس',
    'Study Tools': 'أدوات مساعدة للدراسة والمراجعة الفعالة',
    'Literature Review': 'مراجعة وتحليل الأبحاث والأوراق العلمية',
    'Data Analysis': 'تحليل البيانات واستخراج الرؤى القيمة',
    'Academic Writing': 'مساعدة في الكتابة الأكاديمية والبحثية',
    'SEO': 'تحسين المحتوى لمحركات البحث',
    'Other': 'أدوات متنوعة ومفيدة في مجالات مختلفة'
  };

  return descriptions[subcategory] || `أدوات ${subcategory} المتقدمة بالذكاء الاصطناعي`;
};

export default CategoryToolsView;

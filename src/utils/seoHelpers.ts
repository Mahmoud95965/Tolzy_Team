// SEO Helper Functions for Dynamic Pages
// Refactored: DRY, no duplicate '| Tolzy' (handled by layout template), strict types

import { Metadata } from 'next';
import { SITE_CONFIG, getCanonicalUrl } from '../config/seo.config';

// ==========================================
// Interfaces (no more `any`)
// ==========================================

export interface ToolSEO {
  title: string;
  description: string;
  keywords: string;
  structuredData: object;
}

export interface ToolData {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string | string[];
  tags: string[];
  rating: number;
  reviewCount?: number;
  pricing: string;
  url?: string;
  imageUrl?: string;
  features?: string[];
}

export interface ArticleData {
  id: string;
  title: string;
  description: string;
  content: string;
  coverImageUrl?: string;
  author?: string;
  createdAt: string;
  updatedAt?: string;
  category?: string;
  articleType?: 'explanation' | 'news';
}

export interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  duration?: string;
  skillLevel?: string;
  category?: string;
  thumbnail?: string;
  rating?: number;
  reviewCount?: number;
}

// ==========================================
// Category Maps (shared, single source of truth)
// ==========================================

const CATEGORY_NAMES: Record<string, string> = {
  'Writing': 'الكتابة',
  'Design': 'التصميم',
  'Programming': 'البرمجة',
  'Research': 'البحث العلمي',
  'Productivity': 'الإنتاجية',
  'Language Learning': 'تعلم اللغات',
  'Studying': 'الدراسة',
  'Teaching': 'التدريس',
  'Test Prep': 'التحضير للاختبارات',
  'Education': 'التعليم',
  'Business': 'الأعمال',
  'Data Science': 'علم البيانات',
  'Creativity': 'الإبداع',
  'Communication': 'التواصل',
  'Collaboration': 'التعاون',
  'Project Management': 'إدارة المشاريع',
  'Automation': 'الأتمتة',
  '3D': 'النمذجة ثلاثية الأبعاد',
  'Video': 'الفيديو',
  'Math': 'الرياضيات',
  'Science': 'العلوم',
  'Reading': 'القراءة',
  'Memory': 'الذاكرة',
  'Games': 'الألعاب',
  'Gamification': 'اللعب التعليمي',
  'Lifestyle': 'نمط الحياة',
  'Technology': 'التكنولوجيا',
  'Electronics': 'الإلكترونيات',
  'Freelancing': 'العمل الحر',
  'Library': 'المكتبة',
  'Online Learning': 'التعلم عبر الإنترنت',
  'Other': 'أخرى'
};

// ==========================================
// Core Text Generators (Single Source of Truth — DRY)
// ==========================================

/**
 * Generate title & description for a tool. Used by both generateToolSEO and generateToolMetadata.
 * NOTE: Titles do NOT include '| Tolzy' — handled by layout.tsx template.
 */
const getToolTexts = (tool: ToolData): { title: string; description: string } => {
  const categoryStr = Array.isArray(tool.category) ? tool.category[0] : tool.category;
  let title = `${tool.name} - أداة ${categoryStr}`;
  let description = `${tool.description} - ${tool.longDescription?.substring(0, 150) || tool.description}. تقييم: ${tool.rating}/5 من ${tool.reviewCount || 0} مراجعة. ${tool.pricing === 'Free' ? 'مجاني تماماً' : tool.pricing === 'Freemium' ? 'نسخة مجانية متاحة' : 'مدفوع'}.`;

  // Custom SEO overrides
  const name = tool.name.toLowerCase();

  if (name.includes('reimagine home') || tool.id === 'reimagine-home') {
    title = "صمم غرفتك مجاناً: شرح موقع Reimagine Home AI المذهل";
    description = "هل تحلم بتغيير ديكور منزلك بدقائق؟ اكتشف سر استخدام موقع Reimagine Home AI لتصميم ديكورك الداخلي باحترافية وبلمسة سحرية. ابدأ تصميمك الآن!";
  }

  if (name.includes('topaz video ai') || tool.id === 'topaz-video-ai') {
    title = "سر الدقة المذهلة: شرح ومراجعة برنامج Topaz Video AI";
    description = "هل تعاني من جودة الفيديو الضعيفة؟ اكتشف كيف يرفع Topaz Video AI دقة فيديوهاتك إلى 8K بضغطة زر. اقرأ المراجعة الشاملة لعام 2026 وجربه بنفسك!";
  }

  if (name.includes('renderforest') || tool.id === 'renderforest') {
    title = "Renderforest: تصميم فيديو وانترو احترافي مجاناً";
    description = "صمم فيديوهات ترويجية، انترو يوتيوب، وشعارات متحركة بسهولة مع Renderforest. قوالب جاهزة للتعديل تناسب المصممين والمبتدئين. جربه الآن.";
  }

  if (name.includes('adobe podcast') || tool.id === 'adobe-podcast' || name.includes('enhance speech')) {
    title = "Adobe Podcast: تحسين وتنقية الصوت بالذكاء الاصطناعي مجاناً";
    description = "حول تسجيلاتك الصوتية إلى جودة استوديو احترافية مع أداة Adobe Podcast (Enhance Speech). إزالة الضوضاء وتحسين الصوت بلمسة واحدة مجاناً.";
  }

  return { title, description };
};

/**
 * Generate title & description for a category. Single source of truth.
 */
const getCategoryTexts = (category: string, toolCount: number): { title: string; description: string } => {
  const arabicCategory = CATEGORY_NAMES[category] || category;

  let title = `أفضل ${toolCount}+ أداة ${arabicCategory} بالذكاء الاصطناعي 2026`;
  let description = `اكتشف أفضل ${toolCount} أداة ${arabicCategory} مدعومة بالذكاء الاصطناعي. أدوات مجانية ومدفوعة للطلاب والمحترفين. مراجعات وتقييمات حقيقية. ابدأ الآن مجاناً!`;

  if (category === 'Automation') {
    title = "أتمتة العمل بالذكاء الاصطناعي: ضاعف إنتاجيتك الآن";
    description = "هل تعبت من المهام الروتينية؟ اكتشف أفضل أدوات أتمتة العمل بالذكاء الاصطناعي لتوفير وقتك وجهدك. ابدأ التحول الرقمي لمشروعك اليوم بسهولة.";
  }

  if (category === 'Writing') {
    title = "كاتب مقالات ذكي مجاني يدعم العربية: أدوات صياغة محترفة";
    description = "اكتب مقالات احترافية مع أفضل كاتب ذكي مجاني يدعم اللغة العربية. أدوات إعادة صياغة دقيقة وتحسين المحتوى لمحركات البحث. جربها الآن لنتائج فورية.";
  }

  if (category === 'Design') {
    title = "وداعاً للفوتوشوب! أفضل مواقع تصميم بالذكاء الاصطناعي 2026";
    description = "هل تريد تصاميم احترافية في ثوانٍ؟ اكتشف سر أفضل مواقع الذكاء الاصطناعي للتصميم الجرافيكي لعام 2026 مجاناً. ابدأ الآن وارفع مستوى إبداعك!";
  }

  if (category === 'Programming') {
    title = "وداعاً للأخطاء: أفضل 50 أداة برمجة بالذكاء الاصطناعي 2026";
    description = "هل تريد مضاعفة سرعتك في كتابة الأكواد؟ تعرف على سر أقوى 50 أداة برمجة بالذكاء الاصطناعي لعام 2026 توفر نصف وقتك. تصفح القائمة وابدأ بذكاء!";
  }

  return { title, description };
};

/**
 * Generate title & description for Copilot page. Single source of truth.
 */
const getCopilotTexts = () => {
  const title = 'مساعد Tolzy Copilot: رفيقك الذكي للبرمجة والبحث';
  const description = 'Tolzy Copilot هو مساعد ذكاء اصطناعي متقدم يفهم احتياجاتك. يساعدك في البحث عن الأدوات، شرح الأكواد البرمجية، الكتابة الإبداعية، وتلخيص المحتوى. جربه الآن مجاناً!';
  const keywords = [
    'Tolzy Copilot', 'مساعد ذكي', 'شات بوت عربي', 'ChatGPT عربي',
    'بديل ChatGPT', 'مساعد شخصي AI', 'شرح كود برمجي',
    'كتابة مقالات بالذكاء الاصطناعي', 'أداة بحث ذكية',
    'تولزي كوبايلوت', 'ذكاء اصطناعي للمبرمجين', 'Copilot', 'AI Assistant'
  ];
  return { title, description, keywords };
};

/**
 * Generate title & description for an article/news. Single source of truth.
 */
const getArticleTexts = (article: ArticleData): { title: string; description: string; isExplanation: boolean } => {
  const isExplanation = article.articleType === 'explanation';
  const typeSuffix = isExplanation ? 'شروحات Tolzy' : 'أخبار Tolzy';
  const title = `${article.title} | ${typeSuffix}`;
  const description = article.description || article.content?.substring(0, 160) || '';
  return { title, description, isExplanation };
};

// ==========================================
// Google Standard Software Application Category Mapper
// ==========================================

export const mapToStandardCategory = (category: string | string[]): string => {
  const cat = Array.isArray(category) ? category[0] : category;
  if (!cat) return 'UtilitiesApplication';
  
  const mapping: Record<string, string> = {
    'Writing': 'BusinessApplication',
    'Design': 'GraphicDesignApplication',
    'Programming': 'DeveloperApplication',
    'Research': 'ReferenceApplication',
    'Productivity': 'UtilitiesApplication',
    'Language Learning': 'EducationalApplication',
    'Studying': 'EducationalApplication',
    'Teaching': 'EducationalApplication',
    'Test Prep': 'EducationalApplication',
    'Education': 'EducationalApplication',
    'Business': 'BusinessApplication',
    'Data Science': 'DeveloperApplication',
    'Creativity': 'MultimediaApplication',
    'Communication': 'UtilitiesApplication',
    'Collaboration': 'BusinessApplication',
    'Project Management': 'BusinessApplication',
    'Automation': 'UtilitiesApplication',
    '3D': 'GraphicDesignApplication',
    'Video': 'MultimediaApplication',
    'Math': 'EducationalApplication',
    'Science': 'EducationalApplication',
    'Reading': 'ReferenceApplication',
    'Memory': 'UtilitiesApplication',
    'Games': 'GameApplication',
    'Gamification': 'EducationalApplication',
    'Lifestyle': 'EntertainmentApplication',
    'Technology': 'UtilitiesApplication',
    'Electronics': 'DeveloperApplication',
    'Freelancing': 'BusinessApplication',
    'Library': 'ReferenceApplication',
    'Online Learning': 'EducationalApplication'
  };

  return mapping[cat] || 'UtilitiesApplication';
};

// ==========================================
// Legacy Structured Data Generators (Pages Router / Schema.org)
// ==========================================

/**
 * Generate SEO data for a tool page (legacy — structured data + keywords string)
 */
export const generateToolSEO = (tool: ToolData): ToolSEO => {
  const { title, description } = getToolTexts(tool);
  const categoryStr = Array.isArray(tool.category) ? tool.category[0] : tool.category;
  const standardCategory = mapToStandardCategory(tool.category);

  const keywords = [
    tool.name,
    ...tool.tags,
    categoryStr,
    'أداة ذكاء اصطناعي', 'AI tool',
    tool.pricing === 'Free' ? 'مجاني' : '',
    'tolzy', 'أدوات AI', 'تولزي', 'توليزي', 'تولز', 'تولزي أدوات', 'tolzy ai tools'
  ].filter(Boolean).join(', ');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": standardCategory,
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": tool.pricing === 'Free' || tool.pricing === 'Freemium' ? "0" : "10",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    ...(tool.rating && tool.rating > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tool.rating,
        "reviewCount": tool.reviewCount && tool.reviewCount > 0 ? tool.reviewCount : 1,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {}),
    "url": tool.url,
    "image": tool.imageUrl,
    "featureList": tool.features?.join(', ') || '',
    "softwareVersion": "Latest",
    "author": { "@type": "Organization", "name": "Tolzy" }
  };

  return { title, description, keywords, structuredData };
};

/**
 * Generate SEO data for category pages (legacy)
 */
export const generateCategorySEO = (category: string, toolCount: number) => {
  const { title, description } = getCategoryTexts(category, toolCount);
  const arabicCategory = CATEGORY_NAMES[category] || category;

  const keywords = `أدوات ${arabicCategory}, ${category} tools, AI ${arabicCategory}, أدوات ذكاء اصطناعي ${arabicCategory}, أدوات مجانية ${arabicCategory}, tolzy, أدوات AI 2026, تولزي, توليزي, تولز, تولزي أدوات, tolzy ai tools`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": `https://www.tolzy.me/tools?category=${category}`,
    "numberOfItems": toolCount,
    "about": { "@type": "Thing", "name": arabicCategory }
  };

  return { title, description, keywords, structuredData };
};

/**
 * Generate Copilot SEO data (legacy — structured data)
 */
export const generateCopilotSEO = () => {
  const { title, description, keywords } = getCopilotTexts();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Tolzy Copilot",
    "applicationCategory": "AIAssistant",
    "operatingSystem": "Web, Mobile",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": description,
    "featureList": "Chat, Code Explanation, Content Generation, Tool Search, Image Generation",
    "softwareVersion": "2.0"
  };

  return { title, description, keywords: keywords.join(', '), structuredData };
};

// ==========================================
// Schema.org Structured Data
// ==========================================

/**
 * Generate Article structured data
 */
export const generateArticleSchema = (article: ArticleData) => {
  const isExplanation = article.articleType === 'explanation';
  const schemaType = isExplanation ? "TechArticle" : "NewsArticle";

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    "headline": article.title,
    "description": article.description,
    "image": article.coverImageUrl || 'https://tolzy.me/image/tools/Hero.png',
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt || article.createdAt,
    "author": { "@type": "Organization", "name": article.author || "Tolzy", "url": "https://tolzy.me" },
    "publisher": {
      "@type": "Organization", "name": "Tolzy",
      "logo": { "@type": "ImageObject", "url": "https://tolzy.me/image/tools/Hero.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://tolzy.me/news/${article.id}` },
    "articleSection": article.category || (isExplanation ? "Tutorials" : "Technology News"),
    "inLanguage": "ar",
    ...(isExplanation && { "proficiencyLevel": "Beginner" })
  };
};

/**
 * Generate Course structured data
 */
export const generateCourseSchema = (course: CourseData) => {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": { "@type": "Organization", "name": "Tolzy", "url": "https://tolzy.me" },
    "instructor": { "@type": "Person", "name": course.instructor || "Tolzy Team" },
    "educationalLevel": course.skillLevel || "Beginner to Advanced",
    "inLanguage": "ar",
    "coursePrerequisites": "لا توجد متطلبات مسبقة",
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": course.duration || "متغيرة حسب الوتيرة الشخصية"
    },
    "aggregateRating": course.rating ? {
      "@type": "AggregateRating",
      "ratingValue": course.rating,
      "reviewCount": course.reviewCount || 1,
      "bestRating": "5", "worstRating": "1"
    } : undefined,
    "image": course.thumbnail || "https://tolzy.me/image/tools/Hero.png",
    "url": `https://tolzy.me/learn/course/${course.id}`
  };
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbData = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * Generate FAQ structured data
 */
export const generateFAQData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  };
};

/**
 * Generate Organization structured data
 */
export const generateOrganizationData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tolzy",
    "alternateName": ["تولزي", "Tolzy Tools"],
    "url": "https://www.tolzy.me",
    "logo": "https://www.tolzy.me/image/tools/Hero.png",
    "description": "رائدة تقنيات التعليم والذكاء الاصطناعي. منظومة متكاملة تهدف إلى تمكين الأفراد والمؤسسات من أدوات المستقبل.",
    "foundingDate": "2024",
    "founder": { "@type": "Person", "name": "محمود موسى" },
    "contactPoint": { "@type": "ContactPoint", "contactType": "Customer Service", "availableLanguage": ["Arabic", "English"] },
    "sameAs": ["https://twitter.com/tolzytools"],
    "makesOffer": [
      { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Tolzy Tools", "description": "دليل شامل لأكثر من 630 أداة ذكاء اصطناعي", "url": "https://www.tolzy.me/tools" } },
      { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Tolzy Learn", "description": "منصة تعليمية تفاعلية تقدم دورات وكورسات مجانية", "url": "https://www.tolzy.me/learn" } }
    ]
  };
};

/**
 * Generate WebPage structured data
 */
export const generateWebPageData = (title: string, description: string, url: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "inLanguage": "ar",
    "isPartOf": { "@type": "WebSite", "name": "Tolzy", "url": "https://www.tolzy.me" },
    "publisher": {
      "@type": "Organization", "name": "Tolzy",
      "logo": { "@type": "ImageObject", "url": "https://www.tolzy.me/image/tools/Hero.png" }
    }
  };
};

/**
 * Generate Tolzy Ecosystem structured data
 */
export const generateTolzyEcosystemData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Corporation",
    "name": "Tolzy",
    "description": "النظام البيئي الشامل لـ Tolzy - منصة متكاملة تجمع أدوات الذكاء الاصطناعي والتعليم التفاعلي",
    "url": "https://www.tolzy.me",
    "logo": "https://www.tolzy.me/image/tools/Hero.png",
    "foundingDate": "2024",
    "founder": { "@type": "Person", "name": "محمود موسى" },
    "owns": [
      { "@type": "Product", "name": "Tolzy Tools", "description": "دليل شامل لأكثر من 630 أداة ذكاء اصطناعي", "category": "AI Tools Directory", "url": "https://www.tolzy.me/tools" },
      { "@type": "Product", "name": "Tolzy Learn", "description": "منصة تعليمية تفاعلية للدورات والكورسات المجانية", "category": "Educational Platform", "url": "https://www.tolzy.me/learn" }
    ],
    "audience": { "@type": "Audience", "audienceType": ["الطلاب", "المعلمون", "المطورون", "المصممون", "الباحثون", "مبدعو المحتوى"] }
  };
};

/**
 * Generate SearchAction structured data
 */
export const generateSearchActionSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://tolzy.me",
    "name": "Tolzy",
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": "https://tolzy.me/tools?search={search_term_string}" },
      "query-input": "required name=search_term_string"
    }
  };
};

// ==========================================
// Smart Keywords Generator
// ==========================================

export const getSmartKeywords = (text: string = ''): string[] => {
  const content = text.toLowerCase();

  const coreKeywords = [
    'كورسات برمجة', 'كورسات برمجة مجانية', 'تعلم البرمجة', 'تعلم البرمجة من الصفر',
    'برمجة للمبتدئين', 'مواقع تعلم البرمجة', 'أفضل موقع لتعلم البرمجة',
    'تعلم البرمجة أونلاين', 'كورسات أونلاين مجانية', 'كورسات مجانية بشهادات',
    'كورسات بشهادات معتمدة', 'شهادات برمجة مجانية', 'تعلم البرمجة بدون خبرة',
    'أفضل كورس برمجة للمبتدئين', 'من أين أبدأ تعلم البرمجة'
  ];

  const keywordsMap: Record<string, string[]> = {
    'python': ['Python', 'تعلم بايثون', 'كورس بايثون', 'كورس بايثون مجاني', 'بايثون للمبتدئين', 'تعلم Python بالعربي'],
    'javascript': ['JavaScript', 'تعلم جافاسكريبت', 'كورس JavaScript', 'جافاسكريبت للمبتدئين', 'JS tutorial arabic'],
    'web': ['تعلم برمجة المواقع', 'تعلم HTML', 'تعلم CSS', 'تعلم Front End', 'تعلم Back End', 'Full Stack Developer', 'تطوير الويب'],
    'ai': ['كورسات ذكاء اصطناعي', 'تعلم الذكاء الاصطناعي', 'تعلم الذكاء الاصطناعي من الصفر', 'أدوات الذكاء الاصطناعي', 'تعلم استخدام ChatGPT', 'كتابة برومبتات بالذكاء الاصطناعي'],
    'react': ['تعلم React', 'كورس React', 'React JS بالعربي']
  };

  const matchedKeywords = Object.entries(keywordsMap).reduce((acc, [key, keywords]) => {
    if (content.includes(key) || content.includes(keywords[1])) {
      return [...acc, ...keywords];
    }
    return acc;
  }, [] as string[]);

  return [...new Set([...coreKeywords, ...matchedKeywords])];
};

// ==========================================
// Next.js App Router Metadata Generators
//   All reuse the core text generators above.
//   Titles do NOT include '| Tolzy' — layout template handles it.
// ==========================================

/**
 * Generate Next.js Metadata for tool pages
 */
export const generateToolMetadata = (tool: ToolData): Metadata => {
  const { title, description } = getToolTexts(tool);
  const categoryStr = Array.isArray(tool.category) ? tool.category[0] : tool.category;

  return {
    title,
    description,
    keywords: [
      tool.name, ...(tool.tags || []), categoryStr,
      'أداة ذكاء اصطناعي', 'AI tool',
      tool.pricing === 'Free' ? 'مجاني' : '',
      ...SITE_CONFIG.keywords.slice(0, 5),
    ].filter(Boolean),
    openGraph: {
      title, description,
      images: [{ url: tool.imageUrl || SITE_CONFIG.images.ogDefault, width: 1200, height: 630, alt: tool.name }],
      type: 'website', locale: 'ar_AR', siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: [tool.imageUrl || SITE_CONFIG.images.ogDefault],
      site: SITE_CONFIG.social.twitter,
    },
    alternates: { canonical: getCanonicalUrl(`/tools/${tool.id}`) },
  };
};

/**
 * Generate Next.js Metadata for news/article pages
 */
export const generateNewsMetadata = (article: ArticleData): Metadata => {
  const { title, description, isExplanation } = getArticleTexts(article);

  return {
    title,
    description,
    keywords: [
      article.title,
      article.category || (isExplanation ? 'شرح' : 'أخبار'),
      isExplanation ? 'شرح ذكاء اصطناعي' : 'أخبار ذكاء اصطناعي',
      isExplanation ? 'AI tutorial' : 'AI news',
      ...SITE_CONFIG.keywords.slice(0, 5),
    ],
    openGraph: {
      title, description,
      images: [{ url: article.coverImageUrl || SITE_CONFIG.images.ogDefault, width: 1200, height: 630, alt: article.title }],
      type: 'article', locale: 'ar_AR', siteName: SITE_CONFIG.name,
      publishedTime: article.createdAt, modifiedTime: article.updatedAt,
      authors: [article.author || 'Tolzy'],
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: [article.coverImageUrl || SITE_CONFIG.images.ogDefault],
      site: SITE_CONFIG.social.twitter,
    },
    alternates: { canonical: getCanonicalUrl(`/news/${article.id}`) },
  };
};

/**
 * Generate Next.js Metadata for course pages
 */
export const generateCourseMetadata = (course: CourseData): Metadata => {
  const title = `${course.title} - دورة برمجة مجانية`;
  const description = course.description || `تعلم ${course.title} من الصفر مع دورة مجانية شاملة باللغة العربية.`;

  return {
    title,
    description,
    keywords: [
      course.title, 'كورس برمجة مجاني', 'تعلم البرمجة',
      course.category || 'برمجة', 'دورة مجانية بالعربي',
      ...SITE_CONFIG.keywords.slice(0, 5),
    ],
    openGraph: {
      title, description,
      images: [{ url: course.thumbnail || SITE_CONFIG.images.ogDefault, width: 1200, height: 630, alt: course.title }],
      type: 'website', locale: 'ar_AR', siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: [course.thumbnail || SITE_CONFIG.images.ogDefault],
      site: SITE_CONFIG.social.twitter,
    },
    alternates: { canonical: getCanonicalUrl(`/learn/course/${course.id}`) },
  };
};

/**
 * Generate Next.js Metadata for category/filtered pages
 */
export const generateCategoryMetadata = (category: string, toolCount: number): Metadata => {
  const { title, description } = getCategoryTexts(category, toolCount);
  const arabicCategory = CATEGORY_NAMES[category] || category;

  return {
    title,
    description,
    keywords: [
      `أدوات ${arabicCategory}`, `${category} tools`, `AI ${arabicCategory}`,
      ...SITE_CONFIG.keywords.slice(0, 5),
    ],
    openGraph: {
      title, description,
      images: [SITE_CONFIG.images.ogDefault],
      type: 'website', locale: 'ar_AR', siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: [SITE_CONFIG.images.ogDefault],
      site: SITE_CONFIG.social.twitter,
    },
    alternates: { canonical: getCanonicalUrl(`/tools?category=${category}`) },
  };
};

/**
 * Generate Next.js Metadata for Copilot page (NEW — was missing)
 */
export const generateCopilotMetadata = (): Metadata => {
  const { title, description, keywords } = getCopilotTexts();

  return {
    title,
    description,
    keywords,
    openGraph: {
      title, description,
      images: [{ url: 'https://tolzy.me/image/copilot-chat.png', width: 1200, height: 630, alt: 'Tolzy Copilot' }],
      type: 'website', locale: 'ar_EG', siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: ['https://tolzy.me/image/copilot-chat.png'],
      site: SITE_CONFIG.social.twitter,
    },
    alternates: { canonical: getCanonicalUrl('/copilot') },
    robots: { index: true, follow: true },
  };
};

/**
 * Generate ContactPage structured data
 */
export const generateContactPageSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "اتصل بنا | Tolzy",
    "description": "اتصل بفريق منصة تولزي (Tolzy) للاستفسارات، الاقتراحات، أو طلبات الشراكة. نحن هنا لمساعدتك دائماً.",
    "url": "https://tolzy.me/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "Tolzy",
      "url": "https://tolzy.me",
      "logo": "https://tolzy.me/image/tools/Logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@tolzy.me",
        "url": "https://tolzy.me/contact",
        "availableLanguage": ["Arabic", "English"]
      }
    }
  };
};

/**
 * Generate DiscussionForumPosting structured data for Community page
 */
export const generateDiscussionForumSchema = (posts: Array<{ id: string; title: string; content: string; author: string; createdAt: string; repliesCount?: number }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": "https://tolzy.me/community",
    "headline": "مجتمع تولزي التقني - نقاشات حول الذكاء الاصطناعي والبرمجة",
    "description": "انضم إلى مجتمع تولزي التقني، وشارك في نقاشات مثيرة حول أدوات الذكاء الاصطناعي، البرمجة، التقنيات الحديثة، والفرص التعليمية.",
    "url": "https://tolzy.me/community",
    "mainEntityOfPage": "https://tolzy.me/community",
    "author": {
      "@type": "Organization",
      "name": "Tolzy"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tolzy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tolzy.me/image/tools/Logo.png"
      }
    },
    "sharedContent": posts.map(post => ({
      "@type": "DiscussionForumPosting",
      "headline": post.title,
      "text": post.content?.substring(0, 200),
      "url": `https://tolzy.me/community/post/${post.id}`,
      "author": {
        "@type": "Person",
        "name": post.author || "عضو تولزي"
      },
      "datePublished": post.createdAt,
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/CommentAction",
        "userInteractionCount": post.repliesCount || 0
      }
    }))
  };
};

/**
 * Generate CollectionPage structured data for Tools or Courses indexing pages
 */
export const generateCollectionPageSchema = (
  name: string,
  description: string,
  url: string,
  items: Array<{ name: string; description: string; url: string; imageUrl?: string }>
) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": items.length,
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "url": item.url,
        ...(item.imageUrl && { "image": item.imageUrl }),
        "description": item.description?.substring(0, 150)
      }))
    }
  };
};

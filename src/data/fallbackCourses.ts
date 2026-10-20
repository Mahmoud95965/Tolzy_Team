import { Course } from '../types/learn';

export const FALLBACK_COURSES: Course[] = [
  {
    id: 'fullstack-web-pro',
    title: 'دبلومة تطوير تطبيقات الويب الشاملة (Full Stack)',
    description: 'تعلم بناء تطبيقات ويب كاملة من الصفر حتى النشر باستخدام React 19, Next.js, Node.js, وقواعد بيانات PostgreSQL.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
    level: 'beginner',
    category: 'تطوير الويب',
    instructor: 'م. أحمد حسام',
    price: 'free',
    sourceUrl: 'https://www.youtube.com/results?search_query=full+stack+web+development+arabic',
    lessons: [],
    isPublished: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    studentsCount: 3420,
    rating: 4.9,
    platform: 'Tolzy',
    duration: '45 ساعة',
    hasCertificate: true,
    reviewsCount: 280,
    whatYouWillLearn: [
      'أساسيات HTML5 و CSS3 المتقدمة وتصميم متجاوب',
      'JavaScript ES6+ والبرمجة غير المتزامنة Asynchronous',
      'بناء تطبيقات React 19 وإدارة الحالة بكفاءة',
      'تطوير تطبيقات Next.js 15 بالـ App Router و Server Actions',
      'تصميم قواعد بيانات PostgreSQL والربط مع Prisma ORM',
      'نشر التطبيقات على Vercel و Docker ومراقبة الأداء'
    ],
    metadata: {
      skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
      certificate: 'نعم — شهادة إتمام معتمدة',
      prerequisites: 'لا توجد متطلبات مسبقة — نبدأ من الصفر'
    }
  },
  {
    id: 'ai-llm-agents-masterclass',
    title: 'تطوير تطبيقات ونماذج الذكاء الاصطناعي (LLMs & AI Agents)',
    description: 'بناء وكلاء الذكاء الاصطناعي وأنظمة RAG المتقدمة والربط مع LangChain و OpenAI و Llama 3 محلياً.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
    level: 'intermediate',
    category: 'الذكاء الاصطناعي',
    instructor: 'د. كريم النجار',
    price: 'free',
    sourceUrl: 'https://www.youtube.com/results?search_query=ai+agents+langchain+rag+arabic',
    lessons: [],
    isPublished: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    studentsCount: 2890,
    rating: 4.95,
    platform: 'Tolzy',
    duration: '38 ساعة',
    hasCertificate: true,
    reviewsCount: 310,
    whatYouWillLearn: [
      'فهم بنيان النماذج اللغوية الكبيرة (LLMs) وآلية التوليد',
      'هندسة الأوامر المتقدمة Advanced Prompt Engineering',
      'بناء أنظمة استرجاع المعلومات المعززة (RAG) بقواعد بيانات شعاعية',
      'تطوير وكلاء أذكياء ذاتيي التشغيل باستخدام LangGraph و AutoGen',
      'تشغيل نماذج مفتوحة المصدر مثل Llama 3 محلياً باستخدام Ollama',
      'تأمين تطبيقات الذكاء الاصطناعي ضد هجمات Prompt Injection'
    ],
    metadata: {
      skills: ['Python', 'LangChain', 'OpenAI API', 'Vector Databases', 'Llama 3', 'RAG'],
      certificate: 'نعم — شهادة إتمام معتمدة',
      prerequisites: 'معرفة أساسية بلغة Python'
    }
  },
  {
    id: 'python-data-science-ai',
    title: 'علم البيانات والتعلم الآلي بلغة Python',
    description: 'مسار عملي كامل في تنظيف وتحليل البيانات، استخراج الرؤى الإحصائية، وبناء نماذج Machine Learning متقدمة.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    level: 'intermediate',
    category: 'علم البيانات',
    instructor: 'م. سارة المهندس',
    price: 'free',
    sourceUrl: 'https://www.youtube.com/results?search_query=python+data+science+machine+learning+arabic',
    lessons: [],
    isPublished: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    studentsCount: 2150,
    rating: 4.85,
    platform: 'Tolzy',
    duration: '32 ساعة',
    hasCertificate: true,
    reviewsCount: 195,
    whatYouWillLearn: [
      'معالجة وتنظيف البيانات الكبيرة باستخدام Pandas و NumPy',
      'إنشاء لوحات ورسوم بيانية تفاعلية باستخدام Matplotlib و Seaborn',
      'فهم المفاهيم الإحصائية الأساسية واستكشاف البيانات الاستدلالي',
      'تدريب نماذج التصنيف والانحدار مع Scikit-Learn',
      'تقييم أداء النماذج وتفادي الـ Overfitting',
      'بناء نماذج تعلم عميق أولية مع PyTorch'
    ],
    metadata: {
      skills: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'Matplotlib', 'Machine Learning'],
      certificate: 'نعم — شهادة إتمام معتمدة',
      prerequisites: 'مبادئ البرمجة'
    }
  },
  {
    id: 'ui-ux-design-figma-pro',
    title: 'تصميم واجهات وتجربة المستخدم الاحترافية مع Figma',
    description: 'مبادئ تصميم المنتجات الرقمية الحديثة، أنظمة التصميم Design Systems، والاختبار السريع مع المستخدمين.',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60',
    level: 'beginner',
    category: 'تصميم UI/UX',
    instructor: 'م. عمر طارق',
    price: 'free',
    sourceUrl: 'https://www.youtube.com/results?search_query=ui+ux+figma+design+arabic',
    lessons: [],
    isPublished: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    studentsCount: 1920,
    rating: 4.9,
    platform: 'Tolzy',
    duration: '26 ساعة',
    hasCertificate: true,
    reviewsCount: 140,
    whatYouWillLearn: [
      'سيكولوجية تجربة المستخدم وبناء رحلة المستخدم User Journey',
      'إتقان ميزات Figma المتقدمة: Auto Layout و Components و Variables',
      'إنشاء أنظمة تصميم متكاملة وقابلة للتطوير Design Systems',
      'تصميم نماذج أولية تفاعلية واقعية Interactive Prototyping',
      'إجراء اختبارات قابلية الاستخدام Usability Testing وتحليل النتائج',
      'تسليم التصاميم للمطورين Developer Handoff بدقة'
    ],
    metadata: {
      skills: ['Figma', 'UI Design', 'UX Research', 'Design Systems', 'Wireframing', 'Prototyping'],
      certificate: 'نعم — شهادة إتمام معتمدة',
      prerequisites: 'لا توجد متطلبات مسبقة'
    }
  },
  {
    id: 'cybersecurity-ethical-hacking',
    title: 'الأمن السيبراني واختبار الاختراق الأخلاقي الشامل',
    description: 'تعلم حماية الأنظمة والشبكات، اكتشاف الثغرات الأمنية الشائعة وطرق الوقاية منها طبقاً لمعايير OWASP.',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
    level: 'advanced',
    category: 'الأمن السيبراني',
    instructor: 'م. مصطفى الشافعي',
    price: 'free',
    sourceUrl: 'https://www.youtube.com/results?search_query=cybersecurity+ethical+hacking+arabic',
    lessons: [],
    isPublished: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    studentsCount: 1840,
    rating: 4.88,
    platform: 'Tolzy',
    duration: '40 ساعة',
    hasCertificate: true,
    reviewsCount: 165,
    whatYouWillLearn: [
      'أساسيات بروتوكولات الشبكات وتحليل الحزم باستخدام Wireshark',
      'إعداد مختبر اختراق آمن باستخدام Kali Linux',
      'اكتشاف ثغرات تطبيقات الويب طبقاً لقائمة OWASP Top 10',
      'استخدام أدوات الفحص المتقدمة مثل Nmap و Burp Suite و Metasploit',
      'طرق التشفير وتأمين البيانات وتأمين الخوادم ضد هجمات DDoS',
      'كتابة تقارير اختبار الاختراق المهنية وتقديم حلول الحماية'
    ],
    metadata: {
      skills: ['Network Security', 'Kali Linux', 'Burp Suite', 'OWASP Top 10', 'Nmap', 'Penetration Testing'],
      certificate: 'نعم — شهادة إتمام معتمدة',
      prerequisites: 'معرفة جيدة بالشبكات وأنظمة التشغيل'
    }
  },
  {
    id: 'nextjs-typescript-mastery',
    title: 'بناء تطبيقات الويب الحديثة بـ Next.js 15 و TypeScript',
    description: 'تعلم Server Actions, App Router, SSR/SSG, تحسين محركات البحث SEO، وإدارة الحالة الاحترافية.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    level: 'intermediate',
    category: 'تطوير الويب',
    instructor: 'م. حسام الدين',
    price: 'free',
    sourceUrl: 'https://www.youtube.com/results?search_query=nextjs+15+typescript+arabic',
    lessons: [],
    isPublished: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    studentsCount: 2310,
    rating: 4.92,
    platform: 'Tolzy',
    duration: '28 ساعة',
    hasCertificate: true,
    reviewsCount: 210,
    whatYouWillLearn: [
      'أساسيات TypeScript للكتابة الآمنة للأنماط والواجهات Interfaces',
      'الاستفادة القصوى من React Server Components في Next.js',
      'استخدام Server Actions لمعالجة النماذج بدون بناء API endpoints يدوياً',
      'استراتيجيات التخزين المؤقت المتقدمة Caching & Revalidation',
      'تحسين سرعة الصفحات ومؤشرات الويب الأساسية Core Web Vitals',
      'توليد البيانات المنظمة JSON-LD وخريطة الموقع الديناميكية SEO'
    ],
    metadata: {
      skills: ['Next.js 15', 'TypeScript', 'Server Components', 'Server Actions', 'SEO Optimization', 'Turbopack'],
      certificate: 'نعم — شهادة إتمام معتمدة',
      prerequisites: 'معرفة جيدة بـ JavaScript و React'
    }
  },
];

export function getFallbackCourses(): Course[] {
  return FALLBACK_COURSES;
}

export function getFallbackCourseById(id: string): Course | null {
  if (!id) return null;
  const normalizedId = String(id).toLowerCase().trim();
  return (
    FALLBACK_COURSES.find(c => 
      c.id.toLowerCase() === normalizedId || 
      c.title.toLowerCase().includes(normalizedId)
    ) || null
  );
}

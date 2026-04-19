
import {
    Globe, Layout, Server, Brain, Layers, Shield
} from 'lucide-react';
import { LearningPath } from '../types/learn';

export const learningPaths: LearningPath[] = [
    {
        id: 'fullstack-web',
        title: 'Full Stack Web Developer',
        description: 'ابدأ من الصفر وتعلم كيفية بناء تطبيقات ويب كاملة باستخدام MERN Stack (MongoDB, Express, React, Node.js).',
        icon: <Globe className="w-8 h-8" />,
        color: 'from-blue-500 to-cyan-500',
        level: 'beginner',
        duration: '6 أشهر',
        jobRole: 'Full Stack Developer',
        averageSalary: '$85,000/سنة', // Adjusted for global/remote averages
        featured: true,
        steps: [
            {
                id: 'html-css',
                title: 'أساسيات الويب (HTML & CSS)',
                description: 'تعلم هيكلة صفحات الويب وتنسيقها بإحترافية. يشمل HTML5, Semantic Elements, CSS3, Flexbox, و Grid.',
                duration: 'أسبوعين',
                resources: [
                    { title: 'MDN Web Docs - HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'article' },
                    { title: 'Modern CSS Guide', url: 'https://css-tricks.com/', type: 'article' }
                ]
            },
            {
                id: 'js-advanced',
                title: 'JavaScript المتقدم',
                description: 'إتقان لغة البرمجة الأكثر أهمية. ES6+, DOM Manipulation, Async/Await, Fetch API, و Modules.',
                duration: '4 أسابيع',
                resources: [
                    { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'article' },
                    { title: 'Namaste JavaScript', url: 'https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP', type: 'video' }
                ]
            },
            {
                id: 'version-control',
                title: 'Git & GitHub',
                description: 'تعلم إدارة إصدارات الكود والعمل مع الفرق البرمجية باستخدام Git.',
                duration: 'أسبوع',
                resources: [
                    { title: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2', type: 'article' }
                ]
            },
            {
                id: 'react-ecosystem',
                title: 'React.js Ecosystem',
                description: 'بناء واجهات مستخدم حديثة. Components, Hooks, Context API, React Query, و State Management (Redux/Zustand).',
                duration: '6 أسابيع',
                resources: [
                    { title: 'React Official Docs', url: 'https://react.dev/', type: 'article' }
                ]
            },
            {
                id: 'backend-node',
                title: 'Node.js & Express',
                description: 'برمجة السيرفرات وبناء RESTful APIs قوية وآمنة.',
                duration: '4 أسابيع',
                resources: []
            },
            {
                id: 'database-design',
                title: 'Databases (SQL & NoSQL)',
                description: 'تصميم قواعد البيانات باستخدام MongoDB و PostgreSQL.',
                duration: '3 أسابيع',
                resources: []
            },
            {
                id: 'deployment',
                title: 'Deployment & CI/CD',
                description: 'نشر التطبيقات على Vercel و Render، وإعداد خطوط النشر الآلي.',
                duration: 'أسبوعين',
                resources: []
            }
        ]
    },
    {
        id: 'frontend-mastery',
        title: 'Frontend Mastery',
        description: 'المسار الشامل لاحتراف تطوير الواجهات. يشمل React, Next.js, TypeScript, Tailwind, و Performance Optimization.',
        icon: <Layout className="w-8 h-8" />,
        color: 'from-purple-500 to-pink-500',
        level: 'intermediate',
        duration: '4 أشهر',
        jobRole: 'Frontend Engineer',
        averageSalary: '$75,000/سنة',
        steps: [
            {
                id: 'advanced-css',
                title: 'Advanced CSS & Frameworks',
                description: 'إتقان Tailwind CSS, SASS, CSS Modules, و Animations.',
                duration: '3 أسابيع',
                resources: [
                    { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', type: 'article' }
                ]
            },
            {
                id: 'typescript',
                title: 'TypeScript',
                description: 'كتابة كود آمن وقابل للصيانة باستخدام TypeScript Types & Intefaces.',
                duration: 'أسبوعين',
                resources: [
                    { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', type: 'article' }
                ]
            },
            {
                id: 'nextjs-full',
                title: 'Next.js Framework',
                description: 'تعلم Server-Side Rendering (SSR), App Router, و API Routes.',
                duration: '4 أسابيع',
                resources: [
                    { title: 'Next.js Learn', url: 'https://nextjs.org/learn', type: 'article' }
                ]
            },
            {
                id: 'testing',
                title: 'Frontend Testing',
                description: 'كتابة Unit Tests و Integration Tests باستخدام Jest و React Testing Library.',
                duration: 'أسبوعين',
                resources: []
            },
            {
                id: 'performance',
                title: 'Web Performance',
                description: 'تحسين سرعة الموقع، Core Web Vitals, و Accessibility (A11y).',
                duration: 'أسبوعين',
                resources: []
            }
        ]
    },
    {
        id: 'backend-engineering',
        title: 'Backend Engineering',
        description: 'تخصص في هندسة الواجهات الخلفية. أنظمة الموزعة، Microservices، قواعد البيانات المتقدمة، و Cloud.',
        icon: <Server className="w-8 h-8" />,
        color: 'from-green-500 to-emerald-500',
        level: 'advanced',
        duration: '5 أشهر',
        jobRole: 'Backend Engineer',
        averageSalary: '$92,000/سنة', // Adjusted higher for specialized
        steps: [
            {
                id: 'networking-basics',
                title: 'Networking & OS Basics',
                description: 'فهم بروتوكولات الإنترنت (HTTP/HTTPS, TCP/UDP, DNS) وأساسيات Linux.',
                duration: 'أسبوعين',
                resources: []
            },
            {
                id: 'advanced-backend',
                title: 'Advanced API Design',
                description: 'بناء APIs متقدمة باستخدام GraphQL, gRPC, و WebSockets.',
                duration: '3 أسابيع',
                resources: []
            },
            {
                id: 'system-design',
                title: 'System Design & Architecture',
                description: 'تصميم أنظمة قابلة للتوسع. Caching (Redis), Message Queues (RabbitMQ/Kafka), و Load Balancing.',
                duration: '4 أسابيع',
                resources: []
            },
            {
                id: 'microservices',
                title: 'Microservices & Containers',
                description: 'استخدام Docker و Kubernetes لإدارة الخدمات المصغرة.',
                duration: '4 أسابيع',
                resources: []
            },
            {
                id: 'security-backend',
                title: 'Backend Security',
                description: 'حماية التطبيقات (OWASP Top 10), Authentication (OAuth2, JWT), و Rate Limiting.',
                duration: 'أسبوعين',
                resources: []
            }
        ]
    },
    {
        id: 'ai-data-science',
        title: 'AI & Data Science',
        description: 'مسار عالم البيانات ومهندس الذكاء الاصطناعي. Python, Machine Learning, Deep Learning, و Generative AI.',
        icon: <Brain className="w-8 h-8" />,
        color: 'from-orange-500 to-red-500',
        level: 'advanced',
        duration: '8 أشهر',
        jobRole: 'AI Engineer / Data Scientist',
        averageSalary: '$105,000/سنة', // Adjusted
        steps: [
            {
                id: 'python-data',
                title: 'Python for Data Science',
                description: 'مكتبات تحليل البيانات الأساسية: NumPy, Pandas, و Matplotlib.',
                duration: '4 أسابيع',
                resources: []
            },
            {
                id: 'math-stats',
                title: 'الرياضيات والإحصاء',
                description: 'الجبر الخطي، الاحتمالات، والإحصاء الضروري لفهم خوارزميات التعلم الآلي.',
                duration: '4 أسابيع',
                resources: []
            },
            {
                id: 'machine-learning',
                title: 'Machine Learning Algorithms',
                description: 'Supervised & Unsupervised Learning (Regression, Classification, Clustering) باستخدام Scikit-Learn.',
                duration: '6 أسابيع',
                resources: []
            },
            {
                id: 'deep-learning',
                title: 'Deep Learning & Neural Networks',
                description: 'بناء الشبكات العصبية باستخدام TensorFlow أو PyTorch. يشمل CNNs و RNNs.',
                duration: '6 أسابيع',
                resources: []
            },
            {
                id: 'gen-ai',
                title: 'Generative AI & LLMs',
                description: 'مقدمة في النماذج اللغوية الكبيرة (LLMs), Prompt Engineering, و RAG.',
                duration: '4 أسابيع',
                resources: []
            }
        ]
    },
    {
        id: 'ui-ux-design',
        title: 'UI/UX Design',
        description: 'احترف تصميم تجربة المستخدم وواجهة المستخدم. Design Thinking, Wireframing, Prototyping, و Figma.',
        icon: <Layers className="w-8 h-8" />,
        color: 'from-pink-500 to-rose-500',
        level: 'beginner',
        duration: '3 أشهر',
        jobRole: 'Product Designer',
        averageSalary: '$70,000/سنة',
        steps: [
            {
                id: 'design-fund',
                title: 'أساسيات التصميم المرئي',
                description: 'نظرية الألوان، الطباعة (Typography)، التخطيط (Layout)، ومبادئ الجشطالت.',
                duration: 'أسبوعين',
                resources: []
            },
            {
                id: 'ux-research',
                title: 'UX Research & Discovery',
                description: 'طرق البحث، Personas, User Journeys, و Information Architecture.',
                duration: 'أسبوعين',
                resources: []
            },
            {
                id: 'figma-mastery',
                title: 'Figma Mastery',
                description: 'احتراف أداة Figma: Auto Layout, Components, Variants, و Interactive Prototypes.',
                duration: '4 أسابيع',
                resources: []
            },
            {
                id: 'design-systems',
                title: 'Design Systems',
                description: 'كيفية بناء وصيانة أنظمة التصميم لضمان التناسق وقابلية التوسع.',
                duration: 'أسبوعين',
                resources: []
            },
            {
                id: 'portfolio-building',
                title: 'بناء هوية المصمم (Portfolio)',
                description: 'كيفية عرض أعمالك ودراسات الحالة (Case Studies) بشكل احترافي.',
                duration: 'أسبوعين',
                resources: []
            }
        ]
    },
    {
        id: 'cybersecurity-pro',
        title: 'Cybersecurity Professional',
        description: 'المسار الكامل لأمن المعلومات. Network Security, Ethical Hacking, SOC, و Incident Response.',
        icon: <Shield className="w-8 h-8" />,
        color: 'from-red-600 to-rose-600',
        level: 'advanced',
        duration: '6 أشهر',
        jobRole: 'Security Analyst',
        averageSalary: '$90,000/سنة',
        steps: [
            {
                id: 'it-foundations',
                title: 'IT & Networking Fundamentals',
                description: 'CompTIA A+ & Network+ المفاهيم الأساسية: TCP/IP, OSI Model, Windows/Linux Basics.',
                duration: '4 أسابيع',
                resources: []
            },
            {
                id: 'security-basics',
                title: 'Security+ & Core Concepts',
                description: 'مبادئ الأمن السيبراني: CIA Triad, التشفير، إدارة المخاطر، والتهديدات الشائعة.',
                duration: '4 أسابيع',
                resources: []
            },
            {
                id: 'linux-security',
                title: 'Linux for Security',
                description: 'استخدام سطر الأوامر (Bash)، إدارة الصلاحيات، وكتابة السكربتات للأتمتة.',
                duration: 'أسبوعين',
                resources: []
            },
            {
                id: 'ethical-hacking',
                title: 'Ethical Hacking & Pen Testing',
                description: 'أدوات الاختراق (Kali Linux, Metasploit, Nmap) ومنهجيات اختبار الاختراق.',
                duration: '6 أسابيع',
                resources: []
            },
            {
                id: 'soc-ir',
                title: 'SOC & Incident Response',
                description: 'تحليل السجلات (Logs)، SIEM (Splunk/ELK)، والاستجابة للحوادث الأمنية.',
                duration: '4 أسابيع',
                resources: []
            }
        ]
    }
];

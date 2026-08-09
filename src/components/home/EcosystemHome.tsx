"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Zap,
    GraduationCap,
    BrainCircuit,
    Wand2,
    Users,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Layers,
    Globe,
    Lock,
    Cpu,
    ArrowUpRight,
    Search,
    Bookmark,
    Code,
    Compass,
    ChevronDown,
    HelpCircle,
    FileText,
    Video,
    Database,
    Sun,
    Server,
    ShieldCheck
} from 'lucide-react';
import { getSubdomainUrl } from '@/src/utils/domain';

export default function EcosystemHome() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const ecosystemStats = [
        { value: '+1,000', label: 'أداة ذكاء اصطناعي', icon: Zap, color: 'from-amber-500 to-orange-500' },
        { value: '+150', label: 'كورس ومسار تعليمي', icon: GraduationCap, color: 'from-emerald-500 to-teal-500' },
        { value: '4', label: 'نماذج AI مدمجة', icon: BrainCircuit, color: 'from-purple-500 to-indigo-500' },
        { value: '+2,500', label: 'صانع ومطور فعال', icon: Users, color: 'from-blue-500 to-cyan-500' },
    ];

    const services = [
        {
            id: 'tools',
            title: '1. دليل منصة الأدوات الذكية (Tolzy Tools)',
            subdomain: 'tools.tolzy.me',
            url: getSubdomainUrl('tools', '/tools'),
            icon: Zap,
            badge: 'دومين فرعي مستقل',
            badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
            gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
            accentColor: 'text-amber-500',
            buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black',
            description: 'دليل ومحرك بحث تفاعلي يجمع أكثر من 1000 أداة ذكاء اصطناعي وبرمجيات منسقة للمطورين وصناع المحتوى والطلاب مع تقييمات وتصفية دقيقة.',
            features: [
                'تصنيف دقيق للأدوات بحسب التخصص (برمجة، تصميم، كتابة، تسويق)',
                'محرك بحث ذكي وسريع بالكلمات المفتاحية والميزات',
                'مراجعات مفصلة وتوضيح للخطط المجانية والمدفوعة',
                'حفظ الأدوات المفضلة في ملفك الشخصي الموحد'
            ]
        },
        {
            id: 'learn',
            title: '2. أكاديمية ومنصة التعلم (Tolzy Learn)',
            subdomain: 'learn.tolzy.me',
            url: getSubdomainUrl('learn', '/learn'),
            icon: GraduationCap,
            badge: 'دومين فرعي مستقل',
            badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
            gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
            accentColor: 'text-emerald-500',
            buttonBg: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black',
            description: 'منصة للمسارات التعليمية والكورسات التقنية المجهزة للتطبيق العملي، وتضم أكثر من 150 كورس برمجة وذكاء اصطناعي وتصميم.',
            features: [
                'كورسات مجانية ومختارة بعناية بمحتوى عربي عالي الجودة',
                'مشغل كورسات مدمج بدون إعلانات أو تشتيت',
                'نظام بحث RAG فائق الذكاء في محتوى الكورسات والشروحات',
                'تتبع تلقائي لمستوى التقدم وشهادات إنجاز'
            ]
        },
        {
            id: 'omnilearn',
            title: '3. أداة المعالجة التعليمية الذكية (Tolzy OmniLearn)',
            subdomain: 'omnilearn.tolzy.me',
            url: getSubdomainUrl('omnilearn', '/learn/omnilearn'),
            icon: Video,
            badge: 'دومين فرعي جديد',
            badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
            gradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
            accentColor: 'text-purple-500',
            buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white font-black',
            description: 'أداة معالجة واستعلام الروابط والمصادر التعليمية الخارجية بالذكاء الاصطناعي؛ تمكّن المستخدم من جلب المحتوى من الفيديوهات والروابط وتحليله واستخراج الملخصات والأسئلة التفاعلية (Interactive Q&A).',
            features: [
                'تحليل وتلخيص فيديوهات اليوتيوب وكورسات Coursera فوراً',
                'استخراج التفريغ الصوتي (Transcript) والمفاهيم الرئيسية',
                'إنشاء اختبارات وكويزات تفاعلية مستخرجة من المحتوى التعليمي',
                'محادثة مباشرة مع الفيديوهات والمستندات التعليمية'
            ]
        },
        {
            id: 'axiom',
            title: '4. محرك المستندات والتقارير (AXIOM Flow & Copilot)',
            subdomain: 'tolzy.me/copilot',
            url: '/copilot',
            icon: FileText,
            badge: 'وحدة مدمجة',
            badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
            gradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
            accentColor: 'text-blue-500',
            buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white font-bold',
            description: 'مساعد ذكي ومحرك مخصص لإنشاء وتوليد المستندات والتقارير وإصدار ملفات Word وExcel بدقة عالية، بجانب المساعد البرمجي المدعوم بـ OpenRouter و RAG.',
            features: [
                'إنشاء وتصدير ملفات Word و Excel موثوقة ومنسقة تلقائياً',
                '3 نماذج ذكاء اصطناعي (السريع، البرو، والمفكر DeepSeek R1)',
                'ربط مباشر بمحرك بحث الويب للوصول لأحدث البيانات',
                'استرجاع المعلومات الذكي RAG بحجم متجهات 1024'
            ]
        },
        {
            id: 'build',
            title: '5. أداة توليد خطط المشاريع (Build with AI / Tolzy Build)',
            subdomain: 'tolzy.me/build',
            url: '/build',
            icon: Wand2,
            badge: 'وحدة ذكية',
            badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
            gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
            accentColor: 'text-rose-500',
            buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white font-bold',
            description: 'وحدة ذكية مدعومة بنماذج Google Gemini 2.5 Flash لتوليد خطط وهياكل البرمجيات والمشاريع التقنية وتحويل الأفكار إلى خطوات تنفيذية جاهزة.',
            features: [
                'توليد مخطط معماري كامل وتقنيات العمل وخط زمني للتنفيذ',
                'وضع Remix التفاعلي (جعله أسرع، أرخص، No-Code، أو SaaS)',
                'برومبتات جاهزة للنسخ والاستخدام في IDE و GitHub Copilot',
                'حفظ وحماية مشاريعك مع إمكانية التصدير كـ JSON'
            ]
        },
        {
            id: 'community',
            title: '6. مجتمع المنظومة والتوجيهات (Tolzy Community & Prompts)',
            subdomain: 'tolzy.me/community',
            url: '/community',
            icon: Users,
            badge: 'مكتبة ومجتمع',
            badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
            gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
            accentColor: 'text-emerald-500',
            buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold',
            description: 'مكتبة للتوجيهات الذكية (Prompts) ومساحة لتواصل وتبادل الخبرات والأكواد والحلول بين صانعي التكنولوجيا والمطورين.',
            features: [
                'مشاركة 6 أنواع من المحتوى (برومبت، كود، مقال، سؤال، فكرة، أداة)',
                'نظام ريمكس وتصويت متقدم مع خوارزمية Engagement Score',
                'تعليقات ومناقشات تقنية عالية المستوى',
                'ملف شخصي يستعرض مساهماتك ونقاطك بالمنظومة'
            ]
        }
    ];

    const techStack = [
        { title: 'إطار العمل', detail: 'Next.js 16 (App Router), React, TypeScript', icon: Code, color: 'text-indigo-500' },
        { title: 'الواجهات والتصميم', detail: 'Tailwind CSS, Lucide Icons, Glassmorphism, Bento Grid Layout', icon: Sparkles, color: 'text-purple-500' },
        { title: 'قواعد البيانات والـ Backend', detail: 'Supabase (Central DB + Vectors 1024-dim) & Firebase (Auth + Firestore)', icon: Database, color: 'text-emerald-500' },
        { title: 'محركات الذكاء الاصطناعي', detail: 'OpenRouter API + Google AI Studio (Gemini 2.5 Flash)', icon: Cpu, color: 'text-amber-500' },
        { title: 'إدارة الجلسات والحسابات', detail: 'Unified Single Sign-On (SSO Cookie on .tolzy.me)', icon: ShieldCheck, color: 'text-blue-500' },
        { title: 'الاستضافة والتوزيع', detail: 'Single Repository on GitHub deployed on Vercel', icon: Server, color: 'text-rose-500' }
    ];

    const faqs = [
        {
            q: 'ما هي منظومة Tolzy وما الذي تمثله؟',
            a: 'منظومة Tolzy هي بيئة رقمية متكاملة تجمع بين الأكاديمية والتعليم، محرك بحث أدوات الذكاء الاصطناعي، أداة معالجة اليوتيوب OmniLearn، صانع التقارير والمستندات AXIOM Flow، ومولد خطط المشاريع بـ AI تحت حساب موحد وبنية خلفية موحدة.'
        },
        {
            q: 'كيف تعمل الدومينات الفرعية مثل tools.tolzy.me و learn.tolzy.me و omnilearn.tolzy.me؟',
            a: 'تعمل كافة الدومينات الفرعية من خلال مشروع برمجي واحد مستضاف على Vercel؛ يتكفل الـ Middleware بتوجيه الطلبات تلقائياً مع بقاء جلسة تسجيل الدخول (Unified SSO) قائمة بين كافة الدومينات دون الحاجة لتسجيل الدخول مجدداً.'
        },
        {
            q: 'ماذا عن مشروع التدريب الصيفي Tolzy Path؟',
            a: 'تم إيقاف مشروع Tolzy Path الخاص بالتدريبات الصيفية مؤقتاً لحين عودته بكامل قوته في موسم الصيف القادم بإذن الله!'
        },
        {
            q: 'هل خدمات منظومة Tolzy مجانية؟',
            a: 'نعم، المنظومة مجانية بالكامل للطلاب والمطورين وصناع المحتوى، مع تقديم أعلى مستويات الأداء والتكامل.'
        }
    ];

    return (
        <div className="w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
            
            {/* HERO SECTION */}
            <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
                {/* Background Glows & Gradients */}
                <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    
                    {/* Ecosystem Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                        <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-300 bg-clip-text text-transparent">
                            منظومة TOLZY الرقمية الشاملة للذكاء الاصطناعي والتعليم التقني 🚀
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.2] mb-6 max-w-4xl mx-auto">
                        بيئة عمل وتعلم واحدة... تُغنيك عن عشرات{' '}
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                            المنصات والأدوات
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
                        نربط بين التعلم الأكاديمي، أدوات الذكاء الاصطناعي التفاعلية، معالجة المحتوى التعليمي OmniLearn، توليد المستندات والمشاريع AXIOM، والتطبيق العملي في بيئة برمجية واحدة.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                        <Link
                            href={getSubdomainUrl('tools', '/tools')}
                            className="px-7 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-base font-black rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            <span>دليل الأدوات (tools.tolzy.me)</span>
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href={getSubdomainUrl('learn', '/learn')}
                            className="px-7 py-4 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-base font-bold rounded-2xl shadow-lg hover:border-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
                        >
                            <GraduationCap className="w-5 h-5 text-emerald-500" />
                            <span>منصة التعلم (learn.tolzy.me)</span>
                            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href={getSubdomainUrl('omnilearn', '/learn/omnilearn')}
                            className="px-7 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-black rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
                        >
                            <Video className="w-5 h-5" />
                            <span>أداة OmniLearn (omnilearn.tolzy.me)</span>
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
                        {ecosystemStats.map((stat, idx) => {
                            const IconComponent = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 backdrop-blur-xl shadow-sm hover:shadow-md transition-all text-right group"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {stat.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* Tolzy Path Status Banner */}
            <section className="max-w-5xl mx-auto px-4 mb-16">
                <div className="p-4 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4 text-amber-800 dark:text-amber-300">
                    <Sun className="w-8 h-8 text-amber-500 shrink-0 animate-spin-slow" />
                    <div className="text-xs sm:text-sm font-semibold leading-relaxed">
                        <strong className="font-bold block text-amber-900 dark:text-amber-200 mb-0.5">تحديث برنامج التدريب الصيفي (Tolzy Path):</strong>
                        تم إيقاف برنامج التدريب الصيفي مؤقتاً، وسيعود بكامل قوته ومميزاته الجديدة في موسم الصيف القادم بإذن الله! ☀️
                    </div>
                </div>
            </section>

            {/* SERVICES BENTO SHOWCASE */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-bold mb-4">
                            <Layers className="w-3.5 h-3.5" />
                            الركائز والوحدات الأساسية للمنظومة
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">
                            المنتجات والأدوات الـ 6 في مكان واحد
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                            استكشف الركائز التي تشكل منظومة Tolzy المتكاملة
                        </p>
                    </div>

                    <div className="space-y-12">
                        {services.map((service) => {
                            const IconComp = service.icon;
                            return (
                                <div
                                    key={service.id}
                                    className={`p-8 md:p-12 rounded-3xl bg-gradient-to-br ${service.gradient} bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 relative group overflow-hidden`}
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                        
                                        {/* Main Content */}
                                        <div className="lg:col-span-7 space-y-6">
                                            
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-md ${service.accentColor}`}>
                                                    <IconComp className="w-6 h-6" />
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${service.badgeBg}`}>
                                                    {service.badge} • {service.subdomain}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                                {service.title}
                                            </h3>

                                            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                                                {service.description}
                                            </p>

                                            {/* Features List */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                {service.features.map((feat, fIdx) => (
                                                    <div key={fIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                                                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${service.accentColor}`} />
                                                        <span>{feat}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-4">
                                                <Link
                                                    href={service.url}
                                                    className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-md hover:scale-105 active:scale-95 ${service.buttonBg}`}
                                                >
                                                    <span>انتقل إلى {service.title}</span>
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Link>
                                            </div>

                                        </div>

                                        {/* Visual Mockup Card */}
                                        <div className="lg:col-span-5 relative">
                                            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-inner space-y-4">
                                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                                                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                                    </div>
                                                    <span className="text-[11px] font-mono text-slate-400">{service.subdomain}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-3/4 animate-pulse" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700/40 rounded-md w-full" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700/40 rounded-md w-5/6" />
                                                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold">
                                                        <span className={service.accentColor}>معاينة تفاعلية حية</span>
                                                        <Sparkles className={`w-4 h-4 ${service.accentColor}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* TECH STACK & INFRASTRUCTURE SECTION */}
            <section className="py-20 bg-white/50 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-white/5 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-4">
                            <Cpu className="w-4 h-4" />
                            البنية التحتية والتقنيات البرمجية
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                            تقنيات بمواصفات عالمية
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                            تم بناء منظومة Tolzy بأحدث الحلول البرمجية لضمان أقصى أداء وأعلى درجات الأمان
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {techStack.map((item, idx) => {
                            const TechIcon = item.icon;
                            return (
                                <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${item.color}`}>
                                            <TechIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h3>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-mono dir-ltr text-right">
                                        {item.detail}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="py-20 bg-white/60 dark:bg-slate-900/60">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-4">
                            <HelpCircle className="w-4 h-4" />
                            الأسئلة الشائعة حول المنظومة
                        </div>
                        <h2 className="text-3xl font-extrabold">إجابات استفساراتك حول TOLZY</h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full p-6 text-right font-bold text-base sm:text-lg flex items-center justify-between gap-4 focus:outline-none"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-indigo-500 transition-transform duration-300 shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section className="py-20 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                        <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
                            جاهز للانطلاق في منظومة Tolzy؟
                        </h2>
                        <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            انضم لأكثر من 2,500 مطور وصانع محتوى يبنون ويرتقون بمهاراتهم يومياً من خلال كافة أدوات منظومة Tolzy الرقمية.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href={getSubdomainUrl('tools', '/tools')}
                                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-base font-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Zap className="w-5 h-5 fill-current" />
                                <span>دليل الأدوات</span>
                            </Link>

                            <Link
                                href={getSubdomainUrl('learn', '/learn')}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-base font-bold rounded-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <GraduationCap className="w-5 h-5 text-emerald-400" />
                                <span>منصة التعلم</span>
                            </Link>

                            <Link
                                href={getSubdomainUrl('omnilearn', '/learn/omnilearn')}
                                className="px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white text-base font-bold rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Video className="w-5 h-5" />
                                <span>أداة OmniLearn</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

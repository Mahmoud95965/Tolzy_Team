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
    ShieldCheck,
    MessageSquare,
    Briefcase,
    Bot,
    FileSpreadsheet,
    Rocket,
    Send
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
        { value: '6', label: 'دومينات فرعية متخصصة', icon: Globe, color: 'from-purple-500 to-indigo-500' },
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
            badge: 'دومين فرعي مستقل',
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
            id: 'flow',
            title: '4. محرك المستندات والتقارير (AXIOM Flow)',
            subdomain: 'flow.tolzy.me',
            url: getSubdomainUrl('flow', '/axiom'),
            icon: FileSpreadsheet,
            badge: 'دومين فرعي مستقل',
            badgeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
            gradient: 'from-indigo-500/10 via-blue-500/5 to-transparent',
            accentColor: 'text-indigo-500',
            buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white font-black',
            description: 'أداة ذكية مخصصة لإنشاء وتوليد المستندات والتقارير وإصدار ملفات Word وExcel بدقة عالية باستخدام آليات الذكاء الاصطناعي و RAG.',
            features: [
                'إنشاء وتصدير ملفات Word (.docx) و Excel (.xlsx) منسقة تلقائياً',
                'تلخيص الأوراق العلمية والتقارير الإدارية بضغطة زر',
                'دعم القوالب الجاهزة والصيغ التنفيذية للشركات والأفراد',
                'ربط وتطابق البيانات الجدولية بدقة متناهية'
            ]
        },
        {
            id: 'build',
            title: '5. أداة توليد خطط المشاريع (Build with AI / Tolzy Build)',
            subdomain: 'build.tolzy.me',
            url: getSubdomainUrl('build', '/build'),
            icon: Wand2,
            badge: 'دومين فرعي مستقل',
            badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
            gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
            accentColor: 'text-rose-500',
            buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white font-black',
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
            title: '6. مجتمع المنظومة والتوجيهات (Tolzy Community)',
            subdomain: 'community.tolzy.me',
            url: getSubdomainUrl('community', '/community'),
            icon: Users,
            badge: 'دومين فرعي مستقل',
            badgeBg: 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400',
            gradient: 'from-teal-500/10 via-emerald-500/5 to-transparent',
            accentColor: 'text-teal-500',
            buttonBg: 'bg-teal-600 hover:bg-teal-700 text-white font-black',
            description: 'مكتبة للتوجيهات الذكية (Prompts) ومساحة لتواصل وتبادل الخبرات والأكواد والحلول بين صانعي التكنولوجيا والمطورين.',
            features: [
                'مشاركة 6 أنواع من المحتوى (برومبت، كود، مقال، سؤال، فكرة، أداة)',
                'نظام ريمكس وتصويت متقدم مع خوارزمية Engagement Score',
                'تعليقات ومناقشات تقنية عالية المستوى',
                'ملف شخصي يستعرض مساهماتك ونقاطك بالمنظومة'
            ]
        }
    ];

    const customServices = [
        {
            title: 'تطوير وتصميم المواقع والمنصات (Full-Stack & SaaS)',
            description: 'نبني منصات الويب والمتاجر والحلول السحابية فائقة السرعة والأمان بأحدث الأطر (Next.js, React, Tailwind, Supabase) مع تصميم Glassmorphism استثنائي.',
            icon: Rocket,
            color: 'from-blue-500 to-indigo-600',
            badge: 'برمجة وتصميم'
        },
        {
            title: 'تطوير وتدريب المساعدات المخصصة (Custom AI Agents)',
            description: 'نطور مساعدين وموديلات ذكاء اصطناعي مخصصة لشركتك أو مشروعك مدربة على بياناتك الخاصة ومربوطة بـ Azure AI و RAG المتطور.',
            icon: Bot,
            color: 'from-purple-500 to-pink-600',
            badge: 'ذكاء اصطناعي'
        },
        {
            title: 'أتمتة المستندات والتقارير (Automated Doc & Report Engines)',
            description: 'نمتلك المحركات البرمجية لتطوير أنظمة أتمتة واستخراج التقارير وتوليد ملفات Excel و Word والـ PDFs التفاعلية الذكية لشركتك.',
            icon: FileSpreadsheet,
            color: 'from-emerald-500 to-teal-600',
            badge: 'أتمتة الشركات'
        },
        {
            title: 'بناء وحقن قواعد بيانات الـ Vectors & RAG',
            description: 'نستخرج ونبني قواعد المعرفة الضخمة والمضمنة (1024-dim Embeddings) لاسترجاع البيانات والبحث بالسياق لحظياً لشركتك.',
            icon: Database,
            color: 'from-amber-500 to-orange-600',
            badge: 'Big Data & RAG'
        }
    ];

    const techStack = [
        { title: 'إطار العمل', detail: 'Next.js 16 (App Router), React, TypeScript', icon: Code, color: 'text-indigo-500' },
        { title: 'الواجهات والتصميم', detail: 'Tailwind CSS, Lucide Icons, Glassmorphism, Bento Grid Layout', icon: Sparkles, color: 'text-purple-500' },
        { title: 'قواعد البيانات والـ Backend', detail: 'Supabase (Central DB + Vectors 1024-dim) & Firebase (Auth + Firestore)', icon: Database, color: 'text-emerald-500' },
        { title: 'محركات الذكاء الاصطناعي', detail: 'Azure AI Studio (axiom-core via OpenAI SDK)', icon: Cpu, color: 'text-amber-500' },
        { title: 'إدارة الجلسات والحسابات', detail: 'Unified Single Sign-On (SSO Cookie on .tolzy.me)', icon: ShieldCheck, color: 'text-blue-500' },
        { title: 'الاستضافة والتوزيع', detail: 'Single Repository on GitHub deployed on Vercel', icon: Server, color: 'text-rose-500' }
    ];

    const faqs = [
        {
            q: 'ما هي منظومة Tolzy وما الذي تمثله؟',
            a: 'منظومة Tolzy هي بيئة رقمية متكاملة تجمع بين الأكاديمية والتعليم، محرك بحث أدوات الذكاء الاصطناعي، أداة معالجة اليوتيوب OmniLearn، صانع التقارير والمستندات AXIOM Flow، ومولد خطط المشاريع بـ AI تحت حساب موحد وبنية خلفية موحدة.'
        },
        {
            q: 'كيف تعمل الدومينات الفرعية السبتة مثل tools.tolzy.me و flow.tolzy.me و build.tolzy.me؟',
            a: 'تعمل كافة الدومينات الفرعية من خلال مشروع برمجي واحد مستضاف على Vercel؛ يتكفل الـ Middleware بتوجيه الطلبات تلقائياً مع بقاء جلسة تسجيل الدخول (Unified SSO) قائمة بين كافة الدومينات دون الحاجة لتسجيل الدخول مجدداً.'
        },
        {
            q: 'كيف يمكنني طلب خدمة مخصصة (بناء موقع، موديل AI، أو نظام أتمتة) من فريق Tolzy؟',
            a: 'يمكنك التواصل المباشر مع فريق Tolzy عبر قسم الخدمات المخصصة بأسفل الصفحة أو عبر البريد الإلكتروني الرسمي، وسيقوم فريقنا البرمجي بالتحليل والتنفيذ بأعلى جودة تضمن تميز مشروعك.'
        },
        {
            q: 'ماذا عن مشروع التدريب الصيفي Tolzy Path؟',
            a: 'تم إيقاف مشروع Tolzy Path الخاص بالتدريبات الصيفية مؤقتاً لحين عودته بكامل قوته في موسم الصيف القادم بإذن الله!'
        }
    ];

    return (
        <div className="w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden font-sans">
            
            {/* HERO SECTION */}
            <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
                {/* Background Glows & Gradients */}
                <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-indigo-500/25 via-purple-500/25 to-emerald-500/15 blur-[140px] rounded-full pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/15 blur-[110px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    
                    {/* Ecosystem Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md mb-8 shadow-lg shadow-indigo-500/5 hover:scale-105 transition-transform cursor-default">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                        <span className="text-xs sm:text-sm font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-300 bg-clip-text text-transparent tracking-wide">
                            منظومة TOLZY الرقمية الشاملة للذكاء الاصطناعي والتعليم التقني 🚀
                        </span>
                    </div>

                    {/* Main Title - Extra Bold & Clear */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.2] mb-6 max-w-5xl mx-auto text-slate-900 dark:text-white">
                        منظومة برمجية وتعليمية موحدة... تُغنيك عن عشرات{' '}
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                            المنصات والأدوات
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-10 leading-relaxed font-bold">
                        نربط بين التعلم الأكاديمي، أدوات الذكاء الاصطناعي التفاعلية، معالجة المحتوى التعليمي OmniLearn، توليد المستندات والمشاريع AXIOM، والتطبيق العملي بحساب موجد وحساب واحد.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3.5 mb-16">
                        <Link
                            href={getSubdomainUrl('tools', '/tools')}
                            className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-sm sm:text-base font-black rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            <span>دليل الأدوات الذكية</span>
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href={getSubdomainUrl('learn', '/learn')}
                            className="px-6 py-4 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-sm sm:text-base font-black rounded-2xl shadow-lg hover:border-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
                        >
                            <GraduationCap className="w-5 h-5 text-emerald-500" />
                            <span>منصة التعلم والمسارات</span>
                            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href={getSubdomainUrl('omnilearn', '/learn/omnilearn')}
                            className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm sm:text-base font-black rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
                        >
                            <Video className="w-5 h-5" />
                            <span>أداة OmniLearn الذكية</span>
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href={getSubdomainUrl('flow', '/axiom')}
                            className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            <span>صانع المستندات والتقارير</span>
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
                                    className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-right group"
                                >
                                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
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
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4 text-amber-800 dark:text-amber-300 shadow-md backdrop-blur-md">
                    <Sun className="w-8 h-8 text-amber-500 shrink-0 animate-spin-slow" />
                    <div className="text-xs sm:text-sm font-bold leading-relaxed">
                        <strong className="font-black block text-amber-900 dark:text-amber-200 mb-0.5 text-sm sm:text-base">تحديث برنامج التدريب الصيفي (Tolzy Path):</strong>
                        تم إيقاف برنامج التدريب الصيفي مؤقتاً، وسيعود بكامل قوته ومميزاته الأكاديمية الجديدة في موسم الصيف القادم بإذن الله! ☀️
                    </div>
                </div>
            </section>

            {/* SUBDOMAINS & SERVICES SHOWCASE */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-black mb-4">
                            <Layers className="w-4 h-4" />
                            الركائز والدومينات الفرعية الـ 6 للمنظومة
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">
                            كل ما تحتاجه في بيئة عمل واحدة
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-base font-bold leading-relaxed">
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
                                                <div className={`p-3.5 rounded-2xl bg-white dark:bg-slate-800 shadow-md ${service.accentColor}`}>
                                                    <IconComp className="w-6 h-6" />
                                                </div>
                                                <span className={`px-3.5 py-1 rounded-full text-xs font-black border ${service.badgeBg}`}>
                                                    {service.badge} • {service.subdomain}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                                {service.title}
                                            </h3>

                                            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-bold leading-relaxed">
                                                {service.description}
                                            </p>

                                            {/* Features List */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                                {service.features.map((feat, fIdx) => (
                                                    <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${service.accentColor}`} />
                                                        <span>{feat}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-4">
                                                <Link
                                                    href={service.url}
                                                    className={`inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl text-sm font-black transition-all duration-200 shadow-md hover:scale-105 active:scale-95 ${service.buttonBg}`}
                                                >
                                                    <span>استكشف {service.title} الآن</span>
                                                    <ArrowUpRight className="w-4.5 h-4.5" />
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
                                                    <span className="text-[11px] font-mono font-bold text-slate-400">{service.subdomain}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md w-3/4 animate-pulse" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700/40 rounded-md w-full" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700/40 rounded-md w-5/6" />
                                                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-black">
                                                        <span className={service.accentColor}>معاينة حية للدومين الفرعي</span>
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

            {/* CUSTOM SERVICES SECTION (خدمات بناء وتطوير الحلول المخصصة) */}
            <section className="py-24 bg-gradient-to-b from-slate-900 via-[#070b19] to-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black mb-4">
                            <Briefcase className="w-4 h-4 text-indigo-400" />
                            خدمات التطوير والحلول المخصصة (Custom Development Services)
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 text-white">
                            نبني لك حلول الذكاء الاصطناعي والمنصات الاحترافية
                        </h2>
                        <p className="text-indigo-200 text-base font-bold leading-relaxed">
                            يقدم فريق Tolzy البرمجة والحلول التقنية المخصصة للشركات، الستارت ابس، والمؤسسات بأحدث التقنيات وأعلى معايير الجودة العالمية.
                        </p>
                    </div>

                    {/* Services Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {customServices.map((cServ, idx) => {
                            const CIcon = cServ.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/40 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 shadow-xl group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cServ.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                <CIcon className="w-7 h-7" />
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-black bg-white/10 border border-white/10 text-indigo-300">
                                                {cServ.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-xl sm:text-2xl font-black mb-4 text-white group-hover:text-indigo-300 transition-colors">
                                            {cServ.title}
                                        </h3>

                                        <p className="text-slate-300 text-sm sm:text-base font-bold leading-relaxed mb-6">
                                            {cServ.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-black text-indigo-400">
                                        <span>جودة تنفيذ هندسية عالية</span>
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Contact & Request CTA Banner */}
                    <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-center shadow-2xl relative overflow-hidden">
                        <h3 className="text-2xl sm:text-4xl font-black mb-4">
                            هل لديك مشروع أو فكرة ترغب في بنائها بذكاء؟
                        </h3>
                        <p className="text-indigo-100 text-sm sm:text-base font-bold max-w-2xl mx-auto mb-8 leading-relaxed">
                            تواصل مباشرة مع فريق Tolzy التقني لمناقشة المتطلبات وتلقي عروض الأسعار والخطط التنفيذية.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="https://wa.me/201026585310"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span>تواصل عبر واتساب المباشر</span>
                            </a>
                            <a
                                href="mailto:mahmoud.m.moussa5310@gmail.com"
                                className="px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-black text-base rounded-2xl border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                <span>طلب استشارة عبر البريد</span>
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            {/* TECH STACK & INFRASTRUCTURE SECTION */}
            <section className="py-20 bg-white/50 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-white/5 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black mb-4">
                            <Cpu className="w-4 h-4" />
                            البنية التحتية والتقنيات البرمجية
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black mb-4">
                            تقنيات بمواصفات عالمية
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-bold leading-relaxed">
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
                                        <h3 className="font-black text-slate-900 dark:text-white text-base">{item.title}</h3>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed font-mono dir-ltr text-right">
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black mb-4">
                            <HelpCircle className="w-4 h-4" />
                            الأسئلة الشائعة حول المنظومة
                        </div>
                        <h2 className="text-3xl font-black">إجابات استفساراتك حول TOLZY</h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full p-6 text-right font-black text-base sm:text-lg flex items-center justify-between gap-4 focus:outline-none"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-indigo-500 transition-transform duration-300 shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">
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
                        <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-bold">
                            انضم لأكثر من 2,500 مطور وصانع محتوى يبنون ويرتقون بمهاراتهم يومياً من خلال كافة أدوات منظومة Tolzy الرقمية.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href={getSubdomainUrl('tools', '/tools')}
                                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-base font-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Zap className="w-5 h-5 fill-current" />
                                <span>استكشف دليل الأدوات</span>
                            </Link>

                            <Link
                                href={getSubdomainUrl('learn', '/learn')}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-base font-black rounded-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <GraduationCap className="w-5 h-5 text-emerald-400" />
                                <span>تصفح الكورسات والتعلم</span>
                            </Link>

                            <Link
                                href={getSubdomainUrl('omnilearn', '/learn/omnilearn')}
                                className="px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white text-base font-black rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Video className="w-5 h-5" />
                                <span>تجربة OmniLearn</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

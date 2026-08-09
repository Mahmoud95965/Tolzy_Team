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
    HelpCircle
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
        { value: '4', label: 'نماذج AI مدمجة', icon: BrainCircuit, color: 'from-violet-500 to-indigo-500' },
        { value: '+2,500', label: 'صانع ومطور فعال', icon: Users, color: 'from-blue-500 to-cyan-500' },
    ];

    const services = [
        {
            id: 'tools',
            title: 'دليل الأدوات الشامل',
            subdomain: 'tools.tolzy.me',
            url: getSubdomainUrl('tools', '/tools'),
            icon: Zap,
            badge: 'منصة مستقلة',
            badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
            gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
            accentColor: 'text-amber-500',
            buttonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black',
            description: 'أضخم مكتبة عربية تفاعلية تتضمن أكثر من 1000 أداة ذكاء اصطناعي مع تقييمات موثوقة ونظام تصفية ذكي وتحديثات يومية.',
            features: [
                'تصنيف دقيق للأدوات بحسب التخصص (برمجة، تصميم، كتابة، تسويق)',
                'محرك بحث ذكي وسريع بالكلمات المفتاحية والميزات',
                'مراجعات مفصلة وتوضيح للخطط المجانية والمدفوعة',
                'حفظ الأدوات المفضلة في ملفك الشخصي الموحد'
            ]
        },
        {
            id: 'learn',
            title: 'منصة Tolzy Learn للتعلم التفاعلي',
            subdomain: 'learn.tolzy.me',
            url: getSubdomainUrl('learn', '/learn'),
            icon: GraduationCap,
            badge: 'منصة مستقلة',
            badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
            gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
            accentColor: 'text-emerald-500',
            buttonBg: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black',
            description: 'بيئة تعليمية متكاملة تقدم أكثر من 150 كورس في البرمجة والذكاء الاصطناعي والتصميم، مع مشغل مدمج ومساعد تعلم ذكي.',
            features: [
                'كورسات مجانية ومختارة بعناية بمحتوى عربي عالي الجودة',
                'مشغل كورسات مدمج بدون إعلانات أو تشتيت',
                'نظام بحث RAG فائق الذكاء في محتوى الكورسات والشروحات',
                'تتبع تلقائي لمستوى التقدم وشهادات إنجاز'
            ]
        },
        {
            id: 'copilot',
            title: 'المساعد الذكي (Tolzy Copilot & AXIOM)',
            subdomain: 'tolzy.me/copilot',
            url: '/copilot',
            icon: BrainCircuit,
            badge: 'خدمة مدمجة',
            badgeBg: 'bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400',
            gradient: 'from-violet-500/10 via-indigo-500/5 to-transparent',
            accentColor: 'text-violet-500',
            buttonBg: 'bg-violet-600 hover:bg-violet-700 text-white font-bold',
            description: 'مساعد ذكي قائم على تقنيات OpenRouter و RAG لمساعدتك في حل المشكلات البرمجية، تحليل المستندات، والبحث المباشر على الإنترنت.',
            features: [
                '3 نماذج ذكاء اصطناعي (السريع، البرو، والمفكر DeepSeek R1)',
                'ربط مباشر بمحرك بحث الويبDuckDuckGo',
                'تحليل الشفرات البرمجية وتصحيح الأخطاء بلحظات',
                'استرجاع المعلومات الذكي RAG من قاعدة معرفة Tolzy'
            ]
        },
        {
            id: 'build',
            title: 'صانع المشاريع (Build with AI)',
            subdomain: 'tolzy.me/build',
            url: '/build',
            icon: Wand2,
            badge: 'خدمة بريميوم',
            badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
            gradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
            accentColor: 'text-rose-500',
            buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white font-bold',
            description: 'حول فكرة مشروعك أو شركتك الناشئة إلى خطة تنفيذ هندسية متكاملة بضغطة زر باستخدام نموذج Google Gemini 2.5 Flash.',
            features: [
                'توليد مخطط معماري كامل وتقنيات العمل وخط زمني',
                'وضع Remix التفاعلي (جعله أسرع، أرخص، No-Code، أو SaaS)',
                'برومبتات جاهزة للنسخ والاستخدام في IDE و GitHub Copilot',
                'حفظ وحماية مشاريعك مع إمكانية التصدير كـ JSON'
            ]
        },
        {
            id: 'community',
            title: 'مجتمع Tolzy المفتوح (Tolzy Community)',
            subdomain: 'tolzy.me/community',
            url: '/community',
            icon: Users,
            badge: 'مجتمع تفاعلي',
            badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
            gradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
            accentColor: 'text-blue-500',
            buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white font-bold',
            description: 'ملتقى المطورين والصناع العرب لمشاركة البرومبتات المبتكرة، الأكواد، الأفكار، والأدوات المصممة خصيصاً للتطبيق العملي.',
            features: [
                'مشاركة 6 أنواع من المحتوى (برومبت، كود، مقال، سؤال، فكرة، أداة)',
                'نظام ريمكس وتصويت متقدم مع خوارزمية Engagement Score',
                'تعليقات ومناقشات تقنية عالية المستوى',
                'ملف شخصي يستعرض مساهماتك ونقاطك بالمنظومة'
            ]
        }
    ];

    const faqs = [
        {
            q: 'ما هي منظومة Tolzy وما الذي يميزها؟',
            a: 'منظومة Tolzy هي منصة عربية شاملة تجمع بين أضخم دليل لأدوات الذكاء الاصطناعي، منصة تعليمية تفاعلية، مساعد ذكي، وصانع مشاريع بـ AI. المميز هو الربط الكامل بين كافة الخدمات بحساب موحد وبنية خلفية واحدة سريعة ومجانية بالكامل.'
        },
        {
            q: 'هل أحتاج إلى إنشاء حساب لكل دومين فرعي (tools.tolzy.me و learn.tolzy.me)؟',
            a: 'لا إطلاقاً! تمتلك حساباً واحداً موحداً (Single Sign-On). عند تسجيل الدخول في أي مكان بالمنظومة، يتم التعرف عليك تلقائياً وتكون كافة أدواتك ومفضلاتك ومشاريعك متاحة عبر جميع الدومينات الفرعية.'
        },
        {
            q: 'هل خدمات منظومة Tolzy مجانية؟',
            a: 'نعم، منظومة Tolzy مجانية بالكامل (Plan-Agnostic)، ويمكن لجميع المستفيدين والطلاب والمطورين التمتع بالوصول لكافة الأدوات والكورسات والمساعد الذكي وصانع المشاريع دون أي رسوم.'
        },
        {
            q: 'كيف يمكنني الانتقال بين الأدوات والكورسات؟',
            a: 'يمكنك الانتقال بكل سهولة عبر شريط الملاحة العلوي Navbar الموجود في أعلى كل صفحة، أو استخدام الروابط المباشرة للدومينات الفرعية tools.tolzy.me و learn.tolzy.me.'
        }
    ];

    return (
        <div className="w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
            
            {/* HERO SECTION */}
            <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
                {/* Background Glows & Gradients */}
                <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-purple-500/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    
                    {/* Ecosystem Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                        <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-300 bg-clip-text text-transparent">
                            منظومة TOLZY المتكاملة للذكاء الاصطناعي والتعليم التقني 🚀
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.2] mb-6 max-w-4xl mx-auto">
                        منصة واحدة... تُدير كافة أدواتك وتُسرّع{' '}
                        <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                            رحلتك التقنية
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
                        منظومة متناغمة تجمع بين أضخم دليل لأدوات الذكاء الاصطناعي، منصة التعلم التفاعلي، المساعد الذكي المتقدم، وصانع المشاريع مع مجتمع المطورين والمبدعين العرب.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                        <Link
                            href={getSubdomainUrl('tools', '/tools')}
                            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-base font-black rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3 group"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            <span>استكشف دليل الأدوات (tools.tolzy.me)</span>
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href={getSubdomainUrl('learn', '/learn')}
                            className="px-8 py-4 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-base font-bold rounded-2xl shadow-lg hover:border-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3 group"
                        >
                            <GraduationCap className="w-5 h-5 text-emerald-500" />
                            <span>منصة التعلم (learn.tolzy.me)</span>
                            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
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

            {/* ARCHITECTURE & SYSTEM OVERVIEW */}
            <section className="py-16 md:py-24 bg-white/50 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-white/5 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
                            كيف تعمل منظومة{' '}
                            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                                TOLZY
                            </span>
                            ؟
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                            بنية تحتية موحدة فائقة الكفاءة تربط كل أدواتك وخدماتك بحساب واحد وقاعدة بيانات متزامنة لحظياً.
                        </p>
                    </div>

                    {/* Interactive Architecture Flow Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        
                        {/* Box 1: Subdomains */}
                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">1. التصفح حسب التخصص (Subdomains)</h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                    فصلنا الخدمات على دومينات فرعية متخصصة لتمنحك أفضل تجربة مستخدم وسرعة فائقة دون تشتيت:
                                </p>
                                <div className="space-y-3 font-mono text-xs">
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                                        <span className="font-bold text-amber-600 dark:text-amber-400">tools.tolzy.me</span>
                                        <span className="text-[10px] text-slate-400 font-sans">دليل الأدوات</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">learn.tolzy.me</span>
                                        <span className="text-[10px] text-slate-400 font-sans">منصة التعلم</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">tolzy.me</span>
                                        <span className="text-[10px] text-slate-400 font-sans">المنظومة والـ APIs</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: Unified Backend & Auth */}
                        <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/90 to-slate-900 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl pointer-events-none" />
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mb-6">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">2. الباك إند الموحد (Shared Engine)</h3>
                                <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed mb-6">
                                    المحرك الأساسي يظل موحداً 100%! حساب واحد (Single Auth)، وقاعدة بيانات متكاملة تضمن مزامنة بياناتك لحظياً.
                                </p>
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                                        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span>Firebase Auth (حساب موحد كلياً)</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                                        <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span>Supabase DB (مجموعات البيانات والـ RAG)</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                                        <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                                        <span>OpenRouter & Gemini 2.5 Flash APIs</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box 3: Integrated Experience */}
                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">3. تجربة متكاملة بدون انقطاع</h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                    سواءً أكنت تبحث عن أداة، أو تدرس كورساً، أو تسأل المساعد الذكي، فإن مفضلاتك وسجلك ومشاريعك دائماً بمتناول يدك.
                                </p>
                                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>مزامنة قائمة الأدوات المفضلة</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>تتبع نسبة الإنجاز في الكورسات</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>حفظ واسترجاع محادثات المساعد والمشاريع</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SERVICES SHOWCASE */}
            <section className="py-20 md:py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-bold mb-4">
                            <Layers className="w-3.5 h-3.5" />
                            خدمات ومكونات المنظومة
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">
                            كل ما تحتاجه للتمكن من الذكاء الاصطناعي
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                            استكشف الركائز الـ 5 التي تشكل العمود الفقري لمنظومة Tolzy
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

            {/* FAQ SECTION */}
            <section className="py-20 bg-white/60 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-white/5">
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
                    <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                        <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
                            جاهز للانطلاق في منظومة Tolzy؟
                        </h2>
                        <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            انضم لأكثر من 2,500 مطور وصانع محتوى يبنون ويرتقون بمهاراتهم يومياً من خلال أدوات وكورسات ومساعد Tolzy.
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
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

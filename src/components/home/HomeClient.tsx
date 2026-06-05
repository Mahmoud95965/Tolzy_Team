"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useTools } from '@/src/hooks/useTools';
import { useAuth } from '@/src/context/AuthContext';
import SEO from '@/src/components/SEO';


// For Guests - Full Landing Experience
const EnhancedHero = dynamic(() => import('@/src/components/home/EnhancedHero'));
const WhatIsTolzy = dynamic(() => import('@/src/components/home/WhatIsTolzy'));

// Shared Components
const LogoMarquee = dynamic(() => import('@/src/components/home/LogoMarquee'), {
    loading: () => <div className="h-24 w-full animate-pulse bg-slate-50 dark:bg-[#050505]" />
});

// For Logged In Users - Dashboard
const LoggedInHome = dynamic(() => import('@/src/components/home/LoggedInHome'), {
    loading: () => <div className="min-h-screen animate-pulse bg-slate-50 dark:bg-slate-900" />,
    ssr: false
});

// Additional Sections for Guests
const BentoHomeSection = dynamic(() => import('@/src/components/home/BentoHomeSection'), {
    loading: () => <div className="min-h-[600px] w-full animate-pulse bg-slate-50 dark:bg-[#050505]" />
});
const NewsPanelSection = dynamic(() => import('@/src/components/home/NewsPanelSection'), { ssr: false });



export default function HomeClient() {
    const { isLoading: toolsLoading, error: toolsError, featuredTools, newTools } = useTools();
    const { user } = useAuth();

    // 1. Dashboard View (Logged In) - Clean and Simple
    if (user) {
        return (
            <>
                <SEO
                    title="Tolzy - لوحة التحكم"
                    description="لوحة التحكم الخاصة بك في Tolzy. استكشف أحدث الأدوات والأخبار."
                    keywords="tolzy, dashboard, tools, news"
                    url="/"
                />
                <LoggedInHome />
            </>
        );
    }

    // 2. Landing Page View (Guest) - Full Experience with Explanations
    return (
        <>
            <SEO
                title="Tolzy - المنصة الرئيسية لأدوات الذكاء الاصطناعي | 1000+ أداة وكورس مجاني"
                description="Tolzy - المنصة الرئيسية لدليل أدوات الذكاء الاصطناعي. اكتشف أكثر من 1000 أداة احترافية (ChatGPT, Gemini, Claude, Midjourney). منتجات Tolzy الإضافية: Tolzy Learn (كورسات برمجة مجانية). أدوات للطلاب، الباحثين، المبرمجين، والمصممين. من إنتاج Tolzy. ابدأ مجاناً!"
                keywords="tolzy, تولزي, tolzy tools, tolzy learn, منصة تولزي, أدوات ذكاء اصطناعي, AI tools 2025, ChatGPT 4, Google Gemini Pro, Claude 3 Opus, Midjourney v6, DALL-E 3, كورسات برمجة مجانية, تعلم الذكاء الاصطناعي, مشاريع GitHub, أدوات البحث العلمي, Consensus, Elicit, أدوات الكتابة, Jasper, Copy.ai, Grammarly, أدوات التصميم, Canva AI, Leonardo.ai, أدوات البرمجة, GitHub Copilot, Cursor IDE, أدوات الفيديو, Runway, HeyGen, أدوات الإنتاجية, Notion AI, أدوات الطلاب, حل الواجبات بالذكاء الاصطناعي, تلخيص الملفات, أفضل مواقع الذكاء الاصطناعي, دليل أدوات AI, تطبيقات ذكاء اصطناعي, Prompt Engineering, فري لانسر, العمل الحر, الربح من الذكاء الاصطناعي, منصات تعليمية عربية, تعلم البرمجة, دورات تفاعلية"
                url="/"
            />

            {/* Enhanced Hero with clear value proposition */}
            <EnhancedHero />

            {/* What is Tolzy - Feature explanation section */}
            <WhatIsTolzy />

            {/* News Panel — below the Bento Grid */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                <NewsPanelSection />
            </div>

            <BentoHomeSection
                popularTools={featuredTools || []}
                newTools={newTools || []}
            />
        </>
    );
}

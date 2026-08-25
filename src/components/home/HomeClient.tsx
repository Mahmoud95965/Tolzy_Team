"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useTools } from '@/src/hooks/useTools';
import { useAuth } from '@/src/context/AuthContext';
import SEO from '@/src/components/SEO';


const EcosystemHome = dynamic(() => import('@/src/components/home/EcosystemHome'), {
    loading: () => <div className="min-h-screen animate-pulse bg-slate-50 dark:bg-[#030712]" />
});

// For Logged In Users - Dashboard
const LoggedInHome = dynamic(() => import('@/src/components/home/LoggedInHome'), {
    loading: () => <div className="min-h-screen animate-pulse bg-slate-50 dark:bg-slate-900" />,
    ssr: false
});

export default function HomeClient() {
    const { user } = useAuth();

    // 1. Dashboard View (Logged In)
    if (user) {
        return (
            <>
                <SEO
                    title="Tolzy - لوحة التحكم والمنظومة"
                    description="لوحة التحكم الخاصة بك في منظومة Tolzy. استكشف أدواتك وكورساتك ومشاريعك."
                    keywords="tolzy, dashboard, tools, learn, ecosystem"
                    url="/"
                />
                <LoggedInHome />
            </>
        );
    }

    // 2. Landing Page View (Ecosystem Overview)
    return (
        <>
            <SEO
                title="Tolzy - منظومة الذكاء الاصطناعي والتعليم التقني بالعالم العربي"
                description="منظومة Tolzy الشاملة تجمع بين أضخم دليل لأدوات الذكاء الاصطناعي (tools.tolzy.me)، منصة التعلم التفاعلية (learn.tolzy.me)، المساعد الذكي، وصانع المشاريع بـ AI. حساب موحد وبنية خلفية موحدة."
                keywords="tolzy, تولزي, منظومة تولزي, tools.tolzy.me, learn.tolzy.me, دليل أدوات الذكاء الاصطناعي, منصة تعليمية عربية, Tolzy AXIOM, Build with AI"
                url="/"
            />

            <EcosystemHome />
        </>
    );
}

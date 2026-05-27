import React, { Suspense } from 'react';
import Script from 'next/script';
import PageLayout from '@/src/components/layout/PageLayout';

import HomeClient from '@/src/components/home/HomeClient'; // Client Logic Wrapper - handles hero sections based on auth

export default function Home() {
    // Organization JSON-LD Schema (Static)
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Tolzy",
        "alternateName": ["تولزي", "Tolzy Tools"],
        "url": "https://tolzy.me/",
        "logo": "https://tolzy.me/image/tools/Logo.webp",
        "description": "Tolzy - المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم التقني. نمكّن التعليم من خلال الذكاء الاصطناعي ونجعل موارد التعلم عالية الجودة متاحة للجميع. أكثر من 1000 أداة AI، محتوى 100% عربي، مجتمع +2500 مطور ومحترف.",
        "foundingDate": "2024",
        "founder": {
            "@type": "Person",
            "name": "محمود موسى"
        },
        "sameAs": [
            "https://twitter.com/tolzytools"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "availableLanguage": ["Arabic", "English"]
        },
        "makesOffer": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": "Tolzy Tools",
                    "description": "دليل شامل وتفاعلي لأكثر من 1000 أداة ذكاء اصطناعي مع تقييمات احترافية ومقارنات مفصلة. محتوى 100% عربي لمساعدة المطورين والمبدعين",
                    "url": "https://tolzy.me/tools",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.8",
                        "reviewCount": "1200"
                    }
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": "Tolzy Learn",
                    "description": "منصة تعليمية تفاعلية لتمكين التعليم من خلال الذكاء الاصطناعي. كورسات مجانية في البرمجة، الذكاء الاصطناعي، والتصميم بمحتوى عربي عالي الجودة",
                    "url": "https://tolzy.me/learn",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.7",
                        "reviewCount": "850"
                    }
                }
            }
        ]
    };

    return (
        <PageLayout navbarOffset={false}>
            <Script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />

            {/* HomeClient handles conditional rendering based on user auth */}
            <Suspense fallback={
                <div className="w-full min-h-[600px] flex items-center justify-center bg-slate-50 dark:bg-[#050505]/50 animate-pulse">
                    <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                </div>
            }>
                <HomeClient />
            </Suspense>
        </PageLayout>
    );
}

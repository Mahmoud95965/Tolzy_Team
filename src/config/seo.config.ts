// Centralized SEO Configuration for Tolzy Platform
import { Metadata } from 'next';

// Site Constants
export const SITE_CONFIG = {
    name: 'Tolzy',
    nameAr: 'تولزي',
    domain: 'https://tolzy.me',
    description: 'Tolzy - المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم التقني 2026. اكتشف أكثر من 1000 أداة AI مجانية، كورسات برمجة، ChatGPT، Gemini، Claude، DeepSeek. ابدأ مجاناً!',
    descriptionEn: 'Tolzy - The first Arabic platform for AI tools and technical education 2026. Discover 1000+ free AI tools, programming courses, and open source projects.',
    keywords: [
        'tolzy',
        'تولزي',
        'أدوات ذكاء اصطناعي',
        'AI tools 2026',
        'تعلم البرمجة',
        'كورسات برمجة مجانية',
        'ذكاء اصطناعي بالعربي',
        'tolzy tools',
        'tolzy learn',
        'أدوات AI مجانية',
        'ChatGPT بالعربي',
        'DeepSeek AI',
        'بديل ChatGPT',
        'كورسات أونلاين مجانية',
    ] as string[],
    social: {
        twitter: '@tolzytools',
        twitterHandle: 'tolzytools',
    },
    verification: {
        google: 'lUfqNmDWmCOva3GfS1PV8qFVueNhAaARVXWN9_sth2c',
        bing: 'EC6C9467B5FC8847928544F2987ABE66',
    },
    images: {
        logo: 'https://tolzy.me/image/tools/Logo.png',
        ogDefault: 'https://tolzy.me/image/tools/Hero.png',
        ogWidth: 1200,
        ogHeight: 630,
    },
} as const;

// Default Metadata
export const DEFAULT_METADATA: Metadata = {
    metadataBase: new URL(SITE_CONFIG.domain),
    title: {
        default: `${SITE_CONFIG.name} - اكتشف 1000+ أداة ذكاء اصطناعي مجانية وكورسات برمجة 2026`,
        template: `%s | ${SITE_CONFIG.name}`,
    },
    description: SITE_CONFIG.description,
    keywords: SITE_CONFIG.keywords,
    authors: [{ name: 'Tolzy' }],
    creator: 'Tolzy',
    publisher: 'Tolzy',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'ar_AR',
        url: SITE_CONFIG.domain,
        siteName: SITE_CONFIG.name,
        title: `${SITE_CONFIG.name} - اكتشف 1000+ أداة ذكاء اصطناعي مجانية | كورسات برمجة 2026`,
        description: SITE_CONFIG.description,
        images: [
            {
                url: SITE_CONFIG.images.ogDefault,
                width: SITE_CONFIG.images.ogWidth,
                height: SITE_CONFIG.images.ogHeight,
                alt: `${SITE_CONFIG.name} - دليل شامل لأكثر من 1000 أداة ذكاء اصطناعي`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: SITE_CONFIG.social.twitter,
        creator: SITE_CONFIG.social.twitter,
        title: `${SITE_CONFIG.name} - اكتشف 1000+ أداة ذكاء اصطناعي مجانية | كورسات برمجة 2026`,
        description: SITE_CONFIG.description,
        images: [SITE_CONFIG.images.ogDefault],
    },
    verification: SITE_CONFIG.verification,
    alternates: {
        canonical: SITE_CONFIG.domain,
        languages: {
            ar: SITE_CONFIG.domain,
            'x-default': SITE_CONFIG.domain,
        },
    },
};

// Canonical URL Generator
export const getCanonicalUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `https://tolzy.me/${cleanPath}`;
};

// Merge metadata helper
export const mergeMetadata = (override: Metadata): Metadata => {
    return {
        ...DEFAULT_METADATA,
        ...override,
        openGraph: {
            ...DEFAULT_METADATA.openGraph,
            ...override.openGraph,
        },
        twitter: {
            ...DEFAULT_METADATA.twitter,
            ...override.twitter,
        },
    };
};

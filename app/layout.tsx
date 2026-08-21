import type { Metadata } from 'next';
// Removed next/font/google to fix build fetch errors
import { ThemeProvider } from '@/src/context/ThemeContext';
import { AuthProvider } from '@/src/context/AuthContext';
import AuthInitializer from '@/src/components/providers/AuthInitializer';
import { ToolsProvider } from '@/src/context/ToolsContext';
import { I18nProvider } from '@/src/components/providers/I18nProvider';
import { Toaster } from 'react-hot-toast';
import { generateSearchActionSchema } from '@/src/utils/seoHelpers';
import PwaInstallPrompt from '@/src/components/common/PwaInstallPrompt';
import '@/src/index.css';

// Removed Almarai config to bypass build-time fetch. Using standard <link> in <head> instead.

export const metadata: Metadata = {
    metadataBase: new URL('https://tolzy.me'),
    title: {
        default: 'Tolzy - اكتشف +1000 أداة ذكاء اصطناعي مجانية وكورسات برمجة 2026',
        template: '%s | Tolzy - منصة أدوات الذكاء الاصطناعي',
    },
    description: 'منصة Tolzy هي دليلك العربي الأول لأكثر من 1000 أداة ذكاء اصطناعي مجانية 2026. كورسات برمجة، ChatGPT، Gemini، Claude، DeepSeek، Sora AI - كل ما تحتاجه في مكان واحد. ابدأ رحلتك مجاناً!',
    keywords: [
        'Tolzy',
        'تولزي',
        'أدوات ذكاء اصطناعي بالعربي',
        'Tolzy Tools',
        'Tolzy Learn',
        'أدوات ذكاء اصطناعي مجانية 2026',
        'AI tools 2026',
        'ChatGPT بالعربي',
        'Google Gemini',
        'Claude AI',
        'DeepSeek AI',
        'Sora AI',
        'Midjourney',
        'DALL-E 3',
        'كورسات برمجة مجانية',
        'كورسات ذكاء اصطناعي مجانية',
        'تعلم الذكاء الاصطناعي من الصفر',
        'تعلم البرمجة من الصفر',
        'كاتب مقالات ذكي مجاني',
        'أدوات أتمتة سير عمل الذكاء الاصطناعي',
        'reimaginehome مجاني',
        'adobe podcast enhance',
        'أفضل أدوات الذكاء الاصطناعي',
        'بديل ChatGPT مجاني',
        'أدوات تصميم بالذكاء الاصطناعي',
        'أدوات كتابة المحتوى بالعربي',
        'كورسات أونلاين مجانية بشهادات',
        'مشاريع مفتوحة المصدر',
        'موقع تولزي',
        'منصة تولزي',
        'tolzy ai tools',
        'tolzy learning platform',
        'أفضل مواقع الذكاء الاصطناعي 2026',
        'Cursor AI',
        'Bolt AI',
        'v0 dev',
    ],
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
        url: 'https://tolzy.me/',
        siteName: 'Tolzy',
        title: 'Tolzy - اكتشف +1000 أداة ذكاء اصطناعي مجانية | كورسات برمجة 2026',
        description: 'منصة Tolzy العربية الأولى: +1000 أداة AI مجانية، كورسات برمجة، ChatGPT، Gemini، Claude، DeepSeek. ابدأ التعلم والإنجاز الآن!',
        images: [
            {
                url: '/image/tools/Hero.png',
                width: 1200,
                height: 630,
                alt: 'Tolzy - منصة أدوات الذكاء الاصطناعي والكورسات المجانية 2026',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@tolzytools',
        creator: '@tolzytools',
        title: 'Tolzy - اكتشف +1000 أداة ذكاء اصطناعي مجانية | كورسات برمجة 2026',
        description: 'منصة Tolzy العربية الأولى: +1000 أداة AI مجانية، كورسات برمجة، ChatGPT، Gemini، Claude، DeepSeek.',
        images: ['/image/tools/Hero.png'],
    },
    verification: {
        google: 'CvfgfNzJGq2YOnvINe7ljJLpIgW4pDugHzdpbWaPvWY',
        yandex: 'yandex_placeholder_verification_key',
        other: {
            'msvalidate.01': 'EC6C9467B5FC8847928544F2987ABE66',
            'baidu-site-verification': 'baidu_placeholder_verification_key',
            'p:domain_verify': 'pinterest_placeholder_verification_key',
        },
    },
    alternates: {
        canonical: './',
        languages: {
            ar: 'https://tolzy.me/',
            'x-default': 'https://tolzy.me/',
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Organization JSON-LD for SEO
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Tolzy',
        'alternateName': 'تولزي',
        'url': 'https://tolzy.me',
        'logo': 'https://tolzy.me/image/tools/Logo.webp',
        'description': 'Tolzy - المنصة العربية الأولى لأدوات الذكاء الاصطناعي والتعليم التقني. نمكّن التعليم من خلال الذكاء الاصطناعي مع أكثر من 1000 أداة ومحتوى 100% عربي',
        'sameAs': [
            'https://twitter.com/tolzy',
            'https://facebook.com/tolzy',
        ],
        'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'customer support',
            'url': 'https://tolzy.me/contact',
        }
    };

    return (
        <html lang="ar" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                {/* DNS Prefetch for better performance */}
                <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
                <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
                <link rel="dns-prefetch" href="https://zdhjnbsjkglumsakpmoj.supabase.co" />

                {/* Preconnect to critical origins */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet" />
                {/* Material Symbols Outlined — replaces lucide-react in Copilot UI */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
                    rel="stylesheet"
                />
                
                <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://zdhjnbsjkglumsakpmoj.supabase.co" crossOrigin="anonymous" />
                
                {/* SearchAction Structured Data for site-wide search */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateSearchActionSchema())
                    }}
                />
                
                {/* PWA Tags */}
                <link rel="manifest" href="/manifest.json" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Tolzy" />

                <link rel="icon" type="image/svg+xml" sizes="any" href="/tolzy-logo.svg" />
                <link rel="apple-touch-icon" href="/tolzy-logo.svg" />
                <link rel="shortcut icon" href="/tolzy-logo.svg" />
                <meta name="theme-color" content="#4F46E5" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
            </head>
            <body className="antialiased overflow-x-hidden" style={{ fontFamily: "'Almarai', sans-serif" }}>
                <AuthInitializer />
                <ThemeProvider>
                    <AuthProvider>
                        <ToolsProvider>
                            <I18nProvider>
                                {children}
                                <PwaInstallPrompt />
                                <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
                            </I18nProvider>
                        </ToolsProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

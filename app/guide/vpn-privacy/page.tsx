import type { Metadata } from 'next';
import Script from 'next/script';
import VpnPrivacyGuidePage from '@/src/views/VpnPrivacyGuidePage';

export const metadata: Metadata = {
  title: 'دليل الخصوصية وحماية الاتصال: متى تحتاج إلى VPN عند استخدام أدوات AI والعمل عن بعد؟ — TOLZY',
  description: 'دليل شامل ومبسط يشرح ما هو الـ VPN وكيف يحمي اتصالك وبياناتك الحساسة على شبكات Wi-Fi العامة، وحدود حمايته، ومعايير اختيار خدمة موثوقة لحماية خصوصيتك الرقمية.',
  keywords: [
    'VPN',
    'الخصوصية الرقمية',
    'حماية الواي فاي',
    'العمل عن بعد',
    'NordVPN',
    'تشفير الاتصال',
    'أدوات الذكاء الاصطناعي',
    'أمن سيبراني',
    'تولزي',
    'TOLZY'
  ],
  alternates: {
    canonical: 'https://tolzy.me/guide/vpn-privacy',
  },
  openGraph: {
    title: 'دليل الخصوصية وحماية الاتصال: متى تحتاج إلى VPN؟ — TOLZY',
    description: 'دليل عملي يشرح طرق حماية اتصالك وبياناتك الحساسة أثناء استخدام أدوات الذكاء الاصطناعي وشبكات Wi-Fi العامة.',
    url: 'https://tolzy.me/guide/vpn-privacy',
    siteName: 'TOLZY',
    locale: 'ar_AR',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دليل الخصوصية وحماية الاتصال: متى تحتاج إلى VPN؟ — TOLZY',
    description: 'دليل عملي لحماية خصوصيتك وتأمين بياناتك على شبكات Wi-Fi العامة ومع أدوات AI.',
  },
};

export default function VpnPrivacyGuideRoute() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'دليل الخصوصية وحماية الاتصال: متى تحتاج إلى VPN عند استخدام أدوات الذكاء الاصطناعي والعمل عن بُعد؟',
    description: 'دليل تقني شامل ومبسط يشرح ما هو الـ VPN، وكيف تحمي اتصالك وبياناتك الحساسة على شبكات Wi-Fi العامة، وحدود الحماية، ومعايير اختيار الخدمة الموثوقة.',
    image: 'https://tolzy.me/image/tools/Logo.webp',
    author: {
      '@type': 'Organization',
      name: 'TOLZY Editorial Team',
      url: 'https://tolzy.me',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TOLZY',
      url: 'https://tolzy.me',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tolzy.me/image/tools/Logo.webp',
      },
    },
    datePublished: '2026-10-27T00:00:00+03:00',
    dateModified: '2026-10-27T00:00:00+03:00',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://tolzy.me/guide/vpn-privacy',
    },
    inLanguage: 'ar',
  };

  return (
    <>
      <Script
        id="article-vpn-privacy-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <VpnPrivacyGuidePage />
    </>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Wifi, 
  Lock, 
  EyeOff, 
  ExternalLink, 
  BookOpen, 
  Sparkles,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { getNordVpnAffiliateUrl, NORDVPN_CONFIG } from '../../config/affiliates';

export default function PrivacySecuritySection() {
  const affiliateUrl = getNordVpnAffiliateUrl('homepage_privacy_section');

  const securityFeatures = [
    {
      icon: <Lock className="w-5 h-5 text-[#14140f]" />,
      title: 'تشفير قوي على شبكات Wi-Fi العامة',
      description: 'حماية كاملة لاتصالك أثناء العمل من المقاهي، المطارات، ومساحات العمل المشتركة لمنع اعتراض كلمات المرور أو التجسس على جلساتك.'
    },
    {
      icon: <EyeOff className="w-5 h-5 text-[#14140f]" />,
      title: 'حجب التتبع والمواقع المشبوهة',
      description: 'تقنية Threat Protection لفحص الروابط الخبيثة تلقائياً والحد من تتبع مزودي خدمة الإنترنت (ISPs) لسجل تصفحك وأنشطتك.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#14140f]" />,
      title: 'استقرار وأمان العمل السحابي',
      description: 'شبكة خوادم مشفرة فائقة السرعة ببروتوكول NordLynx تضمن اتصالاً آمناً ومستقراً بأدوات الذكاء الاصطناعي ومنصاتك السحابية.'
    }
  ];

  return (
    <section className="my-10 sm:my-14" dir="rtl" aria-label="أمان وخصوصية التصفح">
      <div className="bg-[#f5f5eb] rounded-[28px] border border-[#d2d2c8] p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#beff50]/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 text-center sm:text-right">
          
          {/* Header Row */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-xs font-bold text-[#14140f] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f]" />
              <span>خصوصية التصفح والأمان الرقمي</span>
              <span className="text-[#a0a096]">•</span>
              <span className="text-[11px] font-normal text-[#6e6e64]">توصية معتمدة</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#14140f] tracking-tight leading-snug">
              حافظ على خصوصيتك أثناء استخدام الإنترنت
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#6e6e64] max-w-2xl leading-relaxed">
              تعرّف على طرق تحسين خصوصيتك وحماية اتصالك أثناء استخدام شبكات Wi-Fi العامة والعمل عبر الإنترنت، واكتشف كيف يساهم الـ VPN في تأمين بياناتك وسرية جلساتك.
            </p>
          </div>

          {/* 3 Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            {securityFeatures.map((feat, idx) => (
              <div 
                key={idx}
                className="bg-[#ffffff] rounded-2xl p-5 border border-[#d2d2c8] space-y-3 hover:border-[#14140f] transition-colors shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#14140f]">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#6e6e64] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>معتمد للاستخدام اليومي</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons & Partner Recommendation */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#d2d2c8]/80">
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer group"
              >
                <span>اكتشف NordVPN</span>
                <ArrowUpRight className="w-4 h-4 text-[#beff50] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <Link
                href="/guide/vpn-privacy"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#ffffff] hover:bg-[#f5f5eb] border border-[#d2d2c8] hover:border-[#14140f] text-[#14140f] text-xs sm:text-sm font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#6e6e64]" />
                <span>دليل الخصوصية واستخدام VPN</span>
              </Link>
            </div>

            {/* Micro Trust Badge */}
            <div className="text-[11px] text-[#6e6e64] flex items-center justify-center sm:justify-end gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>سياسة صارمة لعدم الاحتفاظ بالسجلات (Audited No-Logs)</span>
            </div>
          </div>

          {/* Transparent Affiliate Disclosure Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#ffffff]/80 border border-[#d2d2c8] text-[11px] sm:text-xs text-[#6e6e64] leading-relaxed text-right">
            <span className="font-bold text-[#14140f] ml-1">إفصاح الشفافية:</span>
            {NORDVPN_CONFIG.disclosureAr}
          </div>

        </div>
      </div>
    </section>
  );
}

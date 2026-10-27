'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowUpRight, Lock, BookOpen } from 'lucide-react';
import { Tool } from '../../types/tool';
import { getToolPrivacyContext, getNordVpnAffiliateUrl, NORDVPN_CONFIG } from '../../config/affiliates';

interface ToolPrivacyRecommendationProps {
  tool: Tool;
}

export default function ToolPrivacyRecommendation({ tool }: ToolPrivacyRecommendationProps) {
  const context = getToolPrivacyContext(tool);

  // Strictly render nothing if the tool did not pass the contextual audit
  if (!context) {
    return null;
  }

  const affiliateUrl = getNordVpnAffiliateUrl(`tool_detail_${tool.id}`);

  return (
    <div 
      className="bg-[#f5f5eb] rounded-2xl sm:rounded-[24px] p-4 sm:p-5 border border-[#d2d2c8] space-y-3.5 text-right transition-all"
      dir="rtl"
      aria-label="توصية الأمان والخصوصية"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#d2d2c8] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] shrink-0 shadow-2xs">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#14140f] flex items-center gap-1.5">
              <span>نصيحة تولزي للخصوصية</span>
            </h4>
            <span className="text-[10px] text-emerald-700 font-medium block">
              {context.headlineAr}
            </span>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#beff50] text-[#14140f] border border-[#14140f]/20 font-bold shrink-0">
          توصية أمنية
        </span>
      </div>

      {/* Advisory Text */}
      <p className="text-xs text-[#6e6e64] leading-relaxed">
        {context.noteAr}
      </p>

      {/* Action CTA & Guide Link */}
      <div className="pt-1 space-y-2">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] text-xs font-bold transition-colors shadow-2xs group cursor-pointer"
        >
          <span>تأمين اتصالك مع NordVPN</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#beff50] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <Link
            href="/guide/vpn-privacy"
            className="text-[#14140f] hover:underline inline-flex items-center gap-1 text-[11px] font-medium"
          >
            <BookOpen className="w-3 h-3 text-[#6e6e64]" />
            <span>لماذا نوصي بـ VPN؟ اقرأ الدليل</span>
          </Link>
          <span className="text-[10px] text-[#a0a096]">تشفير 256-bit</span>
        </div>
      </div>

      {/* Subtle Disclosure */}
      <div className="pt-2 border-t border-[#d2d2c8]/60 text-[10px] text-[#a0a096] leading-tight">
        {NORDVPN_CONFIG.shortDisclosureAr}
      </div>
    </div>
  );
}

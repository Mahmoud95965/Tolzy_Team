'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import { 
  ShieldCheck, 
  Lock, 
  Wifi, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  ChevronRight, 
  Clock, 
  Calendar, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Cpu, 
  HelpCircle,
  ExternalLink,
  Laptop,
  Layers,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getNordVpnAffiliateUrl, NORDVPN_CONFIG } from '../config/affiliates';

export default function VpnPrivacyGuidePage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const affiliateUrl = getNordVpnAffiliateUrl('vpn_privacy_guide_article');

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toast.success('تم نسخ رابط الدليل بنجاح! 🔗');
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      toast.error('تعذر نسخ الرابط');
    }
  };

  return (
    <PageLayout navbarOffset={true}>
      <article className="min-h-screen bg-[#ffffff] selection:bg-[#beff50] selection:text-[#14140f] pb-24 sm:pb-32" dir="rtl">
        
        {/* ========================================================= */}
        {/* 1. TOP BREADCRUMB NAVIGATION                              */}
        {/* ========================================================= */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <nav className="flex items-center gap-2 text-xs text-[#6e6e64] overflow-x-auto whitespace-nowrap py-2 border-b border-[#d2d2c8]/60">
            <Link href="/" className="hover:text-[#14140f] transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0 text-[#a0a096]" />
            <Link href="/guide" className="hover:text-[#14140f] transition-colors">
              الأدلة التقنية
            </Link>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0 text-[#a0a096]" />
            <span className="text-[#14140f] font-bold">
              دليل الخصوصية وحماية الاتصال (VPN)
            </span>
          </nav>
        </div>

        {/* ========================================================= */}
        {/* 2. ARTICLE HEADER & HERO                                  */}
        {/* ========================================================= */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-6">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14140f] text-[#ffffff] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#beff50]" />
              <span>دليل عملي شامل</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8] text-xs font-medium">
              الأمن السيبراني والخصوصية
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#14140f] tracking-tight leading-tight sm:leading-tight">
            دليل الخصوصية وحماية الاتصال: متى تحتاج إلى VPN عند استخدام أدوات الذكاء الاصطناعي والعمل عن بُعد؟
          </h1>

          <p className="text-sm sm:text-lg text-[#6e6e64] leading-relaxed font-normal">
            شرح مبسط ومبني على الأدلة التقنية: كيف تحمي بياناتك وجلساتك الحساسة على شبكات Wi-Fi العامة، ومتى يكون استخدام الـ VPN مفيداً حقاً، وما هي حدوده الحقيقية، وكيف تختار الخدمة الأنسب لاحتياجاتك اليومية.
          </p>

          {/* Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#d2d2c8] text-xs text-[#6e6e64]">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#14140f]" />
                <span>تحديث: أكتوبر 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#14140f]" />
                <span>8 دقائق قراءة</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تمت المراجعة والتدقيق التقني</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5eb] hover:bg-[#ffffff] text-[#14140f] border border-[#d2d2c8] text-xs transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'تم نسخ الرابط' : 'مشاركة الدليل'}</span>
            </button>
          </div>

          {/* Quick Key Takeaways Box */}
          <div className="bg-[#f5f5eb] rounded-2xl sm:rounded-[24px] p-5 sm:p-7 border border-[#d2d2c8] space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[#14140f] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#14140f]" />
              <span>خلاصة الدليل في نقاط سريعة:</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#14140f] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span><strong>وظيفة الـ VPN الأساسية:</strong> تشفير حركة مرور جهازك بالكامل وتوجيهها عبر نفق آمن لمنع التجسس على شبكات الإنترنت المفتوحة وحجب استعلامات الـ DNS عن مزودي الخدمة.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span><strong>أهمية قصوى للعمل عن بُعد:</strong> إذا كنت تستخدم حاسوبك أو هاتفك في مقهى، مطار، أو مساحة عمل مشتركة، فإن الـ VPN يحمي جلسات دخولك والبيانات التي ترسلها لأدوات الذكاء الاصطناعي من هجمات الاختراق المحلي (Man-in-the-Middle).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span><strong>حدود الحماية:</strong> الـ VPN ليس عصا سحرية؛ فهو لا يحميك من البرمجيات الخبيثة إذا قمت بتنزيلها يدوياً، ولا يمنع المنصات من جمع بياناتك إذا سجلت الدخول فيها بحسابك الشخصي.</span>
              </li>
            </ul>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 3. MAIN CONTENT BODY                                      */}
        {/* ========================================================= */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12 sm:space-y-16 text-[#14140f]">
          
          {/* SECTION 1: WHAT IS A VPN */}
          <section className="space-y-4" id="what-is-vpn">
            <h2 className="text-xl sm:text-2xl font-black text-[#14140f] flex items-center gap-2.5 border-b border-[#d2d2c8] pb-3">
              <Lock className="w-5 h-5 text-[#14140f]" />
              <span>1. ما هو الـ VPN وكيف يعمل تقنياً؟</span>
            </h2>
            <p className="text-xs sm:text-base text-[#43433b] leading-relaxed">
              كلمة <strong>VPN</strong> هي اختصار لـ <em>Virtual Private Network</em> (الشبكة الخاصة الافتراضية). عند تصفح الإنترنت بشكل تقليدي، يتصل جهازك مباشرة بخوادم المواقع والتطبيقات عبر مزود خدمة الإنترنت (ISP). يتيح هذا الاتصال المباشر لمزود الخدمة (وأي جهة تترصد على شبكة الـ Wi-Fi المحلية) الاطلاع على عناوين المواقع التي تزورها وحجم البيانات المرسلة.
            </p>
            <p className="text-xs sm:text-base text-[#43433b] leading-relaxed">
              عند تفعيل شبكة VPN موثوقة، يتم إنشاء <strong>نفق مشفر (Encrypted Tunnel)</strong> بين جهازك وخادم الـ VPN. وتحدث عمليتان رئيسيتان:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#f5f5eb] p-4 sm:p-5 rounded-2xl border border-[#d2d2c8] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center font-bold text-xs text-[#14140f]">
                  01
                </div>
                <h4 className="font-bold text-sm text-[#14140f]">التشفير الكامل للحزم (AES-256)</h4>
                <p className="text-xs text-[#6e6e64] leading-relaxed">
                  تتحول كافة البيانات المتبادلة إلى رموز غير قابلة للقراءة. حتى لو تمكن متسلل على نفس شبكة الـ Wi-Fi من التقاط حزم البيانات، فلن يرى سوى أحرف عشوائية مشفرة.
                </p>
              </div>

              <div className="bg-[#f5f5eb] p-4 sm:p-5 rounded-2xl border border-[#d2d2c8] space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center font-bold text-xs text-[#14140f]">
                  02
                </div>
                <h4 className="font-bold text-sm text-[#14140f]">إخفاء عنوان الـ IP الحقيقي</h4>
                <p className="text-xs text-[#6e6e64] leading-relaxed">
                  تظهر المواقع والخدمات الخارجية عنوان الـ IP الخاص بخادم الـ VPN بدلاً من عنوان جهازك وموقعك الجغرافي الفعلي، مما يمنع ربط نشاطك الرقمي بهويتك المباشرة.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: WHEN IS IT USEFUL */}
          <section className="space-y-4" id="when-useful">
            <h2 className="text-xl sm:text-2xl font-black text-[#14140f] flex items-center gap-2.5 border-b border-[#d2d2c8] pb-3">
              <Laptop className="w-5 h-5 text-[#14140f]" />
              <span>2. متى تحتاج إلى VPN عند استخدام أدوات الذكاء الاصطناعي والعمل عن بُعد؟</span>
            </h2>
            <p className="text-xs sm:text-base text-[#43433b] leading-relaxed">
              مع انتشار العمل الحر، والوظائف عن بُعد، والاعتماد اليومي على أدوات الذكاء الاصطناعي ومحررات الأكواد السحابية، تبرز حالات استخدام حقيقية تجعل استخدام الـ VPN خطوة وقائية ذات قيمة عملية:
            </p>

            <div className="space-y-4 pt-1">
              <div className="border border-[#d2d2c8] rounded-2xl p-4 sm:p-5 bg-[#ffffff] space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-[#14140f] flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-rose-500" />
                  <span>أ. استخدام شبكات Wi-Fi المفتوحة في المقاهي والمطارات</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#6e6e64] leading-relaxed">
                  تعد شبكات الواي فاي العامة بيئة خصبة لهجمات "رجل في المنتصف" (Man-in-the-Middle) ومحاولات استنساخ نقاط الوصول غير الآمنة (Evil Twin). عندما تفتح أداة ذكاء اصطناعي وتشارك فيها مستندات شركة أو أفكار مشاريع جديدة، فإن تشفير اتصالك بطبقة VPN يمنع أي شخص متصل بالشبكة نفسها من التلصص على حركة مرورك.
                </p>
              </div>

              <div className="border border-[#d2d2c8] rounded-2xl p-4 sm:p-5 bg-[#ffffff] space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-[#14140f] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  <span>ب. حماية مفاتيح الـ API وجلسات العمل السحابية الحساسة</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#6e6e64] leading-relaxed">
                  يقوم المطورون يومياً باختبار نماذج الـ LLM وتمرير مفاتيح برمجية حساسة (API Keys) عبر أدوات مثل Cursor وVS Code السحابي. الاتصال عبر نفق VPN مستقر يقلل من احتمالية تسريب استعلامات DNS أو كشف مسارات الـ Endpoints الخاصة بتطبيقاتك.
                </p>
              </div>

              <div className="border border-[#d2d2c8] rounded-2xl p-4 sm:p-5 bg-[#ffffff] space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-[#14140f] flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-emerald-600" />
                  <span>ج. منع مزودي الخدمة (ISPs) من تسجيل وتتبع أنشطتك</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#6e6e64] leading-relaxed">
                  يقوم العديد من مزودي خدمة الإنترنت في مناطق متعددة بتسجيل سجلات التصفح لبيانات المشتركين لأغراض تسويقية أو تحليلية. باستخدام VPN موثوق يطبق سياسة صارمة لعدم الاحتفاظ بالسجلات، يرى مزود الإنترنت اتصالاً مشفراً واحداً فقط دون معرفة تفاصيل ما تتصفحه أو الأدوات التي تستخدمها.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: LIMITATIONS OF VPN */}
          <section className="space-y-4" id="limitations">
            <h2 className="text-xl sm:text-2xl font-black text-[#14140f] flex items-center gap-2.5 border-b border-[#d2d2c8] pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>3. ما هي حدود حماية الـ VPN؟ (أشياء لا يستطيع حمايتك منها)</span>
            </h2>
            <p className="text-xs sm:text-base text-[#43433b] leading-relaxed">
              من أجل الشفافية الكاملة والمصداقية التقنية، من المهم جداً توضيح أن شبكات الـ VPN ليست درعاً مطلقاً، وهناك أمور تقع خارج نطاق حمايتها:
            </p>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="space-y-2 text-xs sm:text-sm text-amber-900 leading-relaxed">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>لا يمنع المنصات من جمع بياناتك المسجلة:</strong> إذا سجلت دخولك إلى حسابك في Google أو OpenAI، فإن تلك المنصات ستسجل محادثاتك وسجلات استخدامك المرتبطة بحسابك، فالـ VPN يحمي الاتصال بينك وبين الخادم وليس ما تدخله داخل المنصة نفسها.</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>لا يحميك من التنزيل اليدوي للملفات المصابة:</strong> إذا قمت بتنزيل ملف خبيث بنفسك من موقع غير موثوق، فلن يمنع الـ VPN الفيروس من إصابة جهازك (ما لم تكن الخدمة مزودة بفلتر حماية من الملفات مثل Threat Protection).</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>ليس بديلاً عن المصادقة الثنائية (2FA):</strong> تأمين حساباتك يبدأ بكلمات مرور قوية ومصادقة ثنائية، فالـ VPN مكمل أمني للشبكة وليس بديلاً عن إدارة أمان الحسابات.</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: HOW TO EVALUATE A VPN SERVICE */}
          <section className="space-y-4" id="how-to-evaluate">
            <h2 className="text-xl sm:text-2xl font-black text-[#14140f] flex items-center gap-2.5 border-b border-[#d2d2c8] pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>4. معايير اختيار شبكة VPN موثوقة (قائمة التدقيق)</span>
            </h2>
            <p className="text-xs sm:text-base text-[#43433b] leading-relaxed">
              ليست كل خدمات الـ VPN متساوية؛ والعديد من الخدمات المجانية المشبوهة تقوم ببيع بيانات المستخدمين لتمويل خوادمها. عند اختيار خدمة VPN، تأكد من توافر المعايير التالية:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#f5f5eb] p-4.5 rounded-2xl border border-[#d2d2c8] space-y-1.5">
                <h4 className="font-bold text-sm text-[#14140f]">1. سياسة عدم الاحتفاظ بالسجلات (No-Logs Policy)</h4>
                <p className="text-xs text-[#6e6e64] leading-relaxed">
                  أن تكون خاضعة لتدقيق مستقل من مكاتب مراجعة عالمية (مثل PwC أو Deloitte) لإثبات عدم حفظ أي سجلات لتصفح المستخدم.
                </p>
              </div>

              <div className="bg-[#f5f5eb] p-4.5 rounded-2xl border border-[#d2d2c8] space-y-1.5">
                <h4 className="font-bold text-sm text-[#14140f]">2. بروتوكولات تشفير حديثة وسريعة</h4>
                <p className="text-xs text-[#6e6e64] leading-relaxed">
                  دعم بروتوكولات الجيل الجديد مثل WireGuard أو NordLynx التي توفر تشفيراً قوياً مع الحفاظ على سرعات تصفح وتحميل عالية.
                </p>
              </div>

              <div className="bg-[#f5f5eb] p-4.5 rounded-2xl border border-[#d2d2c8] space-y-1.5">
                <h4 className="font-bold text-sm text-[#14140f]">3. مفتاح الإيقاف التلقائي (Kill Switch)</h4>
                <p className="text-xs text-[#6e6e64] leading-relaxed">
                  ميزة تقطع الاتصال بالإنترنت فوراً إذا انقطع اتصال الـ VPN فجأة، وذلك لمنع انكشاف عنوان الـ IP الحقيقي دون علمك.
                </p>
              </div>

              <div className="bg-[#f5f5eb] p-4.5 rounded-2xl border border-[#d2d2c8] space-y-1.5">
                <h4 className="font-bold text-sm text-[#14140f]">4. الحماية من تسريب الـ DNS والـ WebRTC</h4>
                <p className="text-xs text-[#6e6e64] leading-relaxed">
                  خوادم DNS خاصة بالخدمة تمنع إرسال طلبات أسماء النطاقات إلى خوادم خارجية غير مشفرة.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5: TRANSPARENT NORDVPN RECOMMENDATION */}
          <section className="space-y-6 bg-[#f5f5eb] rounded-[28px] border border-[#d2d2c8] p-6 sm:p-10" id="nordvpn-recommendation">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#beff50] text-[#14140f] border border-[#14140f] text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>توصية فريق تولزي للخصوصية</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#14140f] tracking-tight">
                لماذا نوصي بخدمة NordVPN؟
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-[#6e6e64] leading-relaxed">
                بناءً على المعايير التقنية واختبارات الأداء المستمرة، تأتي <strong>NordVPN</strong> كواحدة من أفضل وأكثر خدمات الـ VPN نضجاً وموثوقية على مستوى العالم، وذلك لعدة أسباب جوهرية:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-[#ffffff] p-4 rounded-xl border border-[#d2d2c8] space-y-1.5">
                <h4 className="font-bold text-[#14140f] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>بروتوكول NordLynx فائق السرعة</span>
                </h4>
                <p className="text-[#6e6e64]">مبني على بنية WireGuard لتوفير أعلى سرعات تصفح وبث دون التأثير الملحوظ على استجابة أدوات الـ AI.</p>
              </div>

              <div className="bg-[#ffffff] p-4 rounded-xl border border-[#d2d2c8] space-y-1.5">
                <h4 className="font-bold text-[#14140f] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ميزة Threat Protection المدمجة</span>
                </h4>
                <p className="text-[#6e6e64]">تقوم بحظر النطاقات الخبيثة والإعلانات المتتبعة وتفحص التنزيلات من الملفات المصابة قبل حفظها في جهازك.</p>
              </div>

              <div className="bg-[#ffffff] p-4 rounded-xl border border-[#d2d2c8] space-y-1.5">
                <h4 className="font-bold text-[#14140f] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>سجلات مدققة خارجياً عدة مرات</span>
                </h4>
                <p className="text-[#6e6e64]">أكدت عمليات التدقيق المستقلة بواسطة PwC وDeloitte التزام NordVPN الصارم بعدم تسجيل أي نشاط للمستخدمين.</p>
              </div>

              <div className="bg-[#ffffff] p-4 rounded-xl border border-[#d2d2c8] space-y-1.5">
                <h4 className="font-bold text-[#14140f] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>دعم كافة الأجهزة وتطبيقات سهلة الاستخدام</span>
                </h4>
                <p className="text-[#6e6e64]">تطبيقات أصلية مستقرة وسهلة بنقرة واحدة لأنظمة Windows وmacOS وiOS وAndroid ولينكس.</p>
              </div>
            </div>

            {/* Direct Official CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#d2d2c8]">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] text-sm font-bold transition-all shadow-xs cursor-pointer group"
              >
                <span>الاشتراك وتفعيل الحماية مع NordVPN</span>
                <ArrowUpRight className="w-4 h-4 text-[#beff50] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <span className="text-xs text-[#6e6e64] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ضمان استرداد الأموال لمدة 30 يوماً</span>
              </span>
            </div>

            {/* Transparent Affiliate Disclosure */}
            <div className="p-3.5 rounded-xl bg-[#ffffff] border border-[#d2d2c8] text-[11px] text-[#6e6e64] leading-relaxed">
              <span className="font-bold text-[#14140f] ml-1">إفصاح الشفافية التسويقية:</span>
              {NORDVPN_CONFIG.disclosureAr}
            </div>
          </section>

          {/* SECTION 6: COMPLEMENTARY TOOLS FROM TOLZY */}
          <section className="space-y-4 pt-4 border-t border-[#d2d2c8]">
            <h3 className="text-lg sm:text-xl font-bold text-[#14140f] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#14140f]" />
              <span>أدوات تقنية وخصوصية ذات صلة من دليل تولزي</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#6e6e64]">
              لتعزيز أمانك الرقمي، ننصحك أيضاً باستكشاف هذه الأدوات المتخصصة من دليل تولزي:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <Link
                href="/tools"
                className="p-3.5 rounded-xl bg-[#f5f5eb] hover:bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] transition-all block group"
              >
                <div className="font-bold text-xs sm:text-sm text-[#14140f] group-hover:underline flex items-center justify-between">
                  <span>متصفح Brave Leo</span>
                  <ExternalLink className="w-3 h-3 text-[#6e6e64]" />
                </div>
                <p className="text-[11px] text-[#6e6e64] mt-1 line-clamp-2">
                  متصفح خصوصية مدمج بمساعد ذكاء اصطناعي يحجب الإعلانات وأدوات التتبع افتراضياً.
                </p>
              </Link>

              <Link
                href="/tools?category=Cybersecurity"
                className="p-3.5 rounded-xl bg-[#f5f5eb] hover:bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] transition-all block group"
              >
                <div className="font-bold text-xs sm:text-sm text-[#14140f] group-hover:underline flex items-center justify-between">
                  <span>أدوات الأمن السيبراني</span>
                  <ExternalLink className="w-3 h-3 text-[#6e6e64]" />
                </div>
                <p className="text-[11px] text-[#6e6e64] mt-1 line-clamp-2">
                  تصفح أكثر من 30 أداة متخصصة في فحص الثغرات، تدقيق الـ APIs، وحماية المصادقة.
                </p>
              </Link>

              <Link
                href="/tools?category=Productivity"
                className="p-3.5 rounded-xl bg-[#f5f5eb] hover:bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] transition-all block group"
              >
                <div className="font-bold text-xs sm:text-sm text-[#14140f] group-hover:underline flex items-center justify-between">
                  <span>أدوات العمل السحابي</span>
                  <ExternalLink className="w-3 h-3 text-[#6e6e64]" />
                </div>
                <p className="text-[11px] text-[#6e6e64] mt-1 line-clamp-2">
                  أقوى أدوات الإنتاجية، تدوين الملاحظات، وإدارة المشاريع للفرق والمستقلين.
                </p>
              </Link>
            </div>
          </section>

        </main>
      </article>
    </PageLayout>
  );
}

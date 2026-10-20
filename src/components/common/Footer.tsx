"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  Heart, 
  Check, 
  Loader, 
  ExternalLink,
  ArrowLeftRight,
  Sparkles,
  ShieldCheck,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscribeToNewsletter } from '../../services/newsletter.service';
import { useCompare } from '@/src/context/CompareContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { openModal } = useCompare();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await subscribeToNewsletter(email, 'footer');

      if (response.success) {
        setIsSubscribed(true);
        toast.success(response.message || 'تم الاشتراك في النشرة البريدية بنجاح');
        setEmail('');
      } else {
        toast.error(response.message || 'حدث خطأ أثناء الاشتراك');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('حدث خطأ أثناء الاشتراك. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#14140f] text-[#f5f5eb] border-t border-[#30302a] pt-16 pb-12 transition-colors select-none">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* Top Status & Value Strip                                  */}
        {/* ========================================================= */}
        <div className="pb-12 mb-12 border-b border-[#30302a] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1c1c16] border border-[#30302a] text-[#f5f5eb]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#beff50] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#beff50]" />
            </span>
            <span className="font-medium">جميع خدمات ودلائل المنصة تعمل بكفاءة (100% Uptime)</span>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 text-[#d2d2c8] font-normal">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#beff50]" />
              <span>+360 أداة ذكاء اصطناعي موثقة</span>
            </div>
            <span className="text-[#30302a]">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#beff50]" />
              <span>مراجعات حيادية 100%</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Main 5-Column Navigation Grid                             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-16 text-right text-sm">
          
          {/* Column 1: Brand & Identity (4 Cols on LG) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="text-3xl font-medium tracking-tight text-[#ffffff]">
                TOLZY
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full bg-[#beff50] text-[#14140f]">
                AI DIRECTORY & COURSES
              </span>
            </Link>
            
            <p className="text-[#d2d2c8] leading-relaxed text-sm font-normal max-w-sm">
              أكبر محرك بحث ودليل عربي فوري لاكتشاف ومقارنة أدوات الذكاء الاصطناعي ومسارات التعلم التقني الحديثة بدون أي إعلانات مزعجة وبمحتوى منسق 100%.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              {[
                { icon: Twitter, href: "https://twitter.com/tolzytools", name: "Twitter" },
                { icon: Github, href: "https://github.com", name: "GitHub" },
                { icon: Linkedin, href: "https://linkedin.com", name: "LinkedIn" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full bg-[#1c1c16] border border-[#30302a] flex items-center justify-center text-[#d2d2c8] hover:bg-[#beff50] hover:text-[#14140f] hover:border-[#14140f] transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: دليل الأدوات (2 Cols on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.1em] font-medium text-[#beff50] flex items-center gap-1.5">
              <span>دليل الأدوات</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/tools" className="text-[#f5f5eb] hover:text-[#beff50] transition-colors">
                  تصفح كل الأدوات
                </Link>
              </li>
              <li>
                <Link href="/tools?pricing=Free" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  أدوات مجانية بالكامل
                </Link>
              </li>
              <li>
                <Link href="/tools?category=Programming" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  أدوات البرمجة والكود
                </Link>
              </li>
              <li>
                <Link href="/tools?category=Design" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  توليد الصور والتصميم
                </Link>
              </li>
              <li>
                <button 
                  onClick={openModal}
                  className="text-[#f5f5eb] hover:text-[#beff50] transition-colors flex items-center gap-1.5 cursor-pointer text-sm text-right"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#beff50]" />
                  <span>مقارنة الأدوات</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: مسارات التعلّم (2 Cols on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.1em] font-medium text-[#beff50] flex items-center gap-1.5">
              <span>مسارات التعلّم</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/learn" className="text-[#f5f5eb] hover:text-[#beff50] transition-colors">
                  جميع المسارات
                </Link>
              </li>
              <li>
                <Link href="/learn/course/fullstack-web-pro" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  تطوير الويب الشامل
                </Link>
              </li>
              <li>
                <Link href="/learn/course/ai-llm-agents-masterclass" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  نماذج الذكاء الاصطناعي
                </Link>
              </li>
              <li>
                <Link href="/learn/course/ai-ui-ux-design-systems" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  تصميم واجهات UI/UX
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  شهادات إتمام معتمدة
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: المنظومة والدعم (2 Cols on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.1em] font-medium text-[#beff50] flex items-center gap-1.5">
              <span>المنصة والدعم</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://flow.tolzy.me" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-1.5 text-[#f5f5eb] hover:text-[#beff50] transition-colors font-medium"
                >
                  <span>TOLZY Flow</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:translate-x-[-2px] transition-transform" />
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-[#beff50] text-[#14140f] font-medium">
                    جديد
                  </span>
                </a>
              </li>
              <li>
                <Link href="/community" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  المجتمع التقني
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  التوثيق البرمجي
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  عن المنصة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#d2d2c8] hover:text-[#beff50] transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: النشرة البريدية (2 Cols on LG) */}
          <div className="lg:col-span-2 bg-[#1c1c16] p-5 rounded-[24px] border border-[#30302a] flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-[0.1em] font-medium text-[#beff50] mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>النشرة الأسبوعية</span>
              </h3>
              <p className="text-xs text-[#d2d2c8] mb-4 leading-relaxed font-normal">
                أفضل 5 أدوات ذكاء اصطناعي ومسارات جديدة في بريدك كل أسبوع.
              </p>
            </div>

            {isSubscribed ? (
              <div className="flex flex-col items-center justify-center py-3 text-[#beff50] bg-[#beff50]/10 rounded-[18px] border border-[#beff50]/30">
                <div className="w-7 h-7 bg-[#beff50]/20 rounded-full flex items-center justify-center mb-1">
                  <Check className="w-4 h-4 text-[#beff50]" />
                </div>
                <p className="font-medium text-xs">تم اشتراكك بنجاح</p>
              </div>
            ) : (
              <form className="space-y-2.5" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-[14px] bg-[#ffffff] text-[#14140f] placeholder-[#6e6e64] border border-[#d2d2c8] text-xs focus:outline-none focus:border-[#beff50] transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-[28px] bg-[#beff50] hover:bg-[#abf03c] disabled:opacity-50 text-[#14140f] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري...</span>
                    </>
                  ) : (
                    <span>اشترك مجاناً</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* Bottom Bar: Copyright & Legal Links                       */}
        {/* ========================================================= */}
        <div className="pt-8 border-t border-[#30302a] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6e6e64]">
          <p className="text-center md:text-right font-normal">
            © {currentYear} <span className="text-[#ffffff] font-medium">TOLZY</span> — المنصة العربية المستقلة للأدوات والكورسات التقنية.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#f5f5eb] transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-[#f5f5eb] transition-colors">
              شروط الاستخدام
            </Link>
            <Link href="/faq" className="hover:text-[#f5f5eb] transition-colors">
              الأسئلة الشائعة
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#d2d2c8]">
            <span>صُنع بشغف</span>
            <Heart className="w-3.5 h-3.5 text-[#beff50] fill-[#beff50]" />
            <span>لتمكين المحتوى التقني العربي</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

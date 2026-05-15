"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Facebook, Instagram, Mail, Heart, Check, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscribeToNewsletter } from '../../services/newsletter.service';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [issubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await subscribeToNewsletter(email, 'footer');

      if (response.success) {
        setIsSubscribed(true);
        toast.success(response.message);
        setEmail('');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('حدث خطأ أثناء الاشتراك. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12 text-right text-sm">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-[0.25em] text-slate-900 dark:text-white">
                TOLZY
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              المنصة العربية الأولى لتمكين المطورين وصناع المحتوى بأفضل أدوات الذكاء الاصطناعي والموارد التعليمية.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "https://twitter.com/tolzytools", name: "Twitter" },
                { icon: Linkedin, href: "#", name: "LinkedIn" },
                { icon: Facebook, href: "#", name: "Facebook" },
                { icon: Instagram, href: "#", name: "Instagram" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1: المنصة */}
          <div className="col-span-1">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">المنصة</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/tools" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  تصفح الأدوات
                </Link>
              </li>
              <li>
                <Link href="/copilot" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  المساعد الذكي (Copilot)
                </Link>
              </li>
              <li>
                    <Link href="/learn" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors duration-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      أكاديمية Tolzy
                    </Link>
              </li>
              <li>
                <Link href="/news" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  الأخبار والشروحات
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: الشركة */}
          <div className="col-span-1">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">الشركة</h3>
            <ul className="space-y-4">

              <li>
                <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  عن منصة Tolzy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: المصادر */}
          <div className="col-span-1">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">المصادر</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/community" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  المجتمع (Community)
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  سجل التغييرات
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  التوثيق (Docs)
                </Link>
              </li>
              <li className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/privacy" className="text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs">
                  شروط الاستخدام
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700 h-fit">
            <h3 className="font-bold text-indigo-900 dark:text-white mb-2 text-base">النشرة البريدية</h3>
            <p className="text-xs text-indigo-700 dark:text-slate-400 mb-4">
              احصل على أحدث الأدوات والأخبار التقنية أسبوعياً.
            </p>
            {issubscribed ? (
              <div className="flex flex-col items-center justify-center py-6 text-green-600 animate-fade-in">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm">تم الاشتراك بنجاح!</p>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleSubscribe}>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="بريدك الإلكتروني"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      جاري الاشتراك...
                    </>
                  ) : (
                    'اشترك الآن'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-500 text-sm text-center md:text-right">
            © {currentYear} Tolzy. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-500">
            <span>صنع بـ</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>في مصر</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

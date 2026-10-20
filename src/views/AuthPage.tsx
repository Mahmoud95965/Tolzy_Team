"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Zap, 
  Github, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Cpu, 
  GraduationCap, 
  Globe, 
  ShieldCheck, 
  ArrowUpRight,
  Loader2,
  Check
} from 'lucide-react';
import GoogleIcon from '../components/icons/GoogleIcon';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pendingEmail, setPendingEmail] = useState('');

  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub, error } = useAuth();

  // Check URL params on mount to set initial mode (e.g. ?mode=register)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode === 'register' || mode === 'signup') {
        setIsLogin(false);
      }
    }
  }, []);

  const getRedirectPath = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        // Safe relative path
        if (redirect.startsWith('/') && !redirect.startsWith('//')) {
          return redirect;
        }
        // Safe absolute URL check (tolzy.me or localhost)
        try {
          const parsed = new URL(redirect);
          if (parsed.hostname.endsWith('tolzy.me') || parsed.hostname === 'localhost' || parsed.hostname.endsWith('.localhost')) {
            return redirect;
          }
        } catch {
          return '/';
        }
      }
    }
    return '/';
  };

  const handleSendOTPForEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('البريد الإلكتروني وكلمة المرور مطلوبة');
      return;
    }

    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/email-verify/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'فشل إرسال الرمز');
      
      toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      setPendingEmail(email);
      setShowEmailVerification(true);
      setOtp(['', '', '', '', '', '']);
      
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('يرجى إدخال الرمز المكون من 6 أرقام');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/email-verify/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp: code })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'الرمز غير صحيح أو منتهي الصلاحية');
      
      // Now complete signup
      const completeRes = await fetch('/api/auth/email-verify/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail })
      });
      const completeData = await completeRes.json();

      if (!completeRes.ok) throw new Error(completeData.error || 'فشل إتمام إنشاء الحساب');

      toast.success('تم تأكيد بريدك بنجاح! جاري الدخول...');
      
      // Sign in user
      await signInWithEmail(pendingEmail, password);
      setTimeout(() => {
        window.location.href = getRedirectPath();
      }, 800);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (value !== '' && index === 5 && newOtp.every(v => v !== '')) {
      setTimeout(() => {
        document.getElementById('verifyEmailBtn')?.click();
      }, 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      if (pastedData.length === 6) {
        otpRefs.current[5]?.focus();
        setTimeout(() => {
          document.getElementById('verifyEmailBtn')?.click();
        }, 100);
      } else {
        otpRefs.current[pastedData.length]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        window.location.href = getRedirectPath();
      } else {
        await handleSendOTPForEmailVerification(e);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      window.location.href = getRedirectPath();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGithub();
      window.location.href = getRedirectPath();
    } catch (error) {
      console.error('Github sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5eb] text-[#14140f] flex flex-col justify-between selection:bg-[#beff50] selection:text-[#14140f] antialiased" dir="rtl">
      
      {/* ─── Top Editorial Header ─── */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-[14px] bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center group-hover:border-[#14140f] transition-colors p-1.5">
            <img src="/tolzy-logo.svg" alt="TOLZY" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-medium tracking-[-0.03em] text-[#14140f]">
            TOLZY
          </span>
        </Link>

        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.05em] px-4 py-2 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] hover:border-[#14140f] transition-colors"
        >
          <span>العودة للرئيسية</span>
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
        </Link>
      </header>

      {/* ─── Main Content Grid ─── */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 flex-1 flex items-center">
        <div className="w-full grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ─── Left Side: Editorial Value Proposition (5 Cols) ─── */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Status eyebrow badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.1em] bg-[#ffffff] text-[#14140f] border border-[#d2d2c8]">
              <span className="w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f]" />
              <span>بوابة الدخول الموحدة للتقنيين والمبدعين</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.03em] leading-[1.08] text-[#14140f]">
                {isLogin ? (
                  <>مرحباً بك مجدداً في <span className="underline decoration-[#beff50] decoration-4 underline-offset-4">TOLZY</span></>
                ) : (
                  <>انضم إلى أكبر منصة <span className="underline decoration-[#beff50] decoration-4 underline-offset-4">للأدوات والكورسات</span></>
                )}
              </h1>
              <p className="text-base sm:text-lg text-[#6e6e64] max-w-xl font-normal leading-relaxed">
                سجل حسابك لتتمكن من حفظ أدواتك المفضلة، متابعة تقدمك في أكثر من 150 كورس تقني، واستخدام المنصة بسرعة فائقة وبدون أي تشتيت.
              </p>
            </div>

            {/* Value Cards (Perk Style: 28px radius, pure white on parchment, no shadow) */}
            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-5 rounded-[28px] bg-[#ffffff] border border-[#d2d2c8]">
                <div className="w-10 h-10 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] mb-3">
                  <Cpu className="w-5 h-5 text-[#14140f]" />
                </div>
                <div className="font-medium text-[#14140f] text-sm">+1,000 أداة ذكاء اصطناعي</div>
                <div className="text-xs text-[#6e6e64] mt-1 font-normal">احفظ وقارن بدائل الأدوات المناسبة لعملك بسهولة.</div>
              </div>

              <div className="p-5 rounded-[28px] bg-[#ffffff] border border-[#d2d2c8]">
                <div className="w-10 h-10 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] mb-3">
                  <GraduationCap className="w-5 h-5 text-[#14140f]" />
                </div>
                <div className="font-medium text-[#14140f] text-sm">+150 مسار وكورس مجاني</div>
                <div className="text-xs text-[#6e6e64] mt-1 font-normal">تعلم البرمجة والذكاء الاصطناعي والتصميم بالعربية.</div>
              </div>

              <div className="p-5 rounded-[28px] bg-[#ffffff] border border-[#d2d2c8]">
                <div className="w-10 h-10 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] mb-3">
                  <Zap className="w-5 h-5 text-[#14140f]" />
                </div>
                <div className="font-medium text-[#14140f] text-sm">سرعة استجابة فائقة</div>
                <div className="text-xs text-[#6e6e64] mt-1 font-normal">تجربة تصفح فورية (0ms Latency) بدون إعلانات مزعجة.</div>
              </div>

              <div className="p-5 rounded-[28px] bg-[#ffffff] border border-[#d2d2c8]">
                <div className="w-10 h-10 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#14140f]" />
                </div>
                <div className="font-medium text-[#14140f] text-sm">أمان وخصوصية تامة</div>
                <div className="text-xs text-[#6e6e64] mt-1 font-normal">بياناتك مشفرة ومحمية بأحدث معايير الأمان العالمية.</div>
              </div>
            </div>

            {/* Social Proof Metric Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-xs text-[#14140f]">
              <div className="flex -space-x-1.5 rtl:space-x-reverse">
                <span className="w-6 h-6 rounded-full bg-[#beff50] border border-[#14140f] flex items-center justify-center text-[10px] font-mono font-medium">T</span>
                <span className="w-6 h-6 rounded-full bg-[#14140f] border border-[#ffffff] text-[#ffffff] flex items-center justify-center text-[10px] font-mono font-medium">Z</span>
                <span className="w-6 h-6 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center text-[10px] font-mono font-medium">✓</span>
              </div>
              <span className="font-normal text-[#6e6e64]">
                انضم لأكثر من <strong className="font-medium text-[#14140f]">+12,000</strong> مطور ومبدع عربي مسجل
              </span>
            </div>
          </div>

          {/* ─── Right Side: Auth Card (6 Cols) ─── */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[480px] bg-[#ffffff] border border-[#d2d2c8] rounded-[28px] p-6 sm:p-8 space-y-6">
              
              {/* Mode Switcher Tabs */}
              {!showEmailVerification && (
                <div className="bg-[#f5f5eb] border border-[#d2d2c8] p-1 rounded-full flex gap-1">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                      isLogin 
                        ? 'bg-[#14140f] text-[#ffffff]' 
                        : 'text-[#6e6e64] hover:text-[#14140f]'
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                      !isLogin 
                        ? 'bg-[#14140f] text-[#ffffff]' 
                        : 'text-[#6e6e64] hover:text-[#14140f]'
                    }`}
                  >
                    إنشاء حساب جديد
                  </button>
                </div>
              )}

              {/* ─── STATE 1: Email OTP Verification View ─── */}
              {showEmailVerification ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-center space-y-2.5">
                    <div className="w-14 h-14 rounded-full bg-[#beff50] border border-[#14140f] flex items-center justify-center mx-auto text-[#14140f]">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#14140f]">
                      تأكيد بريدك الإلكتروني
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6e6e64] font-normal">
                      أرسلنا رمز تحقق أمني مكون من 6 أرقام إلى:
                    </p>
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] text-xs font-mono font-medium text-[#14140f]">
                      {pendingEmail}
                    </div>
                  </div>

                  <form onSubmit={handleVerifyEmailOTP} className="space-y-6">
                    <div dir="ltr" className="space-y-2">
                      <div className="flex gap-2 justify-between max-w-sm mx-auto" onPaste={handlePaste}>
                        {otp.map((value, index) => (
                          <input
                            key={index}
                            ref={(el) => { otpRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-mono font-medium rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] focus:outline-none focus:border-[#14140f] focus:bg-[#ffffff] transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      id="verifyEmailBtn"
                      type="submit"
                      disabled={isLoading || otp.join('').length < 6}
                      className="w-full py-4 rounded-[28px] bg-[#beff50] hover:bg-[#aef538] text-[#14140f] border border-[#14140f] font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>تأكيد الرمز وإكمال التسجيل</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="flex items-center justify-between text-xs text-[#6e6e64] pt-2 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailVerification(false);
                        setOtp(['', '', '', '', '', '']);
                      }}
                      className="hover:text-[#14140f] underline font-medium transition-colors"
                    >
                      تعديل البريد الإلكتروني
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const res = await fetch('/api/auth/email-verify/send-otp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: pendingEmail, firstName, lastName, password })
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'فشل إعادة الإرسال');
                          toast.success('تم إرسال رمز جديد إلى بريدك');
                          setOtp(['', '', '', '', '', '']);
                          setTimeout(() => { otpRefs.current[0]?.focus(); }, 100);
                        } catch (err: any) {
                          toast.error(err.message);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-[#14140f] font-medium hover:underline transition-all"
                    >
                      إعادة إرسال الرمز
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── STATE 2: Standard Login / Register View ─── */
                <div className="space-y-6">
                  
                  {/* Social Buttons */}
                  <div className="space-y-3">
                    
                    {/* Google Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-[28px] bg-[#ffffff] hover:bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] font-medium text-sm transition-all group"
                      >
                        <GoogleIcon className="w-5 h-5 shrink-0" />
                        <span>المتابعة باستخدام Google</span>
                        
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-[#beff50] text-[#14140f] border border-[#14140f] text-[10px] font-medium">
                          الأسرع ⚡
                        </span>
                      </button>
                    </div>

                    {/* GitHub Button */}
                    <button
                      type="button"
                      onClick={handleGithubSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[28px] bg-[#ffffff] hover:bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] font-medium text-sm transition-all"
                    >
                      <Github className="w-4 h-4 text-[#14140f]" />
                      <span>المتابعة عبر GitHub</span>
                    </button>
                  </div>

                  {/* Editorial Divider */}
                  <div className="relative flex items-center my-4">
                    <div className="flex-grow border-t border-[#d2d2c8]"></div>
                    <span className="flex-shrink mx-4 text-xs font-medium uppercase tracking-[0.1em] text-[#6e6e64]">
                      أو عبر البريد الإلكتروني
                    </span>
                    <div className="flex-grow border-t border-[#d2d2c8]"></div>
                  </div>

                  {/* Auth Error Banner */}
                  {error && (
                    <div className="p-4 rounded-[20px] bg-[#fff5f5] border border-[#f5c6cb] text-[#d9534f] text-xs sm:text-sm font-medium flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#d9534f] shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* First & Last Name if Registration */}
                    {!isLogin && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#14140f] px-1 block">
                            الاسم الأول
                          </label>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="محمد"
                            className="w-full bg-[#ffffff] border border-[#d2d2c8] focus:border-[#14140f] rounded-[28px] py-3 px-4 text-[#14140f] placeholder-[#6e6e64] text-sm font-normal outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#14140f] px-1 block">
                            الاسم الأخير
                          </label>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="علي"
                            className="w-full bg-[#ffffff] border border-[#d2d2c8] focus:border-[#14140f] rounded-[28px] py-3 px-4 text-[#14140f] placeholder-[#6e6e64] text-sm font-normal outline-none transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#14140f] px-1 block">
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          dir="ltr"
                          className="w-full bg-[#ffffff] border border-[#d2d2c8] focus:border-[#14140f] rounded-[28px] py-3.5 pr-4 pl-11 text-[#14140f] placeholder-[#6e6e64] text-sm font-normal outline-none transition-colors"
                        />
                        <Mail className="w-4 h-4 text-[#6e6e64] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-medium text-[#14140f]">
                          كلمة المرور
                        </label>
                        {isLogin && (
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs font-medium text-[#6e6e64] hover:text-[#14140f] hover:underline transition-colors"
                          >
                            نسيت كلمة المرور؟
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          dir="ltr"
                          className="w-full bg-[#ffffff] border border-[#d2d2c8] focus:border-[#14140f] rounded-[28px] py-3.5 pr-11 pl-11 text-[#14140f] placeholder-[#6e6e64] text-sm font-normal outline-none transition-colors"
                        />
                        <Lock className="w-4 h-4 text-[#6e6e64] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e6e64] hover:text-[#14140f] transition-colors p-1"
                          aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 mt-2 rounded-[28px] bg-[#beff50] hover:bg-[#aef538] text-[#14140f] border border-[#14140f] font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>{isLogin ? 'تسجيل الدخول إلى الحساب' : 'إنشاء حساب جديد مجاناً'}</span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Card Footer: Terms & Privacy */}
              <div className="pt-4 border-t border-[#d2d2c8] text-center">
                <p className="text-[11px] text-[#6e6e64] font-normal leading-relaxed">
                  باستخدامك لمنصة TOLZY، فإنك توافق على{' '}
                  <Link href="/terms" className="text-[#14140f] font-medium underline underline-offset-2">
                    شروط الخدمة
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="text-[#14140f] font-medium underline underline-offset-2">
                    سياسة الخصوصية
                  </Link>.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ─── Simple Clean Footer ─── */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-[#6e6e64] font-normal border-t border-[#d2d2c8]/60 mt-12">
        <p>© {new Date().getFullYear()} TOLZY — جميع الحقوق محفوظة. المنصة العربية الرائدة للأدوات التقنية والذكاء الاصطناعي.</p>
      </footer>

    </div>
  );
};

export default AuthPage;

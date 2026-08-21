"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, Zap, Github, ArrowRight, CheckCircle2, Bot } from 'lucide-react';
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
      
      toast.success('تم إرسال رمز التحقق إلى بريدك');
      setPendingEmail(email);
      setShowEmailVerification(true);
      setOtp(['', '', '', '', '', '']);
      
      // Auto focus first OTP input
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
      
      if (!res.ok) throw new Error(data.error || 'الرمز غير صحيح');
      
      // Now complete signup
      const completeRes = await fetch('/api/auth/email-verify/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail })
      });
      const completeData = await completeRes.json();

      if (!completeRes.ok) throw new Error(completeData.error || 'فشل إنشاء الحساب');

      toast.success('تم تأكيد بريدك بنجاح! جاري تسجيل الدخول...');
      
      // Sign in user
      await signInWithEmail(pendingEmail, password);
      setTimeout(() => {
        window.location.href = getRedirectPath();
      }, 1000);

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

    // Move to next input
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto submit if all filled
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
        // Send OTP for email verification instead of direct signup
        await handleSendOTPForEmailVerification(e);
      }
    } catch (error) {
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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505] overflow-hidden relative font-sans selection:bg-indigo-500/30">
      
      {/* ─── Immersive Background ─── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-500/5 dark:bg-cyan-600/10 rounded-full blur-[100px] animate-bounce-slow" />
        
        {/* Fine grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.07] pointer-events-none" />
      </div>

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* ─── Left Side: Marketing/Value Prop ─── */}
        <div className="hidden lg:flex flex-col space-y-8 animate-fade-in-left">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="p-3 bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <img src="/tolzy-logo.svg" alt="Tolzy" className="w-10 h-10" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-white dark:to-slate-400">
              TOLZY
            </span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-[1.2] tracking-tight">
              {isLogin ? (
                <>ابدأ رحلتك الإبداعية <br /><span className="text-indigo-600 dark:text-indigo-400">بلمسة واحدة.</span></>
              ) : (
                <>انضم إلى مستقبل <br /><span className="text-indigo-600 dark:text-indigo-400">الذكاء الاصطناعي.</span></>
              )}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              منصة متكاملة للمطورين والمبدعين. ابنِ، تعلم، وتطور مع أدوات TOLZY المتطورة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { icon: <Sparkles className="w-5 h-5" />, label: "أدوات ذكية" },
              { icon: <Bot className="w-5 h-5" />, label: "مساعد Copilot" },
              { icon: <Zap className="w-5 h-5" />, label: "سرعة فائقة" },
              { icon: <CheckCircle2 className="w-5 h-5" />, label: "مجتمع تقني" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 backdrop-blur-sm overflow-hidden group hover:border-indigo-500/30 transition-colors">
                <div className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Side: Auth Card ─── */}
        <div className="w-full flex justify-center lg:justify-end animate-fade-in-right">
          <div className="w-full max-w-[460px] bg-white dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-100 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
            
            {/* Mode Switch Tab */}
            <div className="flex p-2 bg-slate-50 dark:bg-black/20 m-4 rounded-2xl">
              <button 
                onClick={() => { setIsLogin(true); }}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${isLogin && !showEmailVerification ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                تسجيل الدخول
              </button>
              <button 
                onClick={() => { setIsLogin(false); }}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${!isLogin && !showEmailVerification ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                حساب جديد
              </button>
            </div>

            <div className="p-8 pt-4 space-y-6">
              
              {showEmailVerification && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">تأكيد بريدك الإلكتروني</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">أرسلنا رمز التحقق إلى:</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/5 rounded-xl py-2 px-4">{pendingEmail}</p>
                  </div>

                  <form onSubmit={handleVerifyEmailOTP} className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 px-1 block mb-3">أدخل رمز التحقق المكون من 6 أرقام</label>
                      <div className="flex gap-2 justify-center">
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
                            onPaste={handlePaste}
                            className="w-12 h-12 text-center text-xl font-black rounded-xl bg-slate-100/50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black/40 transition-all outline-none text-slate-900 dark:text-white"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      id="verifyEmailBtn"
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          تأكيد الرمز
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailVerification(false);
                      setOtp(['', '', '', '', '', '']);
                      setPendingEmail('');
                      setEmail('');
                      setPassword('');
                      setFirstName('');
                      setLastName('');
                    }}
                    className="w-full text-center text-xs font-black text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    العودة للخلف
                  </button>

                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    لم تستقبل الرمز؟
                    <button 
                      type="button" 
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const res = await fetch('/api/auth/email-verify/send-otp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: pendingEmail, firstName, lastName, password })
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'فشل إرسال الرمز');
                          toast.success('تم إرسال رمز جديد إلى بريدك');
                          setOtp(['', '', '', '', '', '']);
                          setTimeout(() => { otpRefs.current[0]?.focus(); }, 100);
                        } catch (error: any) {
                          toast.error(error.message);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold mr-1"
                    >
                      أرسل مجدداً
                    </button>
                  </p>
                </div>
              )}

              {!showEmailVerification && (
                <>
                    <div className="space-y-4">
                      {/* GOOGLE PRIMARY Button */}
                      <div className="relative group">
                        <div className="absolute -top-3 right-4 z-20">
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                            الخيار الأسهل ⚡
                          </span>
                        </div>
                        <button
                          onClick={handleGoogleSignIn}
                          disabled={isLoading}
                          className="w-full relative flex items-center justify-center gap-4 py-4 rounded-2xl bg-white dark:bg-white text-slate-900 border-2 border-slate-200 dark:border-transparent hover:border-indigo-500 dark:hover:bg-slate-100 transition-all shadow-xl shadow-indigo-500/5 hover:shadow-indigo-500/10 active:scale-[0.98] group overflow-hidden"
                        >
                          <div className="relative z-10 flex items-center gap-3">
                            <GoogleIcon className="w-6 h-6" />
                            <span className="text-base font-black tracking-tight">المتابعة باستخدام Google</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/50 to-indigo-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>
                      </div>

                      {/* Other Socials (Subtle) */}
                      <button
                        onClick={handleGithubSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-bold"
                      >
                        <Github className="w-4 h-4" />
                        <span>أو عبر GitHub</span>
                      </button>

                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-100 dark:border-white/5"></div>
                        <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">أو البريد الإلكتروني</span>
                        <div className="flex-grow border-t border-slate-100 dark:border-white/5"></div>
                      </div>
                    </div>

                  {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3 animate-head-shake">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && !showEmailVerification && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 dark:text-slate-400 px-1">الاسم الأول</label>
                          <input
                            type="text"
                            disabled={showEmailVerification}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black/40 transition-all outline-none text-slate-900 dark:text-white text-sm font-bold disabled:opacity-50"
                            placeholder="محمد"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 dark:text-slate-400 px-1">الاسم الأخير</label>
                          <input
                            type="text"
                            disabled={showEmailVerification}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black/40 transition-all outline-none text-slate-900 dark:text-white text-sm font-bold disabled:opacity-50"
                            placeholder="العربي"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 px-1">البريد الإلكتروني</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="email"
                          disabled={showEmailVerification}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black/40 transition-all outline-none text-slate-900 dark:text-white text-sm font-bold disabled:opacity-50"
                          placeholder="alex@example.com"
                          dir="ltr"
                        />
                      </div>
                    </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-xs font-black text-slate-500 dark:text-slate-400">كلمة المرور</label>
                          {isLogin && (
                            <Link
                              href="/auth/forgot-password"
                              className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              نسيت كلمة المرور؟
                            </Link>
                          )}
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            disabled={showEmailVerification}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black/40 transition-all outline-none text-slate-900 dark:text-white text-sm font-bold disabled:opacity-50"
                            placeholder="••••••••"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                    <button
                      type="submit"
                      disabled={isLoading || showEmailVerification}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {isLogin ? 'تسجيل الدخول' : 'بدء الاستخدام مجاناً'}
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                بتسجيلك في TOLZY، أنت توافق على <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">شروط الخدمة</Link> و <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">سياسة الخصوصية</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-left { animation: fade-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in-right { animation: fade-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-bounce-slow { animation: bounce-slow 5s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default AuthPage;

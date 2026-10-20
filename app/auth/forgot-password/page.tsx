"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  ShieldCheck, 
  CheckCircle2,
  Check,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    
    // Form fields
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [confirmationOtp, setConfirmationOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const confirmOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error('يرجى إدخال البريد الإلكتروني');
        
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'فشل إرسال الرمز');
            
            toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
            setStep(2);
            
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 100);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtpOnly = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return toast.error('يرجى إدخال الرمز المكون من 6 أرقام');

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset/verify-otp-only', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'الرمز غير صحيح');
            
            toast.success('تم التحقق من الرمز بنجاح!');
            setStep(3);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset/send-confirmation-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'فشل إرسال رمز التأكيد');
            
            toast.success('تم إرسال رمز التأكيد الإضافي إلى بريدك');
            setStep(4);
            setConfirmationOtp(['', '', '', '', '', '']);
            
            setTimeout(() => {
                confirmOtpRefs.current[0]?.focus();
            }, 100);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyConfirmationOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const code = confirmationOtp.join('');
        if (code.length !== 6) return toast.error('يرجى إدخال الرمز المكون من 6 أرقام');

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset/verify-confirmation-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, confirmationOtp: code })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'الرمز غير صحيح');
            
            toast.success('تم تحديث كلمة المرور بنجاح! جاري تحويلك لتسجيل الدخول.');
            setTimeout(() => {
                router.push('/auth');
            }, 1200);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmationOtpChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;
        
        const newOtp = [...confirmationOtp];
        newOtp[index] = value;
        setConfirmationOtp(newOtp);

        if (value !== '' && index < 5) {
            confirmOtpRefs.current[index + 1]?.focus();
        }

        if (value !== '' && index === 5 && newOtp.every(v => v !== '')) {
            setTimeout(() => {
                document.getElementById('verifyConfirmBtn')?.click();
            }, 100);
        }
    };

    const handleConfirmationOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && confirmationOtp[index] === '' && index > 0) {
            confirmOtpRefs.current[index - 1]?.focus();
        }
    };

    const handleConfirmationOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newOtp = [...confirmationOtp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setConfirmationOtp(newOtp);
            if (pastedData.length === 6) {
                confirmOtpRefs.current[5]?.focus();
                setTimeout(() => {
                    document.getElementById('verifyConfirmBtn')?.click();
                }, 100);
            } else {
                confirmOtpRefs.current[pastedData.length]?.focus();
            }
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
                document.getElementById('verifyCodeBtn')?.click();
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
                    document.getElementById('verifyCodeBtn')?.click();
                }, 100);
            } else {
                otpRefs.current[pastedData.length]?.focus();
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5eb] text-[#14140f] flex flex-col justify-between selection:bg-[#beff50] selection:text-[#14140f] antialiased" dir="rtl">
            
            {/* Top Navigation */}
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
                    href="/auth" 
                    className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.05em] px-4 py-2 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-[#14140f] hover:border-[#14140f] transition-colors"
                >
                    <span>العودة لتسجيل الدخول</span>
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
            </header>

            {/* Main Recovery Form */}
            <main className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 flex-1 flex items-center justify-center">
                <div className="w-full bg-[#ffffff] border border-[#d2d2c8] rounded-[28px] p-6 sm:p-10 space-y-7">
                    
                    {/* Status Pill & Title */}
                    <div className="space-y-3 text-center">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium uppercase tracking-[0.1em] bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8]">
                            <span className="w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f]" />
                            <span>استعادة الحساب والأمان</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-[#14140f]">
                            إعادة تعيين كلمة المرور
                        </h1>

                        <p className="text-sm text-[#6e6e64] max-w-md mx-auto font-normal leading-relaxed">
                            {step === 1 && 'أدخل بريدك الإلكتروني المسجل لنرسل لك رمز أمان مكوّن من 6 أرقام.'}
                            {step === 2 && 'أدخل رمز التحقق المكوّن من 6 أرقام الذي وصلك على البريد الإلكتروني.'}
                            {step === 3 && 'قم بتعيين كلمة مرور جديدة قوية لحسابك لا تقل عن 6 أحرف.'}
                            {step === 4 && 'تم إرسال رمز تأكيد نهائي لتأكيد الحساب ومنع أي تغييرات غير مصرح بها.'}
                        </p>
                    </div>

                    {/* Step Visual Indicator (Perk Style Stepper) */}
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div 
                                key={s} 
                                className={`flex items-center justify-center text-xs font-mono font-medium rounded-full transition-all ${
                                    step === s
                                        ? 'w-8 h-8 bg-[#beff50] border border-[#14140f] text-[#14140f]'
                                        : step > s
                                            ? 'w-8 h-8 bg-[#14140f] text-[#ffffff] border border-[#14140f]'
                                            : 'w-8 h-8 bg-[#f5f5eb] text-[#6e6e64] border border-[#d2d2c8]'
                                }`}
                            >
                                {step > s ? '✓' : s}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Request OTP */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-5 animate-in fade-in duration-300">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#14140f] px-1 block">
                                    البريد الإلكتروني المسجل
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-[28px] bg-[#beff50] hover:bg-[#aef538] text-[#14140f] border border-[#14140f] font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>إرسال رمز التحقق</span>
                                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP Only */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtpOnly} className="space-y-6 animate-in fade-in duration-300">
                            <div dir="ltr" className="space-y-2">
                                <label className="text-xs font-medium text-[#14140f] block text-right px-1">
                                    رمز التحقق (OTP)
                                </label>
                                <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-mono font-medium rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] focus:outline-none focus:border-[#14140f] focus:bg-[#ffffff] transition-all"
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                id="verifyCodeBtn"
                                type="submit"
                                disabled={isLoading || otp.join('').length < 6}
                                className="w-full py-4 rounded-[28px] bg-[#beff50] hover:bg-[#aef538] text-[#14140f] border border-[#14140f] font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحقق من الرمز'}
                            </button>
                            
                            <div className="text-center text-xs text-[#6e6e64]">
                                لم يصلك الرمز؟{' '}
                                <button 
                                    type="button" 
                                    onClick={handleSendOTP} 
                                    className="text-[#14140f] font-medium underline underline-offset-2 hover:text-black"
                                >
                                    إعادة الإرسال
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Enter New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in duration-300">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#14140f] px-1 block">
                                    كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        dir="ltr"
                                        className="w-full bg-[#ffffff] border border-[#d2d2c8] focus:border-[#14140f] rounded-[28px] py-3.5 pr-4 pl-11 text-[#14140f] placeholder-[#6e6e64] text-sm font-normal outline-none transition-colors"
                                    />
                                    <KeyRound className="w-4 h-4 text-[#6e6e64] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <p className="text-[11px] text-[#6e6e64] px-1 pt-1 flex items-center gap-1 font-normal">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#14140f]" /> يجب أن تكون كلمة المرور 6 أحرف أو أرقام على الأقل.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-[28px] bg-[#beff50] hover:bg-[#aef538] text-[#14140f] border border-[#14140f] font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'متابعة وتأكيد التغيير'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Verify Confirmation OTP */}
                    {step === 4 && (
                        <form onSubmit={handleVerifyConfirmationOtp} className="space-y-6 animate-in fade-in duration-300">
                            <div className="p-4 rounded-[20px] bg-[#f5f5eb] border border-[#d2d2c8] flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#beff50] border border-[#14140f] flex items-center justify-center text-[#14140f] shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-medium text-[#14140f]">خطوة تأكيد أمني إضافية</p>
                                    <p className="text-[#6e6e64] mt-0.5">أدخل الرمز الإضافي لتأكيد ملكيتك للحساب وتفعيل كلمة المرور الجديدة.</p>
                                </div>
                            </div>

                            <div dir="ltr" className="space-y-2">
                                <label className="text-xs font-medium text-[#14140f] block text-right px-1">
                                    رمز التأكيد
                                </label>
                                <div className="flex gap-2 justify-between" onPaste={handleConfirmationOtpPaste}>
                                    {confirmationOtp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { confirmOtpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleConfirmationOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleConfirmationOtpKeyDown(index, e)}
                                            className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-mono font-medium rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] text-[#14140f] focus:outline-none focus:border-[#14140f] focus:bg-[#ffffff] transition-all"
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                id="verifyConfirmBtn"
                                type="submit"
                                disabled={isLoading || confirmationOtp.join('').length < 6}
                                className="w-full py-4 rounded-[28px] bg-[#beff50] hover:bg-[#aef538] text-[#14140f] border border-[#14140f] font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'تأكيد كلمة المرور والدخول'
                                )}
                            </button>
                            
                            <div className="text-center text-xs text-[#6e6e64]">
                                لم يصلك الرمز؟{' '}
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsLoading(true);
                                        fetch('/api/auth/reset/send-confirmation-otp', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email, newPassword })
                                        }).then(async (res) => {
                                            const data = await res.json();
                                            if (res.ok) {
                                                toast.success('تم إعادة إرسال الرمز بنجاح');
                                                setConfirmationOtp(['', '', '', '', '', '']);
                                                setTimeout(() => confirmOtpRefs.current[0]?.focus(), 100);
                                            } else {
                                                toast.error(data.error);
                                            }
                                        }).finally(() => setIsLoading(false));
                                    }} 
                                    className="text-[#14140f] font-medium underline underline-offset-2 hover:text-black"
                                >
                                    إعادة الإرسال
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </main>

            {/* Simple Footer */}
            <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-[#6e6e64] font-normal border-t border-[#d2d2c8]/60 mt-8">
                <p>© {new Date().getFullYear()} TOLZY — دليل ومحرك بحث الأدوات التقنية والكورسات.</p>
            </footer>

        </div>
    );
}

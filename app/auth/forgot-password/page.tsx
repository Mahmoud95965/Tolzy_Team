"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
            
            toast.success('تم إرسال رمز التحقق إلى بريدك');
            setStep(2);
            
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
            
            toast.success('تم التأكد من الرمز بنجاح!');
            setStep(3); // Move to password reset step
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
            
            toast.success('تم إرسال رمز التأكيد إلى بريدك');
            setStep(4); // Move to confirmation OTP step
            setConfirmationOtp(['', '', '', '', '', '']);
            
            // Auto focus first OTP input
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
            
            toast.success('تم تحديث كلمة المرور بنجاح! يمكنك الدخول الآن.');
            setTimeout(() => {
                router.push('/auth?mode=login');
            }, 1500);
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

        // Move to next input
        if (value !== '' && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto submit if all filled
        if (value !== '' && index === 5 && newOtp.every(v => v !== '')) {
            setTimeout(() => {
                // To avoid calling while the state is just updating
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center p-4 dir-rtl" dir="rtl">
            <div className="max-w-md w-full bg-white dark:bg-[#111] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5 p-8 relative">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="relative z-10">
                    <Link href="/auth" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-8">
                        <ArrowRight className="w-4 h-4 ml-2" />
                        العودة لتسجيل الدخول
                    </Link>

                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">استعادة الحساب</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                        {step === 1 && 'أدخل بريدك الإلكتروني ليتم إرسال رمز أمان مكون من 6 أرقام.'}
                        {step === 2 && 'أدخل الرمز المكون من 6 أرقام الذي أرسلناه للتو إلى بريدك.'}
                        {step === 3 && 'ممتاز! الآن قم بتعيين كلمة مرور جديدة وقوية لحسابك.'}
                        {step === 4 && 'تم إرسال رمز تأكيد إضافي إلى بريدك الإلكتروني. أدخله لتأكيد تغيير كلمة المرور.'}
                    </p>

                    {/* Step 1: Request OTP */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني</label>
                                <div className="relative border-b border-transparent focus-within:border-indigo-500 transition-colors">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-4 pl-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-medium"
                                        placeholder="name@example.com"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-70 group"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        إرسال الرمز إليّ
                                        <ArrowRight className="w-5 h-5 mr-2 rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP Only */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtpOnly} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div dir="ltr">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 text-right">رمز التحقق (OTP)</label>
                                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className={`w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-center text-2xl font-black bg-slate-50 dark:bg-[#0a0a0a] border ${digit ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-white/10'} rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                id="verifyCodeBtn"
                                type="submit"
                                disabled={isLoading || otp.join('').length < 6}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تحقق من الرمز'}
                            </button>
                            
                            <p className="text-center text-sm font-medium text-slate-500">
                                لم يصلك الرمز؟ <button type="button" onClick={handleSendOTP} className="text-indigo-600 font-bold hover:underline">إعادة الإرسال</button>
                            </p>
                        </form>
                    )}

                    {/* Step 3: Enter New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">كلمة المرور الجديدة</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl py-4 px-4 pl-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-left font-black tracking-widest text-lg"
                                        placeholder="••••••••"
                                        dir="ltr"
                                    />
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                                </div>
                                <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> استخدم 6 أحرف أو أرقام على الأقل.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-xl shadow-emerald-500/30 active:scale-95 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'حفظ كلمة المرور والدخول'}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Verify Confirmation OTP */}
                    {step === 4 && (
                        <form onSubmit={handleVerifyConfirmationOtp} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-500/30 flex gap-3">
                                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-bold text-blue-900 dark:text-blue-300">خطوة أمان إضافية</p>
                                    <p className="text-blue-700 dark:text-blue-400 text-xs mt-1">نحن نطلب رمز تأكيد إضافي لحماية حسابك</p>
                                </div>
                            </div>

                            <div dir="ltr">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 text-right">رمز التأكيد</label>
                                <div className="flex justify-between gap-2" onPaste={handleConfirmationOtpPaste}>
                                    {confirmationOtp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { confirmOtpRefs.current[index] = el; }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleConfirmationOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleConfirmationOtpKeyDown(index, e)}
                                            className={`w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-center text-2xl font-black bg-blue-50 dark:bg-blue-900/20 border ${digit ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-white/10'} rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                id="verifyConfirmBtn"
                                type="submit"
                                disabled={isLoading || confirmationOtp.join('').length < 6}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg flex items-center justify-center transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'تأكيد تغيير كلمة المرور'}
                            </button>
                            
                            <p className="text-center text-sm font-medium text-slate-500">
                                لم يصلك الرمز؟ <button type="button" onClick={() => {
                                    setIsLoading(true);
                                    fetch('/api/auth/reset/send-confirmation-otp', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email, newPassword })
                                    }).then(async (res) => {
                                        const data = await res.json();
                                        if (res.ok) {
                                            toast.success('تم إعادة الإرسال');
                                            setConfirmationOtp(['', '', '', '', '', '']);
                                            setTimeout(() => confirmOtpRefs.current[0]?.focus(), 100);
                                        } else {
                                            toast.error(data.error);
                                        }
                                    }).finally(() => setIsLoading(false));
                                }} className="text-blue-600 font-bold hover:underline">إعادة الإرسال</button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

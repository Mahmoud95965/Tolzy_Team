"use client";
import React, { useState, useEffect } from "react";
import {
    getMultiFactorResolver,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier,
    multiFactor
} from "firebase/auth";
import { auth } from "@/src/config/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { ShieldCheck, Phone, AlertTriangle, CheckCircle, Loader } from "lucide-react";

export default function MFASetup() {
    const { user, isAdmin } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [step, setStep] = useState<"init" | "verify">("init");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

    useEffect(() => {
        if (!auth) return;
        try {
            const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
            setRecaptchaVerifier(verifier);
        } catch (e) {
            console.error("Recaptcha init error:", e);
        }
    }, []);

    if (!isAdmin || user?.email !== "mahmoud.m.moussa5310@gmail.com") {
        return null; // Hides component for non-admins
    }

    const sendVerificationCode = async () => {
        if (!user || !recaptchaVerifier) return;
        setLoading(true);
        setMessage(null);

        try {
            const session = await multiFactor(user).getSession();
            const phoneOptions = {
                phoneNumber,
                session,
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneAuthProvider.verifyPhoneNumber(
                phoneOptions,
                recaptchaVerifier
            );
            setVerificationId(verificationId);
            setStep("verify");
            setMessage({ type: "success", text: "تم إرسال رمز التحقق إلى هاتفك" });
        } catch (error: any) {
            console.error(error);
            setMessage({ type: "error", text: error.message || "فشل إرسال الرمز" });
        } finally {
            setLoading(false);
        }
    };

    const verifyCodeAndEnroll = async () => {
        if (!user || !verificationCode || !verificationId) return;
        setLoading(true);
        setMessage(null);

        try {
            const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

            await multiFactor(user).enroll(multiFactorAssertion, "Phone Number");

            setMessage({ type: "success", text: "تم تفعيل المصادقة الثنائية بنجاح!" });
            setStep("init");
            setPhoneNumber("");
            setVerificationCode("");
        } catch (error: any) {
            console.error(error);
            setMessage({ type: "error", text: error.message || "رمز التحقق غير صحيح" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        المصادقة الثنائية (MFA)
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        تأمين حساب المسؤول بطبقة حماية إضافية
                    </p>
                </div>
            </div>

            <div id="recaptcha-container"></div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            {step === "init" ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            رقم الهاتف
                        </label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+201xxxxxxxxx"
                                dir="ltr"
                                className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">يجب إدخال الرقم مع كود الدولة (مثال: +20)</p>
                    </div>

                    <button
                        onClick={sendVerificationCode}
                        disabled={loading || !phoneNumber}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : "إرسال رمز التحقق"}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            رمز التحقق
                        </label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="123456"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest text-lg"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep("init")}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
                        >
                            رجوع
                        </button>
                        <button
                            onClick={verifyCodeAndEnroll}
                            disabled={loading || !verificationCode}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : "تفعيل الحماية"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

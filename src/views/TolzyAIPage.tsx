"use client";

import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import SEO from '../components/SEO';
import { Beaker, Bot, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { subscribeToNewsletter } from '../services/newsletter.service';
import { toast } from 'react-hot-toast';

const TolzyAIPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            toast.error('الرجاء إدخال بريد إلكتروني صحيح');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await subscribeToNewsletter(email, 'tolzy-ai-page');

            if (response.success) {
                toast.success(response.message);
                setEmail(''); // Clear input on success
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع. حاول مرة أخرى.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageLayout>
            <SEO
                title="Tolzy AI - بوابة الذكاء الاصطناعي"
                description="مختبر تولزي للذكاء الاصطناعي. استكشف أحدث تقنيات ونماذج AI في مكان واحد."
                keywords="tolzy ai, ذكاء اصطناعي, نماذج, تجارب, ابتكار"
            />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">

                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">

                    {/* Hero Section */}
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 animate-fade-in-up">
                            <Beaker className="w-4 h-4" />
                            <span>مختبر الابتكار</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight animate-fade-in-up delay-100">
                            مستقبل <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">الذكاء الاصطناعي</span><br />بين يديك
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed animate-fade-in-up delay-200">
                            نحن نبني الجيل القادم من أدوات الذكاء الاصطناعي لمساعدتك على الإنجاز والتعلم والابتكار بشكل أسرع.
                        </p>

                        <div className="flex items-center justify-center gap-4 animate-fade-in-up delay-300">
                            <a href="/copilot" className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-105 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                <Bot className="w-5 h-5" />
                                جرب Copilot الآن
                            </a>
                            <a href="#features" className="px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                اكتشف المزيد
                            </a>
                        </div>
                    </div>

                    {/* Copilot Featured Section */}
                    <div className="mb-24 animate-fade-in-up delay-500">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 rounded-[1.5rem] p-8 md:p-12 overflow-hidden">
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-8">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-semibold border border-indigo-100 dark:border-indigo-800">
                                            <Sparkles className="w-4 h-4" />
                                            <span>المنتج المميز</span>
                                        </div>

                                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                            Tolzy <span className="text-indigo-600 dark:text-indigo-400">Copilot</span>
                                        </h2>

                                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                            مساعدك الشخصي الذكي. يمكنه الإجابة عن أسئلتك، مساعدتك في كتابة الأكواد، وتلخيص المحتوى المعقد. تجربة محادثة طبيعية وسلسة مدعومة بأحدث نماذج اللغة.
                                        </p>

                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                                                <MessageSquare className="w-5 h-5 text-indigo-500" />
                                                <span>محادثة طبيعية</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                                                <Bot className="w-5 h-5 text-purple-500" />
                                                <span>ذكاء متطور</span>
                                            </div>
                                        </div>

                                        <a href="/copilot" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg hover:gap-3 transition-all group-hover/link">
                                            <span>ابدأ المحادثة</span>
                                            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                                        </a>
                                    </div>

                                    {/* Abstract Visual / Interactive Demo Placeholder */}
                                    <div className="relative h-[300px] md:h-[400px] bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center p-8">
                                        {/* Chat Bubble Simulation */}
                                        <div className="w-full max-w-sm space-y-4">
                                            <div className="flex gap-3 justify-end items-end animate-pulse">
                                                <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-br-none shadow-lg">
                                                    كيف يمكنك مساعدتي اليوم؟
                                                </div>
                                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                                            </div>
                                            <div className="flex gap-3 items-end">
                                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-200 dark:border-indigo-700">
                                                    <Bot className="w-5 h-5" />
                                                </div>
                                                <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-600">
                                                    أهلاً بك! أنا Tolzy Copilot. يمكنني مساعدتك في البحث، البرمجة، التحليل، والمزيد. بماذا نبدأ؟
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid (Coming Soon) */}
                    <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        {/* Feature 1 */}
                        <div className="group p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 10.5"></path><path d="M12 12V21.5"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">تحليل البيانات الذكي</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                أدوات متقدمة لتحليل البيانات واستخراج الرؤى المعقدة في ثوانٍ معدودة.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">توليد المحتوى</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                محركات توليد نصوص وصور فائقة الدقة لمساعدتك في العمليات الإبداعية.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">مساعد شخصي</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                مساعد ذكي يفهم سياق عملك ويقدم اقتراحات مخصصة في الوقت الفعلي.
                            </p>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 Mix-blend-overlay"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4">كن أول من يعلم</h2>
                            <p className="text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                                انضم لقائمتنا البريدية لنرسل لك تنبيهاً فور إطلاق الأدوات الجديدة. لا نرسل رسائل مزعجة.
                            </p>
                            <form
                                onSubmit={handleNewsletterSubmit}
                                className="flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-md mx-auto bg-white/10 sm:p-1.5 p-2 rounded-2xl backdrop-blur-sm border border-white/20"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="بريدك الإلكتروني"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-transparent border-none text-white placeholder-indigo-200 px-4 py-2.5 sm:py-0 focus:ring-0 focus:outline-none disabled:opacity-50 text-sm sm:text-base rounded-xl sm:rounded-none"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    {isSubmitting ? 'جاري الإرسال...' : 'اشتراك'}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </PageLayout>
    );
};

export default TolzyAIPage;

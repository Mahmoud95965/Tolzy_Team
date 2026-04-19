"use client";
import { useState } from 'react';
import {
    Sparkles, MessageSquare, Search, Zap, Shield, Globe,
    ChevronDown, Command
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateCopilotSEO } from '@/src/utils/seoHelpers';

const FeaturesCopilotPage = () => {
    const router = useRouter();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const features = [
        {
            icon: Search,
            title: 'بحث ذكي وسريع',
            description: 'لا مزيد من البحث التقليدي. احصل على الأدوات التي تحتاجها بالضبط من خلال وصف حاجتك فقط.'
        },
        {
            icon: MessageSquare,
            title: 'محادثة طبيعية',
            description: 'تحدث مع Copilot كأنك تتحدث مع خبير. يفهم السياق، اللهجات، والأسئلة المعقدة.'
        },
        {
            icon: Globe,
            title: 'دعم متعدد اللغات',
            description: 'سواء كنت تسأل بالعربية أو الإنجليزية، ستحصل على إجابات دقيقة بنفس اللغة.'
        },
        {
            icon: Shield,
            title: 'موثوق وآمن',
            description: 'نقدم لك أدوات تم التحقق منها، مع روابط مباشرة وتفاصيل دقيقة عن كل أداة.'
        },
        {
            icon: Zap,
            title: 'هندسة الأوامر (Prompt Engineering)',
            description: 'نساعدك في صياغة أفضل الأوامر الاحترافية للحصول على أقصى استفادة من نماذج الذكاء الاصطناعي الأخرى.'
        },
        {
            icon: Command,
            title: 'بناء مسارات العمل (Workflows)',
            description: 'لا تسأل عن أداة واحدة فقط. اطلب خطة لمشروعك، وسيقوم Copilot ببناء مسار عمل كامل مقسّم للخطوات والأدوات.'
        }
    ];

    const faqs = [
        {
            question: 'هل الخدمة مجانية؟',
            answer: 'نعم، Tolzy Copilot متاح مجاناً بالكامل حالياً لجميع المستخدمين.'
        },
        {
            question: 'كيف يمكنني البدء؟',
            answer: 'فقط اضغط على زر "جرب Copilot" وابدأ المحادثة مباشرة. لا حاجة لضبط إعدادات معقدة.'
        },
        {
            question: 'هل يمكنني استخدامه على الهاتف؟',
            answer: 'بالتأكيد. تم تصميم الواجهة لتعمل بسلاسة على جميع الأجهزة والهواتف الذكية.'
        },
        {
            question: 'ما مدى دقة المعلومات؟',
            answer: 'يعتمد Copilot على قاعدة بيانات ضخمة ومحدثة، بالإضافة إلى نماذج ذكاء اصطناعي متطورة لضمان دقة الاقتراحات.'
        }
    ];

    const seoData = generateCopilotSEO();

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0C15] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.structuredData) }}
            />
            {/* Navbar Placeholder (Optional if layout handles it) */}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Subtle Background Glow - One Color */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] -z-10" />

                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        متاح الآن للتجربة
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900 dark:text-white">
                        مستقبـل البحـث عـن <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                            أدوات الذكاء الاصطناعي
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        لا داعي للبحث لساعات. أخبر Tolzy Copilot بما تريد تحقيقه، وسيقوم هو بالباقي.
                        أذكى، أسرع، وأكثر دقة.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push('/copilot')}
                            className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-semibold hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            ابدأ المحادثة مجاناً
                        </button>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            اكتشف المميزات
                        </button>
                    </div>
                </div>

                {/* Minimalist Demo UI Image */}
                <div className="mt-20 max-w-5xl mx-auto">
                    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121420] shadow-2xl shadow-indigo-500/10 overflow-hidden transform hover:-translate-y-1 transition-transform duration-500">
                        {/* Browser Header */}
                        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#121420]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-1 rounded-full text-xs text-slate-500 flex items-center gap-2 mx-auto">
                                <Shield className="w-3 h-3" />
                                Tolzy Copilot Secure Chat
                            </div>
                        </div>

                        {/* Image Placeholder */}
                        <div className="relative w-full aspect-[16/10] bg-slate-50 dark:bg-slate-900 overflow-hidden group">
                            <div className="relative w-full h-full">
                                <img
                                    src="/image/copilot-chat.png"
                                    alt="Tolzy Copilot Interface"
                                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-slate-100', 'dark:bg-slate-800');
                                            const div = document.createElement('div');
                                            div.className = 'text-slate-400 font-medium';
                                            div.innerText = 'Unable to load preview image';
                                            target.parentElement.appendChild(div);
                                        }
                                    }}
                                />
                                {/* Overlay Gradient for seamless blend */}
                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0B0C15] via-transparent to-transparent opacity-10 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid - Clean & Minimal */}
            <section id="features" className="py-24 px-6 bg-slate-50 dark:bg-[#0F1019]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">كل ما تحتاجه في مكان واحد</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            تم تصميم Tolzy Copilot ليكون مساعدك الشخصي الذكي، مع التركيز على السرعة والدقة.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="p-8 rounded-2xl bg-white dark:bg-[#151725] border border-slate-100 dark:border-slate-800 hover:border-indigo-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors text-slate-700 dark:text-slate-300">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Minimal FAQ */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">أسئلة شائعة</h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-slate-200 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between py-4 text-right hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <span className="text-lg font-medium text-slate-900 dark:text-white">{faq.question}</span>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Clean CTA */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 dark:bg-indigo-600 rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">جاهز لتجربة البحث الذكي؟</h2>
                        <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                            انضم للمستقبل واستكشف عالم الذكاء الاصطناعي بطريقة لم تعهدها من قبل. مجاناً وبدون تعقيدات.
                        </p>
                        <button
                            onClick={() => router.push('/copilot')}
                            className="bg-white text-slate-900 dark:text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-2xl"
                        >
                            ابدأ الآن
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer Simple */}
            <footer className="py-10 text-center text-slate-500 text-sm border-t border-slate-100 dark:border-slate-900">
                <p>© 2025 Tolzy Team. جميع الحقوق محفوظة.</p>
            </footer>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default FeaturesCopilotPage;

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons: Material Symbols Outlined
import { useRouter } from 'next/navigation';

const OnboardingModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inTour, setInTour] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const hasSeenIntro = localStorage.getItem('has_seen_copilot_intro_v6');
        if (!hasSeenIntro) {
            const timer = setTimeout(() => setIsOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('has_seen_copilot_intro_v6', 'true');
        setIsOpen(false);
    };

    const handleStartNow = () => {
        handleClose();
        router.push('/copilot');
    };

    const startTour = () => {
        setInTour(true);
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            handleStartNow();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        } else {
            setInTour(false);
        }
    };

    if (!isOpen) return null;

    const tourSteps = [
        {
            title: "فهم عميق للسياق",
            desc: "Copilot لا يجيب فقط، بل يفهم ما تحاول بناءه. تحدث معه وكأنه شريكك في المشروع.",
            icon: <span className="material-symbols-outlined text-[80px] text-blue-600" style={{fontSize:'80px'}}>auto_awesome</span>,
        },
        {
            title: "توجيه ذكي",
            desc: "هل أنت تائه وسط مئات الأدوات؟ نحن نرشدك خطوة بخطوة للأداة التي تناسب ميزانيتك وخبرتك.",
            icon: <span className="material-symbols-outlined text-[80px] text-purple-600" style={{fontSize:'80px'}}>map</span>,
        },
        {
            title: "أمان وموثوقية",
            desc: "جميع الاقتراحات تأتي من قاعدة بيانات Tolzy الموثقة. لا روابط خارجية مشبوهة أو أدوات وهمية.",
            icon: <span className="material-symbols-outlined text-[80px] text-green-600" style={{fontSize:'80px'}}>check_circle</span>,
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-white text-slate-900 font-sans overflow-hidden flex flex-col items-center justify-center">

                    {/* Background Grid - Subtle Modern Touch */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

                    {/* Corner Controls */}
                    <button
                        onClick={handleClose}
                        className="absolute top-8 left-8 p-4 bg-slate-50 hover:bg-slate-100 rounded-full transition-all group z-50 border border-slate-100"
                    >
                        <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover:text-slate-800">close</span>
                    </button>

                    <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
                        <span className="font-bold text-lg tracking-wide text-slate-800">Tolzy Copilot</span>
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!inTour ? (
                            /* HERO VIEW - Distributed Layout */
                            <motion.div
                                key="hero"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full p-8 md:p-16 flex flex-col justify-between relative max-w-[1600px] mx-auto"
                            >
                                {/* Center Content: Headline & Logo */}
                                <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="mb-8"
                                    >
                                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                                            <span className="material-symbols-outlined text-[64px] text-white" style={{fontSize:'64px'}}>smart_toy</span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                    >
                                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-6 relative inline-block">
                                            مرحـباً بالمستقبل
                                            {/* Decorative shine */}
                                            <span className="absolute -top-10 -right-10 text-4xl animate-pulse">✨</span>
                                        </h1>
                                        <p className="text-2xl md:text-3xl text-slate-400 font-light max-w-3xl mx-auto leading-normal mt-4">
                                            مساعدك الذكي لاكتشاف أدوات الذكاء الاصطناعي.<br />
                                            <span className="text-slate-600 font-medium">أسرع، أدق، وأكثر ذكاءً.</span>
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Floating Elements (Distributed) */}
                                <div className="absolute inset-0 pointer-events-none hidden md:block">
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute left-[5%] top-[25%] opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[44px] text-blue-300" style={{fontSize:'44px'}}>auto_awesome</span>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 20, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        className="absolute right-[5%] bottom-[30%] opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[44px] text-purple-300" style={{fontSize:'44px'}}>bolt</span>
                                    </motion.div>
                                </div>

                                {/* Bottom: Spaced Actions */}
                                <div className="flex flex-col md:flex-row justify-between items-end w-full gap-8 z-20">
                                    <div className="text-slate-400 text-sm hidden md:block">
                                        <p>Tolzy New Era</p>
                                        <p>Powered by Gemini Pro</p>
                                    </div>

                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button
                                            onClick={startTour}
                                            className="flex-1 md:flex-none px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all text-center"
                                        >
                                            جولة تعريفية
                                        </button>
                                        <button
                                            onClick={handleStartNow}
                                            className="flex-1 md:flex-none px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                                        >
                                            ابدأ فوراً
                                            <span className="material-symbols-outlined text-[18px]">bolt</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            /* TOUR VIEW - Panoramic Layout */
                            <motion.div
                                key="tour"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full flex flex-col justify-between p-8 md:p-16 max-w-[1600px] mx-auto relative"
                            >
                                {/* Progress Bar Top */}
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-12">
                                    <motion.div
                                        className="h-full bg-slate-900"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>

                                {/* Main Content - Centered */}
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ y: 50, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -50, opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="max-w-4xl"
                                        >
                                            <div className="mb-12 inline-block p-10 bg-slate-50 border border-slate-100 rounded-[3rem] shadow-sm">
                                                {tourSteps[currentStep].icon}
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8">
                                                {tourSteps[currentStep].title}
                                            </h2>
                                            <p className="text-xl md:text-3xl text-slate-500 leading-relaxed font-light">
                                                {tourSteps[currentStep].desc}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Floating Navigation Controls */}
                                <div className="flex justify-between items-center pt-12">
                                    <button
                                        onClick={prevStep}
                                        className={`p-4 rounded-full hover:bg-slate-100 transition-colors ${!inTour && 'opacity-0'}`}
                                    >
                                        <span className="material-symbols-outlined text-[30px] text-slate-400">chevron_left</span>
                                    </button>

                                    <div className="flex gap-3">
                                        {tourSteps.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`transition-all duration-300 rounded-full ${idx === currentStep
                                                    ? 'w-4 h-4 bg-slate-900'
                                                    : 'w-2 h-2 bg-slate-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={nextStep}
                                        className="p-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 hover:scale-110 transition-all shadow-lg"
                                    >
                                        {currentStep === tourSteps.length - 1 ? <span className="material-symbols-outlined text-[30px]">bolt</span> : <span className="material-symbols-outlined text-[30px]">chevron_right</span>}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OnboardingModal;

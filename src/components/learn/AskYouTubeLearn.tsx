"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Youtube, Sparkles, Send, RefreshCw, CheckCircle2, 
    FileText, Code2, Check, HelpCircle, AlertCircle, 
    ArrowLeft, Info, Play, ChevronLeft, Award, CornerDownLeft, X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    isQuiz?: boolean;
    quizQuestions?: QuizQuestion[];
    isSummary?: boolean;
    isConcepts?: boolean;
    timestamp: Date;
}

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

const DEFAULT_SUGGESTIONS = [
    {
        title: "دورة Next.js 15 الشاملة بالعربية",
        url: "https://www.youtube.com/watch?v=843nec-IvW0",
        tag: "ويب 🛠️"
    },
    {
        title: "مقدمة في الذكاء الاصطناعي وبناء الـ LLMs",
        url: "https://www.youtube.com/watch?v=mEsleV16qdo",
        tag: "ذكاء اصطناعي 🧠"
    },
    {
        title: "أساسيات تصميم واجهات المستخدم UI/UX",
        url: "https://www.youtube.com/watch?v=c9Wg6Ry_YWI",
        tag: "تصميم 🎨"
    }
];

const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        question: "ما هو المبدأ الأساسي للـ React Server Components (RSC)؟",
        options: [
            "تسهيل التفاعل المباشر مع DOM في المتصفح فقط",
            "معالجة ورسم المكونات بالكامل على الخادم لتقليل حجم حزم JavaScript المرسلة للعميل",
            "استبدال مكتبة Tailwind CSS بالكامل بمحرك معالجة جديد",
            "تمكين التخزين المؤقت للبيانات تلقائياً على أجهزة المستخدمين"
        ],
        correctIndex: 1,
        explanation: "مكونات خادم React (RSC) تسمح بإنشاء المكونات وتشغيلها على الخادم، مما يعني إرسال كمية أقل بكثير من الـ JS للمتصفح، وبالتالي تحسين الأداء ووقت التحميل بشكل كبير."
    },
    {
        id: 2,
        question: "كيف يساهم الـ RAG (Retrieval-Augmented Generation) في تحسين ردود المساعد الذكي؟",
        options: [
            "عبر زيادة حجم النموذج اللغوي الأساسي بمقدار الضعف",
            "عبر توليد رسومات بيانية ذكية للفيديو بشكل تلقائي",
            "عبر استرجاع نصوص دقيقة من تفريغ الفيديو وتزويد النموذج بها كمرجع، مما يمنع الهلوسة ويضمن دقة الإجابات",
            "عبر تشغيل الفيديو بسرعة مضاعفة لاستخلاص المحتوى تلقائياً"
        ],
        correctIndex: 2,
        explanation: "تقنية الـ RAG تقوم بالبحث في تفريغ محتوى الفيديو المكتوب وتمرر الفقرات الأكثر صلة لسؤال المستخدم إلى الذكاء الاصطناعي كمرجع سياقي، مما يضمن دقة عالية جداً مبنية على الفيديو مباشرةً."
    },
    {
        id: 3,
        question: "أي من الخصائص التالية تعتبر ضرورية للحصول على تصميم زجاجي (Glassmorphism) متميز في Tailwind CSS؟",
        options: [
            "الدمج بين bg-opacity خفيفة و backdrop-blur ومحددات الحدود الشفافة مثل border-white/10",
            "استخدام خلفية سوداء داكنة معتمة تماماً shadow-2xl",
            "إلغاء خاصية overflow بالكامل من الحاوية",
            "استخدام ألوان نيون ساطعة كخلفية أساسية للمكون"
        ],
        correctIndex: 0,
        explanation: "التصميم الزجاجي المتميز يعتمد على شفافية الخلفية (bg-opacity)، وضبابية ما خلفها (backdrop-blur)، وحدود بيضاء رفيعة جداً بشفافية عالية (border-white/10) لمحاكاة حواف الزجاج الحقيقي."
    }
];
interface AskYouTubeLearnProps {
    onStateChange?: (isActive: boolean) => void;
    isForceOpen?: boolean;
    onCloseForceOpen?: () => void;
}

// Helper to format message content: replaces weird bullet characters (o, ◦, •, *) at the start of a line
// with standard markdown bullets (- ) to ensure ReactMarkdown renders them as proper bullet lists.
const formatMessageContent = (text: string) => {
    if (!text) return '';
    return text
        .replace(/^([ \t]*)[o◦•*][ \t]+/gm, '$1- ')
        .replace(/\\n/g, '\n');
};

export default function AskYouTubeLearn({ onStateChange, isForceOpen, onCloseForceOpen }: AskYouTubeLearnProps) {
    const { user, userProfile } = useAuth();
    const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
    const isPro = normalizedPlan.includes('pro') || normalizedPlan.includes('max') || normalizedPlan.includes('ultra') || normalizedPlan.includes('admin') || userProfile?.role === 'admin';

    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isBarOpen, setIsBarOpen] = useState(false);
    
    // Chat states
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Quiz Interactive State
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
    
    // Educational Search States
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounced YouTube Educational Search Hook
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            const trimmedUrl = youtubeUrl.trim();
            if (trimmedUrl && !getYoutubeId(trimmedUrl) && trimmedUrl.length > 2) {
                setIsSearching(true);
                setShowSuggestions(true);
                try {
                    const res = await fetch(`/api/learn/search-youtube?q=${encodeURIComponent(trimmedUrl)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data.videos || []);
                    }
                } catch (e) {
                    console.error('Failed to search YouTube:', e);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [youtubeUrl]);

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const [metadata, setMetadata] = useState<{
        title: string;
        channel: string;
        duration: string;
        views: string;
        rating: string;
        description: string;
        topics: string[];
    } | null>(null);

    // Auto-detect URL query parameter and trigger force-open or auto-analyze
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const ytUrl = searchParams.get('youtubeUrl');
            if (ytUrl) {
                const decodedUrl = decodeURIComponent(ytUrl);
                setYoutubeUrl(decodedUrl);
                setIsBarOpen(true);
                const extractedId = getYoutubeId(decodedUrl);
                if (extractedId) {
                    setVideoId(extractedId);
                    startAnalysis(extractedId, decodedUrl);
                }
            }
        }
    }, []);

    // Handle isForceOpen trigger from parent page (e.g. CommandPalette)
    useEffect(() => {
        if (isForceOpen) {
            setIsBarOpen(true);
            if (onCloseForceOpen) onCloseForceOpen();
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isForceOpen]);

    const handleUrlSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');
        setShowSuggestions(false);
        
        const extractedId = getYoutubeId(youtubeUrl);
        if (!extractedId) {
            setError('الرجاء إدخال رابط يوتيوب صحيح');
            return;
        }

        setVideoId(extractedId);
        startAnalysis(extractedId, youtubeUrl);
    };

    const handleSuggestionClick = (url: string) => {
        setYoutubeUrl(url);
        setError('');
        setShowSuggestions(false);
        const extractedId = getYoutubeId(url);
        if (extractedId) {
            setVideoId(extractedId);
            startAnalysis(extractedId, url);
        }
    };

    const startAnalysis = async (id: string, url: string) => {
        setIsProcessing(true);
        if (onStateChange) onStateChange(true);
        setProcessingStep(0);

        try {
            // Step 0: Connecting & Scraping
            setProcessingStep(0);
            
            const response = await fetch('/api/learn/fetch-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, userId: user?.uid })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'فشل معالجة الفيديو واستخراج النص المكتوب');
            }

            const data = await response.json();
            
            // Step 1: Parsing & Temporal Chunking
            setProcessingStep(1);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Set metadata dynamically from the server response
            setMetadata({
                title: data.course.title || "درس تعليمي متميز",
                channel: data.course.channel || "مساعد التعلم الذكي لـ Tolzy",
                duration: `${data.course.duration} دقيقة` || "35:00 دقيقة",
                views: "تحليل RAG مخصص",
                rating: "4.9 ⭐",
                description: data.course.description || "تم تحليل هذا الفيديو بنجاح وفهرسة نصوصه بدقة.",
                topics: data.course.topics && data.course.topics.length > 0 ? data.course.topics : ["تعلم ذكي 🧠"]
            });

            // Step 2: Finalizing AI agent
            setProcessingStep(2);
            await new Promise(resolve => setTimeout(resolve, 800));

            setIsProcessing(false);
            setIsAnalyzed(true);
            setProcessingStep(3);

            // Add initial welcome message
            setMessages([
                {
                    id: 'welcome',
                    sender: 'ai',
                    text: `أهلاً بك في منصة التعلم الذكية! لقد قمت بتحليل هذا الفيديو بنجاح واستخراج التفريغ الصوتي وفهرسة المفاهيم البرمجية لـ **"${data.course.title}"**. 🧠⚡\n\nأنا الآن جاهز للإجابة على جميع استفساراتك حول هذا المحتوى بدقة متناهية. يمكنك سؤالي بشكل مباشر أو استخدام أزرار التحكم السريع بالأسفل لتوليد ملخصات أو اختبارات تفاعلية.`,
                    timestamp: new Date()
                }
            ]);

        } catch (err: any) {
            console.error('Fetch Video API failed:', err);
            setError(err.message || 'حدث خطأ في جلب النص وتحليل الفيديو. تأكد من أن الفيديو يحتوي على ترجمة تلقائية.');
            setIsProcessing(false);
            if (onStateChange) onStateChange(false);
        }
    };

    const handleSendMessage = async (textToSend?: string) => {
        const query = textToSend || inputValue;
        if (!query.trim()) return;

        // Add user message
        const userMsgId = Math.random().toString();
        const newMsg: Message = {
            id: userMsgId,
            sender: 'user',
            text: query,
            timestamp: new Date()
        };

        const currentMessages = [...messages, newMsg];
        setMessages(currentMessages);
        if (!textToSend) setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/learn/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    videoId,
                    question: query,
                    userId: user?.uid,
                    chatHistory: currentMessages.map(m => ({
                        sender: m.sender,
                        text: m.text
                    }))
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'فشل الاتصال بـ Tolzy Learn RAG API');
            }

            const data = await response.json();

            // Determine RAG category tags
            const lowerQuery = query.toLowerCase();
            const isQuiz = !!data.quiz;
            const isSummary = lowerQuery.includes('ملخص') || lowerQuery.includes('لخص');
            const isConcepts = lowerQuery.includes('مفاهيم') || lowerQuery.includes('كود') || lowerQuery.includes('برمجية');

            setMessages(prev => [...prev, {
                id: Math.random().toString(),
                sender: 'ai',
                text: data.text || 'لا يوجد رد متاح من النموذج.',
                isQuiz,
                quizQuestions: data.quiz || undefined,
                isSummary,
                isConcepts,
                timestamp: new Date()
            }]);
        } catch (err: any) {
            console.error('Ask API failed:', err);
            setMessages(prev => [...prev, {
                id: Math.random().toString(),
                sender: 'ai',
                text: `عذراً، واجهت مشكلة أثناء الاتصال بمحرك الذكاء الاصطناعي: **${err.message || 'خطأ غير متوقع'}**. يرجى مراجعة الخادم أو الاتصال بالدعم.`,
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Auto-scroll chat without shifting browser viewport
    useEffect(() => {
        const container = chatEndRef.current?.parentElement;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleReset = () => {
        setIsAnalyzed(false);
        setVideoId(null);
        setYoutubeUrl('');
        setMessages([]);
        setQuizAnswers({});
        if (onStateChange) onStateChange(false);
    };

    const handleSelectOption = (msgId: string, questionId: number, optionIdx: number) => {
        setQuizAnswers(prev => ({
            ...prev,
            [`${msgId}-${questionId}`]: optionIdx
        }));
    };

    const handleCloseClick = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsBarOpen(false);
    };

    // Render Floating Launcher Widget if NOT currently in active workspace analysis
    if (!isProcessing && !isAnalyzed) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[999] flex items-center overflow-hidden transition-all duration-300 ${
                    isBarOpen 
                        ? 'w-[calc(100vw-2rem)] sm:w-[450px] h-12 md:h-16 pl-3 pr-1 bg-white/95 dark:bg-[#0f1322]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full shadow-[0_15px_45px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
                        : 'w-12 h-12 md:w-16 md:h-16 p-0 bg-white dark:bg-[#090a0f] border-2 border-emerald-500/50 hover:border-emerald-400 rounded-full shadow-[0_10px_35px_rgba(16,185,129,0.35)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.6)] cursor-pointer'
                }`}
                onClick={!isBarOpen ? () => {
                    setIsBarOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 150);
                } : undefined}
            >
                {/* If closed, show pulsing ring */}
                {!isBarOpen && (
                    <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping pointer-events-none" />
                )}

                {/* The content container */}
                <div className="w-full h-full flex items-center justify-between gap-2.5">
                    {/* Expanded state contents */}
                    <AnimatePresence>
                        {isBarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-between w-full h-full gap-2 text-right"
                            >
                                {/* Left Actions: Close Button + Submit Button */}
                                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                                    <button
                                        onClick={handleCloseClick}
                                        className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-slate-100 hover:bg-red-500/10 text-slate-500 hover:text-red-500 border border-slate-200 dark:bg-white/5 dark:hover:bg-red-500/10 dark:text-slate-400 dark:hover:text-red-500 dark:border-white/5 flex items-center justify-center transition-all shrink-0"
                                        title="إغلاق الشريط"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleUrlSubmit()}
                                        disabled={isProcessing || !youtubeUrl}
                                        className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-l from-emerald-500 to-teal-500 text-white dark:text-[#090a0f] hover:from-emerald-400 hover:to-teal-400 rounded-full font-black text-[10px] md:text-xs shadow-md shadow-emerald-500/15 transition-all flex items-center gap-1 group disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:scale-110 transition-transform" />
                                        <span>تحليل ⚡</span>
                                    </button>
                                </div>

                                {/* Middle: Input field */}
                                <div className="flex-grow relative flex flex-col justify-center">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        onFocus={() => setShowSuggestions(true)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                        placeholder="أدخل رابط أي كورس يوتيوب واسأل رفيقك..."
                                        className="bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 text-[10px] md:text-xs font-semibold w-full text-right min-w-0 pr-1 pl-1"
                                    />
                                    {error && (
                                        <div className="absolute top-[105%] right-0 text-red-500 dark:text-red-400 text-[9px] font-bold whitespace-nowrap bg-white dark:bg-[#0f1322] px-2 py-0.5 rounded border border-red-500/20 shadow-sm z-50">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right side: Circular Launcher image (always present on the right) */}
                    <div className={`relative shrink-0 rounded-full overflow-hidden border border-slate-100 dark:border-white/5 transition-all duration-300 ${
                        isBarOpen ? 'w-9 h-9 md:w-12 md:h-12' : 'w-full h-full'
                    }`}>
                        <img 
                            src="/image/tools/11zon_cropped.jpg" 
                            alt="Ask YouTube Learn" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Popover Suggestions - sits absolutely above the capsule when open */}
                <AnimatePresence>
                    {showSuggestions && isBarOpen && !isAnalyzed && !isProcessing && (
                        <>
                            <div 
                                className="fixed inset-0 z-30" 
                                onClick={() => setShowSuggestions(false)} 
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute bottom-full right-0 mb-3 w-[calc(100vw-2rem)] sm:w-[420px] bg-white/95 dark:bg-[#0d101e]/95 border border-slate-200 dark:border-white/10 rounded-3xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-40 text-right"
                            >
                                <div className="flex items-center gap-1.5 mb-3 text-slate-500 dark:text-slate-400 font-bold text-xs justify-end">
                                    <span>جرّب أحد الدروس التعليمية المقترحة سريعة التحليل:</span>
                                    <Info className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    {DEFAULT_SUGGESTIONS.map((sug) => (
                                        <div
                                            key={sug.title}
                                            onClick={() => handleSuggestionClick(sug.url)}
                                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border border-slate-200 dark:border-white/5 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 cursor-pointer transition-all flex items-center justify-between text-right gap-3"
                                        >
                                            <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10 shrink-0">
                                                {sug.tag}
                                            </span>
                                            <span className="text-xs text-slate-700 dark:text-slate-200 font-bold hover:text-emerald-500 dark:hover:text-white transition-colors truncate">
                                                {sug.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <AnimatePresence mode="wait">
                {isProcessing ? (
                    /* VIEW 1: RAG PROCESSING STATE */
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="max-w-xl mx-auto py-16 flex flex-col items-center text-center px-4"
                    >
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">جاري استخلاص تفريغ الفيديو وتأمين الـ RAG</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
                            يقوم الرفيق البرمجي حالياً بتحليل النص البرمجي وترتيب الفصول الدراسية لتسهيل الإجابة الدقيقة على أسئلتك.
                        </p>

                        <div className="w-full max-w-sm space-y-3 text-right">
                            {[
                                { text: "استدعاء وترجمة التفريغ الصوتي", icon: "📝" },
                                { text: "فهرسة واستخراج الأكواد البرمجية والمفاهيم", icon: "🧠" },
                                { text: "ربط مساعد الشات الذكي وبدء البيئة", icon: "⚡" }
                            ].map((step, idx) => {
                                const isDone = processingStep > idx;
                                const isActive = processingStep === idx;
                                return (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl border text-xs transition-all duration-300 flex items-center justify-between ${
                                            isDone 
                                                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                : isActive 
                                                ? 'bg-white dark:bg-[#0f1322]/80 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold shadow-sm' 
                                                : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>{step.icon}</span>
                                            <span>{step.text}</span>
                                        </span>
                                        {isDone ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                                        ) : isActive ? (
                                            <RefreshCw className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-spin shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-white/10 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : isAnalyzed ? (
                    /* VIEW 2: SIMPLE COMPACT VIDEO + AI ASSISTANT PAGE (التحويل لصفحة بسيطة) */
                    <motion.div
                        key="workspace"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch w-full max-w-7xl mx-auto px-4 md:px-0 lg:h-[calc(100vh-14rem)] lg:min-h-[600px] lg:max-h-[800px]"
                    >
                        {/* RIGHT: YouTube Player View (60% width) */}
                        <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-0">
                            <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 bg-black/40 shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6)] shrink-0">
                                {videoId && (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="w-full h-full"
                                    />
                                )}
                            </div>
                            
                            {/* Video Information Card */}
                            {metadata && (
                                <div className="p-6 bg-white/80 dark:bg-[#0f1322]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col gap-4 text-right flex-1 overflow-y-auto max-h-[240px] lg:max-h-none min-h-0 scrollbar-thin">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                                                {metadata.duration}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                                                {metadata.views}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black">
                                                {metadata.rating}
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-white leading-tight">
                                                {metadata.title}
                                            </h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-bold">
                                                مقدم من: <span className="text-emerald-600 dark:text-emerald-400">{metadata.channel}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
                                            {metadata.description}
                                        </p>
                                    </div>

                                    {/* Topics / Sections list */}
                                    {metadata.topics && metadata.topics.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-slate-800 dark:text-white text-xs font-black mb-2">المواضيع الرئيسية بالدرس 📌</p>
                                            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                                                {metadata.topics.map((topic: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-emerald-500/20 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-white text-xs transition-colors cursor-default">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Simple Back and Exit Bar */}
                            <div className="p-4 bg-white/80 dark:bg-[#0f1322]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between shadow-sm shrink-0">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <ArrowLeft className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="text-right truncate">
                                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">تحليل مقطع فيديو آخر؟</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500">عد للرئيسية وحلل أي كورس يوتيوب آخر</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/5 transition-all shrink-0 flex items-center gap-1"
                                >
                                    <span>تغيير الفيديو</span>
                                    <CornerDownLeft className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* LEFT: AI Assistant Chat (40% width) */}
                        <div className="lg:col-span-4 flex flex-col bg-white/80 dark:bg-[#0f1322]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden h-[480px] sm:h-[580px] lg:h-full min-h-0">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20 text-right shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">متصل بالـ RAG</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-800 dark:text-white">رفيق التعلم الذكي</span>
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>

                            {/* Chat History Area */}
                            <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar flex flex-col min-h-0 scroll-smooth">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed text-right ${
                                                msg.sender === 'user'
                                                    ? 'bg-emerald-500 text-white rounded-tr-none shadow-md shadow-emerald-500/10 font-bold'
                                                    : 'bg-slate-100 dark:bg-[#090b14]/90 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none font-medium'
                                            }`}
                                        >
                                            {/* Render Markdown using ReactMarkdown inside Chat Bubble */}
                                            {msg.sender === 'ai' ? (
                                                <div className="space-y-1 hover:prose-a:text-emerald-500 transition-colors">
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkGfm as any]} 
                                                        components={{
                                                            p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-800 dark:text-slate-200 leading-[1.65] text-[12px] sm:text-[13px] text-right">{children}</p>,
                                                            h1: ({ children }) => <h1 className="text-sm sm:text-base font-black mb-2 mt-3 text-slate-900 dark:text-white leading-tight text-right">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-xs sm:text-sm font-bold mb-1.5 mt-3 text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-white/[0.06] leading-snug text-right">{children}</h2>,
                                                            h3: ({ children }) => <h3 className="text-xs font-semibold mb-1.5 mt-2.5 text-slate-800 dark:text-slate-200 text-right">{children}</h3>,
                                                            ul: ({ children }) => <ul className="list-disc pr-5 mb-2.5 space-y-1.5 text-slate-800 dark:text-slate-300 text-right w-full">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal pr-5 mb-2.5 space-y-1.5 text-slate-800 dark:text-slate-300 text-right w-full">{children}</ol>,
                                                            li: ({ children }) => <li className="text-slate-700 dark:text-slate-300 pr-1 pl-0 text-[12.5px] sm:text-[13px] leading-[1.75] text-right w-full">{children}</li>,
                                                            blockquote: ({ children }) => (
                                                                <blockquote className="border-r-2 border-emerald-500 pr-3 my-2 italic text-slate-550 dark:text-slate-400 text-right">
                                                                    {children}
                                                                </blockquote>
                                                            ),
                                                            strong: ({ children }) => <strong className="font-extrabold text-emerald-600 dark:text-emerald-400">{children}</strong>,
                                                            table: ({ children }) => (
                                                                <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-white/[0.08] w-full max-w-full">
                                                                    <table className="w-full text-[10px] sm:text-xs text-right border-collapse">
                                                                        {children}
                                                                    </table>
                                                                </div>
                                                            ),
                                                            thead: ({ children }) => <thead className="bg-slate-100 dark:bg-white/[0.04] text-slate-550 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider">{children}</thead>,
                                                            th: ({ children }) => <th className="px-3 py-2 border-b border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-semibold">{children}</th>,
                                                            td: ({ children }) => <td className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.04] text-slate-650 dark:text-slate-400">{children}</td>,
                                                            code: ({ node, className, children, ...props }: any) => {
                                                                const match = /language-([\w-]+)/.exec(className || '');
                                                                return match ? (
                                                                    <div className="bg-slate-950 rounded-xl overflow-hidden my-3 border border-slate-800 dark:border-white/[0.08] w-full max-w-full" dir="ltr">
                                                                        {/* Code block header */}
                                                                        <div className="bg-slate-900/60 px-3 py-1.5 flex justify-between items-center border-b border-slate-800/80">
                                                                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{match[1]}</span>
                                                                            <button
                                                                                className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/[0.05]"
                                                                                onClick={() => {
                                                                                    const cleanContent = String(children).replace(/\n$/, '');
                                                                                    navigator.clipboard.writeText(cleanContent);
                                                                                    toast.success('تم نسخ الكود');
                                                                                }}
                                                                            >
                                                                                <span>نسخ الكود</span>
                                                                            </button>
                                                                        </div>
                                                                        <div className="relative overflow-x-auto text-left">
                                                                            <SyntaxHighlighter
                                                                                style={oneDark}
                                                                                language={match[1]}
                                                                                PreTag="div"
                                                                                customStyle={{
                                                                                    margin: 0,
                                                                                    padding: '0.75rem 1rem',
                                                                                    background: 'transparent',
                                                                                    fontSize: '11px',
                                                                                    lineHeight: '1.55',
                                                                                    fontFamily: 'Consolas, Monaco, "Andale Mono", monospace'
                                                                                }}
                                                                                codeTagProps={{ style: { background: 'transparent', fontFamily: 'inherit', display: 'block' } }}
                                                                                {...props}
                                                                            >
                                                                                {String(children).replace(/\n$/, '')}
                                                                            </SyntaxHighlighter>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <code className="bg-slate-200/80 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-full text-[0.88em] font-mono border border-slate-300/50 dark:border-white/[0.04]" {...props}>{children}</code>
                                                                )
                                                            },
                                                            a: ({ node, className, href, children, ...props }: any) => {
                                                                return (
                                                                    <a
                                                                        href={href}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-emerald-500 hover:underline font-semibold"
                                                                        {...props}
                                                                    >
                                                                        {children}
                                                                    </a>
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {formatMessageContent(msg.text)}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <span className="font-semibold text-right block">{msg.text}</span>
                                            )}

                                            {/* Render interactive dynamic quiz in-chat */}
                                            {msg.isQuiz && (
                                                <div className="mt-4 border-t border-slate-100 dark:border-white/5 pt-4 space-y-5">
                                                    {(msg.quizQuestions || MOCK_QUIZ_QUESTIONS).map((q) => {
                                                        const answerKey = `${msg.id}-${q.id}`;
                                                        const selectedOpt = quizAnswers[answerKey];
                                                        const hasAnswered = selectedOpt !== undefined;

                                                        return (
                                                            <div key={q.id} className="p-3 bg-slate-100/50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl text-right">
                                                                <div className="flex items-start gap-1.5 mb-2.5 text-slate-800 dark:text-white font-bold">
                                                                    <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                    <span className="text-xs">{q.id}. {q.question}</span>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    {q.options.map((opt, optIdx) => {
                                                                        const isSelected = selectedOpt === optIdx;
                                                                        const isCorrect = q.correctIndex === optIdx;
                                                                        
                                                                        let optStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-white/5 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/10 shadow-sm";
                                                                        if (hasAnswered) {
                                                                            if (isCorrect) {
                                                                                optStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold";
                                                                            } else if (isSelected) {
                                                                                optStyle = "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 font-bold";
                                                                            } else {
                                                                                optStyle = "bg-slate-50 dark:bg-white/[0.01] border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 opacity-50";
                                                                            }
                                                                        }

                                                                        return (
                                                                            <button
                                                                                key={optIdx}
                                                                                onClick={() => !hasAnswered && handleSelectOption(msg.id, q.id, optIdx)}
                                                                                disabled={hasAnswered}
                                                                                className={`w-full text-right p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${optStyle}`}
                                                                            >
                                                                                <span>{opt}</span>
                                                                                {hasAnswered && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                                                                {hasAnswered && isSelected && !isCorrect && <span className="text-red-500 shrink-0 text-xs">✕</span>}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {hasAnswered && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        className="mt-2 p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/5 text-[10px] text-slate-600 dark:text-slate-300 border-r-2 border-emerald-500 dark:border-emerald-400 leading-relaxed"
                                                                    >
                                                                        <strong>💡 تفسير الإجابة:</strong> {q.explanation}
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Quiz score board */}
                                                    {Object.keys(quizAnswers).filter(k => k.startsWith(msg.id)).length === (msg.quizQuestions || MOCK_QUIZ_QUESTIONS).length && (
                                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                                            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                                                🎉 اكتمل الاختبار! النتيجة المكتسبة:{' '}
                                                                {(msg.quizQuestions || MOCK_QUIZ_QUESTIONS).filter(q => quizAnswers[`${msg.id}-${q.id}`] === q.correctIndex).length} / {(msg.quizQuestions || MOCK_QUIZ_QUESTIONS).length}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                                            {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex flex-col items-start">
                                        <div className="bg-slate-50 border border-slate-100 text-slate-500 dark:bg-white/[0.02] dark:border-white/5 dark:text-slate-400 p-3.5 rounded-2xl rounded-tr-none text-xs flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            <span className="mr-1 text-[11px]">الرفيق الذكي يفكر...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Macro rapid buttons */}
                            <div className="p-2.5 bg-slate-50 dark:bg-[#0a0d1a] border-t border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar shrink-0">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSendMessage("📝 لخص لي هذا الفيديو بالكامل واذكر أهم الفصول الفنية")}
                                        disabled={isTyping}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-500/10 text-slate-600 hover:text-emerald-600 border border-slate-200 hover:border-emerald-500/30 dark:bg-[#0f1322] dark:hover:bg-emerald-500/10 dark:text-slate-300 dark:hover:text-emerald-400 dark:border-white/5 dark:hover:border-emerald-500/20 text-[11px] font-bold transition-all whitespace-nowrap disabled:opacity-50"
                                    >
                                        <FileText className="w-3.5 h-3.5 shrink-0" />
                                        لخص الفيديو
                                    </button>
                                    <button
                                        onClick={() => handleSendMessage("🧠 استخرج لي كافة المفاهيم البرمجية والأكواد المشروحة في الدرس")}
                                        disabled={isTyping}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-500/10 text-slate-600 hover:text-emerald-600 border border-slate-200 hover:border-emerald-500/30 dark:bg-[#0f1322] dark:hover:bg-emerald-500/10 dark:text-slate-300 dark:hover:text-emerald-400 dark:border-white/5 dark:hover:border-emerald-500/20 text-[11px] font-bold transition-all whitespace-nowrap disabled:opacity-50"
                                    >
                                        <Code2 className="w-3.5 h-3.5 shrink-0" />
                                        المفاهيم البرمجية
                                    </button>
                                    <button
                                        onClick={() => handleSendMessage("📋 قم بتوليد اختبار قصير من خيارات متعددة لاختبار استيعابي للفيديو")}
                                        disabled={isTyping}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-500/10 text-slate-600 hover:text-emerald-600 border border-slate-200 hover:border-emerald-500/30 dark:bg-[#0f1322] dark:hover:bg-emerald-500/10 dark:text-slate-300 dark:hover:text-emerald-400 dark:border-white/5 dark:hover:border-emerald-500/20 text-[11px] font-bold transition-all whitespace-nowrap disabled:opacity-50"
                                    >
                                        <Award className="w-3.5 h-3.5 shrink-0" />
                                        توليد اختبار قصير
                                    </button>
                                </div>
                            </div>

                            {/* Standard text prompt typing */}
                            <div className="p-3 bg-slate-50 dark:bg-[#0a0d1a] border-t border-slate-200 dark:border-white/5 shrink-0">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={isTyping}
                                        placeholder="اسأل رفيقك عن أي شيء في هذا الدرس..."
                                        className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#090b14]/90 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-right disabled:opacity-50 font-medium"
                                    />
                                    <button
                                        onClick={() => handleSendMessage()}
                                        disabled={isTyping || !inputValue.trim()}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7.5 h-7.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090a0f] flex items-center justify-center transition-all disabled:opacity-30"
                                    >
                                        <CornerDownLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

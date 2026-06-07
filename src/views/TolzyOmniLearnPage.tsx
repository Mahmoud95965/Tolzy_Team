"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    Youtube, Sparkles, Send, RefreshCw, CheckCircle2, 
    FileText, Code2, Check, HelpCircle, AlertCircle, 
    ArrowLeft, Info, Play, ChevronLeft, Award, CornerDownLeft, X,
    BookOpen, ExternalLink, GraduationCap, Copy, MessageSquare, Link as LinkIcon, Clock
} from 'lucide-react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    isQuiz?: boolean;
    quizQuestions?: QuizQuestion[];
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
        title: "كورس Next.js 15 الشامل بالعربية (يوتيوب)",
        url: "https://www.youtube.com/watch?v=843nec-IvW0",
        type: "youtube"
    },
    {
        title: "كورس أساسيات الذكاء الاصطناعي من Google (Coursera)",
        url: "https://www.coursera.org/learn/google-ai-essentials",
        type: "coursera"
    },
    {
        title: "مقال بنية الـ RAG وبناء المساعدين الأذكياء (مقالة تقنية)",
        url: "https://medium.com/p/explain-rag-architecture-in-detail",
        type: "webpage"
    }
];

interface RecentOperation {
    url: string;
    title: string;
    type: 'youtube' | 'coursera' | 'webpage';
    timestamp: number;
    resourceId: string;
}

function isValidEducationalUrl(urlStr: string): { isValid: boolean; error?: string } {
    try {
        const trimmed = urlStr.trim();
        if (!trimmed) {
            return { isValid: false, error: 'الرجاء إدخال رابط صالح' };
        }
        
        if (!/^https?:\/\//i.test(trimmed)) {
            return { isValid: false, error: 'الرابط يجب أن يبدأ بـ http:// أو https://' };
        }

        const url = new URL(trimmed);
        const hostname = url.hostname.toLowerCase();
        
        const blacklistedDomains = [
            'facebook.com', 'www.facebook.com', 'fb.com',
            'twitter.com', 'www.twitter.com', 'x.com', 'www.x.com',
            'instagram.com', 'www.instagram.com',
            'tiktok.com', 'www.tiktok.com',
            'pinterest.com', 'www.pinterest.com',
            'snapchat.com', 'www.snapchat.com',
            'linkedin.com', 'www.linkedin.com',
            'reddit.com', 'www.reddit.com',
            'netflix.com', 'www.netflix.com',
            'spotify.com', 'www.spotify.com'
        ];

        if (blacklistedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
            return { 
                isValid: false, 
                error: 'هذا الرابط غير مدعوم. يدعم TOLZY OmniLearn فقط منصات يوتيوب، Coursera، والمواقع والمدونات التعليمية والتقنية المفتوحة.' 
            };
        }

        const pathname = url.pathname.toLowerCase();
        const forbiddenExtensions = [
            '.zip', '.rar', '.tar', '.gz', '.7z', 
            '.exe', '.msi', '.apk', '.dmg',
            '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
            '.mp4', '.mp3', '.avi', '.mov', '.mkv', '.webm',
            '.dmg', '.iso', '.bin'
        ];
        if (forbiddenExtensions.some(ext => pathname.endsWith(ext))) {
            return { 
                isValid: false, 
                error: 'هذا الملف غير مدعوم. يدعم TOLZY OmniLearn فقط صفحات الويب النصية ومقاطع الفيديو من يوتيوب وكورسات Coursera.' 
            };
        }

        return { isValid: true };
    } catch (e) {
        return { isValid: false, error: 'تنسيق الرابط غير صالح. يرجى إدخال عنوان URL كامل وصحيح.' };
    }
}

export default function TolzyOmniLearnPage() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
    const isPro = normalizedPlan.includes('pro') || normalizedPlan.includes('ultra');

    const [inputUrl, setInputUrl] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    
    // Resource properties
    const [resourceId, setResourceId] = useState<string | null>(null);
    const [isYouTube, setIsYouTube] = useState(false);
    const [metadata, setMetadata] = useState<{
        title: string;
        channel: string;
        duration: string;
        description: string;
        topics: string[];
    } | null>(null);
    const [chunks, setChunks] = useState<any[]>([]);
    const [recentOperations, setRecentOperations] = useState<RecentOperation[]>([]);
    
    // Chat states
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
    
    // Reader UI state
    const [activeChunkTab, setActiveChunkTab] = useState(0);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Platform detection for glowing icons
    const isYtInput = inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be');
    const isCourseraInput = inputUrl.includes('coursera.org');
    const isWebInput = inputUrl.trim().length > 5 && !isYtInput && !isCourseraInput && /^https?:\/\//i.test(inputUrl);

    // Load recent operations
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storageKey = user ? `tolzy_omnilearn_recent_${user.uid}` : 'tolzy_omnilearn_recent_guest';
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                try {
                    setRecentOperations(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse recent operations', e);
                }
            }
        }
    }, [user]);

    // Read URL query parameter if present
    useEffect(() => {
        const urlParam = searchParams?.get('url') || searchParams?.get('youtubeUrl');
        if (urlParam) {
            const decoded = decodeURIComponent(urlParam);
            setInputUrl(decoded);
            triggerAnalysis(decoded);
        }
    }, [searchParams]);

    // Auto-scroll chat
    useEffect(() => {
        const container = chatEndRef.current?.parentElement;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, isTyping]);

    const triggerAnalysis = async (url: string) => {
        if (!url.trim()) return;

        // Frontend URL domain protection
        const validation = isValidEducationalUrl(url);
        if (!validation.isValid) {
            setError(validation.error || 'رابط غير مدعوم');
            toast.error(validation.error || 'رابط غير مدعوم');
            return;
        }

        setError('');
        setIsProcessing(true);
        setProcessingStep(0);

        try {
            // Step 0: Connecting & Scraping
            const response = await fetch('/api/learn/fetch-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, userId: user?.uid })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'فشل معالجة الرابط واستخراج المحتوى');
            }

            const data = await response.json();
            
            // Step 1: Segmentation
            setProcessingStep(1);
            await new Promise(resolve => setTimeout(resolve, 800));

            const isYt = url.includes('youtube.com') || url.includes('youtu.be');
            setIsYouTube(isYt);
            setResourceId(data.course.video_id);
            const courseTitle = data.course.title || "مادة تعليمية متميزة";
            setMetadata({
                title: courseTitle,
                channel: data.course.channel || "مساعد التعلم الذكي لـ Tolzy",
                duration: data.course.duration || (isYt ? "30:00 دقيقة" : "صفحة تعليمية"),
                description: data.course.description || "تم تحليل هذا الرابط بنجاح وفهرسة نصوصه بدقة.",
                topics: data.course.topics && data.course.topics.length > 0 ? data.course.topics : ["تعلم ذكي 🧠"]
            });
            setChunks(data.chunks || []);

            // Save to local operations history
            const opType = isYt ? 'youtube' : (url.includes('coursera.org') ? 'coursera' : 'webpage');
            const newOp: RecentOperation = {
                url,
                title: courseTitle,
                type: opType as any,
                timestamp: Date.now(),
                resourceId: data.course.video_id
            };
            setRecentOperations(prev => {
                const filtered = prev.filter(op => op.url !== url);
                const updated = [newOp, ...filtered].slice(0, 10);
                if (typeof window !== 'undefined') {
                    const storageKey = user ? `tolzy_omnilearn_recent_${user.uid}` : 'tolzy_omnilearn_recent_guest';
                    localStorage.setItem(storageKey, JSON.stringify(updated));
                }
                return updated;
            });

            // Step 2: AXIOM Initialization
            setProcessingStep(2);
            await new Promise(resolve => setTimeout(resolve, 800));

            setIsProcessing(false);
            setIsAnalyzed(true);

            // Welcome message
            setMessages([
                {
                    id: 'welcome',
                    sender: 'ai',
                    text: `أهلاً بك! أنا **TOLZY OmniLearn** ✨ مساعدك الذكي الفائق المدعوم بمحرك **AXIOM** للتفكير والتحليل.\n\nلقد قمت بتفكيك محتوى المصدر بنجاح لـ **"${courseTitle}"**.\n\nأنا الآن جاهز للإجابة على جميع استفساراتك الفنية، تلخيص الأفكار المعقدة، أو توليد اختبارات تفاعلية حول هذا المحتوى. اطرح سؤالك الآن!`,
                    timestamp: new Date()
                }
            ]);

        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError(err.message || 'حدث خطأ غير متوقع أثناء معالجة الرابط. يرجى مراجعة المدخلات.');
            setIsProcessing(false);
            toast.error(err.message || 'فشل تحليل المادة التعليمية');
        }
    };

    const handleUrlSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!isPro) {
            toast.error('ميزة TOLZY OmniLearn متوفرة فقط لمشتركي باقة Pro');
            return;
        }

        triggerAnalysis(inputUrl);
    };

    const handleSuggestionClick = (url: string) => {
        if (!isPro) {
            toast.error('ميزة TOLZY OmniLearn متوفرة فقط لمشتركي باقة Pro');
            return;
        }
        setInputUrl(url);
        triggerAnalysis(url);
    };

    const handleSendMessage = async (textToSend?: string) => {
        const query = textToSend || inputValue;
        if (!query.trim()) return;

        const userMsg: Message = {
            id: Math.random().toString(),
            sender: 'user',
            text: query,
            timestamp: new Date()
        };

        const currentMessages = [...messages, userMsg];
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
                    videoId: resourceId,
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
                throw new Error(errData.error || 'فشل الاتصال بمحرك AXIOM');
            }

            const data = await response.json();

            setMessages(prev => [...prev, {
                id: Math.random().toString(),
                sender: 'ai',
                text: data.text || 'لم أتمكن من صياغة إجابة مناسبة.',
                isQuiz: !!data.quiz,
                quizQuestions: data.quiz || undefined,
                timestamp: new Date()
            }]);
        } catch (err: any) {
            console.error('Ask failed:', err);
            setMessages(prev => [...prev, {
                id: Math.random().toString(),
                sender: 'ai',
                text: `عذراً، واجهت مشكلة أثناء الاتصال بمحرك AXIOM: **${err.message || 'خطأ في الاستجابة'}**.`,
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleReset = () => {
        setIsAnalyzed(false);
        setResourceId(null);
        setInputUrl('');
        setMessages([]);
        setChunks([]);
        setMetadata(null);
        setQuizAnswers({});
    };

    const handleSelectOption = (msgId: string, questionId: number, optionIdx: number) => {
        setQuizAnswers(prev => ({
            ...prev,
            [`${msgId}-${questionId}`]: optionIdx
        }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('تم نسخ النص إلى الحافظة 📋');
    };

    return (
        <PageLayout navbarOffset={false} showCopilot={false}>
            <div className="relative min-h-screen bg-[#050507] text-slate-100 font-sans transition-colors duration-300 overflow-x-hidden w-full pt-20 md:pt-24 pb-12" dir="rtl">
                
                {/* Decorative background glows */}
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-full blur-[150px]" />
                    <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-[130px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
                    
                    <AnimatePresence mode="wait">
                        {!isProcessing && !isAnalyzed ? (
                            /* VIEW 1: PREMIUM LANDING STATE */
                            <motion.div
                                key="landing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto text-center py-8 md:py-16 flex flex-col items-center"
                            >
                                {/* AXIOM glowing logo badge */}
                                <motion.div 
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 via-purple-400 to-pink-500 text-xs md:text-sm font-black mb-8 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                                >
                                    <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                                    مدعوم بمحرك AXIOM الذكي ✨
                                </motion.div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                                    TOLZY <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 via-teal-400 to-indigo-500">OmniLearn</span>
                                </h1>
                                <p className="text-base md:text-lg text-slate-400 font-medium mb-10 max-w-2xl leading-relaxed">
                                    معالج التعلم الذكي الفائق. ضع رابط أي مقالة، مدونة تعليمية، كورس على Coursera، أو فيديو يوتيوب، ودع AXIOM يفكك المحتوى، يلخصه، ويحاوره هندسياً.
                                </p>

                                {/* URL Input Form Capsule */}
                                <form 
                                    onSubmit={handleUrlSubmit}
                                    className="w-full max-w-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 md:p-3 flex flex-col md:flex-row items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-emerald-500/40 focus-within:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all duration-300 mb-8"
                                >
                                    <div className="flex-1 w-full flex items-center gap-3 px-4 py-2">
                                        <LinkIcon className={`w-5 h-5 transition-colors duration-300 ${isYtInput ? 'text-red-500' : isCourseraInput ? 'text-blue-500' : isWebInput ? 'text-emerald-500' : 'text-slate-500'}`} />
                                        <input
                                            ref={inputRef}
                                            type="url"
                                            required
                                            value={inputUrl}
                                            onChange={(e) => setInputUrl(e.target.value)}
                                            placeholder="أدخل رابط مساق Coursera، فيديو يوتيوب، أو مقالة تعليمية..."
                                            className="bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm font-semibold w-full text-right"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!isPro || !inputUrl}
                                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                    >
                                        <Sparkles className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                        <span>ابدأ المعالجة العميقة ⚡</span>
                                    </button>
                                </form>

                                {/* Platform indicators grid */}
                                <div className="flex items-center justify-center gap-8 md:gap-12 mb-12">
                                    <div className={`flex items-center gap-2 text-xs md:text-sm font-bold transition-all duration-300 ${isYtInput ? 'text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-slate-500'}`}>
                                        <Youtube className="w-5 h-5" />
                                        <span>يوتيوب</span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs md:text-sm font-bold transition-all duration-300 ${isCourseraInput ? 'text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-slate-500'}`}>
                                        <GraduationCap className="w-5 h-5" />
                                        <span>Coursera</span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs md:text-sm font-bold transition-all duration-300 ${isWebInput ? 'text-emerald-500 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-500'}`}>
                                        <BookOpen className="w-5 h-5" />
                                        <span>مواقع ومدونات مفتوحة</span>
                                    </div>
                                </div>

                                {/* Plan check notice if not pro */}
                                {!isPro && (
                                    <div className="w-full max-w-xl p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center justify-center gap-2.5 mb-10">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>هذه الميزة متوفرة لمشتركي باقة Pro. يرجى <Link href="/pricing" className="text-white hover:underline">ترقية حسابك الآن</Link> للاستفادة منها.</span>
                                    </div>
                                )}

                                {/* Recent Operations History */}
                                {recentOperations.length > 0 && (
                                    <div className="w-full max-w-2xl text-right mb-8">
                                        <p className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-end gap-1.5">
                                            <span>آخر العمليات والمواد التي تصفحتها:</span>
                                            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                        </p>
                                        <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                                            {recentOperations.map((op) => (
                                                <div
                                                    key={op.url}
                                                    onClick={() => handleSuggestionClick(op.url)}
                                                    className="p-3.5 rounded-2xl bg-emerald-550/[0.02] hover:bg-emerald-550/[0.05] border border-emerald-550/10 hover:border-emerald-550/30 cursor-pointer transition-all flex items-center justify-between text-right gap-3"
                                                >
                                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0 ${
                                                        op.type === 'youtube' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                        op.type === 'coursera' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                        {op.type === 'youtube' ? 'يوتيوب 📹' : op.type === 'coursera' ? 'Coursera 🎓' : 'مقال 📝'}
                                                    </span>
                                                    <span className="text-xs md:text-sm text-slate-300 font-bold hover:text-white transition-colors truncate flex-1 text-right">
                                                        {op.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Default suggestions */}
                                <div className="w-full max-w-2xl text-right">
                                    <p className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-end gap-1.5">
                                        <span>جرّب تحليل أحد المصادر المقترحة:</span>
                                        <Info className="w-3.5 h-3.5 text-indigo-400" />
                                    </p>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {DEFAULT_SUGGESTIONS.map((sug) => (
                                            <div
                                                key={sug.title}
                                                onClick={() => handleSuggestionClick(sug.url)}
                                                className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/20 cursor-pointer transition-all flex items-center justify-between text-right gap-3"
                                            >
                                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0 ${
                                                    sug.type === 'youtube' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                    sug.type === 'coursera' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    {sug.type === 'youtube' ? 'يوتيوب 📹' : sug.type === 'coursera' ? 'Coursera 🎓' : 'مقال برميجي 📝'}
                                                </span>
                                                <span className="text-xs md:text-sm text-slate-350 font-bold hover:text-white transition-colors truncate">
                                                    {sug.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : isProcessing ? (
                            /* VIEW 2: MULTI-STEP LOADER */
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-xl mx-auto py-16 flex flex-col items-center text-center px-4"
                            >
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-white mb-2">جاري فك وتفكيك محتوى المصدر التعليمي</h3>
                                <p className="text-slate-400 text-xs max-w-sm mb-8 leading-relaxed">
                                    يتواصل محرك AXIOM حالياً مع الرابط المكتوب لاسترجاع البيانات وترتيب الفصول الدراسية لتسهيل الإجابة الدقيقة.
                                </p>

                                <div className="w-full max-w-sm space-y-3.5 text-right">
                                    {[
                                        { text: "الاتصال وقراءة الكود المصدري للرابط", icon: "🌐" },
                                        { text: "تفكيك البيانات المعقدة وتجزئة النصوص", icon: "🧠" },
                                        { text: "تحضير مساعد Q&A وتفعيل محرك AXIOM", icon: "⚡" }
                                    ].map((step, idx) => {
                                        const isDone = processingStep > idx;
                                        const isActive = processingStep === idx;
                                        return (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-2xl border text-xs transition-all duration-300 flex items-center justify-between ${
                                                    isDone 
                                                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                                                        : isActive 
                                                        ? 'bg-white/5 border-white/10 text-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.03)]' 
                                                        : 'bg-white/[0.01] border-white/[0.02] text-slate-600'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <span className="text-sm">{step.icon}</span>
                                                    <span>{step.text}</span>
                                                </span>
                                                {isDone ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                ) : isActive ? (
                                                    <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ) : (
                            /* VIEW 3: SPLIT WORKSPACE */
                            <motion.div
                                key="workspace"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch w-full max-w-7xl mx-auto lg:h-[calc(100vh-14rem)] lg:min-h-[600px] lg:max-h-[850px]"
                            >
                                {/* RIGHT: Source View Panel (60% width) */}
                                <div className="lg:col-span-6 flex flex-col gap-4 h-full min-h-0">
                                    
                                    {isYouTube ? (
                                        /* YouTube Player */
                                        <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/5 bg-black shadow-2xl shrink-0">
                                            {resourceId && (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${resourceId}?autoplay=0&rel=0`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                    className="w-full h-full"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        /* Course / Article Reader Component */
                                        <div className="flex-1 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-6 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                                                    {metadata?.channel === 'Coursera' ? 'مساق Coursera 🎓' : 'مقال تعليمي 📝'}
                                                </span>
                                                <span className="text-slate-500 text-xs font-bold">
                                                    تم جلب المحتوى بالكامل
                                                </span>
                                            </div>

                                            <h2 className="text-xl md:text-2xl font-black text-white mb-2 leading-snug">
                                                {metadata?.title}
                                            </h2>
                                            <p className="text-slate-400 text-xs font-bold mb-4">
                                                الموقع: <span className="text-emerald-400">{metadata?.channel}</span> · الحالة: <span className="text-emerald-400 font-bold">مفهرس بنجاح</span>
                                            </p>

                                            <div className="border-t border-white/5 pt-4 mb-4 flex-grow overflow-y-auto pr-1 text-right scrollbar-thin">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">تصفح أقسام المحتوى 📋</h3>
                                                <div className="space-y-2">
                                                    {chunks.map((chunk, index) => (
                                                        <div 
                                                            key={index}
                                                            onClick={() => setActiveChunkTab(index)}
                                                            className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                                                                activeChunkTab === index 
                                                                    ? 'bg-white/5 border-emerald-500/30 text-white font-bold' 
                                                                    : 'bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.02] hover:text-white'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                                                    activeChunkTab === index ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'
                                                                }`}>
                                                                    القسم {index + 1}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs leading-relaxed line-clamp-2">{chunk.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Selected Chunk Content Panel */}
                                            {chunks[activeChunkTab] && (
                                                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-right animate-fade-in">
                                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                                                        <button 
                                                            onClick={() => copyToClipboard(chunks[activeChunkTab].text)}
                                                            className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>نسخ النص</span>
                                                        </button>
                                                        <span className="text-[10px] font-black text-emerald-400">محتوى القسم {activeChunkTab + 1}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-350 leading-relaxed font-medium">{chunks[activeChunkTab].text}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Video / Page Information Card */}
                                    {metadata && (
                                        <div className="p-5 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl shadow-xl flex flex-col gap-3.5 text-right shrink-0">
                                            {isYouTube && (
                                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black">
                                                        المدة: {metadata.duration}
                                                    </span>
                                                    <h2 className="text-sm md:text-base font-black text-white leading-tight">
                                                        {metadata.title}
                                                    </h2>
                                                </div>
                                            )}
                                            
                                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                                                {metadata.description}
                                            </p>

                                            <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
                                                {metadata.topics.map((topic: string, i: number) => (
                                                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white/[0.02] border border-white/5 text-slate-400 text-xs">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Back Bar */}
                                    <div className="p-4 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between shadow-sm shrink-0">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div className="text-right truncate">
                                                <p className="text-xs font-bold text-white truncate">معالجة رابط تعليمي آخر؟</p>
                                                <p className="text-[10px] text-slate-500">قم بتغيير المصدر الحالي ودراسة رابط جديد</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleReset}
                                            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl border border-white/5 transition-all shrink-0 flex items-center gap-1.5"
                                        >
                                            <span>تغيير المصدر</span>
                                            <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                                        </button>
                                    </div>

                                </div>

                                {/* LEFT: AXIOM Q&A Chat Panel (40% width) */}
                                <div className="lg:col-span-4 flex flex-col bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden h-[500px] sm:h-[600px] lg:h-full min-h-0">
                                    
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/30 text-right shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] text-slate-500 font-bold">AXIOM Reasoning Active</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white">TOLZY OmniLearn</span>
                                            <Sparkles className="w-4 h-4 text-purple-400" />
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
                                                            ? 'bg-emerald-500 text-slate-950 rounded-tr-none shadow-lg shadow-emerald-500/10 font-bold'
                                                            : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none font-medium'
                                                    }`}
                                                >
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkGfm as any]} 
                                                        components={{
                                                            p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-200 leading-[1.65] text-[12px] sm:text-[13px] text-right">{children}</p>,
                                                            h1: ({ children }) => <h1 className="text-sm sm:text-base font-black mb-2 mt-3 text-white border-b border-white/5 pb-1 text-right">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-xs sm:text-sm font-bold mb-1.5 mt-2.5 text-white text-right">{children}</h2>,
                                                            h3: ({ children }) => <h3 className="text-xs font-bold mb-1 mt-2 text-white text-right">{children}</h3>,
                                                            ul: ({ children }) => <ul className="list-disc pr-4 mb-2 space-y-1 text-right text-slate-350">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal pr-4 mb-2 space-y-1 text-right text-slate-350">{children}</ol>,
                                                            li: ({ children }) => <li className="mb-0.5 text-right text-slate-300 leading-relaxed text-[11px] sm:text-[12px]">{children}</li>,
                                                            code: ({ className, children, ...props }) => {
                                                                const { ref, node, ...cleanProps } = props as any;
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                const codeStr = String(children).replace(/\n$/, '');
                                                                return match ? (
                                                                    <div className="relative my-2 w-full rounded-lg overflow-hidden border border-white/5" dir="ltr">
                                                                        <SyntaxHighlighter
                                                                            style={oneDark as any}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            customStyle={{ margin: 0, padding: '12px', fontSize: '11px', background: '#0a0a0f' }}
                                                                        >
                                                                            {codeStr}
                                                                        </SyntaxHighlighter>
                                                                    </div>
                                                                ) : (
                                                                    <code className="bg-white/10 text-white font-mono px-1 py-0.5 rounded text-[11px]" {...cleanProps}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>

                                                    {/* Interactive Quiz Renderer */}
                                                    {msg.isQuiz && msg.quizQuestions && msg.quizQuestions.length > 0 && (
                                                        <div className="mt-4 border-t border-white/5 pt-4 space-y-5 text-right">
                                                            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                                                                <GraduationCap className="w-4.5 h-4.5 animate-bounce" />
                                                                <span>اختبار تفاعلي لقياس مستوى الفهم ✏️</span>
                                                            </div>
                                                            {msg.quizQuestions.map((q) => {
                                                                const answerKey = `${msg.id}-${q.id}`;
                                                                const selectedIdx = quizAnswers[answerKey];
                                                                const isAnswered = selectedIdx !== undefined;

                                                                return (
                                                                    <div key={q.id} className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-3">
                                                                        <p className="text-xs font-bold text-white leading-relaxed">{q.id}. {q.question}</p>
                                                                        <div className="grid grid-cols-1 gap-2">
                                                                            {q.options.map((opt, oIdx) => {
                                                                                const isSelected = selectedIdx === oIdx;
                                                                                const isCorrect = q.correctIndex === oIdx;
                                                                                let btnStyle = "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5";
                                                                                
                                                                                if (isAnswered) {
                                                                                    if (isCorrect) {
                                                                                        btnStyle = "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 font-bold";
                                                                                    } else if (isSelected) {
                                                                                        btnStyle = "bg-red-500/20 border-red-500/30 text-red-400 font-bold";
                                                                                    } else {
                                                                                        btnStyle = "bg-white/[0.01] border-white/[0.02] text-slate-600 opacity-60 pointer-events-none";
                                                                                    }
                                                                                }

                                                                                return (
                                                                                    <button
                                                                                        key={oIdx}
                                                                                        disabled={isAnswered}
                                                                                        onClick={() => handleSelectOption(msg.id, q.id, oIdx)}
                                                                                        className={`p-2.5 rounded-lg border text-right text-xs transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                                                                                    >
                                                                                        <span>{opt}</span>
                                                                                        {isAnswered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                                                                        {isAnswered && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        {isAnswered && (
                                                                            <motion.div 
                                                                                initial={{ opacity: 0, height: 0 }}
                                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                                className="mt-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-300 leading-relaxed font-medium"
                                                                            >
                                                                                💡 **شرح الإجابة الصحيحة:** {q.explanation}
                                                                            </motion.div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-slate-500 mt-1 px-1 font-bold">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}

                                        {isTyping && (
                                            <div className="flex flex-col items-start">
                                                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-400 rounded-tl-none flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Prompt suggestions panel */}
                                    <div className="p-3 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar justify-start shrink-0">
                                        <button
                                            onClick={() => handleSendMessage("لخص لي أهم النقاط البرمجية والمفاهيم الأساسية في هذا المصدر 📝")}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full border border-white/5 hover:border-emerald-500/20 text-[10px] md:text-xs font-bold transition-all shrink-0"
                                        >
                                            لخص المفاهيم 📝
                                        </button>
                                        <button
                                            onClick={() => handleSendMessage("ما هي التفاصيل والأفكار الهندسية المطروحة في هذا المحتوى؟ 🧠")}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full border border-white/5 hover:border-emerald-500/20 text-[10px] md:text-xs font-bold transition-all shrink-0"
                                        >
                                            الأفكار الهندسية 🧠
                                        </button>
                                        <button
                                            onClick={() => handleSendMessage("لخص لي هذا المحتوى كلياً واختبر فهمي باختبار تفاعلي Quiz مكون من 10 أسئلة ⚡")}
                                            className="px-3 py-1.5 bg-gradient-to-l from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-400 rounded-full border border-emerald-500/20 text-[10px] md:text-xs font-black transition-all shrink-0"
                                        >
                                            اختبرني Quiz ⚡
                                        </button>
                                    </div>

                                    {/* Chat Input Box */}
                                    <div className="p-3 bg-black/20 border-t border-white/5 flex items-center gap-2 shrink-0">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="اسأل AXIOM عن أي تفاصيل برمجية..."
                                            className="flex-grow bg-white/5 border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-emerald-550/30 rounded-2xl py-3 px-4 text-xs md:text-sm font-semibold text-right"
                                        />
                                        <button
                                            onClick={() => handleSendMessage()}
                                            disabled={!inputValue.trim() || isTyping}
                                            className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4 rtl:rotate-180" />
                                        </button>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </PageLayout>
    );
}

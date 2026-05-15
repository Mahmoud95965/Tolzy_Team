'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronDown,
    Settings,
    Trash2,
    Lightbulb,
    Globe,
    PenTool,
    Code,
    Sparkles,
    Send,
    Bot,
    ExternalLink,
    Paperclip,
    Copy,
    Check,
    Loader2,
    Search,
    Edit2,
    LogOut,
    Mic,
    X,
    User,
    Home,
    LogIn,
    Menu,
    BookOpen,
    SlidersHorizontal,
    Sun,
    Moon,
    Shield,
    Rocket,
    Image as ImageIcon,
    TerminalSquare,
    Zap,
    Layers,
    MessageSquare,
    GraduationCap,
    RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ToolCard from './ToolCard';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useUserData } from '../../hooks/useUserData';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
    status?: 'thinking' | 'streaming' | 'complete';
    tools?: any[];
    feedback?: 'like' | 'dislike' | null;
    modelId?: string;
    thinkingDuration?: number;
    thinkingProcess?: string;
}

interface Conversation {
    id: string;
    user_id: string;
    title: string;
    messages: Message[];
    created_at: string;
    updated_at: string;
}

const TOOLS = [
    { id: 'programming', name: 'الأكواد', icon: <Code size={16} /> },
    { id: 'build', name: 'ابنِ مشروعك', icon: <Rocket size={16} /> }
];

// @ mention commands
const AT_COMMANDS = [
    { id: 'code', label: 'برمجة', description: 'وضع تحليل وكتابة الأكواد', icon: <Code size={15} />, color: 'text-blue-500', comingSoon: true },
    { id: 'tools', label: 'أدوات', description: 'اكتشف أدوات AI المناسبة', icon: <Layers size={15} />, color: 'text-emerald-500', comingSoon: false },
    { id: 'learn', label: 'تعلم', description: 'مسارات التعلم والكورسات', icon: <GraduationCap size={15} />, color: 'text-amber-500', comingSoon: false },
    { id: 'general', label: 'عام', description: 'محادثة عامة مع Copilot', icon: <MessageSquare size={15} />, color: 'text-indigo-500', comingSoon: false },
];

// ─── Mode System ───────────────────────────────────────────
type CopilotMode = 'general' | 'code' | 'tools' | 'learn';

interface ModeConfig {
    id: CopilotMode;
    label: string;
    icon: React.ReactNode;
    placeholder: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
}

const MODES: ModeConfig[] = [
    {
        id: 'general',
        label: 'عام',
        icon: <MessageSquare size={16} />,
        placeholder: 'اسأل Tolzy Copilot...',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        border: 'border-indigo-200 dark:border-indigo-500/20',
        glow: 'shadow-indigo-500/20',
    },
    {
        id: 'code',
        label: 'برمجة',
        icon: <Code size={16} />,
        placeholder: 'اكتب وصف الكود أو الصق الكود المراد شرحه أو تصحيحه...',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        border: 'border-blue-200 dark:border-blue-500/20',
        glow: 'shadow-blue-500/20',
    },
    {
        id: 'tools',
        label: 'أدوات',
        icon: <Layers size={16} />,
        placeholder: 'صِف ما تحتاجه وسأقترح عليك أدوات Tolzy المناسبة...',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20',
        glow: 'shadow-emerald-500/20',
    },
    {
        id: 'learn',
        label: 'تعلم',
        icon: <GraduationCap size={16} />,
        placeholder: 'ماذا تريد أن تتعلم اليوم؟ اكتب الموضوع أو المسار...',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/20',
        glow: 'shadow-amber-500/20',
    },
];

const MODE_SUGGESTIONS: Record<CopilotMode, { icon: React.ReactNode; text: string; prompt: string }[]> = {
    general: [
        { icon: <Sparkles size={20} className="text-[#fea619]" />, text: 'هندسة الأوامر', prompt: 'ممكن تساعدني في صياغة Prompt احترافي لإنشاء صورة بالذكاء الاصطناعي عن...' },
        { icon: <Lightbulb size={20} className="text-yellow-500" />, text: 'بناء مسار عمل', prompt: 'كيف أبدأ بودكاست؟ أريد مسار عمل كامل يوضح الأدوات المطلوبة لكل خطوة.' },
        { icon: <PenTool size={20} className="text-orange-500" />, text: 'كتابة المحتوى', prompt: 'رشح لي أدوات تساعدني في كتابة مقالات متوافقة مع SEO.' },
        { icon: <Globe size={20} className="text-sky-500" />, text: 'معلومات عامة', prompt: 'اشرح لي الفرق بين الذكاء الاصطناعي التوليدي والذكاء الاصطناعي التقليدي بشكل مبسط.' },
    ],
    code: [
        { icon: <Code size={20} className="text-blue-500" />, text: 'إنشاء دالة', prompt: 'اكتب لي دالة بلغة JavaScript تقوم بترتيب مصفوفة من الأعداد تصاعدياً مع شرح تفصيلي.' },
        { icon: <TerminalSquare size={20} className="text-emerald-500" />, text: 'تصحيح كود', prompt: 'هذا الكود يعطيني خطأ: `const x = null; console.log(x.toString());` ما المشكلة وكيف أصلحها؟' },
        { icon: <Layers size={20} className="text-violet-500" />, text: 'شرح خوارزمية', prompt: 'اشرح لي خوارزمية البحث الثنائي (Binary Search) بلغة Python مع أمثلة.' },
        { icon: <Rocket size={20} className="text-rose-500" />, text: 'بناء API', prompt: 'اكتب لي REST API بسيط باستخدام Next.js App Router يتعامل مع CRUD operations.' },
    ],
    tools: [
        { icon: <Sparkles size={20} className="text-[#fea619]" />, text: 'أدوات الكتابة', prompt: 'أحتاج أدوات ذكاء اصطناعي لكتابة محتوى عربي احترافي. اقترح علي من Tolzy.' },
        { icon: <ImageIcon size={20} className="text-pink-500" />, text: 'أدوات التصميم', prompt: 'ابحث لي عن أدوات AI لتصميم الصور والشعارات والبوستات الاحترافية في Tolzy.' },
        { icon: <Code size={20} className="text-blue-500" />, text: 'أدوات البرمجة', prompt: 'أريد أفضل أدوات الذكاء الاصطناعي للمبرمجين من Tolzy مع روابطها.' },
        { icon: <Zap size={20} className="text-amber-500" />, text: 'أتمتة العمل', prompt: 'اقترح لي أدوات لأتمتة المهام المتكررة في العمل وزيادة الإنتاجية.' },
    ],
    learn: [
        { icon: <GraduationCap size={20} className="text-emerald-500" />, text: 'مسار React', prompt: 'أريد مسار تعلم React.js كامل من الصفر حتى الاحتراف. ارسم لي خطة دراسية.' },
        { icon: <BookOpen size={20} className="text-indigo-500" />, text: 'Prompt Engineering', prompt: 'اشرح لي أساسيات هندسة الأوامر (Prompt Engineering) مع أمثلة عملية.' },
        { icon: <Lightbulb size={20} className="text-yellow-500" />, text: 'تعلم No-Code', prompt: 'ما هي أفضل الأدوات لبناء مشاريع بدون كود؟ اقترح مسار تعلم منظم.' },
        { icon: <Globe size={20} className="text-sky-500" />, text: 'تعلم الذكاء الاصطناعي', prompt: 'أريد فهم أساسيات الذكاء الاصطناعي والتعلم الآلي. ارسم لي خطة تعلم مبسطة.' },
    ],
};

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const getApiBase = () => '';


const MessageItem = React.memo(({ msg, user, onResend }: {
    msg: Message,
    user: any,
    onResend?: (content: string) => void
}) => {
    const [displayedContent, setDisplayedContent] = useState(msg.isStreaming ? '' : msg.content);
    const lastContentRef = useRef(msg.content);

    useEffect(() => {
        if (!msg.isStreaming) {
            setDisplayedContent(msg.content);
            return;
        }

        const timer = setTimeout(() => {
            if (displayedContent.length < msg.content.length) {
                // Adaptive speed: catch up faster if the gap is large
                const gap = msg.content.length - displayedContent.length;
                const increment = gap > 100 ? 15 : gap > 20 ? 5 : 1;
                setDisplayedContent(msg.content.substring(0, displayedContent.length + increment));
            }
        }, displayedContent.length < msg.content.length ? 10 : 50);

        return () => clearTimeout(timer);
    }, [msg.content, msg.isStreaming, displayedContent]);


    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group relative mb-4 sm:mb-6`}
        >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm transition-transform group-hover:scale-105 relative
                ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'}
            `}>
                {msg.role === 'user' ? (
                    user?.photoURL ? <Image src={user.photoURL} alt="User" width={32} height={32} sizes="32px" /> : <User size={16} className="text-slate-500" />
                ) : (
                    <>
                        <Bot size={18} className="text-white relative z-10" />
                    </>
                )}
            </div>

            <div className={`flex flex-col flex-1 max-w-[calc(100%-40px)] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>


                <div className={`w-full px-4 py-3 sm:px-6 sm:py-5 rounded-2xl sm:rounded-[24px] text-[14px] sm:text-[16px] leading-relaxed relative transition-all duration-300
                    ${msg.role === 'user'
                        ? 'bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-tr-none shadow-sm'
                        : 'bg-white dark:bg-[#1A1A1A] border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-md sm:shadow-xl shadow-indigo-500/5 dark:shadow-black/20'
                    }
                `}>
                    {/* Bot Badge */}
                    {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-2.5">
                            <Sparkles size={12} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                Tolzy Copilot V2.5
                            </span>
                        </div>
                    )}

                    {(msg.status === 'thinking') ? (
                        /* ── Modern Thinking Indicator ─────────────────────── */
                        <div className="flex flex-col gap-3 py-1">
                            {/* Dots */}
                            <div className="flex items-center gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <motion.span
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500"
                                        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.9,
                                            delay: i * 0.18,
                                            ease: 'easeInOut'
                                        }}
                                    />
                                ))}
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 select-none">
                                    جاري التحليل...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <ReactMarkdown children={displayedContent} remarkPlugins={[remarkGfm as any]} components={{
                            p: ({ children }) => <p className="mb-2 sm:mb-4 last:mb-0 text-slate-700 dark:text-slate-300 font-medium leading-[1.6] sm:leading-[1.7]">{children}</p>,
                            h1: ({ children }) => <h1 className="text-lg sm:text-xl font-black mb-3 sm:mb-5 mt-2 text-indigo-600 dark:text-indigo-400 leading-tight">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-md sm:text-lg font-bold mb-2 sm:mb-4 mt-4 sm:mt-6 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-white/5 pb-1 sm:pb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm sm:text-md font-bold mb-2 sm:mb-3 mt-3 sm:mt-5 text-slate-800 dark:text-slate-200">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc list-outside mr-4 sm:mr-6 mb-3 sm:mb-5 space-y-1.5 sm:space-y-2.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-outside mr-4 sm:mr-6 mb-3 sm:mb-5 space-y-1.5 sm:space-y-2.5">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-700 dark:text-slate-300 pl-1">{children}</li>,
                            blockquote: ({ children }) => (
                                <blockquote className="border-r-4 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5 px-3 py-2 sm:px-4 sm:py-3 my-3 sm:my-4 rounded-l-lg italic text-slate-600 dark:text-slate-400">
                                    {children}
                                </blockquote>
                            ),
                            strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white underline decoration-indigo-500/30 underline-offset-4 decoration-2">{children}</strong>,
                            table: ({ children }) => (
                                <div className="overflow-x-auto my-6 rounded-xl border border-slate-200/50 dark:border-white/10">
                                    <table className="w-full text-sm text-right border-collapse bg-white/50 dark:bg-white/5">
                                        {children}
                                    </table>
                                </div>
                            ),
                            thead: ({ children }) => <thead className="bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white uppercase text-[10px] font-black tracking-widest">{children}</thead>,
                            th: ({ children }) => <th className="px-5 py-3 border-b border-slate-200/50 dark:border-white/10 text-indigo-600 dark:text-indigo-400">{children}</th>,
                            td: ({ children }) => <td className="px-5 py-3 border-b border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">{children}</td>,
                            code: ({ node, className, children, ...props }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                if (match && match[1] === 'tool') {
                                    const content = String(children);
                                    const lines = content.split('\n');
                                    const toolData: any = {};
                                    lines.forEach(line => {
                                        const colonIdx = line.indexOf(':');
                                        if (colonIdx > -1) {
                                            const rawKey = line.substring(0, colonIdx).trim().toLowerCase();
                                            const val = line.substring(colonIdx + 1).trim();
                                            
                                            // Handle multiple spelling variants
                                            if (rawKey.includes('name')) toolData.name = val;
                                            else if (rawKey.includes('description') || rawKey.includes('وصف')) toolData.description = val;
                                            else if (rawKey.includes('link') || rawKey.includes('رابط')) toolData.link = val;
                                            else if (rawKey.includes('category') || rawKey.includes('قسم')) toolData.category = val;
                                        }
                                    });
                                    return (
                                        <div className="my-3">
                                            <ToolCard
                                                name={toolData.name || 'أداة ذكاء اصطناعي'}
                                                description={toolData.description || ''}
                                                category={toolData.category}
                                                link={toolData.link}
                                            />
                                        </div>
                                    );
                                }

                                if (match && match[1] === 'course') {
                                    const content = String(children);
                                    const lines = content.split('\n');
                                    const courseData: any = {};
                                    lines.forEach(line => {
                                        const colonIdx = line.indexOf(':');
                                        if (colonIdx > -1) {
                                            const rawKey = line.substring(0, colonIdx).trim().toLowerCase();
                                            const val = line.substring(colonIdx + 1).trim();
                                            
                                            // Robust key matching
                                            if (rawKey.includes('title') || rawKey.includes('name')) courseData.title = val;
                                            else if (rawKey.includes('description')) courseData.description = val;
                                            else if (rawKey.includes('link')) courseData.link = val;
                                            else if (rawKey.includes('thumbnail')) courseData.thumbnail = val;
                                        }
                                    });
                                    const courseTitle = courseData.title || 'كورس تعليمي';
                                    const courseDesc = courseData.description || '';
                                    const courseLink = courseData.link || '#';
                                    const courseThumb = courseData.thumbnail || '';
                                    
                                    return (
                                        <>
                                            {/* Desktop: Card View */}
                                            <div className="hidden sm:block my-4 bg-white dark:bg-[#1A1A1A] border border-slate-200/60 dark:border-white/10 rounded-[18px] sm:rounded-[28px] overflow-hidden shadow-xl shadow-indigo-500/5 group/course transition-all duration-500 hover:border-indigo-500/30 w-full max-w-[calc(100vw-50px)] sm:max-w-[440px]">
                                                {courseThumb && (
                                                    <div className="relative h-36 sm:h-48 w-full overflow-hidden">
                                                        <img 
                                                            src={courseThumb} 
                                                            alt={courseTitle}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/course:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                                        <div className="absolute bottom-3 right-4 px-2.5 py-1 bg-indigo-600/90 backdrop-blur-md rounded-full text-[9px] font-bold text-white uppercase tracking-wider">
                                                            Tolzy Learn
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="p-3.5 sm:p-6">
                                                    {!courseThumb && (
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                                <Sparkles size={16} />
                                                            </div>
                                                            <span className="text-[9px] font-bold tracking-widest text-indigo-500 uppercase">Tolzy Learn</span>
                                                        </div>
                                                    )}
                                                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 leading-snug break-words">{courseTitle}</h3>
                                                    <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-5 font-medium">{courseDesc}</p>
                                                    
                                                    <a
                                                        href={courseLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 sm:py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-[0.98] group/btn"
                                                    >
                                                        <span>ابدأ التعلم الآن</span>
                                                        <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Mobile: Compact View */}
                                            <div className="sm:hidden my-2">
                                                <a
                                                    href={courseLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-3 w-full p-3 bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400"
                                                >
                                                    <div className="w-8 h-8 shrink-0 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                                                        <BookOpen size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold truncate leading-none mb-1">اقترحنا لك كورس:</p>
                                                        <h4 className="text-[13px] font-bold truncate opacity-90">{courseTitle}</h4>
                                                    </div>
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </>
                                    );
                                }

                                    return match ? (
                                        <div className="bg-[#0D0D0D] rounded-2xl overflow-hidden my-6 border border-white/10 shadow-2xl group/code w-full max-w-[95%] sm:max-w-[90%] mx-auto" dir="ltr">
                                            <div className="bg-[#1A1A1A] px-4 py-2.5 flex justify-between items-center border-b border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]"></div>
                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.2)]"></div>
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]"></div>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{match[1]}</span>
                                                </div>
                                                <button
                                                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-all duration-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 active:scale-95 group/copy min-w-[70px] justify-center"
                                                    onClick={() => {
                                                        const cleanContent = String(children).replace(/\n$/, '');
                                                        navigator.clipboard.writeText(cleanContent);
                                                        toast.success('تم نسخ الكود');
                                                    }}
                                                >
                                                    <Copy size={12} className="group-hover/copy:scale-110 transition-transform" />
                                                    <span>نسخ</span>
                                                </button>
                                            </div>
                                            <div className="relative overflow-x-auto text-left scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                        margin: 0,
                                                        padding: '1.25rem',
                                                        background: 'transparent',
                                                        fontSize: '13px',
                                                        lineHeight: '1.6',
                                                        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace'
                                                    }}
                                                    codeTagProps={{
                                                        style: {
                                                            background: 'transparent',
                                                            fontFamily: 'inherit',
                                                            display: 'block'
                                                        }
                                                    }}
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            </div>
                                        </div>
                                    ) : (
                                        <code className="bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[0.9em] font-black font-mono border border-indigo-500/10" {...props}>{children}</code>
                                    )
                            },
                            a: ({ node, className, href, children, ...props }: any) => {
                                let content = children;
                                if (typeof content === 'string' && content.startsWith('http')) {
                                    try {
                                        const urlObj = new URL(content);
                                        content = urlObj.hostname.replace('www.', '');
                                    } catch (e) { }
                                }
                                return (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium transition-colors mx-1 no-underline border border-indigo-100 dark:border-indigo-500/10"
                                        {...props}
                                    >
                                        <ExternalLink size={12} className="flex-shrink-0" />
                                        <span className="truncate max-w-[200px]">{content}</span>
                                    </a>
                                );
                            }
                        }} />
                    )}
                    {/* Streaming Cursor */}
                    {msg.isStreaming && (
                        <span
                            className="inline-block w-[2px] h-4 bg-indigo-500 ml-0.5 rounded-sm align-middle"
                            style={{ animation: 'blink 0.8s step-end infinite' }}
                        />
                    )}
                </div>

                {/* Message Actions — Assistant */}
                {msg.role === 'assistant' && !msg.isStreaming && (
                    <div className="flex items-center gap-1.5 mt-2.5 px-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('تم النسخ'); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-bold transition-all rounded-xl hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                            title="نسخ الرد"
                        >
                            <Copy size={13} />
                            <span>نسخ</span>
                        </button>
                    </div>
                )}

                {/* Message Actions — User */}
                {msg.role === 'user' && (
                    <div className="flex items-center gap-1.5 mt-2 px-1 justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('تم النسخ'); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[11px] font-bold transition-all rounded-xl hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                            title="نسخ الرسالة"
                        >
                            <Copy size={13} />
                            <span>نسخ</span>
                        </button>
                        {onResend && (
                            <button
                                onClick={() => onResend(msg.content)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-bold transition-all rounded-xl hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                                title="إعادة الإرسال"
                            >
                                <RotateCcw size={13} />
                                <span>إعادة الإرسال</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
});
MessageItem.displayName = 'MessageItem';


const ChatInterface = ({ initialChatId }: { initialChatId?: string }) => {
    const { user, userProfile } = useAuth();
    const { userData, refreshUserData } = useUserData();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
    const isProPlan = normalizedPlan.includes('pro') || normalizedPlan.includes('ultra');
    const isFree = !isProPlan;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [showAtMenu, setShowAtMenu] = useState(false);
    const [atMenuFilter, setAtMenuFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { isListening, transcript, toggleListening, hasSupport } = useSpeechRecognition();

    useEffect(() => {
        if (isListening && transcript) {
            setInput(transcript);
        }
    }, [transcript, isListening]);
    const [isMounted, setIsMounted] = useState(false);
    const [lastMessageId, setLastMessageId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialChatId || null);
    const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
    const [mode, setMode] = useState<CopilotMode>('general');
    const [isToolSelectorOpen, setIsToolSelectorOpen] = useState(false);
    const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);
    const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);
    // Auto-start chat from URL query parameter
    const [hasHandledInitialQuery, setHasHandledInitialQuery] = useState(false);

    const [loadingText, setLoadingText] = useState('جاري التفكير...');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // const supabase = createClientComponentClient();

    const LOADING_MESSAGES = [
        "جاري تحليل طلبك...",
        "أبحث لك عن أفضل الأدوات...",
        "أقوم بصياغة الإجابة...",
        "تتم مراجعة المعلومات...",
        "لحظات وأكون معك..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            let index = 0;
            setLoadingText(LOADING_MESSAGES[0]);
            interval = setInterval(() => {
                index = (index + 1) % LOADING_MESSAGES.length;
                setLoadingText(LOADING_MESSAGES[index]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const loadConversation = (conversation: Conversation) => {
        setCurrentConversationId(conversation.id);
        setMessages(conversation.messages);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        setIsMounted(true);
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!hasHandledInitialQuery && !initialChatId && messages.length === 0 && !isLoading) {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            if (q) {
                setHasHandledInitialQuery(true);
                // setTimeout ensures state is settled before sending
                setTimeout(() => handleSendMessage(q), 100);
                window.history.replaceState({}, '', '/copilot');
            }
        }
    }, [hasHandledInitialQuery, initialChatId, messages.length, isLoading]);

    // Load Conversations
    useEffect(() => {
        if (!user) return;
        const fetchConversations = async () => {
            try {
                const { data, error } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('user_id', user.uid)
                    .order('updated_at', { ascending: false });
                if (data) setConversations(data as Conversation[]);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        fetchConversations();
    }, [user]);

    // Additional effects for initialChatId loading logic... (omitted for brevity, main logic handled below)
    useEffect(() => {
        if (currentConversationId && conversations.length > 0) {
            const conv = conversations.find(c => c.id === currentConversationId);
            if (conv) setMessages(conv.messages);
        }
    }, [currentConversationId, conversations]);


    const handleSendMessage = async (customPrompt?: string) => {
        if (!user) {
            toast.error('يرجى تسجيل الدخول أولاً للمحادثة');
            window.location.href = '/auth';
            return;
        }

        const promptText = customPrompt || input.trim();
        if (!promptText || isLoading) return;

        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: promptText
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        if (textareaRef.current) {
            textareaRef.current.style.height = '48px';
        }

        const assistantMessageId = generateId();
        const startTime = Date.now();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            isStreaming: false,
            status: 'thinking',
            modelId: 'tolzy-v2.5',
            tools: []
        };
        setMessages(prev => [...prev, assistantMessage]);
        setLastMessageId(assistantMessageId);

        try {
            const response = await fetch(`${getApiBase()}/api/copilot/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: promptText,
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    userId: user?.uid,
                    userPlan: isProPlan ? 'pro' : 'free',
                    userName: userData?.displayName || user?.displayName || user?.email || 'مستخدم',
                    enableSearch: isSearchEnabled,
                    selectedTool: selectedTool.id,
                    mode: mode
                })
            });

            if (!response.ok) throw new Error('API Error');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulatedContent = '';
            let hasStartedStreaming = false;
            let thinkingDuration = 0;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: !done });

                if (chunkValue) {
                    if (!hasStartedStreaming) {
                        hasStartedStreaming = true;
                        thinkingDuration = Math.round((Date.now() - startTime) / 1000);
                    }
                    accumulatedContent += chunkValue;

                    setMessages(prev => prev.map(m =>
                        m.id === assistantMessageId
                            ? {
                                ...m,
                                content: accumulatedContent,
                                isStreaming: true,
                                status: 'streaming',
                                thinkingDuration
                              }
                            : m
                    ));
                }
            }

            // Final update to mark as not streaming
            setMessages(prev => prev.map(m =>
                m.id === assistantMessageId
                    ? { ...m, isStreaming: false, status: 'complete' }
                    : m
            ));

            // Final content to save
            const finalContentToSave = accumulatedContent;
            const finalThinkingToSave = undefined;

            // Update Conversation Logic (Simplified)
            if (!currentConversationId) {
                const newId = generateId();
                const title = promptText.slice(0, 30);
                const newConv: Conversation = {
                    id: newId,
                    user_id: user?.uid || '',
                    title,
                    messages: [userMessage, { ...assistantMessage, content: finalContentToSave, isStreaming: false, status: 'complete' as const, thinkingProcess: finalThinkingToSave }],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setConversations(prev => [newConv, ...prev]);
                setCurrentConversationId(newId);
                // Save to DB (Fire and forget or await)
                supabase.from('conversations').insert([newConv]).then(({ error }) => {
                    if (error) console.error('Error creating conversation:', error);
                    else {
                        // Update URL to /copilot/[id] without full reload
                        window.history.pushState({}, '', `/copilot/${newId}`);
                    }
                });
            } else {
                // Update existing conversation locally
                const updatedMessages = [...messages, userMessage, { ...assistantMessage, content: finalContentToSave, isStreaming: false, status: 'complete' as const, thinkingProcess: finalThinkingToSave }];

                setConversations(prev => prev.map(c =>
                    c.id === currentConversationId
                        ? { ...c, messages: updatedMessages, updated_at: new Date().toISOString() }
                        : c
                ));

                // Update DB
                supabase.from('conversations')
                    .update({
                        messages: updatedMessages,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentConversationId)
                    .then(({ error }) => {
                        if (error) console.error('Error updating conversation:', error);
                    });
            }
            // Refresh user data (limit count) after successful send
            refreshUserData?.();

        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء الاتصال');
            setMessages(prev => prev.map(m =>
                m.id === assistantMessageId
                    ? { ...m, content: m.content || "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.", isStreaming: false, status: 'complete' as const }
                    : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleTypingComplete = (id: string) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isStreaming: false } : m));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInput(val);
        // Detect @ trigger
        const lastAtIdx = val.lastIndexOf('@');
        if (lastAtIdx !== -1) {
            const afterAt = val.slice(lastAtIdx + 1);
            if (!afterAt.includes(' ')) {
                setAtMenuFilter(afterAt);
                setShowAtMenu(true);
            } else {
                setShowAtMenu(false);
            }
        } else {
            setShowAtMenu(false);
        }
        if (val.trim() === '') {
            e.target.style.height = '48px';
        } else {
            e.target.style.height = 'auto';
            const newHeight = Math.min(e.target.scrollHeight, 192);
            e.target.style.height = `${newHeight}px`;
        }
    };

    const handleAtSelect = (cmdId: string) => {
        // Replace @... in input with nothing, and switch mode
        const lastAtIdx = input.lastIndexOf('@');
        const cleaned = lastAtIdx !== -1 ? input.slice(0, lastAtIdx) : input;
        setInput(cleaned);
        setMode(cmdId as CopilotMode);
        setShowAtMenu(false);
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const deleteConversation = async (id: string) => {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConversationId === id) {
            setCurrentConversationId(null);
            setMessages([]);
        }
        await supabase.from('conversations').delete().eq('id', id);
        toast.success('تم حذف المحادثة');
    };

    const renameConversation = async (id: string, newTitle: string) => {
        // Placeholder for rename logic
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
        toast.success('تم تغيير الاسم');
    };

    const deleteAllConversations = async () => {
        if (!user) return;
        if (!window.confirm('هل أنت متأكد من حذف جميع المحادثات نهائياً؟')) return;
        
        const { error } = await supabase.from('conversations').delete().eq('user_id', user.uid);
        if (error) {
            toast.error('حدث خطأ أثناء الحذف');
            return;
        }
        
        setConversations([]);
        setMessages([]);
        setCurrentConversationId(null);
        toast.success('تم حذف جميع المحادثات بنجاح');
    };

    const startNewChat = () => {
        setMessages([]);
        setCurrentConversationId(null);
        setLastMessageId(null);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const getUserInitials = () => {
        if (userData?.displayName) return userData.displayName.slice(0, 2).toUpperCase();
        if (user?.email) return user.email.slice(0, 2).toUpperCase();
        return 'U';
    };

    // Group Conversations by Date
    const groupedConversations = conversations.reduce((groups, conversation) => {
        const date = new Date(conversation.updated_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

        let label = 'السابق';
        if (diffDays === 0) label = 'اليوم';
        else if (diffDays === 1) label = 'أمس';
        else if (diffDays <= 7) label = 'الأسبوع السابق';
        else if (diffDays <= 30) label = 'الشهر السابق';

        if (!groups[label]) groups[label] = [];
        groups[label].push(conversation);
        return groups;
    }, {} as Record<string, Conversation[]>);

    const groupOrder = ['اليوم', 'أمس', 'الأسبوع السابق', 'الشهر السابق', 'السابق'];


    return (
        <>


            <div className="flex h-[100dvh] bg-[#F9F9F9] dark:bg-[#111] overflow-hidden dir-rtl" dir="rtl">

                {/* Sidebar has been consolidated below */}

                {/* Unified Sidebar */}
                <AnimatePresence initial={false}>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                            className="fixed lg:relative z-50 h-full w-[280px] bg-white dark:bg-[#0A0A0A] border-l border-gray-100 dark:border-white/5 flex flex-col shadow-2xl lg:shadow-none"
                        >
                            {/* Header: Toggle & New Chat */}
                            <div className="p-4 flex items-center justify-between gap-3 border-b border-transparent">
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <Menu size={20} />
                                </button>
                                <button
                                    onClick={startNewChat}
                                    className="flex-1 p-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold"
                                >
                                    <Plus size={18} />
                                    محادثة جديدة
                                </button>
                            </div>

                            {/* Conversation List */}
                            <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar scrollbar-hide">
                                {groupOrder.map(label => {
                                    const items = groupedConversations[label];
                                    if (!items || items.length === 0) return null;
                                    return (
                                        <div key={label} className="mb-6">
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 px-3 mb-2">{label}</h3>
                                            <div className="space-y-0.5">
                                                {items.map(conv => (
                                                    <div
                                                        key={conv.id}
                                                        onClick={() => {
                                                            loadConversation(conv);
                                                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                                        }}
                                                        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors
                                                            ${currentConversationId === conv.id
                                                                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold'
                                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                                                            }
                                                        `}
                                                    >
                                                        <span className="truncate text-sm flex-1 ml-2">{conv.title}</span>
                                                        
                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
                                                                    deleteConversation(conv.id);
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* User Info & Settings Footer */}
                            <div className="p-3 mt-auto border-t border-gray-100 dark:border-white/5">
                                {user && (
                                    <div className="flex items-center justify-between">
                                        <Link href="/profile" className="flex items-center gap-3 min-w-0 hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-xl transition-colors flex-1 cursor-pointer">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden relative">
                                                {user?.photoURL ? <Image src={user.photoURL} alt="User" fill className="object-cover" sizes="32px" /> : getUserInitials()}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{userData?.displayName || 'مستخدم'}</span>
                                                <span className="text-[10px] text-gray-500 truncate">{user?.email}</span>
                                            </div>
                                        </Link>
                                        <div className="relative shrink-0">
                                            <button 
                                                onClick={() => setIsSettingsPopoverOpen(!isSettingsPopoverOpen)}
                                                className={`p-2 rounded-xl transition-colors ${isSettingsPopoverOpen ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <AnimatePresence>
                                                {isSettingsPopoverOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-1.5 z-[100] overflow-hidden"
                                                    >
                                                        <div className="space-y-0.5">
                                                            <button onClick={() => toggleDarkMode()} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-sm transition-colors">
                                                                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                                                                <span className="font-bold flex-1 text-right">المظهر</span>
                                                            </button>
                                                            <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                                                            <button onClick={() => deleteAllConversations()} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 text-sm transition-colors">
                                                                <Trash2 size={16} />
                                                                <span className="font-bold flex-1 text-right">حذف كل المحادثات</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col relative h-full w-full">

                    {/* Top Bar - Ultra Minimalist / Gemini Style */}
                    <header className="absolute top-0 left-0 right-0 h-16 z-[40] flex items-center justify-between px-4 sm:px-6 bg-transparent pointer-events-none transition-all duration-500">
                        {/* Right Side: Toggle & Logo */}
                        <div className="flex items-center gap-3 pointer-events-auto">
                            {!isSidebarOpen && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    title="فتح القائمة"
                                >
                                    <Menu size={20} />
                                </button>
                            )}
                            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-500 tracking-tighter uppercase mr-1">TOLZY</span>
                        </div>

                        {/* Left Side: Account ONLY */}
                        <div className="flex items-center gap-3 sm:gap-6 pointer-events-auto relative">
                            {/* Profile & Plan Badge */}
                            <div className="relative">
                                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsAccountPopoverOpen(!isAccountPopoverOpen)}>
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden relative border border-slate-200 dark:border-white/10 shadow-sm group-hover:bg-slate-200 dark:group-hover:bg-white/20 transition-all">
                                        {user?.photoURL ? (
                                            <Image src={user.photoURL} alt="User" fill className="object-cover" sizes="40px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-300 uppercase font-bold text-xs">
                                                {getUserInitials()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <AnimatePresence>
                                    {isAccountPopoverOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 z-[100]"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden mb-3 border border-slate-200 dark:border-white/10">
                                                    {user?.photoURL ? (
                                                        <Image src={user.photoURL} alt="User" width={56} height={56} className="object-cover" />
                                                    ) : (
                                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{getUserInitials()}</span>
                                                    )}
                                                </div>
                                                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">{userData?.displayName || 'مستخدم TOLZY'}</h4>
                                                <p className="text-xs text-slate-500 mb-4">{user?.email}</p>
                                                
                                                <div className="w-full border-t border-slate-100 dark:border-white/5 pt-4 space-y-2">
                                                    
                                                    <button onClick={() => deleteAllConversations()} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/20">
                                                        <Trash2 size={14} />
                                                        <span>حذف جميع المحادثات</span>
                                                    </button>
                                                    <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                                        <LogOut size={14} />
                                                        <span>تسجيل الخروج</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </header>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-2.5 sm:px-4 pb-48 pt-16 scrollbar-hide">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col lg:items-center lg:justify-center max-w-4xl mx-auto px-4 py-10 lg:py-20 animate-in fade-in duration-700">
                                {/* Welcome Header */}
                                <div className="mb-10 lg:mb-16 text-right lg:text-center w-full">
                                    <h1 className="text-3xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 to-[#fea619] dark:from-white dark:to-[#fea619] bg-clip-text text-transparent mb-4 tracking-tight">
                                        {user 
                                            ? `مرحباً ${userData?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'مستخدم'}` 
                                            : 'مرحبا بك في تولزي Copilot'}
                                    </h1>
                                    <h2 className="text-2xl lg:text-4xl font-medium text-slate-700 dark:text-slate-300">
                                        من أين نبدأ؟
                                    </h2>
                                </div>

                                {/* Central Input Capsule (Removed) */}
                                <div className="hidden lg:block w-full max-w-3xl mb-6">
                                </div>

                                {/* Vertical/Scattered Suggestions — Mode-aware */}
                                <div className="flex flex-col lg:flex-row lg:flex-wrap items-end lg:justify-center gap-4 lg:gap-6 w-full max-w-4xl mx-auto px-4">
                                    {MODE_SUGGESTIONS[mode].map((s, i) => (
                                        <motion.button
                                            key={`${mode}-${i}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => handleSendMessage(s.prompt)}
                                            className="inline-flex items-center gap-3 px-8 py-3.5 bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-[#222] border border-slate-200/50 dark:border-white/10 rounded-full transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 group whitespace-nowrap"
                                        >
                                            <span className="text-slate-700 dark:text-slate-200 text-sm font-bold tracking-tight">{s.text}</span>
                                            <div className="w-5 h-5 flex items-center justify-center shrink-0 group-hover:scale-125 transition-transform duration-300">
                                                {s.icon}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Premium Experience Note (Desktop Only) */}
                                <div className="hidden lg:block mt-auto pb-8 text-center w-full">
                                    <span className="text-[10px] font-black tracking-[0.2em] text-indigo-500/50 uppercase dark:text-indigo-400/30">
                                    
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-6">
                                {messages.map((msg) => (
                                    <MessageItem
                                        key={msg.id}
                                        msg={msg}
                                        user={user}
                                        onResend={(content) => handleSendMessage(content)}
                                    />
                                ))}

                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        )}
                    </div>

                    {/* Input Area - Gemini Style (Unified) */}
                    <div className={`absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 sm:pb-6 pt-12 transition-all duration-500 ${
                        messages.length === 0 
                            ? 'bg-transparent pb-8 lg:pb-20' 
                            : 'bg-gradient-to-t from-[#F9F9F9] via-[#F9F9F9]/80 to-transparent dark:from-[#111] dark:via-[#111]/80'
                    }`}>
                        <div className="max-w-3xl mx-auto relative">
                            {/* Backdrop for closing dropdowns when clicking outside */}
                            {(isToolSelectorOpen || isAccountPopoverOpen || isSettingsPopoverOpen) && (
                                <div 
                                    className="fixed inset-0 z-40 bg-transparent" 
                                    onClick={() => {
                                        setIsToolSelectorOpen(false);
                                        setIsAccountPopoverOpen(false);
                                        setIsSettingsPopoverOpen(false);
                                    }}
                                />
                            )}

                            {/* Gemini-Style Pill Input Bar */}
                            <div className="relative bg-white dark:bg-[#1A1A1A] rounded-full border border-slate-200/80 dark:border-white/10 shadow-[0_1px_6px_rgba(0,0,0,0.08)] dark:shadow-none focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.12)] dark:focus-within:shadow-[0_2px_12px_rgba(255,255,255,0.04)] focus-within:border-slate-300 dark:focus-within:border-white/20 transition-all duration-300">
                                <div className="flex items-center px-2 sm:px-4 py-2 sm:py-2.5 gap-1 sm:gap-2">
                                    {/* Left: Mic */}
                                    {hasSupport && (
                                        <button
                                            onClick={toggleListening}
                                            title={isListening ? "إيقاف التسجيل" : "تحدث"}
                                            className={`flex-shrink-0 p-2 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                        >
                                            <Mic size={20} />
                                        </button>
                                    )}

                                    {/* TOLZY Copilot V2.5 Static Badge */}
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex-shrink-0">
                                        <Sparkles size={12} className="text-indigo-500" />
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">TOLZY Copilot V2.5</span>
                                    </div>

                                    {/* Text Input + @ Menu */}
                                    <div className="relative flex-1">
                                        <textarea
                                            ref={textareaRef}
                                            value={input}
                                            onChange={handleInputChange}
                                            onKeyDown={(e) => {
                                                if (showAtMenu && (e.key === 'Escape')) {
                                                    setShowAtMenu(false);
                                                    e.preventDefault();
                                                    return;
                                                }
                                                handleKeyDown(e);
                                            }}
                                            placeholder={MODES.find(m => m.id === mode)?.placeholder || 'اسأل Tolzy Copilot... (اكتب @ لاختيار الوضع)'}
                                            rows={1}
                                            disabled={isLoading}
                                            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-1 text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 max-h-40 min-h-[40px] scrollbar-hide text-right leading-5"
                                            style={{ height: '40px' }}
                                            dir="rtl"
                                        />

                                        {/* @ Mention Dropdown */}
                                        <AnimatePresence>
                                            {showAtMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute bottom-full mb-2 right-0 w-64 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50"
                                                >
                                                    <div className="px-3 pt-2.5 pb-1.5 border-b border-slate-100 dark:border-white/5">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">اختر وضع الاستخدام</span>
                                                    </div>
                                                    <div className="p-1.5 space-y-0.5">
                                                        {AT_COMMANDS
                                                            .filter(cmd => !atMenuFilter || cmd.label.includes(atMenuFilter) || cmd.id.includes(atMenuFilter.toLowerCase()))
                                                            .map((cmd) => (
                                                                <button
                                                                    key={cmd.id}
                                                                    onClick={() => !cmd.comingSoon && handleAtSelect(cmd.id)}
                                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-right transition-all group ${
                                                                        cmd.comingSoon
                                                                            ? 'opacity-60 cursor-not-allowed'
                                                                            : 'hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer'
                                                                    }`}
                                                                >
                                                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-white/5 ${cmd.color} group-hover:scale-110 transition-transform`}>
                                                                        {cmd.icon}
                                                                    </span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">@{cmd.label}</span>
                                                                            {cmd.comingSoon && (
                                                                                <span className="text-[8px] font-black bg-gradient-to-r from-violet-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full">قريباً</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{cmd.description}</p>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Right: Mode Selector */}
                                    <div className="relative flex-shrink-0">
                                        <button
                                            onClick={() => setIsToolSelectorOpen(prev => !prev)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
                                                isToolSelectorOpen
                                                    ? 'bg-slate-100 dark:bg-white/15 text-slate-900 dark:text-white'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="flex items-center justify-center">
                                                {MODES.find(m => m.id === mode)?.icon}
                                            </span>
                                            <span className="hidden sm:inline">الأدوات</span>
                                            <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isToolSelectorOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Mode Dropdown */}
                                        <AnimatePresence>
                                            {isToolSelectorOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                                                    transition={{ duration: 0.12 }}
                                                    className="absolute bottom-full right-0 mb-1.5 w-44 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg p-1 z-50"
                                                >
                                                    {MODES.map((m) => {
                                                        const isActive = mode === m.id;
                                                        const isCodeMode = m.id === 'code';
                                                        return (
                                                            <button
                                                                key={m.id}
                                                                onClick={() => {
                                                                    if (isCodeMode) {
                                                                        toast('ميزة البرمجة قادمة قريباً! 🚀', { icon: '⏳' });
                                                                        setIsToolSelectorOpen(false);
                                                                        return;
                                                                    }
                                                                    setMode(m.id);
                                                                    setIsToolSelectorOpen(false);
                                                                }}
                                                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-right text-xs font-bold transition-all ${
                                                                    isActive
                                                                        ? `${m.bg} ${m.color}`
                                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                                                                } ${isCodeMode ? 'opacity-70' : ''}`}
                                                            >
                                                                <span className={`flex items-center justify-center w-5 h-5 rounded-full ${isActive ? 'bg-white/60 dark:bg-white/10' : 'bg-slate-100 dark:bg-white/5'}`}>
                                                                    {m.icon}
                                                                </span>
                                                                <span className="flex-1">{m.label}</span>
                                                                {isCodeMode && (
                                                                    <span className="text-[8px] font-black bg-gradient-to-r from-violet-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full">قريباً</span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Send Button */}
                                    <button
                                        onClick={() => handleSendMessage()}
                                        disabled={!input.trim() || isLoading}
                                        className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                            input.trim()
                                                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-300'
                                        }`}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Centered Disclaimer Footer */}
                            <div className="mt-4 pb-2">
                                <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-tight">
                                    Tolzy Copilot <span className="opacity-70"> هو نموذج ذكاء اصطناعي وقد ينتج عنه أخطاء.</span>
                                </p>
                            </div>
                        </div>
                    </div>



                </main>
            </div>
        </>
    );
};

export default ChatInterface;

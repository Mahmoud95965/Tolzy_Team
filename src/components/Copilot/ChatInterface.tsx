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
    Shield
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

interface ModelOption {
    id: string;
    name: string;
    description: string;
}

const MODELS: ModelOption[] = [
    { id: 'fast', name: 'السريع', description: 'استجابة فورية للبحث والأسئلة المباشرة.' },
    { id: 'pro', name: 'البرو', description: 'الأداء المتوازن والمثالي لمهامك اليومية.' },
    { id: 'thinking', name: 'المفكر', description: 'تحليل عميق بخطوات منطقية للمسائل المعقدة.' }
];

const TOOLS = [
    { id: 'programming', name: 'الأكواد', icon: <Code size={16} /> }
];

const SUGGESTIONS = [
    { icon: <Sparkles size={20} className="text-[#fea619]" />, text: 'هندسة الأوامر', prompt: 'ممكن تساعدني في صياغة Prompt احترافي لإنشاء صورة بالذكاء الاصطناعي عن...' },
    { icon: <Lightbulb size={20} className="text-yellow-500" />, text: 'بناء مسار عمل (Workflow)', prompt: 'كيف أبدأ بودكاست؟ أريد مسار عمل كامل يوضح الأدوات المطلوبة لكل خطوة.' },
    { icon: <Code size={20} className="text-blue-500" />, text: 'برمجة ذكية', prompt: 'ما هي أفضل أدوات الذكاء الاصطناعي للمبرمجين المتقدمين؟' },
    { icon: <PenTool size={20} className="text-orange-500" />, text: 'كتابة المحتوى', prompt: 'رشح لي أدوات تساعدني في كتابة مقالات متوافقة مع SEO.' },
];

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


const MessageItem = React.memo(({ msg, user }: {
    msg: Message,
    user: any
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

    const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

    const isFast = msg.modelId === 'fast';
    const isThinkingModel = msg.modelId === 'thinking';
    const thinkingDuration = isFast ? 0.6 : 1.5;

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
                        {(!msg.thinkingProcess && msg.status === 'thinking') && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: thinkingDuration }}
                                className="absolute inset-0 bg-white/20"
                            />
                        )}
                        <Bot size={18} className={`text-white relative z-10 ${(!msg.thinkingProcess && msg.status === 'thinking') ? 'animate-pulse' : ''}`} />
                    </>
                )}
            </div>

            <div className={`flex flex-col flex-1 max-w-[calc(100%-40px)] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Thinking Process Header (For Thinker Model) */}
                {msg.role === 'assistant' && isThinkingModel && (msg.status === 'streaming' || msg.status === 'complete') && (
                    <div className="w-full mb-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-blue-500 animate-pulse" />
                                <button 
                                    onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-white/10 shadow-sm"
                                >
                                    <span>عرض طريقة التفكير</span>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isThinkingExpanded ? 'rotate-180' : ''}`} />
                                </button>
                             </div>
                             {msg.thinkingDuration !== undefined && (
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                    تم التفكير في {msg.thinkingDuration} ثانية
                                </span>
                             )}
                        </div>
                        
                        <AnimatePresence>
                            {isThinkingExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mr-3 pl-4 border-l-2 border-slate-200 dark:border-white/10 py-2 text-[14px] font-medium text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed">
                                        {msg.thinkingProcess || "جاري التفكير وجمع المعلومات..."}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className={`w-full px-4 py-3 sm:px-6 sm:py-5 rounded-2xl sm:rounded-[24px] text-[14px] sm:text-[16px] leading-relaxed relative transition-all duration-300
                    ${msg.role === 'user'
                        ? 'bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-tr-none shadow-sm'
                        : 'bg-white dark:bg-[#1A1A1A] border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-md sm:shadow-xl shadow-indigo-500/5 dark:shadow-black/20'
                    }
                `}>
                    {/* Bot Badge - Assistant only */}
                    {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-2.5">
                            <Sparkles size={12} className={`text-indigo-500 ${msg.status === 'thinking' ? 'animate-spin-slow' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                {msg.status === 'thinking' ? 'جاري التفكير...' : 'Tolzy AI'}
                            </span>
                        </div>
                    )}

                    {(!msg.thinkingProcess && msg.status === 'thinking') ? (
                        <div className="flex flex-col gap-2 min-w-[100px]">
                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div 
                                    animate={{ left: ['-100%', '100%'] }}
                                    transition={{ repeat: Infinity, duration: thinkingDuration, ease: "linear" }}
                                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"
                                />
                            </div>
                            <div className="h-2 w-2/3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div 
                                    animate={{ left: ['-100%', '100%'] }}
                                    transition={{ repeat: Infinity, duration: thinkingDuration, ease: "linear", delay: isFast ? 0.2 : 0.5 }}
                                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"
                                />
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

                {/* Message Actions */}
                {msg.role === 'assistant' && !msg.isStreaming && (
                    <div className="flex items-center gap-1.5 mt-3 px-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                                toast.success('تم النسخ');
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all rounded-xl hover:bg-white dark:hover:bg-white/10 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                            title="نسخ"
                        >
                            <Copy size={15} />
                        </button>
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
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [lastMessageId, setLastMessageId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialChatId || null);
    const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[0]);
    const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [isToolSelectorOpen, setIsToolSelectorOpen] = useState(false);
    const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);
    const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);
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
            modelId: selectedModel.id,
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
                    model: 'google/gemini-2.0-flash-001', // Keep using high-performance model backend
                    userId: user?.uid,
                    userPlan: userData?.role === 'pro' ? 'pro' : 'free',
                    userName: userData?.displayName || user?.displayName || user?.email || 'مستخدم',
                    enableSearch: isSearchEnabled,
                    selectedTool: selectedTool.id,
                    thinking: selectedModel.id === 'thinking'
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

            const isThinkingModel = selectedModel.id === 'thinking';

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

                    let displayContent = accumulatedContent;
                    let displayThinking = '';

                    if (isThinkingModel) {
                        const thinkStartIdx = accumulatedContent.indexOf('<think>');
                        const thinkEndIdx = accumulatedContent.indexOf('</think>');
                        
                        if (thinkStartIdx !== -1) {
                            if (thinkEndIdx !== -1) {
                                // Both tags present
                                displayThinking = accumulatedContent.substring(thinkStartIdx + 7, thinkEndIdx).trim();
                                displayContent = accumulatedContent.substring(thinkEndIdx + 8).trim();
                            } else {
                                // Only start tag present, currently streaming thoughts
                                displayThinking = accumulatedContent.substring(thinkStartIdx + 7).trim();
                                displayContent = ''; // Wait until thinking is done
                            }
                        } else {
                            // No tags found yet, or model didn't use them (fallback)
                            displayContent = accumulatedContent;
                        }
                    }

                    setMessages(prev => prev.map(m =>
                        m.id === assistantMessageId
                            ? { 
                                ...m, 
                                content: displayContent, 
                                thinkingProcess: displayThinking || undefined,
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

            // Determine final content for saving
            let finalContentToSave = accumulatedContent;
            let finalThinkingToSave = undefined;

            if (isThinkingModel) {
                const thinkStartIdx = accumulatedContent.indexOf('<think>');
                const thinkEndIdx = accumulatedContent.indexOf('</think>');
                
                if (thinkStartIdx !== -1 && thinkEndIdx !== -1) {
                    finalThinkingToSave = accumulatedContent.substring(thinkStartIdx + 7, thinkEndIdx).trim();
                    finalContentToSave = accumulatedContent.substring(thinkEndIdx + 8).trim();
                } else {
                    finalContentToSave = accumulatedContent;
                }
            }

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
        setInput(e.target.value);
        if (e.target.value.trim() === '') {
            e.target.style.height = '48px';
        } else {
            e.target.style.height = 'auto';
            const newHeight = Math.min(e.target.scrollHeight, 192); // Max height 192px (48px * 4 lines roughly)
            e.target.style.height = `${newHeight}px`;
        }
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

                {/* Slim Sidebar (Gemini Style) */}
                <div className="hidden lg:flex flex-col items-center py-4 w-[68px] bg-white dark:bg-[#111111] border-l border-slate-200 dark:border-white/5 z-[60]">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 mb-4 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                        title={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
                    >
                        <Menu size={20} />
                    </button>
                    
                    <button
                        onClick={startNewChat}
                        className="p-3 mb-auto rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-indigo-600 transition-all border border-slate-200/50 dark:border-white/10"
                        title="محادثة جديدة"
                    >
                        <Plus size={20} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsSettingsPopoverOpen(!isSettingsPopoverOpen)}
                            className={`p-3 rounded-xl transition-all ${isSettingsPopoverOpen ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                            title="الإعدادات"
                        >
                            <Settings size={20} />
                        </button>
                        
                        <AnimatePresence>
                            {isSettingsPopoverOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                    className="fixed right-[68px] bottom-6 w-64 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 z-[100] overflow-hidden"
                                >
                                    <div className="space-y-0.5">
                                        <button onClick={() => toggleDarkMode()} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm transition-colors group">
                                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                                            <span className="font-bold flex-1 text-right">المظهر</span>
                                            <span className="text-[10px] text-slate-400">{isDarkMode ? 'داكن' : 'فاتح'}</span>
                                        </button>
                                        
                                        <Link href="/changelog" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm transition-colors group">
                                            <Sparkles size={16} />
                                            <span className="font-bold flex-1 text-right">ما الجديد؟</span>
                                        </Link>
                                        
                                        <Link href="/privacy" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm transition-colors group">
                                            <Shield size={16} />
                                            <span className="font-bold flex-1 text-right">سياسة الخصوصية</span>
                                        </Link>

                                        <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                                        <button onClick={() => deleteAllConversations()} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 text-sm transition-colors group">
                                            <Trash2 size={16} />
                                            <span className="font-bold flex-1 text-right">حذف كل المحادثات</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar */}
                <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`fixed lg:relative z-50 
                                h-full w-[280px] lg:w-[300px] 
                                bg-white dark:bg-[#111111] 
                                border-l border-slate-200 dark:border-white/5 flex flex-col
                                shadow-xl lg:shadow-none
                            `}
                        >
                            {/* Header: Menu & Search */}
                            <div className="p-4 flex items-center justify-between gap-3 border-b border-slate-50 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                                    >
                                        <Menu size={20} />
                                    </button>
                                    <h2 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">TOLZY</h2>
                                </div>
                                <button
                                    onClick={startNewChat}
                                    className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
                                    title="محادثة جديدة"
                                >
                                    <Plus size={18} />
                                    <span className="hidden sm:inline">جديدة</span>
                                </button>
                            </div>

                            {/* Conversation List */}
                            <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar scrollbar-hide">
                                {groupOrder.map(label => {
                                    const items = groupedConversations[label];
                                    if (!items || items.length === 0) return null;
                                    return (
                                        <div key={label} className="mb-6">
                                            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 mb-3">{label}</h3>
                                            <div className="space-y-1">
                                                {items.map(conv => (
                                                    <div
                                                        key={conv.id}
                                                        onClick={() => {
                                                            loadConversation(conv);
                                                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                                        }}
                                                        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all
                                                            ${currentConversationId === conv.id
                                                                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                                                                : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                            }
                                                        `}
                                                    >
                                                        <span className="truncate text-[13px] flex-1 ml-2">{conv.title}</span>
                                                        
                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
                                                                    deleteConversation(conv.id);
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-lg transition-all"
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

                            {/* User Info & Settings */}
                            <div className="p-4 mt-auto border-t border-slate-50 dark:border-white/5 space-y-3">
                                {user && (
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden relative border border-slate-200 dark:border-white/10">
                                                {user?.photoURL ? (
                                                    <Image src={user.photoURL} alt="User" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {getUserInitials()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{userData?.displayName || 'مستخدم'}</span>
                                                <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button 
                                                onClick={() => setIsSettingsPopoverOpen(!isSettingsPopoverOpen)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <AnimatePresence>
                                                {isSettingsPopoverOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        className="absolute bottom-full left-0 mb-3 w-56 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 z-[100] overflow-hidden"
                                                    >
                                                        <div className="space-y-0.5">
                                                            <button onClick={() => toggleDarkMode()} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm transition-colors group">
                                                                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                                                                <span className="font-bold flex-1 text-right">المظهر</span>
                                                                <span className="text-[10px] text-slate-400">{isDarkMode ? 'داكن' : 'فاتح'}</span>
                                                            </button>
                                                            
                                                            <Link href="/changelog" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm transition-colors group">
                                                                <Sparkles size={16} />
                                                                <span className="font-bold flex-1 text-right">ما الجديد؟</span>
                                                            </Link>
                                                            
                                                            <Link href="/privacy" className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm transition-colors group">
                                                                <Shield size={16} />
                                                                <span className="font-bold flex-1 text-right">سياسة الخصوصية</span>
                                                            </Link>

                                                            <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                                                            <button onClick={() => deleteAllConversations()} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 text-sm transition-colors group">
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
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2.5 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-white/10 lg:hidden"
                                title="فتح القائمة"
                            >
                                <Menu size={20} />
                            </button>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mr-1">TOLZY</span>
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
                                    <div className="px-2 py-0.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg shadow-sm">
                                        <span className="text-[10px] font-bold tracking-wider uppercase">{isProPlan ? 'PRO' : 'FREE'}</span>
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
                                                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 mb-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الخطة الحالية</span>
                                                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{isProPlan ? 'PRO PLAN' : 'FREE PLAN'}</span>
                                                    </div>
                                                    
                                                    {isFree && (
                                                        <div className="px-3 py-3 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10 mb-2">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">محاولات اليوم</span>
                                                                <span className="text-[10px] font-black text-slate-900 dark:text-white">{userData?.copilotRequestCount || 0} / 10</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.min(((userData?.copilotRequestCount || 0) / 10) * 100, 100)}%` }}
                                                                    className={`h-full ${((userData?.copilotRequestCount || 0) >= 10) ? 'bg-red-500' : 'bg-indigo-500'}`}
                                                                />
                                                            </div>
                                                            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-2 text-right">سيتم تصفير العداد تلقائياً كل 24 ساعة.</p>
                                                        </div>
                                                    )}
                                                    {isFree && (
                                                        <Link
                                                            href="/pricing"
                                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-indigo-200 dark:border-indigo-500/20"
                                                        >
                                                            <span>ترقية إلى Pro</span>
                                                        </Link>
                                                    )}
                                                    
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

                                {/* Vertical/Scattered Suggestions */}
                                <div className="flex flex-col lg:flex-row lg:flex-wrap items-end lg:justify-center gap-4 lg:gap-6 w-full max-w-4xl mx-auto px-4">
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(s.prompt)}
                                            className="inline-flex items-center gap-3 px-8 py-3.5 bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-[#222] border border-slate-200/50 dark:border-white/10 rounded-full transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 group whitespace-nowrap"
                                        >
                                            <span className="text-slate-700 dark:text-slate-200 text-sm font-bold tracking-tight">{s.text}</span>
                                            <div className="w-5 h-5 flex items-center justify-center text-[#fea619] shrink-0 group-hover:scale-125 transition-transform duration-300">
                                                {s.icon}
                                            </div>
                                        </button>
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
                            {(isModelSelectorOpen || isToolSelectorOpen || isAccountPopoverOpen || isSettingsPopoverOpen) && (
                                <div 
                                    className="fixed inset-0 z-40 bg-transparent" 
                                    onClick={() => {
                                        setIsModelSelectorOpen(false);
                                        setIsToolSelectorOpen(false);
                                        setIsAccountPopoverOpen(false);
                                        setIsSettingsPopoverOpen(false);
                                    }}
                                />
                            )}

                            {/* Model Selector Dropdown - Redesigned (Capsule Style) */}
                            <AnimatePresence>
                                {isModelSelectorOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-4 mb-3 w-64 bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-[28px] shadow-2xl p-2.5 z-50 backdrop-blur-xl"
                                    >
                                        <div className="p-2 text-sm font-bold text-slate-400 dark:text-slate-500 mb-2 px-4 text-right">
                                            TOLZY Copilot V2.5 - جديد الآن 🆕
                                        </div>
                                        <div className="space-y-1">
                                            {MODELS.map((m) => {
                                                const isLocked = isFree && m.id !== 'fast';
                                                return (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        if (isLocked) {
                                                            toast.error('أخويا المجاني.. هذه الميزة للمشتركين في PRO وأعلى فقط 💎');
                                                            return;
                                                        }
                                                        setSelectedModel(m);
                                                        setIsModelSelectorOpen(false);
                                                    }}
                                                    className={`w-full text-right p-4 rounded-[20px] transition-all flex items-center justify-between group ${selectedModel.id === m.id ? 'bg-white dark:bg-white/5 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/5'} ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {selectedModel.id === m.id && (
                                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                                <Check size={12} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end flex-1">
                                                        <span className={`font-bold text-base ${selectedModel.id === m.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                            {m.name} {isLocked && '🔒'}
                                                        </span>
                                                        <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                                                            {m.description}
                                                        </p>
                                                    </div>
                                                </button>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Tool Selector Dropdown - Redesigned */}
                            <AnimatePresence>
                                {isToolSelectorOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full right-4 mb-3 w-64 bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-[28px] shadow-2xl p-2.5 z-50 backdrop-blur-xl"
                                    >
                                        <div className="p-2 text-sm font-bold text-slate-400 dark:text-slate-500 mb-2 px-4 text-right">
                                            الأدوات
                                        </div>
                                        <div className="space-y-1">
                                            {TOOLS.map((t) => {
                                                const isLocked = isFree; // Block all programming/codes for free
                                                return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        if (isLocked) {
                                                            toast.error('الأكواد مغلقة للخطة المجانية، ارتق للـ PRO 💎');
                                                            return;
                                                        }
                                                        setSelectedTool(t);
                                                        setIsToolSelectorOpen(false);
                                                    }}
                                                    className={`w-full text-right p-4 rounded-[20px] transition-all flex items-center justify-between ${selectedTool.id === t.id ? 'bg-white dark:bg-white/5 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/5'} ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {selectedTool.id === t.id && (
                                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                                <Check size={12} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`font-bold text-sm ${selectedTool.id === t.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                            {t.name} {isLocked && '🔒'}
                                                        </span>
                                                        <div className={`p-1.5 rounded-lg ${selectedTool.id === t.id ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>
                                                            {t.icon}
                                                        </div>
                                                    </div>
                                                </button>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Standard Bottom Input - Redesigned for Mobile (Capsule Style) */}
                            <div className="relative bg-white/95 dark:bg-[#1A1A1A] backdrop-blur-2xl rounded-[32px] sm:rounded-full border border-slate-200 dark:border-white/10 shadow-xl shadow-indigo-500/5 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden p-1 sm:p-1.5">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center px-1 sm:px-4 py-1 sm:py-2">
                                    {/* Textarea Area */}
                                    <div className="flex-1 flex items-start">
                                        <textarea
                                            ref={textareaRef}
                                            value={input}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder="اسأل Tolzy Copilot..."
                                            rows={1}
                                            disabled={isLoading}
                                            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium max-h-48 min-h-[48px] scrollbar-hide text-right"
                                            style={{ height: '48px' }}
                                            dir="rtl"
                                        />
                                    </div>

                                    {/* Controls Area - Row on desktop, Bottom row on mobile */}
                                    <div className="flex items-center justify-between sm:justify-end gap-2 px-3 pb-2 sm:p-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 mt-1 sm:mt-0 pt-2 sm:pt-0">
                                        {/* Left Side (on mobile) / Middle (on desktop) */}
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all">
                                                <Mic size={20} />
                                            </button>
                                            
                                            {/* Model Selector Tag */}
                                            <div 
                                                onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all border-2 ${isModelSelectorOpen ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10'}`}
                                            >
                                                <ChevronDown size={14} className={`opacity-50 transition-transform duration-300 ${isModelSelectorOpen ? 'rotate-180' : ''}`} />
                                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                    {selectedModel.name}
                                                </span>
                                            </div>
                                            {isFree && (
                                                <div className="hidden sm:flex items-center gap-3">
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-1.5 min-w-[60px] justify-end">
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">{userData?.copilotRequestCount || 0}/10</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                        </div>
                                                        <Link href="/pricing" className="text-[9px] font-bold text-indigo-500 hover:underline uppercase tracking-tight">Upgrade</Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side Icons */}
                                        <div className="flex items-center gap-2">
                                            <button className="hidden sm:flex p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all">
                                                <Plus size={20} />
                                            </button>
                                            
                                            {/* Tool Selector Icon (Mobile/Desktop) */}
                                            <button 
                                                onClick={() => setIsToolSelectorOpen(!isToolSelectorOpen)}
                                                className={`p-2 rounded-full transition-all ${isToolSelectorOpen ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                            >
                                                <SlidersHorizontal size={18} className={selectedTool ? 'text-pink-500' : ''} />
                                            </button>

                                            <button className="flex sm:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all">
                                                <Plus size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleSendMessage()}
                                                disabled={!input.trim() || isLoading}
                                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-300'}`}
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
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

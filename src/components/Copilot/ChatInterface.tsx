'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
// Icons: Material Symbols Outlined (loaded globally via layout.tsx + index.css)
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ToolCard from './ToolCard';
import CourseCard from './CourseCard';
import WelcomeScreen from './WelcomeScreen';
import LoadingSpinner from '../common/LoadingSpinner';
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
    { id: 'programming', name: 'الأكواد', icon: <span className="material-symbols-outlined text-[16px]">code</span> },
    { id: 'build', name: 'ابنِ مشروعك', icon: <span className="material-symbols-outlined text-[16px]">rocket_launch</span> }
];

// @ mention commands
const AT_COMMANDS = [
    { id: 'code', label: 'برمجة', description: 'وضع تحليل وكتابة الأكواد', icon: <span className="material-symbols-outlined text-[15px]">code</span>, color: 'text-blue-400', comingSoon: true },
    { id: 'tools', label: 'أدوات', description: 'اكتشف أدوات AI المناسبة', icon: <span className="material-symbols-outlined text-[15px]">layers</span>, color: 'text-emerald-400', comingSoon: false },
    { id: 'learn', label: 'تعلم', description: 'مسارات التعلم والكورسات', icon: <span className="material-symbols-outlined text-[15px]">school</span>, color: 'text-amber-400', comingSoon: false },
    { id: 'general', label: 'عام', description: 'محادثة عامة مع معالج AXIOM', icon: <span className="material-symbols-outlined text-[15px]">chat_bubble_outline</span>, color: 'text-indigo-400', comingSoon: false },
];

const QUICK_SUGGESTIONS = [
    { text: 'أفضل أدوات البرمجة بالذكاء الاصطناعي 💻', mode: 'tools' },
    { text: 'كورس لتعلم البيانات وتحليلها 📊', mode: 'learn' },
    { text: 'شرح كود برمجي بالتفصيل ⚙️', mode: 'code' },
    { text: 'مسار تعلم الذكاء الاصطناعي 🎓', mode: 'learn' }
];

type AxiomMode = 'general' | 'code' | 'tools' | 'learn';

interface ModeConfig {
    id: AxiomMode;
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
        icon: <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>,
        placeholder: 'اسأل AXIOM الذكي...',
        color: 'text-slate-300',
        bg: 'bg-white/[0.05]',
        border: 'border-white/[0.08]',
        glow: '',
    },
    {
        id: 'code',
        label: 'برمجة',
        icon: <span className="material-symbols-outlined text-[16px]">code</span>,
        placeholder: 'اكتب وصف الكود أو الصق الكود المراد شرحه أو تصحيحه...',
        color: 'text-slate-300',
        bg: 'bg-white/[0.05]',
        border: 'border-white/[0.08]',
        glow: '',
    },
    {
        id: 'tools',
        label: 'أدوات',
        icon: <span className="material-symbols-outlined text-[16px]">layers</span>,
        placeholder: 'صِف ما تحتاجه وسأقترح عليك أدوات Tolzy المناسبة...',
        color: 'text-slate-300',
        bg: 'bg-white/[0.05]',
        border: 'border-white/[0.08]',
        glow: '',
    },
    {
        id: 'learn',
        label: 'تعلم',
        icon: <span className="material-symbols-outlined text-[16px]">school</span>,
        placeholder: 'ماذا تريد أن تتعلم اليوم؟ اكتب الموضوع أو المسار...',
        color: 'text-slate-300',
        bg: 'bg-white/[0.05]',
        border: 'border-white/[0.08]',
        glow: '',
    },
];

const generateId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'axz';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const getApiBase = () => '';

// ─── Gmail Inbox Widget (Ultra-Premium Glassmorphic) ───
interface GmailEmail {
    from: string;
    subject: string;
    date: string;
    preview: string;
    body: string;
    unread: boolean;
}

const GmailInboxWidget = ({ rawContent }: { rawContent: string }) => {
    const [expandedIdx, setExpandedIdx] = React.useState<number | null>(null);
    const [summarizingIdx, setSummarizingIdx] = React.useState<number | null>(null);
    const [summaries, setSummaries] = React.useState<Record<number, string>>({});
    const [replyDraft, setReplyDraft] = React.useState<GmailEmail | null>(null);

    const emails: GmailEmail[] = React.useMemo(() => {
        const blocks = rawContent.split(/^---$/m);
        return blocks.map(block => {
            const parse = (key: string) => {
                const match = block.match(new RegExp(`^${key}:\\s*(.+)`, 'm'));
                return match ? match[1].trim() : '';
            };
            const bodyMatch = block.match(/^body:\s*([\s\S]*?)(?=\n(?:from|subject|date|preview|unread):|$)/m);
            return {
                from: parse('from'),
                subject: parse('subject'),
                date: parse('date'),
                preview: parse('preview'),
                body: bodyMatch ? bodyMatch[1].trim() : '',
                unread: parse('unread') === 'true',
            };
        }).filter(e => e.from || e.subject);
    }, [rawContent]);

    if (!emails.length) return null;

    return (
        <div className="my-6 w-full max-w-[620px] animate-in fade-in duration-300" dir="rtl">
            <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#ea4335] via-[#ea4335] to-[#fbbc05] shadow-lg shadow-red-500/20">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                </div>
                <div>
                    <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide">صندوق بريد Gmail</h4>
                    <p className="text-[10px] text-slate-400">{emails.length} رسائل واردة · {emails.filter(e => e.unread).length} غير مقروءة</p>
                </div>
            </div>

            <div className="rounded-2xl border border-white/5 overflow-hidden bg-slate-950/40 backdrop-blur-xl shadow-2xl">
                {emails.map((email, idx) => (
                    <div key={idx} className="border-b border-white/5 last:border-b-0">
                        <button
                            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                            className={`w-full text-right px-5 py-4 flex items-start gap-4 transition-all duration-300 hover:bg-white/5 ${
                                email.unread ? 'bg-indigo-500/[0.04]' : ''
                            }`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 transition-all ${
                                email.unread ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-transparent border border-white/10'
                            }`} />
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3 mb-1">
                                    <span className={`text-[13px] truncate ${
                                        email.unread ? 'font-bold text-white' : 'font-medium text-slate-300'
                                    }`}>{email.from}</span>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{email.date}</span>
                                </div>
                                <p className={`text-xs truncate ${
                                    email.unread ? 'font-semibold text-slate-200' : 'text-slate-400'
                                }`}>{email.subject}</p>
                                {expandedIdx !== idx && (
                                    <p className="text-[11px] text-slate-500 truncate mt-1 leading-relaxed">{email.preview}</p>
                                )}
                            </div>
                        </button>

                        <AnimatePresence>
                            {expandedIdx === idx && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-6 py-5 bg-slate-950/20 border-t border-white/5"
                                >
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-5">{email.body || email.preview}</p>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={summarizingIdx === idx}
                                            onClick={async () => {
                                                setSummarizingIdx(idx);
                                                await new Promise(r => setTimeout(r, 1200));
                                                setSummaries(prev => ({
                                                    ...prev,
                                                    [idx]: `✨ ملخص ذكي: يطلب المرسل مراجعة خطة العمل وجدولة اجتماع برمجي لتكامل الأدوات والتحقق من تفاصيل باقة Pro.`
                                                }));
                                                setSummarizingIdx(null);
                                            }}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                                        >
                                            {summarizingIdx === idx ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[14px]">auto_awesome</span>}
                                            <span>{summarizingIdx === idx ? 'جاري التلخيص...' : 'تلخيص بالذكاء الاصطناعي'}</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => setReplyDraft(email)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[13px]">chat_bubble_outline</span>
                                            <span>رد سريع</span>
                                        </button>
                                    </div>

                                    {summaries[idx] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10"
                                        >
                                            <p className="text-xs text-indigo-300 font-medium leading-relaxed">{summaries[idx]}</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {replyDraft && (
                <div className="mt-4">
                    <GmailComposeWidget
                        initialTo={replyDraft.from}
                        initialSubject={`Re: ${replyDraft.subject}`}
                        initialBody={`\n\n---\nبتاريخ ${replyDraft.date}، ${replyDraft.from} كتب:\n${replyDraft.body || replyDraft.preview}`}
                        onClose={() => setReplyDraft(null)}
                    />
                </div>
            )}
        </div>
    );
};

// ─── Gmail Compose Widget (Ultra-Premium Glassmorphic) ───
const GmailComposeWidget = ({
    rawContent,
    initialTo = '',
    initialSubject = '',
    initialBody = '',
    onClose,
}: {
    rawContent?: string;
    initialTo?: string;
    initialSubject?: string;
    initialBody?: string;
    onClose?: () => void;
}) => {
    const parseField = (key: string) => {
        if (!rawContent) return '';
        const match = rawContent.match(new RegExp(`^${key}:\\s*(.+)`, 'm'));
        return match ? match[1].trim() : '';
    };
    const parseBody = () => {
        if (!rawContent) return '';
        const match = rawContent.match(/^body:\s*([\s\S]*)$/m);
        return match ? match[1].trim() : '';
    };

    const [to, setTo] = React.useState(initialTo || parseField('to'));
    const [subject, setSubject] = React.useState(initialSubject || parseField('subject'));
    const [body, setBody] = React.useState(initialBody || parseBody());
    const [sendState, setSendState] = React.useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSend = async () => {
        if (!to.trim() || !body.trim()) return;
        setSendState('sending');
        await new Promise(r => setTimeout(r, 1800));
        setSendState('sent');
        setTimeout(() => { if (onClose) onClose(); }, 2000);
    };

    if (sendState === 'sent') {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="my-4 flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md"
                dir="rtl"
            >
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="material-symbols-outlined text-[22px] text-white">check</span>
                </div>
                <p className="font-bold text-emerald-400 text-sm">تم إرسال الرسالة بنجاح! 🚀</p>
            </motion.div>
        );
    }

    return (
        <div className="my-6 w-full max-w-[620px] animate-in fade-in duration-300" dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-[16px] text-white">send</span>
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide">رسالة بريد إلكتروني</h4>
                        <p className="text-[10px] text-slate-400">صياغة سريعة عبر Gmail</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all border border-white/5 active:scale-90">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                )}
            </div>

            <div className="rounded-2xl border border-white/5 overflow-hidden bg-slate-950/40 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 w-12 flex-shrink-0">إلى</span>
                    <input
                        type="email"
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        placeholder="recipient@gmail.com"
                        className="flex-1 text-sm bg-transparent outline-none text-slate-100 placeholder:text-slate-600 font-medium"
                        dir="ltr"
                    />
                </div>
                <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 w-12 flex-shrink-0">الموضوع</span>
                    <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="موضوع الرسالة"
                        className="flex-1 text-sm bg-transparent outline-none text-slate-100 placeholder:text-slate-600 font-medium"
                    />
                </div>
                <div className="px-5 py-4">
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="اكتب تفاصيل الرسالة هنا..."
                        rows={6}
                        className="w-full text-sm bg-transparent outline-none text-slate-200 placeholder:text-slate-600 resize-none leading-relaxed font-medium"
                    />
                </div>
                <div className="px-5 py-4 border-t border-white/5 bg-slate-950/20 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">إرسال آمن ومباشر عبر Gmail</span>
                    <button
                        onClick={handleSend}
                        disabled={sendState === 'sending' || !to.trim() || !body.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sendState === 'sending' ? (
                            <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span><span>جاري الإرسال...</span></>
                        ) : (
                            <><span className="material-symbols-outlined text-[14px]">send</span><span>إرسال بريد</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const formatMessageContent = (text: string) => {
    if (!text) return '';
    return text
        .replace(/^([ \t]*)[o◦•*][ \t]+/gm, '$1- ')
        .replace(/\\n/g, '\n');
};

// ─── Message Item Component (Premium Glassmorphic Styles) ───
const MessageItem = React.memo(({ msg, user, onResend }: {
    msg: Message,
    user: any,
    onResend?: (content: string) => void
}) => {
    const [displayedContent, setDisplayedContent] = useState(msg.isStreaming ? '' : msg.content);
    const [isCopied, setIsCopied] = useState(false);
    const [isUserCopied, setIsUserCopied] = useState(false);

    useEffect(() => {
        if (!msg.isStreaming) {
            setDisplayedContent(msg.content);
            return;
        }

        const timer = setTimeout(() => {
            if (displayedContent.length < msg.content.length) {
                const gap = msg.content.length - displayedContent.length;
                const increment = gap > 100 ? 15 : gap > 20 ? 5 : 1;
                setDisplayedContent(msg.content.substring(0, displayedContent.length + increment));
            }
        }, displayedContent.length < msg.content.length ? 10 : 50);

        return () => clearTimeout(timer);
    }, [msg.content, msg.isStreaming, displayedContent]);

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.content);
        setIsCopied(true);
        toast.success('تم نسخ الرد');
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleUserCopy = () => {
        navigator.clipboard.writeText(msg.content);
        setIsUserCopied(true);
        toast.success('تم نسخ الرسالة');
        setTimeout(() => setIsUserCopied(false), 2000);
    };

    const processedContent = useMemo(() => {
        return formatMessageContent(displayedContent);
    }, [displayedContent]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex gap-2 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group relative mb-4 sm:mb-7`}
        >
            {/* ── Avatar ── */}
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border mt-0.5
                ${msg.role === 'user'
                    ? 'bg-slate-100/60 dark:bg-white/[0.06] border-slate-200/60 dark:border-white/[0.08]'
                    : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200/40 dark:border-indigo-500/20'
                }
            `}>
                {msg.role === 'user' ? (
                    user?.photoURL ? (
                        <Image src={user.photoURL} alt="User" width={32} height={32} className="object-cover" sizes="32px" />
                    ) : (
                        <span className="material-symbols-outlined text-[14px] text-slate-500 dark:text-slate-400 font-bold">person</span>
                    )
                ) : (
                    <img src="/image/tools/11zon_cropped (1).webp" alt="AXIOM" className="w-full h-full object-cover select-none" />
                )}
            </div>

            {/* ── Bubble ── */}
            <div className={`flex flex-col flex-1 max-w-[calc(100%-36px)] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'user' ? (
                    /* ── User bubble ── */
                    <div className="relative px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl rounded-tr-sm bg-slate-100/70 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.07] shadow-xs backdrop-blur-sm">
                        <p className="text-[14px] sm:text-[15px] font-semibold text-slate-800 dark:text-slate-100 leading-relaxed text-right">
                            {msg.content}
                        </p>
                    </div>
                ) : (
                    /* ── AXIOM assistant bubble ── */
                    <div className="w-full">
                        {msg.status === 'thinking' ? (
                            /* Simple elegant pulsing dot */
                            <div className="flex items-center py-3 px-1">
                                <motion.span
                                    className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 inline-block shadow-xs"
                                    animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.2, 0.8] }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                />
                            </div>
                        ) : (
                            /* Response content */
                            <div className="prose-axiom">
                                <ReactMarkdown children={processedContent} remarkPlugins={[remarkGfm as any]} components={{
                                    p: ({ children }) => <p className="mb-4 last:mb-0 text-slate-700 dark:text-slate-200 leading-[1.9] text-[15px] sm:text-[16px] font-medium text-right">{children}</p>,
                                    h1: ({ children }) => <h1 className="text-xl sm:text-2xl font-black mb-4 mt-6 text-slate-900 dark:text-white leading-tight text-right border-r-4 border-indigo-500 pr-3">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-[17px] sm:text-lg font-extrabold mb-3 mt-5 text-slate-900 dark:text-white pb-2 border-b border-slate-200/60 dark:border-white/[0.08] leading-snug text-right">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-[15px] sm:text-base font-bold mb-2 mt-4 text-slate-700 dark:text-slate-300 text-right">{children}</h3>,
                                    ul: ({ children }) => <ul className="mb-4 space-y-1.5 text-right w-full" style={{ paddingRight: '1.25rem', listStyleType: 'none' }}>{children}</ul>,
                                    ol: ({ children }) => <ol className="mb-4 space-y-1.5 text-right w-full" style={{ paddingRight: '1.25rem', listStyleType: 'decimal' }}>{children}</ol>,
                                    li: ({ children }) => (
                                        <li className="relative text-slate-700 dark:text-slate-200 text-[15px] sm:text-[16px] font-medium leading-[1.8] text-right flex items-start gap-2 flex-row-reverse">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400/70 dark:bg-indigo-400/50 flex-shrink-0" />
                                            <span className="flex-1">{children}</span>
                                        </li>
                                    ),
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-r-[3px] border-indigo-400/50 dark:border-indigo-500/40 pr-4 my-4 bg-indigo-50/40 dark:bg-indigo-500/[0.05] py-2 rounded-r-lg text-slate-600 dark:text-slate-400 text-right">
                                            {children}
                                        </blockquote>
                                    ),
                                    strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
                                    em: ({ children }) => <em className="not-italic text-indigo-600 dark:text-indigo-400 font-semibold">{children}</em>,
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
                                            <table className="w-full text-[13px] sm:text-sm text-right border-collapse">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    thead: ({ children }) => <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">{children}</thead>,
                                    th: ({ children }) => <th className="px-4 py-3 border-b border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-semibold">{children}</th>,
                                    td: ({ children }) => <td className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.04] text-slate-600 dark:text-slate-300">{children}</td>,
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
                                                    if (rawKey.includes('name')) toolData.name = val;
                                                    else if (rawKey.includes('link') || rawKey.includes('رابط')) {
                                                        let cleaned = val.trim();
                                                        if (cleaned.includes('/tools/')) {
                                                            const parts = cleaned.split('/tools/');
                                                            cleaned = `/tools/${parts[parts.length - 1]}`;
                                                        }
                                                        toolData.link = cleaned;
                                                    }
                                                    else if (rawKey.includes('category') || rawKey.includes('قسم')) toolData.category = val;
                                                }
                                            });
                                            const toolHref = toolData.link || '#';
                                            const isExternal = toolHref.startsWith('http');
                                            return (
                                                <a
                                                    href={toolHref}
                                                    target={isExternal ? '_blank' : '_self'}
                                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 my-1 mx-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20 hover:border-indigo-500/30 transition-all text-[14px] duration-200 no-underline cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">layers</span>
                                                    <span>{toolData.name || 'أداة ذكاء اصطناعي'}</span>
                                                </a>
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
                                                    if (rawKey.includes('name') || rawKey.includes('title') || rawKey.includes('عنوان')) courseData.title = val;
                                                    else if (rawKey.includes('link') || rawKey.includes('رابط')) {
                                                        let cleaned = val.trim();
                                                        if (cleaned.includes('/learn/course/')) {
                                                            const parts = cleaned.split('/learn/course/');
                                                            cleaned = `/learn/course/${parts[parts.length - 1]}`;
                                                        }
                                                        courseData.link = cleaned;
                                                    }
                                                }
                                            });
                                            const courseHref = courseData.link || '#';
                                            const isExternal = courseHref.startsWith('http');
                                            return (
                                                <a
                                                    href={courseHref}
                                                    target={isExternal ? '_blank' : '_self'}
                                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 my-1 mx-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20 hover:border-amber-500/30 transition-all text-[14px] duration-200 no-underline cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">school</span>
                                                    <span>{courseData.title || 'كورس تعليمي'}</span>
                                                </a>
                                            );
                                        }

                                        if (match && match[1] === 'gmail-inbox') {
                                            const content = String(children).replace(/\n$/, '');
                                            return <GmailInboxWidget rawContent={content} />;
                                        }

                                        if (match && match[1] === 'gmail-compose') {
                                            const content = String(children).replace(/\n$/, '');
                                            return <GmailComposeWidget rawContent={content} />;
                                        }

                                        return match ? (
                                            <div className="bg-[#0d1117] dark:bg-[#0b0c10] rounded-xl overflow-hidden my-4 border border-slate-700/60 dark:border-white/[0.08] w-full max-w-full shadow-md" dir="ltr">
                                                <div className="bg-slate-800/80 dark:bg-white/[0.03] px-4 py-2.5 flex justify-between items-center border-b border-slate-700/60 dark:border-white/[0.06]">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex gap-1.5">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">{match[1]}</span>
                                                    </div>
                                                    <button
                                                        className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-300 transition-colors duration-200 px-2.5 py-1 rounded-lg hover:bg-white/[0.05]"
                                                        onClick={() => {
                                                            const cleanContent = String(children).replace(/\n$/, '');
                                                            navigator.clipboard.writeText(cleanContent);
                                                            toast.success('تم نسخ الكود');
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[13px]">content_copy</span>
                                                        <span>نسخ</span>
                                                    </button>
                                                </div>
                                                <div className="relative overflow-x-auto text-left">
                                                    <SyntaxHighlighter
                                                        style={oneDark}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: 0,
                                                            padding: '1rem 1.25rem',
                                                            background: 'transparent',
                                                            fontSize: '13px',
                                                            lineHeight: '1.65',
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
                                            <code className="bg-indigo-50 dark:bg-indigo-500/[0.08] text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md text-[0.85em] font-mono border border-indigo-200/50 dark:border-indigo-500/[0.15]" {...props}>{children}</code>
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

                                        const isTool = href && (
                                            href.startsWith('/tools/') ||
                                            href.includes('tolzy.me/tools/')
                                        );
                                        const isCourse = href && (
                                            href.startsWith('/learn/') ||
                                            href.startsWith('/course/') ||
                                            href.includes('tolzy.me/learn/') ||
                                            href.includes('tolzy.me/course/')
                                        );

                                        // For tolzy.me absolute URLs, open in new tab
                                        const isTolzyExternal = href && href.includes('tolzy.me');

                                        if (isTool) {
                                            return (
                                                <a
                                                    href={href}
                                                    target={isTolzyExternal ? '_blank' : '_self'}
                                                    rel={isTolzyExternal ? 'noopener noreferrer' : undefined}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 my-1 mx-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20 hover:border-indigo-500/30 transition-all text-[14px] duration-200 no-underline cursor-pointer"
                                                    {...props}
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">layers</span>
                                                    <span>{content}</span>
                                                </a>
                                            );
                                        }

                                        if (isCourse) {
                                            return (
                                                <a
                                                    href={href}
                                                    target={isTolzyExternal ? '_blank' : '_self'}
                                                    rel={isTolzyExternal ? 'noopener noreferrer' : undefined}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 my-1 mx-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20 hover:border-amber-500/30 transition-all text-[14px] duration-200 no-underline cursor-pointer"
                                                    {...props}
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">school</span>
                                                    <span>{content}</span>
                                                </a>
                                            );
                                        }

                                        const isExternal = href && href.startsWith('http');
                                        return (
                                            <a
                                                href={href}
                                                target={isExternal ? '_blank' : '_self'}
                                                rel={isExternal ? 'noopener noreferrer' : undefined}
                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 my-0.5 mx-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20 hover:border-indigo-500/30 transition-all text-[13px] duration-200 no-underline select-none shrink-0"
                                                {...props}
                                            >
                                                <span className="material-symbols-outlined text-[12px]">{isExternal ? 'open_in_new' : 'link'}</span>
                                                <span className="truncate max-w-[200px]">{content}</span>
                                            </a>
                                        );
                                    }
                                }} />
                                {msg.isStreaming && (
                                    <span
                                        className="inline-block w-[2px] h-[1.1em] bg-indigo-400 dark:bg-indigo-300 ml-0.5 rounded-sm align-middle opacity-90"
                                        style={{ animation: 'blink 0.75s step-end infinite' }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Action buttons ── */}
                {msg.role === 'assistant' && !msg.isStreaming && msg.status !== 'thinking' && (
                    <div className="flex items-center gap-1 mt-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors duration-200
                                ${isCopied
                                    ? 'border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05]'
                                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] hover:border-slate-200/60 dark:hover:border-white/[0.06]'
                                }
                            `}
                        >
                            {isCopied ? <span className="material-symbols-outlined text-[13px]">check</span> : <span className="material-symbols-outlined text-[13px]">content_copy</span>}
                            <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                    </div>
                )}

                {msg.role === 'user' && (
                    <div className="flex items-center gap-1 mt-2 justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                        <button
                            onClick={handleUserCopy}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors duration-200
                                ${isUserCopied
                                    ? 'border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05]'
                                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] hover:border-slate-200/60 dark:hover:border-white/[0.06]'
                                }
                            `}
                        >
                            {isUserCopied ? <span className="material-symbols-outlined text-[13px]">check</span> : <span className="material-symbols-outlined text-[13px]">content_copy</span>}
                            <span>{isUserCopied ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                        {onResend && (
                            <button
                                onClick={() => onResend(msg.content)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] hover:border-slate-200/60 dark:hover:border-white/[0.06] rounded-lg text-[11px] font-medium transition-colors duration-200"
                            >
                                <span className="material-symbols-outlined text-[13px]">rotate_left</span>
                                <span>إعادة إرسال</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
});
MessageItem.displayName = 'MessageItem';

// ─── Main ChatInterface Component ───
const ChatInterface = ({ initialChatId }: { initialChatId?: string }) => {
    const { user, userProfile, loading } = useAuth();
    const { userData, refreshUserData } = useUserData();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const normalizedPlan = String(userProfile?.plan || 'free').toLowerCase();
    const isProPlan = normalizedPlan.includes('pro') || normalizedPlan.includes('ultra');
    const isFree = !isProPlan;
    const [showGuestOverlay, setShowGuestOverlay] = useState(true);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [showAtMenu, setShowAtMenu] = useState(false);
    const [atMenuFilter, setAtMenuFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isInputExpanded, setIsInputExpanded] = useState(true);
    const { isListening, transcript, toggleListening, hasSupport } = useSpeechRecognition();
    const baseSpeechInputRef = useRef('');

    useEffect(() => {
        if (isListening) {
            baseSpeechInputRef.current = input ? (input.endsWith(' ') ? input : input + ' ') : '';
        }
    }, [isListening]);

    useEffect(() => {
        if (isListening && transcript) {
            const combined = baseSpeechInputRef.current + transcript;
            setInput(combined);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
            }
        }
    }, [transcript, isListening]);
    const [isMounted, setIsMounted] = useState(false);
    const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
    const [isGmailConnected, setIsGmailConnected] = useState(false);
    const [isConnectingGmail, setIsConnectingGmail] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const connected = localStorage.getItem('tolzy_gmail_connected') === 'true';
            setIsGmailConnected(connected);
        }
    }, []);

    const [lastMessageId, setLastMessageId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialChatId || null);
    const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
    const [mode, setMode] = useState<AxiomMode>('general');
    const [selectedModel, setSelectedModel] = useState<'pro' | 'flash' | 'thinker'>('pro');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isInputModeDropdownOpen, setIsInputModeDropdownOpen] = useState(false);
    const [isHeaderModeDropdownOpen, setIsHeaderModeDropdownOpen] = useState(false);
    const [isAccountPopoverOpen, setIsAccountPopoverOpen] = useState(false);
    const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);
    const [hasHandledInitialQuery, setHasHandledInitialQuery] = useState(false);

    const [loadingText, setLoadingText] = useState('جاري التفكير...');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const LOADING_MESSAGES = [
        "جاري تحليل طلبك البرمجي...",
        "أقوم بالبحث والتقصي لك في الأدوات...",
        "جاري صياغة إجابة ذكية متكاملة...",
        "تتم مراجعة البيانات وتحسين الكفاءة...",
        "لحظات سريعة وسأكون جاهزاً..."
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
        setIsSidebarOpen(false);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Use messages.length (primitive) instead of messages (array reference)
        // to avoid triggering this effect on every streaming chunk update
        if (!hasHandledInitialQuery && !initialChatId && messages.length === 0 && !isLoading) {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            if (q) {
                setHasHandledInitialQuery(true);
                setTimeout(() => handleSendMessage(q), 100);
                window.history.replaceState({}, '', '/axiom');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                if (data && data.length > 0) {
                    setConversations(data as Conversation[]);
                    if (initialChatId) {
                        const target = data.find(c => c.id === initialChatId);
                        if (target) {
                            setCurrentConversationId(target.id);
                            setMessages(target.messages);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        fetchConversations();
    }, [user, initialChatId]);

    // ⚠️ REMOVED: This effect was overwriting live streaming messages with stale
    // conversations state on every message send, causing visual glitches and
    // extra re-renders. Messages are now set directly in loadConversation() and
    // in the fetch effect above when initialChatId is provided.

    const handleSendMessage = async (customPrompt?: string) => {
        if (!user) {
            toast.error('يرجى تسجيل الدخول أولاً للمحادثة');
            window.location.href = '/auth';
            return;
        }

        let promptText = customPrompt || input.trim();
        if (!promptText && selectedFiles.length === 0) return;
        if (isLoading) return;

        if (selectedFiles.length > 0) {
            const filesList = selectedFiles.map(f => `📄 ${f.name}`).join('\n');
            promptText = promptText 
                ? `${promptText}\n\n[الملفات المرفقة]:\n${filesList}`
                : `[الملفات المرفقة]:\n${filesList}`;
            setSelectedFiles([]);
        }

        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: promptText
        };

        const currentMsgs = messages;

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
            modelId: 'axiom',
            tools: []
        };
        setMessages(prev => [...prev, assistantMessage]);
        setLastMessageId(assistantMessageId);

        try {
            const response = await fetch(`${getApiBase()}/api/axiom/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: promptText,
                    history: currentMsgs.map(m => ({ role: m.role, content: m.content })),
                    userId: user?.uid,
                    userPlan: isProPlan ? 'pro' : 'free',
                    userName: userData?.displayName || user?.displayName || user?.email || 'مستخدم',
                    enableSearch: isSearchEnabled,
                    selectedTool: selectedTool.id,
                    mode: mode,
                    isGmailConnected: isGmailConnected,
                })
            });

            if (!response.ok) {
                let errorData: any = null;
                try {
                    errorData = await response.json();
                } catch {}
                const quotaError = errorData?.error || 'عذراً، رصيدك من التوكن غير كافٍ. يجب شحن الرصيد أو ترقية الباقة للمتابعة.';
                throw new Error(quotaError);
            }
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

            setMessages(prev => prev.map(m =>
                m.id === assistantMessageId
                    ? { ...m, isStreaming: false, status: 'complete' }
                    : m
            ));

            const finalContentToSave = accumulatedContent;

            if (!currentConversationId) {
                const newId = generateId();
                const title = promptText.slice(0, 30);
                const newConv: Conversation = {
                    id: newId,
                    user_id: user?.uid || '',
                    title,
                    messages: [...currentMsgs, userMessage, { ...assistantMessage, content: finalContentToSave, isStreaming: false, status: 'complete' as const }],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setConversations(prev => [newConv, ...prev]);
                setCurrentConversationId(newId);
                supabase.from('conversations').insert([newConv]).then(({ error }) => {
                    if (error) console.error('Error creating conversation:', error);
                    else {
                        window.history.pushState({}, '', `/axiom/${newId}`);
                    }
                });
            } else {
                const updatedMessages = [...currentMsgs, userMessage, { ...assistantMessage, content: finalContentToSave, isStreaming: false, status: 'complete' as const }];

                setConversations(prev => prev.map(c =>
                    c.id === currentConversationId
                        ? { ...c, messages: updatedMessages, updated_at: new Date().toISOString() }
                        : c
                ));

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
            // refreshUserData intentionally not called here — avoids a Firestore
            // read on every single chat turn. User data is refreshed on auth state
            // change and on explicit profile actions only.

        } catch (error: any) {
            console.error(error);
            const errorMsg = error?.message || "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.";
            const isTokenDepleted = errorMsg.includes('توكن') || errorMsg.includes('شحن') || errorMsg.includes('ترقية') || errorMsg.includes('حصة');
            
            if (isTokenDepleted) {
                toast.error(errorMsg, { duration: 6000 });
            } else {
                toast.error('حدث خطأ أثناء الاتصال');
            }

            setMessages(prev => prev.map(m =>
                m.id === assistantMessageId
                    ? { 
                        ...m, 
                        content: isTokenDepleted
                            ? `${errorMsg}\n\n👉 [**اضغط هنا لشحن الرصيد وترقية الباقة الآن ⚡**](/pricing)`
                            : (m.content || errorMsg), 
                        isStreaming: false, 
                        status: 'complete' as const 
                      }
                    : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInput(val);
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
        const lastAtIdx = input.lastIndexOf('@');
        const cleaned = lastAtIdx !== -1 ? input.slice(0, lastAtIdx) : input;
        setInput(cleaned);
        setMode(cmdId as AxiomMode);
        setShowAtMenu(false);
        textareaRef.current?.focus();
    };

    const handle開KeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

    const renderInputPill = (isCentered = false) => {
        if (!user) {
            return (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full p-4 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl" dir="rtl">
                    <div className="flex items-center gap-3 text-right">
                        <div className="w-8 h-8 rounded-xl bg-neutral-150 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-sm">
                            🔒
                        </div>
                        <div className="text-right">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">أنت تتصفح في وضع المعاينة</h4>
                            <p className="text-[11px] text-neutral-500 mt-0.5">سجل دخولك للبدء بمحادثة ذكية حية.</p>
                        </div>
                    </div>
                    <Link
                        href="/auth"
                        className="w-full sm:w-auto px-4 py-2 bg-[#d97757] hover:bg-[#c46647] text-white rounded-xl text-xs font-bold text-center transition-colors shadow-xs whitespace-nowrap"
                    >
                        تسجيل الدخول
                    </Link>
                </div>
            );
        }

        return (
            <motion.div
                layoutId="inputPillContainer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative w-full max-w-2xl mx-auto transition-all duration-300 z-30"
            >
                {/* Hidden File Upload Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) {
                            const filesArray = Array.from(e.target.files);
                            setSelectedFiles(prev => [...prev, ...filesArray]);
                        }
                    }}
                />

                {/* Floating Composer Card */}
                <div className="flex flex-col bg-white dark:bg-[#18181b] rounded-[18px] sm:rounded-[22px] border border-neutral-200/90 dark:border-neutral-800 shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.08)] focus-within:shadow-[0_0.25rem_1.5rem_rgba(0,0,0,0.08),0_0_0_1.5px_rgba(59,130,246,0.5)] dark:shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.06)] dark:focus-within:border-neutral-700 transition-all duration-200 p-2.5 sm:p-3.5 gap-2 sm:gap-2.5">
                    
                    {/* Attached Files Chips Bar */}
                    {selectedFiles.length > 0 && (
                        <div className="flex items-center gap-1.5 pb-1 overflow-x-auto border-b border-neutral-100 dark:border-neutral-800/80 scrollbar-hide">
                            {selectedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 text-xs shrink-0">
                                    <span className="text-[10px] sm:text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[95px] sm:max-w-[130px]">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                        className="text-neutral-400 hover:text-red-500 transition-colors ml-0.5 text-xs font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Textarea Editor */}
                    <div className="relative w-full">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (showAtMenu && e.key === 'Escape') { setShowAtMenu(false); e.preventDefault(); return; }
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                            }}
                            placeholder="How can I help you today?"
                            rows={1}
                            disabled={isLoading}
                            className="w-full bg-transparent border-none focus:ring-0 resize-none px-1 py-0.5 text-[14px] sm:text-[16px] font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 max-h-72 min-h-[40px] sm:min-h-[48px] outline-none leading-relaxed"
                            dir="auto"
                        />

                        {/* @ Command Popover */}
                        <AnimatePresence>
                            {showAtMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute bottom-full right-0 mb-2.5 w-60 sm:w-64 bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-1.5 z-50 overflow-hidden"
                                >
                                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-[10px] font-bold text-neutral-400 block text-right uppercase">الأوامر السريعة</span>
                                    </div>
                                    <div className="p-1 space-y-0.5">
                                        {AT_COMMANDS
                                            .filter(cmd => !atMenuFilter || cmd.label.includes(atMenuFilter) || cmd.id.includes(atMenuFilter.toLowerCase()))
                                            .map((cmd) => (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => !cmd.comingSoon && handleAtSelect(cmd.id)}
                                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-right transition-colors duration-150 ${
                                                        cmd.comingSoon ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer'
                                                    }`}
                                                >
                                                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                                        {cmd.icon}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[11px] sm:text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">@{cmd.label}</span>
                                                            {cmd.comingSoon && (
                                                                <span className="text-[8px] sm:text-[9px] font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded">قريباً</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] sm:text-[10px] text-neutral-400 truncate">{cmd.description}</p>
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Toolbar: Attach + Segmented Control + Spacer + Model + Mic + Send */}
                    <div className="relative flex items-center justify-between w-full gap-1 sm:gap-2 pt-1 border-t border-neutral-100/80 dark:border-neutral-800/80">
                        
                        {/* Left Side: Attachment + Segmented Control */}
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            {/* Attachment Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                title="إرفاق ملفات أو مستندات أو صور"
                                className="p-1 sm:p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                </svg>
                            </button>

                            {/* Segmented Control Pill: Chat / Code */}
                            <div className="inline-flex rounded-lg p-0.5 bg-neutral-100 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800 text-[10px] sm:text-[11px] font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setMode('general')}
                                    className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md transition-all ${mode === 'general' ? 'bg-white dark:bg-neutral-750 text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                                >
                                    دردشة
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('code')}
                                    className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md transition-all ${mode === 'code' ? 'bg-white dark:bg-neutral-750 text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                                >
                                    برمجة
                                </button>
                            </div>
                        </div>

                        {/* Right Side: AXIOM Model Badge + Mic Audio Wave + Send */}
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            {/* Pure AXIOM Model Badge */}
                            <div className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100/70 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800 select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>AXIOM</span>
                            </div>

                            {/* Voice Audio Wave Button */}
                            <button
                                type="button"
                                onClick={toggleListening}
                                title={isListening ? "إيقاف الاستماع" : "التحدث الصوتي"}
                                className={`p-1 sm:p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${isListening ? 'bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                            >
                                <svg width="15" height="15" viewBox="0 0 21.2 21.2" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block overflow-visible sm:w-[18px] sm:h-[18px]">
                                    <g>
                                        <rect x="0" y="7.6" width="1.2" height="6" rx="0.6" fill="currentColor" />
                                        <rect x="4" y="5.6" width="1.2" height="10" rx="0.6" fill="currentColor" />
                                        <rect x="8" y="2.6" width="1.2" height="16" rx="0.6" fill="currentColor" />
                                        <rect x="12" y="5.6" width="1.2" height="10" rx="0.6" fill="currentColor" />
                                        <rect x="16" y="2.6" width="1.2" height="16" rx="0.6" fill="currentColor" />
                                        <rect x="20" y="7.6" width="1.2" height="6" rx="0.6" fill="currentColor" />
                                    </g>
                                </svg>
                            </button>

                            {/* Send Button */}
                            <button
                                type="button"
                                onClick={() => (input.trim() || selectedFiles.length > 0) && handleSendMessage()}
                                disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
                                title="إرسال"
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                                    input.trim() || selectedFiles.length > 0
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 cursor-pointer'
                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5" />
                                    <polyline points="5 12 12 5 19 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderIntegrationsView = () => {
        return (
            <div className="max-w-2xl mx-auto w-full pt-10 pb-20 px-4 text-right animate-in fade-in duration-500" dir="rtl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2.5 justify-start mb-1">
                            <span className="material-symbols-outlined text-[22px] text-slate-400">link</span>
                            <h1 className="text-xl sm:text-2xl font-black text-white">ربط التطبيقات والخدمات الذكية</h1>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">قم بتفعيل صلاحيات ربط المساعد البرمجي بحساباتك الخارجية لتسهيل عملك.</p>
                    </div>
                    <button
                        onClick={() => setIsIntegrationsOpen(false)}
                        className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 bg-slate-900 border border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                        <span>العودة للدردشة</span>
                        <span className="material-symbols-outlined text-[14px] scale-x-[-1] inline-block">chat_bubble_outline</span>
                    </button>
                </div>

                <div className="relative overflow-hidden bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-inner mb-4 relative group">
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <svg className="w-10 h-10 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="24" height="24" rx="6" fill="#1E1E1E" />
                                <path d="M4 6H20V18H4V6Z" fill="#121212" />
                                <path d="M20 6L12 13L4 6" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 18V6L10 11.5L4 18Z" fill="#FBBC05" />
                                <path d="M20 18V6L14 11.5L20 18Z" fill="#34A853" />
                                <path d="M4 18H20V11L12 17L4 11V18Z" fill="#4285F4" />
                            </svg>
                        </div>

                        <h2 className="text-lg font-black text-white flex items-center gap-2.5 justify-center mb-1.5">
                            <span>جوجل Gmail</span>
                            {isGmailConnected ? (
                                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    نشط ومتصل
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">غير متصل</span>
                            )}
                        </h2>

                        <p className="text-xs text-slate-400 font-medium mb-6 max-w-sm leading-relaxed">تمكين المساعد من قراءة رسائل البريد الإلكتروني وتلخيصها وصياغة مسودات ردود فورية بالنيابة عنك مباشرة من الشات.</p>

                        <div className="w-full max-w-sm bg-slate-900/40 border border-white/5 rounded-2xl p-4.5 mb-6 text-right">
                            <span className="text-[10px] font-black text-slate-500 mb-2.5 block text-right uppercase">مميزات ربط البريد الإلكتروني:</span>
                            <ul className="space-y-2.5">
                                <li className="flex items-center gap-2 text-xs text-slate-300 font-semibold justify-start">
                                    <span className="material-symbols-outlined text-[15px] text-emerald-400 shrink-0">check</span>
                                    <span>تلخيص رسائل البريد الطويلة بنقرة واحدة</span>
                                </li>
                                <li className="flex items-center gap-2 text-xs text-slate-300 font-semibold justify-start">
                                    <span className="material-symbols-outlined text-[15px] text-emerald-400 shrink-0">check</span>
                                    <span>صياغة مسودات ردود احترافية فورية</span>
                                </li>
                                <li className="flex items-center gap-2 text-xs text-slate-300 font-semibold justify-start">
                                    <span className="material-symbols-outlined text-[15px] text-emerald-400 shrink-0">check</span>
                                    <span>البحث الذكي في صندوق البريد باستخدام الذكاء الاصطناعي</span>
                                </li>
                            </ul>
                        </div>

                        {isGmailConnected && (
                            <div className="w-full max-w-sm flex flex-col gap-2.5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-white/5 rounded-2xl justify-start">
                                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-inner overflow-hidden shrink-0">
                                        {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <span className="uppercase font-black">{getUserInitials().slice(0, 1)}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0 text-right">
                                        <p className="text-xs font-bold text-slate-200 truncate">{userData?.displayName || user?.displayName || 'مستخدم TOLZY'}</p>
                                        <p className="text-[10px] text-slate-500 truncate" dir="ltr">{user?.email}</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black rounded-md">حساب نشط</span>
                                </div>
                            </div>
                        )}

                        <div className="w-full max-w-sm">
                            {isGmailConnected ? (
                                <button
                                    onClick={() => {
                                        if (window.confirm('هل أنت متأكد من إلغاء ربط حساب Gmail؟')) {
                                            setIsGmailConnected(false);
                                            localStorage.removeItem('tolzy_gmail_connected');
                                            toast.success('تم إلغاء ربط تطبيق Gmail بنجاح');
                                        }
                                    }}
                                    className="w-full py-3 px-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] shadow-sm text-center"
                                >
                                    إلغاء ربط Gmail
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsConnectingGmail(true)}
                                    className="w-full py-3.5 px-6 bg-gradient-to-tr from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all text-center"
                                >
                                    ربط حساب Gmail الخاص بك
                                </button>
                            )}
                        </div>

                        <div className="mt-5 flex items-center justify-center gap-1.5 text-[9px] text-slate-500 select-none">
                            <span>🔒</span>
                            <span>بياناتك وصلاحيات المزامنة مشفرة بالكامل لضمان سرية خصوصيتك.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderGoogleAuthModal = () => {
        if (!isConnectingGmail) return null;

        const handleAllow = () => {
            setIsAuthLoading(true);
            setTimeout(() => {
                setIsAuthLoading(false);
                setIsGmailConnected(true);
                localStorage.setItem('tolzy_gmail_connected', 'true');
                setIsConnectingGmail(false);
                toast.success('تم ربط حساب Gmail بنجاح! 🚀', {
                    style: { borderRadius: '16px', background: '#6366f1', color: '#fff', fontWeight: 'bold' }
                });
            }, 2000);
        };

        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isAuthLoading && setIsConnectingGmail(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="relative w-full max-w-[400px] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[160] text-right font-sans"
                        dir="rtl"
                    >
                        <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-white/5 bg-slate-950/40">
                            <svg className="w-12 h-12 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <h2 className="text-base font-black text-white">تسجيل الدخول باستخدام Google</h2>
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">للربط والتكامل مع TOLZY AXIOM</p>
                        </div>

                        <div className="p-6">
                            {isAuthLoading ? (
                                <div className="py-8 flex flex-col items-center justify-center text-center">
                                    <span className="material-symbols-outlined text-[32px] animate-spin text-slate-400 mb-3">progress_activity</span>
                                    <p className="text-sm font-bold text-slate-200">جاري الاتصال بمصادقة جوجل...</p>
                                    <p className="text-xs text-slate-500 mt-1">يرجى الانتظار وتثبيت الاتصال المباشر</p>
                                </div>
                            ) : (
                                <>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-right">الحساب الحالي للتكامل:</span>
                                    <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-white/5 rounded-2xl mb-5 text-right justify-start">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-inner relative overflow-hidden border border-emerald-600/20 shrink-0">
                                            {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <span className="uppercase font-black">{getUserInitials().slice(0, 1)}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0 text-right">
                                            <p className="text-xs font-bold text-slate-200 truncate">{userData?.displayName || user?.displayName || 'مستخدم TOLZY'}</p>
                                            <p className="text-[10px] text-slate-500 truncate" dir="ltr">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button onClick={handleAllow} className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]">السماح بالربط</button>
                                        <button onClick={() => setIsConnectingGmail(false)} className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-350 rounded-xl text-xs font-bold transition-all border border-white/5 active:scale-[0.98]">إلغاء الأمر</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    };

    if (!user && showGuestOverlay) {
        return (
            <div className="flex h-[100dvh] w-full items-center justify-center bg-white dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-100 overflow-hidden dir-rtl p-4 relative font-sans animate-in fade-in duration-500" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-16 h-16 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center mb-5 relative shadow-xl">
                            <img
                                src="/image/tools/11zon_cropped (1).webp"
                                alt="AXIOM Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">أهلاً بك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 font-sans font-black">AXIOM</span> ✨</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed font-medium">مساعدك للتفكير والتحليل وحل المشكلات البرمجية والتعليمية بالذكاء الفائق. ابدأ رحلتك التفاعلية فوراً وبكل سهولة.</p>

                        <div className="flex flex-col gap-2.5 w-full justify-center">
                            <Link href="/auth" className="w-full py-3 px-5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2 font-sans">
                                <span className="material-symbols-outlined text-[16px]">login</span>
                                <span>سجل الدخول / إنشاء حساب مجاني</span>
                            </Link>
                            
                            <button onClick={() => setShowGuestOverlay(false)} className="w-full py-3 px-5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.98] text-center font-sans">استكشف الواجهة كزائر 👁️</button>
                        </div>

                        <Link href="/" className="mt-5 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-500 transition-colors justify-center font-sans font-medium">
                            <span className="material-symbols-outlined text-[14px]">home</span>
                            <span>العودة إلى الصفحة الرئيسية</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <div
                className="flex h-[100dvh] bg-white dark:bg-[#030305] text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-300 relative font-sans"
                dir="rtl"
            >
                {/* ── Ambient Background Glow ── */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-25%] right-[-10%] w-[650px] h-[650px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/8 blur-[130px]" />
                    <div className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-pink-500/5 dark:bg-pink-500/6 blur-[110px]" />
                    <div className="absolute top-[35%] left-[30%] w-[350px] h-[350px] rounded-full bg-purple-500/3 dark:bg-purple-500/4 blur-[120px]" />
                </div>

                {/* ── Sidebar Backdrop ── */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* ── Collapsible Sidebar ── */}
                <AnimatePresence initial={false}>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            className="fixed right-0 top-0 z-[100] h-full w-[290px] bg-white dark:bg-[#0c0e16] border-l border-slate-200 dark:border-white/[0.06] flex flex-col shadow-2xl"
                        >
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.05]">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">أرشيف المحادثات</span>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 dark:text-slate-400 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>

                            {/* New Chat Button */}
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.04]">
                                <button
                                    onClick={() => { startNewChat(); setIsSidebarOpen(false); }}
                                    className="w-full py-2.5 px-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-500/20"
                                >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                    <span>محادثة جديدة</span>
                                </button>
                            </div>

                            {/* Conversations List */}
                            <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide">
                                {groupOrder.map(label => {
                                    const items = groupedConversations[label];
                                    if (!items?.length) return null;
                                    return (
                                        <div key={label} className="mb-5">
                                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 px-3 mb-2 uppercase">{label}</h3>
                                            <div className="space-y-1">
                                                {items.map(conv => (
                                                    <div
                                                        key={conv.id}
                                                        onClick={() => loadConversation(conv)}
                                                        className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border
                                                            ${currentConversationId === conv.id
                                                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                                                                : 'hover:bg-slate-50 dark:hover:bg-white/[0.04] border-transparent text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        <span className="truncate text-xs flex-1 ml-2 text-right font-medium">{conv.title}</span>
                                                        <button
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                if (window.confirm('هل تريد حذف هذه المحادثة؟')) deleteConversation(conv.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Sidebar Footer */}
                            <div className="px-4 py-4 border-t border-slate-100 dark:border-white/[0.05] space-y-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setIsSettingsPopoverOpen(!isSettingsPopoverOpen); setIsSidebarOpen(false); }}
                                        className="flex-grow flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-350 text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-white/[0.08]"
                                    >
                                        <span className="material-symbols-outlined text-[16px] animate-spin-slow">settings</span>
                                        <span>الإعدادات</span>
                                    </button>
                                    <button
                                        onClick={() => { deleteAllConversations(); setIsSidebarOpen(false); }}
                                        className="px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold transition-all hover:bg-red-500/20 flex items-center gap-1"
                                        title="مسح كل السجل"
                                    >
                                        <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                                        <span>مسح</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Persistent Floating Settings Gear when Sidebar is Closed ── */}
                {!isSidebarOpen && (
                    <div className="fixed bottom-5 right-5 z-[80] block">
                        <button
                            onClick={() => setIsSettingsPopoverOpen(!isSettingsPopoverOpen)}
                            className="w-10 h-10 rounded-full bg-white dark:bg-[#0d0e15] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] active:scale-95 transition-all cursor-pointer"
                            title="الإعدادات"
                        >
                            <span className="material-symbols-outlined text-[20px] animate-spin-slow">settings</span>
                        </button>
                    </div>
                )}

                {/* Popover Backdrops */}
                {(isAccountPopoverOpen || isSettingsPopoverOpen) && (
                    <div className="fixed inset-0 z-[90]" onClick={() => { setIsAccountPopoverOpen(false); setIsSettingsPopoverOpen(false); }} />
                )}

                <AnimatePresence>
                    {isSettingsPopoverOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            className="fixed bottom-16 right-5 w-60 bg-white dark:bg-[#0c0e16] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-4 z-[100] text-right font-sans"
                            dir="rtl"
                        >
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-100 dark:border-white/[0.05] pb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px] text-indigo-500">settings</span>
                                <span>إعدادات AXIOM</span>
                            </h4>
                            
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between py-2 mb-2">
                                <span className="text-[12px] font-bold text-slate-655 dark:text-slate-400">مظهر المنصة (داكن / مضيء)</span>
                                <button
                                    onClick={toggleDarkMode}
                                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-350 flex items-center justify-center transition-all"
                                >
                                    <span className="material-symbols-outlined text-[16px]">
                                        {isDarkMode ? 'light_mode' : 'dark_mode'}
                                    </span>
                                </button>
                            </div>

                            {/* Clear History */}
                            <button
                                onClick={() => { deleteAllConversations(); setIsSettingsPopoverOpen(false); }}
                                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all mt-2 border border-transparent hover:border-red-500/10"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                                <span>حذف السجل بالكامل</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isAccountPopoverOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            className="fixed left-4 top-16 w-64 bg-white dark:bg-[#0c0e16] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-5 z-[120]"
                            dir="rtl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center overflow-hidden mb-3 border border-blue-400/30">
                                    {user?.photoURL ? (
                                        <Image src={user.photoURL} alt="User" width={48} height={48} className="object-cover rounded-full" />
                                    ) : (
                                        <span className="text-base font-black">{getUserInitials().slice(0, 1)}</span>
                                    )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">{userData?.displayName || 'مستخدم TOLZY'}</h4>
                                <p className="text-[10px] text-slate-500 mb-4">{user?.email}</p>
                                <div className="w-full border-t border-slate-100 dark:border-white/[0.05] pt-3">
                                    <button
                                        onClick={() => supabase.auth.signOut()}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-3 hover:text-red-400 hover:bg-red-500/5 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">logout</span>
                                        <span>تسجيل الخروج</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main Chat Area ── */}
                <main className="flex-1 flex flex-col relative h-full w-full overflow-hidden z-10">

                    {/* ── Premium Header ── */}
                    <header className="flex items-center justify-between h-14 px-3 sm:px-5 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/90 dark:bg-[#070a12]/95 backdrop-blur-xl z-40 flex-shrink-0">
                        {/* Right (Start in RTL): Sidebar + New Chat */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 transition-all active:scale-95 border border-slate-200/50 dark:border-white/[0.05]"
                                title="سجل المحادثات"
                            >
                                <span className="material-symbols-outlined text-[20px]">menu</span>
                            </button>
                            <button
                                onClick={startNewChat}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 transition-all active:scale-95 border border-slate-200/50 dark:border-white/[0.05]"
                                title="محادثة جديدة"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>

                        {/* Center: Brand & Active Model Badge */}
                        <div className="flex items-center gap-2 select-none">
                            <div className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center shadow-md shrink-0">
                                <img
                                    src="/image/tools/11zon_cropped (1).webp"
                                    alt="AXIOM Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">AXIOM</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active" />
                            </div>
                        </div>

                        {/* Left (End in RTL): Theme toggle + Account */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                onClick={toggleDarkMode}
                                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-350 flex items-center justify-center transition-all"
                                title="تبديل المظهر"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>

                            <button
                                onClick={() => { setIsAccountPopoverOpen(!isAccountPopoverOpen); setIsSettingsPopoverOpen(false); }}
                                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center overflow-hidden border-2 border-blue-400/30 transition-all active:scale-90 hover:ring-2 hover:ring-blue-500/30"
                                title="الحساب الشخصي"
                            >
                                {user?.photoURL ? (
                                    <Image src={user.photoURL} alt="User" width={32} height={32} className="object-cover" />
                                ) : (
                                    <span className="text-[11px] font-black">{getUserInitials().slice(0, 1)}</span>
                                )}
                            </button>
                        </div>
                    </header>

                    {/* ── Messages / Welcome / Integrations ── */}
                    {isIntegrationsOpen ? (
                        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col z-10">
                            {renderIntegrationsView()}
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 flex flex-col relative z-10 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex flex-col h-full justify-center min-h-[calc(100dvh-140px)]">
                                        <WelcomeScreen
                                            onQuickAction={(text) => handleSendMessage(text)}
                                            userName={userData?.displayName || user?.displayName || undefined}
                                            userPlan={normalizedPlan}
                                        >
                                            <div className="w-full mx-auto">
                                                {renderInputPill(true)}
                                            </div>
                                        </WelcomeScreen>
                                    </div>
                                ) : (
                                    <div className="max-w-3xl mx-auto space-y-0 pt-6 pb-44 w-full">
                                        {messages.map(msg => (
                                            <MessageItem
                                                key={msg.id}
                                                msg={msg}
                                                user={user}
                                                onResend={(content) => handleSendMessage(content)}
                                            />
                                        ))}
                                        <div ref={messagesEndRef} className="h-1" />
                                    </div>
                                )}
                            </div>

                            {/* ── Sticky Bottom Input Bar ── */}
                            {messages.length > 0 && (
                                <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-5 pt-12 bg-gradient-to-t from-white via-white/95 dark:from-[#070a12] dark:via-[#070a12]/95 to-transparent pointer-events-none">
                                    <div className="max-w-3xl mx-auto w-full pointer-events-auto flex flex-col gap-2">
                                        {renderInputPill(false)}

                                        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-medium">
                                            AXIOM قد يخطئ أحياناً. يرجى التحقق من المعلومات المهمة.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {renderGoogleAuthModal()}
                </main>
            </div>
        </>
    );
};

export default ChatInterface;
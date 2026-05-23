'use client';

import React, { useState, useRef, useEffect } from 'react';
// Icons: Material Symbols Outlined (loaded globally via layout.tsx + index.css)
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ToolCard from './ToolCard';
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
    { id: 'general', label: 'عام', description: 'محادثة عامة مع Copilot', icon: <span className="material-symbols-outlined text-[15px]">chat_bubble_outline</span>, color: 'text-indigo-400', comingSoon: false },
];

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
        icon: <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>,
        placeholder: 'اسأل TOLZY Copilot...',
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

// High fidelity mock messages to immediately show off visual design and UI widgets
const MOCK_MESSAGES: Message[] = [
    {
        id: 'mock-1',
        role: 'user',
        content: 'مرحباً تولزي! أريد مراجعة كود JavaScript سريع، واقترح لي بعض الأدوات لتسريع عملي، مع إمكانية إرسال ملخص بالبريد الإلكتروني.'
    },
    {
        id: 'mock-2',
        role: 'assistant',
        content: `أهلاً بك! يسعدني جداً مساعدتك اليوم في رحلتك البرمجية عبر **TOLZY Copilot** 🚀\n\n### 1. مراجعة وتصحيح كودك البرمجي\nإليك مثال على دالة محسنة بلغة JavaScript تقوم بترتيب العناصر وتصفيتها بكفاءة عالية:\n\n\`\`\`javascript\n// دالة مصفاة ومحسنة لتنظيف وترتيب البيانات\nconst processUserData = (users) => {\n  return users\n    .filter(user => user.isActive && user.age >= 18)\n    .sort((a, b) => b.score - a.score);\n};\n\nconsole.log(processUserData(usersList));\n\`\`\`\n\n### 2. أدوات ذكاء اصطناعي مقترحة من منصة Tolzy\nلقد قمت باختيار هذه الأداة المتميزة لتسريع كتابة ومراجعة أكوادك:\n\n\`\`\`tool\nname: Tolzy Code Optimizer\ndescription: أداة ذكية لتحليل الأكواد وتوفير اقتراحات فورية لتحسين الأداء والأمان.\ncategory: برمجة\nlink: https://tolzy.com/tools/code-optimizer\n\`\`\`\n\n### 3. ربط البريد الإلكتروني (Gmail)\nيمكنك التحكم ببريدك مباشرة! لقد قمت بجلب آخر الرسائل الواردة إليك لتلخيصها:\n\n\`\`\`gmail-inbox\nfrom: فريق Tolzy التقني <support@tolzy.com>\nsubject: تحديثات باقة Pro الجديدة ومميزات Copilot\ndate: اليوم، 12:30 م\npreview: مرحباً بك في عائلة Tolzy! نود إعلامك بإطلاق أدوات جديدة للذكاء الاصطناعي...\nbody: مرحباً بك في عائلة Tolzy! نود إعلامك بإطلاق أدوات جديدة للذكاء الاصطناعي تدعم تلخيص الأكواد، أتمتة العمل، والربط المباشر مع بريدك الإلكتروني لزيادة الإنتاجية بمعدل 10 أضعاف. استمتع بالتحديثات!\nunread: true\n---\nfrom: سارة أحمد (مديرة المشاريع) <sara.a@company.com>\nsubject: مراجعة خطة العمل لمشروع التخرج الذكي\ndate: أمس، 4:15 م\npreview: أرسل لك خطة العمل المقترحة لمشروع التخرج بعد التعديل، أرجو الاطلاع...\nbody: أرسل لك خطة العمل المقترحة لمشروع التخرج بعد التعديل، أرجو الاطلاع والمراجعة لنقوم بمناقشة التفاصيل البرمجية وتكامل الأدوات في اجتماع الغد.\nunread: false\n\`\`\`\n\nهل تود مني صياغة رد سريع على إحدى هذه الرسائل، أم نركز على شرح الدالة البرمجية؟ أنا هنا لمساعدتك! ✨`,
        status: 'complete',
        modelId: 'tolzy-v2.5'
    }
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
            {/* Widget Header */}
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

            {/* List Glass Card */}
            <div className="rounded-2xl border border-white/5 overflow-hidden bg-slate-950/40 backdrop-blur-xl shadow-2xl">
                {emails.map((email, idx) => (
                    <div key={idx} className="border-b border-white/5 last:border-b-0">
                        <button
                            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                            className={`w-full text-right px-5 py-4 flex items-start gap-4 transition-all duration-300 hover:bg-white/5 ${
                                email.unread ? 'bg-indigo-500/[0.04]' : ''
                            }`}
                        >
                            {/* Unread glow dot */}
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

                        {/* Expanded View */}
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

            {/* Inline Compose Sheet Triggered from reply */}
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
            {/* Header */}
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

            {/* Compose Card */}
            <div className="rounded-2xl border border-white/5 overflow-hidden bg-slate-950/40 backdrop-blur-xl shadow-2xl">
                {/* To */}
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
                {/* Subject */}
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
                {/* Body */}
                <div className="px-5 py-4">
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="اكتب تفاصيل الرسالة هنا..."
                        rows={6}
                        className="w-full text-sm bg-transparent outline-none text-slate-200 placeholder:text-slate-600 resize-none leading-relaxed font-medium"
                    />
                </div>
                {/* Footer Controls */}
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group relative mb-5 sm:mb-7 pb-5 border-b border-slate-100 dark:border-white/[0.04] last:border-0 last:pb-0`}
        >
            {/* Avatar */}
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border
                ${msg.role === 'user'
                    ? 'bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/[0.08]'
                    : 'bg-blue-500/10 dark:bg-white/[0.08] border-blue-500/20 dark:border-white/[0.10]'
                }
            `}>
                {msg.role === 'user' ? (
                    user?.photoURL ? (
                        <Image src={user.photoURL} alt="User" width={36} height={36} className="object-cover" sizes="36px" />
                    ) : (
                        <span className="material-symbols-outlined text-[16px] text-slate-500 dark:text-slate-400">person</span>
                    )
                ) : (
                    <span className="material-symbols-outlined text-[16px] text-blue-500 dark:text-white">smart_toy</span>
                )}
            </div>

            {/* Bubble & content */}
            <div className={`flex flex-col flex-1 max-w-[calc(100%-44px)] sm:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble Container */}
                <div className={`w-full text-[14px] sm:text-[15px] leading-relaxed relative
                    ${msg.role === 'user'
                        ? 'bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 rounded-xl rounded-tr-none px-4 py-3 sm:px-5 sm:py-3.5'
                        : 'bg-transparent border-none text-slate-800 dark:text-slate-200 px-0 py-0.5'
                    }
                `}>
                    {/* Bot label */}
                    {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                TOLZY Copilot
                            </span>
                        </div>
                    )}

                    {msg.status === 'thinking' ? (
                        /* Minimalist thinking indicator */
                        <div className="flex items-center gap-2 py-2">
                            {[0, 1, 2].map(i => (
                                <motion.span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-slate-500"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.4,
                                        delay: i * 0.22,
                                        ease: 'easeInOut'
                                    }}
                                />
                            ))}
                            <span className="text-[11px] text-slate-500 font-medium mr-1">
                                جاري التحليل...
                            </span>
                        </div>
                    ) : (
                        <ReactMarkdown children={displayedContent} remarkPlugins={[remarkGfm as any]} components={{
                            p: ({ children }) => <p className="mb-3.5 last:mb-0 text-slate-700 dark:text-slate-300 leading-[1.8] text-[14px] sm:text-[15px]">{children}</p>,
                            h1: ({ children }) => <h1 className="text-xl sm:text-2xl font-black mb-3 mt-4 text-slate-950 dark:text-white leading-tight">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base sm:text-lg font-bold mb-2.5 mt-4 text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-white/[0.06] leading-snug">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm sm:text-base font-semibold mb-2 mt-3.5 text-slate-800 dark:text-slate-200">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc list-outside mr-5 mb-3.5 space-y-1.5 text-slate-700 dark:text-slate-300">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-outside mr-5 mb-3.5 space-y-1.5 text-slate-700 dark:text-slate-300">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-650 dark:text-slate-400 pl-1 text-[13px] sm:text-[14px] leading-relaxed">{children}</li>,
                            blockquote: ({ children }) => (
                                <blockquote className="border-r-2 border-slate-300 dark:border-white/20 pr-4 my-3.5 italic text-slate-500">
                                    {children}
                                </blockquote>
                            ),
                            strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
                            table: ({ children }) => (
                                <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-white/[0.08]">
                                    <table className="w-full text-xs sm:text-sm text-right border-collapse">
                                        {children}
                                    </table>
                                </div>
                            ),
                            thead: ({ children }) => <thead className="bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{children}</thead>,
                            th: ({ children }) => <th className="px-4 py-3 border-b border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-semibold">{children}</th>,
                            td: ({ children }) => <td className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.04] text-slate-600 dark:text-slate-400">{children}</td>,
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

                                if (match && match[1] === 'gmail-inbox') {
                                    const content = String(children).replace(/\n$/, '');
                                    return <GmailInboxWidget rawContent={content} />;
                                }

                                if (match && match[1] === 'gmail-compose') {
                                    const content = String(children).replace(/\n$/, '');
                                    return <GmailComposeWidget rawContent={content} />;
                                }

                                return match ? (
                                    <div className="bg-slate-900 dark:bg-[#0b0c10] rounded-xl overflow-hidden my-4 border border-slate-800 dark:border-white/[0.08] w-full max-w-full" dir="ltr">
                                        {/* Terminal header */}
                                        <div className="bg-slate-800 dark:bg-white/[0.03] px-4 py-2.5 flex justify-between items-center border-b border-slate-700 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/10"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/10"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/10"></div>
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
                                    <code className="bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-300 px-1.5 py-0.5 rounded text-[0.88em] font-mono border border-slate-200 dark:border-white/[0.08]" {...props}>{children}</code>
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
                                        className="inline-flex items-center gap-1 text-blue-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white underline underline-offset-2 text-[0.9em] transition-colors duration-200 mx-0.5 no-underline hover:underline"
                                        {...props}
                                    >
                                        <span className="material-symbols-outlined text-[11px] flex-shrink-0">open_in_new</span>
                                        <span className="truncate max-w-[200px]">{content}</span>
                                    </a>
                                );
                            }
                        }} />
                    )}
                    {/* Streaming Cursor */}
                    {msg.isStreaming && (
                        <span
                            className="inline-block w-[2px] h-4 bg-indigo-400 ml-0.5 rounded-sm align-middle"
                            style={{ animation: 'blink 0.8s step-end infinite' }}
                        />
                    )}
                </div>

                {/* Assistant actions */}
                {msg.role === 'assistant' && !msg.isStreaming && (
                    <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors duration-200
                                ${isCopied
                                    ? 'border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05]'
                                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:border-slate-200 dark:hover:border-white/[0.06]'
                                }
                            `}
                        >
                            {isCopied ? <span className="material-symbols-outlined text-[13px]">check</span> : <span className="material-symbols-outlined text-[13px]">content_copy</span>}
                            <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                    </div>
                )}

                {/* User actions */}
                {msg.role === 'user' && (
                    <div className="flex items-center gap-1.5 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                            onClick={handleUserCopy}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors duration-200
                                ${isUserCopied
                                    ? 'border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05]'
                                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:border-slate-200 dark:hover:border-white/[0.06]'
                                }
                            `}
                        >
                            {isUserCopied ? <span className="material-symbols-outlined text-[13px]">check</span> : <span className="material-symbols-outlined text-[13px]">content_copy</span>}
                            <span>{isUserCopied ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                        {onResend && (
                            <button
                                onClick={() => onResend(msg.content)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:border-slate-200 dark:hover:border-white/[0.06] rounded-lg text-[11px] font-medium transition-colors duration-200"
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

    // Use Mock Messages by default to show visual features immediately if no active chat
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [showAtMenu, setShowAtMenu] = useState(false);
    const [atMenuFilter, setAtMenuFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isInputExpanded, setIsInputExpanded] = useState(false);

    const { isListening, transcript, toggleListening, hasSupport } = useSpeechRecognition();

    useEffect(() => {
        if (isListening && transcript) {
            setInput(transcript);
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
    const [mode, setMode] = useState<CopilotMode>('general');
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
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
        if (!hasHandledInitialQuery && !initialChatId && messages.length === 0 && !isLoading) {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            if (q) {
                setHasHandledInitialQuery(true);
                setTimeout(() => handleSendMessage(q), 100);
                window.history.replaceState({}, '', '/copilot');
            }
        }
    }, [hasHandledInitialQuery, initialChatId, messages, isLoading]);

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
                    // If initialChatId was specified, load that, otherwise load the most recent conversation
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

        // Clear mock data if starting a fresh chat
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
                        window.history.pushState({}, '', `/copilot/${newId}`);
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

    // Interactive quick prompt macros
    const MACRO_COMMANDS = [
        { label: '💡 فكرة مشروع ذكي', prompt: 'اقترح علي 5 أفكار لمشاريع تقنية مبتكرة باستخدام الذكاء الاصطناعي مع توضيح العائد المادي وخطة العمل.' },
        { label: '🛠️ مراجعة كود برمجي', prompt: 'أريد مراجعة هذا الكود وتحسين أدائه وأمانه مع كتابة النسخة المحسنة كاملة بالتعليقات: \n\n' },
        { label: '✍️ صياغة بريد رسمي', prompt: 'ساعدني في صياغة بريد إلكتروني احترافي باللغة العربية موجه للشركة بخصوص: \nالموضوع: طلب شراكة تقنية وتوفير حلول برمجية.' },
        { label: '🔍 تحسين محتوى SEO', prompt: 'كيف يمكنني صياغة مقال تقني مميز ليتوافق مع محركات البحث SEO ويتصدر النتائج بسهولة؟ أعطني خطة عملية.' }
    ];

    const handleMacroClick = (macroPrompt: string) => {
        setInput(macroPrompt);
        textareaRef.current?.focus();
        // Resize textarea to accommodate potential long text
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
            }
        }, 50);
    };

    const renderInputPill = (isCentered = false) => {
        if (!user) {
            return (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full p-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] rounded-xl" dir="rtl">
                    <div className="flex items-center gap-3 text-right">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">🔒</span>
                        </div>
                        <div className="text-right">
                            <h4 className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">أنت تتصفح في وضع المعاينة</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">سجل دخولك للبدء بمحادثة حية.</p>
                        </div>
                    </div>
                    <Link
                        href="/auth"
                        className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold text-center transition-colors duration-200 whitespace-nowrap"
                    >
                        تسجيل الدخول
                    </Link>
                </div>
            );
        }
        if (!isInputExpanded && !isCentered) {
            return (
                <div className="flex justify-center w-full relative z-30 pb-4">
                    <motion.button
                        layoutId="inputPillContainer"
                        onClick={() => setIsInputExpanded(true)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-650 to-indigo-700 dark:from-indigo-650 dark:via-purple-600 dark:to-pink-650 text-white flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.4)] dark:shadow-[0_8px_32px_rgba(168,85,247,0.3)] cursor-pointer relative group border border-white/10"
                    >
                        {/* Glow / Pulse ring */}
                        <span className="absolute inset-0 rounded-full bg-indigo-500/25 animate-ping pointer-events-none" />
                        
                        <svg className="w-7 h-7 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3C12 3 12 9 6 12C12 15 12 21 12 21C12 21 12 15 18 12C12 9 12 3 12 3Z" fill="currentColor" />
                        </svg>
                    </motion.button>
                </div>
            );
        }

        return (
            <motion.div
                layoutId="inputPillContainer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full transition-all duration-300 z-30"
            >
                {/* Custom keyframe styles for smooth, baby blue ambient breathing aura waves */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes auraWave1 {
                        0% {
                            transform: scale(0.4);
                            opacity: 0;
                        }
                        35% {
                            opacity: 0.85;
                        }
                        100% {
                            transform: scale(1.4);
                            opacity: 0;
                        }
                    }
                    @keyframes auraWave2 {
                        0% {
                            transform: scale(0.4);
                            opacity: 0;
                        }
                        35% {
                            opacity: 0.65;
                        }
                        100% {
                            transform: scale(2.2);
                            opacity: 0;
                        }
                    }
                    @keyframes auraWave3 {
                        0% {
                            transform: scale(0.4);
                            opacity: 0;
                        }
                        35% {
                            opacity: 0.45;
                        }
                        100% {
                            transform: scale(3.0);
                            opacity: 0;
                        }
                    }
                    .animate-aura-1 {
                        animation: auraWave1 6.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
                    }
                    .animate-aura-2 {
                        animation: auraWave2 6.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
                        animation-delay: 2.1s;
                    }
                    .animate-aura-3 {
                        animation: auraWave3 6.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
                        animation-delay: 4.2s;
                    }
                `}} />

                {/* Soft Gemini-style Sky Blue Ambient Aura Waves (Fullscreen spreading) */}
                {!isLoading && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] max-w-[100vw] h-[800px] -z-20 pointer-events-none overflow-hidden flex items-center justify-center">
                        <div className="absolute w-[1200px] h-[600px] rounded-full bg-gradient-to-tr from-blue-200/25 via-sky-200/30 to-blue-100/15 dark:from-blue-600/3 dark:via-sky-500/5 dark:to-indigo-500/2 blur-[140px] sm:blur-[180px] animate-aura-1" />
                        <div className="absolute w-[1200px] h-[600px] rounded-full bg-gradient-to-tr from-blue-200/20 via-sky-200/25 to-blue-100/10 dark:from-blue-600/2 dark:via-sky-500/4 dark:to-indigo-500/1 blur-[160px] sm:blur-[200px] animate-aura-2" />
                        <div className="absolute w-[1200px] h-[600px] rounded-full bg-gradient-to-tr from-blue-200/15 via-sky-200/20 to-blue-100/8 dark:from-blue-600/1.5 dark:via-sky-500/2.5 dark:to-indigo-500/0.5 blur-[180px] sm:blur-[220px] animate-aura-3" />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-end gap-2.5 sm:gap-3 px-4 py-2.5 rounded-[28px] bg-blue-50/60 dark:bg-blue-950/20 backdrop-blur-xl border border-blue-200/60 dark:border-blue-500/20 focus-within:bg-blue-50/90 dark:focus-within:bg-[#0c1222]/90 focus-within:border-blue-400 dark:focus-within:border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:shadow-[0_0_25px_rgba(59,130,246,0.22)] focus-within:shadow-[0_0_35px_rgba(59,130,246,0.35)] dark:focus-within:shadow-[0_0_40px_rgba(59,130,246,0.45)] transition-all duration-200" dir="rtl">
                    
                    {/* Leading Actions (Attach Plus Button) */}
                    <div className="flex-shrink-0 mb-0.5">
                        <button
                            onClick={() => toast('قريباً: إمكانية إرفاق الملفات! 📎', { icon: '✨' })}
                            title="التحميل والأدوات"
                            type="button"
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/[0.06] transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[24px] font-semibold">add</span>
                        </button>
                    </div>

                    {/* Main Input Textarea */}
                    <div className="flex-grow min-w-0 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (showAtMenu && e.key === 'Escape') { setShowAtMenu(false); e.preventDefault(); return; }
                                handleKeyDown(e);
                            }}
                            placeholder={MODES.find(m => m.id === mode)?.placeholder || "اسأل TOLZY Copilot..."}
                            rows={1}
                            disabled={isLoading}
                            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-1 text-[14px] sm:text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400/80 dark:placeholder:text-slate-500 max-h-40 min-h-[40px] scrollbar-hide text-right leading-6 outline-none"
                            style={{ height: '40px' }}
                            dir="rtl"
                        />

                        {/* @ Menu popup above textarea */}
                        <AnimatePresence>
                            {showAtMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute bottom-full left-0 mb-2.5 w-60 bg-white dark:bg-[#0b0c10] border border-slate-200 dark:border-white/[0.10] rounded-xl shadow-2xl p-1 z-50"
                                >
                                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06]">
                                        <span className="text-[10px] font-medium text-slate-500 block text-right">وضع المحادثة</span>
                                    </div>
                                    <div className="p-1 space-y-0.5">
                                        {AT_COMMANDS
                                            .filter(cmd => !atMenuFilter || cmd.label.includes(atMenuFilter) || cmd.id.includes(atMenuFilter.toLowerCase()))
                                            .map((cmd) => (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => !cmd.comingSoon && handleAtSelect(cmd.id)}
                                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-right transition-colors duration-150 ${
                                                        cmd.comingSoon ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-white/[0.05] cursor-pointer'
                                                    }`}
                                                >
                                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.07] text-slate-400">
                                                        {cmd.icon}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[12px] font-medium text-slate-800 dark:text-slate-200">@{cmd.label}</span>
                                                            {cmd.comingSoon && (
                                                                <span className="text-[9px] font-medium bg-slate-200 dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">قريباً</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-550 truncate">{cmd.description}</p>
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Trailing Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 mb-0.5 relative">
                        
                        {/* Model Switcher / Mode Picker Pill */}
                        <div className="relative">
                            <button
                                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                                type="button"
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/50 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300/30 dark:border-white/[0.05] transition-all duration-200 active:scale-95 cursor-pointer select-none"
                            >
                                <span>{MODES.find(m => m.id === mode)?.label || 'عام'}</span>
                                <span className="material-symbols-outlined text-[14px] sm:text-[16px] transition-transform duration-200" style={{ transform: isModeDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                                    keyboard_arrow_down
                                </span>
                            </button>

                            {/* Mode Dropdown Popover */}
                            <AnimatePresence>
                                {isModeDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute bottom-full left-0 mb-3 w-44 bg-white dark:bg-[#131314] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-1.5 z-50 overflow-hidden"
                                    >
                                        <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-white/[0.04] mb-1">
                                            <span className="text-[10px] font-bold text-slate-400 block text-right">وضع المحادثة</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            {MODES.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        setMode(m.id as CopilotMode);
                                                        setIsModeDropdownOpen(false);
                                                        textareaRef.current?.focus();
                                                    }}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right text-xs transition-all ${
                                                        mode === m.id
                                                            ? 'bg-blue-500/10 text-blue-500 font-bold dark:bg-blue-500/20'
                                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-400 dark:text-slate-500 flex items-center">{m.icon}</span>
                                                        <span>{m.label}</span>
                                                    </div>
                                                    {mode === m.id && (
                                                        <span className="material-symbols-outlined text-[14px] text-blue-500">check</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mic Button */}
                        {hasSupport && (
                            <button
                                onClick={toggleListening}
                                type="button"
                                title={isListening ? 'إيقاف التسجيل' : 'الميكروفون'}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    isListening
                                        ? 'text-red-500 bg-red-500/10 border border-red-500/20 animate-pulse'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/[0.06] border border-transparent'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">mic</span>
                            </button>
                        )}

                        {/* Close / Collapse Button */}
                        {!isCentered && (
                            <button
                                onClick={() => setIsInputExpanded(false)}
                                type="button"
                                title="إغلاق شريط الكتابة"
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        )}

                        {/* Send / Upward Arrow Button */}
                        <button
                            onClick={() => input.trim() && handleSendMessage()}
                            disabled={isLoading || !input.trim()}
                            type="button"
                            title="إرسال رسالة"
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                input.trim()
                                    ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95'
                                    : 'bg-transparent text-slate-300 dark:text-slate-650 cursor-not-allowed'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px] sm:text-[22px] font-bold">arrow_upward</span>
                        </button>

                    </div>

                </div>
            </motion.div>
        );
    };

    const renderIntegrationsView = () => {
        return (
            <div className="max-w-2xl mx-auto w-full pt-10 pb-20 px-4 text-right animate-in fade-in duration-500" dir="rtl">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2.5 justify-start mb-1">
                            <span className="material-symbols-outlined text-[22px] text-slate-400">link</span>
                            <h1 className="text-xl sm:text-2xl font-black text-white">
                                ربط التطبيقات والخدمات الذكية
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            قم بتفعيل صلاحيات ربط المساعد البرمجي بحساباتك الخارجية لتسهيل عملك.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsIntegrationsOpen(false)}
                        className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 bg-slate-900 border border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                        <span>العودة للدردشة</span>
                        <span className="material-symbols-outlined text-[14px] scale-x-[-1] inline-block">chat_bubble_outline</span>
                    </button>
                </div>

                {/* Premium Gmail Card */}
                <div className="relative overflow-hidden bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    {/* Interior Glowing orb */}
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
                                <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                                    غير متصل
                                </span>
                            )}
                        </h2>

                        <p className="text-xs text-slate-400 font-medium mb-6 max-w-sm leading-relaxed">
                            تمكين المساعد من قراءة رسائل البريد الإلكتروني وتلخيصها وصياغة مسودات ردود فورية بالنيابة عنك مباشرة من الشات.
                        </p>

                        {/* checklist */}
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

                        {/* active profile info */}
                        {isGmailConnected && (
                            <div className="w-full max-w-sm flex flex-col gap-2.5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-white/5 rounded-2xl justify-start">
                                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-inner overflow-hidden shrink-0">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="uppercase font-black">{getUserInitials().slice(0, 1)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-right">
                                        <p className="text-xs font-bold text-slate-200 truncate">{userData?.displayName || user?.displayName || 'مستخدم TOLZY'}</p>
                                        <p className="text-[10px] text-slate-500 truncate" dir="ltr">{user?.email}</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black rounded-md">حساب نشط</span>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
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

                        {/* Privacy note */}
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
                    style: {
                        borderRadius: '16px',
                        background: '#6366f1',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
            }, 2000);
        };

        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    {/* Backdrop with frosted blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isAuthLoading && setIsConnectingGmail(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Dialog Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="relative w-full max-w-[400px] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[160] text-right font-sans"
                        dir="rtl"
                    >
                        <div className="p-6 pb-4 flex flex-col items-center text-center border-b border-white/5 bg-slate-950/40">
                            {/* Google colorful G logo */}
                            <svg className="w-12 h-12 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <h2 className="text-base font-black text-white">تسجيل الدخول باستخدام Google</h2>
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">للربط والتكامل مع TOLZY Copilot</p>
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
                                            {user?.photoURL ? (
                                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="uppercase font-black">{getUserInitials().slice(0, 1)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-right">
                                            <p className="text-xs font-bold text-slate-200 truncate">{userData?.displayName || user?.displayName || 'مستخدم TOLZY'}</p>
                                            <p className="text-[10px] text-slate-500 truncate" dir="ltr">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleAllow}
                                            className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                                        >
                                            السماح بالربط
                                        </button>
                                        <button
                                            onClick={() => setIsConnectingGmail(false)}
                                            className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-350 rounded-xl text-xs font-bold transition-all border border-white/5 active:scale-[0.98]"
                                        >
                                            إلغاء الأمر
                                        </button>
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
                {/* Center card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <div className="flex flex-col items-center text-center relative z-10">
                        {/* Logo Sparkle */}
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner mb-6 relative">
                            <svg className="w-8 h-8 text-blue-500 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3C12 3 12 9 6 12C12 15 12 21 12 21C12 21 12 15 18 12C12 9 12 3 12 3Z" fill="currentColor" />
                            </svg>
                        </div>

                        {/* Headline */}
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                            أهلاً بك في <span className="text-blue-500 font-sans font-black">TOLZY Copilot</span> ✨
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed font-medium">
                            مساعدك البرمجي والتعليمي الفائق بالذكاء الاصطناعي. ابدأ رحلتك التفاعلية واقضِ على المشكلات البرمجية فوراً وبكل سهولة.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2.5 w-full justify-center">
                            <Link
                                href="/auth"
                                className="w-full py-3 px-5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2 font-sans"
                            >
                                <span className="material-symbols-outlined text-[16px]">login</span>
                                <span>سجل الدخول / إنشاء حساب مجاني</span>
                            </Link>
                            
                            <button
                                onClick={() => setShowGuestOverlay(false)}
                                className="w-full py-3 px-5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.98] text-center font-sans"
                            >
                                استكشف الواجهة كزائر 👁️
                            </button>
                        </div>

                        {/* Back to Home Link */}
                        <Link
                            href="/"
                            className="mt-5 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-500 transition-colors justify-center font-sans font-medium"
                        >
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
            <div className="flex h-[100dvh] bg-[radial-gradient(circle_at_50%_65%,_#e2f0fd_0%,_#f0f7fe_35%,_#f8fafc_70%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_50%_65%,_rgba(59,130,246,0.08)_0%,_rgba(15,23,42,0)_60%)] dark:bg-[#06080f] text-slate-800 dark:text-slate-100 overflow-hidden dir-rtl transition-colors duration-300 relative font-sans" dir="rtl">
                
                {/* ── Vertical Navigation Dock (Desktop Only) ── */}
                <div className="hidden lg:flex fixed right-0 top-0 bottom-0 w-16 bg-white dark:bg-[#0c0c0e] border-l border-slate-200 dark:border-white/5 flex-col justify-between py-6 items-center z-[110] shadow-sm select-none" dir="rtl">
                    {/* Top Group */}
                    <div className="flex flex-col gap-6 items-center w-full">
                        {/* Tolzy Icon Badge - Clicking toggles sidebar */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 mb-2 hover:bg-blue-500/20 active:scale-95 transition-all group"
                            title={isSidebarOpen ? "إغلاق الأرشيف" : "فتح الأرشيف - القائمة الجانبية"}
                        >
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3C12 3 12 9 6 12C12 15 12 21 12 21C12 21 12 15 18 12C12 9 12 3 12 3Z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>

                    {/* Bottom Group */}
                    <div className="flex flex-col gap-5 items-center w-full">
                        {/* Icon 4: Diamond (Account Popover Toggle) */}
                        <div className="relative group">
                            <button
                                onClick={() => {
                                    setIsAccountPopoverOpen(!isAccountPopoverOpen);
                                    setIsSettingsPopoverOpen(false);
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 active:scale-95 ${
                                    isAccountPopoverOpen
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                                }`}
                                title="الحساب الشخصي"
                            >
                                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6-10 12L2 9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3L8 9l4 12 4-12-3-6" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h20" />
                                </svg>
                            </button>
                            {/* Tooltip */}
                            <span className="absolute right-14 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-all origin-right bg-slate-955 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-white/5 z-50">
                                الحساب الشخصي
                            </span>
                        </div>

                        {/* Icon 5: Settings / Gear Outline (Settings Popover Toggle) */}
                        <div className="relative group">
                            <button
                                onClick={() => {
                                    setIsSettingsPopoverOpen(!isSettingsPopoverOpen);
                                    setIsAccountPopoverOpen(false);
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 active:scale-95 ${
                                    isSettingsPopoverOpen
                                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                                }`}
                                title="الإعدادات"
                            >
                                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                            {/* Tooltip */}
                            <span className="absolute right-14 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-all origin-right bg-slate-955 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-white/5 z-50">
                                الإعدادات
                            </span>
                        </div>
                    </div>
                </div>

                {/* Click outside backdrop container */}
                {(isAccountPopoverOpen || isSettingsPopoverOpen) && (
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => {
                            setIsAccountPopoverOpen(false);
                            setIsSettingsPopoverOpen(false);
                        }}
                    />
                )}

                {/* Popovers placed next to the vertical dock on desktop and under top-left controls on mobile */}
                <AnimatePresence>
                    {isSettingsPopoverOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="fixed lg:right-20 lg:bottom-6 lg:top-auto lg:left-auto left-5 top-20 w-52 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 z-[120] overflow-hidden"
                            dir="rtl"
                        >
                            <button
                                onClick={() => {
                                    deleteAllConversations();
                                    setIsSettingsPopoverOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-bold transition-all text-right duration-200"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                <span className="flex-1 text-right font-semibold">حذف السجل بالكامل</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isAccountPopoverOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="fixed lg:right-20 lg:bottom-24 lg:top-auto lg:left-auto left-5 top-20 w-64 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 z-[120]"
                            dir="rtl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center overflow-hidden mb-3 border border-slate-200 dark:border-slate-800 shadow-inner">
                                    {user?.photoURL ? (
                                        <Image src={user.photoURL} alt="User" width={48} height={48} className="object-cover rounded-full" />
                                    ) : (
                                        <span className="text-base font-black">{getUserInitials().slice(0, 1)}</span>
                                    )}
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">{userData?.displayName || 'مستخدم TOLZY'}</h4>
                                <p className="text-[10px] text-slate-500 mb-4">{user?.email}</p>

                                <div className="w-full border-t border-slate-100 dark:border-white/5 pt-4 space-y-1">
                                    <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-2 py-2 px-3 text-slate-500 hover:text-red-500 hover:bg-red-500/5 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/5 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95">
                                        <span className="material-symbols-outlined text-[14px]">logout</span>
                                        <span className="font-bold">تسجيل الخروج</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile sidebar overlay backdrop */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* ── Collapsible Sidebar (Timeline layout) ── */}
                <AnimatePresence initial={false}>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="fixed right-0 lg:right-16 top-0 z-[100] h-full w-[280px] bg-white dark:bg-[#0c0c0e] border-l border-slate-200 dark:border-white/5 flex flex-col shadow-2xl lg:shadow-none"
                        >
                            {/* Header: Title */}
                            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">أرشيف المحادثات</span>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                                    title="إغلاق"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>

                            {/* New Chat Button in Sidebar */}
                            <div className="p-3 border-b border-slate-100 dark:border-white/5">
                                <button
                                    onClick={() => {
                                        startNewChat();
                                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                    }}
                                    className="w-full py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/10"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
                                    </svg>
                                    <span>محادثة جديدة</span>
                                </button>
                            </div>

                            {/* Timeline Grouped Conversations List */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-3 custom-scrollbar scrollbar-hide">
                                {groupOrder.map(label => {
                                    const items = groupedConversations[label];
                                    if (!items || items.length === 0) return null;
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
                                                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-white font-bold'
                                                                : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                                            }
                                                        `}
                                                    >
                                                        <span className="truncate text-xs flex-1 ml-2 text-right font-medium">{conv.title}</span>

                                                        {/* Delete specific conversation */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm('هل أنت متأكد من حذف هذه المحادثة نهائياً؟')) {
                                                                    deleteConversation(conv.id);
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 hover:bg-red-500/20 text-slate-405 hover:text-red-400 rounded-lg transition-all active:scale-90"
                                                            title="حذف المحادثة"
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
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main Chat Screen Area ── */}
                <main className={`flex-1 flex flex-col relative h-full w-full overflow-hidden transition-all duration-300 lg:pr-16 ${isSidebarOpen ? 'lg:pr-[344px]' : ''}`}>
                    
                    {/* Floating Brand Logo Button (Opens sidebar archive) */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute top-5 right-5 z-40 w-10 h-10 rounded-xl bg-white/70 dark:bg-[#0c0c0e]/70 border border-slate-200/50 dark:border-white/5 backdrop-blur-md flex items-center justify-center text-blue-500 hover:text-blue-600 active:scale-95 shadow-sm transition-all group"
                        title={isSidebarOpen ? "إغلاق الأرشيف" : "فتح الأرشيف - القائمة الجانبية"}
                    >
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3C12 3 12 9 6 12C12 15 12 21 12 21C12 21 12 15 18 12C12 9 12 3 12 3Z" fill="currentColor" />
                        </svg>
                    </button>

                    {/* Floating Mobile Controls (Account and Settings only - hidden on desktop since they are in the dock) */}
                    <div className="absolute top-5 left-5 z-40 flex items-center gap-2 lg:hidden">
                        {/* Account Popover Toggle */}
                        <button
                            onClick={() => {
                                setIsAccountPopoverOpen(!isAccountPopoverOpen);
                                setIsSettingsPopoverOpen(false);
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-md transition-all duration-200 active:scale-95 shadow-sm ${
                                isAccountPopoverOpen
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                    : 'bg-white/70 dark:bg-[#0c0c0e]/70 border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="الحساب الشخصي"
                        >
                            {user?.photoURL ? (
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                                    <Image src={user.photoURL} alt="User" width={24} height={24} className="object-cover" />
                                </div>
                            ) : (
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l4 6-10 12L2 9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3L8 9l4 12 4-12-3-6" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 9h20" />
                                </svg>
                            )}
                        </button>

                        {/* Settings Popover Toggle */}
                        <button
                            onClick={() => {
                                setIsSettingsPopoverOpen(!isSettingsPopoverOpen);
                                setIsAccountPopoverOpen(false);
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-md transition-all duration-200 active:scale-95 shadow-sm ${
                                isSettingsPopoverOpen
                                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                                    : 'bg-white/70 dark:bg-[#0c0c0e]/70 border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="الإعدادات"
                        >
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area / Welcome Screen / Integrations View */}
                    {isIntegrationsOpen ? (
                        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 flex flex-col relative z-10 pt-20">
                            {renderIntegrationsView()}
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 flex flex-col relative z-10 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                                {messages.length === 0 ? (
                                    /* ── Welcome Screen ── */
                                    <div className="flex-1 flex flex-col h-full justify-center">
                                        <WelcomeScreen
                                            onQuickAction={(text) => handleSendMessage(text)}
                                            userName={userData?.displayName || user?.displayName || undefined}
                                        >
                                            {/* Centered light blue input pill */}
                                            <div className="w-full max-w-2xl mx-auto mt-6">
                                                {renderInputPill(true)}
                                            </div>
                                        </WelcomeScreen>
                                    </div>
                                ) : (
                                    /* Messages stream */
                                    <div className="max-w-3xl mx-auto space-y-6 pt-24 pb-48 w-full">
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

                            {/* Floating bottom capsule Area */}
                            {messages.length > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 sm:pb-6 pt-16 bg-gradient-to-t from-white via-white/85 to-transparent dark:from-[#06080f] dark:via-[#06080f]/85 dark:to-transparent pointer-events-none">
                                    <div className="max-w-3xl mx-auto w-full pointer-events-auto flex flex-col gap-3">
                                        
                                        {renderInputPill(false)}
                                        
                                        {/* Disclaimer */}
                                        <div className="text-center mt-1.5">
                                            <p className="text-[10px] text-slate-650 dark:text-slate-600 font-medium tracking-tight">
                                                TOLZY Copilot <span className="opacity-60">قد يخطئ أحياناً، يرجى التحقق من المعلومات البرمجية المهمة.</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Google Auth Dialog Modal */}
                    {renderGoogleAuthModal()}

                </main>
            </div>
        </>
    );
};

export default ChatInterface;

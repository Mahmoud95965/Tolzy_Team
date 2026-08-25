"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Download, Copy, Check, X, Sparkles, 
    Printer, BookOpen, Clock, Layers, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Flashcard } from './OmniFlashcards';

interface OmniExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    channel?: string;
    duration?: string;
    description?: string;
    summary?: string[];
    flashcards?: Flashcard[];
    messages?: Array<{ id?: string; sender: 'user' | 'ai'; text: string; timestamp: Date }>;
    url?: string;
}

export default function OmniExportModal({
    isOpen,
    onClose,
    title = 'ملخص المادة التعليمية',
    channel = 'Tolzy OmniLearn',
    duration = '30:00',
    description = '',
    summary = [],
    flashcards = [],
    messages = [],
    url = ''
}: OmniExportModalProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'options'>('preview');

    if (!isOpen) return null;

    // Generate clean Markdown text
    const generateMarkdown = (): string => {
        let md = `# 🎓 ${title}\n\n`;
        md += `> **المصدر:** ${channel} | **المدة:** ${duration} | **تاريخ الدراسة:** ${new Date().toLocaleDateString('ar-EG')}\n`;
        if (url) md += `> **الرابط:** ${url}\n\n`;
        md += `---\n\n`;

        if (description) {
            md += `## 📖 نظرة عامة والوصف\n${description}\n\n`;
        }

        if (summary && summary.length > 0) {
            md += `## 🚀 الملخص التنفيذي وأهم النقاط (TL;DR)\n\n`;
            summary.forEach((pt, i) => {
                md += `- ${pt}\n`;
            });
            md += `\n`;
        }

        if (flashcards && flashcards.length > 0) {
            md += `## 🧠 أهم المفاهيم والمصطلحات البرمجية (Flashcards)\n\n`;
            flashcards.forEach((card, i) => {
                md += `### ${i + 1}. ${card.term} ${card.category ? `*(${card.category})*` : ''}\n`;
                md += `${card.definition}\n`;
                if (card.timestamp) md += `*توقيت الشرح في الفيديو:* \`[${card.timestamp}]\`\n`;
                md += `\n`;
            });
        }

        const chatQA = messages.filter(m => m.sender === 'user' || m.text.length > 10);
        if (chatQA.length > 1) {
            md += `## 💬 ملاحظات ونقاشات الذكاء الاصطناعي (AXIOM Q&A)\n\n`;
            for (let i = 0; i < chatQA.length; i++) {
                const msg = chatQA[i];
                if (msg.sender === 'user') {
                    md += `**👤 السؤال:** ${msg.text}\n\n`;
                } else if (msg.sender === 'ai' && msg.id !== 'welcome') {
                    md += `**🤖 الإجابة:**\n${msg.text}\n\n---\n\n`;
                }
            }
        }

        md += `\n*تم إنشاء هذا الملخص عبر منصة **TOLZY OmniLearn** المدعومة بمحرك AXIOM للتفكير الذكي.* ⚡\n`;
        return md;
    };

    const handleCopyMarkdown = () => {
        const md = generateMarkdown();
        navigator.clipboard.writeText(md);
        setCopied(true);
        toast.success('تم نسخ الملاحظات بصيغة Markdown 📋');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadMarkdown = () => {
        const md = generateMarkdown();
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const cleanName = (title || 'omnilearn_notes').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 40);
        link.download = `${cleanName}_notes.md`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success('تم تنزيل ملف Markdown بنجاح 📥');
    };

    const handlePrintPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('يرجى السماح بالنوافذ المنبثقة لطباعة الـ PDF');
            return;
        }

        const summaryHtml = summary.map(s => `<li style="margin-bottom: 8px; font-size: 14px;">${s}</li>`).join('');
        const flashcardsHtml = flashcards.map(f => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <strong style="color: #0f172a; font-size: 15px;">${f.term}</strong>
                    ${f.category ? `<span style="background: #e2e8f0; padding: 2px 8px; border-radius: 6px; font-size: 11px;">${f.category}</span>` : ''}
                </div>
                <p style="color: #475569; font-size: 13px; margin: 0; line-height: 1.6;">${f.definition}</p>
                ${f.timestamp ? `<small style="color: #059669; font-weight: bold; margin-top: 6px; display: block;">⏱ التوقيت: ${f.timestamp}</small>` : ''}
            </div>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>${title} - ملخص Tolzy OmniLearn</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 30px;
                        color: #1e293b;
                        background: #ffffff;
                        line-height: 1.6;
                    }
                    .header {
                        border-bottom: 2px solid #10b981;
                        padding-bottom: 15px;
                        margin-bottom: 25px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .logo {
                        font-size: 20px;
                        font-weight: 900;
                        color: #059669;
                    }
                    h1 { font-size: 22px; color: #0f172a; margin-top: 0; }
                    .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16px; font-weight: 800; color: #0f172a; border-right: 4px solid #10b981; padding-right: 8px; margin-bottom: 12px; }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">TOLZY OmniLearn 🎓</div>
                        <small style="color: #64748b;">ملخص الدراسة والملاحظات الذكية</small>
                    </div>
                    <div style="text-align: left; font-size: 11px; color: #64748b;">
                        ${new Date().toLocaleDateString('ar-EG')}
                    </div>
                </div>

                <h1>${title}</h1>
                <div class="meta">
                    <strong>المصدر:</strong> ${channel} · <strong>المدة:</strong> ${duration}
                </div>

                ${summary.length > 0 ? `
                <div class="section">
                    <div class="section-title">الملخص التنفيذي وأهم النقاط (TL;DR)</div>
                    <ul style="padding-right: 20px;">${summaryHtml}</ul>
                </div>
                ` : ''}

                ${flashcards.length > 0 ? `
                <div class="section">
                    <div class="section-title">أهم المفاهيم والمصطلحات (Flashcards)</div>
                    ${flashcardsHtml}
                </div>
                ` : ''}

                <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
                    تم إنشاء هذا الملف بواسطة منصة TOLZY OmniLearn الذكية · https://tolzy.me
                </div>

                <script>
                    window.onload = () => {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl bg-[#0b0c12] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white flex items-center gap-2">
                                    <span>تصدير الملخص والملاحظات</span>
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                </h2>
                                <p className="text-xs text-slate-400">احفظ دراستك كملف PDF منسق أو Markdown</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Preview / Content Box */}
                    <div className="p-6 overflow-y-auto flex-1 no-scrollbar space-y-4">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 text-right">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-xs font-black text-emerald-400">معاينة محتوى الملاحظات 📋</span>
                                <span className="text-[10px] text-slate-500">{summary.length} نقاط · {flashcards.length} مفاهيم</span>
                            </div>

                            <h4 className="text-sm font-bold text-white leading-snug">{title}</h4>
                            
                            {summary.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">أهم النقاط (TL;DR):</span>
                                    {summary.slice(0, 3).map((pt, i) => (
                                        <p key={i} className="text-xs text-slate-300 leading-relaxed truncate">{pt}</p>
                                    ))}
                                    {summary.length > 3 && (
                                        <p className="text-[10px] text-emerald-400 font-bold">+ {summary.length - 3} نقاط إضافية بالملف...</p>
                                    )}
                                </div>
                            )}

                            {flashcards.length > 0 && (
                                <div className="pt-2 border-t border-white/5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">المفاهيم المحورية:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {flashcards.map((f, i) => (
                                            <span key={i} className="text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded-md border border-white/5">
                                                {f.term}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Export Action Buttons Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {/* PDF Button */}
                            <button
                                onClick={handlePrintPDF}
                                className="p-4 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <div className="text-right">
                                        <div className="font-black text-sm">تصدير كملف PDF 📄</div>
                                        <div className="text-[10px] text-slate-900 font-medium">جاهز للطباعة والمراجعة أوفلاين</div>
                                    </div>
                                </div>
                                <Download className="w-4 h-4" />
                            </button>

                            {/* Markdown Download Button */}
                            <button
                                onClick={handleDownloadMarkdown}
                                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Download className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                                    <div className="text-right">
                                        <div className="font-black text-sm">تنزيل Markdown (.md)</div>
                                        <div className="text-[10px] text-slate-400 font-medium">متوافق مع Notion و Obsidian</div>
                                    </div>
                                </div>
                                <FileText className="w-4 h-4 text-indigo-400" />
                            </button>
                        </div>

                        {/* Copy Markdown Text */}
                        <button
                            onClick={handleCopyMarkdown}
                            className="w-full py-3 px-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'تم نسخ الملاحظات إلى الحافظة بنجاح!' : 'نسخ كود الـ Markdown بالكامل'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

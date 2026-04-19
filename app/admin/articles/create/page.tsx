"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import PageLayout from '@/src/components/layout/PageLayout';
import { RichTextEditor } from '@/src/components/admin/RichTextEditor';
import {
    ArrowRight,
    Save,
    Eye,
    Upload,
    X,
    Loader,
    Image as ImageIcon,
    FileText,
    CheckCircle2,
    PenTool,
    FileUp,
} from 'lucide-react';
import Link from 'next/link';

type ContentMode = 'pdf' | 'manual';

export default function CreateArticlePDF() {
    const router = useRouter();
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [pdfUploading, setPdfUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [pdfFileName, setPdfFileName] = useState<string>('');
    const [contentMode, setContentMode] = useState<ContentMode>('manual');
    const [manualContent, setManualContent] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        pdf_url: '',
        cover_image_url: '',
        category: '',
        tags: '',
        status: 'draft' as 'draft' | 'published',
        article_type: 'explanation' as 'explanation' | 'news',
        reading_time: 5,
    });

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch('/api/articles/upload-image', {
                method: 'POST',
                body: formDataUpload,
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({ ...formData, cover_image_url: data.imageUrl });
                setImagePreview(data.imageUrl);
            } else {
                alert(data.error || 'فشل رفع الصورة');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('حدث خطأ أثناء رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    const handlePDFUpload = async (file: File) => {
        setPdfUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch('/api/articles/upload-pdf', {
                method: 'POST',
                body: formDataUpload,
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({ ...formData, pdf_url: data.pdfUrl });
                setPdfFileName(data.fileName);
                alert('تم رفع ملف PDF بنجاح!');
            } else {
                alert(data.error || 'فشل رفع ملف PDF');
            }
        } catch (error) {
            console.error('Error uploading PDF:', error);
            alert('حدث خطأ أثناء رفع ملف PDF');
        } finally {
            setPdfUploading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const handlePDFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handlePDFUpload(file);
        }
    };

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!formData.title.trim()) {
            alert('الرجاء إدخال عنوان المقال');
            return;
        }

        if (contentMode === 'pdf' && !formData.pdf_url) {
            alert('الرجاء رفع ملف PDF');
            return;
        }

        if (contentMode === 'manual' && !manualContent.trim()) {
            alert('الرجاء كتابة محتوى المقال');
            return;
        }

        setSaving(true);
        try {
            const tagsArray = formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag);

            const articleData = {
                title: formData.title,
                excerpt: formData.excerpt,
                cover_image_url: formData.cover_image_url,
                category: formData.category,
                tags: tagsArray,
                status,
                article_type: formData.article_type,
                reading_time: formData.reading_time,
                author_id: user?.uid || '',
                author_name: user?.displayName || '',
                author_email: user?.email || '',
                content_type: contentMode === 'pdf' ? 'pdf' as const : 'html' as const,
                ...(contentMode === 'pdf'
                    ? { pdf_url: formData.pdf_url }
                    : { content: manualContent }
                )
            };

            const response = await fetch('/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData),
            });

            if (response.ok) {
                alert(status === 'published' ? 'تم نشر المقال!' : 'تم حفظ المقال كمسودة');
                router.push('/admin/articles');
            } else {
                const error = await response.json();
                alert(error.error || 'فشل حفظ المقال');
            }
        } catch (error) {
            console.error('Error saving article:', error);
            alert('حدث خطأ أثناء حفظ المقال');
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link
                                href="/admin/articles"
                                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
                            >
                                <ArrowRight className="w-5 h-5" />
                                <span>العودة إلى قائمة المقالات</span>
                            </Link>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                إنشاء مقال جديد
                            </h1>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
                        {/* Mode Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                طريقة إنشاء المقال
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setContentMode('manual')}
                                    className={`
                                        flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all
                                        ${contentMode === 'manual'
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-700'
                                        }
                                    `}
                                >
                                    <PenTool className="w-5 h-5" />
                                    <span className="font-semibold">كتابة يدوية</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContentMode('pdf')}
                                    className={`
                                        flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all
                                        ${contentMode === 'pdf'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                            : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                                        }
                                    `}
                                >
                                    <FileUp className="w-5 h-5" />
                                    <span className="font-semibold">رفع PDF</span>
                                </button>
                            </div>
                        </div>

                        {/* العنوان */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                عنوان المقال *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors text-lg"
                                placeholder="أدخل عنوان المقال"
                                required
                            />
                        </div>

                        {/* Content Area - PDF or Manual */}
                        {contentMode === 'pdf' ? (
                            <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-1 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            رفع ملف PDF *
                                        </h3>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                            ارفع مقالك بصيغة PDF (الحد الأقصى: 20 ميجابايت)
                                        </p>
                                    </div>
                                </div>

                                <label className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors bg-white dark:bg-slate-800">
                                    <div className="flex flex-col items-center justify-center">
                                        {pdfUploading ? (
                                            <>
                                                <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                                                <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                                                    جارٍ رفع ملف PDF...
                                                </p>
                                            </>
                                        ) : pdfFileName ? (
                                            <>
                                                <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
                                                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                                                    {pdfFileName}
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                    اضغط لتغيير الملف
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-10 h-10 text-indigo-500 mb-3" />
                                                <p className="mb-1 text-sm text-indigo-700 dark:text-indigo-300">
                                                    <span className="font-semibold">اضغط لرفع ملف PDF</span>
                                                </p>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                                    الحد الأقصى: 20 ميجابايت
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,application/pdf"
                                        onChange={handlePDFChange}
                                        disabled={pdfUploading}
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    محتوى المقال *
                                </label>
                                <RichTextEditor
                                    content={manualContent}
                                    onChange={setManualContent}
                                />
                            </div>
                        )}

                        {/* صورة الغلاف */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                صورة الغلاف (اختياري)
                            </label>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <label className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center">
                                            {uploading ? (
                                                <>
                                                    <Loader className="w-8 h-8 text-slate-600 animate-spin" />
                                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                                        جارٍ الرفع...
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-8 h-8 text-slate-400" />
                                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                                        اضغط لرفع صورة
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                {imagePreview && (
                                    <div className="relative w-32 h-32">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-xl border-2 border-slate-200 dark:border-slate-600"
                                        />
                                        <button
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFormData({ ...formData, cover_image_url: '' });
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ملخص المقال */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                ملخص المقال (اختياري)
                            </label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors resize-none"
                                placeholder="ملخص قصير يظهر في البطاقة"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {/* Article Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    نوع المقال
                                </label>
                                <div className="flex gap-4 p-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="article_type"
                                            value="explanation"
                                            checked={formData.article_type === 'explanation'}
                                            onChange={(e) => setFormData({ ...formData, article_type: e.target.value as 'explanation' | 'news' })}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <span className="text-slate-700 dark:text-slate-300">شرح</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="article_type"
                                            value="news"
                                            checked={formData.article_type === 'news'}
                                            onChange={(e) => setFormData({ ...formData, article_type: e.target.value as 'explanation' | 'news' })}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <span className="text-slate-700 dark:text-slate-300">خبر</span>
                                    </label>
                                </div>
                            </div>

                            {/* التصنيف */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    التصنيف (اختياري)
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors"
                                    placeholder="مثال: تقنية، علوم"
                                />
                            </div>

                            {/* وقت القراءة */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    وقت القراءة (بالدقائق)
                                </label>
                                <input
                                    type="number"
                                    value={formData.reading_time}
                                    onChange={(e) =>
                                        setFormData({ ...formData, reading_time: parseInt(e.target.value) || 5 })
                                    }
                                    min="1"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* الوسوم */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                الوسوم (مفصولة بفواصل)
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors"
                                placeholder="مثال: AI, تعلم آلي, تقنية"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => handleSubmit('draft')}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'جارٍ الحفظ...' : 'حفظ كمسودة'}
                            </button>
                            <button
                                onClick={() => handleSubmit('published')}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                            >
                                <Eye className="w-5 h-5" />
                                {saving ? 'جارٍ النشر...' : 'نشر المقال'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

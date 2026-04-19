"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import PageLayout from '@/src/components/layout/PageLayout';
import {
    ArrowRight,
    Save,
    Eye,
    X,
    Loader,
    Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { Article } from '@/src/services/articles.service';

export default function EditArticle() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        cover_image_url: '',
        category: '',
        tags: '',
        status: 'draft' as 'draft' | 'published',
        article_type: 'explanation' as 'explanation' | 'news',
        reading_time: 5,
    });

    useEffect(() => {
        fetchArticle();
    }, [params.id]);

    const fetchArticle = async () => {
        try {
            const response = await fetch(`/api/articles/${params.id}`);
            const data = await response.json();

            if (response.ok && data.article) {
                const article: Article = data.article;
                setFormData({
                    title: article.title,
                    excerpt: article.excerpt || '',
                    content: article.content || '',
                    cover_image_url: article.cover_image_url || '',
                    category: article.category || '',
                    tags: article.tags?.join(', ') || '',
                    status: article.status,
                    article_type: article.article_type || 'explanation',
                    reading_time: article.reading_time || 5,
                });
                if (article.cover_image_url) {
                    setImagePreview(article.cover_image_url);
                }
            }
        } catch (error) {
            console.error('Error fetching article:', error);
        } finally {
            setLoading(false);
        }
    };

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
                setFormData({ ...formData, cover_image_url: data.url });
                setImagePreview(data.url);
            } else {
                alert(data.error || 'فشل رفع الصورة');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('فشل رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, cover_image_url: '' });
        setImagePreview(null);
    };

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!formData.title || !formData.content) {
            alert('يرجى إدخال العنوان والمحتوى');
            return;
        }

        setSaving(true);
        try {
            const tagsArray = formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag);

            const response = await fetch(`/api/articles/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: tagsArray,
                    status,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/admin/articles');
            } else {
                alert(data.error || 'فشل تحديث المقال');
            }
        } catch (error) {
            console.error('Error updating article:', error);
            alert('فشل تحديث المقال');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/admin/articles"
                            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                        >
                            <ArrowRight className="w-5 h-5 rotate-180" />
                            العودة للمقالات
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            تعديل المقال
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            تعديل محتويات المقال
                        </p>
                    </div>

                    {/* Form - Same as create but for editing */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                العنوان <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="عنوان المقال"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                            />
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                الملخص
                            </label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) =>
                                    setFormData({ ...formData, excerpt: e.target.value })
                                }
                                placeholder="ملخص قصير للمقال (اختياري)"
                                rows={2}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                صورة الغلاف
                            </label>

                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploading ? (
                                            <>
                                                <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-3" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    جارٍ رفع الصورة...
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-semibold">اضغط لرفع الصورة</span>
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    PNG, JPG, WebP, GIF (حتى 5MB)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                المحتوى <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                placeholder="محتوى المقال"
                                rows={15}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-arabic"
                            />
                        </div>

                        {/* Category and Tags Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Article Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    نوع المقال
                                </label>
                                <div className="flex gap-4 p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="article_type"
                                            value="explanation"
                                            checked={formData.article_type === 'explanation'}
                                            onChange={(e) => setFormData({ ...formData, article_type: e.target.value as 'explanation' | 'news' })}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-900 dark:text-gray-200">شرح</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="article_type"
                                            value="news"
                                            checked={formData.article_type === 'news'}
                                            onChange={(e) => setFormData({ ...formData, article_type: e.target.value as 'explanation' | 'news' })}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-900 dark:text-gray-200">خبر</span>
                                    </label>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    التصنيف
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">اختر التصنيف</option>
                                    <option value="ai-tools">أدوات الذكاء الاصطناعي</option>
                                    <option value="machine-learning">تعلم الآلة</option>
                                    <option value="deep-learning">التعلم العميق</option>
                                    <option value="nlp">معالجة اللغات الطبيعية</option>
                                    <option value="computer-vision">رؤية الحاسوب</option>
                                    <option value="ai-news">أخبار الذكاء الاصطناعي</option>
                                    <option value="tutorials">دروس تعليمية</option>
                                </select>
                            </div>

                            {/* Reading Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    وقت القراءة (دقائق)
                                </label>
                                <input
                                    type="number"
                                    value={formData.reading_time}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            reading_time: parseInt(e.target.value) || 5,
                                        })
                                    }
                                    min="1"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                الوسوم
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) =>
                                    setFormData({ ...formData, tags: e.target.value })
                                }
                                placeholder="أدخل الوسوم مفصولة بفواصل"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                افصل الوسوم بفواصل
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
                            <Link
                                href="/admin/articles"
                                className="px-6 py-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                إلغاء
                            </Link>
                            <button
                                onClick={() => handleSubmit('draft')}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                حفظ كمسودة
                            </button>
                            <button
                                onClick={() => handleSubmit('published')}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                                نشر المقال
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

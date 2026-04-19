"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import PageLayout from '@/src/components/layout/PageLayout';
import {
    FileText,
    Plus,
    Search,
    Eye,
    Heart,
    Edit,
    Trash2,
    Loader,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import type { Article } from '@/src/services/articles.service';
import Link from 'next/link';

export default function ArticlesAdmin() {
    const router = useRouter();
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await fetch('/api/articles?admin=true');
            const data = await response.json();
            setArticles(data.articles || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setArticles(articles.filter((a) => a.id !== id));
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('فشل حذف المقال');
        }
    };

    const handleToggleStatus = async (article: Article) => {
        const newStatus = article.status === 'published' ? 'draft' : 'published';

        try {
            const response = await fetch(`/api/articles/${article.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setArticles(
                    articles.map((a) =>
                        a.id === article.id ? { ...a, status: newStatus } : a
                    )
                );
            }
        } catch (error) {
            console.error('Error updating article status:', error);
            alert('فشل تحديث حالة المقال');
        }
    };

    const filteredArticles = articles.filter((article) => {
        const matchesSearch =
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus =
            statusFilter === 'all' || article.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-indigo-600" />
                                    إدارة المقالات
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    إدارة مقالات الذكاء الاصطناعي والأخبار
                                </p>
                            </div>
                            <Link
                                href="/admin/articles/create"
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                مقال جديد
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            إجمالي المقالات
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {articles.length}
                                        </p>
                                    </div>
                                    <FileText className="w-8 h-8 text-indigo-600" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            منشورة
                                        </p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {articles.filter((a) => a.status === 'published').length}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            مسودات
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {articles.filter((a) => a.status === 'draft').length}
                                        </p>
                                    </div>
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="بحث في المقالات..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value as 'all' | 'draft' | 'published')
                                }
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="all">كل الحالات</option>
                                <option value="published">منشورة</option>
                                <option value="draft">مسودات</option>
                            </select>
                        </div>
                    </div>

                    {/* Articles List */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                            المقال
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                            الإحصائيات
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                            التاريخ
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {filteredArticles.map((article) => (
                                        <tr
                                            key={article.id}
                                            className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {article.cover_image_url && (
                                                        <img
                                                            src={article.cover_image_url}
                                                            alt={article.title}
                                                            className="w-16 h-16 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            {article.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                                            {article.excerpt || 'ملف PDF - اضغط للعرض'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${article.status === 'published'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}
                                                >
                                                    {article.status === 'published' ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            منشور
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3 h-3" />
                                                            مسودة
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        {article.views_count}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-4 h-4" />
                                                        {article.likes_count}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(article.created_at).toLocaleDateString('ar-EG')}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(article)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${article.status === 'published'
                                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                            }`}
                                                    >
                                                        {article.status === 'published' ? 'إخفاء' : 'نشر'}
                                                    </button>
                                                    <Link
                                                        href={`/admin/articles/edit/${article.id}`}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(article.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredArticles.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        لا توجد مقالات مطابقة
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, BookOpen, BarChart2, Settings, Bell,
    Plus, Edit2, Trash2, X, FileText, Image as ImageIcon
} from 'lucide-react';
import type { NewsArticle } from '../../types/index';
import { publishNewsArticle, listAllNews, updateNews, deleteNews } from '../../services/news.service';
import SupabaseCoursesAdmin from './SupabaseCoursesAdmin';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        active: 'bg-green-100 text-green-700 border-green-200',
        published: 'bg-green-100 text-green-700 border-green-200',
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        syncing: 'bg-blue-100 text-blue-700 border-blue-200',
        error: 'bg-red-100 text-red-700 border-red-200'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.draft}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const TolzyLearnAdminPage: React.FC = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'news' ? 'news' : 'courses';
    
    const [activeTab, setActiveTab] = useState<'courses' | 'news'>(initialTab);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [currentNews, setCurrentNews] = useState<Partial<NewsArticle>>({});
    const [isNewsDrawerOpen, setIsNewsDrawerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const fetchedNews = await listAllNews();
            setNews(fetchedNews);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewsEditClick = (article: NewsArticle) => {
        setCurrentNews(article);
        setIsNewsDrawerOpen(true);
    };

    const handleCreateNewsClick = () => {
        setCurrentNews({
            title: '',
            content: '',
            coverImageUrl: '',
            tags: [],
            status: 'published'
        });
        setIsNewsDrawerOpen(true);
    };

    const handleSaveNews = async () => {
        if (!currentNews.title || !currentNews.content) return;
        setIsSaving(true);
        try {
            if (currentNews.id) {
                await updateNews(currentNews.id, currentNews);
            } else {
                await publishNewsArticle({
                    title: currentNews.title,
                    content: currentNews.content,
                    coverImageUrl: currentNews.coverImageUrl,
                    tags: currentNews.tags,
                    authorId: user?.uid || 'admin',
                    authorEmail: user?.email || 'admin@tolzy.com',
                    status: 'published'
                });
            }
            setIsNewsDrawerOpen(false);
            fetchNews();
        } catch (error) {
            console.error('Error saving news:', error);
            alert('Failed to save news article');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNews = async (id: string) => {
        if (window.confirm('Delete this news article?')) {
            try {
                await deleteNews(id);
                fetchNews();
            } catch (error) {
                console.error('Error deleting news:', error);
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-l border-gray-200 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        Tolzy Learn
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="لوحة التحكم" />
                    <SidebarItem
                        icon={BookOpen}
                        label="الدورات"
                        active={activeTab === 'courses'}
                        onClick={() => setActiveTab('courses')}
                    />
                    <SidebarItem
                        icon={FileText}
                        label="الأخبار"
                        active={activeTab === 'news'}
                        onClick={() => setActiveTab('news')}
                    />
                    <SidebarItem icon={BarChart2} label="التحليلات" />
                    <SidebarItem icon={Settings} label="الإعدادات" />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {user?.displayName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || 'مستخدم مسؤول'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
                {activeTab === 'courses' ? (
                    <SupabaseCoursesAdmin />
                ) : (
                    <>
                        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">إدارة الأخبار</h1>
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                                <button
                                    onClick={handleCreateNewsClick}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة خبر جديد
                                </button>
                            </div>
                        </header>
                        <div className="flex-1 overflow-auto p-8">
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-4">الخبر</th>
                                                <th className="px-6 py-4">المؤلف</th>
                                                <th className="px-6 py-4">الحالة</th>
                                                <th className="px-6 py-4">تاريخ النشر</th>
                                                <th className="px-6 py-4 text-left">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {news.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                                {item.coverImageUrl ? (
                                                                    <img src={item.coverImageUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                        <ImageIcon className="w-5 h-5" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{item.authorEmail || 'Unknown'}</td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={item.status || 'published'} />
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                                                    </td>
                                                    <td className="px-6 py-4 text-left">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleNewsEditClick(item)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteNews(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* News Edit Drawer */}
            {isNewsDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-start">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsNewsDrawerOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {currentNews.id ? 'تعديل الخبر' : 'خبر جديد'}
                            </h2>
                            <button onClick={() => setIsNewsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">تفاصيل الخبر</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                                        <input
                                            type="text"
                                            value={currentNews.title || ''}
                                            onChange={e => setCurrentNews({ ...currentNews, title: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="عنوان الخبر..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label>
                                        <textarea
                                            rows={12}
                                            value={currentNews.content || ''}
                                            onChange={e => setCurrentNews({ ...currentNews, content: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                                            placeholder="اكتب محتوى الخبر هنا..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">صورة الغلاف (رابط)</label>
                                        <input
                                            type="text"
                                            value={currentNews.coverImageUrl || ''}
                                            onChange={e => setCurrentNews({ ...currentNews, coverImageUrl: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {currentNews.coverImageUrl && (
                                            <div className="mt-2 h-40 w-full rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                                <img src={currentNews.coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">الإعدادات</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                                        <select
                                            value={currentNews.status || 'published'}
                                            onChange={e => setCurrentNews({ ...currentNews, status: e.target.value as any })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        >
                                            <option value="published">منشور</option>
                                            <option value="draft">مسودة</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الوسوم (مفصولة بفاصلة)</label>
                                        <input
                                            type="text"
                                            value={currentNews.tags?.join(', ') || ''}
                                            onChange={e => setCurrentNews({ ...currentNews, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsNewsDrawerOpen(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSaveNews}
                                disabled={isSaving}
                                className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                حفظ الخبر
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TolzyLearnAdminPage;

"use client";
import React, { useState, useEffect } from 'react';
import { Search, Trash2, RefreshCw, ExternalLink, BookOpen, Clock, AlertCircle, Edit2, Check, X, Save, Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupabaseCoursesAdmin() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Edit Modal State
    const [editingCourse, setEditingCourse] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch('/api/admin/courses');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCourses(data);
            } else if (data.error) {
                setErrorMsg(data.error);
            }
        } catch (error: any) {
            console.error('Error fetching courses:', error);
            setErrorMsg(error.message || 'فشل في الاتصال بواجهة برمجة التطبيقات');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الكورس من قاعدة البيانات نهائياً؟')) return;
        try {
            const res = await fetch(`/api/admin/courses?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCourses(courses.filter(c => c.id !== id));
                toast.success('تم حذف الكورس بنجاح');
            } else {
                toast.error('فشل في حذف الكورس');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('حدث خطأ أثناء الاتصال بالخادم');
        }
    };

    const [syncOffset, setSyncOffset] = useState(0);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`/api/cron/fetch-coursera?start=${syncOffset}`);
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`تم مزامنة الكورسات بنجاح! تمت معالجة ${data.processedCount} كورس.`);
                // Increment offset for next click to make it easier to fetch more
                setSyncOffset(prev => prev + 10); 
                fetchCourses();
            } else {
                toast.error(data.error || data.message || 'حدث خطأ أثناء المزامنة.');
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast.error('حدث خطأ أثناء المزامنة. تأكد من أن السيرفر يعمل بشكل صحيح.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('🚨 تحذير خطير: هل أنت متأكد من حذف "جميع" الكورسات من قاعدة البيانات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
        
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/courses?deleteAll=true`, { method: 'DELETE' });
            if (res.ok) {
                setCourses([]);
                toast.success('تم حذف جميع الكورسات بنجاح.');
            } else {
                toast.error('فشل في حذف الكورسات.');
            }
        } catch (error) {
            console.error('Error deleting all:', error);
            toast.error('حدث خطأ أثناء الاتصال بالخادم.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCourse) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/courses', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCourse),
            });
            const updated = await res.json();
            if (res.ok) {
                setCourses(courses.map(c => c.id === updated.id ? updated : c));
                setEditingCourse(null);
                toast.success('تم تحديث الكورس بنجاح');
            } else {
                toast.error(updated.error || 'فشل في تحديث الكورس');
            }
        } catch (error) {
            console.error('Error updating:', error);
            toast.error('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setIsSaving(false);
        }
    };

    const addSkill = () => {
        if (!newSkill.trim() || !editingCourse) return;
        const currentSkills = Array.isArray(editingCourse.what_you_will_learn) ? editingCourse.what_you_will_learn : [];
        if (currentSkills.includes(newSkill.trim())) {
            toast.error('هذه المهارة موجودة بالفعل');
            return;
        }
        setEditingCourse({
            ...editingCourse,
            what_you_will_learn: [...currentSkills, newSkill.trim()]
        });
        setNewSkill('');
    };

    const removeSkill = (skillToRemove: string) => {
        if (!editingCourse) return;
        const currentSkills = Array.isArray(editingCourse.what_you_will_learn) ? editingCourse.what_you_will_learn : [];
        setEditingCourse({
            ...editingCourse,
            what_you_will_learn: currentSkills.filter((s: string) => s !== skillToRemove)
        });
    };

    const filteredCourses = courses.filter(c => 
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.provider?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Header / Controls */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">إدارة كورسات Supabase</h2>
                    <p className="text-sm text-gray-500 mt-1">إجمالي الكورسات المتاحة: {courses.length}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث في الكورسات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10 pl-4 py-2 rounded-lg border border-gray-200 text-sm w-48 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                        <span className="px-3 text-xs font-bold text-gray-400 border-l border-gray-200">الإزاحة</span>
                        <input 
                            type="number"
                            value={syncOffset}
                            onChange={(e) => setSyncOffset(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 bg-transparent border-none py-2 text-center text-xs font-bold outline-none"
                            title="يتم تحديث هذا الرقم تلقائياً لتتمكن من جلب دفعات متتالية"
                        />
                    </div>

                    <button
                        onClick={handleDeleteAll}
                        disabled={isSyncing || loading || courses.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                        title="حذف جميع الكورسات من قاعدة البيانات"
                    >
                        <Trash2 className="w-4 h-4" />
                        حذف الكل
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 min-w-[140px]"
                    >
                        {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {isSyncing ? 'جاري السحب...' : 'جلب دفعات جديدة'}
                    </button>
                </div>
            </div>

            {/* Error Message display */}
            {errorMsg && (
                <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>حدث خطأ في قراءة الجدول: {errorMsg} (هل قمت بإنشاء الجدول في Supabase؟)</span>
                </div>
            )}

            {/* Table */}
            <div className="flex-1 p-8 overflow-auto bg-gray-50">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">معلومات الكورس</th>
                                    <th className="px-6 py-4">معلومات AI</th>
                                    <th className="px-6 py-4">التصنيف الآلي</th>
                                    <th className="px-6 py-4">المزود</th>
                                    <th className="px-6 py-4">تاريخ المعالجة</th>
                                    <th className="px-6 py-4 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                    {course.thumbnail ? (
                                                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800 line-clamp-1 flex items-center gap-1">
                                                        {course.title} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[300px]" title={course.description}>{course.description || 'لا يوجد وصف'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs space-y-1">
                                            <div className="flex items-center justify-between border-b pb-1 border-gray-100">
                                                <span className="text-gray-400">المستوى:</span>
                                                <span className="font-bold text-gray-700">{course.level || 'غير محدد'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b pb-1 border-gray-100">
                                                <span className="text-gray-400">المدة:</span>
                                                <span className="font-bold text-gray-700">{course.duration || 'غير محدد'}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-gray-400">المهارات:</span>
                                                <span className="font-bold text-blue-600 bg-blue-50 px-2 rounded-full">{course.what_you_will_learn ? (Array.isArray(course.what_you_will_learn) ? course.what_you_will_learn.length : 0) : 0} مهارة</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">{course.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {course.provider}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(course.updated_at || course.created_at).toLocaleDateString('ar-EG')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setEditingCourse(course)} 
                                                    title="تعديل الكورس"
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors shadow-sm border border-transparent hover:border-indigo-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(course.id)} 
                                                    title="حذف نهائي"
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shadow-sm border border-transparent hover:border-red-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCourses.length === 0 && !errorMsg && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            {searchQuery ? "لا توجد نتائج مطابقة للبحث." : "لم يتم العثور على كورسات. تفضل بالضغط على 'جلب كورسات Coursera الآن'."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 text-right" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-600" />
                                تعديل بيانات الكورس
                            </h3>
                            <button onClick={() => setEditingCourse(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateCourse} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">عنوان الكورس</label>
                                <input 
                                    type="text" 
                                    value={editingCourse.title} 
                                    onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">الوصف</label>
                                <textarea 
                                    rows={3}
                                    value={editingCourse.description} 
                                    onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 font-bold flex items-center gap-1.5 text-indigo-700">
                                        <Target className="w-4 h-4" /> المستوى
                                    </label>
                                    <select 
                                        value={editingCourse.level} 
                                        onChange={e => setEditingCourse({...editingCourse, level: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-indigo-50/30"
                                    >
                                        <option value="Beginner">مبتدئ</option>
                                        <option value="Intermediate">متوسط</option>
                                        <option value="Advanced">متقدم</option>
                                        <option value="Mixed">مختلط</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 font-bold flex items-center gap-1.5 text-indigo-700">
                                        <Clock className="w-4 h-4" /> مدة الكورس (المدى)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editingCourse.duration} 
                                        onChange={e => setEditingCourse({...editingCourse, duration: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-indigo-50/30"
                                        placeholder="مثال: 10 ساعات"
                                    />
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 text-blue-700 leading-none">
                                    <BookOpen className="w-4 h-4" /> مهارات الـ AI (ما ستتعلمه)
                                </label>
                                
                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {Array.isArray(editingCourse.what_you_will_learn) && editingCourse.what_you_will_learn.map((skill: string, index: number) => (
                                        <div key={index} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-blue-100 text-xs font-medium text-blue-700 group/item hover:border-blue-300 transition-all">
                                            {skill}
                                            <button 
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="hover:text-red-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!editingCourse.what_you_will_learn || editingCourse.what_you_will_learn.length === 0) && (
                                        <p className="text-xs text-gray-400 italic">لا توجد مهارات مضافة حالياً</p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newSkill}
                                        onChange={e => setNewSkill(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="أضف مهارة جديدة..."
                                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                    <button 
                                        type="button"
                                        onClick={addSkill}
                                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">التصنيف</label>
                                    <select 
                                        value={editingCourse.category} 
                                        onChange={e => setEditingCourse({...editingCourse, category: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    >
                                        <option value="الذكاء الاصطناعي">الذكاء الاصطناعي</option>
                                        <option value="علم البيانات">علم البيانات</option>
                                        <option value="برمجة الويب">برمجة الويب</option>
                                        <option value="تصميم واجهات">تصميم واجهات</option>
                                        <option value="الأمن السيبراني">الأمن السيبراني</option>
                                        <option value="عام">عام</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">المزود</label>
                                    <input 
                                        type="text" 
                                        value={editingCourse.provider} 
                                        onChange={e => setEditingCourse({...editingCourse, provider: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">رابط صورة الكورس</label>
                                <input 
                                    type="text" 
                                    value={editingCourse.thumbnail} 
                                    onChange={e => setEditingCourse({...editingCourse, thumbnail: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </form>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 left-0">
                            <button 
                                type="button"
                                onClick={() => setEditingCourse(null)}
                                className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                إلغاء
                            </button>
                            <button 
                                type="button"
                                onClick={handleUpdateCourse}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSaving ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

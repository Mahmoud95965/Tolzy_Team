"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/context/AuthContext';
import { useUserData } from '../../../src/hooks/useUserData';
import { useRouter } from 'next/navigation';
import PageLayout from '../../../src/components/layout/PageLayout';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  getChangelogItems, addChangelogItem, updateChangelogItem, deleteChangelogItem, ChangelogItem 
} from '../../../src/services/changelog.service';
import { Plus, Edit2, Trash2, Save, History, X, Check } from 'lucide-react';

const ChangelogAdminPage = () => {
    const { user, loading: authLoading } = useAuth();
    const { userData, loading: userLoading } = useUserData();
    const router = useRouter();

    const [isLoadingData, setIsLoadingData] = useState(true);

    // Data State
    const [changelog, setChangelog] = useState<ChangelogItem[]>([]);

    // Form State for Changelog
    const [editingChangelogId, setEditingChangelogId] = useState<string | null>(null);
    const [changelogForm, setChangelogForm] = useState<Partial<ChangelogItem>>({
        title: '', version: 'v1.0.0', date: new Date().toISOString().split('T')[0], type: 'minor', changes: [],
        category: 'other', isHero: false, isExploreCard: false, link: '', iconType: 'sparkles', imageUrl: '', htmlContent: ''
    });
    const [newChangeInput, setNewChangeInput] = useState('');

    useEffect(() => {
        if (!authLoading && !userLoading) {
            const isAdminEmail = user?.email?.toLowerCase() === 'mahmoud.m.moussa5310@gmail.com';
            if (!user || (userData?.role !== 'admin' && !isAdminEmail)) {
                router.push('/');
            } else {
                fetchData();
            }
        }
    }, [user, userData, authLoading, userLoading, router]);

    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            const cData = await getChangelogItems();
            setChangelog(cData);
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب البيانات');
        } finally {
            setIsLoadingData(false);
        }
    };

    // --- CHANGELOG HANDLERS ---
    const handleSaveChangelog = async () => {
        if (!changelogForm.title || !changelogForm.version || !changelogForm.date) {
            toast.error('يرجى ملء الحقول الأساسية للتحديث');
            return;
        }

        try {
            if (editingChangelogId) {
                await updateChangelogItem(editingChangelogId, changelogForm);
                setChangelog(prev => prev.map(item => item.id === editingChangelogId ? { ...item, ...changelogForm } as ChangelogItem : item));
                toast.success('تم تعديل التحديث بنجاح');
            } else {
                const docRef = await addChangelogItem(changelogForm as ChangelogItem);
                setChangelog(prev => [{ ...changelogForm, id: docRef.id } as ChangelogItem, ...prev]);
                toast.success('تمت إضافة التحديث بنجاح');
            }
            resetChangelogForm();
        } catch (error) {
            toast.error('فشلت العملية');
        }
    };

    const handleDeleteChangelog = async (id: string) => {
        if (!confirm('الرجاء التأكيد على حذف هذا التحديث؟')) return;
        try {
            await deleteChangelogItem(id);
            setChangelog(prev => prev.filter(item => item.id !== id));
            toast.success('تم الحذف');
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    const resetChangelogForm = () => {
        setEditingChangelogId(null);
        setChangelogForm({ 
            title: '', version: '', date: new Date().toISOString().split('T')[0], type: 'minor', changes: [],
            category: 'other', isHero: false, isExploreCard: false, link: '', iconType: 'sparkles', imageUrl: '', htmlContent: ''
        });
        setNewChangeInput('');
    };

    const addChangeLine = () => {
        if (!newChangeInput.trim()) return;
        setChangelogForm(prev => ({
            ...prev,
            changes: [...(prev.changes || []), newChangeInput.trim()]
        }));
        setNewChangeInput('');
    };

    const removeChangeLine = (index: number) => {
        setChangelogForm(prev => ({
            ...prev,
            changes: prev.changes?.filter((_, i) => i !== index)
        }));
    };


    if (authLoading || userLoading || isLoadingData) {
        return <LoadingSpinner />;
    }

    return (
        <PageLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 dir-rtl text-right" dir="rtl">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <History className="text-emerald-600 dark:text-emerald-400" size={32} />
                                إدارة سجل التحديثات
                            </h1>
                            <p className="text-gray-500 mt-2">قم بإضافة الميزات والتحديثات الجديدة لعرضها للمستخدمين.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Changelog Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
                                <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
                                    {editingChangelogId ? 'تعديل التحديث' : 'إضافة سجل تحديث'}
                                    {editingChangelogId && <button onClick={resetChangelogForm} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md">إلغاء التعديل</button>}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5">عنوان التحديث</label>
                                        <input 
                                            type="text" 
                                            value={changelogForm.title} 
                                            onChange={e => setChangelogForm({...changelogForm, title: e.target.value})}
                                            placeholder="مثال: إطلاق الموديلات الجديدة"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-bold mb-1.5">رقم الإصدار</label>
                                            <input 
                                                type="text" 
                                                value={changelogForm.version} 
                                                onChange={e => setChangelogForm({...changelogForm, version: e.target.value})}
                                                placeholder="v1.2.0"
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-left"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1.5">تاريخ التحديث</label>
                                            <input 
                                                type="date" 
                                                value={changelogForm.date} 
                                                onChange={e => setChangelogForm({...changelogForm, date: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-bold mb-1.5">نوع التحديث</label>
                                            <select 
                                                value={changelogForm.type} 
                                                onChange={e => setChangelogForm({...changelogForm, type: e.target.value as any})}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                                            >
                                                <option value="major">كبير وجوهري (Major)</option>
                                                <option value="minor">ميزات فرعية (Minor)</option>
                                                <option value="patch">إصلاح أخطاء (Patch)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1.5">تصنيف الميزة</label>
                                            <select 
                                                value={changelogForm.category} 
                                                onChange={e => setChangelogForm({...changelogForm, category: e.target.value as any})}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                                            >
                                                <option value="other">عام (أخرى)</option>
                                                <option value="ai">ذكاء اصطناعي 🤖</option>
                                                <option value="ui">تحديثات الواجهة 🎨</option>
                                                <option value="community">المجتمع 👥</option>
                                                <option value="bugfix">إصلاحات وموثوقية 🔧</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 space-y-3">
                                        <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">خيارات التخصيص والظهور</h4>
                                        
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={changelogForm.isHero || false} 
                                                onChange={e => setChangelogForm({...changelogForm, isHero: e.target.checked})}
                                                className="w-4 h-4 text-indigo-600 rounded"
                                            />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">إبراز كقسم رئيسي (Hero Spotlight)</span>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={changelogForm.isExploreCard || false} 
                                                onChange={e => setChangelogForm({...changelogForm, isExploreCard: e.target.checked})}
                                                className="w-4 h-4 text-indigo-600 rounded"
                                            />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">عرض كبطاقة استكشاف إضافية</span>
                                        </label>

                                        <div className="grid grid-cols-1 gap-3 pt-3 mt-3 border-t border-indigo-200/50 dark:border-indigo-500/20">
                                            <div>
                                                <label className="block text-xs font-bold mb-1.5 text-indigo-900 dark:text-indigo-200">رابط إضافي (زر الإجراء)</label>
                                                <input 
                                                    type="text" 
                                                    value={changelogForm.link || ''} 
                                                    onChange={e => setChangelogForm({...changelogForm, link: e.target.value})}
                                                    placeholder="مثال: /copilot أو https://..."
                                                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 outline-none text-sm"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-1.5 text-indigo-900 dark:text-indigo-200">رابط الصورة التوضيحية (للكروت والصفحات)</label>
                                                <input 
                                                    type="text" 
                                                    value={changelogForm.imageUrl || ''} 
                                                    onChange={e => setChangelogForm({...changelogForm, imageUrl: e.target.value})}
                                                    placeholder="https://..."
                                                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 outline-none text-sm"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-1.5 text-indigo-900 dark:text-indigo-200">محتوى الصفحة المخصصة (HTML) - اختياري</label>
                                                <textarea 
                                                    value={changelogForm.htmlContent || ''} 
                                                    onChange={e => setChangelogForm({...changelogForm, htmlContent: e.target.value})}
                                                    placeholder="<div>محتوى صفحة الميزة بالكامل هنا...</div>"
                                                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 outline-none text-sm min-h-[100px] font-mono text-left"
                                                    dir="ltr"
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1 text-right">عند إضافة كود HTML، سيتم إنشاء صفحة مخصصة للميزة وسيقوم زر "معرفة المزيد" بتوجيه المستخدم إليها تلقائياً.</p>
                                            </div>
                                            {changelogForm.isExploreCard && (
                                                <div>
                                                    <label className="block text-xs font-bold mb-1.5 text-indigo-900 dark:text-indigo-200">أيقونة البطاقة</label>
                                                    <select 
                                                        value={changelogForm.iconType || 'sparkles'} 
                                                        onChange={e => setChangelogForm({...changelogForm, iconType: e.target.value as any})}
                                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 outline-none text-sm"
                                                    >
                                                        <option value="sparkles">✨ نجوم / ذكاء اصطناعي</option>
                                                        <option value="cpu">🧠 معالج / أداء</option>
                                                        <option value="layout">📱 واجهة وتصميم</option>
                                                        <option value="shield">🛡️ حماية وخصوصية</option>
                                                        <option value="zap">⚡️ سرعة وأدوات</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold mb-1.5">التعديلات (نقاط)</label>
                                        <div className="flex gap-2 pb-2">
                                            <input 
                                                type="text" 
                                                value={newChangeInput}
                                                onChange={e => setNewChangeInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChangeLine())}
                                                placeholder="أدخل التعديل ثم اضغط Enter..."
                                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm"
                                            />
                                            <button type="button" onClick={addChangeLine} className="px-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200"><Plus size={18} /></button>
                                        </div>
                                        <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                            {changelogForm.changes?.map((change, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-sm">
                                                    <Check size={14} className="text-emerald-500 shrink-0" />
                                                    <span className="flex-1 text-slate-700 dark:text-slate-300">{change}</span>
                                                    <button type="button" onClick={() => removeChangeLine(idx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                                </div>
                                            ))}
                                            {(!changelogForm.changes || changelogForm.changes.length === 0) && (
                                                <div className="text-xs text-slate-400 text-center py-2">لم تتم إضافة أي نقاط بعد.</div>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleSaveChangelog}
                                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 mt-4"
                                    >
                                        {editingChangelogId ? <Save size={18} /> : <Plus size={18} />}
                                        {editingChangelogId ? 'حفظ التعديلات' : 'نشر التحديث'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Changelog List */}
                        <div className="lg:col-span-2 space-y-4">
                            {changelog.map(item => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-mono font-bold text-sm bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md" dir="ltr">{item.version}</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                                    item.type === 'major' ? 'bg-amber-100 text-amber-700' :
                                                    item.type === 'minor' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {item.type === 'major' ? 'تحديث جوهري' : item.type === 'minor' ? 'محتوى جديد' : 'إصلاحات'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{item.title}</h3>
                                            <p className="text-sm text-slate-500 mt-1">{new Date(item.date).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingChangelogId(item.id!); setChangelogForm(item); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteChangelog(item.id!)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 mt-4">
                                        {item.changes.map((change, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                                                {change}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            {changelog.length === 0 && <div className="text-center py-20 text-slate-400">لا توجد تحديثات مضافة حالياً.</div>}
                        </div>
                    </div>

                </div>
            </div>
        </PageLayout>
    );
};

export default ChangelogAdminPage;

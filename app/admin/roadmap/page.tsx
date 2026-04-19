"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/context/AuthContext';
import { useUserData } from '../../../src/hooks/useUserData';
import { useRouter } from 'next/navigation';
import PageLayout from '../../../src/components/layout/PageLayout';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  getRoadmapItems, addRoadmapItem, updateRoadmapItem, deleteRoadmapItem, RoadmapItem,
  getChangelogItems, addChangelogItem, updateChangelogItem, deleteChangelogItem, ChangelogItem 
} from '../../../src/services/roadmap.service';
import { Plus, Edit2, Trash2, Save, Map, History, X, Check } from 'lucide-react';

const RoadmapAdminPage = () => {
    const { user, loading: authLoading } = useAuth();
    const { userData, loading: userLoading } = useUserData();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'roadmap' | 'changelog'>('roadmap');
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Data State
    const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
    const [changelog, setChangelog] = useState<ChangelogItem[]>([]);

    // Form State for Roadmap
    const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);
    const [roadmapForm, setRoadmapForm] = useState<Partial<RoadmapItem>>({
        title: '', description: '', status: 'planned', badge: 'جديد ✨'
    });

    // Form State for Changelog
    const [editingChangelogId, setEditingChangelogId] = useState<string | null>(null);
    const [changelogForm, setChangelogForm] = useState<Partial<ChangelogItem>>({
        title: '', version: 'v1.0.0', date: new Date().toISOString().split('T')[0], type: 'minor', changes: []
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
            const [rData, cData] = await Promise.all([getRoadmapItems(), getChangelogItems()]);
            setRoadmap(rData);
            setChangelog(cData);
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب البيانات');
        } finally {
            setIsLoadingData(false);
        }
    };

    // --- ROADMAP HANDLERS ---
    const handleSaveRoadmap = async () => {
        if (!roadmapForm.title || !roadmapForm.description) {
            toast.error('يرجى ملء كافة الحقول الأساسية');
            return;
        }

        try {
            if (editingRoadmapId) {
                await updateRoadmapItem(editingRoadmapId, roadmapForm);
                setRoadmap(prev => prev.map(item => item.id === editingRoadmapId ? { ...item, ...roadmapForm } as RoadmapItem : item));
                toast.success('تم التعديل بنجاح');
            } else {
                const docRef = await addRoadmapItem(roadmapForm as RoadmapItem);
                setRoadmap(prev => [...prev, { ...roadmapForm, id: docRef.id } as RoadmapItem]);
                toast.success('تمت الإضافة بنجاح');
            }
            resetRoadmapForm();
        } catch (error) {
            toast.error('فشلت العملية');
        }
    };

    const handleDeleteRoadmap = async (id: string) => {
        if (!confirm('الرجاء التأكيد على حذف هذه الميزة؟')) return;
        try {
            await deleteRoadmapItem(id);
            setRoadmap(prev => prev.filter(item => item.id !== id));
            toast.success('تم الحذف');
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    const resetRoadmapForm = () => {
        setEditingRoadmapId(null);
        setRoadmapForm({ title: '', description: '', status: 'planned', badge: 'ميزة جديدة ✨' });
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
                // Add to beginning since it is ordered by desc date usually
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
        setChangelogForm({ title: '', version: '', date: new Date().toISOString().split('T')[0], type: 'minor', changes: [] });
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
                                <Map className="text-indigo-600 dark:text-indigo-400" size={32} />
                                إدارة خارطة الطريق والتحديثات
                            </h1>
                            <p className="text-gray-500 mt-2">قم بإدارة ما يراه المستخدمون حول مستقبل المنصة وآخر التحديثات.</p>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <button 
                                onClick={() => setActiveTab('roadmap')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <Map size={16} /> الميزات المخططة
                            </button>
                            <button 
                                onClick={() => setActiveTab('changelog')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'changelog' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <History size={16} /> آخر التحديثات
                            </button>
                        </div>
                    </div>


                    {/* --- ROADMAP TAB --- */}
                    {activeTab === 'roadmap' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Roadmap Form */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
                                    <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
                                        {editingRoadmapId ? 'تعديل ميزة' : 'إضافة ميزة جديدة'}
                                        {editingRoadmapId && <button onClick={resetRoadmapForm} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md">إلغاء التعديل</button>}
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1.5">عنوان الميزة</label>
                                            <input 
                                                type="text" 
                                                value={roadmapForm.title} 
                                                onChange={e => setRoadmapForm({...roadmapForm, title: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1.5">الوصف</label>
                                            <textarea 
                                                value={roadmapForm.description} 
                                                onChange={e => setRoadmapForm({...roadmapForm, description: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none min-h-[100px]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-bold mb-1.5">الحالة</label>
                                                <select 
                                                    value={roadmapForm.status} 
                                                    onChange={e => setRoadmapForm({...roadmapForm, status: e.target.value as any})}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                                                >
                                                    <option value="planned">مخطط لها (Planned)</option>
                                                    <option value="in_progress">قيد التنفيذ (In Progress)</option>
                                                    <option value="done">مكتملة (Done)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1.5">شارة (Badge)</label>
                                                <input 
                                                    type="text" 
                                                    value={roadmapForm.badge} 
                                                    onChange={e => setRoadmapForm({...roadmapForm, badge: e.target.value})}
                                                    placeholder="مثال: تطوير 💻"
                                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleSaveRoadmap}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700"
                                        >
                                            {editingRoadmapId ? <Save size={18} /> : <Plus size={18} />}
                                            {editingRoadmapId ? 'حفظ التعديلات' : 'إضافة الميزة'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Roadmap List */}
                            <div className="lg:col-span-2 space-y-6">
                                {['planned', 'in_progress', 'done'].map((status) => {
                                    const items = roadmap.filter(i => i.status === status);
                                    if (items.length === 0) return null;
                                    
                                    const statusTitle = status === 'planned' ? 'مخطط لها' : status === 'in_progress' ? 'قيد التنفيذ' : 'مكتملة';
                                    const statusColor = status === 'planned' ? 'text-slate-500' : status === 'in_progress' ? 'text-amber-500' : 'text-emerald-500';

                                    return (
                                        <div key={status} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                            <h3 className={`text-lg font-black mb-4 ${statusColor}`}>{statusTitle} ({items.length})</h3>
                                            <div className="space-y-3">
                                                {items.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded-md">{item.badge}</span>
                                                                <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                                            </div>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg truncate">{item.description}</p>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            <button onClick={() => { setEditingRoadmapId(item.id!); setRoadmapForm(item); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDeleteRoadmap(item.id!)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                {roadmap.length === 0 && <div className="text-center py-20 text-slate-400">لا توجد ميزات مضافة حالياً.</div>}
                            </div>
                        </div>
                    )}


                    {/* --- CHANGELOG TAB --- */}
                    {activeTab === 'changelog' && (
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
                    )}

                </div>
            </div>
        </PageLayout>
    );
};

export default RoadmapAdminPage;

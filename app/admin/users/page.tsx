"use client";
import { useState, useEffect } from 'react';
import {
    Users, Mail, Search, CheckSquare, Square,
    MoreVertical, Send, X, Loader2, Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    creationTime: string;
    lastSignInTime: string;
    plan: 'free' | 'pro';
    emailVerified?: boolean;
    disabled?: boolean;
    providers?: string[];
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [savingPlanForUid, setSavingPlanForUid] = useState<string | null>(null);
    const [pendingPlans, setPendingPlans] = useState<Record<string, 'free' | 'pro'>>({});
    const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'disabled'>('all');
    const [verifyFilter, setVerifyFilter] = useState<'all' | 'verified' | 'unverified'>('all');

    // Email State
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const getAdminAuthHeader = async () => {
        try {
            const { auth } = await import('@/src/config/firebase');
            let currentUser = auth.currentUser;

            if (!currentUser) {
                const { onAuthStateChanged } = await import('firebase/auth');
                currentUser = await new Promise<typeof auth.currentUser>((resolve) => {
                    const timeout = setTimeout(() => {
                        console.error('⏱️ Auth state change timeout');
                        resolve(null);
                    }, 5000);
                    const unsubscribe = onAuthStateChanged(auth, (user) => {
                        clearTimeout(timeout);
                        unsubscribe();
                        resolve(user);
                    });
                });
            }

            if (!currentUser) {
                console.error('❌ No current user found');
                throw new Error('جلسة المسؤول منتهية. الرجاء إعادة تسجيل الدخول');
            }

            console.log(`✅ User authenticated: ${currentUser.email}`);
            const token = await currentUser.getIdToken(true); // Force token refresh
            return { Authorization: `Bearer ${token}` };
        } catch (error) {
            console.error('❌ Failed to get admin auth header:', error);
            throw error;
        }
    };

    const fetchUsers = async () => {
        try {
            const authHeader = await getAdminAuthHeader();
            const res = await fetch('/api/admin/users', {
                headers: authHeader,
            });
            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data?.details || data?.error || 'Failed to fetch users';
                console.error(`❌ API error: ${errorMsg}`);
                throw new Error(errorMsg);
            }
            if (data.users) {
                setUsers(data.users);
                const nextPendingPlans: Record<string, 'free' | 'pro'> = {};
                for (const user of data.users as User[]) {
                    nextPendingPlans[user.uid] = user.plan || 'free';
                }
                setPendingPlans(nextPendingPlans);
                console.log(`✅ Successfully loaded ${data.users.length} users`);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('❌ Failed to fetch users:', errorMsg);
            toast.error(`تعذر تحميل المستخدمين: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const saveUserPlan = async (user: User) => {
        const selectedPlan = pendingPlans[user.uid] || user.plan || 'free';
        setSavingPlanForUid(user.uid);
        try {
            const authHeader = await getAdminAuthHeader();
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader,
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    plan: selectedPlan,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data?.details || data?.error || 'Failed to update plan';
                console.error(`❌ Update failed: ${errorMsg}`);
                throw new Error(errorMsg);
            }

            setUsers((prev) =>
                prev.map((u) => (u.uid === user.uid ? { ...u, plan: selectedPlan } : u))
            );
            toast.success(`✅ تم تحديث اشتراك المستخدم إلى ${selectedPlan.toUpperCase()}`);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('❌ Failed to save plan:', errorMsg);
            toast.error(`خطأ: ${errorMsg}`);
            toast.error('فشل تحديث الاشتراك، حاول مرة أخرى');
        } finally {
            setSavingPlanForUid(null);
        }
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.uid));
        }
    };

    const toggleUser = (uid: string) => {
        if (selectedUsers.includes(uid)) {
            setSelectedUsers(selectedUsers.filter(id => id !== uid));
        } else {
            setSelectedUsers([...selectedUsers, uid]);
        }
    };

    const handleSendEmail = async () => {
        if (!emailSubject || !emailMessage) {
            toast.error('الرجاء ملء الموضوغ والرسالة');
            return;
        }

        setSending(true);
        try {
            // Get emails of selected users
            const recipients = users
                .filter(u => selectedUsers.includes(u.uid))
                .map(u => u.email)
                .filter(Boolean);

            const res = await fetch('/api/admin/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    subject: emailSubject,
                    message: emailMessage
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Show detailed report
                setIsEmailModalOpen(false);
                setEmailSubject('');
                setEmailMessage('');
                setSelectedUsers([]);

                toast(() => (
                    <div className="min-w-[300px]">
                        <div className="flex items-center gap-2 mb-2 font-bold text-lg text-slate-800">
                            <CheckSquare className="w-5 h-5 text-green-500" />
                            تقرير الإرسال
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>تم الإرسال بنجاح:</span>
                                <span className="font-bold text-green-600">{data.stats?.success || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>فشل الإرسال:</span>
                                <span className="font-bold text-red-600">{data.stats?.failed || 0}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 mt-1">
                                <span>الإجمالي:</span>
                                <span className="font-bold">{data.stats?.total || 0}</span>
                            </div>
                        </div>
                    </div>
                ), { duration: 6000 });

            } else {
                throw new Error(data.error || 'Failed to send');
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل إرسال الرسالة. تأكد من إعدادات SMTP.');
        } finally {
            setSending(false);
        }
    };

    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const isActiveUser = (user: User) => {
        if (!user.lastSignInTime) return false;
        const diff = now - new Date(user.lastSignInTime).getTime();
        return diff <= THIRTY_DAYS_MS;
    };

    const filteredUsers = users.filter((user) => {
        const searchValue = searchTerm.toLowerCase();
        const searchMatched =
            user.email?.toLowerCase().includes(searchValue) ||
            user.displayName?.toLowerCase().includes(searchValue) ||
            user.uid?.toLowerCase().includes(searchValue);

        if (!searchMatched) return false;

        if (planFilter !== 'all' && user.plan !== planFilter) return false;

        if (verifyFilter === 'verified' && !user.emailVerified) return false;
        if (verifyFilter === 'unverified' && user.emailVerified) return false;

        if (statusFilter === 'disabled' && !user.disabled) return false;
        if (statusFilter === 'active' && (user.disabled || !isActiveUser(user))) return false;
        if (statusFilter === 'inactive' && (user.disabled || isActiveUser(user))) return false;

        return true;
    });

    const proUsersCount = users.filter((u) => u.plan === 'pro').length;
    const activeUsersCount = users.filter((u) => !u.disabled && isActiveUser(u)).length;
    const verifiedUsersCount = users.filter((u) => u.emailVerified).length;

    return (
        <div className="p-3 sm:p-6 bg-slate-50 dark:bg-[#0B0C15] min-h-screen text-slate-900 dark:text-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 sm:mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
                            إدارة المستخدمين
                            <span className="text-xs sm:text-sm font-normal bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                                {users.length} مستخدم
                            </span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm sm:text-base">عرض وإدارة جميع المستخدمين المسجلين في المنصة</p>
                    </div>

                    <div className="w-full md:w-auto space-y-2">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="بحث بالاسم أو الإيميل..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="relative min-w-0">
                                <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <select
                                    value={planFilter}
                                    onChange={(e) => setPlanFilter(e.target.value as 'all' | 'free' | 'pro')}
                                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] text-sm outline-none"
                                >
                                    <option value="all">كل الخطط</option>
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                </select>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'disabled')}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] text-sm outline-none"
                            >
                                <option value="all">كل الحالات</option>
                                <option value="active">نشط (آخر 30 يوم)</option>
                                <option value="inactive">غير نشط</option>
                                <option value="disabled">معطل</option>
                            </select>
                            <select
                                value={verifyFilter}
                                onChange={(e) => setVerifyFilter(e.target.value as 'all' | 'verified' | 'unverified')}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] text-sm outline-none"
                            >
                                <option value="all">التحقق: الكل</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>

                        {selectedUsers.length > 0 && (
                            <button
                                onClick={() => setIsEmailModalOpen(true)}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium animate-in fade-in slide-in-from-bottom-2"
                            >
                                <Mail className="w-4 h-4" />
                                إرسال ({selectedUsers.length})
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] p-4">
                        <p className="text-xs text-slate-500">إجمالي المستخدمين</p>
                        <p className="text-2xl font-extrabold mt-1">{users.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] p-4">
                        <p className="text-xs text-slate-500">مشتركين Pro</p>
                        <p className="text-2xl font-extrabold mt-1 text-emerald-600">{proUsersCount}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] p-4">
                        <p className="text-xs text-slate-500">نشطين (30 يوم)</p>
                        <p className="text-2xl font-extrabold mt-1 text-indigo-600">{activeUsersCount}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] p-4">
                        <p className="text-xs text-slate-500">إيميل موثّق</p>
                        <p className="text-2xl font-extrabold mt-1 text-blue-600">{verifiedUsersCount}</p>
                    </div>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3 mb-4">
                    {loading ? (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] p-6 text-center text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            جاري تحميل البيانات...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] p-6 text-center text-slate-500">
                            لا يوجد مستخدمين مطابقين للبحث
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.uid} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151725] p-4 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <button onClick={() => toggleUser(user.uid)} className="p-1">
                                        {selectedUsers.includes(user.uid) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                    </button>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm">{user.displayName || 'مستخدم غير معروف'}</div>
                                        <div className="text-xs text-slate-500 font-mono">{user.uid.substring(0, 8)}...</div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 break-all">{user.email}</div>
                                <div className="flex flex-wrap gap-1 text-[11px]">
                                    <span className={`px-2 py-0.5 rounded-full ${user.emailVerified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>{user.emailVerified ? 'Verified' : 'Unverified'}</span>
                                    <span className={`px-2 py-0.5 rounded-full ${user.disabled ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>{user.disabled ? 'Disabled' : isActiveUser(user) ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={pendingPlans[user.uid] || user.plan || 'free'}
                                        onChange={(e) =>
                                            setPendingPlans((prev) => ({
                                                ...prev,
                                                [user.uid]: e.target.value === 'pro' ? 'pro' : 'free',
                                            }))
                                        }
                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A1D2D] text-sm"
                                    >
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => saveUserPlan(user)}
                                        disabled={savingPlanForUid === user.uid}
                                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-60"
                                    >
                                        {savingPlanForUid === user.uid ? '...' : 'تفعيل'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Users Table */}
                <div className="hidden md:block bg-white dark:bg-[#151725] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="p-4 w-12 text-center">
                                        <button onClick={handleSelectAll} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            {selectedUsers.length === users.length && users.length > 0 ?
                                                <CheckSquare className="w-5 h-5 text-indigo-600" /> :
                                                <Square className="w-5 h-5 text-slate-400" />
                                            }
                                        </button>
                                    </th>
                                    <th className="p-4 font-medium text-slate-500 text-sm">المستخدم</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm">البريد الإلكتروني</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm">الاشتراك</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm">تاريخ التسجيل</th>
                                    <th className="p-4 font-medium text-slate-500 text-sm">آخر ظهور</th>
                                    <th className="p-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            جاري تحميل البيانات...
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.uid} className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${selectedUsers.includes(user.uid) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                        <td className="p-4 text-center">
                                            <button onClick={() => toggleUser(user.uid)} className="p-1">
                                                {selectedUsers.includes(user.uid) ?
                                                    <CheckSquare className="w-5 h-5 text-indigo-600" /> :
                                                    <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                                                }
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                                                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">
                                                        {user.displayName || 'مستخدم غير معروف'}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-mono hidden md:block">{user.uid.substring(0, 8)}...</div>
                                                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px]">
                                                        <span className={`px-2 py-0.5 rounded-full ${user.emailVerified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                                                            {user.emailVerified ? 'Verified' : 'Unverified'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full ${user.disabled ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
                                                            {user.disabled ? 'Disabled' : isActiveUser(user) ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm">{user.email}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={pendingPlans[user.uid] || user.plan || 'free'}
                                                    onChange={(e) =>
                                                        setPendingPlans((prev) => ({
                                                            ...prev,
                                                            [user.uid]: e.target.value === 'pro' ? 'pro' : 'free',
                                                        }))
                                                    }
                                                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A1D2D] text-sm"
                                                >
                                                    <option value="free">Free</option>
                                                    <option value="pro">Pro</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => saveUserPlan(user)}
                                                    disabled={savingPlanForUid === user.uid}
                                                    className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {savingPlanForUid === user.uid ? '...' : 'تفعيل'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {new Date(user.creationTime).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {user.lastSignInTime ? (
                                                <div>
                                                    <div>{new Date(user.lastSignInTime).toLocaleDateString('ar-EG')}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {new Date(user.lastSignInTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && filteredUsers.length === 0 && (
                            <div className="p-12 text-center text-slate-500">
                                لا يوجد مستخدمين مطابقين للبحث
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Send Email Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-[#151725] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Send className="w-5 h-5 text-indigo-600" />
                                إرسال رسالة بريدية
                            </h3>
                            <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-4 py-3 rounded-xl text-sm">
                                سيتم إرسال هذه الرسالة إلى <span className="font-bold">{selectedUsers.length}</span> مستخ دمين محددين.
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">عنوان الرسالة (Subject)</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="مثال: تحديثات جديدة في منصة Tolzy..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A1D2D] focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">محتوى الرسالة (HTML مدعوم)</label>
                                <textarea
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    rows={6}
                                    placeholder="اكتب رسالتك هنا..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A1D2D] focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-slate-50 dark:bg-[#1A1D2D]/50">
                            <button
                                onClick={() => setIsEmailModalOpen(false)}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sending}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                {sending ? 'جاري الإرسال...' : 'إرسال الآن'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

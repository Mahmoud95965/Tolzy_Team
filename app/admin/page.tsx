"use client";

import { useEffect, useState } from 'react';
import PageLayout from '../../src/components/layout/PageLayout';
import { useAuth } from '../../src/context/AuthContext';
import { useUserData } from '../../src/hooks/useUserData';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Upload,
    BookOpen,
    FileText,
    Users,
    CreditCard,
    Activity,
    ArrowRight,
    Shield,
    FileQuestion,
    Layout,
    Map,
} from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

// Module-level cache for admin dashboard stats
let cachedAdminStats: {
    users: number;
    tools: number;
    courses: number;
    news: number;
    exams: number;
} | null = null;
let lastStatsFetchTime = 0;
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes Time-To-Live

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { userData, loading: userLoading } = useUserData();
    const router = useRouter();
    const [stats, setStats] = useState({
        users: 0,
        tools: 0,
        courses: 0,
        news: 0,
        exams: 1
    });

    useEffect(() => {
        // Redirect if not admin
        if (!authLoading && !userLoading) {
            const isAdminEmail = user?.email?.toLowerCase() === 'mahmoud.m.moussa5310@gmail.com';
            if (!user || (userData?.role !== 'admin' && !isAdminEmail)) {
                router.push('/');
            }
        }
    }, [user, userData, authLoading, userLoading, router]);

    useEffect(() => {
        const fetchStats = async () => {
            // Check cache first (avoid duplicate runAggregationQuery under free quota)
            const now = Date.now();
            if (cachedAdminStats && (now - lastStatsFetchTime < STATS_CACHE_TTL)) {
                setStats(cachedAdminStats);
                return;
            }

            try {
                const usersCount = (await getCountFromServer(collection(db, 'users'))).data().count;
                const toolsCount = (await getCountFromServer(collection(db, 'tools'))).data().count;
                const coursesCount = (await getCountFromServer(collection(db, 'courses'))).data().count;
                const newsCount = (await getCountFromServer(collection(db, 'news'))).data().count;

                const newStats = {
                    users: usersCount,
                    tools: toolsCount,
                    courses: coursesCount,
                    news: newsCount,
                    exams: 1
                };

                cachedAdminStats = newStats;
                lastStatsFetchTime = now;
                setStats(newStats);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
        };

        const isAdminEmail = user?.email?.toLowerCase() === 'mahmoud.m.moussa5310@gmail.com';
        if (userData?.role === 'admin' || isAdminEmail) {
            fetchStats();
        }
    }, [userData, user]);

    if (authLoading || userLoading) {
        return <LoadingSpinner />;
    }

    const isAdminEmail = user?.email?.toLowerCase() === 'mahmoud.m.moussa5310@gmail.com';
    if (userData?.role !== 'admin' && !isAdminEmail) {
        return null;
    }

    const adminCards = [
        {
            title: 'إدارة الاشتراكات',
            description: 'تفعيل خطط المستخدمين (Free / Pro) بعد التحويل اليدوي',
            icon: CreditCard,
            href: '/admin/users',
            color: 'bg-green-600',
            stat: null,
            statLabel: 'اشتراكات'
        },
        {
            title: 'إدارة الأدوات',
            description: 'رفع وتعديل وإدارة أدوات الذكاء الاصطناعي',
            icon: Upload,
            href: '/admin/upload-tools',
            color: 'bg-indigo-500',
            stat: stats.tools,
            statLabel: 'أداة'
        },
        {
            title: 'إدارة الكورسات',
            description: 'إضافة وتعديل الدورات التعليمية والدروس',
            icon: BookOpen,
            href: '/admin/courses',
            color: 'bg-emerald-500',
            stat: stats.courses,
            statLabel: 'كورس'
        },
        {
            title: 'إدارة المقالات',
            description: 'إدارة مقالات الذكاء الاصطناعي والأخبار',
            icon: FileText,
            href: '/admin/articles',
            color: 'bg-rose-500',
            stat: stats.news,
            statLabel: 'مقال'
        },
        {
            title: 'إدارة الاختبارات',
            description: 'إدارة اختبارات الذكاء الاصطناعي وبنك الأسئلة',
            icon: FileQuestion,
            href: '/admin/courses?tab=exams',
            color: 'bg-amber-500',
            stat: stats.exams,
            statLabel: 'اختبار'
        },
        {
            title: 'إدارة TOLZY Pulse',
            description: 'إضافة ومتابعة نبض التحديثات والميزات الجديدة',
            icon: Activity,
            href: '/admin/pulse',
            color: 'bg-indigo-600',
            stat: null,
            statLabel: 'نبض/تحديث'
        }
    ];

    return (
        <PageLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4">
                            <Shield className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                            لوحة التحكم
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            مرحباً بك في لوحة تحكم المسؤول، يمكنك إدارة جميع أقسام المنصة من هنا.
                        </p>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي المستخدمين</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.users}</h3>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                    <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">عدد الأدوات</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.tools}</h3>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                    <Link href="/learn" className="text-emerald-400 hover:text-emerald-300 font-bold">الذهاب للأكاديمية</Link>
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">عدد الكورسات</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.courses}</h3>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                                    <FileText className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">عدد الأخبار</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.news}</h3>
                        </div>
                    </div>

                    {/* Main Navigation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Users Card - ADDED HERE */}
                        <Link
                            href="/admin/users"
                            className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-110" />

                            <div className="p-8">
                                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="h-7 w-7" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    إدارة المستخدمين
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    عرض دارة جميع المستخدمين وإرسال إيميلات
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-700">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">مستخدم</span>
                                    </div>

                                    <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                                        الدخول
                                        <ArrowRight className="h-4 w-4 rotate-180" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                        {adminCards.map((card, index) => (
                            <Link
                                href={card.href}
                                key={index}
                                className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${card.color} opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-110`} />

                                <div className="p-8">
                                    <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <card.icon className="h-7 w-7" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        {card.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                        {card.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-700">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{card.stat}</span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{card.statLabel}</span>
                                        </div>

                                        <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                                            الدخول
                                            <ArrowRight className="h-4 w-4 rotate-180" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Additional Quick Actions (Future) */}
                    <div className="mt-12 bg-indigo-900 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-right">
                                <h3 className="text-2xl font-bold text-white mb-2">هل تحتاج للمساعدة؟</h3>
                                <p className="text-indigo-200">
                                    يمكنك مراجعة دليل المسؤول لمعرفة كيفية استخدام أدوات لوحة التحكم بكفاءة.
                                </p>
                            </div>
                            {/* <button className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                قريباً: دليل المسؤول
              </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default AdminDashboard;

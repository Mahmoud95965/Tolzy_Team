"use client";

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, BarChart2, Settings } from 'lucide-react';
import SupabaseCoursesAdmin from './SupabaseCoursesAdmin';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

const TolzyLearnAdminPage: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 font-sans text-gray-900 dark:text-white" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
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
                        active={true}
                    />
                    <SidebarItem icon={BarChart2} label="التحليلات" />
                    <SidebarItem icon={Settings} label="الإعدادات" />
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                            {user?.displayName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.displayName || 'مستخدم مسؤول'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-slate-900">
                <SupabaseCoursesAdmin />
            </main>
        </div>
    );
};

export default TolzyLearnAdminPage;

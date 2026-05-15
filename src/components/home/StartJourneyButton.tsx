"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';

const StartJourneyButton: React.FC = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleClick = () => {
        if (loading) return;
        if (user) {
            router.push('/tools');
        } else {
            router.push('/auth');
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="w-full sm:w-auto group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 overflow-hidden text-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        جاري التحميل...
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </>
                ) : (
                    <>
                        ابدأ رحلة الإبداع
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </>
                )}
            </span>
        </button>
    );
};

export default StartJourneyButton;

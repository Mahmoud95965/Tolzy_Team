"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const StartJourneyButton: React.FC = () => {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const isFree = user && (!userProfile?.plan || userProfile.plan === 'free');

    const handleClick = () => {
        if (loading) return; // Prevent action while loading

        if (user) {
            if (isFree) {
                toast.error('الابداع مع TOLZY AI متاح حصرياً لأبطال باقات PRO وأعلى 💎');
                router.push('/pricing');
                return;
            }
            router.push('/tolzy-ai');
        } else {
            router.push('/auth');
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`w-full sm:w-auto group relative px-8 py-4 ${isFree ? 'bg-slate-300 dark:bg-slate-800 text-slate-500' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'} rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 overflow-hidden text-center disabled:opacity-70 disabled:cursor-not-allowed`}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        جاري التحميل...
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </>
                ) : isFree ? (
                    <>
                        ابدأ الإبداع (مغلق 🔒)
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

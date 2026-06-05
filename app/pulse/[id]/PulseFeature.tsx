"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '../../../src/components/layout/PageLayout';
import { getChangelogItemById, ChangelogItem } from '../../../src/services/changelog.service';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PulseFeature() {
    const params = useParams();
    const router = useRouter();
    const [item, setItem] = useState<ChangelogItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params?.id as string;
        if (!id) return;

        const loadFeature = async () => {
            try {
                const data = await getChangelogItemById(id);
                if (data) {
                    setItem(data);
                } else {
                    toast.error('الميزة غير موجودة');
                    router.push('/pulse');
                }
            } catch (error) {
                console.error("Error loading feature", error);
                router.push('/pulse');
            } finally {
                setLoading(false);
            }
        };

        loadFeature();
    }, [params, router]);

    if (loading) {
        return (
            <PageLayout>
                <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col justify-center items-center">
                    <LoadingSpinner />
                </div>
            </PageLayout>
        );
    }

    if (!item) return null;

    return (
        <PageLayout>
            <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#050507] text-slate-900 dark:text-white pb-20 pt-8" dir="rtl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Back Button */}
                    <div className="mb-10">
                        <Link href="/pulse" className="inline-flex items-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <ArrowLeft size={16} /> العودة لنبض التحديثات (TOLZY Pulse)
                        </Link>
                    </div>

                    {/* Content */}
                    {item.htmlContent ? (
                        <div 
                            className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800 feature-html-content overflow-hidden text-right"
                            dangerouslySetInnerHTML={{ __html: item.htmlContent }}
                        />
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
                            <p className="text-slate-600 dark:text-slate-400">محتوى الميزة غير متاح كصفحة مخصصة.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}

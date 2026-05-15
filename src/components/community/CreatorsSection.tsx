'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CreatorUser {
  username: string;
  displayName: string;
  photoURL: string | null;
  postsCount: number;
}

interface CreatorsSectionProps {
  onBack?: () => void;
}

const CreatorsSection: React.FC<CreatorsSectionProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [creators, setCreators] = useState<CreatorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState('');
  const [error, setError] = useState('');
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchCreators = useCallback(async (isInitial = false) => {
    if (!isInitial && loadingMore) return;
    if (!isInitial && !hasMore) return;

    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: '10',
        ...(lastDocId && !isInitial ? { lastDocId } : {}),
        ...(user?.uid ? { exclude: user.uid } : {}),
      });

      const res = await fetch(`/api/community/users?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch users');

      const data = await res.json();
      const newUsers: CreatorUser[] = data.users || [];

      setCreators(prev => isInitial ? newUsers : [...prev, ...newUsers]);
      setHasMore(data.hasMore ?? false);
      setLastDocId(data.lastDocId || '');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDocId, hasMore, loadingMore, user?.uid]);

  // Initial load
  useEffect(() => {
    fetchCreators(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchCreators(false);
        }
      },
      { rootMargin: '200px' }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, fetchCreators]);

  // Arabic pluralizer for "post"
  const postsLabel = (count: number): string => {
    if (count === 0) return 'لا يوجد منشورات';
    if (count === 1) return 'منشور واحد';
    if (count === 2) return 'منشوران';
    if (count < 11) return `${count} منشورات`;
    return `${count} منشور`;
  };

  const avatarColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-indigo-600', 'bg-cyan-600'];
  const getAvatarColor = (name: string) => avatarColors[(name || '').charCodeAt(0) % avatarColors.length];

  return (
    <div className="bg-white dark:bg-[#242526] min-h-screen" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#242526] z-10">
        <div className="flex-1" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1 text-center">المبدعون</h1>
        <div className="flex-1 flex justify-start">
          {onBack && (
            <button onClick={onBack} aria-label="Back" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Title */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">أشخاص قد تعرفهم</h2>
      </div>

      {/* Loading Initial */}
      {loading && creators.length === 0 && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0866ff]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-10 px-4">
          <p className="text-red-500 font-bold">{error}</p>
          <button onClick={() => fetchCreators(true)} className="mt-3 text-[#0866ff] font-bold hover:underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Creators List */}
      <div className="flex flex-col">
        {creators.map((creator) => (
          <div
            key={creator.username}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Link href={`/profile?username=${creator.username}`} className="shrink-0">
                {creator.photoURL ? (
                  <img
                    alt={creator.displayName}
                    className="w-[84px] h-[84px] rounded-full object-cover border border-gray-200 dark:border-gray-600"
                    src={creator.photoURL}
                  />
                ) : (
                  <div className={`w-[84px] h-[84px] rounded-full ${getAvatarColor(creator.displayName)} flex items-center justify-center text-white font-bold text-2xl border border-gray-200 dark:border-gray-600`}>
                    {creator.displayName?.[0] || 'م'}
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex flex-col">
                <Link href={`/profile?username=${creator.username}`}>
                  <span className="font-bold text-[17px] text-gray-900 dark:text-white hover:underline cursor-pointer">
                    {creator.displayName}
                  </span>
                </Link>

                {/* Post count row */}
                <div className="flex items-center mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  <span>{postsLabel(creator.postsCount)}</span>
                </div>

                {/* View profile button */}
                <div className="mt-2">
                  <Link
                    href={`/profile?username=${creator.username}`}
                    className="block w-full bg-[#005cff] text-white font-semibold py-1.5 px-6 rounded-md text-[15px] text-center hover:bg-[#004bb5] transition-colors"
                  >
                    عرض الملف
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more sentinel */}
      <div ref={loaderRef} className="py-6 flex justify-center">
        {loadingMore && <Loader2 className="w-6 h-6 animate-spin text-[#0866ff]" />}
        {!hasMore && creators.length > 0 && (
          <p className="text-gray-400 text-sm font-bold">لا يوجد المزيد</p>
        )}
      </div>
    </div>
  );
};

export default CreatorsSection;

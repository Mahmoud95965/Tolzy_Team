"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Star, User, MessageSquare, Send, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingSpinnerSmall } from '../common/LoadingSpinner';

interface Review {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface CourseReviewsProps {
    courseId: string;
    onRatingUpdate?: (newRating: number, newCount: number) => void;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId, onRatingUpdate }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [courseId]);

    const fetchReviews = async () => {
        try {
            // Validate courseId before querying
            if (!courseId) {
                setReviews([]);
                setLoading(false);
                return;
            }

            // Try indexed query first
            let q = query(
                collection(db, 'reviews'),
                where('courseId', '==', courseId),
                orderBy('createdAt', 'desc')
            );

            let querySnapshot;
            try {
                querySnapshot = await getDocs(q);
            } catch (indexError: any) {
                // If index error, fall back to basic query without orderBy
                if (indexError.message?.includes('requires an index')) {
                    console.warn('Reviews index missing, using fallback query');
                    const basicQuery = query(
                        collection(db, 'reviews'),
                        where('courseId', '==', courseId)
                    );
                    querySnapshot = await getDocs(basicQuery);
                } else {
                    throw indexError;
                }
            }

            const fetchedReviews: Review[] = [];
            querySnapshot.forEach((doc) => {
                fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
            });

            // Sort client-side if we used fallback
            fetchedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setReviews(fetchedReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('يجب عليك تسجيل الدخول أولاً');
            return;
        }
        if (rating === 0) {
            toast.error('الرجاء اختيار تقييم');
            return;
        }
        if (!comment.trim()) { // Changed from 'comment'
            toast.error('يرجى كتابة تعليق');
            return;
        }

        setIsSubmitting(true);
        try {
            const newReview = {
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'مستخدم مجهول', // Adjusted default name
                userAvatar: user.photoURL || '',
                rating: rating,
                comment: comment,
            };

            // Call API endpoint
            // fetch-course used http://localhost:5000 logic, let's stick to that if it's a separate express server. 
            // Wait, fetch-course.js is in /api/ folder. If it's Vercel, it's just /api/submit-review.

            const response = await fetch('/api/submit-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    review: newReview
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to submit review');
            }

            const data = await response.json();

            // Optimistic Update (or use returned data)
            const addedReview = {
                ...newReview,
                courseId,
                createdAt: new Date().toISOString(),
                id: data.reviewId
            };

            setReviews(prev => [addedReview, ...prev]);

            // Notify parent to update stats
            if (onRatingUpdate) {
                onRatingUpdate(data.newRating, data.newReviewsCount);
            }

            toast.success('تم إضافة تقييمك بنجاح!');
            setRating(0);
            setComment('');
        } catch (error: any) {
            console.error('Error submitting review:', error);
            toast.error('حدث خطأ أثناء إرسال التقييم: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            toast.success('تم حذف التعليق بنجاح');

            // Note: We are not updating the aggregate rating here immediately as it requires server-side recalc or complex client-side math. 
            // Ideally, the parent component should refetch or the Cloud Function handles aggregations properly.
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('حدث خطأ أثناء حذف التعليق');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    التقييمات والمراجعات
                </h3>
                <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black">
                    {reviews.length} مراجعة
                </div>
            </div>

            {/* Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/20 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                تقييمك الشخصي
                            </label>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            className={`w-7 h-7 ${(hoverRating || rating) >= star
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-slate-200 dark:text-slate-700'
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                                رأيك يساعد الآخرين في اختيار الكورس المناسب. شكراً لمشاركتك تجربتك معنا!
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="شاركنا رأيك في محتوى الكورس، أسلوب الشرح..."
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400 resize-none h-24 text-sm font-medium"
                        />
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50 ${isSubmitting ? 'animate-pulse' : 'hover:-translate-y-0.5'}`}
                            >
                                {isSubmitting ? 'جاري النشر...' : (
                                    <>
                                        <span>نشر المراجعة</span>
                                        <Send className="w-4 h-4 rtl:-scale-x-100" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-6 text-center border border-indigo-100/50 dark:border-indigo-900/20">
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm font-bold">
                        سجل دخولك الآن لتتمكن من إضافة تقييمك الخاص
                    </p>
                    <a
                        href="/auth"
                        className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all"
                    >
                        تسجيل الدخول
                    </a>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinnerSmall />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 px-4 bg-slate-50 dark:bg-slate-800/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                        <p className="text-slate-500 dark:text-slate-500 font-bold">لا توجد مراجعات لهذا الكورس حتى الآن.</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">كن أول من يشاركنا رأيه!</p>
                    </div>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev.id} className="p-5 bg-slate-50 dark:bg-[#0a0a0a] rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-indigo-100 dark:hover:border-indigo-900/20 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 relative">
                                    {rev.userAvatar ? (
                                        <Image src={rev.userAvatar} alt={rev.userName} width={44} height={44} className="object-cover rounded-xl ring-2 ring-white dark:ring-slate-800 shadow-md" />
                                    ) : (
                                        <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-md">
                                            <User className="w-6 h-6 text-slate-500" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-white">
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="font-black text-slate-900 dark:text-white truncate text-sm">{rev.userName}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
                                            {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-3.5 h-3.5 ${star <= rev.rating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-200 dark:text-slate-800'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">
                                        {rev.comment}
                                    </p>
                                </div>
                                {user && user.uid === rev.userId && (
                                    <button
                                        onClick={() => handleDelete(rev.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg group-hover:opacity-100 transition-opacity"
                                        title="حذف المراجعة"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseReviews;

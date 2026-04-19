import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminInitError } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { courseId, review } = body;

        if (!courseId || !review || !review.userId || !review.rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!adminDb) {
            console.error('❌ [API] Database not initialized. Checking env vars...');
            const envCheck = {
                HAS_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID || !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                HAS_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
                HAS_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
            };
            console.error('Env vars status:', envCheck);

            return NextResponse.json({
                error: 'Database not initialized',
                debug: envCheck,
                initError: adminInitError ? adminInitError.message : 'Unknown initialization error',
                message: 'Check server logs for environment variable status'
            }, { status: 500 });
        }

        // 1. Add Review to 'reviews' collection
        const reviewRef = await adminDb.collection('reviews').add({
            ...review,
            courseId,
            createdAt: new Date().toISOString()
        });

        // 2. Recalculate Average Rating & Count for the Course
        const reviewsSnapshot = await adminDb.collection('reviews').where('courseId', '==', courseId).get();

        let totalRating = 0;
        let count = 0;

        reviewsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.rating) {
                totalRating += data.rating;
                count++;
            }
        });

        const newAverage = count > 0 ? Number((totalRating / count).toFixed(1)) : 0;

        // 3. Update Course Document
        const courseRef = adminDb.collection('courses').doc(courseId);
        await courseRef.update({
            rating: newAverage,
            reviewsCount: count
        });

        console.log(`✅ [API] Review added for ${courseId}. New Rating: ${newAverage} (${count})`);

        return NextResponse.json({
            success: true,
            reviewId: reviewRef.id,
            newRating: newAverage,
            newReviewsCount: count
        });

    } catch (error: any) {
        console.error('❌ [API] Error submitting review:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}

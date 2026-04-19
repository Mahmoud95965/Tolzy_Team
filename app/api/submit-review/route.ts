import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Helper to set CORS headers
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { courseId, review } = body;

        if (!courseId || !review || !review.userId || !review.rating) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400, headers: corsHeaders() }
            );
        }

        if (!adminDb) {
            // Debugging: Check which env vars are missing
            const missingVars = [];
            if (!process.env.FIREBASE_PROJECT_ID) missingVars.push('FIREBASE_PROJECT_ID');
            if (!process.env.FIREBASE_CLIENT_EMAIL) missingVars.push('FIREBASE_CLIENT_EMAIL');
            if (!process.env.FIREBASE_PRIVATE_KEY) missingVars.push('FIREBASE_PRIVATE_KEY');

            return NextResponse.json(
                {
                    error: 'Database not initialized',
                    debug: {
                        missingVars,
                        hasAdminDb: !!adminDb
                    }
                },
                { status: 500, headers: corsHeaders() }
            );
        }

        // 1. Add Review to 'reviews' collection
        const reviewRef = await adminDb.collection('reviews').add({
            ...review,
            courseId,
            createdAt: new Date().toISOString()
        });

        // 2. Recalculate Average Rating & Count for the Course
        const reviewsSnapshot = await adminDb
            .collection('reviews')
            .where('courseId', '==', courseId)
            .get();

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
        }, { headers: corsHeaders() });

    } catch (error: any) {
        console.error('❌ [API] Error submitting review:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500, headers: corsHeaders() }
        );
    }
}

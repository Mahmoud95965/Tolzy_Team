import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminInitError } from '@/lib/firebase-admin';

// Helper to check if error is quota-related
function isQuotaError(error: any): boolean {
  const message = String(error?.message || error);
  return message.includes('quota') || 
         message.includes('egress') || 
         message.includes('exceed') ||
         message.includes('restricted');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ plan: 'free' }, { status: 200 });
    }

    if (!adminDb) {
      console.warn('[API /user/plan] Database not initialized, returning free plan');
      return NextResponse.json({ plan: 'free' }, { status: 200 });
    }

    try {
      // Fetch user plan from Firestore with timeout
      const userDocPromise = adminDb.collection('users').doc(uid).get();
      
      // Add 5 second timeout to avoid hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const userDoc = await Promise.race([userDocPromise, timeoutPromise]) as any;
      
      if (!userDoc?.exists) {
        return NextResponse.json({ plan: 'free' }, { status: 200 });
      }

      const userData = userDoc.data();
      const rawPlan = userData?.plan || 'free';
      
      // Normalize plan value
      const plan = String(rawPlan).toLowerCase();
      const normalizedPlan = plan.includes('ultra') ? 'ultra' : 
                             plan.includes('pro') ? 'pro' : 'free';

      return NextResponse.json({ plan: normalizedPlan }, { status: 200 });
      
    } catch (dbError: any) {
      // Check if it's a quota error
      if (isQuotaError(dbError)) {
        console.warn('[API /user/plan] Quota exceeded, returning free plan as fallback');
        return NextResponse.json({ plan: 'free', quotaExceeded: true }, { status: 200 });
      }
      
      // For any other DB error, also return free
      console.warn('[API /user/plan] DB error:', dbError?.message || dbError);
      return NextResponse.json({ plan: 'free' }, { status: 200 });
    }

  } catch (error) {
    // Final catch-all - never fail the auth flow
    console.error('[API /user/plan] Unexpected error:', error);
    return NextResponse.json({ plan: 'free' }, { status: 200 });
  }
}

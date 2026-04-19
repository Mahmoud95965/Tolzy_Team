import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/src/config/supabase-admin';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get('uid');
    if (!uid) {
      console.warn('⚠️ Plan API: Missing uid parameter');
      return NextResponse.json({ error: 'Missing uid', plan: 'free' }, { status: 400 });
    }

    console.log(`🔍 Fetching plan for user: ${uid}`);

    // Try Supabase first
    if (hasSupabaseAdminConfig) {
      try {
        const { data, error } = await supabaseAdmin
          .from('user_limits')
          .select('plan, user_id, updated_at')
          .eq('user_id', uid)
          .maybeSingle();

        if (error) {
          const errorMsg = error.message || '';
          // Check for quota exceeded - don't return free, try Firestore
          if (errorMsg.includes('exceed_cached_egress_quota') || errorMsg.includes('restricted')) {
            console.warn(`⚠️ Supabase quota exceeded for ${uid}, trying Firestore fallback`);
            // Continue to Firestore fallback
          } else if (errorMsg.includes('user_limits') || errorMsg.includes('not found')) {
            console.warn(`⚠️ Supabase table error for ${uid}: ${errorMsg}, trying Firestore`);
            // Continue to Firestore fallback
          } else {
            console.error(`❌ Supabase query error for ${uid}:`, errorMsg);
            // Continue to Firestore fallback
          }
        } else if (data) {
          // Supabase returned data - use it
          const rawPlan = String(data.plan || 'free').toLowerCase();
          const normalizedPlan = rawPlan.includes('pro')
            ? 'pro'
            : rawPlan.includes('plus')
              ? 'pro'
              : rawPlan.includes('ultra')
                ? 'ultra'
                : 'free';

          console.log(`✅ Plan from Supabase for ${uid}: "${normalizedPlan}"`);
          return NextResponse.json({ plan: normalizedPlan, source: 'supabase' }, { status: 200 });
        }
      } catch (supabaseError: any) {
        console.warn(`⚠️ Supabase error for ${uid}: ${supabaseError?.message}, trying Firestore`);
        // Continue to Firestore fallback
      }
    }

    // Fallback to Firestore
    if (adminDb) {
      try {
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const rawPlan = String(userData?.plan || 'free').toLowerCase();
          const normalizedPlan = rawPlan.includes('pro')
            ? 'pro'
            : rawPlan.includes('plus')
              ? 'pro'
              : rawPlan.includes('ultra')
                ? 'ultra'
                : 'free';

          console.log(`✅ Plan from Firestore for ${uid}: "${normalizedPlan}"`);
          return NextResponse.json({ plan: normalizedPlan, source: 'firebase' }, { status: 200 });
        }
      } catch (firestoreError: any) {
        console.error(`❌ Firestore error for ${uid}:`, firestoreError?.message);
      }
    }

    // No data found anywhere
    console.warn(`⚠️ No plan found for ${uid} in any database, returning free`);
    return NextResponse.json({ plan: 'free', warning: 'No plan record found' }, { status: 200 });
  } catch (error: any) {
    console.error(`❌ Unexpected error in plan API:`, error?.message);
    return NextResponse.json({ plan: 'free', error: error?.message || 'Unexpected error' }, { status: 200 });
  }
}

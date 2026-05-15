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

    let firestorePlan = 'free';
    let supabasePlan = 'free';

    // Fetch from both sources concurrently for speed
    const [firestoreTask, supabaseTask] = await Promise.allSettled([
      // Firestore task
      (async () => {
        if (!adminDb) return 'free';
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (userDoc.exists) {
          return String(userDoc.data()?.plan || 'free').toLowerCase();
        }
        return 'free';
      })(),

      // Supabase task
      (async () => {
        if (!hasSupabaseAdminConfig) return 'free';
        const { data, error } = await supabaseAdmin
          .from('user_limits')
          .select('plan')
          .eq('user_id', uid)
          .maybeSingle();
        if (!error && data) {
          return String(data.plan || 'free').toLowerCase();
        }
        return 'free';
      })()
    ]);

    if (firestoreTask.status === 'fulfilled') firestorePlan = firestoreTask.value;
    if (supabaseTask.status === 'fulfilled') supabasePlan = supabaseTask.value;

    const normalize = (rawPlan: string) => {
      if (rawPlan.includes('ultra')) return 'ultra';
      if (rawPlan.includes('pro') || rawPlan.includes('plus')) return 'pro';
      return 'free';
    };

    const normalizedFirestore = normalize(firestorePlan);
    const normalizedSupabase = normalize(supabasePlan);

    // Determine highest plan
    let finalPlan = 'free';
    let source = 'none';

    if (normalizedFirestore === 'ultra' || normalizedSupabase === 'ultra') {
      finalPlan = 'ultra';
      source = normalizedFirestore === 'ultra' ? 'firebase' : 'supabase';
    } else if (normalizedFirestore === 'pro' || normalizedSupabase === 'pro') {
      finalPlan = 'pro';
      source = normalizedFirestore === 'pro' ? 'firebase' : 'supabase';
    } else {
      source = (firestoreTask.status === 'fulfilled' && firestorePlan !== 'free') ? 'firebase' 
             : (supabaseTask.status === 'fulfilled' && supabasePlan !== 'free') ? 'supabase' : 'firebase';
    }

    console.log(`✅ Final plan for ${uid}: "${finalPlan}" (via ${source})`);
    return NextResponse.json({ plan: finalPlan, source }, { status: 200 });

  } catch (error: any) {
    console.error(`❌ Unexpected error in plan API:`, error?.message);
    return NextResponse.json({ plan: 'free', error: error?.message || 'Unexpected error' }, { status: 200 });
  }
}

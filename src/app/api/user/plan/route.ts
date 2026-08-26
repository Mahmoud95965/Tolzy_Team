import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/src/config/supabase-admin';
import { adminDb as configAdminDb } from '@/src/config/firebase-admin';
import { adminDb as libAdminDb } from '@/lib/firebase-admin';

export const maxDuration = 15;
export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'mahmoud.m.moussa5310@gmail.com';

function getActiveAdminDb() {
  return configAdminDb || libAdminDb || null;
}

function normalizePlanTier(raw: unknown): 'free' | 'pro' | 'max' | 'admin' {
  const p = String(raw || 'free').toLowerCase().trim();
  if (p.includes('admin')) return 'admin';
  if (p.includes('max') || p.includes('ultra') || p.includes('studio') || p.includes('tolzy_max') || p.includes('tolzy_ultra')) return 'max';
  if (p.includes('pro') || p.includes('plus') || p.includes('premium') || p.includes('tolzy_pro')) return 'pro';
  return 'free';
}

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get('uid')?.trim();
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid', plan: 'free', isPro: false, isMax: false }, { status: 400 });
    }

    const adminDb = getActiveAdminDb();
    let firestorePlan = 'free';
    let firestoreEmail = '';
    let firestoreRole = 'user';
    let supabasePlan = 'free';
    let supabaseProfilePlan = 'free';
    let supabaseRole = 'user';
    let isAdminDoc = false;

    // Fetch from all Firestore and Supabase tables concurrently
    const [firestoreUserTask, firestoreAdminTask, supabaseLimitsTask, supabaseProfileTask] = await Promise.allSettled([
      // 1. Firestore Users Collection
      (async () => {
        if (!adminDb) return null;
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const data = userDoc.data() || {};
          const planValue = data.plan || data.subscriptionPlan || data.subscription_plan || data.tier || (data.isMax ? 'max' : data.isPro ? 'pro' : 'free');
          return {
            plan: String(planValue || 'free'),
            email: String(data.email || '').toLowerCase().trim(),
            role: String(data.role || 'user').toLowerCase().trim(),
          };
        }
        return null;
      })(),

      // 2. Firestore Admins Collection
      (async () => {
        if (!adminDb) return false;
        try {
          const adminDoc = await adminDb.collection('admins').doc(uid).get();
          return adminDoc.exists;
        } catch {
          return false;
        }
      })(),

      // 3. Supabase user_limits Table
      (async () => {
        if (!hasSupabaseAdminConfig) return 'free';
        const { data, error } = await supabaseAdmin
          .from('user_limits')
          .select('plan')
          .eq('user_id', uid)
          .maybeSingle();
        if (!error && data?.plan) {
          return String(data.plan);
        }
        return 'free';
      })(),

      // 4. Supabase profiles Table
      (async () => {
        if (!hasSupabaseAdminConfig) return { plan: 'free', role: 'user' };
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('plan, role')
          .eq('id', uid)
          .maybeSingle();
        if (!error && data) {
          return {
            plan: String(data.plan || 'free'),
            role: String(data.role || 'user').toLowerCase().trim(),
          };
        }
        return { plan: 'free', role: 'user' };
      })(),
    ]);

    if (firestoreUserTask.status === 'fulfilled' && firestoreUserTask.value) {
      firestorePlan = firestoreUserTask.value.plan;
      firestoreEmail = firestoreUserTask.value.email;
      firestoreRole = firestoreUserTask.value.role;
    }

    if (firestoreAdminTask.status === 'fulfilled' && firestoreAdminTask.value) {
      isAdminDoc = true;
    }

    if (supabaseLimitsTask.status === 'fulfilled' && supabaseLimitsTask.value) {
      supabasePlan = supabaseLimitsTask.value;
    }

    if (supabaseProfileTask.status === 'fulfilled' && supabaseProfileTask.value) {
      supabaseProfilePlan = supabaseProfileTask.value.plan;
      supabaseRole = supabaseProfileTask.value.role;
    }

    // Check for Admin Override
    const isOwnerEmail = firestoreEmail === ADMIN_EMAIL;
    const hasAdminRole = firestoreRole === 'admin' || supabaseRole === 'admin' || isAdminDoc || isOwnerEmail;

    if (hasAdminRole) {
      return NextResponse.json({
        plan: 'admin',
        isPro: true,
        isMax: true,
        isAdmin: true,
        source: 'admin_role'
      }, { status: 200 });
    }

    const nFs = normalizePlanTier(firestorePlan);
    const nSbLimits = normalizePlanTier(supabasePlan);
    const nSbProfile = normalizePlanTier(supabaseProfilePlan);

    // Prioritize highest active tier: max > pro > free
    let finalPlan: 'free' | 'pro' | 'max' = 'free';
    let source = 'none';

    if (nFs === 'max' || nSbLimits === 'max' || nSbProfile === 'max') {
      finalPlan = 'max';
      source = nFs === 'max' ? 'firestore' : nSbLimits === 'max' ? 'supabase_limits' : 'supabase_profiles';
    } else if (nFs === 'pro' || nSbLimits === 'pro' || nSbProfile === 'pro') {
      finalPlan = 'pro';
      source = nFs === 'pro' ? 'firestore' : nSbLimits === 'pro' ? 'supabase_limits' : 'supabase_profiles';
    } else {
      source = 'default_free';
    }

    return NextResponse.json({
      plan: finalPlan,
      isPro: finalPlan === 'pro' || finalPlan === 'max',
      isMax: finalPlan === 'max',
      isAdmin: false,
      source
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error in /api/user/plan:', error);
    return NextResponse.json({
      plan: 'free',
      isPro: false,
      isMax: false,
      isAdmin: false,
      error: error?.message || 'Internal error'
    }, { status: 200 });
  }
}

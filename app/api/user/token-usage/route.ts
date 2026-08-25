import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/src/config/supabase-admin';
import { parsePlan, PLAN_CONFIGS } from '@/src/lib/ai-quota';

export const maxDuration = 15;

const ADMIN_EMAIL = 'mahmoud.m.moussa5310@gmail.com';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        let firestoreData: any = {};
        let supabaseData: any = null;

        // Fetch from Firestore and Supabase concurrently
        const [firestoreTask, supabaseTask] = await Promise.allSettled([
            (async () => {
                if (!adminDb) return {};
                const userSnap = await adminDb.collection('users').doc(userId).get();
                return userSnap.exists ? userSnap.data() : {};
            })(),
            (async () => {
                if (!hasSupabaseAdminConfig) return null;
                const { data } = await supabaseAdmin
                    .from('user_limits')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();
                return data;
            })()
        ]);

        if (firestoreTask.status === 'fulfilled') firestoreData = firestoreTask.value || {};
        if (supabaseTask.status === 'fulfilled') supabaseData = supabaseTask.value;

        const userEmail = String(firestoreData?.email || supabaseData?.email || '').toLowerCase();

        // Check if admin
        if (userEmail === ADMIN_EMAIL || firestoreData?.role === 'admin') {
            return NextResponse.json({
                plan: 'admin',
                planName: 'حساب الإدارة (Admin)',
                tokensUsed: Number(firestoreData?.tokensUsed || firestoreData?.aiTokensUsed || 0),
                tokenAllowance: 999_999_999,
                tokensRemaining: 999_999_999,
                percentageUsed: 0,
                isPro: true,
                isMax: true,
                features: PLAN_CONFIGS.admin.features
            });
        }

        // Determine plan with priority: MAX/Studio > Pro > Free
        const rawFsPlan = String(firestoreData?.plan || firestoreData?.subscriptionPlan || 'free').toLowerCase();
        const rawSbPlan = String(supabaseData?.plan || 'free').toLowerCase();

        let plan: 'free' | 'pro' | 'max' = 'free';
        if (rawFsPlan.includes('max') || rawFsPlan.includes('ultra') || rawFsPlan.includes('studio') || rawSbPlan.includes('max') || rawSbPlan.includes('ultra')) {
            plan = 'max';
        } else if (rawFsPlan.includes('pro') || rawFsPlan.includes('plus') || rawSbPlan.includes('pro')) {
            plan = 'pro';
        }

        const planConfig = PLAN_CONFIGS[plan] || PLAN_CONFIGS.free;

        // Accurate token counts
        const tokensUsed = Number(firestoreData?.tokensUsed || firestoreData?.aiTokensUsed || 0);
        const tokenAllowance = planConfig.tokenAllowance;
        const tokensRemaining = Math.max(0, tokenAllowance - tokensUsed);
        const percentageUsed = Math.min(100, Math.round((tokensUsed / tokenAllowance) * 100));

        return NextResponse.json({
            plan,
            planName: planConfig.name,
            tokensUsed,
            tokenAllowance,
            tokensRemaining,
            percentageUsed,
            isPro: plan === 'pro' || plan === 'max',
            isMax: plan === 'max',
            features: planConfig.features
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching token usage:', error);
        return NextResponse.json({
            plan: 'free',
            planName: 'الخطة المجانية — Free Plan',
            tokensUsed: 0,
            tokenAllowance: 10_000,
            tokensRemaining: 10_000,
            percentageUsed: 0,
            isPro: false,
            isMax: false
        }, { status: 200 });
    }
}

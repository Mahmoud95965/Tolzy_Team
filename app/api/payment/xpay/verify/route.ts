import { NextRequest, NextResponse } from 'next/server';
import { retrieveXPayCheckoutSession } from '@/src/config/xpay';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/src/config/supabase-admin';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const session = await retrieveXPayCheckoutSession(sessionId);

        // Check payment status or session status
        const isPaid = session.paymentStatus === 'paid' || session.status === 'complete' || (session.status === 'open' && sessionId.startsWith('cs_test_'));

        const userId = session.metadata?.userId;
        const targetPlan = session.metadata?.plan === 'max' ? 'max' : 'pro';
        const targetAllowance = targetPlan === 'max' ? 2_500_000 : 500_000;

        if (userId && isPaid) {
            // 1. Update Supabase user_limits
            if (hasSupabaseAdminConfig) {
                try {
                    await supabaseAdmin
                        .from('user_limits')
                        .upsert({
                            user_id: userId,
                            plan: targetPlan,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'user_id' });
                } catch (sbErr) {
                    console.error('Failed to update Supabase user_limits from XPay verify:', sbErr);
                }
            }

            // 2. Update Firestore users collection
            try {
                const { adminDb } = await import('@/src/config/firebase-admin');
                if (adminDb) {
                    await adminDb.collection('users').doc(userId).set({
                        plan: targetPlan,
                        subscriptionPlan: targetPlan,
                        tokensUsed: 0,
                        aiTokensUsed: 0,
                        tokenAllowance: targetAllowance,
                        paymentGateway: 'xpay',
                        lastPaymentSessionId: sessionId,
                        updatedAt: new Date(),
                    }, { merge: true });

                    // Log transaction
                    await adminDb.collection('payments').doc(sessionId).set({
                        sessionId,
                        userId,
                        userEmail: session.metadata?.userEmail || '',
                        plan: targetPlan,
                        amountTotal: session.amountTotal,
                        currency: session.currency,
                        gateway: 'xpay',
                        status: session.paymentStatus || session.status,
                        createdAt: new Date(),
                    }, { merge: true });
                }
            } catch (fsErr) {
                console.error('Failed to update Firestore from XPay verify:', fsErr);
            }
        }

        return NextResponse.json({
            success: true,
            isPaid,
            plan: targetPlan,
            allowance: targetAllowance,
            session,
        });
    } catch (error: any) {
        console.error('XPay verification error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to verify XPay payment' },
            { status: 500 }
        );
    }
}

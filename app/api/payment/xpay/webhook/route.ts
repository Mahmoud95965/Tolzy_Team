import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/src/config/supabase-admin';

export async function POST(req: NextRequest) {
    try {
        const event = await req.json();
        console.log('🔔 [XPay Webhook Event Received]:', event.type || event.event);

        const session = event.data?.object || event.data || event;
        const metadata = session.metadata || {};
        const userId = metadata.userId;
        const targetPlan = metadata.plan === 'max' ? 'max' : 'pro';
        const targetAllowance = targetPlan === 'max' ? 2_500_000 : 500_000;

        if (userId) {
            // 1. Update Supabase
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
                    console.error('Supabase webhook error:', sbErr);
                }
            }

            // 2. Update Firestore
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
                        updatedAt: new Date(),
                    }, { merge: true });

                    if (session.id) {
                        await adminDb.collection('payments').doc(session.id).set({
                            sessionId: session.id,
                            userId,
                            userEmail: metadata.userEmail || '',
                            plan: targetPlan,
                            amountTotal: session.amountTotal || session.amount,
                            currency: session.currency || 'EGP',
                            gateway: 'xpay',
                            status: 'paid',
                            createdAt: new Date(),
                        }, { merge: true });
                    }
                }
            } catch (fsErr) {
                console.error('Firestore webhook error:', fsErr);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('XPay Webhook processing error:', error);
        return NextResponse.json({ error: error?.message || 'Webhook failed' }, { status: 400 });
    }
}

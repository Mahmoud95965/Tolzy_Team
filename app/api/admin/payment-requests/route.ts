import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';
import { supabaseAdmin, hasSupabaseAdminConfig } from '@/src/config/supabase-admin';

const ADMIN_EMAIL = 'mahmoud.m.moussa5310@gmail.com';

const getAdminToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice('Bearer '.length).trim();
};

const ensureAdmin = async (request: NextRequest) => {
    const token = getAdminToken(request);
    if (!token) {
        return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    try {
        const decoded = await getAuth().verifyIdToken(token);
        const email = (decoded.email || '').toLowerCase();
        if (email !== ADMIN_EMAIL) {
            return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
        }
        return { ok: true as const };
    } catch (error: any) {
        return { ok: false as const, response: NextResponse.json({ error: error.message }, { status: 401 }) };
    }
};

export async function GET(request: NextRequest) {
    try {
        const authCheck = await ensureAdmin(request);
        if (!authCheck.ok) return authCheck.response;

        if (!adminDb) {
            return NextResponse.json({ requests: [] });
        }

        const snapshot = await adminDb.collection('payment_requests')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const requests = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
            };
        });

        return NextResponse.json({ requests }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch payment requests error:', error);
        return NextResponse.json({ requests: [], error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authCheck = await ensureAdmin(request);
        if (!authCheck.ok) return authCheck.response;

        const body = await request.json();
        const { requestId, userId, email, plan = 'pro', action = 'approve' } = body;

        if (!requestId) {
            return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
        }

        const normalizedPlan = String(plan).toLowerCase().includes('max') ? 'max' : 'pro';
        const targetAllowance = normalizedPlan === 'max' ? 2_500_000 : 500_000;

        if (action === 'approve') {
            // 1. Update request status in Firestore
            if (adminDb) {
                await adminDb.collection('payment_requests').doc(requestId).update({
                    status: 'approved',
                    approvedAt: new Date().toISOString(),
                });

                // Update user doc in Firestore
                if (userId) {
                    await adminDb.collection('users').doc(userId).set({
                        plan: normalizedPlan,
                        subscriptionPlan: normalizedPlan,
                        tokenAllowance: targetAllowance,
                        tokensUsed: 0,
                        aiTokensUsed: 0,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                }
            }

            // 2. Update Supabase
            if (hasSupabaseAdminConfig && (userId || email)) {
                await supabaseAdmin
                    .from('user_limits')
                    .upsert({
                        user_id: userId || '',
                        email: email || '',
                        plan: normalizedPlan,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });
            }

            return NextResponse.json({ 
                success: true, 
                message: `✅ تم تفعيل باقة ${normalizedPlan.toUpperCase()} للمستخدم بنجاح!` 
            }, { status: 200 });

        } else {
            // Reject request
            if (adminDb) {
                await adminDb.collection('payment_requests').doc(requestId).update({
                    status: 'rejected',
                    rejectedAt: new Date().toISOString(),
                });
            }

            return NextResponse.json({ 
                success: true, 
                message: '❌ تم رفض الطلب' 
            }, { status: 200 });
        }

    } catch (error: any) {
        console.error('Update payment request error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

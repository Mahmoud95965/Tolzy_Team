import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/src/config/supabase-admin';

// Helper to update user plan in BOTH Firestore and Supabase
async function updateUserPlan(email: string, plan: string) {
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    try {
        const userPool = await getAuth().getUserByEmail(email);
        if (!userPool) {
            console.error(`❌ User not found for email: ${email}`);
            return;
        }

        const uid = userPool.uid;
        console.log(`🔄 Updating plan for user ${email} (uid: ${uid}) to: ${plan}`);

        // 1. Update Firestore (fallback)
        try {
            await getFirestore().collection('users').doc(uid).set({
                plan,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log(`✅ Firestore updated for ${uid}`);
        } catch (e) {
            console.error(`⚠️ Failed to update Firestore for ${uid}:`, e);
        }

        // 2. Update Supabase user_limits (PRIMARY source)
        if (hasSupabaseAdminConfig) {
            try {
                const { error: supabaseError } = await supabaseAdmin
                    .from('user_limits')
                    .upsert({
                        user_id: uid,
                        plan,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (supabaseError) {
                    const errorMsg = supabaseError.message || '';
                    if (errorMsg.includes('user_limits') || errorMsg.includes('not found') || errorMsg.includes('already exists')) {
                        console.error(`❌ Supabase table error for ${uid}: ${errorMsg}`);
                        console.warn(`⚠️ Hint: Make sure 'user_limits' table exists. Run migration if needed.`);
                    } else {
                        console.error(`❌ Supabase error for ${uid}:`, errorMsg);
                    }
                } else {
                    console.log(`✅ Supabase user_limits updated for ${uid} to plan: ${plan}`);
                }
            } catch (e: any) {
                console.error(`❌ Failed to update Supabase for ${uid}:`, e?.message || String(e));
            }
        } else {
            console.warn('⚠️ Supabase admin config not available, skipping user_limits update');
        }

    } catch (e: any) {
        console.error(`❌ Error updating user plan for ${email}:`, e?.message || String(e));
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { obj } = data;
        
        console.log('💳 Payment callback received:', {
            success: obj?.success,
            email: obj?.order?.shipping_data?.email,
            amount: obj?.amount_cents
        });

        if (obj?.success === true) {
            const email = obj.order?.shipping_data?.email;
            const amountCents = obj.amount_cents;

            if (!email) {
                console.error('❌ No email in callback');
                return NextResponse.json({ received: true });
            }

            // Determine plan based on amount
            let plan = 'free';
            let isPromo = false;
            
            if (amountCents === 29900) plan = 'plus'; // 299 EGP
            if (amountCents === 49900) plan = 'pro';  // 499 EGP
            if (amountCents === 21900) {
                plan = 'pro';                          // 219 EGP MOFathy Promo
                isPromo = true;
            }

            console.log(`💰 Payment successful: ${email} → ${plan} (${amountCents} cents)${isPromo ? ' [PROMO]' : ''}`);

            if (plan !== 'free') {
                await updateUserPlan(email, plan);
                
                // Update promo counter if MOFathy promo was used
                if (isPromo && hasSupabaseAdminConfig) {
                    try {
                        const { data: promoData, error: fetchError } = await supabaseAdmin
                            .from('promotions')
                            .select('mofathy_promo_count')
                            .eq('id', 1)
                            .single();
                        
                        if (!fetchError && promoData) {
                            const newCount = (promoData.mofathy_promo_count || 0) + 1;
                            const { error: updateError } = await supabaseAdmin
                                .from('promotions')
                                .update({
                                    mofathy_promo_count: newCount,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', 1);
                            
                            if (updateError) {
                                console.error(`❌ Failed to update promo counter:`, updateError.message);
                            } else {
                                console.log(`✅ Promo counter updated: ${newCount}/10 seats sold`);
                            }
                        }
                    } catch (e: any) {
                        console.error(`⚠️ Error updating promotions table:`, e?.message);
                    }
                }
            }
        } else {
            console.warn('⚠️ Payment failed or not successful:', obj?.success);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('❌ Callback Error:', error?.message);
        return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Paymob sometimes redirects the user here after payment (Transaction Response)
    // This is NOT the webhook (processed in background), but the user facing page.

    const { searchParams } = new URL(req.url);
    const success = searchParams.get('success');

    if (success === 'true') {
        return NextResponse.redirect(new URL('/pricing?status=success', req.url));
    } else {
        return NextResponse.redirect(new URL('/pricing?status=failed', req.url));
    }
}

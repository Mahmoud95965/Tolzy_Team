import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/src/config/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, adminKey, plan = 'pro' } = body;
    const targetPlan = String(plan).toLowerCase().includes('max') ? 'max' : 'pro';
    const targetAllowance = targetPlan === 'max' ? 2_500_000 : 500_000;

    // Security check - simple admin key validation
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin-key-1234';
    if (adminKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: '❌ Unauthorized: Invalid admin key' },
        { status: 403 }
      );
    }

    if (!userId && !email) {
      return NextResponse.json(
        { error: '❌ Missing userId or email' },
        { status: 400 }
      );
    }

    if (!hasSupabaseAdminConfig) {
      return NextResponse.json(
        { error: '❌ Supabase admin config not available' },
        { status: 500 }
      );
    }

    // 1. Activate Plan for the user in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('user_limits')
      .upsert({
        user_id: userId || '',
        email: email || '',
        plan: targetPlan,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    // Sync with Firestore if possible
    try {
      const { adminDb } = await import('@/src/config/firebase-admin');
      if (adminDb && userId) {
        await adminDb.collection('users').doc(userId).set({
          plan: targetPlan,
          subscriptionPlan: targetPlan,
          tokensUsed: 0,
          aiTokensUsed: 0,
          tokenAllowance: targetAllowance,
          updatedAt: new Date()
        }, { merge: true });
      }
    } catch (fsErr) {
      console.warn('Firestore plan sync notice:', fsErr);
    }

    if (updateError) {
      console.error('❌ Failed to activate pro:', updateError);
      return NextResponse.json(
        { error: `Failed to activate: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 2. Decrease promo counter (increment mofathy_promo_count)
    const { data: currentPromo, error: fetchError } = await supabaseAdmin
      .from('promotions')
      .select('mofathy_promo_count')
      .eq('id', 1)
      .single();

    if (fetchError) {
      console.error('⚠️ Could not fetch promotions:', fetchError);
      // Continue anyway - user activation is done
    } else if (currentPromo) {
      const newCount = (currentPromo.mofathy_promo_count || 0) + 1;
      const { error: updatePromoError } = await supabaseAdmin
        .from('promotions')
        .update({
          mofathy_promo_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (updatePromoError) {
        console.error('⚠️ Could not update promo counter:', updatePromoError);
      } else {
        console.log(`✅ Promo counter updated: ${newCount}/10`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ ${targetPlan.toUpperCase()} account activated successfully!`,
      userId: userId || 'N/A',
      email: email || 'N/A',
      plan: targetPlan,
      tokenAllowance: targetAllowance,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}

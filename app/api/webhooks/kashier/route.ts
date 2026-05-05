import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/src/config/supabase-admin';

const KASHIER_SECRET_KEY = process.env.KASHIER_SECRET_KEY || '';

// Verify Kashier webhook signature
function verifyKashierSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return signature === expectedSignature;
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if Kashier is configured
    if (!KASHIER_SECRET_KEY) {
      console.error('❌ Kashier webhook: KASHIER_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Webhook misconfigured: KASHIER_SECRET_KEY missing' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-kashier-signature') || 
                      req.headers.get('kashier-signature') ||
                      req.headers.get('authorization');

    // Parse the payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('❌ Invalid JSON payload:', rawBody.substring(0, 200));
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Verify signature if provided (recommended for security)
    if (signature) {
      const isValid = verifyKashierSignature(rawBody, signature.replace('Bearer ', ''), KASHIER_SECRET_KEY);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Extract payment details from Kashier payload
    // Kashier webhook payload structure (may vary based on configuration)
    const {
      orderId,
      merchantOrderId,
      paymentStatus,
      customerEmail,
      customerReference,
      amount,
      currency,
      reference,
      metadata,
    } = payload;

    console.log('📩 Kashier Webhook Received:', {
      orderId,
      merchantOrderId,
      paymentStatus,
      customerEmail,
      customerReference,
      amount,
      currency,
    });

    // Only process successful payments
    if (paymentStatus !== 'SUCCESS' && paymentStatus !== 'CAPTURED' && paymentStatus !== 'PAID') {
      console.log(`⚠️ Payment not successful. Status: ${paymentStatus}. Skipping update.`);
      return NextResponse.json({ received: true, processed: false, reason: 'Payment not successful' }, { status: 200 });
    }

    // Extract userId from various possible sources
    let userId: string | null = null;
    
    // Try different sources for userId
    if (customerReference && !customerReference.startsWith('tolzy_')) {
      userId = customerReference;
    } else if (reference && !reference.startsWith('tolzy_')) {
      userId = reference;
    } else if (metadata?.userId) {
      userId = metadata.userId;
    } else if (metadata?.reference) {
      userId = metadata.reference;
    }

    // If still no userId, try to find by email
    if (!userId && customerEmail) {
      console.log('🔍 Looking up user by email:', customerEmail);
      const { data: matchedUser, error: matchError } = await supabaseAdmin
        .from('user_limits')
        .select('user_id')
        .eq('email', customerEmail)
        .maybeSingle();

      if (matchError) {
        console.error('❌ Failed to resolve user by email:', matchError.message);
      } else {
        userId = matchedUser?.user_id || null;
        console.log('✅ Found user by email:', userId);
      }
    }

    if (!userId) {
      console.error('❌ Webhook Error: No userId found in payload:', payload);
      // Return 200 to prevent Kashier from retrying
      return NextResponse.json({ error: 'No user ID attached to payment' }, { status: 200 });
    }

    // Determine which plan was purchased
    // Check metadata first, then fallback to amount-based logic
    let purchasedPlan = 'pro'; // default
    
    if (metadata?.plan) {
      purchasedPlan = metadata.plan;
    } else if (amount) {
      // Map amount to plan (adjust these values based on your pricing)
      const amountNum = parseFloat(amount);
      if (amountNum === 149) {
        purchasedPlan = 'basic';
      } else if (amountNum === 299) {
        purchasedPlan = 'pro';
      } else if (amountNum > 299) {
        purchasedPlan = 'ultra';
      }
    }

    console.log(`🎯 Processing upgrade for User ID: ${userId}, Plan: ${purchasedPlan}`);

    // Update Supabase user_limits table
    try {
      const { data, error } = await supabaseAdmin
        .from('user_limits')
        .upsert({
          user_id: userId,
          plan: purchasedPlan,
          email: customerEmail || null,
          updated_at: new Date().toISOString(),
          // Store payment reference for record keeping
          last_payment_reference: orderId || merchantOrderId || null,
          last_payment_amount: amount ? parseFloat(amount) : null,
          last_payment_date: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.error(`❌ Supabase update failed for user ${userId}:`, error.message);
        throw error;
      }

      console.log(`🎉 Successfully upgraded user ${userId} to plan: ${purchasedPlan}`);
      
      return NextResponse.json({
        received: true,
        processed: true,
        userId,
        plan: purchasedPlan,
      }, { status: 200 });

    } catch (dbError: any) {
      console.error('❌ Database update failed:', dbError);
      // Return 500 so Kashier will retry
      return NextResponse.json(
        { error: 'Database update failed', details: dbError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Kashier webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Also handle GET requests (for webhook verification during setup)
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Kashier webhook endpoint is active',
    timestamp: new Date().toISOString(),
  }, { status: 200 });
}

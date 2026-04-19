import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/src/config/supabase-admin';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeSecretKey || !webhookSecret) {
        console.error('Webhook: Missing Stripe configurations in environment.');
        return NextResponse.json({ error: 'Webhook misconfigured.' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16' as any,
    });

    // Next.js App Router Webhook Body Parsing (requires raw text for Stripe Signature checking)
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!signature) throw new Error('No signature found');
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error: any) {
        console.error(`❌ Webhook Signature Error: ${error.message}`);
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    // 3. Webhook processing core
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;
        const customerEmail =
            session.customer_details?.email ||
            session.customer_email ||
            metadata?.email ||
            null;

        // Extract user id with fallback to metadata in case client_reference_id is absent
        let userId = session.client_reference_id || metadata?.userId || null;
        if (!userId && customerEmail) {
            // Fallback for Stripe Payment Links: resolve user by known email in our DB
            const { data: matchedUser, error: matchError } = await supabaseAdmin
                .from('user_limits')
                .select('user_id')
                .eq('email', customerEmail)
                .maybeSingle();

            if (matchError) {
                console.error('❌ Webhook: Failed to resolve user by email:', matchError.message);
            } else {
                userId = matchedUser?.user_id || null;
            }
        }

        if (!userId) {
            console.error('❌ Webhook Error: No client_reference_id present in the session.');
            // Some setups charge without a user ID. We must return 200 so Stripe doesn't retry unnecessarily.
            return NextResponse.json({ error: 'No user ID attached to session' }, { status: 200 });
        }

        // Identify which plan was purchased. Let's use metadata or default to `pro`
        let purchasedPlan = metadata?.plan?.includes('ultra') ? 'ultra' : 'pro';
        console.log(`✅ Webhook: Received verified payment for User ID: ${userId}, Plan: ${purchasedPlan}`);

        try {
            // Update Supabase Database using Admin Client
            // Note: Since Tolzy uses `user_limits` with `user_id` column, we update that table specifically!
            const { data, error } = await supabaseAdmin
                .from('user_limits')
                .upsert({ 
                    user_id: userId,          // Make sure column matches your schema! (e.g. `id` vs `user_id`)
                    plan: purchasedPlan, 
                    email: customerEmail,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' }); 
            
            if (error) {
                console.error(`❌ Supabase Admin Update Error for user ${userId}:`, error.message);
                throw error;
            }

            console.log(`🎉 Supabase: Successfully upgraded user ${userId} to plan: ${purchasedPlan}`);
        } catch (dbError) {
            console.error('❌ Database processing failed during webhook:', dbError);
            // Return 500 so Stripe retries the webhook later if DB is down
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true }, { status: 200 });
}

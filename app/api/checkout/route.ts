import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    try {
        const { planId, userId, email } = await req.json();
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

        if (!planId || !userId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (!stripeSecretKey) {
            return NextResponse.json({ error: 'Stripe is not configured in backend.' }, { status: 500 });
        }

        const looksLikeRealStripeKey =
            /^sk_(test|live)_/.test(stripeSecretKey) && !stripeSecretKey.toLowerCase().includes('xxx');
        if (!looksLikeRealStripeKey) {
            return NextResponse.json(
                {
                    error:
                        'Stripe secret key is invalid. Please set a real STRIPE_SECRET_KEY in .env.local (not placeholder).',
                },
                { status: 500 }
            );
        }

        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16' as any, // Use standard stable version
        });

        if (planId !== 'tolzy_pro') {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010';
        const proProductId = process.env.STRIPE_PRO_PRODUCT_ID || 'prod_UIsjwFebXdCN9Z';

        // Stripe Checkout requires a PRICE id (price_xxx), so we resolve it from product id
        const proPrices = await stripe.prices.list({
            product: proProductId,
            active: true,
            limit: 1,
            type: 'recurring',
        });
        const priceId = proPrices.data[0]?.id;

        if (!priceId) {
            return NextResponse.json(
                { error: 'No active recurring price found for Tolzy Pro product.' },
                { status: 500 }
            );
        }

        // 1. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email || undefined,
            client_reference_id: userId, // CRITICAL: This links the payment to the user in our webhook
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription', // Change to 'payment' if this is a one-time product
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing`,
            metadata: {
                userId: userId,
                plan: planId,
                email: email || ''
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating Stripe checkout session:', error);
        if (error?.type === 'StripeAuthenticationError') {
            return NextResponse.json(
                { error: 'Stripe authentication failed. Check STRIPE_SECRET_KEY.' },
                { status: 500 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

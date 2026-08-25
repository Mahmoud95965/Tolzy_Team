import { NextRequest, NextResponse } from 'next/server';
import { createXPayCheckoutSession } from '@/src/config/xpay';

const PRO_ORIGINAL_PRICE = 650;
const PRO_PROMO_PRICE = 325; // 50% discount
const MAX_ORIGINAL_PRICE = 1950;
const MAX_PROMO_PRICE = 975; // 50% discount

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plan = 'pro', promoCode = '', userId, userEmail, redirectUrl } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Restrict XPay to allowed accounts during test phase
        const normalizedEmail = String(userEmail || '').toLowerCase().trim();
        const allowedTestEmails = [
            'm85260877@gmail.com',
            'mahmoud.m.moussa5310@gmail.com'
        ];

        if (!allowedTestEmails.includes(normalizedEmail)) {
            return NextResponse.json(
                { error: 'بوابة الدفع XPay قيد التجربة ومتاحة لحسابات الاختبار المعتمدة فقط حالياً.' },
                { status: 403 }
            );
        }

        const normalizedPlan = String(plan).toLowerCase() === 'max' ? 'max' : 'pro';
        const isPromoValid = String(promoCode).toUpperCase().trim() === 'TOLZY2030';

        let amountEgp = 0;
        let planTitle = '';

        if (normalizedPlan === 'max') {
            amountEgp = isPromoValid ? MAX_PROMO_PRICE : MAX_ORIGINAL_PRICE;
            planTitle = `TOLZY Studio (MAX Plan - 2,500,000 Tokens)${isPromoValid ? ' [خصم 50%]' : ''}`;
        } else {
            amountEgp = isPromoValid ? PRO_PROMO_PRICE : PRO_ORIGINAL_PRICE;
            planTitle = `TOLZY Pro Plan (500,000 Tokens)${isPromoValid ? ' [خصم 50%]' : ''}`;
        }

        // Host origin for return redirect
        const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/pricing.*$/, '') || 'https://tolzy.me';
        const finalRedirectUrl = redirectUrl || `${origin}/pricing?xpay=success&session_id={CHECKOUT_SESSION_ID}`;

        const session = await createXPayCheckoutSession({
            plan: normalizedPlan,
            planTitle,
            amountEgp,
            userId,
            userEmail: userEmail || '',
            promoCode: isPromoValid ? 'TOLZY2030' : undefined,
            redirectUrl: finalRedirectUrl,
        });

        return NextResponse.json({
            success: true,
            url: session.url,
            sessionId: session.id,
            clientSecret: session.clientSecret,
            amount: amountEgp,
            currency: 'EGP',
        });
    } catch (error: any) {
        console.error('XPay session creation error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to create XPay payment session' },
            { status: 500 }
        );
    }
}

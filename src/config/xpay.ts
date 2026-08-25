/**
 * XPay Payment Gateway Configuration & SDK Helpers
 * Support for Visa/Mastercard/Meeza, Fawry, and ValU BNPL payments
 */

export const XPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_XPAY_PUBLIC_KEY || 'pk_test_ybHe3EPoii35EkeT8eCPxR9FhejMjC';
export const XPAY_SECRET_KEY = process.env.XPAY_SECRET_KEY || 'sk_test_ton38CloOJ8NQpMf6nFsjfTAAjDlzqD';
export const XPAY_API_BASE = 'https://api.xpay.app';

export interface CreateXPaySessionParams {
    plan: 'pro' | 'max';
    planTitle: string;
    amountEgp: number;
    userId: string;
    userEmail: string;
    promoCode?: string;
    redirectUrl?: string;
}

export interface XPaySessionResponse {
    id: string;
    url: string;
    clientSecret?: string;
    status: string;
    paymentStatus: string;
    amountTotal: number;
    currency: string;
    metadata?: Record<string, string>;
}

/**
 * Creates a hosted checkout session on XPay
 */
export async function createXPayCheckoutSession(params: CreateXPaySessionParams): Promise<XPaySessionResponse> {
    const { plan, planTitle, amountEgp, userId, userEmail, promoCode, redirectUrl } = params;
    const unitAmountPiasters = Math.round(amountEgp * 100);

    const defaultRedirect = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tolzy.me'}/pricing?xpay=success&session_id={CHECKOUT_SESSION_ID}`;
    const afterCompletionUrl = redirectUrl || defaultRedirect;

    const payload = {
        uiMode: 'hosted',
        lineItems: [
            {
                priceData: {
                    unitAmount: unitAmountPiasters,
                    currency: 'EGP',
                    productData: {
                        name: planTitle || (plan === 'max' ? 'TOLZY Studio (MAX) - 2.5M Tokens' : 'TOLZY Pro - 500K Tokens'),
                        description: `اشتراك ${plan.toUpperCase()} في منصة تولزي للذكاء الاصطناعي`,
                    },
                },
                quantity: 1,
            },
        ],
        afterCompletion: {
            type: 'redirect',
            redirect: {
                url: afterCompletionUrl,
            },
        },
        metadata: {
            userId,
            userEmail: userEmail || '',
            plan,
            tokens: plan === 'max' ? '2500000' : '500000',
            promoCode: promoCode || '',
            amountEgp: String(amountEgp),
        },
    };

    const response = await fetch(`${XPAY_API_BASE}/checkout/sessions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${XPAY_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `XPay Error: HTTP ${response.status}`);
    }

    return await response.json();
}

/**
 * Retrieves a checkout session by ID from XPay
 */
export async function retrieveXPayCheckoutSession(sessionId: string): Promise<XPaySessionResponse> {
    const response = await fetch(`${XPAY_API_BASE}/checkout/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${XPAY_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Failed to retrieve XPay session: HTTP ${response.status}`);
    }

    return await response.json();
}

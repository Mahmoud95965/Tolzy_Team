import { NextRequest, NextResponse } from 'next/server';

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID_CARD = process.env.PAYMOB_INTEGRATION_ID_CARD;
const PAYMOB_INTEGRATION_ID_WALLET = process.env.PAYMOB_INTEGRATION_ID_WALLET;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

export async function POST(req: NextRequest) {
    try {
        const { amount, currency, paymentMethod, email, firstName, lastName, phoneNumber } = await req.json();

        // 1. Authentication Request
        const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: PAYMOB_API_KEY })
        });
        const authData = await authResponse.json();
        const token = authData.token;

        // 2. Order Registration API
        const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth_token: token,
                delivery_needed: "false",
                amount_cents: amount * 100, // Amount in cents
                currency: currency || "EGP",
                items: []
            })
        });
        const orderData = await orderResponse.json();
        const orderId = orderData.id;

        // 3. Payment Key Request
        const integrationId = paymentMethod === 'wallet' ? PAYMOB_INTEGRATION_ID_WALLET : PAYMOB_INTEGRATION_ID_CARD;

        const keyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth_token: token,
                amount_cents: amount * 100,
                expiration: 3600,
                order_id: orderId,
                billing_data: {
                    apartment: "NA",
                    email: email,
                    floor: "NA",
                    first_name: firstName,
                    street: "NA",
                    building: "NA",
                    phone_number: phoneNumber,
                    shipping_method: "NA",
                    postal_code: "NA",
                    city: "NA",
                    country: "EG",
                    last_name: lastName,
                    state: "NA"
                },
                currency: "EGP",
                integration_id: integrationId
            })
        });
        const keyData = await keyResponse.json();
        const paymentToken = keyData.token;

        // 4. Return URL/Iframe based on method
        if (paymentMethod === 'wallet') {
            // For Wallet, we need another step to get the redirect URL
            const walletResponse = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: {
                        identifier: phoneNumber, // Wallet number
                        subtype: "WALLET"
                    },
                    payment_token: paymentToken
                })
            });
            const walletData = await walletResponse.json();
            return NextResponse.json({
                redirect_url: walletData.redirect_url, // For Wallet (Vodafone Cash)
                type: 'wallet'
            });
        } else {
            // For Card, return Iframe URL
            return NextResponse.json({
                iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`,
                type: 'card'
            });
        }

    } catch (error: any) {
        console.error('Paymob Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

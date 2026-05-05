import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const KASHIER_API_KEY = process.env.KASHIER_API_KEY;
const KASHIER_SECRET_KEY = process.env.KASHIER_SECRET_KEY;
const KASHIER_MODE = process.env.KASHIER_MODE || 'test';

// Generate Kashier HMAC signature
function generateSignature(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId, customerEmail, customerReference } = await req.json();

    if (!KASHIER_API_KEY || !KASHIER_SECRET_KEY) {
      console.error('❌ Kashier environment variables not configured');
      return NextResponse.json(
        { error: 'Kashier payment not configured. Please set KASHIER_API_KEY and KASHIER_SECRET_KEY' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!amount || !orderId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, customerEmail' },
        { status: 400 }
      );
    }

    // Build Kashier checkout URL with signature
    // Kashier uses query params with HMAC signature for security
    const baseUrl = 'https://checkout.kashier.io';
    const merchantId = KASHIER_API_KEY; // Usually the API key is the merchant ID
    
    // Map internal plan IDs to Kashier product IDs
    const productIds: Record<string, string> = {
      'basic': 'mm5310493pro', // 149 EGP plan
      'pro': 'mm5310493pro',   // 299 EGP plan (update if different)
    };
    
    const planId = amount === 149 ? 'basic' : amount === 299 ? 'pro' : 'custom';
    const productId = productIds[planId];
    
    // Required parameters for Kashier
    const params: Record<string, string> = {
      merchantId: merchantId,
      orderId: orderId,
      amount: amount.toString(),
      currency: 'EGP',
      mode: KASHIER_MODE, // 'test' or 'live'
      merchantRedirect: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/callback`,
      failureRedirect: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/failed`,
      customerEmail: customerEmail,
      customerReference: customerReference || orderId,
      metadata: JSON.stringify({
        source: 'tolzy_pricing_page',
        plan: planId,
      }),
    };
    
    // Add product ID if available (for predefined Kashier products)
    if (productId) {
      params.productId = productId;
    }

    // Build query string (must be sorted alphabetically for signature)
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys.map(key => `${key}=${encodeURIComponent((params as any)[key])}`).join('&');
    
    // Generate signature
    const signature = generateSignature(queryString, KASHIER_SECRET_KEY);
    
    // Build final checkout URL
    const sessionUrl = `${baseUrl}?${queryString}&signature=${signature}`;

    console.log('✅ Kashier session created:', { orderId, amount, mode: KASHIER_MODE });

    // Return the checkout URL
    return NextResponse.json({
      sessionUrl: sessionUrl,
      orderId: orderId,
      mode: KASHIER_MODE,
    });

  } catch (error: any) {
    console.error('❌ Kashier Session Creation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Kashier payment session' },
      { status: 500 }
    );
  }
}

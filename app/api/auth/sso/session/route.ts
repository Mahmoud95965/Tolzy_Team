import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/config/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
        }

        if (!adminAuth) {
            return NextResponse.json({ error: 'Firebase Admin not initialized on server' }, { status: 500 });
        }

        // Verify the ID token first
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken || !decodedToken.uid) {
            return NextResponse.json({ error: 'Invalid ID Token' }, { status: 401 });
        }

        // 14 days session cookie
        const expiresIn = 14 * 24 * 60 * 60 * 1000;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const isProd = process.env.NODE_ENV === 'production';
        const hostname = req.headers.get('host') || '';
        const isTolzyDomain = hostname.includes('tolzy.me');

        const response = NextResponse.json({
            success: true,
            uid: decodedToken.uid,
            email: decodedToken.email,
        });

        // Set cookie on shared domain .tolzy.me in production
        response.cookies.set('tolzy_session', sessionCookie, {
            maxAge: 14 * 24 * 60 * 60,
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            ...(isProd && isTolzyDomain ? { domain: '.tolzy.me' } : {}),
        });

        // Non-httpOnly flag to allow instant client-side presence check
        response.cookies.set('tolzy_logged_in', 'true', {
            maxAge: 14 * 24 * 60 * 60,
            httpOnly: false,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            ...(isProd && isTolzyDomain ? { domain: '.tolzy.me' } : {}),
        });

        return response;
    } catch (error: any) {
        console.error('❌ SSO Session Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to create session' },
            { status: 500 }
        );
    }
}

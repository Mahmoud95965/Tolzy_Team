import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/config/firebase-admin';

export async function GET(req: NextRequest) {
    try {
        const sessionCookie = req.cookies.get('tolzy_session')?.value;

        if (!sessionCookie) {
            return NextResponse.json({ authenticated: false, reason: 'No session cookie' }, { status: 200 });
        }

        if (!adminAuth) {
            return NextResponse.json({ authenticated: false, error: 'Admin SDK unavailable' }, { status: 500 });
        }

        // Verify session cookie and check revocation
        let decodedClaims;
        try {
            decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        } catch (verifyErr) {
            // Cookie invalid or revoked -> clear cookie
            const isProd = process.env.NODE_ENV === 'production';
            const hostname = req.headers.get('host') || '';
            const isTolzyDomain = hostname.includes('tolzy.me');

            const response = NextResponse.json({ authenticated: false, reason: 'Session expired or revoked' }, { status: 200 });
            response.cookies.set('tolzy_session', '', {
                maxAge: 0,
                path: '/',
                ...(isProd && isTolzyDomain ? { domain: '.tolzy.me' } : {}),
            });
            response.cookies.set('tolzy_logged_in', '', {
                maxAge: 0,
                path: '/',
                ...(isProd && isTolzyDomain ? { domain: '.tolzy.me' } : {}),
            });
            return response;
        }

        // Mint custom token for seamless client sign-in
        const customToken = await adminAuth.createCustomToken(decodedClaims.uid);

        return NextResponse.json({
            authenticated: true,
            customToken,
            user: {
                uid: decodedClaims.uid,
                email: decodedClaims.email || '',
            },
        });
    } catch (error: any) {
        console.error('❌ SSO Token Error:', error);
        return NextResponse.json({ authenticated: false, error: error?.message }, { status: 500 });
    }
}

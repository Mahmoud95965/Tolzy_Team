import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/config/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const sessionCookie = req.cookies.get('tolzy_session')?.value;

        if (sessionCookie && adminAuth) {
            try {
                const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
                if (decodedClaims?.sub) {
                    // Revoke all refresh tokens for this user
                    await adminAuth.revokeRefreshTokens(decodedClaims.sub);
                }
            } catch (e) {
                // Ignore decoding errors during logout
            }
        }

        const isProd = process.env.NODE_ENV === 'production';
        const hostname = req.headers.get('host') || '';
        const isTolzyDomain = hostname.includes('tolzy.me');

        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

        // Clear session cookies across .tolzy.me
        response.cookies.set('tolzy_session', '', {
            maxAge: 0,
            path: '/',
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            ...(isProd && isTolzyDomain ? { domain: '.tolzy.me' } : {}),
        });

        response.cookies.set('tolzy_logged_in', '', {
            maxAge: 0,
            path: '/',
            httpOnly: false,
            secure: isProd,
            sameSite: 'lax',
            ...(isProd && isTolzyDomain ? { domain: '.tolzy.me' } : {}),
        });

        return response;
    } catch (error: any) {
        console.error('❌ SSO Logout Error:', error);
        return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
    }
}

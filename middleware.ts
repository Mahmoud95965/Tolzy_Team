import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // 1. Admin Protection
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
        if (url.pathname.startsWith('/api/admin')) {
            return NextResponse.next();
        }

        const adminSession = request.cookies.get('tolzy_admin_session');
        if (!adminSession || adminSession.value !== 'mahmoud_secure_session') {
            return NextResponse.redirect(new URL('/404', request.url));
        }
    }

    // 2. Subdomain Detection and Rewrites
    const isApiOrAsset = url.pathname.startsWith('/api') || 
                         url.pathname.startsWith('/_next') || 
                         url.pathname.startsWith('/static') ||
                         url.pathname.includes('.');

    if (!isApiOrAsset) {
        const hostLower = hostname.toLowerCase();

        // 2a. omnilearn.tolzy.me or omnilearn.localhost
        if (hostLower.startsWith('omnilearn.') || hostLower === 'omnilearn.tolzy.me') {
            if (url.pathname.startsWith('/learn/omnilearn')) {
                return NextResponse.rewrite(url);
            }
            url.pathname = `/learn/omnilearn${url.pathname === '/' ? '' : url.pathname}`;
            return NextResponse.rewrite(url);
        }

        // 2b. tools.tolzy.me or tools.localhost
        if (hostLower.startsWith('tools.') || hostLower === 'tools.tolzy.me') {
            if (url.pathname.startsWith('/tools')) {
                return NextResponse.rewrite(url);
            }
            url.pathname = `/tools${url.pathname === '/' ? '' : url.pathname}`;
            return NextResponse.rewrite(url);
        }

        // 2c. learn.tolzy.me or learn.localhost
        if (hostLower.startsWith('learn.') || hostLower.startsWith('courses.') || hostLower === 'learn.tolzy.me') {
            if (url.pathname.startsWith('/learn')) {
                return NextResponse.rewrite(url);
            }
            url.pathname = `/learn${url.pathname === '/' ? '' : url.pathname}`;
            return NextResponse.rewrite(url);
        }

        // 2d. build.tolzy.me or build.localhost
        if (hostLower.startsWith('build.') || hostLower === 'build.tolzy.me') {
            if (url.pathname.startsWith('/build')) {
                return NextResponse.rewrite(url);
            }
            url.pathname = `/build${url.pathname === '/' ? '' : url.pathname}`;
            return NextResponse.rewrite(url);
        }

        // 2e. flow.tolzy.me or flow.localhost or axiom.tolzy.me
        if (hostLower.startsWith('flow.') || hostLower.startsWith('axiom.') || hostLower === 'flow.tolzy.me') {
            if (url.pathname.startsWith('/axiom')) {
                return NextResponse.rewrite(url);
            }
            url.pathname = `/axiom${url.pathname === '/' ? '' : url.pathname}`;
            return NextResponse.rewrite(url);
        }

        // 2f. community.tolzy.me or community.localhost
        if (hostLower.startsWith('community.') || hostLower === 'community.tolzy.me') {
            if (url.pathname.startsWith('/community')) {
                return NextResponse.rewrite(url);
            }
            url.pathname = `/community${url.pathname === '/' ? '' : url.pathname}`;
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?:[^/]+/)*[^/.]*)', '/admin/:path*', '/api/admin/:path*'],
};

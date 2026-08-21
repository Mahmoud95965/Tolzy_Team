import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    const hostLower = hostname.toLowerCase();

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

    // 2. Pass static assets and API routes directly
    const isStaticOrApi = 
        url.pathname.startsWith('/api') || 
        url.pathname.startsWith('/_next') || 
        url.pathname.startsWith('/static') ||
        url.pathname.includes('.');

    if (isStaticOrApi) {
        return NextResponse.next();
    }

    // Check if current host is a subdomain
    const isSubdomain = 
        hostLower.includes('.') && 
        !hostLower.startsWith('www.') && 
        hostLower !== 'tolzy.me' && 
        hostLower !== 'localhost:3000';

    // 3. Centralized Auth Redirection from subdomains
    if (isSubdomain && (url.pathname === '/auth' || url.pathname.startsWith('/auth/'))) {
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const returnUrl = encodeURIComponent(`${protocol}://${hostname}/`);
        
        if (hostLower.includes('tolzy.me')) {
            return NextResponse.redirect(new URL(`https://tolzy.me/auth?redirect=${returnUrl}`, request.url));
        }
        return NextResponse.redirect(new URL(`/auth?redirect=${returnUrl}`, request.url));
    }

    // 4. Subdomain Rewrites
    // 4a. omnilearn.tolzy.me or omnilearn.localhost
    if (hostLower.startsWith('omnilearn.') || hostLower === 'omnilearn.tolzy.me') {
        if (url.pathname.startsWith('/learn/omnilearn')) {
            return NextResponse.rewrite(url);
        }
        url.pathname = `/learn/omnilearn${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // 4b. tools.tolzy.me or tools.localhost
    if (hostLower.startsWith('tools.') || hostLower === 'tools.tolzy.me') {
        if (url.pathname.startsWith('/tools')) {
            return NextResponse.rewrite(url);
        }
        url.pathname = `/tools${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // 4c. learn.tolzy.me or courses.tolzy.me or learn.localhost
    if (hostLower.startsWith('learn.') || hostLower.startsWith('courses.') || hostLower === 'learn.tolzy.me') {
        if (url.pathname.startsWith('/learn')) {
            return NextResponse.rewrite(url);
        }
        url.pathname = `/learn${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // 4d. build.tolzy.me or build.localhost
    if (hostLower.startsWith('build.') || hostLower === 'build.tolzy.me') {
        if (url.pathname.startsWith('/build')) {
            return NextResponse.rewrite(url);
        }
        url.pathname = `/build${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // 4e. flow.tolzy.me or axiom.tolzy.me or flow.localhost
    if (hostLower.startsWith('flow.') || hostLower.startsWith('axiom.') || hostLower === 'flow.tolzy.me') {
        if (url.pathname.startsWith('/axiom')) {
            return NextResponse.rewrite(url);
        }
        url.pathname = `/axiom${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // 4f. community.tolzy.me or community.localhost
    if (hostLower.startsWith('community.') || hostLower === 'community.tolzy.me') {
        if (url.pathname.startsWith('/community')) {
            return NextResponse.rewrite(url);
        }
        url.pathname = `/community${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // 4g. copilot.tolzy.me or copilot.localhost
    if (hostLower.startsWith('copilot.') || hostLower === 'copilot.tolzy.me') {
        if (url.pathname.startsWith('/copilot')) {
            return NextResponse.rewrite(url);
        }
        url.pathname = `/copilot${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
        '/admin/:path*',
        '/api/admin/:path*'
    ],
};

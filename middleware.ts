import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;
    try {
        const parsed = new URL(origin);
        const host = parsed.hostname.toLowerCase();
        return (
            host === 'tolzy.me' ||
            host.endsWith('.tolzy.me') ||
            host === 'localhost' ||
            host.endsWith('.localhost')
        );
    } catch {
        return false;
    }
}

function applyCorsHeaders(headers: Headers, origin: string | null, isAllowed: boolean) {
    if (isAllowed && origin) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Credentials', 'true');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, Accept, X-Requested-With');
        headers.set('Access-Control-Max-Age', '86400');
    }
}

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    const hostLower = hostname.toLowerCase();
    const origin = request.headers.get('origin');
    const originAllowed = isOriginAllowed(origin);

    // 0. Handle Preflight OPTIONS requests immediately (NEVER redirect an OPTIONS request)
    if (request.method === 'OPTIONS') {
        const preflightHeaders = new Headers();
        applyCorsHeaders(preflightHeaders, origin, originAllowed);
        return new NextResponse(null, {
            status: 204,
            headers: preflightHeaders,
        });
    }

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
        hostLower !== 'localhost:3000' &&
        hostLower !== 'localhost';

    // 3. Centralized Auth Redirection from subdomains
    if (isSubdomain && (url.pathname === '/auth' || url.pathname.startsWith('/auth/'))) {
        const protocol = request.headers.get('x-forwarded-proto') || (hostLower.includes('localhost') ? 'http' : 'https');
        const existingRedirect = url.searchParams.get('redirect') || url.searchParams.get('from');
        const returnUrl = encodeURIComponent(existingRedirect || `${protocol}://${hostname}/`);
        
        const loginUrl = hostLower.includes('tolzy.me')
            ? `https://tolzy.me/auth?redirect=${returnUrl}`
            : `/auth?redirect=${returnUrl}`;

        // Check if this request is a Next.js RSC fetch / prefetch / client-side transition
        const isRscRequest = 
            request.headers.get('accept')?.includes('text/x-component') ||
            url.searchParams.has('_rsc') ||
            request.headers.get('rsc') === '1' ||
            request.headers.get('next-router-prefetch') === '1';

        if (isRscRequest) {
            // NEVER return a cross-origin redirect (307/308) to RSC requests.
            // Returning 401 with X-Redirect-To and CORS headers avoids browser CORS errors,
            // stops background RSC prefetch safely, and triggers a full document navigation on click.
            const rscHeaders = new Headers({
                'Content-Type': 'text/plain',
                'X-Redirect-To': loginUrl,
            });
            applyCorsHeaders(rscHeaders, origin, originAllowed);
            return new NextResponse(null, {
                status: 401,
                headers: rscHeaders,
            });
        }

        // Full Page Document Load: Browser natively follows redirect without CORS constraints
        return NextResponse.redirect(new URL(loginUrl, request.url));
    }

    // If on main domain tolzy.me and accessing /auth, ensure CORS headers are attached for subdomains
    if (!isSubdomain && (url.pathname === '/auth' || url.pathname.startsWith('/auth/'))) {
        const response = NextResponse.next();
        if (originAllowed && origin) {
            applyCorsHeaders(response.headers, origin, originAllowed);
        }
        return response;
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

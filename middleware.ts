import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // 1. مسار لوحة التحكم Admin protection
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
        if (url.pathname.startsWith('/api/admin')) {
            return NextResponse.next();
        }

        const adminSession = request.cookies.get('tolzy_admin_session');
        if (!adminSession || adminSession.value !== 'mahmoud_secure_session') {
            return NextResponse.redirect(new URL('/404', request.url));
        }
    }

    // 2. معالجة الدومينات الفرعية Subdomain Rewrites
    // إستثناء ملفات النظام والـ API
    const isApiOrAsset = url.pathname.startsWith('/api') || 
                         url.pathname.startsWith('/_next') || 
                         url.pathname.startsWith('/static') ||
                         url.pathname.includes('.');

    if (!isApiOrAsset) {
        const hostLower = hostname.toLowerCase();

        // tools.tolzy.me or tools.localhost -> rewrite to /tools
        if (hostLower.startsWith('tools.') || hostLower === 'tools.tolzy.me') {
            if (!url.pathname.startsWith('/tools')) {
                url.pathname = `/tools${url.pathname === '/' ? '' : url.pathname}`;
                return NextResponse.rewrite(url);
            }
        }

        // learn.tolzy.me or learn.localhost -> rewrite to /learn
        if (hostLower.startsWith('learn.') || hostLower.startsWith('courses.') || hostLower === 'learn.tolzy.me') {
            if (!url.pathname.startsWith('/learn')) {
                url.pathname = `/learn${url.pathname === '/' ? '' : url.pathname}`;
                return NextResponse.rewrite(url);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?:[^/]+/)*[^/.]*)', '/admin/:path*', '/api/admin/:path*'],
};


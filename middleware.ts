import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. مسار لوحة التحكم
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
        // السماح بطلبات الـ API بالمرور لتفادي إرجاع صفحة 404 (HTML) كاستجابة JSON
        if (request.nextUrl.pathname.startsWith('/api/admin')) {
            return NextResponse.next();
        }

        // التحقق من وجود كوكي الجلسة الخاصة بالمسؤول
        // ملاحظة: بما أننا نستخدم Firebase Client SDK، التوكن الفعلي موجود في LocalStorage وليس الكوكي تلقائياً.
        // لكننا في AuthContext سنقوم بتعيين كوكي خاص عند تسجيل دخول المسؤول لغرض هذا الـ Middleware.
        const adminSession = request.cookies.get('tolzy_admin_session');

        if (!adminSession || adminSession.value !== 'mahmoud_secure_session') {
            // إذا لم يوجد الكوكي أو قيمته غير صحيحة، توجيه لصفحة 404
            // أو الصفحة الرئيسية لتمويه وجود لوحة التحكم
            return NextResponse.redirect(new URL('/404', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};

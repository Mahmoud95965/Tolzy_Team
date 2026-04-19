import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/config/firebase-admin';
import { formatApiError } from '@/src/utils/authErrorHandler';

export async function POST(req: NextRequest) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
        }
        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }

        if (!adminAuth || !adminDb) {
            return NextResponse.json({ error: 'مشكلة في إعدادات الخادم (Admin SDK)' }, { status: 500 });
        }

        const docRef = adminDb.collection('password_resets').doc(email);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ 
                error: 'لا يوجد طلب إعادة تعيين حديث أو الرمز غير صحيح',
                code: 'EMAIL_NOT_FOUND'
            }, { status: 400 });
        }

        const data = docSnap.data() as { otp: string, expiresAt: string, uid: string };

        // 1. Verify Expiration
        if (new Date() > new Date(data.expiresAt)) {
            await docRef.delete();
            return NextResponse.json({ 
                error: 'رمز التحقق منتهي الصلاحية، يرجى طلب رمز جديد',
                code: 'OTP_EXPIRED'
            }, { status: 400 });
        }

        // 2. Verify OTP Match
        if (data.otp !== otp) {
            return NextResponse.json({ 
                error: 'الرمز غير صحيح، حاول مرة أخرى',
                code: 'INVALID_OTP'
            }, { status: 400 });
        }

        // 3. Update password in Firebase Auth using the uid from doc
        await adminAuth.updateUser(data.uid, {
            password: newPassword
        });

        // 4. Clean up the OTP doc
        await docRef.delete();

        return NextResponse.json({ success: true, message: 'تم تحديث كلمة المرور بنجاح' });

    } catch (error: any) {
        console.error('❌ Update Password Error:', {
            code: error?.code,
            message: error?.message,
            timestamp: new Date().toISOString(),
        });
        return NextResponse.json(
            formatApiError(error),
            { status: 500 }
        );
    }
}

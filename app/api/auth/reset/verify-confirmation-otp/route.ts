import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/config/firebase-admin';
import { formatApiError } from '@/src/utils/authErrorHandler';

export async function POST(req: NextRequest) {
    try {
        const { email, confirmationOtp } = await req.json();

        if (!email || !confirmationOtp) {
            return NextResponse.json({ error: 'البريد الإلكتروني والرمز مطلوبان' }, { status: 400 });
        }

        if (!adminAuth || !adminDb) {
            return NextResponse.json({ error: 'مشكلة في إعدادات الخادم (Admin SDK)' }, { status: 500 });
        }

        const confirmDocRef = adminDb.collection('password_resets_confirmation').doc(email);
        const confirmDocSnap = await confirmDocRef.get();

        if (!confirmDocSnap.exists) {
            return NextResponse.json({ error: 'الرمز غير صحيح أو منتهي الصلاحية' }, { status: 400 });
        }

        const confirmData = confirmDocSnap.data() as { confirmationOtp: string, expiresAt: string, newPassword: string };

        // 1. Verify Expiration
        if (new Date() > new Date(confirmData.expiresAt)) {
            await confirmDocRef.delete();
            return NextResponse.json({ 
                error: 'رمز التأكيد منتهي الصلاحية، يرجى محاولة استعادة كلمة المرور مرة أخرى',
                code: 'OTP_EXPIRED'
            }, { status: 400 });
        }

        // 2. Verify OTP Match
        if (confirmData.confirmationOtp !== confirmationOtp) {
            return NextResponse.json({ 
                error: 'الرمز غير صحيح، حاول مرة أخرى',
                code: 'INVALID_OTP'
            }, { status: 400 });
        }

        // 3. Get user record from password_resets collection
        const resetDocRef = adminDb.collection('password_resets').doc(email);
        const resetDocSnap = await resetDocRef.get();

        if (!resetDocSnap.exists) {
            await confirmDocRef.delete();
            return NextResponse.json({ error: 'لا يوجد طلب إعادة تعيين حديث' }, { status: 400 });
        }

        const resetData = resetDocSnap.data() as { uid: string };

        // 4. Update password in Firebase Auth
        await adminAuth.updateUser(resetData.uid, {
            password: confirmData.newPassword
        });

        // 5. Clean up both collections
        await confirmDocRef.delete();
        await resetDocRef.delete();

        return NextResponse.json({ 
            success: true, 
            message: 'تم تحديث كلمة المرور بنجاح! يمكنك الدخول الآن.'
        });

    } catch (error: any) {
        console.error('❌ Verify Confirmation OTP Error:', {
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

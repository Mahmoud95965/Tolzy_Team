import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { formatApiError } from '@/src/utils/authErrorHandler';

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'البريد الإلكتروني والرمز مطلوبان' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'مشكلة في إعدادات الخادم (Admin SDK)' }, { status: 500 });
        }

        const docRef = adminDb.collection('email_verifications').doc(email);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'الرمز غير صحيح أو منتهي الصلاحية' }, { status: 400 });
        }

        const data = docSnap.data() as { otp: string, expiresAt: string };

        // 1. Verify Expiration
        if (new Date() > new Date(data.expiresAt)) {
            await docRef.delete();
            return NextResponse.json({ 
                error: 'رمز التحقق منتهي الصلاحية، يرجى محاولة الاشتراك مرة أخرى',
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

        // OTP is correct! Update verified status
        await docRef.update({ verified: true });

        return NextResponse.json({ 
            success: true, 
            message: 'تم التحقق من البريد بنجاح'
        });

    } catch (error: any) {
        console.error('❌ Verify Email OTP Error:', {
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

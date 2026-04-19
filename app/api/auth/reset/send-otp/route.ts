import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/config/firebase-admin';
import { formatApiError } from '@/src/utils/authErrorHandler';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
        }

        if (!adminAuth || !adminDb) {
            return NextResponse.json({ error: 'مشكلة في إعدادات الخادم (Admin SDK)' }, { status: 500 });
        }

        // 1. Verify user exists in Firebase Auth
        let userRecord;
        try {
            userRecord = await adminAuth.getUserByEmail(email);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                return NextResponse.json({ 
                    error: 'لا يوجد حساب بهذا البريد الإلكتروني',
                    code: 'USER_NOT_FOUND'
                }, { status: 404 });
            }
            throw error;
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        // 3. Save OTP to Firestore `password_resets` collection using email as Doc ID
        await adminDb.collection('password_resets').doc(email).set({
            otp,
            uid: userRecord.uid,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString()
        });

        // 4. Send Email via Brevo
        const brevoApiKey = process.env.BREVO_API_KEY;
        if (!brevoApiKey) {
            return NextResponse.json({ error: 'مفتاح BREVO_API_KEY غير متوفر في الخادم' }, { status: 500 });
        }

        const senderEmail = process.env.EMAIL_USER || 'newstolzy.ai@gmail.com';
        const emailData = {
            sender: { email: senderEmail, name: 'Tolzy Support' },
            to: [{ email: email }],
            subject: 'رمز تحقق إعادة تعيين كلمة المرور - Tolzy',
            htmlContent: `
                <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; background-color: #f9f9f9; padding: 20px;">
                    <div style="max-w: 500px; margin: auto; background: white; padding: 30px; border-radius: 15px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #4f46e5; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h2>
                        <p style="color: #333; font-size: 16px;">لقد طلبنا استعادة كلمة المرور الخاصة بك. يرجى استخدام رمز التحقق التالي:</p>
                        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 10px; margin: 20px 0;">
                            <h1 style="margin: 0; color: #1e293b; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">هذا الرمز صالح لمدة 15 دقيقة فقط. إذا لم تقم بطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.</p>
                    </div>
                </div>
            `
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': brevoApiKey
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('Brevo Error:', errorDetails);
            return NextResponse.json({ error: 'حدثت مشكلة أثناء إرسال البريد عبر Brevo' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' });

    } catch (error: any) {
        console.error('❌ Send OTP Error:', {
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

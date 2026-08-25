import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { formatApiError } from '@/src/utils/authErrorHandler';
import { sendAuthEmail } from '@/src/utils/sendAuthEmail';

export async function POST(req: NextRequest) {
    try {
        const { email, firstName, lastName, password } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Validate email format
        if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
            return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'مشكلة في إعدادات الخادم (Admin SDK)' }, { status: 500 });
        }

        // Check existing pending verification doc if password was omitted during resend
        let effectivePassword = password;
        const existingDocRef = adminDb.collection('email_verifications').doc(normalizedEmail);
        const existingDoc = await existingDocRef.get();

        if (!effectivePassword && existingDoc.exists) {
            effectivePassword = existingDoc.data()?.password;
        }

        if (!effectivePassword) {
            return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 });
        }

        // Validate password strength
        if (effectivePassword.length < 6) {
            return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }

        // Check if email already exists in Firebase Auth
        try {
            const { adminAuth } = await import('@/src/config/firebase-admin');
            if (adminAuth) {
                await adminAuth.getUserByEmail(normalizedEmail);
                // If found, email already exists
                return NextResponse.json({ error: 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول' }, { status: 400 });
            }
        } catch (error: any) {
            // User not found is expected
            if (error.code !== 'auth/user-not-found') {
                console.warn('Firebase Auth user lookup notice:', error.message);
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        // Save signup data and OTP to Firestore `email_verifications` collection
        await existingDocRef.set({
            email: normalizedEmail,
            firstName: firstName || existingDoc.data()?.firstName || '',
            lastName: lastName || existingDoc.data()?.lastName || '',
            password: effectivePassword,
            otp,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString(),
            verified: false,
        });

        // Send Verification Email
        const emailResult = await sendAuthEmail({
            to: normalizedEmail,
            subject: 'رمز التحقق من البريد الإلكتروني - Tolzy',
            otp,
            htmlContent: `
                <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; background-color: #f9f9f9; padding: 20px;">
                    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 15px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #4f46e5; margin-bottom: 20px;">تأكيد بريدك الإلكتروني</h2>
                        <p style="color: #333; font-size: 16px;">مرحباً بك في Tolzy! يرجى استخدام رمز التحقق التالي لتأكيد بريدك الإلكتروني:</p>
                        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 10px; margin: 20px 0;">
                            <h1 style="margin: 0; color: #1e293b; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">هذا الرمز صالح لمدة 15 دقيقة فقط. إذا لم تقم بإنشاء حساب في Tolzy، يمكنك تجاهل هذه الرسالة بأمان.</p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="color: #64748b; font-size: 12px;">© 2026 Tolzy AI. جميع الحقوق محفوظة.</p>
                        </div>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ 
            success: true, 
            message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
            email: normalizedEmail,
            delivery: emailResult.method,
        });

    } catch (error: any) {
        console.error('❌ Send Email Verification OTP Error:', {
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

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { formatApiError } from '@/src/utils/authErrorHandler';

export async function POST(req: NextRequest) {
    try {
        const { email, firstName, lastName, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
        }

        // Validate email format
        if (!email.includes('@')) {
            return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 400 });
        }

        // Validate password strength
        if (password.length < 6) {
            return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'مشكلة في إعدادات الخادم (Admin SDK)' }, { status: 500 });
        }

        // Check if email already exists
        try {
            const { adminAuth } = await import('@/src/config/firebase-admin');
            if (adminAuth) {
                await adminAuth.getUserByEmail(email);
                // If we reach here, user exists
                return NextResponse.json({ error: 'البريد الإلكتروني مسجل بالفعل' }, { status: 400 });
            }
        } catch (error: any) {
            // User not found is expected
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        // Save signup data and OTP to Firestore `email_verifications` collection using email as Doc ID
        await adminDb.collection('email_verifications').doc(email).set({
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            password, // Will be deleted after verification
            otp,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString(),
            verified: false
        });

        // Send Email via Brevo
        const brevoApiKey = process.env.BREVO_API_KEY;
        if (!brevoApiKey) {
            return NextResponse.json({ error: 'مفتاح BREVO_API_KEY غير متوفر في الخادم' }, { status: 500 });
        }

        const senderEmail = process.env.EMAIL_USER || 'newstolzy.ai@gmail.com';
        const emailData = {
            sender: { email: senderEmail, name: 'Tolzy Support' },
            to: [{ email: email }],
            subject: 'رمز التحقق من البريد الإلكتروني - Tolzy',
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
            return NextResponse.json({ error: 'حدثت مشكلة أثناء إرسال البريد' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
            email: email 
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

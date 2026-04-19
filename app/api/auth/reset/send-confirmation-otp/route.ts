import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { formatApiError } from '@/src/utils/authErrorHandler';

export async function POST(req: NextRequest) {
    try {
        const { email, newPassword } = await req.json();

        if (!email || !newPassword) {
            return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'مشكلة في إعدادات الخادم (Admin SDK)' }, { status: 500 });
        }

        // Generate confirmation OTP
        const confirmationOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        // Save confirmation OTP to Firestore collection
        await adminDb.collection('password_resets_confirmation').doc(email).set({
            email,
            newPassword, // Store temporarily for final update
            confirmationOtp,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString()
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
            subject: 'رمز التأكيد النهائي لتغيير كلمة المرور - Tolzy',
            htmlContent: `
                <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; background-color: #f9f9f9; padding: 20px;">
                    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 15px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #4f46e5; margin-bottom: 20px;">تأكيد تغيير كلمة المرور</h2>
                        <p style="color: #333; font-size: 16px;">لقد طلبت تغيير كلمة مرورك. يرجى استخدام رمز التأكيد التالي لإكمال العملية:</p>
                        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 10px; margin: 20px 0;">
                            <h1 style="margin: 0; color: #1e293b; letter-spacing: 5px; font-size: 32px;">${confirmationOtp}</h1>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">هذا الرمز صالح لمدة 15 دقيقة فقط. إذا لم تقم بطلب تغيير كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.</p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 12px;">⚠️ لا تشارك هذا الرمز مع أحد - فريق Tolzy لن يطلب منك الرمز أبداً.</p>
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
            message: 'تم إرسال رمز التأكيد إلى بريدك الإلكتروني'
        });

    } catch (error: any) {
        console.error('❌ Send Confirmation OTP Error:', {
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

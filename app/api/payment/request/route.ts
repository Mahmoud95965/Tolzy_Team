import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import nodemailer from 'nodemailer';
import { supabaseAdmin, hasSupabaseAdminConfig } from '@/src/config/supabase-admin';

export const maxDuration = 60;

const ADMIN_EMAIL = 'mahmoud.m.moussa5310@gmail.com';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            userId,
            userEmail,
            firstName,
            lastName,
            phoneNumber,
            plan,
            amount,
            promoCode,
            receiptUrl,
        } = body;

        if (!userId || !userEmail || !phoneNumber || !receiptUrl) {
            return NextResponse.json(
                { error: 'Missing required payment details' },
                { status: 400 }
            );
        }

        const fullName = `${firstName || ''} ${lastName || ''}`.trim() || userEmail;
        const planTitle = plan === 'max' ? 'Tolzy MAX / Studio (2.5M Tokens)' : 'Tolzy Pro (500K Tokens)';
        const createdAt = new Date().toISOString();

        let requestId = `req_${Date.now()}`;

        // 1. Save in Firestore payment_requests collection
        if (adminDb) {
            try {
                const docRef = await adminDb.collection('payment_requests').add({
                    userId,
                    userEmail,
                    fullName,
                    phoneNumber,
                    plan: plan || 'pro',
                    amount: amount || 0,
                    promoCode: promoCode || null,
                    receiptUrl,
                    status: 'pending',
                    createdAt: new Date(),
                });
                requestId = docRef.id;
                console.log(`✅ Saved payment request to Firestore: ${requestId}`);
            } catch (fsErr) {
                console.error('Firestore save payment request error:', fsErr);
            }
        }

        // 2. Optionally record in Supabase
        if (hasSupabaseAdminConfig) {
            try {
                await supabaseAdmin.from('payment_requests').insert({
                    user_id: userId,
                    email: userEmail,
                    full_name: fullName,
                    phone: phoneNumber,
                    plan: plan || 'pro',
                    amount: amount || 0,
                    receipt_url: receiptUrl,
                    status: 'pending',
                    created_at: createdAt
                });
            } catch (sbErr) {
                console.warn('Supabase payment_requests insert note:', sbErr);
            }
        }

        // 3. Send automated email notification to Admin
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const emailHtml = `
                <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #0f172a; color: #ffffff; padding: 24px; text-align: center;">
                            <h2 style="margin: 0; font-size: 20px;">🔔 طلب اشتراك جديد في المنصة</h2>
                            <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 14px;">يرجى مراجعة بيانات التحويل وتفعيل الحساب</p>
                        </div>
                        
                        <div style="padding: 24px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; color: #64748b; font-weight: bold;">اسم العميل:</td>
                                    <td style="padding: 12px 0; color: #0f172a; font-weight: bold;">${fullName}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; color: #64748b; font-weight: bold;">البريد الإلكتروني:</td>
                                    <td style="padding: 12px 0; color: #0f172a; font-family: monospace;">${userEmail}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; color: #64748b; font-weight: bold;">رقم الهاتف / الواتساب:</td>
                                    <td style="padding: 12px 0; color: #0f172a; font-family: monospace;" dir="ltr">${phoneNumber}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; color: #64748b; font-weight: bold;">الباقة المطلوبة:</td>
                                    <td style="padding: 12px 0; color: #2563eb; font-weight: bold;">${planTitle}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; color: #64748b; font-weight: bold;">المبلغ المحول:</td>
                                    <td style="padding: 12px 0; color: #0f172a; font-weight: bold;">${amount} ج.م</td>
                                </tr>
                                ${promoCode ? `
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px 0; color: #64748b; font-weight: bold;">كود الخصم:</td>
                                    <td style="padding: 12px 0; color: #16a34a; font-weight: bold;">${promoCode}</td>
                                </tr>` : ''}
                            </table>

                            <div style="margin-top: 24px; text-align: center;">
                                <a href="${receiptUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 14px;">
                                    🔍 عرض صورة الإيصال المرفق
                                </a>
                            </div>

                            <div style="margin-top: 16px; text-align: center;">
                                <a href="https://tolzy.me/admin/users" target="_blank" style="display: inline-block; color: #64748b; font-size: 12px; text-decoration: underline;">
                                    الانتقال للوحة تحكم المسؤول لتفعيل الحساب بنقرة واحدة
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                `;

                await transporter.sendMail({
                    from: `Tolzy Platform <${process.env.EMAIL_USER}>`,
                    to: ADMIN_EMAIL,
                    subject: `🔔 طلب اشتراك جديد: ${fullName} (${plan === 'max' ? 'MAX' : 'Pro'})`,
                    html: emailHtml,
                });
                console.log('✅ Admin notification email sent successfully.');
            } catch (emailErr) {
                console.warn('Email dispatch warning (request saved successfully anyway):', emailErr);
            }
        }

        return NextResponse.json({
            success: true,
            requestId,
            message: 'تم استلام طلب الاشتراك بنجاح وجاري المراجعة',
            receiptUrl,
            fullName,
            phoneNumber,
            amount,
            plan,
            timestamp: createdAt
        }, { status: 200 });

    } catch (error: any) {
        console.error('Submit payment request error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to submit payment request' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        if (!adminDb) {
            return NextResponse.json({ requests: [] });
        }

        const snapshot = await adminDb.collection('payment_requests')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt
        }));

        return NextResponse.json({ requests }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch payment requests error:', error);
        return NextResponse.json({ requests: [], error: error.message }, { status: 500 });
    }
}

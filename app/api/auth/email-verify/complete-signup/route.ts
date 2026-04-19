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

        // Get verification data
        const docRef = adminDb.collection('email_verifications').doc(email);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'لم يتم العثور على بيانات التحقق' }, { status: 400 });
        }

        const data = docSnap.data() as { 
            email: string, 
            firstName: string, 
            lastName: string, 
            password: string,
            verified: boolean,
            expiresAt: string
        };

        // Check if verified
        if (!data.verified) {
            return NextResponse.json({ error: 'البريد الإلكتروني لم يتم التحقق منه' }, { status: 400 });
        }

        // Check if expired
        if (new Date() > new Date(data.expiresAt)) {
            await docRef.delete();
            return NextResponse.json({ error: 'انتهت صلاحية طلب التسجيل، يرجى المحاولة مرة أخرى' }, { status: 400 });
        }

        // Create user in Firebase Auth
        let userRecord;
        try {
            userRecord = await adminAuth.createUser({
                email: data.email,
                password: data.password
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                return NextResponse.json({ error: 'البريد الإلكتروني مسجل بالفعل' }, { status: 400 });
            }
            throw error;
        }

        // Create user document in Firestore
        const displayName = data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}` 
            : data.email.split('@')[0];

        await adminDb.collection('users').doc(userRecord.uid).set({
            email: data.email,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            displayName: displayName,
            createdAt: new Date().toISOString(),
            photoURL: null,
            role: 'user',
            plan: 'free',
            emailVerified: true,
            verifiedAt: new Date().toISOString()
        });

        // Delete verification data (cleanup)
        await docRef.delete();

        return NextResponse.json({ 
            success: true,
            uid: userRecord.uid,
            message: 'تم إنشاء حسابك بنجاح'
        });

    } catch (error: any) {
        console.error('❌ Complete Signup Error:', {
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

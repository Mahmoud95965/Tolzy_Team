import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    const envStatus = {
        NODE_ENV: process.env.NODE_ENV,
        HAS_FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        HAS_FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        HAS_FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_PROJECT_ID_VALUE: process.env.FIREBASE_PROJECT_ID ? process.env.FIREBASE_PROJECT_ID.substring(0, 5) + '...' : 'MISSING',
        IS_ADMIN_INITIALIZED: !!adminDb
    };

    return NextResponse.json(envStatus);
}

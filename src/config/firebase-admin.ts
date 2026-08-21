import * as admin from 'firebase-admin';

function normalizePrivateKey(raw: string | undefined): string | null {
    if (!raw) return null;
    let key = raw.trim();
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1);
    }
    key = key.replace(/\\n/g, '\n');
    return key;
}

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^"|"$/g, '');
const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY);

if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log('✅ [Firebase Admin] Initialized successfully');
        } catch (e: any) {
            console.error('❌ [Firebase Admin] Initialization failed:', e.message);
        }
    } else {
        console.warn('⚠️ [Firebase Admin] Missing required environment variables');
    }
}

export const adminDb = admin.apps.length > 0 ? admin.firestore() : (null as any);
export const adminAuth = admin.apps.length > 0 ? admin.auth() : (null as any);

import * as admin from 'firebase-admin';

// Validate required environment variables
const requiredEnvVars = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0 && !admin.apps.length) {
    console.error(`Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
    console.error('Please set the following in your Vercel environment variables:');
    console.error('- FIREBASE_PROJECT_ID');
    console.error('- FIREBASE_CLIENT_EMAIL');
    console.error('- FIREBASE_PRIVATE_KEY');
}

if (!admin.apps.length && missingVars.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: requiredEnvVars.projectId!,
            clientEmail: requiredEnvVars.clientEmail!,
            privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, '\n'),
        }),
    });
}

export const adminDb = admin.apps.length > 0 ? admin.firestore() : null as any;
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null as any;

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
dotenv.config();

const requiredEnvVars = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0 && !admin.apps.length) {
    console.warn(`WARNING: Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
    console.warn('Copilot tools retrieval may fail.');
}

if (!admin.apps.length && missingVars.length === 0) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: requiredEnvVars.projectId,
                clientEmail: requiredEnvVars.clientEmail,
                privateKey: requiredEnvVars.privateKey.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin Initialized Successfully');
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}

// Export db instance
export const db = admin.apps.length > 0 ? admin.firestore() : null;

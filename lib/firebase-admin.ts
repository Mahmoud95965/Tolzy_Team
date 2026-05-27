import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Tool } from '@/src/types/tool';
import { Course } from '@/src/types/learn';
import { NewsArticle } from '@/src/types/index';

export let adminInitError: Error | null = null;

// Helper function for safe error logging
export function logError(error: unknown, context: string) {
    if (error instanceof Error) {
        console.error(`\u26a0\ufe0f ${context}:`, error.message);
    } else {
        console.error(`\u26a0\ufe0f ${context} (unknown error):`, error);
    }
}

/**
 * Normalize FIREBASE_PRIVATE_KEY from any format Vercel might store it in:
 * 1. Wrapped in outer double-quotes: "-----BEGIN..." => strip quotes
 * 2. Literal \n escaped as \\n (double backslash) => replace with real newline
 * 3. Already correct — leave as-is
 */
function normalizePrivateKey(raw: string | undefined): string | null {
    if (!raw) return null;
    let key = raw.trim();
    // Strip surrounding quotes added by some env editors
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1);
    }
    // Replace double-escaped newlines (\\n) with real newlines (\n)
    key = key.replace(/\\n/g, '\n');
    // Sanity check: must contain PEM header
    if (!key.includes('-----BEGIN')) {
        console.error('[firebase-admin] FIREBASE_PRIVATE_KEY does not contain a PEM header after normalization. Check Vercel env vars.');
        return null;
    }
    return key;
}

// Initialize Firebase Admin SDK for server-side operations
function initAdmin() {
    // Already initialized — return existing Firestore instance
    if (getApps().length > 0) {
        try {
            return getFirestore();
        } catch {
            return null;
        }
    }

    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    const projectId  = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^"|"$/g, '');

    if (!privateKey || !projectId || !clientEmail) {
        const missing = [
            !projectId    && 'FIREBASE_PROJECT_ID',
            !clientEmail  && 'FIREBASE_CLIENT_EMAIL',
            !privateKey   && 'FIREBASE_PRIVATE_KEY',
        ].filter(Boolean);
        adminInitError = new Error(`Missing Firebase Admin env vars: ${missing.join(', ')}`);
        console.error('[firebase-admin]', adminInitError.message);
        console.error('[firebase-admin] Make sure these are set in Vercel \u2192 Project Settings \u2192 Environment Variables');
        return null;
    }

    try {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
        console.log('[firebase-admin] ✅ Firebase Admin initialized successfully');
        return getFirestore();
    } catch (error: unknown) {
        logError(error, 'Error initializing Firebase Admin');
        adminInitError = error instanceof Error ? error : new Error('Unknown error initializing Firebase Admin');
        return null;
    }
}

export const adminDb = initAdmin();



// Helper to serialize Firestore data (convert Timestamps to strings)
const serializeData = (data: any): any => {
    if (!data) return data;

    const serialized = { ...data };

    const convert = (val: any) => {
        if (val && typeof val.toDate === 'function') {
            return val.toDate().toISOString();
        }
        return val;
    };

    // Common date fields to check
    ['createdAt', 'updatedAt', 'submittedAt', 'reviewedAt', 'date'].forEach(field => {
        if (serialized[field]) {
            serialized[field] = convert(serialized[field]);
        }
    });

    return serialized;
};

// Helper function to get all tools for SSR/SSG
export async function getAllToolsFromFirebase(limitCount?: number): Promise<Tool[]> {

    try {
        if (!adminDb) {
            console.warn('⚠️ Admin DB not available, returning empty array');
            return [];
        }

        let queryRef: any = adminDb.collection('tools');
        if (limitCount) {
            queryRef = queryRef.limit(limitCount);
        }
        const toolsSnapshot = await queryRef.get();

        const tools = toolsSnapshot.docs.map((doc: any) => serializeData({
            id: doc.id,
            ...doc.data(),
        })) as Tool[];

        console.log(`✅ Fetched ${tools.length} tools from Firebase Admin`);
        return tools;
    } catch (error: unknown) {
        logError(error, 'Error fetching all tools from Firebase Admin');
        return [];
    }
}

// Helper function to get a single tool by ID
export async function getToolByIdFromFirebase(id: string): Promise<Tool | null> {
    try {
        if (!adminDb) {
            console.warn('⚠️ Admin DB not available');
            return null;
        }

        const toolDoc = await adminDb.collection('tools').doc(id).get();

        if (!toolDoc.exists) {
            return null;
        }

        return serializeData({
            id: toolDoc.id,
            ...toolDoc.data(),
        }) as Tool;
    } catch (error: unknown) {
        logError(error, `Error fetching tool ${id} from Firebase Admin (falling back to client)`);
        return null;
    }
}

// --- NEWS HELPERS ---

export async function getAllNewsFromFirebase(): Promise<NewsArticle[]> {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('news').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => serializeData({ id: doc.id, ...doc.data() }) as NewsArticle);
    } catch (error) {
        logError(error, 'Error fetching news');
        return [];
    }
}

export async function getNewsByIdFromFirebase(id: string): Promise<NewsArticle | null> {
    try {
        if (!adminDb) return null;
        const doc = await adminDb.collection('news').doc(id).get();
        return doc.exists ? (serializeData({ id: doc.id, ...doc.data() }) as NewsArticle) : null;
    } catch (error) {
        logError(error, `Error fetching news ${id}`);
        return null;
    }
}

// --- COURSES HELPERS ---

export async function getAllCoursesFromFirebase(): Promise<Course[]> {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('courses').where('isPublished', '==', true).get();
        return snapshot.docs.map(doc => serializeData({ id: doc.id, ...doc.data() }) as Course);
    } catch (error) {
        logError(error, 'Error fetching courses');
        return [];
    }
}

export async function getCourseByIdFromFirebase(id: string): Promise<Course | null> {
    try {
        if (!adminDb) return null;
        const doc = await adminDb.collection('courses').doc(id).get();
        return doc.exists ? (serializeData({ id: doc.id, ...doc.data() }) as Course) : null;
    } catch (error) {
        logError(error, `Error fetching course ${id}`);
        return null;
    }
}

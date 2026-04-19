import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Tool } from '@/src/types/tool';
import { Course } from '@/src/types/learn';
import { NewsArticle } from '@/src/types/index';

export let adminInitError: Error | null = null;

// Helper function for safe error logging
export function logError(error: unknown, context: string) {
    if (error instanceof Error) {
        console.warn(`⚠️ ${context}:`, error.message);
    } else {
        console.warn(`⚠️ ${context} (unknown error):`, error);
    }
}

// Initialize Firebase Admin SDK for server-side operations
function initAdmin() {
    if (getApps().length === 0) {
        try {
            let privateKey = process.env.FIREBASE_PRIVATE_KEY;

            if (privateKey) {
                // Remove wrapping quotes
                if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                    privateKey = privateKey.slice(1, -1);
                }

                // Replace literal \n with actual newlines
                privateKey = privateKey.replace(/\\n/g, '\n');
            }

            if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
                adminInitError = new Error('Missing FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, or FIREBASE_CLIENT_EMAIL');
                return null;
            }

            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });

            console.log('✅ Firebase Admin initialized successfully');
        } catch (error: unknown) {
            logError(error, 'Error initializing Firebase Admin');
            adminInitError = error instanceof Error ? error : new Error('Unknown error initializing Firebase Admin');
            return null;
        }
    }

    return getFirestore();
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
export async function getAllToolsFromFirebase(): Promise<Tool[]> {

    try {
        if (!adminDb) {
            console.warn('⚠️ Admin DB not available, returning empty array');
            return [];
        }

        const toolsSnapshot = await adminDb.collection('tools').get();

        const tools = toolsSnapshot.docs.map((doc) => serializeData({
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

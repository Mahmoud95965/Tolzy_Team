// 🧹 تنظيف كاش الفايربيز المسمم من الإصدار 11.8.0 قبل التهيئة
// Note: Disabled for v11.5.0 to avoid SDK conflicts
/*
if (typeof window !== 'undefined') {
  try {
    window.indexedDB.databases().then((dbs) => {
      dbs.forEach((db) => {
        if (db.name && (db.name.includes('firestore') || db.name.includes('firebase'))) {
          window.indexedDB.deleteDatabase(db.name);
          console.log('🧹 تم مسح كاش الفايربيز المسمم:', db.name);
        }
      });
    }).catch((err) => {
      console.warn('⚠️ لم يتمكن من مسح الكاش (غير مهم):', err);
    });
  } catch (e) {
    // Silent fail - not critical
  }
}
*/

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  Firestore, 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth, OAuthProvider, GithubAuthProvider, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration object
// Note: In Next.js, we must access process.env.NEXT_PUBLIC_* directly for the bundler to capture it.
// Dynamic access like process.env[key] will NOT work.

const requiredKeys = [
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
];

if (requiredKeys.some(key => !key)) {
  console.error('[Firebase] Missing one or more required environment variables.');
  console.error('Required: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, etc.');
  console.error('Current values:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓' : '✗',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓' : '✗',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓' : '✗',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓' : '✗',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓' : '✗',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓' : '✗'
  });
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
if (projectId && projectId.endsWith('.')) {
  console.error('[Firebase] Invalid NEXT_PUBLIC_FIREBASE_PROJECT_ID: must not end with a dot. Fix your .env');
  throw new Error('Invalid NEXT_PUBLIC_FIREBASE_PROJECT_ID');
}

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "auth.tolzy.me",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
} as const;

// Initialize Firebase with error handling
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let microsoftProvider: OAuthProvider;

try {
  // Check if required config values exist
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    const missingKeys = [];
    if (!firebaseConfig.apiKey) missingKeys.push('apiKey');
    if (!firebaseConfig.projectId) missingKeys.push('projectId');
    
    const errorMsg = `Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}. Please check your .env.local file.`;
    console.error('[Firebase] ' + errorMsg);
    throw new Error(errorMsg);
  }

  console.log('[Firebase] Initializing with config:', {
    apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId?.substring(0, 10) + '...'
  });

  app = initializeApp(firebaseConfig);

  // Initialize Firestore with robust local persistent cache (IndexedDB)
  // This enables offline caching, loads data locally first, and saves Firestore reads / quotas.
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log('📦 [Firebase Client] Offline persistence enabled successfully');
  } catch (e: any) {
    db = getFirestore(app);
    console.warn('⚠️ [Firebase Client] Reusing existing Firestore instance:', e.message);
  }
  
  auth = getAuth(app);
  
  // Set auth language to Arabic
  auth.languageCode = 'ar';

  // 🔌 الاتصال بمحاكي Firebase المحلي في بيئة التطوير لتجنب استهلاك الحصص المجانية
  // يتم الاتصال فقط إذا تم تفعيل المتغير NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true في ملف .env
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
      // استخدام try-catch لمنع التكرار وانهيار التطبيق بسبب الـ Hot-Reloading في Turbopack
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      console.log('🔌 [Firebase Emulator] تم ربط Firestore بنجاح على المنفذ 8080');
    } catch (e) {
      console.warn('⚠️ [Firebase Emulator] مستمع Firestore قيد التشغيل بالفعل أو فشل الربط:', e);
    }

    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      console.log('🔌 [Firebase Emulator] تم ربط Auth بنجاح على المنفذ 9099');
    } catch (e) {
      console.warn('⚠️ [Firebase Emulator] مستمع Auth قيد التشغيل بالفعل أو فشل الربط:', e);
    }
  }
  
  googleProvider = new GoogleAuthProvider();
  microsoftProvider = new OAuthProvider('microsoft.com');

  // Configure Google provider with recommended settings
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    access_type: 'offline',
  });
  
  // Add scopes for better user data
  googleProvider.addScope('profile');
  googleProvider.addScope('email');

  // Note: Modern Firestore SDKs enable persistence by default in web environments where supported.
  // We can explicitly configure it if needed, but the default behavior is usually sufficient and safer.
  // Removing the deprecated enableIndexedDbPersistence call to avoid errors.

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error code:', (error as any).code);
  }
  console.error('Please check your .env.local file and ensure all Firebase configuration values are correct.');
  throw error;
}

const githubProvider = new GithubAuthProvider();

// Export initialized instances
export { app, db, auth, googleProvider, microsoftProvider, githubProvider };

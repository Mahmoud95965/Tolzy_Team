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

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  Firestore, 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  connectFirestoreEmulator,
  setLogLevel
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth, OAuthProvider, GithubAuthProvider, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration object
// Note: In Next.js, we must access process.env.NEXT_PUBLIC_* directly for the bundler to capture it.
// Dynamic access like process.env[key] will NOT work.

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const apiKey = (rawApiKey && !rawApiKey.includes('Demo') && !rawApiKey.includes('placeholder'))
  ? rawApiKey
  : 'AIzaSyDgTnOb1Wiu-964QaV2Q1oxLYgWLJkqFsQ';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zakerly0';

export const isFirebaseConfigured = Boolean(apiKey && projectId);

if (!isFirebaseConfigured && typeof window !== 'undefined') {
  console.info('ℹ️ [Firebase] Running in local demo/fallback mode. Using offline bundled tools data.');
}

if (projectId && projectId.endsWith('.')) {
  console.warn('[Firebase] Invalid NEXT_PUBLIC_FIREBASE_PROJECT_ID: must not end with a dot.');
}

export const firebaseConfig = {
  apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "auth.tolzy.me",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://zakerly0-default-rtdb.firebaseio.com",
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'zakerly0.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '718838819739',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:718838819739:web:fb0c10967caeaee59d4f3e',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-TVZZCE0TF2'
} as const;

// Initialize Firebase with error handling
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let googleProvider: GoogleAuthProvider;
let microsoftProvider: OAuthProvider;

try {
  // Suppress internal multi-tab lease competition logs (e.g. Backfill Indexes)
  setLogLevel('error');

  // Check if required config values exist in production runtime
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.warn('[Firebase] Missing Firebase API Key or Project ID in build environment. Using placeholders for build-time evaluation.');
  }

  // Singleton app check for Next.js Fast Refresh & Turbopack
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  // Initialize Firestore with robust local persistent cache (IndexedDB)
  // This enables offline caching, loads data locally first, and saves Firestore reads / quotas.
  if (typeof window !== 'undefined') {
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
      console.log('📦 [Firebase Client] Offline persistence enabled successfully');
    } catch (e: any) {
      db = getFirestore(app);
    }
  } else {
    db = getFirestore(app);
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

      // تحقق غير متزامن لتنبيه المطور إذا كان المحاكي غير مشغل
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:8080', { mode: 'no-cors' })
          .catch(() => {
            console.error(
              '%c🚨 [Firebase Emulator] فشل الاتصال بمحاكي Firestore على المنفذ 8080!\n' +
              'تأكد من تشغيل المحاكي باستخدام الأمر:\n' +
              '   npx firebase emulators:start\n' +
              'أو قم بتعطيله في ملف .env عن طريق تغيير:\n' +
              '   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false',
              'color: #ff3333; font-weight: bold; font-size: 14px;'
            );
          });
      }
    } catch (e) {
      console.warn('⚠️ [Firebase Emulator] مستمع Firestore قيد التشغيل بالفعل أو فشل الربط:', e);
    }

    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      console.log('🔌 [Firebase Emulator] تم ربط Auth بنجاح على المنفذ 9099');

      // تحقق غير متزامن لتنبيه المطور إذا كان محاكي Auth غير مشغل
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:9099', { mode: 'no-cors' })
          .catch(() => {
            console.error(
              '%c🚨 [Firebase Emulator] فشل الاتصال بمحاكي Auth على المنفذ 9099!\n' +
              'تأكد من تشغيل المحاكي أو قم بتعطيله في ملف .env.',
              'color: #ff3333; font-weight: bold; font-size: 14px;'
            );
          });
      }
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
  console.warn('⚠️ [Firebase] Could not initialize live Firebase client. Continuing in offline mode:', error);
}

const githubProvider = new GithubAuthProvider();

// Export initialized instances
export { app, db, auth, googleProvider, microsoftProvider, githubProvider };

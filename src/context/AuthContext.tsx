"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User, Auth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import type { UserProfile } from '../types/user';
import { useFCMToken } from '../hooks/useFCMToken';
import { getAuthErrorMessage } from '../utils/authErrorHandler';
import { cachedUserData } from '../utils/userCache';

// Define context type with minimal initial dependencies
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Error Message Mapping (Imported from authErrorHandler) ──────────────────────
// Using getAuthErrorMessage from utils/authErrorHandler.ts

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  isAdmin: false,
  signInWithGoogle: async () => { },
  signInWithGithub: async () => { },
  signInWithEmail: async () => { },
  signUpWithEmail: async () => { },
  resetPassword: async () => { },
  logout: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ─── FCM Token ──────────────────────────────────────────────────────────
  const fcmToken = useFCMToken();

  // FCM Token - with rate limiting to prevent Supabase quota exhaustion
  useEffect(() => {
    let lastSavedUid: string | null = null;
    
    const saveTokenToSupabase = async () => {
      if (!user?.uid || !fcmToken) return;
      
      // Skip if already saved for this user (rate limiting)
      if (lastSavedUid === user.uid) {
        console.log('⏳ FCM token already saved for this user, skipping');
        return;
      }
      
      try {
        const { supabase } = await import('../config/supabaseClient');
        await supabase.from('profiles').upsert({
          id: user.uid,
          fcm_token: fcmToken,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        lastSavedUid = user.uid;
        console.log('✅ FCM Token saved to Supabase');
      } catch (e: any) {
        // Silent fail on quota errors to prevent console spam
        if (e?.message?.includes('quota') || e?.message?.includes('restricted')) {
          console.warn('⚠️ Supabase quota exceeded, FCM token not saved');
        } else {
          console.error('❌ Failed to save FCM token:', e?.message || e);
        }
      }
    };
    
    saveTokenToSupabase();
  }, [user?.uid, fcmToken]);

  // Lazy loaded instances
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);

  const normalizePlan = (rawPlan: unknown): 'free' | 'pro' | 'ultra' => {
    const value = String(rawPlan || 'free').toLowerCase();
    if (value.includes('ultra')) return 'ultra';
    if (value.includes('pro')) return 'pro';
    return 'free';
  };

  useEffect(() => {
    let unsubscribe: () => void;
    let mounted = true;

    const initAuth = async () => {
      try {
        // Dynamic import of Firebase Configuration
        // This ensures the heavy bundle is NOT in the initial chunk
        const { auth, db } = await import('../config/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        const { doc, getDoc, setDoc } = await import('firebase/firestore');

        if (!mounted) return;
        setAuthInstance(auth);

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!mounted) return;
          setUser(firebaseUser);

          if (firebaseUser) {
            try {
              const { supabase } = await import('../config/supabaseClient');
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              
              let baseData: any = {};
              try {
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  baseData = userDocSnap.data();
                  // Warm up the shared useUserData hook's memory cache to avoid double Firestore fetch
                  cachedUserData[firebaseUser.uid] = {
                    email: baseData.email || firebaseUser.email || '',
                    firstName: baseData.firstName || '',
                    lastName: baseData.lastName || '',
                    displayName: baseData.displayName || firebaseUser.displayName || baseData.email?.split('@')[0] || 'المستخدم',
                    photoURL: baseData.photoURL || firebaseUser.photoURL,
                    coverURL: baseData.coverURL || null,
                    createdAt: baseData.createdAt || new Date().toISOString(),
                    role: baseData.role || 'user',
                    copilotRequestCount: baseData.copilotRequestCount || 0,
                    lastCopilotRequestDate: baseData.lastCopilotRequestDate || null
                  };
                }
              } catch (fsErr) {
                console.warn('⚠️ [AuthContext] Firestore user fetch failed (offline or quota exceeded):', fsErr);
              }

              let truePlan = 'free';
              try {
                // Read plan from backend admin endpoint to avoid RLS/session mismatch
                const res = await fetch(`/api/user/plan?uid=${encodeURIComponent(firebaseUser.uid)}`, {
                  cache: 'no-store'
                });
                if (res.ok) {
                  const result = await res.json();
                  truePlan = normalizePlan(result?.plan);
                } else {
                  truePlan = normalizePlan(baseData.plan);
                }
              } catch (e) {
                console.error("Error fetching plan from backend:", e);
                truePlan = normalizePlan(baseData.plan);
              }

              setUserProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: baseData.displayName || firebaseUser.displayName || '',
                photoURL: baseData.photoURL || firebaseUser.photoURL,
                plan: normalizePlan(truePlan),
                role: baseData.role || 'user'
              });

              // Admin Check
              if (firebaseUser.email === 'mahmoud.m.moussa5310@gmail.com') {
                const adminDocRef = doc(db, 'admins', firebaseUser.uid);
                // Non-blocking write
                setDoc(adminDocRef, {
                  role: 'admin',
                  email: firebaseUser.email,
                  createdAt: new Date().toISOString()
                }, { merge: true }).catch(console.error);

                setIsAdmin(true);
                if (typeof document !== 'undefined') {
                  document.cookie = "tolzy_admin_session=mahmoud_secure_session; path=/; max-age=86400; Secure; SameSite=Strict";
                }
              } else {
                setIsAdmin(false);
                if (typeof document !== 'undefined') {
                  document.cookie = "tolzy_admin_session=; path=/; max-age=0; Secure; SameSite=Strict";
                }
              }

            } catch (err) {
              console.error("Error fetching user profile:", err);
            }
          } else {
            setUserProfile(null);
            setIsAdmin(false);
            if (typeof document !== 'undefined') {
              document.cookie = "tolzy_admin_session=; path=/; max-age=0; Secure; SameSite=Strict";
            }
          }
          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        if (mounted) setLoading(false);
      }
    };

    // Initialize immediately (async) or wait?
    // User requested "Background Initialization".
    // We will let AuthInitializer trigger the heavy lift, or just let this run.
    // Since this is all async dynamic imports, it yields to main thread.
    initAuth();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Refresh plan only on window focus - removed aggressive polling to prevent quota exhaustion
  useEffect(() => {
    if (!user?.uid) return;

    let lastRefresh = 0;
    let cancelled = false;
    
    const refreshPlan = async () => {
      // Rate limit: max once per minute
      const now = Date.now();
      if (now - lastRefresh < 60000) {
        console.log(`⏳ Plan refresh skipped (rate limited)`);
        return;
      }
      lastRefresh = now;
      
      try {
        console.log(`🔄 Refreshing plan for user ${user.uid}`);
        const res = await fetch(`/api/user/plan?uid=${encodeURIComponent(user.uid)}`, {
          cache: 'no-store'
        });
        if (!res.ok) {
          console.warn(`⚠️ Plan API returned status ${res.status}`);
          return;
        }
        const result = await res.json();
        const latestPlan = normalizePlan(result?.plan);

        if (!cancelled) {
          console.log(`✅ Plan refreshed: ${latestPlan}`);
          setUserProfile((prev) => {
            if (!prev || prev.uid !== user.uid) return prev;
            if (prev.plan === latestPlan) return prev;
            console.log(`🔄 Updating plan from ${prev.plan} to ${latestPlan}`);
            return { ...prev, plan: latestPlan };
          });
        }
      } catch (e) {
        console.error('❌ Plan refresh error:', e);
      }
    };

    const onWindowFocus = () => {
      console.log('📍 Window focus detected, refreshing plan');
      refreshPlan();
    };

    // Refresh on window focus only (no polling to save quota)
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onWindowFocus);
    }

    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onWindowFocus);
      }
    };
  }, [user?.uid]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { auth, googleProvider, db } = await import('../config/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      const { doc, setDoc, getDoc } = await import('firebase/firestore');

      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);

      // Async profile update
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLoginAt: new Date().toISOString(),
      }, { merge: true });

      const snap = await getDoc(userDocRef);
      if (!snap.data()?.plan) {
        await setDoc(userDocRef, { plan: 'free' }, { merge: true });
      }

    } catch (error: any) {
      const userFriendlyError = getAuthErrorMessage(error);
      console.error('Google sign in error:', { code: error?.code, message: error?.message });
      setError(userFriendlyError);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      setError(null);
      const { auth, githubProvider, db } = await import('../config/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      const { doc, setDoc, getDoc } = await import('firebase/firestore');

      const result = await signInWithPopup(auth, githubProvider);
      setUser(result.user);

      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLoginAt: new Date().toISOString(),
      }, { merge: true });

      const snap = await getDoc(userDocRef);
      if (!snap.data()?.plan) {
        await setDoc(userDocRef, { plan: 'free' }, { merge: true });
      }
    } catch (error: any) {
      const userFriendlyError = getAuthErrorMessage(error);
      console.error('Github sign in error:', { code: error?.code, message: error?.message });
      setError(userFriendlyError);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const { auth } = await import('../config/firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const userFriendlyError = getAuthErrorMessage(error);
      console.error('Sign in error:', { code: error?.code, message: error?.message });
      setError(userFriendlyError);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setError(null);
      const { auth, db } = await import('../config/firebase');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore');

      const result = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0];

      await setDoc(doc(db, 'users', result.user.uid), {
        email, firstName: firstName || '', lastName: lastName || '', displayName,
        createdAt: new Date().toISOString(), photoURL: null, role: 'user', plan: 'free'
      });

    } catch (error: any) {
      const userFriendlyError = getAuthErrorMessage(error);
      console.error('Sign up error:', { code: error?.code, message: error?.message });
      setError(userFriendlyError);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { auth } = await import('../config/firebase');
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const userFriendlyError = getAuthErrorMessage(error);
      console.error('Reset password error:', { code: error?.code, message: error?.message });
      setError(userFriendlyError);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { auth } = await import('../config/firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      if (typeof document !== 'undefined') {
        document.cookie = "tolzy_admin_session=; path=/; max-age=0; Secure; SameSite=Strict";
      }
    } catch (error) {
      console.error(error);
    }
  };

  const value = {
    user, userProfile, loading, error,
    signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, resetPassword, logout, isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


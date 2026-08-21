"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User, Auth } from 'firebase/auth';
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
      
      if (lastSavedUid === user.uid) {
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
      } catch (e: any) {
        if (!e?.message?.includes('quota') && !e?.message?.includes('restricted')) {
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

  // Helper to sync cross-subdomain SSO session cookie
  const syncSsoSession = async (firebaseUser: User | null) => {
    if (!firebaseUser) return;
    try {
      const idToken = await firebaseUser.getIdToken();
      await fetch('/api/auth/sso/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (e) {
      console.warn('⚠️ [SSO] Failed to sync session cookie:', e);
    }
  };

  useEffect(() => {
    let unsubscribe: () => void;
    let mounted = true;

    const initAuth = async () => {
      try {
        const { auth, db } = await import('../config/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        const { doc, getDoc, setDoc } = await import('firebase/firestore');

        if (!mounted) return;
        setAuthInstance(auth);

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!mounted) return;

          // 🔄 Auto SSO: If not authenticated in this subdomain's IndexedDB, check cross-subdomain cookie
          if (!firebaseUser) {
            try {
              const ssoRes = await fetch('/api/auth/sso/token', { cache: 'no-store' });
              if (ssoRes.ok) {
                const ssoData = await ssoRes.json();
                if (ssoData.authenticated && ssoData.customToken) {
                  const { signInWithCustomToken } = await import('firebase/auth');
                  await signInWithCustomToken(auth, ssoData.customToken);
                  return; // onAuthStateChanged will fire automatically with the newly signed in user
                }
              }
            } catch (ssoErr) {
              console.warn('⚠️ [SSO] Token check failed:', ssoErr);
            }
          }

          setUser(firebaseUser);

          if (firebaseUser) {
            // Keep session cookie fresh across .tolzy.me
            syncSsoSession(firebaseUser);

            try {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              
              let baseData: any = {};
              try {
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  baseData = userDocSnap.data();
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
                console.warn('⚠️ [AuthContext] Firestore user fetch failed:', fsErr);
              }

              let truePlan = 'free';
              try {
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

    initAuth();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Refresh plan on window focus
  useEffect(() => {
    if (!user?.uid) return;

    let lastRefresh = 0;
    let cancelled = false;
    
    const refreshPlan = async () => {
      const now = Date.now();
      if (now - lastRefresh < 60000) {
        return;
      }
      lastRefresh = now;
      
      try {
        const res = await fetch(`/api/user/plan?uid=${encodeURIComponent(user.uid)}`, {
          cache: 'no-store'
        });
        if (!res.ok) return;
        const result = await res.json();
        const latestPlan = normalizePlan(result?.plan);

        if (!cancelled) {
          setUserProfile((prev) => {
            if (!prev || prev.uid !== user.uid) return prev;
            if (prev.plan === latestPlan) return prev;
            return { ...prev, plan: latestPlan };
          });
        }
      } catch (e) {
        console.error('❌ Plan refresh error:', e);
      }
    };

    const onWindowFocus = () => {
      refreshPlan();
    };

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

      // Sync SSO cross-domain session
      await syncSsoSession(result.user);

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

      // Sync SSO cross-domain session
      await syncSsoSession(result.user);

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Sync SSO cross-domain session
      await syncSsoSession(userCredential.user);
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

      // Sync SSO cross-domain session
      await syncSsoSession(result.user);

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
      // Clear SSO cross-domain session cookie and revoke server tokens
      await fetch('/api/auth/sso/logout', { method: 'POST' }).catch(() => {});

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
      console.error('Logout error:', error);
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

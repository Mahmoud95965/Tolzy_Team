import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// GET — Fetch user profile by username (or fallback uid)
export async function GET(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.trim().toLowerCase();
    const uid = searchParams.get('uid')?.trim();

    if (!username && !uid) {
      return NextResponse.json({ error: 'Missing username or uid' }, { status: 400 });
    }

    let userDoc: any = null;
    let userId = '';
    let isFallback = false;
    let fallbackData: any = null;

    try {
      // Try lookup by username first
      if (username) {
        const snap = await adminDb.collection('users').where('username', '==', username).limit(1).get();
        if (!snap.empty) {
          userDoc = snap.docs[0];
          userId = userDoc.id;
        }
      }

      // Fallback to uid if username not found
      if (!userDoc && uid) {
        const docRef = adminDb.collection('users').doc(uid);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          userDoc = docSnap;
          userId = docSnap.id;
        }
      }
    } catch (fsErr) {
      console.error('⚠️ [Firestore Admin] Error fetching user profile (quota exceeded or offline):', fsErr);
      isFallback = true;
      userId = uid || 'fallback_uid';
      fallbackData = {
        uid: userId,
        username: username || `user_${userId.substring(0, 5)}`,
        displayName: 'مستخدم',
        firstName: '',
        lastName: '',
        photoURL: null,
        coverURL: null,
        email: '',
        createdAt: new Date().toISOString(),
        role: 'user',
        plan: 'free',
      };
    }

    if (!userDoc && !isFallback) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (isFallback && fallbackData) {
      return NextResponse.json(fallbackData);
    }

    const data = userDoc.data();

    // Ensure username exists
    let resolvedUsername = data.username;
    if (!resolvedUsername) {
      const baseName = data.firstName || data.displayName || 'user';
      const digits = Math.floor(100 + Math.random() * 900);
      const base = baseName.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
      resolvedUsername = `${base}${digits}`;
      // Save back (fire-and-forget)
      adminDb.collection('users').doc(userId).update({ username: resolvedUsername, updatedAt: new Date().toISOString() }).catch(() => {});
    }

    return NextResponse.json({
      uid: userId,
      username: resolvedUsername,
      displayName: data.displayName || data.firstName || data.email?.split('@')[0] || 'مستخدم',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      photoURL: data.photoURL || null,
      coverURL: data.coverURL || null,
      email: data.email || '',
      createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : String(data.createdAt || ''),
      role: data.role || 'user',
      plan: data.plan || 'free',
    });
  } catch (err: any) {
    console.error('[community/user-profile] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// POST — Return username+name+avatar for a list of uids (max 100)
export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await req.json();
    const uids: string[] = Array.isArray(body.uids) ? body.uids.filter((u: any) => typeof u === 'string' && u.length > 0) : [];

    if (uids.length === 0) {
      return NextResponse.json({ users: {} });
    }

    const results: Record<string, { username: string; displayName: string; photoURL: string | null }> = {};

    // Firestore allows up to 10 values in 'in' filter, process in batches
    const batchSize = 10;
    for (let i = 0; i < uids.length; i += batchSize) {
      const batch = uids.slice(i, i + batchSize);
      const snap = await adminDb.collection('users').where('__name__', 'in', batch).get();
      snap.docs.forEach(doc => {
        const data = doc.data();
        let username = data.username;
        if (!username) {
          const baseName = data.firstName || data.displayName || 'user';
          const base = baseName.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
          const digits = Math.floor(100 + Math.random() * 900);
          username = `${base}${digits}`;
          doc.ref.update({ username, updatedAt: new Date().toISOString() }).catch(() => {});
        }
        results[doc.id] = {
          username: username.trim().toLowerCase(),
          displayName: data.displayName || data.firstName || data.email?.split('@')[0] || 'مستخدم',
          photoURL: data.photoURL || null,
        };
      });
    }

    return NextResponse.json({ users: results });
  } catch (err: any) {
    console.error('[community/batch-usernames] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

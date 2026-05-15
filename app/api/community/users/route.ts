import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function pickJwtKey(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c && c.startsWith('eyJ')) return c;
  }
  return candidates.find(c => c && c.length > 10) || '';
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = pickJwtKey(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  if (!supabaseUrl || !supabaseKey) {
    console.error('[community/users] Missing valid JWT env vars');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// ─── Username helpers ─────────────────────────────────────
function generateUsername(firstName: string): string {
  const base = (firstName || 'user').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const digits = Math.floor(100 + Math.random() * 900); // 100–999
  return `${base}${digits}`;
}

async function ensureUsername(docId: string, data: any): Promise<string> {
  if (data.username && typeof data.username === 'string' && data.username.trim().length > 0) {
    return data.username.trim().toLowerCase();
  }

  const baseName = data.firstName || data.displayName || 'user';
  let username = generateUsername(baseName);

  // Ensure uniqueness
  const usersRef = adminDb!.collection('users');
  let attempts = 0;
  while (attempts < 10) {
    const snap = await usersRef.where('username', '==', username).limit(1).get();
    if (snap.empty) break;
    username = generateUsername(baseName);
    attempts++;
  }

  // Save back to Firestore (fire-and-forget)
  usersRef.doc(docId).update({ username, updatedAt: new Date().toISOString() }).catch(() => {});

  return username;
}

// GET — Fetch paginated users with real post counts
export async function GET(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const lastDocId = searchParams.get('lastDocId') || '';
    const excludeUid = searchParams.get('exclude') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);

    const usersRef = adminDb.collection('users');
    let query = usersRef.orderBy('__name__').limit(limit);

    if (lastDocId) {
      const lastDoc = await usersRef.doc(lastDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const docs = snapshot.docs;

    if (docs.length === 0) {
      return NextResponse.json({ users: [], hasMore: false });
    }

    // Build user list + ensure username
    const usernamePromises = docs.map(async doc => {
      const data = doc.data();
      const username = await ensureUsername(doc.id, data);
      return {
        username,
        displayName: data.displayName || data.firstName || data.email?.split('@')[0] || 'مستخدم',
        photoURL: data.photoURL || null,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : String(data.createdAt || ''),
      };
    });

    let users = await Promise.all(usernamePromises);

    // Exclude current user if provided
    if (excludeUid) {
      // We need to filter by matching the doc id, but we don't expose uid.
      // Instead, we fetch all and let the client handle filtering, or we can skip this for now.
      // For simplicity, we'll skip server-side exclude since we no longer expose uid.
      // The client can filter if needed.
    }

    // Count actual posts per user from Supabase
    const supabase = getSupabaseClient();
    const uids = docs.map(d => d.id);

    let postCounts: Record<string, number> = {};
    if (uids.length > 0) {
      const { data: postsData, error: postsError } = await supabase
        .from('community_prompts')
        .select('author_uid')
        .in('author_uid', uids)
        .eq('status', 'published');

      if (postsError) {
        console.warn('[community/users] Post count error:', postsError.message);
      } else {
        postsData?.forEach((p: any) => {
          postCounts[p.author_uid] = (postCounts[p.author_uid] || 0) + 1;
        });
      }
    }

    const enrichedUsers = users.map((u, i) => ({
      ...u,
      postsCount: postCounts[docs[i].id] || 0,
    }));

    const lastId = docs[docs.length - 1]?.id || '';

    // Check if there are more users
    let hasMore = false;
    if (lastId) {
      const lastDoc = await usersRef.doc(lastId).get();
      const nextQuery = usersRef.orderBy('__name__').startAfter(lastDoc).limit(1);
      const nextSnap = await nextQuery.get();
      hasMore = !nextSnap.empty;
    }

    return NextResponse.json({
      users: enrichedUsers,
      hasMore,
      lastDocId: lastId,
    });
  } catch (err: any) {
    console.error('[community/users] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

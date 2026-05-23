import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { adminDb } from '@/lib/firebase-admin';

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
    console.error('[community/user-posts] Missing valid JWT env vars');
  }
  return createClient(supabaseUrl, supabaseKey);
}

async function getUidByUsername(username: string): Promise<string | null> {
  if (!adminDb) return null;
  try {
    const snap = await adminDb.collection('users').where('username', '==', username).limit(1).get();
    if (!snap.empty) return snap.docs[0].id;
  } catch (fsErr) {
    console.error('⚠️ [Firestore Admin] Error fetching UID by username (quota exceeded or offline):', fsErr);
  }
  return null;
}

// GET — Fetch community posts by username (public, no uid exposed)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.trim().toLowerCase();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    const uid = await getUidByUsername(username);
    if (!uid) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabase = getSupabaseClient();
    const offset = (page - 1) * limit;

    const { data: prompts, count, error } = await supabase
      .from('community_prompts')
      .select('*', { count: 'exact' })
      .eq('author_uid', uid)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[community/user-posts] Query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count || 0;
    return NextResponse.json({
      posts: (prompts || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        prompt_text: p.prompt_text,
        code_snippet: p.code_snippet,
        code_language: p.code_language,
        tags: p.tags,
        post_type: p.post_type,
        link_url: p.link_url,
        link_title: p.link_title,
        ai_model: p.ai_model,
        ai_output: p.ai_output,
        upvotes_count: p.upvotes_count,
        downvotes_count: p.downvotes_count,
        comments_count: p.comments_count,
        remixes_count: p.remixes_count,
        shares_count: p.shares_count,
        votes_count: p.votes_count,
        created_at: p.created_at,
        updated_at: p.updated_at,
        author_username: username,
        author_name: p.author_name || 'مستخدم',
        author_avatar: p.author_avatar || null,
      })),
      total,
      page,
      hasMore: offset + limit < total,
    });
  } catch (err: any) {
    console.error('[community/user-posts] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

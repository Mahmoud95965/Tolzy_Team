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
    console.error('[community/feed] Missing valid JWT env vars');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// ─── Generate username helper ─────────────────────────────
function generateUsername(firstName: string): string {
  const base = (firstName || 'user').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const digits = Math.floor(100 + Math.random() * 900);
  return `${base}${digits}`;
}

async function getUsernamesByUids(uids: string[]): Promise<Record<string, { username: string; photoURL: string | null; displayName: string }>> {
  if (!adminDb || uids.length === 0) return {};
  const map: Record<string, { username: string; photoURL: string | null; displayName: string }> = {};
  const batchSize = 10;
  try {
    for (let i = 0; i < uids.length; i += batchSize) {
      const batch = uids.slice(i, i + batchSize);
      const snap = await adminDb.collection('users').where('__name__', 'in', batch).get();
      snap.docs.forEach(doc => {
        const data = doc.data();
        let username = data.username;
        if (!username) {
          const baseName = data.firstName || data.displayName || 'user';
          username = generateUsername(baseName);
          doc.ref.update({ username, updatedAt: new Date().toISOString() }).catch(() => {});
        }
        map[doc.id] = {
          username: username.trim().toLowerCase(),
          photoURL: data.photoURL || null,
          displayName: data.displayName || data.firstName || data.email?.split('@')[0] || 'مستخدم',
        };
      });
    }
  } catch (fsErr) {
    console.error('⚠️ [Firestore Admin] Failed to fetch usernames by UIDs (using fallback):', fsErr);
    // Populate the map with graceful default templates so the feed still loads correctly!
    uids.forEach(uid => {
      map[uid] = {
        username: `user_${uid.substring(0, 5)}`,
        photoURL: null,
        displayName: 'مستخدم',
      };
    });
  }
  return map;
}

// GET — Fetch community feed with sorting and filtering
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'trending';
    const tag = searchParams.get('tag') || '';
    const postType = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const authorUid = searchParams.get('author') || '';

    const offset = (page - 1) * limit;

    // Determine sort column
    let orderCol = 'engagement_score';
    if (sort === 'latest') orderCol = 'created_at';
    else if (sort === 'top') orderCol = 'upvotes_count';
    else if (sort === 'most_remixed') orderCol = 'remixes_count';

    // Build query — try with preferred sort, fallback to created_at
    let query = supabase
      .from('community_prompts')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order(orderCol, { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (authorUid) query = query.eq('author_uid', authorUid);
    if (postType) query = query.eq('post_type', postType);

    let { data: prompts, count, error } = await query;

    // If the preferred sort column doesn't exist, retry with created_at
    if (error && (error.message?.includes(orderCol) || error.code === '42703')) {
      console.error(`[community/feed] Sort column '${orderCol}' not found, falling back to created_at`);
      let fallbackQuery = supabase
        .from('community_prompts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (authorUid) fallbackQuery = fallbackQuery.eq('author_uid', authorUid);
      if (postType) fallbackQuery = fallbackQuery.eq('post_type', postType);

      const fallback = await fallbackQuery;
      prompts = fallback.data;
      count = fallback.count;
      error = fallback.error;
    }

    if (error) {
      console.error('[community/feed] Query error:', error.message, '| code:', error.code);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }


    const promptIds = (prompts || []).map((p: any) => p.id);
    let enrichedPrompts = prompts || [];

    if (promptIds.length > 0) {
      // ── 1. Fetch real vote counts from prompt_votes ──
      const { data: votesData } = await supabase
        .from('prompt_votes')
        .select('prompt_id, vote_type')
        .in('prompt_id', promptIds);

      // Build votes map: { [prompt_id]: { up: number, down: number } }
      const votesMap: Record<string, { up: number; down: number }> = {};
      (votesData || []).forEach((v: any) => {
        if (!votesMap[v.prompt_id]) votesMap[v.prompt_id] = { up: 0, down: 0 };
        if (v.vote_type === 'up') votesMap[v.prompt_id].up++;
        else if (v.vote_type === 'down') votesMap[v.prompt_id].down++;
      });

      // ── 2. Fetch tags ──
      const { data: tagMaps, error: tagError } = await supabase
        .from('prompt_tag_map')
        .select('prompt_id, tag_id, prompt_tags(*)')
        .in('prompt_id', promptIds);

      if (tagError) {
        console.warn('[community/feed] Tag fetch warning:', tagError.message);
      }

      const tagsByPrompt: Record<string, any[]> = {};
      if (tagMaps) {
        tagMaps.forEach((tm: any) => {
          if (!tagsByPrompt[tm.prompt_id]) tagsByPrompt[tm.prompt_id] = [];
          if (tm.prompt_tags) tagsByPrompt[tm.prompt_id].push(tm.prompt_tags);
        });
      }

      // ── 3. Enrich prompts with real vote counts + tags ──
      enrichedPrompts = (prompts || []).map((p: any) => {
        const realVotes = votesMap[p.id] || { up: 0, down: 0 };
        const realUpvotes = realVotes.up;
        const realDownvotes = realVotes.down;

        // Sync stored counts if they differ (non-blocking)
        if (p.upvotes_count !== realUpvotes || p.downvotes_count !== realDownvotes) {
          supabase
            .from('community_prompts')
            .update({ upvotes_count: realUpvotes, downvotes_count: realDownvotes })
            .eq('id', p.id)
            .then(() => {/* fire & forget */});
        }

        return {
          ...p,
          upvotes_count: realUpvotes,
          downvotes_count: realDownvotes,
          tags: tagsByPrompt[p.id] || [],
        };
      });

      // ── 4. Filter by tag if specified ──
      if (tag) {
        const { data: tagData } = await supabase
          .from('prompt_tags')
          .select('id')
          .eq('slug', tag)
          .single();

        if (tagData) {
          const { data: filteredMaps } = await supabase
            .from('prompt_tag_map')
            .select('prompt_id')
            .eq('tag_id', tagData.id)
            .in('prompt_id', promptIds);

          const filteredIds = new Set((filteredMaps || []).map((m: any) => m.prompt_id));
          enrichedPrompts = enrichedPrompts.filter((p: any) => filteredIds.has(p.id));
        }
      }
    }

    // ── 5. Fetch usernames from Firestore ──
    const uniqueUids = Array.from(new Set((enrichedPrompts || []).map((p: any) => p.author_uid).filter(Boolean)));
    const userMap = await getUsernamesByUids(uniqueUids);

    const securePrompts = (enrichedPrompts || []).map((p: any) => {
      const u = userMap[p.author_uid];
      return {
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
        status: p.status,
        created_at: p.created_at,
        updated_at: p.updated_at,
        engagement_score: p.engagement_score,
        // Public author fields only — no uid
        author_username: u?.username || '',
        author_name: u?.displayName || p.author_name || 'مستخدم',
        author_avatar: u?.photoURL || p.author_avatar || null,
      };
    });

    const total = count || 0;
    return NextResponse.json({
      prompts: securePrompts,
      total,
      page,
      hasMore: offset + limit < total,
    });
  } catch (err: any) {
    console.error('[community/feed] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

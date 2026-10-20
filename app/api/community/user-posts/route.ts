import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { adminDb } from '@/lib/firebase-admin';
import { extractMetadataFromText } from '@/src/utils/stackAndPollHelpers';
import { extractMentionedToolSlugs } from '@/src/utils/toolMention';

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
  return createClient(supabaseUrl, supabaseKey);
}

async function resolveUidFromIdentifier(identifier: string): Promise<string | null> {
  if (!adminDb || !identifier) return null;
  const lower = identifier.toLowerCase();
  try {
    // 1. By username
    const snap = await adminDb.collection('users').where('username', '==', lower).limit(1).get();
    if (!snap.empty) return snap.docs[0].id;

    // 2. Direct document ID
    const docSnap = await adminDb.collection('users').doc(identifier).get();
    if (docSnap.exists) return docSnap.id;

    // 3. By uid field
    const uidSnap = await adminDb.collection('users').where('uid', '==', identifier).limit(1).get();
    if (!uidSnap.empty) return uidSnap.docs[0].id;
  } catch (fsErr) {
    console.warn('⚠️ [Firestore Admin] Error resolving UID for posts:', fsErr);
  }
  return null;
}

// GET — Fetch community posts by user identifier (username, id, or uid)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTarget =
      searchParams.get('id') ||
      searchParams.get('username') ||
      searchParams.get('uid') ||
      '';

    const target = decodeURIComponent(rawTarget).trim();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 100);

    if (!target) {
      return NextResponse.json({ error: 'Missing user identifier' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const offset = (page - 1) * limit;

    // Resolve UID if available
    const resolvedUid = await resolveUidFromIdentifier(target);
    const lowerTarget = target.toLowerCase();

    // Query Supabase with multi-tier fallback
    let prompts: any[] = [];
    let count = 0;

    // Try 1: By resolved UID
    if (resolvedUid) {
      const res = await supabase
        .from('community_prompts')
        .select('*', { count: 'exact' })
        .eq('author_uid', resolvedUid)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!res.error && res.data && res.data.length > 0) {
        prompts = res.data;
        count = res.count || res.data.length;
      }
    }

    // Try 2: By author_username
    if (prompts.length === 0) {
      const res = await supabase
        .from('community_prompts')
        .select('*', { count: 'exact' })
        .eq('author_username', lowerTarget)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!res.error && res.data && res.data.length > 0) {
        prompts = res.data;
        count = res.count || res.data.length;
      }
    }

    // Try 3: By author_name (exact match or display name)
    if (prompts.length === 0) {
      const res = await supabase
        .from('community_prompts')
        .select('*', { count: 'exact' })
        .eq('author_name', target)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!res.error && res.data && res.data.length > 0) {
        prompts = res.data;
        count = res.count || res.data.length;
      }
    }

    // Try 4: By author_uid directly matching target
    if (prompts.length === 0 && target.length > 10) {
      const res = await supabase
        .from('community_prompts')
        .select('*', { count: 'exact' })
        .eq('author_uid', target)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!res.error && res.data && res.data.length > 0) {
        prompts = res.data;
        count = res.count || res.data.length;
      }
    }

    // If still no prompts, return empty list gracefully (never 404!)
    if (prompts.length === 0) {
      return NextResponse.json({
        posts: [],
        total: 0,
        page,
        hasMore: false,
      });
    }

    const promptIds = prompts.map(p => p.id);

    // Fetch tags for these prompts
    const { data: tagMaps } = await supabase
      .from('prompt_tag_map')
      .select('prompt_id, tag_id, prompt_tags(*)')
      .in('prompt_id', promptIds);

    const tagsByPrompt: Record<string, any[]> = {};
    if (tagMaps) {
      tagMaps.forEach((tm: any) => {
        if (!tagsByPrompt[tm.prompt_id]) tagsByPrompt[tm.prompt_id] = [];
        if (tm.prompt_tags) tagsByPrompt[tm.prompt_id].push(tm.prompt_tags);
      });
    }

    // Format and enrich each post
    const securePosts = prompts.map((p: any) => {
      // Unpack stack_tools and poll from embedded metadata if DB column was empty
      const {
        stack_tools: unpackedStack,
        poll: unpackedPoll,
        cleanText,
      } = extractMetadataFromText(p.description, p.prompt_text);

      const stackTools = p.stack_tools && Array.isArray(p.stack_tools) && p.stack_tools.length > 0
        ? p.stack_tools
        : unpackedStack || null;

      const pollData = p.poll && p.poll.options && p.poll.options.length > 0
        ? p.poll
        : unpackedPoll || null;

      // Unpack mentioned tools
      const extractedSlugs = extractMentionedToolSlugs(p.description || p.prompt_text || '');
      const mentionedTools = Array.isArray(p.mentioned_tools) && p.mentioned_tools.length > 0
        ? Array.from(new Set([...p.mentioned_tools, ...extractedSlugs]))
        : Array.from(new Set(extractedSlugs));

      const typeMatch = (p.description || '').match(/<!-- TOLZY_ORIGINAL_POST_TYPE: (.*?) -->/);
      const postType = typeMatch?.[1] || (pollData ? 'poll' : (stackTools && stackTools.length > 0 ? 'stack' : p.post_type || 'prompt'));

      return {
        id: p.id,
        title: p.title || '',
        prompt_text: cleanText || p.prompt_text || '',
        description: cleanText || p.description || '',
        code_snippet: p.code_snippet || null,
        code_language: p.code_language || null,
        tags: tagsByPrompt[p.id] || p.tags || [],
        post_type: postType,
        link_url: p.link_url || null,
        link_title: p.link_title || null,
        ai_model: p.ai_model || null,
        ai_output: p.ai_output || null,
        upvotes_count: p.upvotes_count || 0,
        downvotes_count: p.downvotes_count || 0,
        comments_count: p.comments_count || 0,
        remixes_count: p.remixes_count || 0,
        shares_count: p.shares_count || 0,
        votes_count: p.votes_count || 0,
        created_at: p.created_at,
        updated_at: p.updated_at,
        mentioned_tools: mentionedTools,
        stack_tools: stackTools,
        poll: pollData,
        author_uid: p.author_uid || '',
        author_username: p.author_username || lowerTarget,
        author_name: p.author_name || target,
        author_avatar: p.author_avatar || null,
      };
    });

    const total = count || securePosts.length;
    return NextResponse.json({
      posts: securePosts,
      total,
      page,
      hasMore: offset + limit < total,
    });
  } catch (err: any) {
    console.error('[community/user-posts] Unhandled exception:', err);
    return NextResponse.json({
      posts: [],
      total: 0,
      page: 1,
      hasMore: false,
    });
  }
}

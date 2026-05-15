import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    console.error('[community/prompts/vote] Missing valid JWT env vars. Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('SUPA')));
  }
  return createClient(supabaseUrl, supabaseKey);
}

// POST — Vote (upvote/downvote) on a prompt
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { prompt_id, user_uid, user_name, vote_type } = await req.json();

    if (!prompt_id || !user_uid || !['up', 'down'].includes(vote_type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Check existing vote
    const { data: existing } = await supabase
      .from('prompt_votes')
      .select('*')
      .eq('prompt_id', prompt_id)
      .eq('user_uid', user_uid)
      .single();

    const { data: prompt, error } = await supabase
      .from('community_prompts')
      .select('upvotes_count, downvotes_count, author_uid, prompt_text')
      .eq('id', prompt_id)
      .single();

    if (error) console.error('Supabase error fetching prompt:', error);
    if (!prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

    let upvotes = prompt.upvotes_count;
    let downvotes = prompt.downvotes_count;
    let action: string;

    if (existing) {
      if (existing.vote_type === vote_type) {
        // Remove vote (toggle off)
        await supabase.from('prompt_votes').delete().eq('id', existing.id);
        if (vote_type === 'up') upvotes = Math.max(0, upvotes - 1);
        else downvotes = Math.max(0, downvotes - 1);
        action = 'removed';
      } else {
        // Change vote
        await supabase.from('prompt_votes').update({ vote_type }).eq('id', existing.id);
        if (vote_type === 'up') { upvotes += 1; downvotes = Math.max(0, downvotes - 1); }
        else { downvotes += 1; upvotes = Math.max(0, upvotes - 1); }
        action = 'changed';
      }
    } else {
      // New vote
      await supabase.from('prompt_votes').insert({ prompt_id, user_uid, vote_type });
      if (vote_type === 'up') {
        upvotes += 1;
        // ─── Insert Notification ───
        if (user_uid !== prompt.author_uid) {
          const previewText = prompt.prompt_text || 'منشورك';
          const preview = previewText.substring(0, 50) + (previewText.length > 50 ? '...' : '');
          await supabase.from('notifications').insert({
            recipient_uid: prompt.author_uid,
            actor_uid: user_uid,
            actor_name: user_name || 'مستخدم',
            type: 'like',
            post_id: prompt_id,
            post_preview: preview,
            is_read: false
          });
        }
      } else {
        downvotes += 1;
      }
      action = 'voted';
    }

    await supabase
      .from('community_prompts')
      .update({ upvotes_count: upvotes, downvotes_count: downvotes })
      .eq('id', prompt_id);

    return NextResponse.json({ success: true, action, upvotes, downvotes });
  } catch (err: any) {
    console.error('[community/prompts/vote] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

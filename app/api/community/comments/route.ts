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
    console.error('[community/comments] Missing valid JWT env vars.');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// GET — Fetch all comments for a prompt
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get('prompt_id');

    if (!promptId) {
      return NextResponse.json({ error: 'Missing prompt_id' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('prompt_comments')
      .select('*')
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[community/comments] Fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('[community/comments] GET exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST — Add a comment to a prompt
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt_id, author_uid, author_name, author_avatar, content } = body;

    if (!prompt_id || !author_uid || !author_name || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. Insert comment
    const { data: comment, error: insertError } = await supabase
      .from('prompt_comments')
      .insert({
        prompt_id,
        author_uid,
        author_name,
        author_avatar,
        content: content.trim()
      })
      .select()
      .single();

    if (insertError) {
      console.error('[community/comments] Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 2. Fetch prompt details to update count and send notification
    const { data: prompt } = await supabase
      .from('community_prompts')
      .select('comments_count, author_uid, prompt_text')
      .eq('id', prompt_id)
      .single();

    if (prompt) {
      // Increment count
      const newCount = (prompt.comments_count || 0) + 1;
      await supabase
        .from('community_prompts')
        .update({ comments_count: newCount })
        .eq('id', prompt_id);

      // Create notification if commenter is not the prompt author
      if (author_uid !== prompt.author_uid) {
        const previewText = prompt.prompt_text || 'منشورك';
        const preview = previewText.substring(0, 50) + (previewText.length > 50 ? '...' : '');
        try {
          await supabase
            .from('notifications')
            .insert({
              recipient_uid: prompt.author_uid,
              actor_uid: author_uid,
              actor_name: author_name,
              type: 'comment',
              post_id: prompt_id,
              post_preview: preview,
              is_read: false
            });
        } catch (e: any) {
          console.error('[community/comments] Notification warning:', e);
        }
      }
    }

    return NextResponse.json({ success: true, data: comment });
  } catch (err: any) {
    console.error('[community/comments] POST exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PATCH — Edit a comment (only by owner)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, author_uid, content } = body;

    if (!id || !author_uid || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Verify ownership before editing
    const { data: existing } = await supabase
      .from('prompt_comments')
      .select('author_uid')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existing.author_uid !== author_uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: updatedComment, error: updateError } = await supabase
      .from('prompt_comments')
      .update({ content: content.trim() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[community/comments] Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedComment });
  } catch (err: any) {
    console.error('[community/comments] PATCH exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE — Delete a comment (only by owner)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');
    const promptId = searchParams.get('prompt_id');
    const authorUid = searchParams.get('author_uid');

    if (!commentId || !promptId || !authorUid) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Verify ownership before deleting
    const { data: existing } = await supabase
      .from('prompt_comments')
      .select('author_uid')
      .eq('id', commentId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existing.author_uid !== authorUid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('prompt_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('[community/comments] Delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Decrement count
    const { data: prompt } = await supabase
      .from('community_prompts')
      .select('comments_count')
      .eq('id', promptId)
      .single();

    if (prompt) {
      const newCount = Math.max(0, (prompt.comments_count || 0) - 1);
      await supabase
        .from('community_prompts')
        .update({ comments_count: newCount })
        .eq('id', promptId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[community/comments] DELETE exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

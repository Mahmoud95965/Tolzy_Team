import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function pickJwtKey(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c && c.startsWith('eyJ')) return c; // valid JWT header
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
    console.error('[community/prompts] Missing valid JWT env vars. Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('SUPA')));
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Map custom/extended post_types to allowed Postgres check constraint values ('prompt', 'resource', 'idea', 'question', 'code')
function sanitizeDbPostType(type: string): string {
  if (type === 'poll') return 'question';
  if (type === 'stack') return 'resource';
  if (type === 'workflow') return 'prompt';
  const allowed = ['prompt', 'resource', 'idea', 'question', 'code'];
  return allowed.includes(type) ? type : 'prompt';
}

// POST — Create new prompt
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      post_type,
      title,
      prompt_text,
      ai_output,
      ai_model,
      description,
      code_snippet,
      code_language,
      link_url,
      tag_slugs,
      mentioned_tools,
      stack_tools,
      poll,
      author_uid,
      author_name,
      author_avatar,
    } = body;

    if (!prompt_text || !author_uid || !author_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      console.error('[community/prompts] Missing Supabase configuration. URL present?', !!supabaseUrl, 'Key present?', !!supabaseKey);
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Extract mentioned tools if not provided in array
    const MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const extractedSlugs: string[] = [];
    let match;
    while ((match = MENTION_REGEX.exec(prompt_text)) !== null) {
      if (match[2]) extractedSlugs.push(match[2]);
    }

    // If it's a tech stack, also include stack tool IDs into mentioned_tools for unified discovery
    if (Array.isArray(stack_tools)) {
      stack_tools.forEach((st: any) => {
        if (st.tool_id) extractedSlugs.push(st.tool_id);
      });
    }

    const finalMentionedTools = Array.from(new Set([...(mentioned_tools || []), ...extractedSlugs]));

    // Embed metadata inside description as resilient backup
    let encodedDesc = description || prompt_text;
    if (post_type) {
      encodedDesc += `\n\n<!-- TOLZY_ORIGINAL_POST_TYPE: ${post_type} -->`;
    }
    if (Array.isArray(stack_tools) && stack_tools.length > 0) {
      encodedDesc += `\n\n<!-- TOLZY_STACK_DATA: ${encodeURIComponent(JSON.stringify(stack_tools))} -->`;
    }
    if (poll && Array.isArray(poll.options) && poll.options.length > 0) {
      encodedDesc += `\n\n<!-- TOLZY_POLL_DATA: ${encodeURIComponent(JSON.stringify(poll))} -->`;
    }

    // Create post (try with full schema, fallback if columns missing)
    let insertPayload: any = {
      post_type: sanitizeDbPostType(post_type || 'prompt'),
      status: 'published',
      title: title || '',
      prompt_text,
      ai_output: ai_output || null,
      ai_model: ai_model || null,
      description: encodedDesc,
      code_snippet: code_snippet || null,
      code_language: code_language || null,
      link_url: link_url || null,
      author_uid,
      author_name,
      author_avatar: author_avatar || null,
      mentioned_tools: finalMentionedTools,
      stack_tools: stack_tools || null,
      poll: poll || null,
    };

    // Resilient insert: Try full payload, automatically strip any columns not present in Supabase schema cache
    let prompt: any = null;
    let insertError: any = null;

    for (let attempt = 0; attempt < 6; attempt++) {
      const res = await supabase
        .from('community_prompts')
        .insert(insertPayload)
        .select()
        .single();

      if (!res.error && res.data) {
        prompt = res.data;
        insertError = null;
        break;
      }

      insertError = res.error;
      const errorMsg = insertError?.message || '';

      // Pattern 1: PostgREST PGRST204 "Could not find the 'xyz' column of 'community_prompts' in the schema cache"
      const match = errorMsg.match(/Could not find the '([^']+)' column/i);
      if (match && match[1]) {
        const missingCol = match[1];
        console.warn(`[community/prompts] Column '${missingCol}' missing in schema cache, stripping and retrying`);
        delete insertPayload[missingCol];
        continue;
      }

      // Pattern 2: Explicit known extra columns fallback
      if (errorMsg.includes('poll')) {
        delete insertPayload.poll;
        continue;
      }
      if (errorMsg.includes('stack_tools')) {
        delete insertPayload.stack_tools;
        continue;
      }
      if (errorMsg.includes('mentioned_tools')) {
        delete insertPayload.mentioned_tools;
        continue;
      }
      if (errorMsg.includes('post_type')) {
        delete insertPayload.post_type;
        continue;
      }

      // If error is unrelated to missing columns, break and return it
      break;
    }

    if (prompt) {
      prompt.post_type = post_type || prompt.post_type || 'prompt';
      if (!prompt.mentioned_tools) prompt.mentioned_tools = finalMentionedTools;
      if (!prompt.stack_tools && stack_tools) prompt.stack_tools = stack_tools;
      if (!prompt.poll && poll) prompt.poll = poll;
    }

    if (insertError) {
      console.error('[community/prompts] Insert error:', insertError.message, insertError.details, insertError.hint);
      return NextResponse.json({ error: insertError.message, details: insertError.details }, { status: 500 });
    }

    if (!prompt || !prompt.id) {
      console.error('[community/prompts] Insert succeeded but no prompt data returned');
      return NextResponse.json({ error: 'Failed to create prompt — no data returned' }, { status: 500 });
    }

    // Create initial version (non-blocking — log but don't fail the request)
    const { error: versionError } = await supabase.from('prompt_versions').insert({
      prompt_id: prompt.id,
      version_number: 1,
      prompt_text,
      ai_output: ai_output || null,
      change_summary: 'النسخة الأصلية',
      author_uid,
    });

    if (versionError) {
      console.warn('[community/prompts] Version insert warning:', versionError.message);
    }

    // Map tags (non-blocking — log but don't fail the request)
    if (tag_slugs && tag_slugs.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from('prompt_tags')
        .select('id')
        .in('slug', tag_slugs);

      if (tagsError) {
        console.warn('[community/prompts] Tag lookup warning:', tagsError.message);
      }

      if (tags && tags.length > 0) {
        const { error: mapError } = await supabase.from('prompt_tag_map').insert(
          tags.map((t: any) => ({ prompt_id: prompt.id, tag_id: t.id }))
        );
        if (mapError) {
          console.warn('[community/prompts] Tag map insert warning:', mapError.message);
        }
      }
    }

    return NextResponse.json({ success: true, prompt }, { status: 201 });
  } catch (err: any) {
    console.error('[community/prompts] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE — Delete a prompt (only by its owner)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get('id');
    const authorUid = searchParams.get('author_uid');

    if (!promptId || !authorUid) {
      return NextResponse.json({ error: 'Missing prompt id or author_uid' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Verify ownership before deleting
    const { data: existing, error: fetchError } = await supabase
      .from('community_prompts')
      .select('id, author_uid')
      .eq('id', promptId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    if (existing.author_uid !== authorUid) {
      return NextResponse.json({ error: 'Unauthorized: you are not the owner' }, { status: 403 });
    }

    // Delete related records first (cascade)
    await Promise.allSettled([
      supabase.from('prompt_comments').delete().eq('prompt_id', promptId),
      supabase.from('prompt_votes').delete().eq('prompt_id', promptId),
      supabase.from('prompt_saves').delete().eq('prompt_id', promptId),
      supabase.from('prompt_tag_map').delete().eq('prompt_id', promptId),
      supabase.from('prompt_versions').delete().eq('prompt_id', promptId),
      supabase.from('prompt_relations').delete().eq('parent_id', promptId),
      supabase.from('prompt_relations').delete().eq('child_id', promptId),
    ]);

    // Delete the prompt itself
    const { error: deleteError } = await supabase
      .from('community_prompts')
      .delete()
      .eq('id', promptId)
      .eq('author_uid', authorUid);

    if (deleteError) {
      console.error('[community/prompts] Delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[community/prompts] Delete unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}


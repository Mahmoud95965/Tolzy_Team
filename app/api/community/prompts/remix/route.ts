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
    console.error('[community/prompts/remix] Missing valid JWT env vars. Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('SUPA')));
  }
  return createClient(supabaseUrl, supabaseKey);
}

// POST — Remix an existing prompt
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { parent_prompt_id, title, prompt_text, ai_output, ai_model, description, tag_slugs, change_summary, author_uid, author_name, author_avatar } = body;

    if (!parent_prompt_id || !prompt_text || !author_uid || !author_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get parent
    const { data: parent } = await supabase
      .from('community_prompts')
      .select('id, remix_depth, remixes_count')
      .eq('id', parent_prompt_id)
      .single();

    if (!parent) return NextResponse.json({ error: 'Parent prompt not found' }, { status: 404 });

    // Create remixed prompt
    const { data: prompt, error: insertError } = await supabase
      .from('community_prompts')
      .insert({
        title: title || '',
        prompt_text,
        ai_output: ai_output || null,
        ai_model: ai_model || null,
        description: description || null,
        author_uid,
        author_name,
        author_avatar: author_avatar || null,
        parent_prompt_id,
        remix_depth: (parent.remix_depth || 0) + 1,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[community/prompts/remix] Insert error:', insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (!prompt || !prompt.id) {
      console.error('[community/prompts/remix] Insert succeeded but no prompt data returned');
      return NextResponse.json({ error: 'Failed to create remix — no data returned' }, { status: 500 });
    }

    // Create relation (non-blocking — log but don't fail)
    const { error: relError } = await supabase.from('prompt_relations').insert({
      parent_id: parent_prompt_id,
      child_id: prompt.id,
      relation_type: 'remix',
    });
    if (relError) console.warn('[community/prompts/remix] Relation insert warning:', relError.message);

    // Create version (non-blocking — log but don't fail)
    const { error: verError } = await supabase.from('prompt_versions').insert({
      prompt_id: prompt.id,
      version_number: 1,
      prompt_text,
      ai_output: ai_output || null,
      change_summary: change_summary || 'ريمكس',
      author_uid,
    });
    if (verError) console.warn('[community/prompts/remix] Version insert warning:', verError.message);

    // Update parent remix count
    await supabase
      .from('community_prompts')
      .update({ remixes_count: (parent.remixes_count || 0) + 1 })
      .eq('id', parent_prompt_id);

    // Map tags (non-blocking — log but don't fail)
    if (tag_slugs && tag_slugs.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from('prompt_tags')
        .select('id')
        .in('slug', tag_slugs);

      if (tagsError) console.warn('[community/prompts/remix] Tag lookup warning:', tagsError.message);

      if (tags && tags.length > 0) {
        const { error: mapError } = await supabase.from('prompt_tag_map').insert(
          tags.map((t: any) => ({ prompt_id: prompt.id, tag_id: t.id }))
        );
        if (mapError) console.warn('[community/prompts/remix] Tag map insert warning:', mapError.message);
      }
    }

    return NextResponse.json({ success: true, prompt }, { status: 201 });
  } catch (err: any) {
    console.error('[community/prompts/remix] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

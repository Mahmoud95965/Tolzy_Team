import { NextRequest, NextResponse } from 'next/server';
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
    console.error('[community/tags] Missing valid JWT env vars');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// GET — Get all available tags
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('prompt_tags')
      .select('*')
      .order('label_ar');

    if (error) {
      console.error('[community/tags] Query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count prompts per tag
    const { data: tagMaps, error: tagMapError } = await supabase
      .from('prompt_tag_map')
      .select('tag_id');

    if (tagMapError) {
      console.warn('[community/tags] Tag map warning:', tagMapError.message);
    }

    const tagCounts: Record<string, number> = {};
    (tagMaps || []).forEach((tm: any) => {
      tagCounts[tm.tag_id] = (tagCounts[tm.tag_id] || 0) + 1;
    });

    const tagsWithCounts = (data || []).map((tag: any) => ({
      ...tag,
      prompts_count: tagCounts[tag.id] || 0,
    }));

    return NextResponse.json({ tags: tagsWithCounts });
  } catch (err: any) {
    console.error('[community/tags] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

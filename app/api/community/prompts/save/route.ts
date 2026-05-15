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
    console.error('[community/prompts/save] Missing valid JWT env vars. Available keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('SUPA')));
  }
  return createClient(supabaseUrl, supabaseKey);
}

// POST — Toggle save/bookmark on a prompt
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { prompt_id, user_uid } = await req.json();

    if (!prompt_id || !user_uid) {
      return NextResponse.json({ error: 'Missing prompt_id or user_uid' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('prompt_saves')
      .select('id')
      .eq('prompt_id', prompt_id)
      .eq('user_uid', user_uid)
      .single();

    const { data: prompt } = await supabase
      .from('community_prompts')
      .select('saves_count')
      .eq('id', prompt_id)
      .single();

    if (!prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

    if (existing) {
      await supabase.from('prompt_saves').delete().eq('id', existing.id);
      const newCount = Math.max(0, prompt.saves_count - 1);
      await supabase.from('community_prompts').update({ saves_count: newCount }).eq('id', prompt_id);
      return NextResponse.json({ success: true, saved: false, saves_count: newCount });
    } else {
      await supabase.from('prompt_saves').insert({ prompt_id, user_uid });
      const newCount = prompt.saves_count + 1;
      await supabase.from('community_prompts').update({ saves_count: newCount }).eq('id', prompt_id);
      return NextResponse.json({ success: true, saved: true, saves_count: newCount });
    }
  } catch (err: any) {
    console.error('[community/prompts/save] Unhandled exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(url, key);
}

/**
 * GET /api/community/user-state?user_uid=xxx&prompt_ids=id1,id2,...
 * Returns: { votes: { [promptId]: 'up'|'down' }, saves: string[] }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userUid = searchParams.get('user_uid') || '';
    const promptIdsRaw = searchParams.get('prompt_ids') || '';

    if (!userUid || !promptIdsRaw) {
      return NextResponse.json({ votes: {}, saves: [] });
    }

    const promptIds = promptIdsRaw.split(',').filter(Boolean);
    if (promptIds.length === 0) {
      return NextResponse.json({ votes: {}, saves: [] });
    }

    const supabase = getSupabaseAdmin();

    // Fetch votes
    const { data: votesData, error: votesError } = await supabase
      .from('prompt_votes')
      .select('prompt_id, vote_type')
      .eq('user_uid', userUid)
      .in('prompt_id', promptIds);

    if (votesError) {
      console.error('[community/user-state] votes error:', votesError.message);
    }

    const votes: Record<string, 'up' | 'down'> = {};
    (votesData || []).forEach((v: any) => {
      votes[v.prompt_id] = v.vote_type;
    });

    // Fetch saves
    const { data: savesData, error: savesError } = await supabase
      .from('prompt_saves')
      .select('prompt_id')
      .eq('user_uid', userUid)
      .in('prompt_id', promptIds);

    if (savesError) {
      console.error('[community/user-state] saves error:', savesError.message);
    }

    const saves = (savesData || []).map((s: any) => s.prompt_id);

    return NextResponse.json({ votes, saves });
  } catch (err: any) {
    console.error('[community/user-state] unhandled:', err);
    return NextResponse.json({ votes: {}, saves: [] }, { status: 500 });
  }
}

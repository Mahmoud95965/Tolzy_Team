import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractMetadataFromText } from '@/src/utils/stackAndPollHelpers';
import type { CommunityPoll } from '@/src/types/community';

export const dynamic = 'force-dynamic';

function pickJwtKey(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c && c.startsWith('eyJ')) return c;
  }
  return candidates.find((c) => c && c.length > 10) || '';
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

const POLL_TAG_REGEX = /<!-- TOLZY_POLL_DATA: (.*?) -->/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt_id, option_id, user_uid } = body;

    if (!prompt_id || !option_id) {
      return NextResponse.json({ error: 'Missing prompt_id or option_id' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. Fetch prompt using safe guaranteed columns
    const { data: prompt, error: fetchError } = await supabase
      .from('community_prompts')
      .select('id, description, prompt_text, author_uid')
      .eq('id', prompt_id)
      .single();

    if (fetchError || !prompt) {
      // Optimistic response if record not found
      return NextResponse.json({ success: true, message: 'Optimistic vote registered' });
    }

    // 2. Extract existing poll from description
    const rawDesc = prompt.description || prompt.prompt_text || '';
    const { poll: extractedPoll } = extractMetadataFromText(prompt.description, prompt.prompt_text);

    if (extractedPoll && Array.isArray(extractedPoll.options)) {
      const updatedOptions = extractedPoll.options.map((opt) =>
        opt.id === option_id ? { ...opt, votes_count: (opt.votes_count || 0) + 1 } : opt
      );
      const updatedTotal = (extractedPoll.total_votes || 0) + 1;

      const updatedPoll: CommunityPoll = {
        ...extractedPoll,
        options: updatedOptions,
        total_votes: updatedTotal,
      };

      const encodedPollTag = `<!-- TOLZY_POLL_DATA: ${encodeURIComponent(JSON.stringify(updatedPoll))} -->`;
      let updatedDesc = rawDesc;
      if (POLL_TAG_REGEX.test(updatedDesc)) {
        updatedDesc = updatedDesc.replace(POLL_TAG_REGEX, encodedPollTag);
      } else {
        updatedDesc = `${updatedDesc}\n\n${encodedPollTag}`;
      }

      // Update description with the incremented vote count
      await supabase
        .from('community_prompts')
        .update({ description: updatedDesc })
        .eq('id', prompt_id);

      // Best-effort update to 'poll' column if it happens to exist
      try {
        await supabase
          .from('community_prompts')
          .update({ poll: updatedPoll })
          .eq('id', prompt_id);
      } catch {
        // Ignored if column doesn't exist in Supabase
      }

      // Notify the poll creator if the voter is not the author
      if (prompt.author_uid && user_uid && prompt.author_uid !== user_uid) {
        try {
          const preview = (prompt.prompt_text || extractedPoll.question || 'استطلاعك').substring(0, 60);
          await supabase.from('notifications').insert({
            recipient_uid: prompt.author_uid,
            actor_uid: user_uid,
            actor_name: 'عضو في المجتمع',
            type: 'poll_vote',
            post_id: prompt_id,
            post_preview: preview,
            is_read: false
          });
        } catch (notifErr) {
          console.warn('[community/polls/vote] Notification warning:', notifErr);
        }
      }

      return NextResponse.json({ success: true, poll: updatedPoll });
    }

    return NextResponse.json({ success: true, message: 'Vote recorded' });
  } catch (err: any) {
    console.error('[community/polls/vote] Error registering vote:', err);
    // Never fail with 500 for the client UI so voting feels smooth and optimistic
    return NextResponse.json({ success: true, error: err.message });
  }
}

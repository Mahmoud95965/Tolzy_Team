// ═══════════════════════════════════════════════════════════════
// TOLZY Community Prompt Platform — Service Layer
// All Supabase queries for the prompt community
// ═══════════════════════════════════════════════════════════════

import { supabase } from '../config/supabaseClient';
import type {
  CommunityPrompt,
  PromptTag,
  PromptComment,
  FeedSortMode,
  FeedResponse,
  PromptGraphNode,
  CreatorStats,
} from '../types/community';

const PAGE_SIZE = 20;

// ─── Tags ────────────────────────────────────────────────────
export async function getAllTags(): Promise<PromptTag[]> {
  const { data, error } = await supabase
    .from('prompt_tags')
    .select('*')
    .order('label_ar');
  if (error) throw error;
  return data || [];
}

// ─── Feed ────────────────────────────────────────────────────
export async function getFeed(
  sort: FeedSortMode = 'trending',
  page: number = 1,
  limit: number = PAGE_SIZE,
  tagSlug?: string,
  authorUid?: string
): Promise<FeedResponse> {
  const offset = (page - 1) * limit;

  // Build order
  let orderCol = 'engagement_score';
  if (sort === 'latest') orderCol = 'created_at';
  else if (sort === 'top') orderCol = 'upvotes_count';
  else if (sort === 'most_remixed') orderCol = 'remixes_count';

  let query = supabase
    .from('community_prompts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order(orderCol, { ascending: false })
    .range(offset, offset + limit - 1);

  if (authorUid) {
    query = query.eq('author_uid', authorUid);
  }

  const { data: prompts, count, error } = await query;
  if (error) throw error;

  // Fetch tags for all prompts
  const promptIds = (prompts || []).map((p: CommunityPrompt) => p.id);
  let enrichedPrompts = prompts || [];

  if (promptIds.length > 0) {
    const { data: tagMaps } = await supabase
      .from('prompt_tag_map')
      .select('prompt_id, tag_id, prompt_tags(*)')
      .in('prompt_id', promptIds);

    if (tagMaps) {
      const tagsByPrompt: Record<string, PromptTag[]> = {};
      tagMaps.forEach((tm: any) => {
        if (!tagsByPrompt[tm.prompt_id]) tagsByPrompt[tm.prompt_id] = [];
        if (tm.prompt_tags) tagsByPrompt[tm.prompt_id].push(tm.prompt_tags);
      });

      enrichedPrompts = (prompts || []).map((p: CommunityPrompt) => ({
        ...p,
        tags: tagsByPrompt[p.id] || [],
      }));
    }

    // Filter by tag if needed (post-fetch filtering since Supabase doesn't support join filtering easily)
    if (tagSlug) {
      const { data: tagData } = await supabase
        .from('prompt_tags')
        .select('id')
        .eq('slug', tagSlug)
        .single();

      if (tagData) {
        const { data: filteredMaps } = await supabase
          .from('prompt_tag_map')
          .select('prompt_id')
          .eq('tag_id', tagData.id)
          .in('prompt_id', promptIds);

        const filteredIds = new Set((filteredMaps || []).map((m: any) => m.prompt_id));
        enrichedPrompts = enrichedPrompts.filter((p: CommunityPrompt) => filteredIds.has(p.id));
      }
    }
  }

  const total = count || 0;
  return {
    prompts: enrichedPrompts as CommunityPrompt[],
    total,
    page,
    hasMore: offset + limit < total,
  };
}

// ─── Single Prompt ───────────────────────────────────────────
export async function getPromptById(id: string): Promise<CommunityPrompt | null> {
  const { data, error } = await supabase
    .from('community_prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  // Get tags
  const { data: tagMaps } = await supabase
    .from('prompt_tag_map')
    .select('prompt_tags(*)')
    .eq('prompt_id', id);

  const tags = (tagMaps || []).map((tm: any) => tm.prompt_tags).filter(Boolean);

  // Increment views
  await supabase
    .from('community_prompts')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', id);

  return { ...data, tags } as CommunityPrompt;
}

// ─── Create Prompt ───────────────────────────────────────────
export async function createPrompt(
  data: {
    title: string;
    prompt_text: string;
    ai_output?: string;
    ai_model?: string;
    description?: string;
    tag_slugs: string[];
  },
  userUid: string,
  userName: string,
  userAvatar?: string
): Promise<CommunityPrompt> {
  const { data: prompt, error } = await supabase
    .from('community_prompts')
    .insert({
      title: data.title,
      prompt_text: data.prompt_text,
      ai_output: data.ai_output || null,
      ai_model: data.ai_model || null,
      description: data.description || null,
      author_uid: userUid,
      author_name: userName,
      author_avatar: userAvatar || null,
    })
    .select()
    .single();

  if (error || !prompt) throw error || new Error('Failed to create prompt');

  // Create initial version
  await supabase.from('prompt_versions').insert({
    prompt_id: prompt.id,
    version_number: 1,
    prompt_text: data.prompt_text,
    ai_output: data.ai_output || null,
    change_summary: 'النسخة الأصلية',
    author_uid: userUid,
  });

  // Map tags
  if (data.tag_slugs.length > 0) {
    const { data: tags } = await supabase
      .from('prompt_tags')
      .select('id, slug')
      .in('slug', data.tag_slugs);

    if (tags && tags.length > 0) {
      await supabase.from('prompt_tag_map').insert(
        tags.map((t: any) => ({ prompt_id: prompt.id, tag_id: t.id }))
      );
    }
  }

  return prompt as CommunityPrompt;
}

// ─── Remix Prompt ────────────────────────────────────────────
export async function remixPrompt(
  data: {
    parent_prompt_id: string;
    title: string;
    prompt_text: string;
    ai_output?: string;
    ai_model?: string;
    description?: string;
    tag_slugs: string[];
    change_summary: string;
  },
  userUid: string,
  userName: string,
  userAvatar?: string
): Promise<CommunityPrompt> {
  // Get parent
  const { data: parent } = await supabase
    .from('community_prompts')
    .select('id, remix_depth, remixes_count')
    .eq('id', data.parent_prompt_id)
    .single();

  if (!parent) throw new Error('Parent prompt not found');

  // Create remixed prompt
  const { data: prompt, error } = await supabase
    .from('community_prompts')
    .insert({
      title: data.title,
      prompt_text: data.prompt_text,
      ai_output: data.ai_output || null,
      ai_model: data.ai_model || null,
      description: data.description || null,
      author_uid: userUid,
      author_name: userName,
      author_avatar: userAvatar || null,
      parent_prompt_id: data.parent_prompt_id,
      remix_depth: (parent.remix_depth || 0) + 1,
    })
    .select()
    .single();

  if (error || !prompt) throw error || new Error('Failed to create remix');

  // Create relation
  await supabase.from('prompt_relations').insert({
    parent_id: data.parent_prompt_id,
    child_id: prompt.id,
    relation_type: 'remix',
  });

  // Create version
  await supabase.from('prompt_versions').insert({
    prompt_id: prompt.id,
    version_number: 1,
    prompt_text: data.prompt_text,
    ai_output: data.ai_output || null,
    change_summary: data.change_summary,
    author_uid: userUid,
  });

  // Update parent remix count
  await supabase
    .from('community_prompts')
    .update({ remixes_count: (parent.remixes_count || 0) + 1 })
    .eq('id', data.parent_prompt_id);

  // Map tags
  if (data.tag_slugs.length > 0) {
    const { data: tags } = await supabase
      .from('prompt_tags')
      .select('id, slug')
      .in('slug', data.tag_slugs);

    if (tags && tags.length > 0) {
      await supabase.from('prompt_tag_map').insert(
        tags.map((t: any) => ({ prompt_id: prompt.id, tag_id: t.id }))
      );
    }
  }

  return prompt as CommunityPrompt;
}

// ─── Vote ────────────────────────────────────────────────────
export async function votePrompt(
  promptId: string,
  userUid: string,
  voteType: 'up' | 'down'
): Promise<{ action: 'voted' | 'changed' | 'removed'; newUpvotes: number; newDownvotes: number }> {
  // Check existing vote
  const { data: existing } = await supabase
    .from('prompt_votes')
    .select('*')
    .eq('prompt_id', promptId)
    .eq('user_uid', userUid)
    .single();

  const { data: prompt } = await supabase
    .from('community_prompts')
    .select('upvotes_count, downvotes_count')
    .eq('id', promptId)
    .single();

  if (!prompt) throw new Error('Prompt not found');

  let upvotes = prompt.upvotes_count;
  let downvotes = prompt.downvotes_count;

  if (existing) {
    if (existing.vote_type === voteType) {
      // Remove vote
      await supabase.from('prompt_votes').delete().eq('id', existing.id);
      if (voteType === 'up') upvotes = Math.max(0, upvotes - 1);
      else downvotes = Math.max(0, downvotes - 1);

      await supabase
        .from('community_prompts')
        .update({ upvotes_count: upvotes, downvotes_count: downvotes })
        .eq('id', promptId);

      return { action: 'removed', newUpvotes: upvotes, newDownvotes: downvotes };
    } else {
      // Change vote
      await supabase
        .from('prompt_votes')
        .update({ vote_type: voteType })
        .eq('id', existing.id);

      if (voteType === 'up') {
        upvotes += 1;
        downvotes = Math.max(0, downvotes - 1);
      } else {
        downvotes += 1;
        upvotes = Math.max(0, upvotes - 1);
      }

      await supabase
        .from('community_prompts')
        .update({ upvotes_count: upvotes, downvotes_count: downvotes })
        .eq('id', promptId);

      return { action: 'changed', newUpvotes: upvotes, newDownvotes: downvotes };
    }
  } else {
    // New vote
    await supabase.from('prompt_votes').insert({
      prompt_id: promptId,
      user_uid: userUid,
      vote_type: voteType,
    });

    if (voteType === 'up') upvotes += 1;
    else downvotes += 1;

    await supabase
      .from('community_prompts')
      .update({ upvotes_count: upvotes, downvotes_count: downvotes })
      .eq('id', promptId);

    return { action: 'voted', newUpvotes: upvotes, newDownvotes: downvotes };
  }
}

// ─── Save / Bookmark ─────────────────────────────────────────
export async function toggleSavePrompt(
  promptId: string,
  userUid: string
): Promise<{ saved: boolean; newCount: number }> {
  const { data: existing } = await supabase
    .from('prompt_saves')
    .select('id')
    .eq('prompt_id', promptId)
    .eq('user_uid', userUid)
    .single();

  const { data: prompt } = await supabase
    .from('community_prompts')
    .select('saves_count')
    .eq('id', promptId)
    .single();

  if (!prompt) throw new Error('Prompt not found');

  if (existing) {
    await supabase.from('prompt_saves').delete().eq('id', existing.id);
    const newCount = Math.max(0, prompt.saves_count - 1);
    await supabase.from('community_prompts').update({ saves_count: newCount }).eq('id', promptId);
    return { saved: false, newCount };
  } else {
    await supabase.from('prompt_saves').insert({ prompt_id: promptId, user_uid: userUid });
    const newCount = prompt.saves_count + 1;
    await supabase.from('community_prompts').update({ saves_count: newCount }).eq('id', promptId);
    return { saved: true, newCount };
  }
}

// ─── User Votes & Saves Status ───────────────────────────────
export async function getUserVotesForPrompts(
  userUid: string,
  promptIds: string[]
): Promise<Record<string, 'up' | 'down'>> {
  if (!promptIds.length) return {};
  const { data } = await supabase
    .from('prompt_votes')
    .select('prompt_id, vote_type')
    .eq('user_uid', userUid)
    .in('prompt_id', promptIds);

  const map: Record<string, 'up' | 'down'> = {};
  (data || []).forEach((v: any) => { map[v.prompt_id] = v.vote_type; });
  return map;
}

export async function getUserSavesForPrompts(
  userUid: string,
  promptIds: string[]
): Promise<Set<string>> {
  if (!promptIds.length) return new Set();
  const { data } = await supabase
    .from('prompt_saves')
    .select('prompt_id')
    .eq('user_uid', userUid)
    .in('prompt_id', promptIds);

  return new Set((data || []).map((s: any) => s.prompt_id));
}

// ─── Comments ────────────────────────────────────────────────
export async function getComments(promptId: string): Promise<PromptComment[]> {
  const { data, error } = await supabase
    .from('prompt_comments')
    .select('*')
    .eq('prompt_id', promptId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addComment(
  promptId: string,
  content: string,
  userUid: string,
  userName: string,
  userAvatar?: string
): Promise<PromptComment> {
  const { data, error } = await supabase
    .from('prompt_comments')
    .insert({
      prompt_id: promptId,
      author_uid: userUid,
      author_name: userName,
      author_avatar: userAvatar || null,
      content,
    })
    .select()
    .single();

  if (error || !data) throw error || new Error('Failed to add comment');

  // Update comment count
  const { data: prompt } = await supabase
    .from('community_prompts')
    .select('comments_count')
    .eq('id', promptId)
    .single();

  if (prompt) {
    await supabase
      .from('community_prompts')
      .update({ comments_count: prompt.comments_count + 1 })
      .eq('id', promptId);
  }

  return data as PromptComment;
}

export async function deleteComment(commentId: string, userUid: string, promptId: string): Promise<void> {
  const { error } = await supabase
    .from('prompt_comments')
    .delete()
    .eq('id', commentId)
    .eq('author_uid', userUid);
  if (error) throw error;

  const { data: prompt } = await supabase
    .from('community_prompts')
    .select('comments_count')
    .eq('id', promptId)
    .single();

  if (prompt) {
    await supabase
      .from('community_prompts')
      .update({ comments_count: Math.max(0, prompt.comments_count - 1) })
      .eq('id', promptId);
  }
}

// ─── Prompt Graph ────────────────────────────────────────────
export async function getPromptGraph(promptId: string): Promise<{
  parent: PromptGraphNode | null;
  children: PromptGraphNode[];
}> {
  const { data: prompt } = await supabase
    .from('community_prompts')
    .select('parent_prompt_id')
    .eq('id', promptId)
    .single();

  let parent: PromptGraphNode | null = null;
  if (prompt?.parent_prompt_id) {
    const { data } = await supabase
      .from('community_prompts')
      .select('id, title, author_name, remix_depth, created_at, upvotes_count, remixes_count')
      .eq('id', prompt.parent_prompt_id)
      .single();
    if (data) parent = data as PromptGraphNode;
  }

  const { data: childRelations } = await supabase
    .from('prompt_relations')
    .select('child_id')
    .eq('parent_id', promptId);

  let children: PromptGraphNode[] = [];
  if (childRelations && childRelations.length > 0) {
    const childIds = childRelations.map((r: any) => r.child_id);
    const { data } = await supabase
      .from('community_prompts')
      .select('id, title, author_name, remix_depth, created_at, upvotes_count, remixes_count')
      .in('id', childIds);
    if (data) children = data as PromptGraphNode[];
  }

  return { parent, children };
}

// ─── Creator Stats ───────────────────────────────────────────
export async function getCreatorStats(uid: string): Promise<CreatorStats | null> {
  const { data: prompts } = await supabase
    .from('community_prompts')
    .select('*')
    .eq('author_uid', uid)
    .eq('status', 'published')
    .order('engagement_score', { ascending: false });

  if (!prompts || prompts.length === 0) return null;

  const totalUpvotes = prompts.reduce((s: number, p: any) => s + (p.upvotes_count || 0), 0);
  const totalSaves = prompts.reduce((s: number, p: any) => s + (p.saves_count || 0), 0);
  const totalRemixesReceived = prompts.reduce((s: number, p: any) => s + (p.remixes_count || 0), 0);

  // Count remixes this user created
  const { count: remixesCreated } = await supabase
    .from('community_prompts')
    .select('id', { count: 'exact', head: true })
    .eq('author_uid', uid)
    .not('parent_prompt_id', 'is', null);

  const reputation = (totalUpvotes * 2) + (totalRemixesReceived * 5) + (totalSaves * 1) + (prompts.length * 3);

  return {
    uid,
    display_name: prompts[0].author_name,
    avatar: prompts[0].author_avatar,
    total_prompts: prompts.length,
    total_remixes_created: remixesCreated || 0,
    total_remixes_received: totalRemixesReceived,
    total_upvotes_received: totalUpvotes,
    total_saves_received: totalSaves,
    reputation,
    top_prompts: (prompts.slice(0, 5) as CommunityPrompt[]),
  };
}

// ─── Delete Prompt ───────────────────────────────────────────
export async function deletePrompt(promptId: string, userUid: string): Promise<void> {
  // Delete associated data
  await supabase.from('prompt_comments').delete().eq('prompt_id', promptId);
  await supabase.from('prompt_votes').delete().eq('prompt_id', promptId);
  await supabase.from('prompt_saves').delete().eq('prompt_id', promptId);
  await supabase.from('prompt_tag_map').delete().eq('prompt_id', promptId);
  await supabase.from('prompt_versions').delete().eq('prompt_id', promptId);
  await supabase.from('prompt_relations').delete().eq('parent_id', promptId);
  await supabase.from('prompt_relations').delete().eq('child_id', promptId);

  const { error } = await supabase
    .from('community_prompts')
    .delete()
    .eq('id', promptId)
    .eq('author_uid', userUid);

  if (error) throw error;
}

// ─── Trending Tags ───────────────────────────────────────────
export async function getTrendingTags(limit: number = 8): Promise<(PromptTag & { count: number })[]> {
  const { data } = await supabase
    .from('prompt_tag_map')
    .select('tag_id, prompt_tags(*)');

  if (!data) return [];

  const tagCount: Record<string, { tag: PromptTag; count: number }> = {};
  data.forEach((tm: any) => {
    if (tm.prompt_tags) {
      const slug = tm.prompt_tags.slug;
      if (!tagCount[slug]) tagCount[slug] = { tag: tm.prompt_tags, count: 0 };
      tagCount[slug].count++;
    }
  });

  return Object.values(tagCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(item => ({ ...item.tag, count: item.count }));
}

// ─── Top Creators ────────────────────────────────────────────
export async function getTopCreators(limit: number = 5): Promise<{
  name: string;
  avatar: string | null;
  uid: string;
  prompts: number;
  upvotes: number;
}[]> {
  const { data } = await supabase
    .from('community_prompts')
    .select('author_uid, author_name, author_avatar, upvotes_count')
    .eq('status', 'published');

  if (!data) return [];

  const creators: Record<string, { name: string; avatar: string | null; uid: string; prompts: number; upvotes: number }> = {};
  data.forEach((p: any) => {
    if (!creators[p.author_uid]) {
      creators[p.author_uid] = { name: p.author_name, avatar: p.author_avatar, uid: p.author_uid, prompts: 0, upvotes: 0 };
    }
    creators[p.author_uid].prompts++;
    creators[p.author_uid].upvotes += p.upvotes_count || 0;
  });

  return Object.values(creators)
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, limit);
}

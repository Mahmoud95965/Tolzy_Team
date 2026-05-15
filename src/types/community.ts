// ═══════════════════════════════════════════════════════════════
// TOLZY Community Platform — TypeScript Types
// Supports: prompts, code, articles, questions, ideas, resources
// ═══════════════════════════════════════════════════════════════

export type PostType = 'prompt' | 'code' | 'article' | 'question' | 'idea' | 'resource';

export const POST_TYPE_CONFIG: Record<PostType, { label: string; icon: string; color: string }> = {
  prompt:   { label: 'برومبت',  icon: '✨', color: '#8b5cf6' },
  code:     { label: 'كود',     icon: '💻', color: '#3b82f6' },
  article:  { label: 'مقال',    icon: '📝', color: '#10b981' },
  question: { label: 'سؤال',    icon: '❓', color: '#f59e0b' },
  idea:     { label: 'فكرة',    icon: '💡', color: '#f97316' },
  resource: { label: 'مصدر',    icon: '🔗', color: '#06b6d4' },
};

export interface CommunityPrompt {
  id: string;
  post_type: PostType;
  title: string;
  prompt_text: string;           // main content (prompt, article body, question, idea, etc.)
  ai_output: string | null;      // AI output for prompts, answer for questions
  ai_model: string | null;
  description: string | null;
  code_snippet: string | null;   // code for code posts or any post with code
  code_language: string | null;  // programming language
  link_url: string | null;       // external link for resource posts
  author_uid: string;
  author_username: string;
  author_name: string;
  author_avatar: string | null;
  upvotes_count: number;
  downvotes_count: number;
  saves_count: number;
  remixes_count: number;
  comments_count: number;
  views_count: number;
  engagement_score: number;
  parent_prompt_id: string | null;
  remix_depth: number;
  status: 'draft' | 'published' | 'archived' | 'flagged';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  tags?: PromptTag[];
}

export interface PromptTag {
  id: string;
  slug: string;
  label_ar: string;
  label_en: string;
  color: string;
  icon: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  prompt_text: string;
  ai_output: string | null;
  change_summary: string | null;
  author_uid: string;
  created_at: string;
}

export interface PromptRelation {
  id: string;
  parent_id: string;
  child_id: string;
  relation_type: 'remix' | 'fork' | 'inspired_by';
  created_at: string;
}

export interface PromptVote {
  id: string;
  prompt_id: string;
  user_uid: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface PromptSave {
  id: string;
  prompt_id: string;
  user_uid: string;
  created_at: string;
}

export interface PromptComment {
  id: string;
  prompt_id: string;
  author_uid: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
}

export interface CreatorStats {
  uid: string;
  display_name: string;
  avatar: string | null;
  total_prompts: number;
  total_remixes_created: number;
  total_remixes_received: number;
  total_upvotes_received: number;
  total_saves_received: number;
  reputation: number;
  top_prompts: CommunityPrompt[];
}

export type FeedSortMode = 'trending' | 'latest' | 'top' | 'most_remixed';

export interface FeedQuery {
  sort: FeedSortMode;
  tag?: string;
  post_type?: PostType;
  page?: number;
  limit?: number;
  author_uid?: string;
}

export interface CreatePromptRequest {
  post_type: PostType;
  title: string;
  prompt_text: string;
  ai_output?: string;
  ai_model?: string;
  description?: string;
  code_snippet?: string;
  code_language?: string;
  link_url?: string;
  tag_slugs: string[];
}

export interface RemixPromptRequest {
  parent_prompt_id: string;
  title: string;
  prompt_text: string;
  ai_output?: string;
  ai_model?: string;
  description?: string;
  tag_slugs: string[];
  change_summary: string;
}

export interface VotePromptRequest {
  prompt_id: string;
  vote_type: 'up' | 'down';
}

export interface SavePromptRequest {
  prompt_id: string;
}

export interface PromptGraphNode {
  id: string;
  title: string;
  author_name: string;
  remix_depth: number;
  created_at: string;
  upvotes_count: number;
  remixes_count: number;
}

export interface PromptGraph {
  prompt: CommunityPrompt;
  parent: PromptGraphNode | null;
  children: PromptGraphNode[];
  lineage: PromptGraphNode[];
}

export interface FeedResponse {
  prompts: CommunityPrompt[];
  total: number;
  page: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════
// TOLZY Community — Tool Mention Utilities
// Format: @[ToolName](tool-slug) and @tool-slug
// ═══════════════════════════════════════════════════════════════

export interface ParsedToolMention {
  raw: string;
  name: string;
  slug: string;
}

export const TOOL_MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Format a tool into the standard mention token format: @[ToolName](slug)
 */
export function formatToolMentionToken(toolName: string, toolSlug: string): string {
  const safeName = (toolName || 'Tool').replace(/[\[\]]/g, '').trim();
  const safeSlug = (toolSlug || '').replace(/[\(\)]/g, '').trim();
  return `@[${safeName}](${safeSlug})`;
}

/**
 * Extract all mentioned tools from text (e.g., in a post or comment)
 */
export function extractMentionedTools(text: string): ParsedToolMention[] {
  if (!text) return [];
  const mentions: ParsedToolMention[] = [];
  const seenSlugs = new Set<string>();

  // 1. Standard format: @[ToolName](slug)
  const regex = new RegExp(TOOL_MENTION_REGEX.source, 'g');
  let match;
  while ((match = regex.exec(text)) !== null) {
    const slug = match[2].toLowerCase();
    if (!seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      mentions.push({
        raw: match[0],
        name: match[1],
        slug: match[2],
      });
    }
  }

  // 2. Direct format: @tool-slug (when not part of @[...])
  const directRegex = /(?:^|[^\w\[])@([a-zA-Z0-9_-]{2,30})/g;
  let dMatch;
  while ((dMatch = directRegex.exec(text)) !== null) {
    const slug = dMatch[1].toLowerCase();
    if (!seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      mentions.push({
        raw: `@${dMatch[1]}`,
        name: dMatch[1],
        slug: dMatch[1],
      });
    }
  }

  return mentions;
}

/**
 * Extract just the unique tool slugs/IDs mentioned in the text
 */
export function extractMentionedToolSlugs(text: string): string[] {
  const mentions = extractMentionedTools(text);
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const m of mentions) {
    const slug = m.slug.toLowerCase();
    if (!seen.has(slug)) {
      seen.add(slug);
      slugs.push(m.slug);
    }
  }
  return slugs;
}

/**
 * Check if a text mentions a specific tool ID/slug
 */
export function containsToolMention(text: string, toolSlug: string): boolean {
  if (!text || !toolSlug) return false;
  const target = toolSlug.toLowerCase();
  const slugs = extractMentionedToolSlugs(text);
  return slugs.some((s) => s.toLowerCase() === target);
}

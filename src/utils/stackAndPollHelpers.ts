// ═══════════════════════════════════════════════════════════════
// TOLZY Community — Tech Stack & Poll Serialization Helpers
// Guarantees zero-downtime and compatibility across environments
// ═══════════════════════════════════════════════════════════════

import { StackToolItem, CommunityPoll } from '../types/community';

const STACK_TAG_REGEX = /<!-- TOLZY_STACK_DATA: (.*?) -->/;
const POLL_TAG_REGEX = /<!-- TOLZY_POLL_DATA: (.*?) -->/;

/**
 * Embed stack_tools and poll metadata into text/description as invisible HTML comments
 */
export function embedMetadataInText(
  baseText: string,
  stack_tools?: StackToolItem[],
  poll?: CommunityPoll | null
): string {
  let result = baseText || '';

  if (stack_tools && stack_tools.length > 0) {
    const encoded = encodeURIComponent(JSON.stringify(stack_tools));
    result = `${result}\n\n<!-- TOLZY_STACK_DATA: ${encoded} -->`;
  }

  if (poll && poll.options && poll.options.length > 0) {
    const encoded = encodeURIComponent(JSON.stringify(poll));
    result = `${result}\n\n<!-- TOLZY_POLL_DATA: ${encoded} -->`;
  }

  return result.trim();
}

/**
 * Extract stack_tools and poll metadata from text or description
 */
export function extractMetadataFromText(
  ...sources: (string | null | undefined)[]
): {
  stack_tools?: StackToolItem[];
  poll?: CommunityPoll | null;
  cleanText: string;
} {
  let foundStack: StackToolItem[] | undefined;
  let foundPoll: CommunityPoll | null | undefined;
  let cleanText = '';

  for (const src of sources) {
    if (!src) continue;

    if (!cleanText) {
      cleanText = src
        .replace(STACK_TAG_REGEX, '')
        .replace(POLL_TAG_REGEX, '')
        .trim();
    }

    if (!foundStack) {
      const stackMatch = src.match(STACK_TAG_REGEX);
      if (stackMatch && stackMatch[1]) {
        try {
          foundStack = JSON.parse(decodeURIComponent(stackMatch[1]));
        } catch {
          // ignore parsing error
        }
      }
    }

    if (!foundPoll) {
      const pollMatch = src.match(POLL_TAG_REGEX);
      if (pollMatch && pollMatch[1]) {
        try {
          foundPoll = JSON.parse(decodeURIComponent(pollMatch[1]));
        } catch {
          // ignore parsing error
        }
      }
    }
  }

  return {
    stack_tools: foundStack,
    poll: foundPoll,
    cleanText,
  };
}

/**
 * Format a shareable text bundle with links for all tools in the stack
 */
export function formatTechStackShareText(
  title: string,
  tools: StackToolItem[],
  origin: string = 'https://tolzy.me'
): string {
  const header = `📦 حزمة أدوات TOLZY: ${title || 'مجموعة أدوات مميزة'}\n────────────────────────\n`;
  const items = tools
    .map((t, idx) => {
      const link = `${origin}/tools/${t.tool_id}`;
      const note = t.note ? `\n   💡 الاستخدام: ${t.note}` : '';
      return `${idx + 1}. ${t.tool_name} ➔ ${link}${note}`;
    })
    .join('\n\n');

  const footer = `\n────────────────────────\nاكتشف أكثر من 1,000 أداة ذكاء اصطناعي مجانية على: ${origin}`;
  return `${header}${items}${footer}`;
}

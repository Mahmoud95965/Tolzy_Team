import { Tool } from '../types/tool';
import rawData from '../../data/web-development-tools.json';
import { NORDVPN_TOOL } from '../config/affiliates';

// Normalize raw tools to strictly match the Tool interface
function normalizeTool(raw: any, index: number): Tool {
  let imageUrl = raw.imageUrl || raw.image || raw.logo || raw.icon || raw.img || '';
  if (imageUrl && imageUrl.startsWith('public/')) {
    imageUrl = imageUrl.replace('public/', '/');
  } else if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    imageUrl = '/' + imageUrl;
  }

  const rawPricing = String(raw.pricing || 'Freemium').toLowerCase();
  let pricing: Tool['pricing'] = 'Freemium';
  if (rawPricing.includes('free') && !rawPricing.includes('freemium')) {
    pricing = 'Free';
  } else if (rawPricing.includes('subscription')) {
    pricing = 'Subscription';
  } else if (rawPricing.includes('paid')) {
    pricing = 'Paid';
  }

  const id = String(raw.id || `tool-${String(index + 1).padStart(3, '0')}`);
  const positiveHash = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index);

  // Real Rating strictly from data (max 5.0, 0 if not rated)
  const rawRating = typeof raw.rating === 'number' && !isNaN(raw.rating) ? raw.rating : 0;
  const rating = rawRating > 0 ? Number(Math.min(5, Math.max(0, rawRating)).toFixed(1)) : 0;

  // Real Review Count strictly from data (0 if no reviews)
  const reviewCount = typeof raw.reviewCount === 'number' && !isNaN(raw.reviewCount) ? Math.max(0, Math.floor(raw.reviewCount)) : 0;

  // Real Voting Stats strictly from data
  const realHelpful = typeof raw.votingStats?.helpfulCount === 'number' 
    ? raw.votingStats.helpfulCount 
    : (Array.isArray(raw.votes?.helpful) ? raw.votes.helpful.length : 0);
  const realNotHelpful = typeof raw.votingStats?.notHelpfulCount === 'number' 
    ? raw.votingStats.notHelpfulCount 
    : (Array.isArray(raw.votes?.notHelpful) ? raw.votes.notHelpful.length : 0);

  return {
    id,
    name: raw.name || 'أداة ذكاء اصطناعي',
    description: raw.description || '',
    longDescription: raw.longDescription || raw.description || '',
    category: raw.category || 'General',
    subcategory: raw.subcategory || [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    url: raw.url || raw.link || '#',
    imageUrl: imageUrl || '/tolzy-logo.svg',
    pricing,
    features: Array.isArray(raw.features) ? raw.features : [],
    pros: Array.isArray(raw.pros) ? raw.pros : [],
    cons: Array.isArray(raw.cons) ? raw.cons : [],
    rating,
    reviewCount,
    isNew: raw.isNew !== undefined ? Boolean(raw.isNew) : (positiveHash % 7 === 0),
    isFeatured: raw.isFeatured !== undefined ? Boolean(raw.isFeatured) : (index < 12 || positiveHash % 5 === 0),
    isPopular: raw.isPopular !== undefined ? Boolean(raw.isPopular) : (index < 8 || positiveHash % 4 === 0),
    status: 'approved',
    votes: raw.votes || { helpful: [], notHelpful: [] },
    votingStats: {
      helpfulCount: realHelpful,
      notHelpfulCount: realNotHelpful,
      totalVotes: realHelpful + realNotHelpful
    },
    savedBy: Array.isArray(raw.savedBy) ? raw.savedBy : []
  };
}

// Cached normalized tools list with strictly unique IDs
const seenToolIds = new Set<string>(['nordvpn']);
const rawNormalized: Tool[] = ((rawData as any).tools || []).map((t: any, idx: number) => {
  const tool = normalizeTool(t, idx);
  let finalId = tool.id;
  if (seenToolIds.has(finalId)) {
    finalId = `${finalId}-v${idx + 1}`;
    tool.id = finalId;
  }
  seenToolIds.add(finalId);
  return tool;
});

const normalizedTools: Tool[] = [NORDVPN_TOOL, ...rawNormalized];

export function getFallbackTools(): Tool[] {
  return normalizedTools;
}

export function getFallbackToolById(id: string): Tool | null {
  if (!id) return null;
  const searchId = String(id).toLowerCase().trim();
  if (searchId === 'nordvpn') return NORDVPN_TOOL;

  const normalizedId = searchId.padStart(3, '0');
  const found = normalizedTools.find(
    t => {
      const tid = String(t.id).toLowerCase();
      return tid === searchId || tid === normalizedId || tid.startsWith(`${searchId}-v`);
    }
  );
  return found || null;
}

export function getFallbackFeaturedTools(limitCount: number = 8): Tool[] {
  return normalizedTools.filter(t => t.isFeatured).slice(0, limitCount);
}

export function getFallbackPopularTools(limitCount: number = 8): Tool[] {
  return normalizedTools.filter(t => t.isPopular).slice(0, limitCount);
}

export function getFallbackNewTools(limitCount: number = 8): Tool[] {
  return normalizedTools.filter(t => t.isNew).slice(0, limitCount);
}

export function getFallbackCategoryCount(category: string): number {
  if (!category || category === 'All') return normalizedTools.length;
  return normalizedTools.filter(t => {
    const cats = Array.isArray(t.category) ? t.category : [t.category];
    return cats.some(c => String(c).toLowerCase() === category.toLowerCase());
  }).length;
}

export function getFallbackTotalCount(): number {
  return normalizedTools.length;
}

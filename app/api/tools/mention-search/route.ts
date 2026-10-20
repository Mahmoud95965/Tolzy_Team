import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export interface SimplifiedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: string;
  imageUrl?: string;
  url?: string;
}

// In-memory cache on the server across requests
let cachedToolsList: SimplifiedTool[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(supabaseUrl, supabaseKey);
}

// Load all tools into a lightweight list
async function loadAllToolsLightweight(): Promise<SimplifiedTool[]> {
  const now = Date.now();
  if (cachedToolsList && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedToolsList;
  }

  const map = new Map<string, SimplifiedTool>();

  // 1. Load from local web-development-tools.json (instant baseline)
  try {
    const rawData = await import('@/data/web-development-tools.json');
    const tools = (rawData as any).tools || (Array.isArray(rawData) ? rawData : []);
    for (const t of tools) {
      if (t.id && t.name) {
        const key = String(t.id).toLowerCase();
        map.set(key, {
          id: String(t.id),
          name: String(t.name).trim(),
          description: String(t.description || '').slice(0, 160),
          category: Array.isArray(t.category) ? t.category[0] : String(t.category || 'General'),
          pricing: String(t.pricing || 'Freemium'),
          imageUrl: t.imageUrl || t.image || t.logo || '',
          url: t.url || t.link || '',
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load web-development-tools.json:', err);
  }

  // 2. Load from Supabase tools_embeddings (+1,000 tools)
  try {
    const supabase = getSupabaseClient();
    const { data: sbTools, error } = await supabase
      .from('tools_embeddings')
      .select('id, name, description, category, link')
      .limit(1500);

    if (!error && sbTools && sbTools.length > 0) {
      for (const t of sbTools) {
        if (t.id && t.name) {
          const key = String(t.id).toLowerCase();
          // Extract short description from [الوصف الدقيق] if available
          let cleanDesc = String(t.description || '');
          const descMatch = cleanDesc.match(/\[الوصف الدقيق\]:\s*([^\n]+)/);
          if (descMatch && descMatch[1]) {
            cleanDesc = descMatch[1].trim();
          } else {
            cleanDesc = cleanDesc.split('\n')[0].replace(/\[.*?\]:\s*/g, '').slice(0, 160);
          }

          const existing = map.get(key);
          map.set(key, {
            id: String(t.id),
            name: String(t.name).trim(),
            description: cleanDesc || existing?.description || '',
            category: String(t.category || existing?.category || 'General'),
            pricing: existing?.pricing || 'Freemium',
            imageUrl: existing?.imageUrl || '',
            url: t.link || existing?.url || '',
          });
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load Supabase tools_embeddings:', err);
  }

  // 3. Fallback to Firebase if needed
  if (map.size < 100 && adminDb) {
    try {
      const snap = await adminDb.collection('tools').limit(500).get();
      snap.docs.forEach((doc) => {
        const d = doc.data();
        if (d && d.name) {
          const key = doc.id.toLowerCase();
          const existing = map.get(key);
          map.set(key, {
            id: doc.id,
            name: String(d.name).trim(),
            description: String(d.description || existing?.description || '').slice(0, 160),
            category: Array.isArray(d.category) ? d.category[0] : String(d.category || 'General'),
            pricing: String(d.pricing || existing?.pricing || 'Freemium'),
            imageUrl: d.imageUrl || d.image || existing?.imageUrl || '',
            url: d.url || existing?.url || '',
          });
        }
      });
    } catch (fsErr) {
      console.warn('⚠️ Could not load Firebase tools:', fsErr);
    }
  }

  // Deduplicate tools that share the exact same name (case-insensitive)
  const byNameMap = new Map<string, SimplifiedTool>();
  for (const tool of map.values()) {
    const nameKey = tool.name.toLowerCase().trim();
    const existing = byNameMap.get(nameKey);
    // Prioritize tool with real image or longer description or alphanumeric id
    if (!existing || (tool.description.length > existing.description.length)) {
      byNameMap.set(nameKey, tool);
    }
  }

  cachedToolsList = Array.from(byNameMap.values());
  lastCacheTime = now;
  console.log(`✅ [mention-search] Cached ${cachedToolsList.length} distinct tools for autocomplete`);
  return cachedToolsList;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQ = searchParams.get('q') || '';
    const targetId = searchParams.get('id') || '';

    const allTools = await loadAllToolsLightweight();

    // ─── If querying for a specific Tool ID (for MentionedToolCard) ───
    if (targetId) {
      const cleanId = decodeURIComponent(targetId).trim().toLowerCase();
      const tool = allTools.find(
        (t) =>
          t.id.toLowerCase() === cleanId ||
          t.name.toLowerCase() === cleanId ||
          t.id.toLowerCase() === cleanId.replace(/^tool-/, '')
      );
      if (tool) {
        return NextResponse.json({ tool });
      }
      return NextResponse.json({ tool: null }, { status: 404 });
    }

    // ─── Autocomplete Search across ALL 1,000+ tools ───
    const q = decodeURIComponent(rawQ).trim().toLowerCase();

    // If query is empty, return top trending tools
    if (!q) {
      const popularKeywords = [
        'cursor',
        'chatgpt',
        'midjourney',
        'claude',
        'v0',
        'nextjs',
        'supabase',
        'figma',
        'tailwind',
        'elevenlabs',
        'canva',
      ];
      const popular = allTools.filter((t) =>
        popularKeywords.some(
          (p) => t.id.toLowerCase().includes(p) || t.name.toLowerCase().includes(p)
        )
      );
      return NextResponse.json({
        tools: popular.length > 0 ? popular.slice(0, 8) : allTools.slice(0, 8),
      });
    }

    // Filter across all tools by:
    // 1. Starts with query (highest priority)
    // 2. Name contains query
    // 3. ID contains query
    // 4. Category or Description contains query
    const startsWithName: SimplifiedTool[] = [];
    const containsName: SimplifiedTool[] = [];
    const containsOther: SimplifiedTool[] = [];

    for (const tool of allTools) {
      const nameLower = tool.name.toLowerCase();
      const idLower = tool.id.toLowerCase();
      const catLower = tool.category.toLowerCase();
      const descLower = tool.description.toLowerCase();

      if (nameLower.startsWith(q)) {
        startsWithName.push(tool);
      } else if (nameLower.includes(q)) {
        containsName.push(tool);
      } else if (idLower.includes(q) || catLower.includes(q) || descLower.includes(q)) {
        containsOther.push(tool);
      }

      if (startsWithName.length >= 10) break;
    }

    const matches = [...startsWithName, ...containsName, ...containsOther].slice(0, 8);

    return NextResponse.json({ tools: matches });
  } catch (err: any) {
    console.error('❌ [mention-search] Error:', err);
    return NextResponse.json({ tools: [] }, { status: 500 });
  }
}

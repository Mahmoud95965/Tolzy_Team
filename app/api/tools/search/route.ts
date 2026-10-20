import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getToolByIdFromFirebase } from '@/lib/firebase-admin';
import { getFallbackTools, getFallbackToolById } from '@/src/data/fallbackTools';
import type { Tool } from '@/src/types/tool';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(supabaseUrl, supabaseKey);
}

interface AiQueryAnalysis {
  keywords: string[];
  categories: string[];
  targetTools: string[];
  aiSummary: string;
}

// ─── AI Query Semantic Intent Analyzer using Groq ────────────────────────────
async function analyzeSearchWithAi(userQuery: string): Promise<AiQueryAnalysis | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `أنت محرك بحث دلالي ذكي وخبير في تصنيف واختيار أدوات الذكاء الاصطناعي والبرمجيات (TOLZY Directory).
المستخدم يبحث عن أدوات بالاستفسار التالي: "${userQuery}".

قم بفهم النية الدلالية للمستخدم واستخرج كائن JSON حصراً بدون أي نصوص إضافية بالصيغة التالية:
{
  "keywords": ["الكلمات المفتاحية والتقنية الإنجليزية الأكثر دقة للبحث في دليل الأدوات (مثال: logo design, branding, vector, text to image)"],
  "categories": ["الفئات المتطابقة من بين: Design, Video, Writing, Programming, Productivity, Business, Education, 3D, Creativity"],
  "targetTools": ["أسماء أشهر 3-6 أدوات معروفة عالمياً تناسب هذا الطلب بدقة (مثال: Midjourney, Canva, Looka, Runway, Cursor)"],
  "aiSummary": "ملخص ذكي ومفيد جداً في سطر واحد باللغة العربية يشرح ما يناسب المستخدم ولماذا تم ترشيح هذه الأدوات"
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content) as AiQueryAnalysis;
      }
    }
  } catch (err: any) {
    console.warn('⚠️ [AI-Search] Groq semantic analysis skipped:', err.message);
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ tools: [], aiSummary: null });
    }

    const cleanQuery = query.trim();
    console.log(`🔍 [AI-Search] Query: "${cleanQuery}"`);

    // 1. AI Intent Analysis
    const aiAnalysis = await analyzeSearchWithAi(cleanQuery);

    const targetTools = aiAnalysis?.targetTools || [];
    const expandedKeywords = aiAnalysis?.keywords || [];
    const aiCategories = aiAnalysis?.categories || [];
    const aiSummary = aiAnalysis?.aiSummary || null;

    // 2. Fetch candidate tools from Supabase (all 1,000+ tools)
    const supabase = getSupabaseClient();
    const searchTerms = Array.from(
      new Set([cleanQuery, ...targetTools, ...expandedKeywords.slice(0, 5)])
    ).filter(Boolean);

    let supabaseCandidates: any[] = [];
    try {
      // Build safe or query across terms
      const filterConditions = searchTerms
        .slice(0, 8)
        .map((term) => `name.ilike.%${term}%,description.ilike.%${term}%`)
        .join(',');

      const { data, error } = await supabase
        .from('tools_embeddings')
        .select('id, name, description, category, link')
        .or(filterConditions)
        .limit(40);

      if (!error && data) {
        supabaseCandidates = data;
      }
    } catch (dbErr) {
      console.warn('⚠️ [AI-Search] Supabase query failed:', dbErr);
    }

    // 3. Merge with Fallback Tools dataset (rich local metadata)
    const fallbackList = getFallbackTools();
    const candidatesMap = new Map<string, any>();

    // Add Supabase items first
    supabaseCandidates.forEach((sbTool) => {
      const key = String(sbTool.id).toLowerCase();
      candidatesMap.set(key, {
        id: String(sbTool.id),
        name: sbTool.name,
        description: sbTool.description || '',
        category: sbTool.category || 'General',
        url: sbTool.link || '',
        imageUrl: '',
        pricing: 'Freemium',
      });
    });

    // Add local fallback matches
    const lowerQuery = cleanQuery.toLowerCase();
    fallbackList.forEach((fbTool) => {
      const key = String(fbTool.id).toLowerCase();
      const nameMatch = fbTool.name.toLowerCase().includes(lowerQuery);
      const descMatch = fbTool.description.toLowerCase().includes(lowerQuery);
      const tagMatch = fbTool.tags?.some((t) => t.toLowerCase().includes(lowerQuery));
      const targetMatch = targetTools.some((tt) =>
        fbTool.name.toLowerCase().includes(tt.toLowerCase())
      );
      const kwMatch = expandedKeywords.some((kw) =>
        fbTool.name.toLowerCase().includes(kw.toLowerCase()) ||
        fbTool.description.toLowerCase().includes(kw.toLowerCase())
      );

      if (nameMatch || descMatch || tagMatch || targetMatch || kwMatch) {
        const existing = candidatesMap.get(key);
        candidatesMap.set(key, {
          ...(existing || {}),
          ...fbTool,
          // Always ensure high-quality local image and pricing if available
          imageUrl: fbTool.imageUrl || existing?.imageUrl || '',
          pricing: fbTool.pricing || existing?.pricing || 'Freemium',
        });
      }
    });

    // 4. Intelligent Relevance Scoring
    const scoredTools: (Tool & { similarity: number })[] = [];

    for (const rawTool of candidatesMap.values()) {
      const toolNameLower = String(rawTool.name || '').toLowerCase();
      const toolDescLower = String(rawTool.description || '').toLowerCase();
      const toolCatLower = String(rawTool.category || '').toLowerCase();

      let score = 0.5; // baseline

      // Target tools identified by AI
      if (targetTools.some((t) => toolNameLower.includes(t.toLowerCase()))) {
        score += 0.45; // up to 0.95
      }

      // Exact or partial query match in name
      if (toolNameLower === lowerQuery) {
        score += 0.48;
      } else if (toolNameLower.includes(lowerQuery)) {
        score += 0.35;
      }

      // Query in description
      if (toolDescLower.includes(lowerQuery)) {
        score += 0.2;
      }

      // Expanded keywords in name or description
      for (const kw of expandedKeywords) {
        const lowerKw = kw.toLowerCase();
        if (toolNameLower.includes(lowerKw)) {
          score += 0.25;
          break;
        } else if (toolDescLower.includes(lowerKw)) {
          score += 0.15;
          break;
        }
      }

      // Category match
      if (aiCategories.some((c) => toolCatLower.includes(c.toLowerCase()))) {
        score += 0.1;
      }

      const normalizedScore = Number(Math.min(0.99, score).toFixed(2));

      // Resolve full tool with guaranteed image and fallback metadata
      const fallbackTool = getFallbackToolById(rawTool.id);
      const cleanImageUrl =
        rawTool.imageUrl ||
        fallbackTool?.imageUrl ||
        '/tolzy-logo.svg';

      scoredTools.push({
        id: String(rawTool.id),
        name: String(rawTool.name),
        description: String(rawTool.description || fallbackTool?.description || 'أداة ذكاء اصطناعي في دليل TOLZY'),
        longDescription: String(rawTool.longDescription || rawTool.description || ''),
        category: rawTool.category || fallbackTool?.category || 'General',
        pricing: rawTool.pricing || fallbackTool?.pricing || 'Freemium',
        imageUrl: cleanImageUrl,
        url: rawTool.url || rawTool.link || fallbackTool?.url || '',
        tags: Array.isArray(rawTool.tags) ? rawTool.tags : fallbackTool?.tags || [],
        features: Array.isArray(rawTool.features) ? rawTool.features : fallbackTool?.features || [],
        rating: typeof rawTool.rating === 'number' ? rawTool.rating : fallbackTool?.rating || 4.8,
        reviewCount: typeof rawTool.reviewCount === 'number' ? rawTool.reviewCount : fallbackTool?.reviewCount || 10,
        isNew: Boolean(rawTool.isNew || fallbackTool?.isNew),
        isFeatured: Boolean(rawTool.isFeatured || fallbackTool?.isFeatured),
        isPopular: Boolean(rawTool.isPopular || fallbackTool?.isPopular),
        votes: rawTool.votes || fallbackTool?.votes || { helpful: [], notHelpful: [] },
        votingStats: rawTool.votingStats || fallbackTool?.votingStats || { helpfulCount: 0, notHelpfulCount: 0, totalVotes: 0 },
        savedBy: rawTool.savedBy || fallbackTool?.savedBy || [],
        similarity: normalizedScore,
      });
    }

    // Sort by similarity descending
    scoredTools.sort((a, b) => b.similarity - a.similarity);

    const topResults = scoredTools.slice(0, 30);
    console.log(`✅ [AI-Search] Returning ${topResults.length} scored tools. AI Summary: ${!!aiSummary}`);

    return NextResponse.json({
      tools: topResults,
      aiSummary: aiSummary || (topResults.length > 0 ? `أفضل الأدوات المتطابقة مع "${cleanQuery}"` : null),
      keywords: expandedKeywords,
      targetTools: targetTools,
      isAiSearch: true,
      total: topResults.length,
    });
  } catch (error: any) {
    console.error('❌ [AI-Search] Critical error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

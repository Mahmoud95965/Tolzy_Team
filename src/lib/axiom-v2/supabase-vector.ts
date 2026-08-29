/**
 * src/lib/axiom-v2/supabase-vector.ts
 * تنفيذ الاستعلام المتجهي وجلب أفضل الأدوات والكورسات من Supabase
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RetrievedTool, RetrievedCourse } from './types';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

/**
 * البحث المتجهي عن أدوات الذكاء الاصطناعي
 * @param queryVector متجه الاستعلام (1024 أبعاد)
 * @param threshold عتبة التشابه (الافتراضي 0.65)
 * @param limit عدد النتائج المطلوبة
 * @param category فلتر التصنيف (اختياري)
 */
export async function searchToolsVector(
  queryVector: number[],
  threshold = 0.65,
  limit = 5,
  category: string | null = null
): Promise<RetrievedTool[]> {
  try {
    // محاولة استدعاء match_tools_v2 أولاً
    const { data, error } = await supabase.rpc('match_tools_v2', {
      query_embedding: queryVector,
      match_threshold: threshold,
      match_count: limit,
      filter_category: category,
    });

    if (error) {
      // محاولة استدعاء match_tools القديمة كـ fallback إن وجدت
      console.warn('⚠️ match_tools_v2 call failed, falling back to match_tools:', error.message);
      const fallbackRes = await supabase.rpc('match_tools', {
        query_embedding: queryVector,
        match_threshold: threshold,
        match_count: limit,
        filter_category: category || 'general',
      });

      if (fallbackRes.error) {
        console.error('❌ Supabase vector search error (fallback):', fallbackRes.error.message);
        return [];
      }

      return (fallbackRes.data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        category: t.category || 'General',
        pricing: t.pricing || 'مجاني / تجريبي',
        link: t.link || `/tools/${t.id}`,
        similarity: t.similarity || 0,
      }));
    }

    return (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      category: t.category || 'General',
      pricing: t.pricing || 'مجاني / تجريبي',
      pros: Array.isArray(t.pros) ? t.pros : [],
      cons: Array.isArray(t.cons) ? t.cons : [],
      use_cases: Array.isArray(t.use_cases) ? t.use_cases : [],
      website_url: t.website_url,
      link: t.link || `/tools/${t.id}`,
      similarity: t.similarity || 0,
    }));

  } catch (err: any) {
    console.error('❌ [Supabase Vector Search Exception]:', err);
    return [];
  }
}

/**
 * البحث المتجهي عن الكورسات والمسارات التعليمية
 */
export async function searchCoursesVector(
  queryVector: number[],
  threshold = 0.55,
  limit = 3,
  category: string | null = null
): Promise<RetrievedCourse[]> {
  try {
    const { data, error } = await supabase.rpc('match_courses', {
      query_embedding: queryVector,
      match_threshold: threshold,
      match_count: limit,
      filter_category: category || 'general',
    });

    if (error) {
      console.warn('⚠️ Supabase match_courses error:', error.message);
      return [];
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || '',
      category: c.category || 'الذكاء الاصطناعي',
      level: c.level || 'جميع المستويات',
      price: c.price || 'مجاني',
      link: c.link || `/learn/course/${c.id}`,
      thumbnail: c.thumbnail,
      similarity: c.similarity || 0,
    }));
  } catch (err: any) {
    console.error('❌ [Supabase Courses Vector Exception]:', err);
    return [];
  }
}

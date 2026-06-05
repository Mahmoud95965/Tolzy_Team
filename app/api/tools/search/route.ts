import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGoogleEmbedding } from '@/src/lib/google-embeddings';
import { getToolByIdFromFirebase } from '@/lib/firebase-admin';

// Initialize Supabase Client with service role key for server-side bypass of RLS
const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'placeholder-key'
);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ tools: [] });
        }

        const cleanQuery = query.trim();
        console.log(`🔍 AI Semantic Search for: "${cleanQuery}"`);

        // ── Strategy 1: Vector Similarity Search ──────────────────────────
        let matchedTools: any[] = [];
        let vectorSearchSucceeded = false;

        try {
            const embedding = await generateGoogleEmbedding(cleanQuery);

            if (embedding && Array.isArray(embedding) && embedding.length > 0) {
                const { data, error } = await supabase.rpc('match_tools', {
                    query_embedding: embedding,
                    match_threshold: 0.35,  // Lowered from 0.5 for much better recall
                    match_count: 30          // Fetch more to enrich
                });

                if (error) {
                    console.warn('⚠️ match_tools RPC error:', error.message);
                } else if (data && data.length > 0) {
                    matchedTools = data;
                    vectorSearchSucceeded = true;
                    console.log(`✅ Vector search: ${matchedTools.length} matches`);
                } else {
                    console.log('💡 Vector search returned 0 results, trying keyword fallback...');
                }
            }
        } catch (embeddingErr) {
            console.warn('⚠️ Embedding generation failed, using keyword fallback:', embeddingErr);
        }

        // ── Strategy 2: Keyword Fallback (always run if vector yields < 5) ──
        if (!vectorSearchSucceeded || matchedTools.length < 5) {
            console.log(`🔤 Running keyword fallback search for: "${cleanQuery}"`);

            const { data: kwData, error: kwErr } = await supabase
                .from('tools_embeddings')
                .select('id, name, description, category, link')
                .or(
                    [
                        `name.ilike.%${cleanQuery}%`,
                        `description.ilike.%${cleanQuery}%`,
                        `category.ilike.%${cleanQuery}%`,
                    ].join(',')
                )
                .limit(30);

            if (kwErr) {
                console.warn('⚠️ Keyword search error:', kwErr.message);
            } else if (kwData && kwData.length > 0) {
                console.log(`✅ Keyword search: ${kwData.length} matches`);
                // Merge: add keyword results not already in vector results
                const existingIds = new Set(matchedTools.map((t: any) => String(t.id)));
                for (const t of kwData) {
                    if (!existingIds.has(String(t.id))) {
                        matchedTools.push({ ...t, similarity: 0.5 }); // assign base similarity
                    }
                }
            }
        }

        if (!matchedTools || matchedTools.length === 0) {
            console.log('❌ No results found from either strategy.');
            return NextResponse.json({ tools: [] });
        }

        console.log(`📦 Total candidates: ${matchedTools.length} tools. Enriching from Firebase...`);

        // ── Enrich matched tools with full metadata from Firestore ──────────
        const enrichPromises = matchedTools.slice(0, 24).map(async (matchedItem: any) => {
            const rawId = matchedItem.id;
            const normalizedId = String(rawId).padStart(3, '0');
            try {
                const firestoreTool = await getToolByIdFromFirebase(normalizedId);
                if (firestoreTool) {
                    return {
                        ...firestoreTool,
                        similarity: matchedItem.similarity ?? 0.5
                    };
                }
            } catch (err) {
                console.warn(`Firebase enrichment failed for ID ${normalizedId}:`, err);
            }
            // Fallback: return basic Supabase data if Firebase fails
            return {
                id: normalizedId,
                name: matchedItem.name || 'أداة ذكاء اصطناعي',
                description: matchedItem.description || '',
                category: matchedItem.category || 'General',
                url: matchedItem.link || '',
                imageUrl: '',
                pricing: 'Freemium',
                features: [],
                rating: 4.5,
                reviewCount: 1,
                isNew: false,
                isFeatured: false,
                isPopular: false,
                votes: { helpful: [], notHelpful: [] },
                savedBy: [],
                votingStats: { helpfulCount: 0, notHelpfulCount: 0, totalVotes: 0 },
                similarity: matchedItem.similarity ?? 0.5
            };
        });

        const enrichedTools = (await Promise.all(enrichPromises)).filter(Boolean);

        // Sort by similarity (highest first)
        enrichedTools.sort((a: any, b: any) => (b.similarity ?? 0) - (a.similarity ?? 0));

        console.log(`🎉 Returning ${enrichedTools.length} enriched tools`);
        return NextResponse.json({ tools: enrichedTools });

    } catch (error: any) {
        console.error('❌ AI Semantic Search critical error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

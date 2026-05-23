import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGoogleEmbedding } from '@/src/lib/google-embeddings';
import { getToolByIdFromFirebase } from '@/lib/firebase-admin';

// Initialize Supabase Client
const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ tools: [] });
        }

        console.log(`🤖 Starting AI Semantic Search for query: "${query}"`);

        // 1. Generate Google Gemini embedding vector for the query string
        const embedding = await generateGoogleEmbedding(query.trim());

        if (!embedding || !Array.isArray(embedding)) {
            console.error('❌ Failed to generate embedding vector from Gemini');
            return NextResponse.json({ error: 'Embedding generation failed' }, { status: 500 });
        }

        // 2. Call Supabase match_tools RPC with vector similarity search
        const { data: matchedTools, error: matchError } = await supabase.rpc('match_tools', {
            query_embedding: embedding,
            match_threshold: 0.5, // slightly lower threshold to include more matches
            match_count: 24       // fetch top 24 relevant tools
        });

        if (matchError) {
            console.error('❌ Supabase RPC match_tools error:', matchError);
            return NextResponse.json({ error: matchError.message }, { status: 500 });
        }

        if (!matchedTools || matchedTools.length === 0) {
            console.log('💡 No semantic matches found in database.');
            return NextResponse.json({ tools: [] });
        }

        console.log(`✅ Supabase found ${matchedTools.length} semantic matches. Enriching from Firestore...`);

        // 3. Enrich the matched tools with full rich metadata from Firestore
        // Pad matching IDs to 3 chars since Firebase uses "001", "002", etc.
        const enrichPromises = matchedTools.map(async (matchedItem: any) => {
            const rawId = matchedItem.id;
            const normalizedId = rawId.toString().padStart(3, '0');
            try {
                const firestoreTool = await getToolByIdFromFirebase(normalizedId);
                if (firestoreTool) {
                    // Inject similarity score if needed or just return tool
                    return {
                        ...firestoreTool,
                        similarity: matchedItem.similarity
                    };
                }
            } catch (err) {
                console.error(`Error enriching tool ID ${normalizedId}:`, err);
            }
            // Fallback to basic Supabase metadata if Firestore doc failed to load
            return {
                id: normalizedId,
                name: matchedItem.name,
                description: matchedItem.description,
                category: matchedItem.category,
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
                similarity: matchedItem.similarity
            };
        });

        const enrichedTools = (await Promise.all(enrichPromises)).filter(Boolean);

        console.log(`🎉 Enriched and returning ${enrichedTools.length} tools.`);

        return NextResponse.json({ tools: enrichedTools });

    } catch (error: any) {
        console.error('❌ AI Semantic Search critical error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

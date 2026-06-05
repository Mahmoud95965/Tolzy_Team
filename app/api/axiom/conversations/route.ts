import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';



// Create Supabase client lazily to ensure env vars are loaded
let supabase: SupabaseClient | null = null;

const getSupabase = () => {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            console.error('[Conversations API] Missing Supabase config:', {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseKey
            });
            return null;
        }

        supabase = createClient(supabaseUrl, supabaseKey);
    }
    return supabase;
};

// Save/Update a conversation
export async function POST(request: NextRequest) {
    try {
        const client = getSupabase();

        if (!client) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const { id, userId, title, messages } = await request.json();

        console.log(`[Conversations API] Saving. ID: ${id || 'NEW'}, User: ${userId}, Messages: ${messages?.length}`);

        if (!userId || !messages) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Prepare data for upsert
        const conversationData: any = {
            user_id: userId,
            title: title || messages[0]?.content?.substring(0, 50) + '...' || 'محادثة جديدة',
            messages: messages,
            updated_at: new Date().toISOString()
        };

        if (id) {
            conversationData.id = id;
        }

        // Use UPSERT for simplicity and robustness
        const { data, error } = await client
            .from('conversations')
            .upsert(conversationData)
            .select()
            .single();

        if (error) {
            console.error('[Conversations API] Upsert Error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('[Conversations API] Save successful. ID:', data.id);
        return NextResponse.json({ conversation: data });

    } catch (error: any) {
        console.error('[Conversations API] Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
    }
}

// Get conversations for a user
export async function GET(request: NextRequest) {
    try {
        const client = getSupabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!client) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
        }

        console.log('[Conversations API] Fetching for user:', userId);

        const { data, error } = await client
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('[Conversations API] Supabase error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ conversations: data || [] });

    } catch (error: any) {
        console.error('[Conversations API] GET Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}

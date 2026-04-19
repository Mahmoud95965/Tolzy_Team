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

// Get all conversations for a user


// Delete a conversation
export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const client = getSupabase();

        if (!client) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const { id } = await context.params;

        const { error } = await client
            .from('conversations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[Conversations API] Delete error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Conversations API] Delete Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }
}

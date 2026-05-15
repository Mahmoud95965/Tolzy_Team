import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch user's projects
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const projectId = searchParams.get('id');

        if (projectId) {
            // Fetch single project
            const { data, error } = await supabase
                .from('build_projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 });
            }
            return NextResponse.json({ project: data });
        }

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Fetch all user projects
        const { data, error } = await supabase
            .from('build_projects')
            .select('id, idea, user_level, created_at, result_json')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Fetch projects error:', error);
            return NextResponse.json({ error: 'فشل في جلب المشاريع' }, { status: 500 });
        }

        // Extract title from result_json for listing
        const projects = (data || []).map((p: any) => ({
            id: p.id,
            idea: p.idea,
            user_level: p.user_level,
            created_at: p.created_at,
            title: p.result_json?.ideaBreakdown?.title || null,
        }));

        return NextResponse.json({ projects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

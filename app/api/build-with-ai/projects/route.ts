import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/config/firebase-admin';
import { supabaseAdmin } from '@/src/config/supabase-admin';

// GET: Fetch user's projects or a single project by ID
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const projectId = searchParams.get('id');

        // Case 1: Fetch single project by ID
        if (projectId) {
            let project: any = null;

            // Try Firebase Firestore first
            if (adminDb) {
                try {
                    const docSnap = await adminDb.collection('build_projects').doc(projectId).get();
                    if (docSnap.exists) {
                        project = docSnap.data();
                    }
                } catch (fsErr) {
                    console.warn('⚠️ Firestore fetch project by id notice:', fsErr);
                }
            }

            // Fallback to Supabase if not found in Firestore
            if (!project && supabaseAdmin) {
                try {
                    const { data, error } = await supabaseAdmin
                        .from('build_projects')
                        .select('*')
                        .eq('id', projectId)
                        .single();

                    if (!error && data) {
                        project = data;
                    }
                } catch (sbErr) {
                    console.warn('⚠️ Supabase fetch project by id notice:', sbErr);
                }
            }

            if (!project) {
                return NextResponse.json({ error: 'المشروع غير موجود أو تم حذفه' }, { status: 404 });
            }

            return NextResponse.json({ project });
        }

        // Case 2: Fetch all projects for a user
        if (!userId) {
            return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
        }

        const projectMap = new Map<string, any>();

        // 1. Fetch from Firestore
        if (adminDb) {
            try {
                const snap = await adminDb.collection('build_projects')
                    .where('user_id', '==', userId)
                    .get();

                snap.forEach((doc: any) => {
                    const data = doc.data();
                    if (data && data.id) {
                        projectMap.set(data.id, data);
                    }
                });
            } catch (fsErr) {
                console.warn('⚠️ Firestore get user projects notice:', fsErr);
            }
        }

        // 2. Fetch from Supabase
        if (supabaseAdmin) {
            try {
                const { data: sbData, error: sbError } = await supabaseAdmin
                    .from('build_projects')
                    .select('*')
                    .eq('user_id', userId);

                if (!sbError && sbData) {
                    sbData.forEach((item: any) => {
                        if (item && item.id && !projectMap.has(item.id)) {
                            projectMap.set(item.id, item);
                        }
                    });
                }
            } catch (sbErr) {
                console.warn('⚠️ Supabase get user projects notice:', sbErr);
            }
        }

        // Format and sort newest first
        const projects = Array.from(projectMap.values())
            .map((p: any) => ({
                id: p.id,
                idea: p.idea || '',
                user_level: p.user_level || 'beginner',
                created_at: p.created_at || new Date().toISOString(),
                title: p.title || p.result_json?.ideaBreakdown?.title || p.idea?.substring(0, 45) || 'مشروع جديد',
                result_json: p.result_json || null,
            }))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json({ projects });

    } catch (error: any) {
        console.error('Fetch projects error:', error);
        return NextResponse.json({ error: error.message || 'فشل في جلب المشاريع' }, { status: 500 });
    }
}

// DELETE: Delete a project by ID
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('id');

        if (!projectId) {
            return NextResponse.json({ error: 'معرف المشروع مطلوب' }, { status: 400 });
        }

        // 1. Delete from Firestore
        if (adminDb) {
            try {
                await adminDb.collection('build_projects').doc(projectId).delete();
            } catch (fsErr) {
                console.warn('⚠️ Firestore delete notice:', fsErr);
            }
        }

        // 2. Delete from Supabase
        if (supabaseAdmin) {
            try {
                await supabaseAdmin.from('build_projects').delete().eq('id', projectId);
            } catch (sbErr) {
                console.warn('⚠️ Supabase delete notice:', sbErr);
            }
        }

        return NextResponse.json({ success: true, message: 'تم حذف المشروع بنجاح' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'فشل في حذف المشروع' }, { status: 500 });
    }
}

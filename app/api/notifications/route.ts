import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function pickJwtKey(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    if (c && c.startsWith('eyJ')) return c;
  }
  return candidates.find((c) => c && c.length > 10) || '';
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = pickJwtKey(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return createClient(supabaseUrl, supabaseKey);
}

// GET — Fetch notifications for a recipient
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const supabase = getSupabaseClient();

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_uid', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.warn('[api/notifications] Supabase query error:', error.message);
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    // Count unread
    const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length;

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount
    });
  } catch (err: any) {
    console.error('[api/notifications] GET exception:', err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

// POST — Create notification (server-to-server or authenticated client)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipient_uid,
      actor_uid,
      actor_name,
      actor_avatar,
      type,
      post_id,
      post_preview,
    } = body;

    if (!recipient_uid || !actor_name || !type) {
      return NextResponse.json({ error: 'Missing required notification fields' }, { status: 400 });
    }

    // Don't notify yourself
    if (actor_uid && actor_uid === recipient_uid) {
      return NextResponse.json({ success: true, message: 'Self notification skipped' });
    }

    const supabase = getSupabaseClient();

    const insertPayload: any = {
      recipient_uid,
      actor_uid: actor_uid || null,
      actor_name,
      actor_avatar: actor_avatar || null,
      type,
      post_id: post_id || null,
      post_preview: post_preview ? post_preview.slice(0, 100) : null,
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.warn('[api/notifications] Insert warning:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[api/notifications] POST exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PATCH — Mark as read (single or all)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, recipient_uid, all } = body;

    const supabase = getSupabaseClient();

    if (all && recipient_uid) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_uid', recipient_uid)
        .eq('is_read', false);

      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (id) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ error: 'Missing id or recipient_uid' }, { status: 400 });
  } catch (err: any) {
    console.error('[api/notifications] PATCH exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE — Remove notification (single or all)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const recipient_uid = searchParams.get('recipient_uid');
    const all = searchParams.get('all') === 'true';

    const supabase = getSupabaseClient();

    if (all && recipient_uid) {
      await supabase
        .from('notifications')
        .delete()
        .eq('recipient_uid', recipient_uid);

      return NextResponse.json({ success: true, message: 'All notifications deleted' });
    }

    if (id) {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ error: 'Missing id or recipient_uid' }, { status: 400 });
  } catch (err: any) {
    console.error('[api/notifications] DELETE exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

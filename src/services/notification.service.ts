import { supabase } from '../config/supabaseClient';

export type NotificationType =
  | 'like'
  | 'love'
  | 'haha'
  | 'wow'
  | 'sad'
  | 'angry'
  | 'upvote'
  | 'comment'
  | 'poll_vote'
  | 'mention'
  | 'remix'
  | 'system';

export interface AppNotification {
  id: string;
  recipient_uid: string;
  actor_uid?: string;
  actor_name: string;
  actor_avatar?: string;
  actor_username?: string;
  type: NotificationType;
  post_id?: string;
  post_preview?: string;
  is_read: boolean;
  created_at: string;
}

const CACHE_KEY_PREFIX = 'tolzy_notifications_';

export function getCachedNotifications(userId: string): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCachedNotifications(userId: string, notifications: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(notifications.slice(0, 50)));
  } catch {
    // Ignore quota issues
  }
}

/**
 * Fetch notifications for a user with client-side Supabase + REST fallback
 */
export async function fetchUserNotifications(userId: string): Promise<AppNotification[]> {
  if (!userId) return [];

  try {
    // 1. Try direct Supabase query
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_uid', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && Array.isArray(data)) {
      saveCachedNotifications(userId, data as AppNotification[]);
      return data as AppNotification[];
    }
  } catch (err) {
    console.warn('[notification.service] Supabase direct query failed, falling back to API:', err);
  }

  // 2. Fallback to API route
  try {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&limit=50`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.notifications)) {
        saveCachedNotifications(userId, json.notifications);
        return json.notifications;
      }
    }
  } catch (err) {
    console.error('[notification.service] API fallback failed:', err);
  }

  return getCachedNotifications(userId);
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  if (!id) return;
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  } catch {
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_uid', userId)
      .eq('is_read', false);
  } catch {
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true, recipient_uid: userId })
    }).catch(() => {});
  }
}

/**
 * Delete a notification by ID
 */
export async function deleteNotificationById(id: string): Promise<void> {
  if (!id) return;
  try {
    await supabase.from('notifications').delete().eq('id', id);
  } catch {
    fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(() => {});
  }
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllUserNotifications(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await supabase.from('notifications').delete().eq('recipient_uid', userId);
  } catch {
    fetch(`/api/notifications?all=true&recipient_uid=${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    }).catch(() => {});
  }
}

/**
 * Send / Create a notification (client helper)
 */
export async function createNotification(payload: {
  recipient_uid: string;
  actor_uid?: string;
  actor_name: string;
  actor_avatar?: string;
  type: NotificationType;
  post_id?: string;
  post_preview?: string;
}): Promise<void> {
  if (!payload.recipient_uid || payload.recipient_uid === payload.actor_uid) return;

  try {
    await supabase.from('notifications').insert({
      recipient_uid: payload.recipient_uid,
      actor_uid: payload.actor_uid || null,
      actor_name: payload.actor_name,
      actor_avatar: payload.actor_avatar || null,
      type: payload.type,
      post_id: payload.post_id || null,
      post_preview: payload.post_preview?.slice(0, 80) || null,
      is_read: false,
    });
  } catch {
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  }
}

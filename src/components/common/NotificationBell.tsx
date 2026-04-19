"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Heart, MessageSquare, X, CheckCheck } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: string;
  actor_name: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | 'comment';
  post_id: string;
  post_preview: string;
  is_read: boolean;
  created_at: string;
}

const getReactionDetails = (type: string) => {
  switch (type) {
    case 'like': return { icon: <Heart size={16} fill="currentColor" />, colorClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-500', text: 'أعجب بمنشورك 👍' };
    case 'love': return { icon: <Heart size={16} fill="currentColor" />, colorClass: 'bg-red-100 dark:bg-red-500/20 text-red-500', text: 'أحب منشورك ❤️' };
    case 'haha': return { icon: <span className="text-[15px] leading-none">😂</span>, colorClass: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600', text: 'تفاعل بـ هاها 😂' };
    case 'wow': return { icon: <span className="text-[15px] leading-none">😮</span>, colorClass: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600', text: 'تفاعل بـ واو 😮' };
    case 'sad': return { icon: <span className="text-[15px] leading-none">😢</span>, colorClass: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600', text: 'تفاعل بـ حزين 😢' };
    case 'angry': return { icon: <span className="text-[15px] leading-none">😡</span>, colorClass: 'bg-orange-100 dark:bg-orange-500/20 text-orange-500', text: 'تفاعل بـ غاضب 😡' };
    case 'comment': return { icon: <MessageSquare size={16} />, colorClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-500', text: 'ردّ على منشورك 💬' };
    default: return { icon: <Bell size={16} />, colorClass: 'bg-slate-100 text-slate-500', text: 'تفاعل مع منشورك' };
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} س`;
  return `${Math.floor(hours / 24)} ي`;
};

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ─── Fetch on mount ───────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_uid', user.uid)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ─── Real-time subscription ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_uid=eq.${user.uid}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // ─── Close dropdown on outside click ─────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ─── Mark all read ────────────────────────────────────────────────
  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_uid', user.uid)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // ─── Mark single read ─────────────────────────────────────────────
  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        aria-label="الإشعارات"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-200"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#fea619]" />
              <h3 className="font-black text-slate-800 dark:text-white text-sm">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <CheckCheck size={12} />
                  قراءة الكل
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white ml-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#fea619] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                <Bell size={32} className="opacity-30" />
                <p className="text-sm font-medium">لا توجد إشعارات بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-white/5">
                {notifications.map(n => (
                  <a
                    key={n.id}
                    href={n.type === 'comment' ? `/community?action=comment&postId=${n.post_id}#post-${n.post_id}` : `/community#post-${n.post_id}`}
                    onClick={() => { markRead(n.id); setIsOpen(false); }}
                    className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                      !n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getReactionDetails(n.type).colorClass}`}>
                      {getReactionDetails(n.type).icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                        <span className="font-black">{n.actor_name}</span>
                        {' ' + getReactionDetails(n.type).text}
                      </p>
                      {n.post_preview && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          "{n.post_preview}"
                        </p>
                      )}
                    </div>

                    {/* Time + Unread dot */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {timeAgo(n.created_at)}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-50 dark:border-white/5 text-center">
              <span className="text-[11px] text-slate-400 font-medium">
                آخر {notifications.length} إشعار
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

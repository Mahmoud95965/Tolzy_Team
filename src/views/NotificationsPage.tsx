"use client";
import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    case 'like': return { icon: <Heart size={18} fill="currentColor" />, colorClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-500', text: 'أعجب بمنشورك 👍' };
    case 'love': return { icon: <Heart size={18} fill="currentColor" />, colorClass: 'bg-red-100 dark:bg-red-500/20 text-red-500', text: 'أحب منشورك ❤️' };
    case 'haha': return { icon: <span className="text-lg leading-none">😂</span>, colorClass: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600', text: 'تفاعل بـ هاها 😂' };
    case 'wow': return { icon: <span className="text-lg leading-none">😮</span>, colorClass: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600', text: 'تفاعل بـ واو 😮' };
    case 'sad': return { icon: <span className="text-lg leading-none">😢</span>, colorClass: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600', text: 'تفاعل بـ حزين 😢' };
    case 'angry': return { icon: <span className="text-lg leading-none">😡</span>, colorClass: 'bg-orange-100 dark:bg-orange-500/20 text-orange-500', text: 'تفاعل بـ غاضب 😡' };
    case 'comment': return { icon: <MessageSquare size={18} />, colorClass: 'bg-blue-100 dark:bg-blue-500/20 text-blue-500', text: 'ردّ على منشورك 💬' };
    default: return { icon: <Bell size={18} />, colorClass: 'bg-slate-100 text-slate-500', text: 'تفاعل مع منشورك' };
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_uid', user.uid)
      .order('created_at', { ascending: false });
      
    if (data) setNotifications(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications_page:${user.uid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_uid=eq.${user.uid}` },
        (payload) => setNotifications(prev => [payload.new as Notification, ...prev])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('recipient_uid', user.uid).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };
  
  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to post
    e.stopPropagation();
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <PageLayout>
      <main className="max-w-4xl mx-auto px-4 py-12 pb-32" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <Bell size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-1">الإشعارات</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">تابع تفاعل المجتمع مع منشوراتك</p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors w-max"
            >
              <CheckCheck size={18} />
              تحديد الكل كمقروء ({unreadCount})
            </button>
          )}
        </div>

        <div className="mb-6 rounded-3xl border border-amber-200/80 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-900/20 p-5">
          <p className="text-sm text-slate-700 dark:text-slate-100 mb-2">
            ملف PDF جديد: إجابة سؤال <span className="font-semibold">لماذا تدفع 219 جنيهاً في TOLZY Pro؟</span>
          </p>
          <a
            href="https://zdhjnbsjkglumsakpmoj.supabase.co/storage/v1/object/public/article-pdfs/gklfkgflgkfgkfgf.pdf"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200 hover:text-amber-700 dark:hover:text-amber-100"
          >
            فتح ملف PDF كامل
          </a>
        </div>

        {/* Content */}
        {!user ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">يرجى تسجيل الدخول</h2>
            <p className="text-slate-500">يجب عليك تسجيل الدخول لرؤية إشعاراتك.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#fea619] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 text-slate-400">
            <Bell size={64} className="opacity-20 mb-4" />
            <h2 className="text-xl font-black text-slate-600 dark:text-slate-300 mb-2">لا توجد إشعارات</h2>
            <p className="text-slate-400">عندما يتفاعل شخص ما مع منشوراتك، ستظهر الإشعارات هنا.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, index) => (
              <motion.a
                key={n.id}
                href={n.type === 'comment' ? `/community?action=comment&postId=${n.post_id}#post-${n.post_id}` : `/community#post-${n.post_id}`}
                onClick={() => markRead(n.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                className={`relative flex items-start gap-3 p-4 rounded-2xl border transition-all hover:shadow-md group shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden ${
                  !n.is_read 
                    ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50' 
                    : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Unread Edge Indicator (RTL is right) */}
                {!n.is_read && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 relative z-10 ${getReactionDetails(n.type).colorClass}`}>
                  {getReactionDetails(n.type).icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1 relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] text-slate-800 dark:text-slate-200 leading-relaxed mb-0.5">
                      <span className="font-bold text-[15px] ml-1">{n.actor_name}</span>
                      <span className={!n.is_read ? 'font-semibold' : 'font-normal'}>
                        {getReactionDetails(n.type).text}
                      </span>
                    </p>
                    <span className="text-[11px] font-medium text-slate-400 shrink-0 whitespace-nowrap mt-1">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>

                  {n.post_preview && (
                    <div className="text-[13px] text-slate-500 dark:text-slate-400 border-r-2 border-slate-200 dark:border-slate-700 pr-2.5 py-0.5 mt-1 truncate max-w-full">
                      "{n.post_preview}"
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="shrink-0 flex items-center h-full pt-1 relative z-10">
                  <button 
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="حذف الإشعار"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default NotificationsPage;

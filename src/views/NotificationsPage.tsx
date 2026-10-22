"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { AppNotification } from '../services/notification.service';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Heart, 
  MessageSquare, 
  BarChart3, 
  AtSign, 
  Sparkles, 
  ExternalLink, 
  LogIn, 
  Users, 
  Check, 
  ArrowLeft,
  Flame,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCentralAuthUrl } from '../utils/authRedirect';

type FilterTab = 'all' | 'unread' | 'reactions' | 'comments' | 'mentions';

// Visual metadata for each notification type
const getNotificationTypeDetails = (type: string) => {
  switch (type) {
    case 'like':
    case 'upvote':
      return {
        icon: <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#ef4444] text-[#ef4444]" />,
        badgeBg: 'bg-rose-50 border-rose-200 text-rose-600',
        verb: 'أعجب بمنشورك',
      };
    case 'love':
      return {
        icon: <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#ef4444] text-[#ef4444]" />,
        badgeBg: 'bg-rose-50 border-rose-200 text-rose-600',
        verb: 'أحب منشورك ❤️',
      };
    case 'haha':
      return {
        icon: <span className="text-[11px] leading-none">😂</span>,
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
        verb: 'تفاعل بـ 😂 على منشورك',
      };
    case 'wow':
      return {
        icon: <span className="text-[11px] leading-none">😮</span>,
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
        verb: 'تفاعل بـ 😮 على منشورك',
      };
    case 'sad':
      return {
        icon: <span className="text-[11px] leading-none">😢</span>,
        badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
        verb: 'تفاعل بـ 😢 على منشورك',
      };
    case 'angry':
      return {
        icon: <span className="text-[11px] leading-none">😡</span>,
        badgeBg: 'bg-orange-50 border-orange-200 text-orange-700',
        verb: 'تفاعل بـ 😡 على منشورك',
      };
    case 'comment':
      return {
        icon: <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#14140f] fill-[#14140f]" />,
        badgeBg: 'bg-[#beff50] border-[#14140f]/20 text-[#14140f]',
        verb: 'علّق على منشورك',
      };
    case 'poll_vote':
      return {
        icon: <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />,
        badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        verb: 'صوّت في استطلاعك',
      };
    case 'mention':
      return {
        icon: <AtSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#14140f]" />,
        badgeBg: 'bg-[#beff50] border-[#14140f]/20 text-[#14140f]',
        verb: 'أشار إليك في مناقشة',
      };
    case 'remix':
      return {
        icon: <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600" />,
        badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
        verb: 'طوّر برومبتك',
      };
    default:
      return {
        icon: <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#14140f]" />,
        badgeBg: 'bg-[#f5f5eb] border-[#d2d2c8] text-[#14140f]',
        verb: 'تفاعل مع مساهمتك',
      };
  }
};

// Compact relative time format
const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return 'الآن';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `${minutes} د`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} س`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ي`;
    return new Date(dateStr).toLocaleDateString('ar-EG');
  } catch {
    return 'الآن';
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.is_read);
      case 'reactions':
        return notifications.filter((n) =>
          ['like', 'love', 'haha', 'wow', 'sad', 'angry', 'upvote'].includes(n.type)
        );
      case 'comments':
        return notifications.filter((n) => n.type === 'comment');
      case 'mentions':
        return notifications.filter((n) =>
          ['poll_vote', 'mention', 'remix'].includes(n.type)
        );
      case 'all':
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const reactionsCount = useMemo(() => {
    return notifications.filter((n) =>
      ['like', 'love', 'haha', 'wow', 'sad', 'angry', 'upvote'].includes(n.type)
    ).length;
  }, [notifications]);

  const commentsCount = useMemo(() => {
    return notifications.filter((n) => n.type === 'comment').length;
  }, [notifications]);

  const mentionsCount = useMemo(() => {
    return notifications.filter((n) =>
      ['poll_vote', 'mention', 'remix'].includes(n.type)
    ).length;
  }, [notifications]);

  const tabs: { id: FilterTab; label: string; count: number; icon: React.ElementType }[] = [
    { id: 'all', label: 'الكل', count: notifications.length, icon: Bell },
    { id: 'unread', label: 'غير مقروء', count: unreadCount, icon: Flame },
    { id: 'reactions', label: 'إعجابات', count: reactionsCount, icon: Heart },
    { id: 'comments', label: 'تعليقات', count: commentsCount, icon: MessageSquare },
    { id: 'mentions', label: 'إشارات', count: mentionsCount, icon: AtSign },
  ];

  // Tap anywhere on card to navigate to post and mark as read
  const handleCardClick = (n: AppNotification) => {
    if (!n.is_read) {
      markAsRead(n.id);
    }
    const targetUrl = n.post_id ? `/community#post-${n.post_id}` : '/community';
    router.push(targetUrl);
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#ffffff] selection:bg-[#beff50] selection:text-[#14140f] pb-28 sm:pb-36" dir="rtl">
        <main className="max-w-2xl mx-auto px-3.5 sm:px-6 pt-6 sm:pt-12">

          {/* ========================================================= */}
          {/* 1. APP-LIKE SLEEK HEADER                                 */}
          {/* ========================================================= */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#14140f] text-[#beff50] flex items-center justify-center shrink-0 shadow-sm">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[#14140f]">
                    الإشعارات
                  </h1>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#beff50] text-[#14140f] border border-[#14140f] text-[10px] sm:text-xs font-bold animate-pulse">
                      {unreadCount} جديد
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-[#6e6e64] hidden sm:block">
                  تحديثات تفاعل مجتمع تولزي مع مساهماتك لحظة بلحظة
                </p>
              </div>
            </div>

            {/* Quick Actions (Compact on mobile) */}
            {user && notifications.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f5f5eb] hover:bg-[#beff50] text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] text-xs font-medium transition-all cursor-pointer"
                    title="تحديد الكل كمقروء"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">قراءة الكل</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة الإشعارات؟')) {
                      clearAll();
                    }
                  }}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#ffffff] hover:bg-rose-50 text-[#a0a096] hover:text-rose-600 border border-[#d2d2c8] text-xs transition-colors cursor-pointer"
                  title="مسح كافة الإشعارات"
                  aria-label="مسح الكل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline mr-1">مسح</span>
                </button>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 2. GUEST STATE (IF NOT LOGGED IN)                        */}
          {/* ========================================================= */}
          {!user ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] space-y-4 my-6">
              <div className="w-14 h-14 rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#14140f] shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-[#14140f]">
                  سجّل دخولك لمتابعة إشعاراتك
                </h2>
                <p className="text-xs text-[#6e6e64] max-w-sm mx-auto leading-relaxed">
                  تابع ردود الأعضاء، الإعجابات، والإشارات الموجهة إليك في مجتمع تولزي التقني.
                </p>
              </div>
              <Link
                href={getCentralAuthUrl('/notifications')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] font-medium text-xs sm:text-sm transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول الآن</span>
              </Link>
            </div>
          ) : (
            <>
              {/* ========================================================= */}
              {/* 3. FLUID HORIZONTAL PILL TABS                            */}
              {/* ========================================================= */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-0.5 mb-4 scrollbar-none snap-x snap-mandatory">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-medium transition-all select-none cursor-pointer shrink-0 snap-center ${
                        isActive
                          ? 'bg-[#beff50] text-[#14140f] border border-[#14140f] shadow-sm'
                          : 'bg-[#f5f5eb] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f]/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive
                            ? 'bg-[#14140f] text-[#ffffff]'
                            : 'bg-[#ffffff] text-[#6e6e64] border border-[#d2d2c8]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ========================================================= */}
              {/* 4. NOTIFICATION CARDS LIST                                */}
              {/* ========================================================= */}
              {loading && notifications.length === 0 ? (
                /* Skeleton Loader */
                <div className="space-y-2.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] animate-pulse flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#d2d2c8]/60 shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="w-1/2 h-3.5 bg-[#d2d2c8]/60 rounded" />
                        <div className="w-4/5 h-2.5 bg-[#d2d2c8]/40 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                /* Clean Empty State */
                <div className="text-center py-16 sm:py-24 px-4 rounded-2xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] space-y-3.5 my-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#6e6e64] shadow-sm">
                    {activeTab === 'reactions' ? (
                      <Heart className="w-6 h-6 text-rose-500" />
                    ) : activeTab === 'comments' ? (
                      <MessageSquare className="w-6 h-6 text-indigo-500" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-[#14140f]" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#14140f]">
                      {activeTab === 'unread'
                        ? 'أنت على اطلاع بكل جديد!'
                        : 'لا توجد إشعارات في هذا القسم'}
                    </h3>
                    <p className="text-xs text-[#6e6e64] max-w-xs mx-auto leading-relaxed">
                      {activeTab === 'unread'
                        ? 'لقد راجعت جميع التنبيهات. تصفح بقية الأقسام للاطلاع على سجل التفاعلات.'
                        : 'عندما يتفاعل أعضاء المجتمع مع منشوراتك واستطلاعاتك، ستظهر التنبيهات هنا فوراً.'}
                    </p>
                  </div>

                  <Link
                    href="/community"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffffff] hover:bg-[#beff50] text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] text-xs font-medium transition-all shadow-none"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>استكشف نقاشات المجتمع</span>
                  </Link>
                </div>
              ) : (
                /* Notification Feed Cards (Native App-Like Touch Area) */
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {filteredNotifications.map((n, index) => {
                      const typeMeta = getNotificationTypeDetails(n.type);
                      const initialLetter = (n.actor_name || 'م')[0].toUpperCase();

                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.2) }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => handleCardClick(n)}
                          className={`group relative p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none overflow-hidden ${
                            !n.is_read
                              ? 'bg-[#ffffff] border-[#14140f] shadow-sm'
                              : 'bg-[#f5f5eb] hover:bg-[#ffffff] border-[#d2d2c8] hover:border-[#14140f]/50'
                          }`}
                        >
                          {/* Unread Accent Edge */}
                          {!n.is_read && (
                            <div className="absolute top-0 right-0 bottom-0 w-1 bg-[#beff50]" />
                          )}

                          {/* Left: Avatar with Floating Mini Action Badge */}
                          <div className="relative shrink-0 mt-0.5">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center font-bold text-xs sm:text-sm text-[#14140f] shadow-sm overflow-hidden">
                              {n.actor_avatar ? (
                                <img
                                  src={n.actor_avatar}
                                  alt={n.actor_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{initialLetter}</span>
                              )}
                            </div>

                            {/* Floating mini action badge attached to avatar */}
                            <div className={`absolute -bottom-1 -left-1 p-0.5 sm:p-1 rounded-full border shadow-xs ${typeMeta.badgeBg}`}>
                              {typeMeta.icon}
                            </div>
                          </div>

                          {/* Center: Content & Details */}
                          <div className="flex-1 min-w-0 pr-0.5">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p className="text-xs sm:text-sm text-[#14140f] leading-snug truncate">
                                {n.actor_uid ? (
                                  <Link
                                    href={`/community/user/${n.actor_uid}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-bold text-[#14140f] hover:underline ml-1"
                                  >
                                    {n.actor_name}
                                  </Link>
                                ) : (
                                  <span className="font-bold ml-1">{n.actor_name}</span>
                                )}
                                <span className="font-normal text-[#6e6e64]">{typeMeta.verb}</span>
                              </p>

                              <span className="text-[10px] text-[#a0a096] font-mono shrink-0 whitespace-nowrap">
                                {formatRelativeTime(n.created_at)}
                              </span>
                            </div>

                            {/* Post Preview Quotation Card */}
                            {n.post_preview && (
                              <div className="text-[11px] text-[#43433b] bg-[#ffffff] p-2 rounded-xl border border-[#d2d2c8]/60 mt-1.5 line-clamp-2 leading-relaxed">
                                "{n.post_preview}"
                              </div>
                            )}

                            {/* Mobile Inline Hint */}
                            <div className="flex items-center justify-between pt-1 text-[10px] text-[#a0a096]">
                              <span className="flex items-center gap-1 group-hover:text-[#14140f] transition-colors">
                                <span>عرض المنشور</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </span>

                              {!n.is_read && (
                                <span className="w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f]" />
                              )}
                            </div>
                          </div>

                          {/* Right/Delete Action */}
                          <div className="shrink-0 pt-0.5 self-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="p-1.5 rounded-full text-[#a0a096] hover:text-rose-600 hover:bg-[#ffffff] transition-colors"
                              title="حذف هذا الإشعار"
                              aria-label="حذف الإشعار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </PageLayout>
  );
}

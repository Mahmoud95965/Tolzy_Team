"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { getNotificationMeta, formatRelativeTime } from '../components/common/NotificationBell';
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
  Check,
  RotateCcw,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCentralAuthUrl } from '../utils/authRedirect';

type FilterTab = 'all' | 'unread' | 'reactions' | 'comments' | 'polls_mentions';

const NotificationsPage: React.FC = () => {
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

  // Filter notifications according to active tab
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
      case 'polls_mentions':
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

  const pollsMentionsCount = useMemo(() => {
    return notifications.filter((n) =>
      ['poll_vote', 'mention', 'remix'].includes(n.type)
    ).length;
  }, [notifications]);

  const tabs = [
    { id: 'all' as FilterTab, label: 'الكل', count: notifications.length },
    { id: 'unread' as FilterTab, label: 'غير المقروءة', count: unreadCount },
    { id: 'reactions' as FilterTab, label: 'الإعجابات والتفاعلات', count: reactionsCount },
    { id: 'comments' as FilterTab, label: 'التعليقات', count: commentsCount },
    { id: 'polls_mentions' as FilterTab, label: 'الاستطلاعات والإشارات', count: pollsMentionsCount },
  ];

  return (
    <PageLayout>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pb-32" dir="rtl">
        {/* ========================================================= */}
        {/* 1. EDITORIAL HEADER                                       */}
        {/* ========================================================= */}
        <section className="space-y-4 mb-8 sm:mb-10">
          {/* Eyebrow status pill */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.05em] bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8]">
            <span className="w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f] shrink-0" />
            <span>مركز التنبيهات وتفاعل المجتمع</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#14140f]">
                الإشعارات والتفاعلات
              </h1>
              <p className="text-xs sm:text-sm text-[#6e6e64] max-w-xl font-normal leading-relaxed">
                تابع ردود الأعضاء على منشوراتك، الأصوات في استطلاعاتك، والإشارات الموجهة إليك أولاً بأول.
              </p>
            </div>

            {/* Quick Batch Actions */}
            {user && notifications.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] border border-[#14140f] text-xs font-medium transition-colors select-none cursor-pointer"
                    title="تحديد كافة الإشعارات كمقروءة"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>قراءة الكل ({unreadCount})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة الإشعارات؟')) {
                      clearAll();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#ffffff] hover:bg-[#f5f5eb] text-[#6e6e64] hover:text-[#ef4444] border border-[#d2d2c8] text-xs font-normal transition-colors select-none cursor-pointer"
                  title="حذف جميع الإشعارات"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">مسح الكل</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. AUTH GUARD STATE                                       */}
        {/* ========================================================= */}
        {!user ? (
          <div className="text-center py-16 px-4 bg-[#f5f5eb] border border-[#d2d2c8] rounded-2xl sm:rounded-[28px] space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#14140f]">
              <Bell className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#14140f]">يرجى تسجيل الدخول لمشاهدة إشعاراتك</h2>
              <p className="text-xs text-[#6e6e64] max-w-sm mx-auto">
                سجل دخولك لتتمكن من متابعة التفاعلات، الردود، والأنشطة الخاصة بحسابك في مجتمع تولزي.
              </p>
            </div>
            <Link
              href={getCentralAuthUrl('/notifications')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] font-medium text-xs sm:text-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول الآن</span>
            </Link>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* 3. FAST BENTO FILTER TABS                                 */}
            {/* ========================================================= */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm transition-colors select-none cursor-pointer ${
                      isActive
                        ? 'bg-[#beff50] text-[#14140f] font-medium border border-[#14140f]'
                        : 'bg-[#ffffff] text-[#6e6e64] hover:text-[#14140f] border border-[#d2d2c8] hover:border-[#14140f] font-normal'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#14140f] text-[#ffffff] font-medium'
                          : 'bg-[#f5f5eb] text-[#6e6e64] border border-[#d2d2c8]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* 4. NOTIFICATIONS LIST & SKELETON LOADERS                  */}
            {/* ========================================================= */}
            {loading && notifications.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 sm:p-5 rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] animate-pulse flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#d2d2c8]/60 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="w-1/3 h-4 bg-[#d2d2c8]/60 rounded" />
                      <div className="w-2/3 h-3 bg-[#d2d2c8]/40 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20 px-4 rounded-2xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#6e6e64]">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#14140f]">
                    {activeTab === 'unread'
                      ? 'رائع! لقد اطلعت على جميع إشعاراتك'
                      : 'لا توجد إشعارات في هذا القسم حالياً'}
                  </h3>
                  <p className="text-xs text-[#6e6e64] max-w-sm mx-auto">
                    {activeTab === 'unread'
                      ? 'لا توجد أي إشعارات غير مقروءة بانتظارك. تصفح بقية الأقسام لمعاينة التنبيهات السابقة.'
                      : 'عندما يتفاعل أعضاء المجتمع مع مساهماتك أو يعلقون على أفكارك، ستظهر تفاصيلها هنا.'}
                  </p>
                </div>
                {activeTab !== 'all' && (
                  <button
                    onClick={() => setActiveTab('all')}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ffffff] border border-[#d2d2c8] text-xs font-medium text-[#14140f] hover:bg-[#beff50] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>عرض كافة الإشعارات</span>
                  </button>
                )}
              </div>
            ) : (
              /* Notification Cards List */
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((n, index) => {
                    const meta = getNotificationMeta(n.type);
                    const postUrl = n.post_id 
                      ? `/community#post-${n.post_id}` 
                      : '/community';

                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.25) }}
                        className={`group relative p-4 sm:p-5 rounded-2xl border transition-all text-right overflow-hidden flex items-start gap-3.5 select-none ${
                          !n.is_read
                            ? 'bg-[#ffffff] border-[#14140f] shadow-sm'
                            : 'bg-[#f5f5eb] border-[#d2d2c8] hover:border-[#14140f]/60'
                        }`}
                      >
                        {/* Unread Accent Indicator */}
                        {!n.is_read && (
                          <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-[#beff50] border-l border-[#14140f]" />
                        )}

                        {/* Action Icon / Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-none ${meta.bg}`}
                        >
                          {meta.icon}
                        </div>

                        {/* Text and Preview Body */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <p className="text-xs sm:text-sm text-[#14140f] leading-snug">
                              {n.actor_uid ? (
                                <Link
                                  href={`/community/user/${n.actor_uid}`}
                                  className="font-bold text-[#14140f] hover:underline ml-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {n.actor_name}
                                </Link>
                              ) : (
                                <span className="font-bold ml-1">{n.actor_name}</span>
                              )}
                              <span className="font-normal text-[#6e6e64]">{meta.label}</span>
                            </p>

                            <span className="text-[11px] font-normal text-[#a0a096] shrink-0">
                              {formatRelativeTime(n.created_at)}
                            </span>
                          </div>

                          {/* Post Preview Quote */}
                          {n.post_preview && (
                            <Link
                              href={postUrl}
                              onClick={() => {
                                if (!n.is_read) markAsRead(n.id);
                              }}
                              className="block my-2 p-2.5 rounded-xl bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] text-xs text-[#14140f] transition-colors"
                            >
                              <span className="text-[10px] text-[#6e6e64] font-medium block mb-0.5">
                                محتوى المنشور المستهدف:
                              </span>
                              <p className="line-clamp-2 leading-relaxed text-[#14140f]">
                                "{n.post_preview}"
                              </p>
                            </Link>
                          )}

                          {/* Bottom Row Actions */}
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <Link
                              href={postUrl}
                              onClick={() => {
                                if (!n.is_read) markAsRead(n.id);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#14140f] hover:underline"
                            >
                              <span>معاينة في المجتمع</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>

                            {!n.is_read ? (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#6e6e64] hover:text-[#14140f] transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>تعليم كمقروء</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#a0a096]">تمت القراءة</span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="shrink-0 pt-0.5">
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="p-1.5 rounded-full text-[#a0a096] hover:text-[#ef4444] hover:bg-[#ffffff] transition-colors"
                            title="حذف الإشعار"
                            aria-label="حذف الإشعار"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </PageLayout>
  );
};

export default NotificationsPage;

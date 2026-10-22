"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  X, 
  CheckCheck, 
  BarChart3, 
  AtSign, 
  Sparkles, 
  ArrowLeft,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';
import { AppNotification, NotificationType } from '../../services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';

export const getNotificationMeta = (type: NotificationType | string) => {
  switch (type) {
    case 'like':
    case 'upvote':
      return {
        icon: <Heart className="w-4 h-4 fill-current text-[#14140f]" />,
        bg: 'bg-[#beff50] text-[#14140f] border border-[#14140f]/20',
        label: 'أعجب بمنشورك'
      };
    case 'love':
      return {
        icon: <Heart className="w-4 h-4 fill-[#ef4444] text-[#ef4444]" />,
        bg: 'bg-red-50 text-red-600 border border-red-200',
        label: 'أحب منشورك ❤️'
      };
    case 'haha':
      return {
        icon: <span className="text-sm">😂</span>,
        bg: 'bg-amber-50 text-amber-700 border border-amber-200',
        label: 'تفاعل بـ هاها'
      };
    case 'wow':
      return {
        icon: <span className="text-sm">😮</span>,
        bg: 'bg-amber-50 text-amber-700 border border-amber-200',
        label: 'تفاعل بـ واو'
      };
    case 'sad':
      return {
        icon: <span className="text-sm">😢</span>,
        bg: 'bg-blue-50 text-blue-700 border border-blue-200',
        label: 'تفاعل بـ حزين'
      };
    case 'angry':
      return {
        icon: <span className="text-sm">😡</span>,
        bg: 'bg-orange-50 text-orange-700 border border-orange-200',
        label: 'تفاعل بـ غاضب'
      };
    case 'comment':
      return {
        icon: <MessageSquare className="w-4 h-4 text-[#14140f]" />,
        bg: 'bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8]',
        label: 'علّق على منشورك'
      };
    case 'poll_vote':
      return {
        icon: <BarChart3 className="w-4 h-4 text-[#14140f]" />,
        bg: 'bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8]',
        label: 'صوّت في استطلاعك'
      };
    case 'mention':
      return {
        icon: <AtSign className="w-4 h-4 text-[#14140f]" />,
        bg: 'bg-[#beff50] text-[#14140f] border border-[#14140f]/20',
        label: 'أشار إليك في مناقشة'
      };
    case 'remix':
      return {
        icon: <Sparkles className="w-4 h-4 text-[#14140f]" />,
        bg: 'bg-[#beff50] text-[#14140f] border border-[#14140f]/20',
        label: 'قام بتطوير برومبتك'
      };
    default:
      return {
        icon: <Bell className="w-4 h-4 text-[#14140f]" />,
        bg: 'bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8]',
        label: 'تفاعل جديد'
      };
  }
};

export const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return 'الآن';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} د`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} س`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `منذ ${days} ي`;
    return new Date(dateStr).toLocaleDateString('ar-EG');
  } catch {
    return 'مؤخراً';
  }
};

const NotificationBell: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.is_read) {
      markAsRead(n.id);
    }
    setIsOpen(false);
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full border border-[#d2d2c8] bg-[#ffffff] hover:bg-[#f5f5eb] text-[#14140f] transition-colors focus:outline-none select-none cursor-pointer"
        aria-label="الإشعارات والتنبيهات"
        title="الإشعارات"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#beff50] text-[#14140f] border border-[#14140f] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[330px] sm:w-[380px] bg-[#ffffff] text-[#14140f] rounded-2xl sm:rounded-[24px] border border-[#d2d2c8] shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-[#d2d2c8] bg-[#f5f5eb] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#14140f] text-[#ffffff] flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#14140f]">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#beff50] text-[#14140f] border border-[#14140f]/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} جديد
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#14140f] hover:underline px-2 py-1 rounded-lg hover:bg-[#ffffff] transition-colors"
                    title="تحديد الكل كمقروء"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>قراءة الكل</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-[#6e6e64] hover:text-[#14140f] hover:bg-[#ffffff] transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[380px] divide-y divide-[#d2d2c8]/40">
              {loading && notifications.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#14140f] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#6e6e64]">جاري جلب الإشعارات...</p>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#6e6e64]">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#14140f]">لا توجد إشعارات بعد</h4>
                    <p className="text-[11px] text-[#6e6e64] mt-0.5">
                      عندما يتفاعل أحد مع منشوراتك أو يشاركك الرأي، ستظهر التنبيهات هنا.
                    </p>
                  </div>
                </div>
              ) : (
                recentNotifications.map((n) => {
                  const meta = getNotificationMeta(n.type);
                  const postUrl = n.post_id 
                    ? `/community#post-${n.post_id}` 
                    : '/community';

                  return (
                    <div
                      key={n.id}
                      className={`relative flex items-start gap-2.5 p-3 hover:bg-[#f5f5eb] transition-colors text-right group ${
                        !n.is_read ? 'bg-[#f5f5eb]/50' : 'bg-[#ffffff]'
                      }`}
                    >
                      {/* Unread indicator bar */}
                      {!n.is_read && (
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#beff50] border-l border-[#14140f]/20" />
                      )}

                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-none ${meta.bg}`}>
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <Link
                        href={postUrl}
                        onClick={() => handleNotificationClick(n)}
                        className="flex-1 min-w-0 pr-0.5 block"
                      >
                        <p className="text-xs text-[#14140f] leading-snug">
                          <span className="font-bold ml-1">{n.actor_name}</span>
                          <span className="text-[#6e6e64]">{meta.label}</span>
                        </p>

                        {n.post_preview && (
                          <p className="text-[11px] text-[#6e6e64] line-clamp-1 mt-1 bg-[#f5f5eb] px-2 py-0.5 rounded-md border border-[#d2d2c8]/60">
                            "{n.post_preview}"
                          </p>
                        )}

                        <span className="text-[10px] text-[#a0a096] block mt-1">
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </Link>

                      {/* Quick Delete on hover */}
                      <div className="shrink-0 flex items-center gap-1 self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="p-1 rounded-full text-[#a0a096] hover:text-[#ef4444] hover:bg-[#ffffff] transition-colors opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                          title="حذف الإشعار"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#d2d2c8] bg-[#f5f5eb] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#6e6e64]">
                عرض آخر {recentNotifications.length} من {notifications.length}
              </span>
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#14140f] hover:text-[#43433b] hover:underline"
              >
                <span>جميع الإشعارات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

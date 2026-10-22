"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabaseClient';
import {
  AppNotification,
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  deleteAllUserNotifications,
  getCachedNotifications,
  saveCachedNotifications
} from '../services/notification.service';

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  // Refresh / Fetch function
  const refreshNotifications = useCallback(async () => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await fetchUserNotifications(user.uid);
      setNotifications(data);
    } catch (err: any) {
      console.warn('[NotificationsContext] fetch error:', err);
      setError(err.message || 'فشل تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Initial load on user login
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // 1. Instant load from localStorage
    const cached = getCachedNotifications(user.uid);
    if (cached.length > 0) {
      setNotifications(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // 2. Network sync
    refreshNotifications();
  }, [user?.uid, refreshNotifications]);

  // Real-time Supabase Subscription
  useEffect(() => {
    if (!user?.uid) return;

    const channelName = `notifications_channel_${user.uid}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_uid=eq.${user.uid}`,
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            const updated = [newNotif, ...prev];
            saveCachedNotifications(user.uid, updated);
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_uid=eq.${user.uid}`,
        },
        (payload) => {
          const updatedNotif = payload.new as AppNotification;
          setNotifications((prev) => {
            const updated = prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n));
            saveCachedNotifications(user.uid, updated);
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setNotifications((prev) => {
              const updated = prev.filter((n) => n.id !== deletedId);
              saveCachedNotifications(user.uid, updated);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.uid]);

  // Mark single notification as read
  const handleMarkAsRead = useCallback(async (id: string) => {
    if (!id || !user?.uid) return;

    // Optimistic UI update
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      saveCachedNotifications(user.uid, updated);
      return updated;
    });

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.warn('[NotificationsContext] markRead error:', err);
    }
  }, [user?.uid]);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    // Optimistic UI update
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, is_read: true }));
      saveCachedNotifications(user.uid, updated);
      return updated;
    });

    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (err) {
      console.warn('[NotificationsContext] markAllRead error:', err);
    }
  }, [user?.uid]);

  // Delete single notification
  const handleDeleteNotification = useCallback(async (id: string) => {
    if (!id || !user?.uid) return;

    // Optimistic UI update
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveCachedNotifications(user.uid, updated);
      return updated;
    });

    try {
      await deleteNotificationById(id);
    } catch (err) {
      console.warn('[NotificationsContext] delete error:', err);
    }
  }, [user?.uid]);

  // Clear all notifications
  const handleClearAll = useCallback(async () => {
    if (!user?.uid) return;

    // Optimistic UI update
    setNotifications([]);
    saveCachedNotifications(user.uid, []);

    try {
      await deleteAllUserNotifications(user.uid);
    } catch (err) {
      console.warn('[NotificationsContext] clearAll error:', err);
    }
  }, [user?.uid]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
      deleteNotification: handleDeleteNotification,
      clearAll: handleClearAll,
      refreshNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      handleMarkAsRead,
      handleMarkAllAsRead,
      handleDeleteNotification,
      handleClearAll,
      refreshNotifications,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

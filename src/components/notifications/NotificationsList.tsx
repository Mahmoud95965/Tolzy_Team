import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Unsubscribe, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Check, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import { LoadingSpinnerSmall } from '../common/LoadingSpinner';

interface Notification {
  id: string;
  userId: string;
  toolId: string;
  toolName: string;
  type: 'tool_approved' | 'tool_rejected';
  message: string;
  createdAt: string;
  read: boolean;
}

const NotificationsList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // تم حذف سطر hasIndex من هنا
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user?.email) return;

    let unsubscribe: Unsubscribe | undefined;

    const setupNotifications = () => {
      const notificationsRef = collection(db, 'notifications');

      const q = query(
        notificationsRef,
        where('userId', '==', user.email),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const newNotifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Notification));
          setNotifications(newNotifications);
          setLoading(false);
          // تم حذف setHasIndex(true)
          setError(null);
        },
        (error) => {
          console.error('Error with indexed query:', error);
          if (error.message.includes('requires an index')) {
            // تم حذف setHasIndex(false)
            const basicQuery = query(
              notificationsRef,
              where('userId', '==', user.email)
            );

            unsubscribe = onSnapshot(basicQuery,
              (snapshot) => {
                const newNotifications = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                } as Notification))
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setNotifications(newNotifications);
                setLoading(false);
                setError(null);
              },
              (error) => {
                console.error('Error fetching notifications:', error);
                setError('حدث خطأ في تحميل الإشعارات');
                setLoading(false);
              }
            );
          } else {
            setError('حدث خطأ في تحميل الإشعارات');
            setLoading(false);
          }
        }
      );
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.email]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('حدث خطأ في تحديث حالة الإشعار');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('حدث خطأ في حذف الإشعار');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await Promise.all(notifications.map(notification =>
        deleteDoc(doc(db, 'notifications', notification.id))
      ));
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      setError('حدث خطأ في حذف جميع الإشعارات');
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications
        .filter(n => !n.read)
        .map(notification =>
          updateDoc(doc(db, 'notifications', notification.id), { read: true })
        ));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('حدث خطأ في تحديث حالة الإشعارات');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {loading ? (
        <div className="flex justify-center items-center min-h-[100px]">
          <LoadingSpinnerSmall />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400 p-4">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400 p-4">
          لا توجد إشعارات جديدة
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? (
                <span className="text-blue-600 dark:text-blue-400">
                  {unreadCount} إشعارات غير مقروءة
                </span>
              ) : (
                <span>جميع الإشعارات مقروءة</span>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center"
                >
                  <CheckCircle className="h-4 w-4 ml-1" />
                  تحديد الكل كمقروء
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={deleteAllNotifications}
                  className="text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف الكل
                </button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg shadow-sm border ${notification.read
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'tool_approved' ? (
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                  </div>
                  <div className="mr-3 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white flex justify-between items-start">
                      <span>
                        {notification.type === 'tool_approved' ? 'تم قبول الأداة' : 'تم رفض الأداة'}
                      </span>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: notification.message }}
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleString('ar-EG')}
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                      >
                        <CheckCircle className="h-3 w-3 ml-1" />
                        تحديد كمقروء
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
"use client";
import { useState, useEffect } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { app, firebaseConfig } from '../config/firebase';

export const useFCMToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        // Only run on client side and check if browser supports messaging
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        const supported = await isSupported();
        if (!supported) {
          console.log('Firebase Messaging is not supported in this browser.');
          return;
        }

        // Check if NEXT_PUBLIC_FIREBASE_VAPID_KEY is configured
        if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
          console.warn('FCM ignored: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing in .env.local');
          return;
        }

        if (typeof Notification === 'undefined') return;

        // If user already dismissed or denied permission, do not prompt again to avoid browser console warnings
        if (Notification.permission === 'denied') {
          return;
        }

        let permission: NotificationPermission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
          return;
        }

        const messaging = getMessaging(app);
        
        // Passing config securely via URL so the SW can initialize Firebase dynamically
        const swConfigStr = encodeURIComponent(JSON.stringify(firebaseConfig));
        const registration = await navigator.serviceWorker.register(
            `/firebase-messaging-sw.js?firebaseConfig=${swConfigStr}`,
            { scope: '/' }
        );

        // Wait for service worker to actually be ready/active to avoid PushManager error
        await navigator.serviceWorker.ready;

// Fetch token
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          setToken(currentToken);
        } else {
          console.warn('No registration token available. Failed to generate FCM token.');
        }

        // --- Foreground Message Listener ---
        const { onMessage } = await import('firebase/messaging');
        const { default: toast } = await import('react-hot-toast');
        const React = await import('react');
        
        onMessage(messaging, (payload) => {
          console.log('[FCM] Foreground message received:', payload);
          const title = payload.notification?.title || payload.data?.title || 'إشعار جديد';
          const body = payload.notification?.body || payload.data?.body || '';
          
          const url = payload.data?.url;

          toast.custom(
            (t: any) => React.createElement(
              'div',
              {
                className: `${t.visible ? 'animate-fade-in-up' : 'animate-fade-out-down'} max-w-sm w-full bg-white dark:bg-[#080808] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-2xl pointer-events-auto flex ring-1 ring-slate-100 dark:ring-white/5 overflow-hidden transition-all duration-300 transform`
              },
              // 1. Left Gradient Line
              React.createElement('div', { className: 'w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600' }),
              
              // 2. Main Content Area
              React.createElement(
                'div',
                { 
                  className: 'flex-1 p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors',
                  onClick: () => {
                    toast.dismiss(t.id);
                    if (url) {
                      window.location.href = url;
                    } else {
                      window.location.href = '/notifications';
                    }
                  }
                },
                React.createElement(
                  'div',
                  { className: 'flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/50 shadow-inner' },
                  React.createElement('span', { className: 'text-lg drop-shadow-sm' }, title.includes('إعجاب') ? '❤️' : '💬')
                ),
                React.createElement(
                  'div',
                  { className: 'flex-1 pt-0.5' },
                  React.createElement('p', { className: 'text-[14px] font-black text-slate-900 dark:text-white mb-1 tracking-tight' }, title),
                  body ? React.createElement('p', { className: 'text-[12px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 font-medium' }, body) : null
                )
              ),

              // 3. Close Button
              React.createElement(
                'div',
                { className: 'flex border-r border-slate-100 dark:border-white/5' },
                React.createElement(
                  'button',
                  {
                    onClick: () => toast.dismiss(t.id),
                    className: 'w-full rounded-none rounded-l-2xl p-3 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none',
                    'aria-label': 'Close'
                  },
                  React.createElement(
                    'svg',
                    { xmlns: 'http://www.w3.org/2000/svg', className: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
                    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
                  )
                )
              )
            ),
            { duration: 6000, position: 'top-center' }
          );
        });

      } catch (error) {
        console.error('An error occurred while retrieving FCM token.', error);
      }
    };

    retrieveToken();
  }, []);

  return token;
};


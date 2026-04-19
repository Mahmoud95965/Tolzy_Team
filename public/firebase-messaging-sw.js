importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// ─── Config Persistence Strategy ───────────────────────────────────────────
const CONFIG_CACHE_KEY = 'tolzy-fcm-config-v1';

async function saveConfig(config) {
  try {
    const cache = await caches.open(CONFIG_CACHE_KEY);
    const response = new Response(JSON.stringify(config));
    await cache.put('/fcm-config', response);
  } catch (e) {
    console.warn('[SW] Failed to cache config:', e);
  }
}

async function loadConfig() {
  try {
    const cache = await caches.open(CONFIG_CACHE_KEY);
    const response = await cache.match('/fcm-config');
    if (response) {
      return await response.json();
    }
  } catch (e) {
    console.warn('[SW] Failed to load cached config:', e);
  }
  return null;
}

async function initializeFirebase() {
  const urlParams = new URL(location).searchParams;
  const configParam = urlParams.get('firebaseConfig');

  let firebaseConfig = null;

  if (configParam) {
    try {
      firebaseConfig = JSON.parse(decodeURIComponent(configParam));
      await saveConfig(firebaseConfig);
    } catch (e) {
      console.error('[SW] Failed to parse config from URL:', e);
    }
  }

  if (!firebaseConfig) {
    firebaseConfig = await loadConfig();
  }

  if (!firebaseConfig) {
    console.warn('[SW] No Firebase config available. Push notifications rely on native handler.');
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('[SW] Firebase initialized successfully.');
    }
  } catch (e) {
    console.error('[SW] Error initializing Firebase:', e);
  }
}

// ─── Initialize Firebase at Top Level ───────────────────────────────────────
// Must be called before event listeners are registered
initializeFirebase();

// ─── Top-Level Event Listeners (مطلوبة هنا لتجنب خطأ المتصفح) ─────────────
// These MUST be registered at the top level for the browser to recognize them
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    if (!payload.notification && payload.data) {
      const title = payload.data.title || 'إشعار جديد من Tolzy';
      const options = {
        body: payload.data.body || '',
        icon: '/tolzy-logo-192.png',
        badge: '/tolzy-logo-192.png',
        tag: payload.data.postId || 'tolzy-push-' + Date.now(),
        vibrate: [200, 100, 200],
        data: payload.data
      };
      event.waitUntil(self.registration.showNotification(title, options));
    }
  } catch (e) {
    console.warn('[SW] Error parsing push payload:', e);
  }
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ─── SW Lifecycle ───────────────────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
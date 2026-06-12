import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const apiOrigin = new URL(apiBase).origin;

registerRoute(
  ({ url }) => url.origin === apiOrigin,
  new StaleWhileRevalidate({
    cacheName: 'api-data',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

const pending = new Map();

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { tag, title, body, fireAt } = event.data;
    const delay = fireAt - Date.now();
    if (delay <= 0) return;

    if (pending.has(tag)) clearTimeout(pending.get(tag));

    const timer = setTimeout(async () => {
      pending.delete(tag);
      await self.registration.showNotification(title, {
        body,
        tag,
        icon: '/pwa-192.png',
        badge: '/pwa-icon.svg',
        vibrate: [200, 100, 200],
      });
    }, delay);

    pending.set(tag, timer);
  }

  if (event.data.type === 'CANCEL_NOTIFICATION') {
    const { tag } = event.data;
    if (pending.has(tag)) {
      clearTimeout(pending.get(tag));
      pending.delete(tag);
    }
    self.registration.getNotifications({ tag }).then((ns) => ns.forEach((n) => n.close()));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((wins) => {
      if (wins.length > 0) return wins[0].focus();
      return clients.openWindow('/');
    })
  );
});

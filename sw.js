/* FO Study service worker — build 26.11
 * Clears stale Cache API entries and asks open clients to reload once.
 * No fetch handler / no shell caching (older SWs pinned a phone layout).
 * Asset freshness comes from ?v=26.11 query busts on index.html.
 */
const BUILD = '26.11';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clients) {
      try { c.postMessage({ type: 'FO_STUDY_SW_UPDATED', build: BUILD }); } catch (_) {}
    }
  })());
});

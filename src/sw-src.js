importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

const cacheWhitelist = ['json-cache', 'static-resources', 'cdn-cache']; // List of cache names you want to keep

if (workbox) {
  console.log('Workbox loaded successfully');

  const { registerRoute } = workbox.routing;
  const { NetworkFirst } = workbox.strategies;
  const { precacheAndRoute } = workbox.precaching;

  // Precache assets (generated via Workbox CLI)
  // precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache all JSON files with NetworkFirst
  registerRoute(
    ({ url }) => url.pathname.endsWith('.json'),
    new NetworkFirst({
      cacheName: 'json-cache',
      networkTimeoutSeconds: 10,
    })
  );

  // Cache static resources (styles, scripts, images)
  registerRoute(
    ({ request }) => ['style', 'script', 'image','document'].includes(request.destination),
    new NetworkFirst({
      cacheName: 'static-resources',
    })
  );

  // Cache external resources (e.g., jsdelivr, unpkg)
  registerRoute(
    ({ url }) => url.origin.includes('jsdelivr.net') || url.origin.includes('unpkg.com'),
    new NetworkFirst({
      cacheName: 'cdn-cache',
    })
  );

  // Force new service worker to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim() // Take control of all open pages
  );
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If the cache is not in the whitelist, delete it
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Deleting outdated cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

} else {
  console.error('Workbox failed to load');
}

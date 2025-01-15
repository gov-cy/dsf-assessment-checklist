importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

const cacheWhitelist = ['json-cache', 'static-resources', 'cdn-cache']; // List of cache names you want to keep

if (workbox) {
  console.log('Workbox loaded successfully');

  const { registerRoute } = workbox.routing;
  const { NetworkFirst } = workbox.strategies;
  const { precacheAndRoute } = workbox.precaching;

  // Precache assets (generated via Workbox CLI)
  // precacheAndRoute([{"revision":"8d9ecfc1a9b9c4f39819b5a2fda5b2a2","url":"data/accessibilityresults.json"},{"revision":"c9abec297d5c7df7b1819f985a65bfe6","url":"data/list.json"},{"revision":"0c16444a5aa20b34f6beea6514280c90","url":"data/lists.json"},{"revision":"c8af3e5382048f910f8eb6a556fe3327","url":"index.html"},{"revision":"099068baa661f591a93ca7d129ca3443","url":"js/app.js"},{"revision":"a1822059653762415b67aa04dd9ba7bd","url":"js/navigo.min.js"},{"revision":"aa434ff1580b89ab3e03602be10531fa","url":"js/sw-registration.js"},{"revision":"8ee44ea5662d7a8e979f7c89406acacb","url":"manifest.json"}] || []);

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

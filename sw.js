const CACHE_NAME = 'health-tracker-v3';

const ASSETS_TO_CACHE = [
  'index.html',
  'logs.html',
  'styles.css',
  'logs.css',
  'js/storage.js',
  'js/toast.js',
  'js/health.js',
  'js/validation.js',
  'js/csv.js',
  'js/download.js',
  'js/exercise-queue.js',
  'js/index-page.js',
  'js/charts.js',
  'js/entries-view.js',
  'js/backup.js',
  'js/logs-page.js',
  'manifest.json',
  'icon.svg',
  'icon-maskable.svg',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3'
];

// Install: cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache local assets as a group; cache CDN assets individually so one
      // failure doesn't block the whole install.
      const localAssets = ASSETS_TO_CACHE.filter(url => !url.startsWith('http'));
      const cdnAssets   = ASSETS_TO_CACHE.filter(url => url.startsWith('http'));

      return cache.addAll(localAssets).then(() =>
        Promise.allSettled(cdnAssets.map(url => cache.add(url)))
      );
    })
  );
  self.skipWaiting();
});

// Activate: remove stale caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network, cache new responses
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Don't cache non-successful or opaque responses for local files
        if (!response || response.status !== 200) return response;

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

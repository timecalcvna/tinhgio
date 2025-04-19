// ✅ service-worker.js cho repo /tinhgio/
const CACHE_NAME = 'timecalc-v1';
const urlsToCache = [
  '/tinhgio/',
  '/tinhgio/index.html',
  '/tinhgio/manifest.json',
  '/tinhgio/icon-192.png',
  '/tinhgio/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

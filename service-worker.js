// service-worker.js cho repo /tinhgio/
// Chiến lược: ưu tiên mạng (luôn lấy bản mới nhất), chỉ dùng bản lưu sẵn khi mất mạng.
// Khi cần buộc cập nhật bộ nhớ đệm, chỉ cần tăng số phiên bản bên dưới.
const CACHE_NAME = 'timecalc-v2';
const urlsToCache = [
  '/tinhgio/',
  '/tinhgio/index.html',
  '/tinhgio/manifest.json',
  '/tinhgio/icon-192.png',
  '/tinhgio/icon-512.png'
];

// Cài đặt: lưu sẵn các file cần thiết và kích hoạt ngay, không chờ đóng tab cũ
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(() => {})
  );
});

// Kích hoạt: xoá bộ nhớ đệm cũ (vd. timecalc-v1) rồi tải lại các tab đang mở để hiện bản mới
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const hadOldCache = keys.some(key => key !== CACHE_NAME);
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
    if (hadOldCache) {
      const windows = await self.clients.matchAll({ type: 'window' });
      windows.forEach(client => client.navigate(client.url));
    }
  })());
});

// Mỗi lần tải: thử mạng trước, lưu lại bản mới; mất mạng thì trả bản đã lưu
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request, { ignoreSearch: true })
          .then(cached => cached || caches.match('/tinhgio/index.html'))
      )
  );
});

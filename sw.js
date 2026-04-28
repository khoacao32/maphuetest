const CACHE_NAME = 'hue-map-cache-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'map.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'
];

// Cài đặt service worker và cache file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Kích hoạt và dọn cache cũ nếu có
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// Bắt request và trả về từ cache nếu có
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(response => {
        // Cache động cho các request mới
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        // Nếu offline và không có cache, trả về fallback
        if (event.request.destination === 'document') {
          return caches.match('index.html');
        }
      });
    })
  );
});

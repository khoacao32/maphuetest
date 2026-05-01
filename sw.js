const CACHE_NAME = 'hue-map-cache-v2'; // đổi tên mỗi lần cập nhật để ép xóa cache cũ
const urlsToCache = [
  'index.html',
  'manifest.json',
  'map.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'
];

// Cài đặt service worker và cache file tĩnh
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Kích hoạt và dọn cache cũ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// Bắt request
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Không cache dữ liệu từ Google Sheets
  if (url.hostname.includes('docs.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache cho các file tĩnh khác
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // Nếu offline và không có cache, fallback về index.html
      if (event.request.destination === 'document') {
        return caches.match('index.html');
      }
    })
  );
});

// Service Worker for Sổ Giáo Dân PWA
// Strategy:
//   - Static assets (JS, CSS, fonts, images): Cache First
//   - API routes (/api/*): Network Only (never cache sensitive data)
//   - Navigation (HTML pages): Network First with offline fallback

const CACHE_NAME = 'sgd-static-v1';
const OFFLINE_URL = '/offline';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/brand/icon-192.png',
  '/brand/icon-512.png',
  '/brand/apple-touch-icon.png',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
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
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept non-GET requests or cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // API routes: Network Only — never serve stale or cached auth/data responses
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/storage/')) {
    return;
  }

  // Static assets (_next/static, fonts, brand icons): Cache First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/brand/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|ico|svg|woff2?|ttf|otf)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached || fetch(request).then((response) => {
          // Cache a clone of the fresh response for next time
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
      )
    );
    return;
  }

  // Navigation (HTML): Network First, fall back to a simple offline message
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Không có kết nối — Sổ Giáo Dân</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #FDFBF7; color: #3D1C22; text-align: center; }
    img  { width: 80px; margin-bottom: 1.5rem; border-radius: 50%; }
    h1   { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p    { color: #7A4A50; }
    button { margin-top: 1.5rem; padding: 0.6rem 1.4rem; background: #8B2635; color: #fff;
             border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; }
  </style>
</head>
<body>
  <div>
    <img src="/brand/icon-192.png" alt="Logo" />
    <h1>Không có kết nối mạng</h1>
    <p>Vui lòng kiểm tra kết nối internet và thử lại.</p>
    <button onclick="location.reload()">Thử lại</button>
  </div>
</body>
</html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        )
      )
    );
    return;
  }
});

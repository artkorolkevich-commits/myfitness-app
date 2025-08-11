const CACHE_NAME = 'myfitness-v2';
const ASSETS = [
  './',
  './index.html',
  './history.html',
  './settings.html',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const accept = request.headers.get('accept') || '';

  // Страницы (HTML): network-first, fallback cache
  if (request.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(res => res || caches.match('./index.html')))
    );
    return;
  }

  // Статические ресурсы: stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }).catch(() => {
      // Fallback for CORS errors
      return new Response('', { status: 404 });
    })
  );
});

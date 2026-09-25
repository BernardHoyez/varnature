const CACHE_NAME = 'varnature-cache-v22';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './flore.html',
  './faune.html',
  './fiche.html',
  './famille-vegetales.html',
  './style.css',
  './manifest.json',
  './data/flore.json',
  './data/faune.json',
  './data/commentaires.json',
  './data/photos.json',
  './photos/_index.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first pour les pages/fichiers de l'app (HTML/JS/CSS/JSON de données)
  if (
    request.mode === 'navigate' ||
    PRECACHE_ASSETS.includes('.' + url.pathname.replace(/^\/[^/]*\//, '/')) ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first pour le reste (icônes, assets)
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

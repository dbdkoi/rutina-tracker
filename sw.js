const CACHE_NAME = 'apex-foco-v23';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com')) return;
  // Siempre la versión más reciente de la red (sin la caché HTTP de GitHub Pages); copia local solo sin conexión
  const req = e.request.mode === 'navigate' || e.request.url.endsWith('.html') || e.request.url.endsWith('/')
    ? new Request(e.request.url, { cache: 'no-store' }) : e.request;
  e.respondWith(
    fetch(req).then(r => { if (r.ok && e.request.method === 'GET') { const c = r.clone(); caches.open(CACHE_NAME).then(cc => cc.put(e.request, c)); } return r; })
      .catch(() => caches.match(e.request))
  );
});

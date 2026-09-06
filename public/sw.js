const CACHE = 'ics-rescue-v5';
const STATIC_FILES = [
  '/', '/demo', '/manifest.webmanifest', '/favicon.svg', '/apple-touch-icon.png',
  '/hero-calendar-portal-768.avif', '/hero-calendar-portal-768.webp',
  '/hero-calendar-portal-768.jpg', '/privacy/', '/terms/', '/404.html',
  '/legal.css', '/route-focus.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const home = await fetch('/');
    const markup = await home.clone().text();
    await cache.put('/', home);
    const builtAssets = [...markup.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
    await cache.addAll([...STATIC_FILES.slice(1), ...new Set(builtAssets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: event.request.mode === 'navigate', ignoreVary: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok && event.request.mode !== 'navigate') {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      if (event.request.mode === 'navigate') return (await caches.match('/')) || Response.error();
      return Response.error();
    }
  })());
});

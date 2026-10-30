const CACHE_NAME = 'mijn-recepten-v2.0.2';
const APP_SHELL = ['./', './index.html', './styles.css?v=2.0.2', './app.js?v=2.0.2', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon.png', './images/recipes/havermout-bananenpannenkoeken.webp', './images/recipes/mexicaanse-vulling.webp', './images/recipes/kip-met-rijst.webp', './images/recipes/kip-wraps.webp', './images/recipes/pasta-bolognese.webp', './images/recipes/pasta-carbonara.webp', './images/recipes/noedels-kip.webp', './images/recipes/kip-curry.webp', './images/recipes/groentesoep.webp', './images/recipes/linzencurry.webp', './images/recipes/shakshuka.webp', './images/recipes/zalm-met-rijst.webp', './images/recipes/tonijnsalade.webp', './images/recipes/quinoa-bowl.webp', './images/recipes/aardappelen-groente-kip.webp', './images/recipes/smoothie-bowl.webp', './images/recipes/omelet-groente.webp', './images/recipes/hamburgers.webp', './images/recipes/falafel-wraps.webp', './images/recipes/linzensoep.webp', './images/recipes/kwark-met-fruit.webp'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async path => {
      const response = await fetch(new Request(path, { cache: 'reload' }));
      if (!response.ok) throw new Error(`Kon appbestand niet ophalen: ${path}`);
      await cache.put(path, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('mijn-recepten-') && !key.startsWith('mijn-recepten-test-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first: while online, never prefer a potentially stale cached app asset.
  event.respondWith((async () => {
    try {
      const request = new Request(event.request, { cache: 'no-cache' });
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        const cacheKey = event.request.mode === 'navigate'
          ? './index.html'
          : new URL(event.request.url).pathname;
        await cache.put(cacheKey, response.clone());
      }
      return response;
    } catch (_) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') {
        const fallback = await caches.match('./index.html') || await caches.match('./');
        if (fallback) return fallback;
      }
      return new Response('Je bent offline en dit bestand staat niet in de cache. Maak verbinding met internet en open de app opnieuw.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});

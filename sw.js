const CACHE_NAME = 'money-manager-v34';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './database.js',
  './dexie.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()).then(() =>
      // Force-reload all open windows so they get the new cache immediately.
      // client.navigate() works even if old page code has no listeners.
      // Falls back to postMessage for browsers that don't support navigate().
      self.clients.matchAll({ type: 'window' }).then(clients =>
        Promise.all(clients.map(c =>
          c.navigate(c.url).catch(() => c.postMessage({ type: 'SW_UPDATED' }))
        ))
      )
    )
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.anthropic.com')) return;
  if (e.request.url.includes('generativelanguage.googleapis.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

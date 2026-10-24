'use strict';

const cacheName = 'academic-polyqual-game-v2';
const appShell = [
  './',
  './index.html',
  './further-reading.html',
  './styles.css?v=2026-06-20-reading',
  './app.js?v=2026-06-20',
  './manifest.webmanifest',
  './icons/polyqual-icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(appShell))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('academic-polyqual-game-') && key !== cacheName).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.registration.scope)) return;

  event.respondWith(
    caches.open(cacheName).then(cache => cache.match(event.request)).then(cached => (
      cached || fetch(event.request)
    ))
  );
});

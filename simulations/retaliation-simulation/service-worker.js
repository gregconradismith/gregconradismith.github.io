'use strict';

const cacheName = 'academic-retaliation-simulation-v1';
const appShell = [
  './',
  './index.html',
  './further-reading.html',
  './styles.css?v=2026-06-21-angles',
  './app.js?v=2026-06-21-better-buildings',
  './manifest.webmanifest',
  './icons/retaliation-icon.svg',
  './icons/retaliation-icon-180.png',
  './icons/retaliation-icon-192.png',
  './icons/retaliation-icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(appShell))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('academic-retaliation-simulation-') && key !== cacheName).map(key => caches.delete(key))
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

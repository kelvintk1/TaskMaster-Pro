/**
 * This is a dummy service worker file to prevent 404 errors in development.
 * These errors (GET /dev-sw.js 404) often occur when the browser has a 
 * stale service worker registered from a previous project on the same port.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

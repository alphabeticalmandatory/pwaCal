self.addEventListener('install', event => {
  alert('Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  alert('Service worker activating...');
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

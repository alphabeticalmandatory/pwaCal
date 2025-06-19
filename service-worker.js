self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("pwa-cache").then(cache => {
      return cache.addAll([
        "/",
        "/b.html",
        "/manifest.json",
        "/1.png",
        "/2.png"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

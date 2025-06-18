self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('mago-v1').then(cache => 
      cache.addAll(['/', '/index.html', '/models/phi-3-mini/model.bin'])
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => 
      response || fetch(event.request)
    )
  );
});
import { 
  CACHE_VERSION,
  MODEL_CACHE_NAME,
  ASSET_CACHE_NAME,
  Strategy,
  RoutePatterns,
  handleStaleWhileRevalidate,
  handleCacheFirst,
  handleNetworkFirst
} from './cache-strategies';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/models/phi-3-mini/model.bin',
  '/models/phi-3-mini/model.params',
  '/models/phi-3-mini/model.wasm'
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(MODEL_CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames
          .filter(name => name !== MODEL_CACHE_NAME && name !== ASSET_CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  let strategy: Strategy;
  let cacheName: string;

  if (RoutePatterns.Models.test(url.pathname)) {
    strategy = Strategy.Model;
    cacheName = MODEL_CACHE_NAME;
  } else if (RoutePatterns.Assets.test(url.pathname)) {
    strategy = Strategy.Asset;
    cacheName = ASSET_CACHE_NAME;
  } else {
    strategy = Strategy.Document;
    cacheName = ASSET_CACHE_NAME;
  }

  event.respondWith(
    (() => {
      switch(strategy) {
        case Strategy.Model:
          return handleStaleWhileRevalidate(request, cacheName);
        case Strategy.Asset:
          return handleCacheFirst(request, cacheName);
        case Strategy.Document:
          return handleNetworkFirst(request, cacheName);
        default:
          return fetch(request);
      }
    })()
  );
});

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'CLEAR_MODEL_CACHE') {
    caches.delete(MODEL_CACHE_NAME);
  }
});
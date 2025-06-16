export const CACHE_VERSION = 'mago-v1';
export const MODEL_CACHE_NAME = `${CACHE_VERSION}-models`;
export const ASSET_CACHE_NAME = `${CACHE_VERSION}-assets`;

export const Strategy = {
  Model: 'stale-while-revalidate',
  Asset: 'cache-first',
  Document: 'network-first'
} as const;

export type CacheStrategy = typeof Strategy[keyof typeof Strategy];

export const RoutePatterns = {
  Models: /\/models\/.*\.(bin|wasm|params)$/,
  Assets: /\/assets\/.*\.(png|jpg|webp|mp3|ogg|json)$/,
  Documents: /\.(html|js|css|ts|tsx)$/
};

export async function handleStaleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

export async function handleCacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;

  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

export async function handleNetworkFirst(request: Request, cacheName: string): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (e) {
    return caches.match(request) || Response.error();
  }
}
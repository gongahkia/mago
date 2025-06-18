export function createWorker<T>(url: URL | string): T {
  return new Worker(url, { type: 'module' }) as unknown as T;
}
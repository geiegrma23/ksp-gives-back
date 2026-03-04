// KV cache helpers

const KV_KEY = 'site_content_v1';

export async function getCached(env) {
  if (!env.CACHE) return null;
  return env.CACHE.get(KV_KEY, 'json');
}

export async function setCache(env, data) {
  if (!env.CACHE) return;
  await env.CACHE.put(KV_KEY, JSON.stringify(data), { expirationTtl: 3600 });
}

export async function purgeCache(env) {
  if (!env.CACHE) return;
  await env.CACHE.delete(KV_KEY);
}

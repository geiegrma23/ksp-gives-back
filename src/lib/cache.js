// KV cache helpers

// Purged by the CMS worker's afterChange hooks (SITE_CACHE binding), so edits
// in Payload show up immediately; the short TTL bounds staleness if a purge
// is ever missed.
const KV_KEY = 'cms_content_v1';
const TTL_SECONDS = 300;

export async function getCached(env) {
  if (!env.CACHE) return null;
  return env.CACHE.get(KV_KEY, 'json');
}

export async function setCache(env, data) {
  if (!env.CACHE) return;
  await env.CACHE.put(KV_KEY, JSON.stringify(data), { expirationTtl: TTL_SECONDS });
}

export async function purgeCache(env) {
  if (!env.CACHE) return;
  await env.CACHE.delete(KV_KEY);
}

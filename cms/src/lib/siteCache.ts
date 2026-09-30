import { getCfContext } from './cf'

// The public site worker (ksp-gives-back) caches its assembled /api/content
// response in KV. Purge it whenever content changes here so edits show up
// immediately instead of after the cache TTL.
const SITE_CACHE_KEY = 'cms_content_v1'

export const purgeSiteCache = async (): Promise<void> => {
  try {
    const { env } = await getCfContext()
    await (env as { SITE_CACHE?: { delete(key: string): Promise<void> } }).SITE_CACHE?.delete(
      SITE_CACHE_KEY,
    )
  } catch {
    // No binding available (e.g. isolated local dev) — nothing to purge
  }
}

export const siteCacheHooks = {
  afterChange: [purgeSiteCache],
  afterDelete: [purgeSiteCache],
}

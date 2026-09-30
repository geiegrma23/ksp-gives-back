// Media — serves files from R2 and lists gallery images.
// Legacy uploads live in the site's MEDIA bucket (old admin era); new uploads
// live in the CMS bucket (CMS_MEDIA) managed by Payload's media library.
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { cmsDocs } from '../lib/cms.js';

export async function handleMedia(request, env, url) {
  if (request.method === 'OPTIONS') return optionsResponse();

  // GET /api/media/public — list images for the public gallery
  if (request.method === 'GET' && url.pathname === '/api/media/public') {
    return handlePublicList(env);
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Serve a file: GET /media/:key — legacy bucket first, then the CMS bucket
export async function handleMediaServe(env, url) {
  const key = decodeURIComponent(url.pathname.replace('/media/', ''));
  if (!key) return jsonResponse({ error: 'Missing key' }, 400);

  let object = await env.MEDIA.get(key);
  if (!object && env.CMS_MEDIA) object = await env.CMS_MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
}

// Gallery list: legacy media table (old photos) merged with Payload's media
// collection (new uploads), newest first.
async function handlePublicList(env) {
  const [legacyResult, cmsDocsList] = await Promise.all([
    env.DB.prepare(
      'SELECT id, key, filename, content_type, size, created_at FROM media ORDER BY created_at DESC'
    ).all(),
    cmsDocs(env, '/api/media?limit=200&sort=-createdAt&depth=0').catch(() => []),
  ]);

  const cmsItems = cmsDocsList
    .filter((d) => (d.mimeType || '').startsWith('image/'))
    .map((d) => ({
      id: `cms-${d.id}`,
      key: d.filename,
      filename: d.filename,
      content_type: d.mimeType,
      size: d.filesize || 0,
      created_at: d.createdAt,
    }));

  // Legacy images were imported into the Payload media library (same
  // filename = same file) — don't list them twice.
  const cmsNames = new Set(cmsItems.map((m) => m.key));
  const legacyItems = (legacyResult.results || []).filter((m) => !cmsNames.has(m.key));

  const merged = [...cmsItems, ...legacyItems];
  merged.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return jsonResponse(merged);
}

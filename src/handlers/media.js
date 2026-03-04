// Media handler — upload/list/delete images via R2
import { jsonResponse, optionsResponse, corsHeaders } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';

export async function handleMedia(request, env, url) {
  if (request.method === 'OPTIONS') return optionsResponse();

  // POST /api/media — upload image
  if (request.method === 'POST' && url.pathname === '/api/media') {
    return handleUpload(request, env);
  }

  // GET /api/media — list all media (admin)
  if (request.method === 'GET' && url.pathname === '/api/media') {
    return handleList(request, env);
  }

  // DELETE /api/media/:id
  if (request.method === 'DELETE' && url.pathname.startsWith('/api/media/')) {
    return handleDelete(request, env, url);
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

// Serve image from R2: GET /media/:key
export async function handleMediaServe(env, url) {
  const key = url.pathname.replace('/media/', '');
  if (!key) return jsonResponse({ error: 'Missing key' }, 400);

  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
}

async function handleUpload(request, env) {
  if (!isAdmin(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file) return jsonResponse({ error: 'No file provided' }, 400);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return jsonResponse({ error: 'File type not allowed' }, 400);
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return jsonResponse({ error: 'File too large (max 10MB)' }, 400);
  }

  const ext = file.name.split('.').pop().toLowerCase();
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  await env.DB.prepare(
    `INSERT INTO media (key, filename, content_type, size, created_at) VALUES (?, ?, ?, ?, datetime('now'))`
  ).bind(key, file.name, file.type, file.size).run();

  const record = await env.DB.prepare('SELECT * FROM media WHERE key = ?').bind(key).first();

  return jsonResponse(record, 201);
}

async function handleList(request, env) {
  if (!isAdmin(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const result = await env.DB.prepare(
    'SELECT id, key, filename, content_type, size, created_at FROM media ORDER BY created_at DESC'
  ).all();

  return jsonResponse(result.results);
}

async function handleDelete(request, env, url) {
  if (!isAdmin(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const id = url.pathname.split('/').pop();
  const record = await env.DB.prepare('SELECT key FROM media WHERE id = ?').bind(id).first();
  if (!record) return jsonResponse({ error: 'Not found' }, 404);

  await env.MEDIA.delete(record.key);
  await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(id).run();

  return jsonResponse({ success: true });
}

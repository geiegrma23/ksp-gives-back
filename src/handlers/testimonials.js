// Testimonials CRUD handler
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';

export async function handleTestimonials(request, env, url) {
  if (request.method === 'OPTIONS') return optionsResponse();

  const idMatch = url.pathname.match(/^\/api\/testimonials\/(\d+)$/);
  const id = idMatch ? idMatch[1] : null;

  if (request.method === 'GET' && !id) return handleList(env, url);
  if (request.method === 'POST' && !id) return handleCreate(request, env);
  if (request.method === 'PUT' && id) return handleUpdate(request, env, id);
  if (request.method === 'DELETE' && id) return handleDeleteTestimonial(request, env, id);

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleList(env, url) {
  const showAll = url.searchParams.get('all') === '1';
  const query = showAll
    ? 'SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC'
    : "SELECT * FROM testimonials WHERE status = 'published' ORDER BY sort_order ASC";
  const result = await env.DB.prepare(query).all();
  return jsonResponse(result.results);
}

async function handleCreate(request, env) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const result = await env.DB.prepare(
    `INSERT INTO testimonials (name, role, quote, image_url, featured, sort_order, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(
    body.name, body.role || '', body.quote, body.image_url || '',
    body.featured ? 1 : 0, body.sort_order || 0, body.status || 'draft'
  ).run();

  const item = await env.DB.prepare('SELECT * FROM testimonials WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return jsonResponse(item, 201);
}

async function handleUpdate(request, env, id) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const existing = await env.DB.prepare('SELECT * FROM testimonials WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404);

  await env.DB.prepare(
    `UPDATE testimonials SET name=?, role=?, quote=?, image_url=?, featured=?, sort_order=?, status=?, updated_at=datetime('now') WHERE id=?`
  ).bind(
    body.name ?? existing.name,
    body.role ?? existing.role,
    body.quote ?? existing.quote,
    body.image_url ?? existing.image_url,
    body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured,
    body.sort_order ?? existing.sort_order,
    body.status ?? existing.status,
    id
  ).run();

  const updated = await env.DB.prepare('SELECT * FROM testimonials WHERE id = ?').bind(id).first();
  return jsonResponse(updated);
}

async function handleDeleteTestimonial(request, env, id) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);
  const existing = await env.DB.prepare('SELECT id FROM testimonials WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404);
  await env.DB.prepare('DELETE FROM testimonials WHERE id = ?').bind(id).run();
  return jsonResponse({ success: true });
}

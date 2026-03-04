// Events CRUD handler
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';

export async function handleEvents(request, env, url) {
  if (request.method === 'OPTIONS') return optionsResponse();

  const idMatch = url.pathname.match(/^\/api\/events\/(\d+)$/);
  const id = idMatch ? idMatch[1] : null;

  if (request.method === 'GET' && !id) return handleList(env, url);
  if (request.method === 'POST' && !id) return handleCreate(request, env);
  if (request.method === 'PUT' && id) return handleUpdate(request, env, id);
  if (request.method === 'DELETE' && id) return handleDeleteEvent(request, env, id);

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleList(env, url) {
  const showAll = url.searchParams.get('all') === '1';
  const query = showAll
    ? 'SELECT * FROM events ORDER BY date DESC'
    : "SELECT * FROM events WHERE status = 'published' ORDER BY date ASC";
  const result = await env.DB.prepare(query).all();
  return jsonResponse(result.results);
}

async function handleCreate(request, env) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const slug = body.slug || slugify(body.title);

  const result = await env.DB.prepare(
    `INSERT INTO events (title, slug, body, date, end_date, time_start, time_end, location, image_url, description, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(
    body.title, slug, body.body || '', body.date || null, body.end_date || null,
    body.time_start || null, body.time_end || null, body.location || '',
    body.image_url || '', body.description || '', body.status || 'draft'
  ).run();

  const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return jsonResponse(event, 201);
}

async function handleUpdate(request, env, id) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const existing = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404);

  await env.DB.prepare(
    `UPDATE events SET title=?, slug=?, body=?, date=?, end_date=?, time_start=?, time_end=?,
     location=?, image_url=?, description=?, status=?, updated_at=datetime('now') WHERE id=?`
  ).bind(
    body.title ?? existing.title,
    body.slug ?? existing.slug,
    body.body ?? existing.body,
    body.date ?? existing.date,
    body.end_date ?? existing.end_date,
    body.time_start ?? existing.time_start,
    body.time_end ?? existing.time_end,
    body.location ?? existing.location,
    body.image_url ?? existing.image_url,
    body.description ?? existing.description,
    body.status ?? existing.status,
    id
  ).run();

  const updated = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first();
  return jsonResponse(updated);
}

async function handleDeleteEvent(request, env, id) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);
  const existing = await env.DB.prepare('SELECT id FROM events WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404);
  await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
  return jsonResponse({ success: true });
}

function slugify(text) {
  return (text || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Navigation handler
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';
import { ensurePageForNav } from './pages.js';

export async function handleNav(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method === 'GET') return handleGetNav(env);
  if (request.method === 'PUT') return handlePutNav(request, env);
  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleGetNav(env) {
  const result = await env.DB.prepare(
    'SELECT id, label, url, sort_order, visible FROM nav_items ORDER BY sort_order'
  ).all();
  return jsonResponse(result.results);
}

async function handlePutNav(request, env) {
  if (!isAdmin(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let items;
  try {
    items = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (!Array.isArray(items)) {
    return jsonResponse({ error: 'Expected array of nav items' }, 400);
  }

  const db = env.DB;
  await db.exec('DELETE FROM nav_items');

  if (items.length) {
    const stmt = db.prepare(
      `INSERT INTO nav_items (label, url, sort_order, visible, updated_at) VALUES (?, ?, ?, ?, datetime('now'))`
    );
    const batch = items.map((item, i) =>
      stmt.bind(item.label, item.url, i + 1, item.visible !== false ? 1 : 0)
    );
    await db.batch(batch);
  }

  // Auto-create page stubs for any new nav URLs
  for (const item of items) {
    try { await ensurePageForNav(env, item.url); } catch {}
  }

  return handleGetNav(env);
}

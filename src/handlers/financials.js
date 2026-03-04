// Financials handler — reports, highlights, and intro text
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';

// GET /api/financials — public combined response
export async function handleFinancials(request, env, url) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const showAll = url.searchParams.get('all') === '1';

  const reportsQuery = showAll
    ? 'SELECT * FROM financial_reports ORDER BY created_at DESC'
    : "SELECT * FROM financial_reports WHERE status = 'published' ORDER BY created_at DESC";

  const [highlightsResult, reportsResult, fieldsResult] = await env.DB.batch([
    env.DB.prepare('SELECT * FROM financial_highlights ORDER BY sort_order ASC'),
    env.DB.prepare(reportsQuery),
    env.DB.prepare("SELECT key, value FROM site_content WHERE key IN ('financials_label','financials_title','financials_intro')"),
  ]);

  const fields = {};
  for (const row of fieldsResult.results) fields[row.key] = row.value;

  return jsonResponse({
    fields,
    highlights: highlightsResult.results,
    reports: reportsResult.results,
  });
}

// CRUD for financial reports
export async function handleFinancialReports(request, env, url) {
  if (request.method === 'OPTIONS') return optionsResponse();

  const idMatch = url.pathname.match(/^\/api\/financial-reports\/(\d+)$/);
  const id = idMatch ? idMatch[1] : null;

  if (request.method === 'POST' && !id) return createReport(request, env);
  if (request.method === 'PUT' && id) return updateReport(request, env, id);
  if (request.method === 'DELETE' && id) return deleteReport(request, env, id);

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

// PUT /api/financial-highlights — save collection
export async function handleFinancialHighlights(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'PUT') return jsonResponse({ error: 'Method not allowed' }, 405);
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let items;
  try { items = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  if (!Array.isArray(items)) return jsonResponse({ error: 'Expected array' }, 400);

  const db = env.DB;
  await db.exec('DELETE FROM financial_highlights');

  if (items.length) {
    const stmt = db.prepare(
      `INSERT INTO financial_highlights (label, value, description, sort_order, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    );
    const batch = items.map((h, i) =>
      stmt.bind(h.label, h.value, h.description || '', i + 1)
    );
    await db.batch(batch);
  }

  const result = await db.prepare('SELECT * FROM financial_highlights ORDER BY sort_order').all();
  return jsonResponse(result.results);
}

async function createReport(request, env) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const result = await env.DB.prepare(
    `INSERT INTO financial_reports (title, period, description, file_url, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(
    body.title, body.period || '', body.description || '',
    body.file_url || '', body.status || 'draft'
  ).run();

  const item = await env.DB.prepare('SELECT * FROM financial_reports WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return jsonResponse(item, 201);
}

async function updateReport(request, env, id) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const existing = await env.DB.prepare('SELECT * FROM financial_reports WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404);

  await env.DB.prepare(
    `UPDATE financial_reports SET title=?, period=?, description=?, file_url=?, status=?, updated_at=datetime('now') WHERE id=?`
  ).bind(
    body.title ?? existing.title,
    body.period ?? existing.period,
    body.description ?? existing.description,
    body.file_url ?? existing.file_url,
    body.status ?? existing.status,
    id
  ).run();

  const updated = await env.DB.prepare('SELECT * FROM financial_reports WHERE id = ?').bind(id).first();
  return jsonResponse(updated);
}

async function deleteReport(request, env, id) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);
  const existing = await env.DB.prepare('SELECT id FROM financial_reports WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404);
  await env.DB.prepare('DELETE FROM financial_reports WHERE id = ?').bind(id).run();
  return jsonResponse({ success: true });
}

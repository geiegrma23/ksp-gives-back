// Pages CRUD handler + dynamic page serving
import { jsonResponse, optionsResponse, corsHeaders } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';

// CRUD API for admin
export async function handlePagesApi(request, env, url) {
  if (request.method === 'OPTIONS') return optionsResponse();

  const idMatch = url.pathname.match(/^\/api\/pages\/(\d+)$/);
  const id = idMatch ? idMatch[1] : null;

  if (request.method === 'GET' && !id) return handleList(env, url);
  if (request.method === 'POST' && !id) return handleCreate(request, env);
  if (request.method === 'PUT' && id) return handleUpdate(request, env, id);
  if (request.method === 'DELETE' && id) return handleDeletePage(request, env, id);

  return jsonResponse({ error: 'Method not allowed' }, 405);
}

// Serve a dynamic page as HTML: GET /:slug/
export async function serveDynamicPage(env, slug) {
  const page = await env.DB.prepare(
    "SELECT * FROM pages WHERE slug = ? AND status = 'published'"
  ).bind(slug).first();

  if (!page) return null; // not found — let it fall through

  const html = renderPageHtml(page);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

// Auto-create a page stub for a nav URL if one doesn't exist
export async function ensurePageForNav(env, navUrl) {
  // Only handle internal paths like /about/, /something/
  if (!navUrl || navUrl === '/' || navUrl.startsWith('/#') || navUrl.startsWith('http')) return;
  // Skip known static pages
  const staticPages = ['/events/', '/testimonials/', '/financials/', '/gallery/', '/admin/'];
  if (staticPages.some(p => navUrl.startsWith(p))) return;

  const slug = navUrl.replace(/^\/|\/$/g, ''); // "/about/" -> "about"
  if (!slug) return;

  const existing = await env.DB.prepare('SELECT id FROM pages WHERE slug = ?').bind(slug).first();
  if (existing) return; // already exists

  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  await env.DB.prepare(
    `INSERT INTO pages (title, slug, body, status, created_at, updated_at)
     VALUES (?, ?, ?, 'draft', datetime('now'), datetime('now'))`
  ).bind(title, slug, '').run();
}

async function handleList(env, url) {
  const showAll = url.searchParams.get('all') === '1';
  const query = showAll
    ? 'SELECT * FROM pages ORDER BY title ASC'
    : "SELECT * FROM pages WHERE status = 'published' ORDER BY title ASC";
  const result = await env.DB.prepare(query).all();
  return jsonResponse(result.results);
}

async function handleCreate(request, env) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const slug = body.slug || slugify(body.title);

  const result = await env.DB.prepare(
    `INSERT INTO pages (title, slug, body, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(body.title, slug, body.body || '', body.status || 'draft').run();

  const page = await env.DB.prepare('SELECT * FROM pages WHERE id = ?')
    .bind(result.meta.last_row_id).first();
  return jsonResponse(page, 201);
}

async function handleUpdate(request, env, id) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const existing = await env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404);

  await env.DB.prepare(
    `UPDATE pages SET title=?, slug=?, body=?, status=?, updated_at=datetime('now') WHERE id=?`
  ).bind(
    body.title ?? existing.title,
    body.slug ?? existing.slug,
    body.body ?? existing.body,
    body.status ?? existing.status,
    id
  ).run();

  const updated = await env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind(id).first();
  return jsonResponse(updated);
}

async function handleDeletePage(request, env, id) {
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);
  const existing = await env.DB.prepare('SELECT id FROM pages WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: 'Not found' }, 404);
  await env.DB.prepare('DELETE FROM pages WHERE id = ?').bind(id).run();
  return jsonResponse({ success: true });
}

function slugify(text) {
  return (text || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function renderPageHtml(page) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const hasHtml = page.body && /<[a-z][\s\S]*>/i.test(page.body);
  const bodyHtml = page.body
    ? (hasHtml ? page.body : page.body.split('\n').map(p => p.trim() ? `<p>${esc(p)}</p>` : '').join(''))
    : '<p style="color:var(--steel);">This page is under construction.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.title)} — KSP Gives Back</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Bebas+Neue&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="page-header">
    <h1 class="section-title">${esc(page.title)}</h1>
    <div class="divider divider--center"></div>
  </div>
  <section style="padding:3rem 2rem 5rem;">
    <div class="container" style="max-width:800px;margin:0 auto;">
      <div style="color:var(--text-light);line-height:1.8;font-size:1.1rem;">
        ${bodyHtml}
      </div>
    </div>
  </section>
  <script src="/components/nav.js"></script>
  <script src="/components/footer.js"></script>
</body>
</html>`;
}

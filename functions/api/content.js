// GET /api/content — Public, returns all site content (KV-cached)
// PUT /api/content — Admin only, upserts content + purges KV cache

const KV_KEY = 'site_content_v1';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ── GET: Public read ──
export async function onRequestGet(context) {
  const { env } = context;

  // Try KV cache first
  if (env.CACHE) {
    const cached = await env.CACHE.get(KV_KEY, 'json');
    if (cached) {
      return jsonResponse(cached);
    }
  }

  // Fall back to D1
  const data = await loadAllContent(env.DB);

  // Cache in KV (1 hour TTL as safety net; we purge on save)
  if (env.CACHE) {
    await env.CACHE.put(KV_KEY, JSON.stringify(data), { expirationTtl: 3600 });
  }

  return jsonResponse(data);
}

// ── PUT: Admin write ──
export async function onRequestPut(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const db = env.DB;

  // Upsert singleton fields
  if (body.fields && typeof body.fields === 'object') {
    const stmt = db.prepare(
      `INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    );
    const batch = Object.entries(body.fields).map(([k, v]) => stmt.bind(k, String(v)));
    if (batch.length) await db.batch(batch);
  }

  // Upsert mission_cards (delete + reinsert for simplicity)
  if (Array.isArray(body.mission_cards)) {
    await db.exec('DELETE FROM mission_cards');
    if (body.mission_cards.length) {
      const stmt = db.prepare(
        `INSERT INTO mission_cards (title, body, sort_order, updated_at) VALUES (?, ?, ?, datetime('now'))`
      );
      const batch = body.mission_cards.map((c, i) => stmt.bind(c.title, c.body, i + 1));
      await db.batch(batch);
    }
  }

  // Upsert values_items
  if (Array.isArray(body.values_items)) {
    await db.exec('DELETE FROM values_items');
    if (body.values_items.length) {
      const stmt = db.prepare(
        `INSERT INTO values_items (title, description, sort_order, updated_at) VALUES (?, ?, ?, datetime('now'))`
      );
      const batch = body.values_items.map((v, i) => stmt.bind(v.title, v.description, i + 1));
      await db.batch(batch);
    }
  }

  // Upsert goals
  if (Array.isArray(body.goals)) {
    await db.exec('DELETE FROM goals');
    if (body.goals.length) {
      const stmt = db.prepare(
        `INSERT INTO goals (number, title, description, sort_order, updated_at) VALUES (?, ?, ?, ?, datetime('now'))`
      );
      const batch = body.goals.map((g, i) => stmt.bind(g.number, g.title, g.description, i + 1));
      await db.batch(batch);
    }
  }

  // Purge KV cache
  if (env.CACHE) {
    await env.CACHE.delete(KV_KEY);
  }

  // Return fresh data
  const data = await loadAllContent(db);
  return jsonResponse(data);
}

// ── Helpers ──

async function loadAllContent(db) {
  const [fieldsResult, cardsResult, valuesResult, goalsResult] = await db.batch([
    db.prepare('SELECT key, value FROM site_content'),
    db.prepare('SELECT id, title, body, sort_order FROM mission_cards ORDER BY sort_order'),
    db.prepare('SELECT id, title, description, sort_order FROM values_items ORDER BY sort_order'),
    db.prepare('SELECT id, number, title, description, sort_order FROM goals ORDER BY sort_order'),
  ]);

  const fields = {};
  for (const row of fieldsResult.results) {
    fields[row.key] = row.value;
  }

  return {
    fields,
    mission_cards: cardsResult.results,
    values_items: valuesResult.results,
    goals: goalsResult.results,
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

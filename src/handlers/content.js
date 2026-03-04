// Content handler — extracted from original index.js
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';
import { getCached, setCache, purgeCache } from '../lib/cache.js';

export async function handleContent(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method === 'GET') return handleGet(env);
  if (request.method === 'PUT') return handlePut(request, env);
  return jsonResponse({ error: 'Method not allowed' }, 405);
}

async function handleGet(env) {
  const cached = await getCached(env);
  if (cached) return jsonResponse(cached);

  const data = await loadAllContent(env.DB);
  await setCache(env, data);
  return jsonResponse(data);
}

async function handlePut(request, env) {
  if (!isAdmin(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const db = env.DB;

  if (body.fields && typeof body.fields === 'object') {
    const stmt = db.prepare(
      `INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    );
    const batch = Object.entries(body.fields).map(([k, v]) => stmt.bind(k, String(v)));
    if (batch.length) await db.batch(batch);
  }

  if (Array.isArray(body.mission_cards)) {
    await db.exec('DELETE FROM mission_cards');
    if (body.mission_cards.length) {
      const stmt = db.prepare(
        `INSERT INTO mission_cards (title, body, sort_order, updated_at) VALUES (?, ?, ?, datetime('now'))`
      );
      const batch = body.mission_cards.map((c, i) =>
        stmt.bind(c.title, c.body, i + 1)
      );
      await db.batch(batch);
    }
  }

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

  await purgeCache(env);
  const data = await loadAllContent(db);
  return jsonResponse(data);
}

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

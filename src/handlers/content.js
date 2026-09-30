// Content handler — assembles the legacy /api/content response from Payload CMS
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { getCached, setCache } from '../lib/cache.js';
import { cmsFetch, cmsDocs, mapSiteContentFields } from '../lib/cms.js';

export async function handleContent(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const cached = await getCached(env);
  if (cached) return jsonResponse(cached);

  const data = await loadAllContent(env);
  await setCache(env, data);
  return jsonResponse(data);
}

export async function loadAllContent(env) {
  const [global, missionCards, valuesItems, goals, heroGoals] = await Promise.all([
    cmsFetch(env, '/api/globals/site-content?depth=1'),
    cmsDocs(env, '/api/mission-cards?limit=50&sort=sort_order&depth=0'),
    cmsDocs(env, '/api/values-items?limit=50&sort=sort_order&depth=0'),
    cmsDocs(env, '/api/goals?limit=50&sort=sort_order&depth=0'),
    cmsDocs(env, '/api/hero-goals?limit=50&sort=sort_order&depth=0'),
  ]);

  return {
    fields: mapSiteContentFields(global),
    mission_cards: missionCards.map((d) => ({
      id: d.id,
      title: d.title,
      body: d.body,
      sort_order: d.sort_order,
    })),
    values_items: valuesItems.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      sort_order: d.sort_order,
    })),
    goals: goals.map((d) => ({
      id: d.id,
      number: d.number,
      title: d.title,
      description: d.description,
      sort_order: d.sort_order,
    })),
    hero_goals: heroGoals.map((d) => ({ id: d.id, text: d.text, sort_order: d.sort_order })),
  };
}

// Navigation handler — reads nav items from Payload CMS
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { cmsDocs } from '../lib/cms.js';

export async function handleNav(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const docs = await cmsDocs(env, '/api/nav-items?limit=50&sort=sort_order&depth=0');
  return jsonResponse(
    docs.map((d) => ({
      id: d.id,
      label: d.label,
      url: d.url,
      sort_order: d.sort_order,
      visible: d.visible ? 1 : 0,
    }))
  );
}

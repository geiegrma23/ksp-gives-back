// Events handler — reads published events from Payload CMS
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { cmsDocs, mapEvent } from '../lib/cms.js';

export async function handleEvents(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const docs = await cmsDocs(
    env,
    '/api/events?limit=100&sort=date&depth=1&where[status][equals]=published'
  );
  return jsonResponse(docs.map(mapEvent));
}

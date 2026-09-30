// Testimonials handler — reads published testimonials from Payload CMS
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { cmsDocs, mapTestimonial } from '../lib/cms.js';

export async function handleTestimonials(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const docs = await cmsDocs(
    env,
    '/api/testimonials?limit=100&sort=sort_order&depth=1&where[status][equals]=published'
  );
  return jsonResponse(docs.map(mapTestimonial));
}

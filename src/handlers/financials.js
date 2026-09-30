// Financials handler — combined public endpoint backed by Payload CMS
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { cmsFetch, cmsDocs, mediaName } from '../lib/cms.js';

export async function handleFinancials(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const [highlights, reports, global] = await Promise.all([
    cmsDocs(env, '/api/financial-highlights?limit=50&sort=sort_order&depth=0'),
    cmsDocs(
      env,
      '/api/financial-reports?limit=100&sort=-createdAt&depth=1&where[status][equals]=published'
    ),
    cmsFetch(env, '/api/globals/site-content?depth=0'),
  ]);

  return jsonResponse({
    fields: {
      financials_label: global.financials_label || '',
      financials_title: global.financials_title || '',
      financials_intro: global.financials_intro || '',
    },
    highlights: highlights.map((d) => ({
      id: d.id,
      label: d.label,
      value: d.value,
      description: d.description || '',
      sort_order: d.sort_order,
    })),
    reports: reports.map((d) => ({
      id: d.id,
      title: d.title,
      period: d.period || '',
      description: d.description || '',
      file_url: mediaName(d.file, d.file_url),
      status: d.status,
    })),
  });
}

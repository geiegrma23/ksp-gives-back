// Minnesota Quiet Valor — Worker Router
// Public site worker: serves static assets and read-only /api/* endpoints
// backed by the Payload CMS worker (mqv-cms, service binding CMS).
// Content editing happens at cms.mnquietvalor.com/admin.

import { jsonResponse } from './lib/response.js';
import { handleContent } from './handlers/content.js';
import { handleNav } from './handlers/nav.js';
import { handleMedia, handleMediaServe } from './handlers/media.js';
import { handleEvents } from './handlers/events.js';
import { handleTestimonials } from './handlers/testimonials.js';
import { handleFinancials } from './handlers/financials.js';
import { serveDynamicPage } from './handlers/pages.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ── Legacy domain: kspgivesback.com traffic moves to mnquietvalor.com ──
    const host = url.hostname.toLowerCase();
    if (host === 'kspgivesback.com' || host.endsWith('.kspgivesback.com')) {
      return Response.redirect('https://mnquietvalor.com' + url.pathname + url.search, 301);
    }
    if (host === 'www.mnquietvalor.com') {
      return Response.redirect('https://mnquietvalor.com' + url.pathname + url.search, 301);
    }

    try {
      // ── Site content (hero, sections, footer, about) ──
      if (path === '/api/content') {
        return await handleContent(request, env);
      }

      // ── Navigation ──
      if (path === '/api/nav') {
        return await handleNav(request, env);
      }

      // ── Media: gallery list + file serving ──
      if (path.startsWith('/api/media')) {
        return await handleMedia(request, env, url);
      }
      if (path.startsWith('/media/')) {
        return await handleMediaServe(env, url);
      }

      // ── Events ──
      if (path === '/api/events') {
        return await handleEvents(request, env);
      }

      // ── Testimonials ──
      if (path === '/api/testimonials') {
        return await handleTestimonials(request, env);
      }

      // ── Financials (combined public endpoint) ──
      if (path === '/api/financials') {
        return await handleFinancials(request, env);
      }

      // ── Unknown API route ──
      if (path.startsWith('/api/')) {
        return jsonResponse({ error: 'Not found' }, 404);
      }

      // ── Dynamic pages from the CMS (catch-all for /:slug/) ──
      if (request.method === 'GET' && !path.includes('.')) {
        const slug = path.replace(/^\/|\/$/g, '');
        if (slug && !['events', 'testimonials', 'financials', 'gallery', 'admin', 'about'].includes(slug)) {
          try {
            const pageResponse = await serveDynamicPage(env, slug);
            if (pageResponse) return pageResponse;
          } catch {
            // CMS lookup failure shouldn't take down static pages — fall through
          }
        }
      }

      // Static assets — worker runs first, so serve them via the binding
      return env.ASSETS.fetch(request);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  },
};

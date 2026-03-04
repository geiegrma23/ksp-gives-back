// KSP Gives Back — Worker Router
// Routes /api/* and /media/* to handler modules; static assets served via [assets]

import { jsonResponse } from './lib/response.js';
import { handleContent } from './handlers/content.js';
import { handleNav } from './handlers/nav.js';
import { handleMedia, handleMediaServe } from './handlers/media.js';
import { handleEvents } from './handlers/events.js';
import { handleTestimonials } from './handlers/testimonials.js';
import { handleFinancials, handleFinancialReports, handleFinancialHighlights } from './handlers/financials.js';
import { handleSetup } from './handlers/setup.js';
import { handlePagesApi, serveDynamicPage } from './handlers/pages.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ── Content (existing) ──
      if (path === '/api/content') {
        return await handleContent(request, env);
      }

      // ── Navigation ──
      if (path === '/api/nav') {
        return await handleNav(request, env);
      }

      // ── Media API ──
      if (path.startsWith('/api/media')) {
        return await handleMedia(request, env, url);
      }

      // ── Media serve (public) ──
      if (path.startsWith('/media/')) {
        return await handleMediaServe(env, url);
      }

      // ── Events ──
      if (path === '/api/events' || path.startsWith('/api/events/')) {
        return await handleEvents(request, env, url);
      }

      // ── Testimonials ──
      if (path === '/api/testimonials' || path.startsWith('/api/testimonials/')) {
        return await handleTestimonials(request, env, url);
      }

      // ── Financials (combined public endpoint) ──
      if (path === '/api/financials') {
        return await handleFinancials(request, env, url);
      }

      // ── Financial Reports CRUD ──
      if (path === '/api/financial-reports' || path.startsWith('/api/financial-reports/')) {
        return await handleFinancialReports(request, env, url);
      }

      // ── Financial Highlights collection ──
      if (path === '/api/financial-highlights') {
        return await handleFinancialHighlights(request, env);
      }

      // ── Pages API ──
      if (path === '/api/pages' || path.startsWith('/api/pages/')) {
        return await handlePagesApi(request, env, url);
      }

      // ── Setup / Migration ──
      if (path === '/api/setup') {
        return await handleSetup(request, env);
      }

      // ── Unknown API route ──
      if (path.startsWith('/api/')) {
        return jsonResponse({ error: 'Not found' }, 404);
      }

      // ── Dynamic pages (catch-all for /:slug/) ──
      // Only try for paths like /about/ or /about (not static assets)
      if (request.method === 'GET' && !path.includes('.')) {
        const slug = path.replace(/^\/|\/$/g, '');
        if (slug && !['events','testimonials','financials','gallery','admin'].includes(slug)) {
          const pageResponse = await serveDynamicPage(env, slug);
          if (pageResponse) return pageResponse;
        }
      }

      // Static assets handled by the assets binding
      return new Response('Not found', { status: 404 });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  },
};

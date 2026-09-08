// Minnesota Quiet Valor (formerly KSP Gives Back) — Worker Router
// Routes /api/* and /media/* to handler modules; static assets served via the ASSETS binding
// (run_worker_first is enabled so the legacy-domain redirect below covers every request)

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

    // ── Legacy domain: kspgivesback.com traffic moves to mnquietvalor.com ──
    // TEMPORARILY PAUSED: mnquietvalor.com custom domain not yet attached (old
    // GoDaddy parking DNS records need an approved override). Re-enable once
    // mnquietvalor.com serves this worker, or kspgivesback.com visitors would
    // be redirected to the parking page.
    const REDIRECT_LEGACY = false;
    const host = url.hostname.toLowerCase();
    if (REDIRECT_LEGACY && (host === 'kspgivesback.com' || host.endsWith('.kspgivesback.com'))) {
      return Response.redirect('https://mnquietvalor.com' + url.pathname + url.search, 301);
    }
    if (host === 'www.mnquietvalor.com') {
      return Response.redirect('https://mnquietvalor.com' + url.pathname + url.search, 301);
    }

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
        if (slug && !['events','testimonials','financials','gallery','admin','about'].includes(slug)) {
          try {
            const pageResponse = await serveDynamicPage(env, slug);
            if (pageResponse) return pageResponse;
          } catch {
            // D1 lookup failure shouldn't take down static pages — fall through to assets
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

// Setup handler — run schema + seed via the worker (no manual D1 console needed)
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';

// Each statement as a separate string for D1 batch execution
// ALTER TABLE migrations — safe to re-run (wrapped in try/catch per-statement)
const MIGRATIONS = [
  `ALTER TABLE mission_cards ADD COLUMN image_url TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE events ADD COLUMN end_date TEXT`,
  `ALTER TABLE events ADD COLUMN time_start TEXT`,
  `ALTER TABLE events ADD COLUMN time_end TEXT`,
  `ALTER TABLE events ADD COLUMN image_url TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE events ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE pages ADD COLUMN subtitle TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE pages ADD COLUMN image_url TEXT NOT NULL DEFAULT ''`,
];

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS mission_cards (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL, image_url TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS values_items (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY AUTOINCREMENT, number TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS nav_items (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, url TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, visible INTEGER NOT NULL DEFAULT 1, updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL, filename TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, body TEXT NOT NULL DEFAULT '', date TEXT, end_date TEXT, time_start TEXT, time_end TEXT, location TEXT, image_url TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')), created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT '', quote TEXT NOT NULL, image_url TEXT NOT NULL DEFAULT '', featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')), created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS financial_reports (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, period TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', file_url TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')), created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS financial_highlights (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, value TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, body TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')), created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, body TEXT NOT NULL DEFAULT '', excerpt TEXT, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')), created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`,
];

const SEED_STATEMENTS = [
  // Hero
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_title', 'KSP Gives Back'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_subtitle', 'Minnesota: Bound by Service, Supported for Life'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_description', 'A program fostering support and connections for Veterans and their spouses \u2014 creating opportunities for meaningful interactions, shared experiences, and community engagement.'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_cta_text', 'Get Involved Today'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_cta_link', 'mailto:info@mnquietvalor.com'],
  // Mission
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'mission_label', 'Who We Are'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'mission_title', 'Our Mission'],
  [`INSERT OR IGNORE INTO mission_cards (title, body, sort_order) VALUES (?, ?, ?)`, 'Mission', 'A program fostering support and connections for Veterans and their spouses. Creating opportunities for meaningful interactions, shared experiences, and community engagement.', 1],
  [`INSERT OR IGNORE INTO mission_cards (title, body, sort_order) VALUES (?, ?, ?)`, 'Purpose', 'Providing support and connections for Minnesota Veterans and their spouses.', 2],
  [`INSERT OR IGNORE INTO mission_cards (title, body, sort_order) VALUES (?, ?, ?)`, 'Vision', 'Creating valuable support for all Minnesota Veterans and their spouses.', 3],
  // Values
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'values_label', 'What We Stand For'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'values_title', 'Our Values'],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Honor', 'Respect and recognize the sacrifices of Veterans and their spouses.', 1],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Service', 'Committed to supporting those who served.', 2],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Community', 'Foster connection and belonging for Veterans & spouses.', 3],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Compassion', 'Provide care and assistance with empathy and respect.', 4],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Integrity', 'Uphold honesty and accountability in all we do.', 5],
  // Banner
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'banner_text', 'Creating Valuable Support for All Minnesota Veterans and Their Spouses'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'banner_sub', '\u2605   Honor   \u2605   Service   \u2605   Community   \u2605'],
  // Goals
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'goals_label', 'What We Do'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'goals_title', 'Our Goals'],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '01', 'Reduce Veteran Isolation', 'Engage veterans annually in peer support programs, social events, and community connections to combat loneliness.', 1],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '02', 'Assist with Daily Living', 'Support veterans with household tasks, mobility assistance, and home modifications to promote independence.', 2],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '03', 'Build a Volunteer Network', 'Recruit and train volunteers to provide transportation, companionship, and household support.', 3],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '04', 'Secure Sustainable Funding', 'Obtain grants, donations, and corporate sponsorships to fully fund and expand services statewide.', 4],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '05', 'Strengthen Peer Support', 'Create a statewide Buddy System connecting veterans with peers and trained volunteers for check-ins and social engagement.', 5],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '06', 'Build Intergenerational Bonds', 'Partner with schools and youth groups to connect veterans with younger generations through mentorship and shared experiences.', 6],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '07', 'Community Awareness', 'Build partnerships and engagement to strengthen awareness of veteran support needs across Minnesota.', 7],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '08', 'Measure & Improve', 'Track program success through veteran feedback, service data, and impact assessments to continuously refine and expand support.', 8],
  // Contact
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_label', 'Reach Out'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_title', 'Contact Us'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_intro', "We'd love to hear from you. Whether you're a veteran, a family member, or someone who wants to help \u2014 reach out anytime."],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_address', '8100 Oxbow Creek Dr, Brooklyn Park, MN 55445'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_phone', '(218) 296-1103'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_email', 'info@mnquietvalor.com'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_hours', 'Monday \u2013 Friday  |  9:00 AM \u2013 5:00 PM'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_cta_text', 'Send Us a Message'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_cta_link', 'mailto:info@mnquietvalor.com'],
  // Footer
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'footer_copyright', '\u00A9 2025 KSP Gives Back \u2014 All Rights Reserved.'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'footer_parent_text', 'A philanthropic program of'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'footer_parent_name', 'KSP Technologies'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'footer_parent_link', 'https://kspfulfillment.com'],
  // Financials
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'financials_label', 'Transparency'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'financials_title', 'Our Financials'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'financials_intro', 'We believe in full transparency. Here you can review our financial highlights and download our reports.'],
  // Nav
  [`INSERT OR IGNORE INTO nav_items (label, url, sort_order, visible) VALUES (?, ?, ?, ?)`, 'Home', '/', 1, 1],
  [`INSERT OR IGNORE INTO nav_items (label, url, sort_order, visible) VALUES (?, ?, ?, ?)`, 'Events', '/events/', 2, 1],
  [`INSERT OR IGNORE INTO nav_items (label, url, sort_order, visible) VALUES (?, ?, ?, ?)`, 'Testimonials', '/testimonials/', 3, 1],
  [`INSERT OR IGNORE INTO nav_items (label, url, sort_order, visible) VALUES (?, ?, ?, ?)`, 'Financials', '/financials/', 4, 1],
  [`INSERT OR IGNORE INTO nav_items (label, url, sort_order, visible) VALUES (?, ?, ?, ?)`, 'Gallery', '/gallery/', 5, 1],
  [`INSERT OR IGNORE INTO nav_items (label, url, sort_order, visible) VALUES (?, ?, ?, ?)`, 'Contact', '/#contact', 6, 1],
];

export async function handleSetup(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const skipSeed = url.searchParams.get('skip_seed') === '1';
  const results = [];

  try {
    // Run schema — each CREATE TABLE as a separate batch statement
    const schemaBatch = SCHEMA_STATEMENTS.map(sql => env.DB.prepare(sql));
    await env.DB.batch(schemaBatch);
    results.push('Schema: all tables created/verified');

    // Run migrations — ALTER TABLE (ignore "duplicate column" errors)
    for (const sql of MIGRATIONS) {
      try {
        await env.DB.prepare(sql).run();
        results.push('Migration OK: ' + sql.substring(0, 60));
      } catch (err) {
        if (err.message && err.message.includes('duplicate column')) {
          results.push('Migration skipped (already exists): ' + sql.substring(0, 60));
        } else {
          results.push('Migration skipped: ' + err.message);
        }
      }
    }

    // Run seed
    if (!skipSeed) {
      const seedBatch = SEED_STATEMENTS.map(entry => {
        const [sql, ...params] = entry;
        return env.DB.prepare(sql).bind(...params);
      });
      await env.DB.batch(seedBatch);
      results.push('Seed: default content inserted');
    }

    // Verify tables
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();
    const tableNames = tables.results.map(t => t.name).filter(n => !n.startsWith('_') && !n.startsWith('sqlite'));

    return jsonResponse({ success: true, results, tables: tableNames });
  } catch (err) {
    return jsonResponse({ error: err.message, results }, 500);
  }
}

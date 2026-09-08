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
  `CREATE TABLE IF NOT EXISTS hero_goals (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')))`,
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
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_title', 'Minnesota Quiet Valor'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_subtitle', 'Mobility. Dignity. Freedom.'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_description', 'A 501(c)(3) nonprofit providing mobility for Minnesota Veterans and their spouses \u2014 removing barriers, restoring independence, and making a lasting impact.'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_cta_text', 'Get Involved Today'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_cta_link', 'mailto:info@mnquietvalor.com'],
  // Donate
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'donate_text', 'Donate Now'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'donate_url', 'https://link.clover.com/urlshortener/9wHqSt'],
  // Mission
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'mission_label', 'Who We Are'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'mission_title', 'Our Mission'],
  [`INSERT OR IGNORE INTO mission_cards (title, body, sort_order) VALUES (?, ?, ?)`, 'Mission', 'To provide mobility for Minnesota Veterans and their spouses.', 1],
  [`INSERT OR IGNORE INTO mission_cards (title, body, sort_order) VALUES (?, ?, ?)`, 'Purpose', 'To remove barriers and restore independence.', 2],
  [`INSERT OR IGNORE INTO mission_cards (title, body, sort_order) VALUES (?, ?, ?)`, 'Vision', 'A future where every Minnesota Veteran and their spouse have freedom of mobility.', 3],
  // Values
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'values_label', 'What We Stand For'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'values_title', 'Our Values'],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Honor', 'We recognize and respect the sacrifices made by Veterans and their families.', 1],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Service', 'We place the needs of those we serve at the center of every decision.', 2],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Community', 'We believe meaningful relationships strengthen individuals, families, and communities.', 3],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Compassion', 'We lead with empathy, dignity, and respect.', 4],
  [`INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES (?, ?, ?)`, 'Integrity', 'We act honestly, steward resources responsibly, and remain accountable to those who place their trust in us.', 5],
  // Banner
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'banner_text', 'A Future Where Every Minnesota Veteran and Their Spouse Has Freedom of Mobility'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'banner_sub', '\u2605   Mobility   \u2605   Dignity   \u2605   Freedom   \u2605'],
  // Goals
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'goals_label', 'What We Do'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'goals_title', 'Our Goals'],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '01', 'Provide Mobility', 'Provide mobility scooters directly to eligible Minnesota Veterans and their spouses.', 1],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '02', 'Restore Independence', 'Remove barriers so Veterans and their spouses can live with greater freedom and independence.', 2],
  [`INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES (?, ?, ?, ?)`, '03', 'Make a Lasting Impact', 'Identify a need, provide a solution, and responsibly steward every dollar entrusted to us.', 3],
  // Hero Goals
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'hero_goals_heading', 'Our 2026 goals are:'],
  [`INSERT OR IGNORE INTO hero_goals (text, sort_order) VALUES (?, ?)`, 'Provide mobility scooters to Minnesota Veterans and their spouses', 1],
  [`INSERT OR IGNORE INTO hero_goals (text, sort_order) VALUES (?, ?)`, 'Remove barriers and restore independence', 2],
  [`INSERT OR IGNORE INTO hero_goals (text, sort_order) VALUES (?, ?)`, 'Build a strong foundation for future generations', 3],
  // Contact
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_label', 'Reach Out'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_title', 'Contact Us'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_intro', "We'd love to hear from you. Whether you're a Veteran, a spouse, or someone who wants to help \u2014 reach out anytime."],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_address', '8100 Oxbow Creek Dr, Brooklyn Park, MN 55445'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_phone', '(218) 296-1103'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_email', 'info@mnquietvalor.com'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_hours', 'Monday \u2013 Friday  |  9:00 AM \u2013 5:00 PM'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_cta_text', 'Send Us a Message'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'contact_cta_link', 'mailto:info@mnquietvalor.com'],
  // Footer
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'footer_copyright', '\u00A9 2026 Minnesota Quiet Valor \u2014 All Rights Reserved.'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'footer_parent_text', 'Founded with the support of'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'footer_parent_name', 'KSP Supply Chain Solutions'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'footer_parent_link', 'https://kspfulfillment.com'],
  // Financials
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'financials_label', 'Transparency'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'financials_title', 'Our Financials'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'financials_intro', 'We believe in full transparency. Here you can review our financial highlights and download our reports.'],
  // About
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_label', 'Who We Are'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_title', 'Minnesota Quiet Valor'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_intro', 'Minnesota Quiet Valor was founded on a simple belief: those who serve our nation — and their spouses — deserve the freedom to live with independence. Through our mobility program, we provide mobility scooters directly to eligible Minnesota Veterans and their spouses. Our approach is intentionally simple: identify a need, provide a solution, and make a lasting impact.'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_mission_title', 'Our Mission'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_mission_text', 'Our mission is to provide mobility for Minnesota Veterans and their spouses. Our purpose is to remove barriers and restore independence. Our vision is a future where every Minnesota Veteran and their spouse have freedom of mobility.'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_governance_title', 'Governance & Accountability'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_governance_text', 'Minnesota Quiet Valor is organized and operated exclusively for charitable purposes under Section 501(c)(3) of the Internal Revenue Code and the laws of the State of Minnesota. The organization is governed by an independent Board of Directors responsible for strategic oversight, fiduciary stewardship, and mission accountability.\n\nMinnesota Quiet Valor was founded through the vision and generosity of the leadership of KSP Supply Chain Solutions, a Veteran-owned business, which continues to support the organization through financial contributions, facilities, and in-kind resources. While that support is essential to our success, Minnesota Quiet Valor operates as an independent nonprofit corporation governed solely by its Board of Directors.'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_commitment_title', 'Our Commitment'],
  [`INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)`, 'about_commitment_text', 'Every decision we make begins with one question: how does this improve the lives of Veterans and their families? Minnesota Quiet Valor is committed to honoring every Veteran, putting the mission first, leading with integrity, and responsibly stewarding the resources entrusted to us by donors, partners, and supporters.'],
];

const NAV_SEED = [
  { label: 'Home', url: '/', visible: 1 },
  { label: 'About', url: '/about/', visible: 1 },
  { label: 'Events', url: '/events/', visible: 1 },
  { label: 'Testimonials', url: '/testimonials/', visible: 1 },
  { label: 'Financials', url: '/financials/', visible: 1 },
  { label: 'Gallery', url: '/gallery/', visible: 1 },
  { label: 'Contact', url: '/#contact', visible: 1 },
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

      // Nav seed — only if nav_items table is empty (prevents duplicates on re-run)
      const navCount = await env.DB.prepare('SELECT COUNT(*) as c FROM nav_items').first();
      if (!navCount || navCount.c === 0) {
        const navStmt = env.DB.prepare(
          `INSERT INTO nav_items (label, url, sort_order, visible, updated_at) VALUES (?, ?, ?, ?, datetime('now'))`
        );
        const navBatch = NAV_SEED.map((item, i) =>
          navStmt.bind(item.label, item.url, i + 1, item.visible)
        );
        await env.DB.batch(navBatch);
        results.push('Nav seed: default navigation inserted');
      } else {
        results.push('Nav seed: skipped (nav_items already has data)');
      }
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

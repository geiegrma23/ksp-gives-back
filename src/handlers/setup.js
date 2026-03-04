// Setup handler — run schema + seed via the worker (no manual D1 console needed)
import { jsonResponse, optionsResponse } from '../lib/response.js';
import { isAdmin } from '../lib/auth.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS site_content (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mission_cards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  image_url   TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS values_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS goals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  number      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS nav_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  visible     INTEGER NOT NULL DEFAULT 1,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  key           TEXT UNIQUE NOT NULL,
  filename      TEXT NOT NULL,
  content_type  TEXT NOT NULL,
  size          INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  date        TEXT,
  end_date    TEXT,
  time_start  TEXT,
  time_end    TEXT,
  location    TEXT,
  image_url   TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS testimonials (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT '',
  quote       TEXT NOT NULL,
  image_url   TEXT NOT NULL DEFAULT '',
  featured    INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS financial_reports (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  period      TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  file_url    TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS financial_highlights (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  label       TEXT NOT NULL,
  value       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  excerpt     TEXT,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
`;

const SEED = `
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('hero_title',       'KSP Gives Back'),
  ('hero_subtitle',    'Minnesota: Bound by Service, Supported for Life'),
  ('hero_description', 'A program fostering support and connections for Veterans and their spouses — creating opportunities for meaningful interactions, shared experiences, and community engagement.'),
  ('hero_cta_text',    'Get Involved Today'),
  ('hero_cta_link',    'mailto:info@mnquietvalor.com');

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('mission_label', 'Who We Are'),
  ('mission_title', 'Our Mission');

INSERT OR IGNORE INTO mission_cards (title, body, sort_order) VALUES
  ('Mission', 'A program fostering support and connections for Veterans and their spouses. Creating opportunities for meaningful interactions, shared experiences, and community engagement.', 1),
  ('Purpose', 'Providing support and connections for Minnesota Veterans and their spouses.', 2),
  ('Vision',  'Creating valuable support for all Minnesota Veterans and their spouses.', 3);

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('values_label', 'What We Stand For'),
  ('values_title', 'Our Values');

INSERT OR IGNORE INTO values_items (title, description, sort_order) VALUES
  ('Honor',      'Respect and recognize the sacrifices of Veterans and their spouses.', 1),
  ('Service',    'Committed to supporting those who served.', 2),
  ('Community',  'Foster connection and belonging for Veterans & spouses.', 3),
  ('Compassion', 'Provide care and assistance with empathy and respect.', 4),
  ('Integrity',  'Uphold honesty and accountability in all we do.', 5);

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('banner_text', 'Creating Valuable Support for All Minnesota Veterans and Their Spouses'),
  ('banner_sub',  '★   Honor   ★   Service   ★   Community   ★');

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('goals_label', 'What We Do'),
  ('goals_title', 'Our Goals');

INSERT OR IGNORE INTO goals (number, title, description, sort_order) VALUES
  ('01', 'Reduce Veteran Isolation',  'Engage veterans annually in peer support programs, social events, and community connections to combat loneliness.', 1),
  ('02', 'Assist with Daily Living',  'Support veterans with household tasks, mobility assistance, and home modifications to promote independence.', 2),
  ('03', 'Build a Volunteer Network', 'Recruit and train volunteers to provide transportation, companionship, and household support.', 3),
  ('04', 'Secure Sustainable Funding', 'Obtain grants, donations, and corporate sponsorships to fully fund and expand services statewide.', 4),
  ('05', 'Strengthen Peer Support',   'Create a statewide Buddy System connecting veterans with peers and trained volunteers for check-ins and social engagement.', 5),
  ('06', 'Build Intergenerational Bonds', 'Partner with schools and youth groups to connect veterans with younger generations through mentorship and shared experiences.', 6),
  ('07', 'Community Awareness',       'Build partnerships and engagement to strengthen awareness of veteran support needs across Minnesota.', 7),
  ('08', 'Measure & Improve',         'Track program success through veteran feedback, service data, and impact assessments to continuously refine and expand support.', 8);

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('contact_label',    'Reach Out'),
  ('contact_title',    'Contact Us'),
  ('contact_intro',    'We''d love to hear from you. Whether you''re a veteran, a family member, or someone who wants to help — reach out anytime.'),
  ('contact_address',  '8100 Oxbow Creek Dr, Brooklyn Park, MN 55445'),
  ('contact_phone',    '(218) 296-1103'),
  ('contact_email',    'info@mnquietvalor.com'),
  ('contact_hours',    'Monday – Friday  |  9:00 AM – 5:00 PM'),
  ('contact_cta_text', 'Send Us a Message'),
  ('contact_cta_link', 'mailto:info@mnquietvalor.com');

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('footer_copyright',   '© 2025 KSP Gives Back — All Rights Reserved.'),
  ('footer_parent_text', 'A philanthropic program of'),
  ('footer_parent_name', 'KSP Technologies'),
  ('footer_parent_link', 'https://kspfulfillment.com');

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('financials_label', 'Transparency'),
  ('financials_title', 'Our Financials'),
  ('financials_intro', 'We believe in full transparency. Here you can review our financial highlights and download our reports.');

INSERT OR IGNORE INTO nav_items (label, url, sort_order, visible) VALUES
  ('Home',          '/',              1, 1),
  ('Events',        '/events/',       2, 1),
  ('Testimonials',  '/testimonials/', 3, 1),
  ('Financials',    '/financials/',   4, 1),
  ('Contact',       '/#contact',      5, 1);
`;

export async function handleSetup(request, env) {
  if (request.method === 'OPTIONS') return optionsResponse();
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
  if (!isAdmin(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const skipSeed = url.searchParams.get('skip_seed') === '1';
  const results = [];

  try {
    // Run schema (always safe — CREATE IF NOT EXISTS)
    await env.DB.exec(SCHEMA);
    results.push('Schema: all tables created/verified');

    // Run seed (safe — INSERT OR REPLACE / INSERT OR IGNORE)
    if (!skipSeed) {
      await env.DB.exec(SEED);
      results.push('Seed: default content inserted');
    }

    // Verify tables exist
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();
    const tableNames = tables.results.map(t => t.name).filter(n => !n.startsWith('_') && !n.startsWith('sqlite'));

    return jsonResponse({
      success: true,
      results,
      tables: tableNames,
    });
  } catch (err) {
    return jsonResponse({ error: err.message, results }, 500);
  }
}

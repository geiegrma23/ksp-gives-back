-- Minnesota Quiet Valor — Seed Data (from current index.html)
-- Run: npm run db:seed

-- ── Hero ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('hero_title',       'Minnesota Quiet Valor'),
  ('hero_subtitle',    'Mobility. Dignity. Freedom.'),
  ('hero_description', 'A 501(c)(3) nonprofit providing mobility for Minnesota Veterans and their spouses — removing barriers, restoring independence, and making a lasting impact.'),
  ('hero_cta_text',    'Get Involved Today'),
  ('hero_cta_link',    'mailto:info@mnquietvalor.com');

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('hero_goals_heading', 'Our 2026 goals are:');

DELETE FROM hero_goals;
INSERT INTO hero_goals (text, sort_order) VALUES
  ('Provide mobility scooters to Minnesota Veterans and their spouses', 1),
  ('Remove barriers and restore independence', 2),
  ('Build a strong foundation for future generations', 3);

-- ── Mission Section ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('mission_label', 'Who We Are'),
  ('mission_title', 'Our Mission');

DELETE FROM mission_cards;
INSERT INTO mission_cards (title, body, sort_order) VALUES
  ('Mission', 'To provide mobility for Minnesota Veterans and their spouses.', 1),
  ('Purpose', 'To remove barriers and restore independence.', 2),
  ('Vision',  'A future where every Minnesota Veteran and their spouse have freedom of mobility.', 3);

-- ── Values Section ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('values_label', 'What We Stand For'),
  ('values_title', 'Our Values');

DELETE FROM values_items;
INSERT INTO values_items (title, description, sort_order) VALUES
  ('Honor',      'We recognize and respect the sacrifices made by Veterans and their families.', 1),
  ('Service',    'We place the needs of those we serve at the center of every decision.', 2),
  ('Community',  'We believe meaningful relationships strengthen individuals, families, and communities.', 3),
  ('Compassion', 'We lead with empathy, dignity, and respect.', 4),
  ('Integrity',  'We act honestly, steward resources responsibly, and remain accountable to those who place their trust in us.', 5);

-- ── Banner ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('banner_text', 'A Future Where Every Minnesota Veteran and Their Spouse Has Freedom of Mobility'),
  ('banner_sub',  '★   Mobility   ★   Dignity   ★   Freedom   ★');

-- ── Goals Section ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('goals_label', 'What We Do'),
  ('goals_title', 'Our Goals');

DELETE FROM goals;
INSERT INTO goals (number, title, description, sort_order) VALUES
  ('01', 'Provide Mobility',      'Provide mobility scooters directly to eligible Minnesota Veterans and their spouses.', 1),
  ('02', 'Restore Independence',  'Remove barriers so Veterans and their spouses can live with greater freedom and independence.', 2),
  ('03', 'Make a Lasting Impact', 'Identify a need, provide a solution, and responsibly steward every dollar entrusted to us.', 3);

-- ── Contact ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('contact_label',    'Reach Out'),
  ('contact_title',    'Contact Us'),
  ('contact_intro',    'We''d love to hear from you. Whether you''re a Veteran, a spouse, or someone who wants to help — reach out anytime.'),
  ('contact_address',  '8100 Oxbow Creek Dr, Brooklyn Park, MN 55445'),
  ('contact_phone',    '(218) 296-1103'),
  ('contact_email',    'info@mnquietvalor.com'),
  ('contact_hours',    'Monday – Friday  |  9:00 AM – 5:00 PM'),
  ('contact_cta_text', 'Send Us a Message'),
  ('contact_cta_link', 'mailto:info@mnquietvalor.com');

-- ── Footer ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('footer_copyright',   '© 2026 Minnesota Quiet Valor — All Rights Reserved.'),
  ('footer_parent_text', 'Founded with the support of'),
  ('footer_parent_name', 'KSP Supply Chain Solutions'),
  ('footer_parent_link', 'https://kspfulfillment.com');

-- ── Financials intro text ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('financials_label', 'Transparency'),
  ('financials_title', 'Our Financials'),
  ('financials_intro', 'We believe in full transparency. Here you can review our financial highlights and download our reports.');

-- ── Navigation ──
DELETE FROM nav_items;
INSERT INTO nav_items (label, url, sort_order, visible) VALUES
  ('Home',          '/',              1, 1),
  ('About',         '/about/',        2, 1),
  ('Events',        '/events/',       3, 1),
  ('Testimonials',  '/testimonials/', 4, 1),
  ('Financials',    '/financials/',   5, 1),
  ('Gallery',       '/gallery/',      6, 1),
  ('Contact',       '/#contact',      7, 1);

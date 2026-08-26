-- Minnesota Quiet Valor — one-time LIVE content cutover
-- Rebrands the production D1 content from KSP Gives Back to Minnesota Quiet Valor.
-- Only touches branding/wording keys; leaves hero_bg_image, donate_url, contact
-- address/phone/hours, nav_items, events, testimonials, financials untouched.
--
-- Run (from repo root, AFTER merging the mqv-rebrand branch):
--   npx wrangler d1 execute ksp-gives-back --remote --file=migrations/mqv-go-live.sql

-- ── Hero ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('hero_title',       'Minnesota Quiet Valor'),
  ('hero_subtitle',    'Mobility. Dignity. Freedom.'),
  ('hero_description', 'A 501(c)(3) nonprofit providing mobility for Minnesota Veterans and their spouses — removing barriers, restoring independence, and making a lasting impact.'),
  ('hero_cta_link',    'mailto:info@mnquietvalor.com');

DELETE FROM hero_goals;
INSERT INTO hero_goals (text, sort_order) VALUES
  ('Provide mobility scooters to Minnesota Veterans and their spouses', 1),
  ('Remove barriers and restore independence', 2),
  ('Build a strong foundation for future generations', 3);

-- ── Mission cards ──
DELETE FROM mission_cards;
INSERT INTO mission_cards (title, body, sort_order) VALUES
  ('Mission', 'To provide mobility for Minnesota Veterans and their spouses.', 1),
  ('Purpose', 'To remove barriers and restore independence.', 2),
  ('Vision',  'A future where every Minnesota Veteran and their spouse have freedom of mobility.', 3);

-- ── Values (governance manual wording) ──
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

-- ── Goals ──
DELETE FROM goals;
INSERT INTO goals (number, title, description, sort_order) VALUES
  ('01', 'Provide Mobility',      'Provide mobility scooters directly to eligible Minnesota Veterans and their spouses.', 1),
  ('02', 'Restore Independence',  'Remove barriers so Veterans and their spouses can live with greater freedom and independence.', 2),
  ('03', 'Make a Lasting Impact', 'Identify a need, provide a solution, and responsibly steward every dollar entrusted to us.', 3);

-- ── Contact (email + intro only; address/phone/hours unchanged) ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('contact_intro',    'We''d love to hear from you. Whether you''re a Veteran, a spouse, or someone who wants to help — reach out anytime.'),
  ('contact_email',    'info@mnquietvalor.com'),
  ('contact_cta_link', 'mailto:info@mnquietvalor.com');

-- ── Footer ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('footer_copyright',   '© 2026 Minnesota Quiet Valor — All Rights Reserved.'),
  ('footer_parent_text', 'Founded with the support of'),
  ('footer_parent_name', 'KSP Supply Chain Solutions');

-- ── About page ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('about_title', 'Minnesota Quiet Valor'),
  ('about_intro', 'Minnesota Quiet Valor was founded on a simple belief: those who serve our nation — and their spouses — deserve the freedom to live with independence. Through our mobility program, we provide mobility scooters directly to eligible Minnesota Veterans and their spouses. Our approach is intentionally simple: identify a need, provide a solution, and make a lasting impact.'),
  ('about_mission_text', 'Our mission is to provide mobility for Minnesota Veterans and their spouses. Our purpose is to remove barriers and restore independence. Our vision is a future where every Minnesota Veteran and their spouse have freedom of mobility.'),
  ('about_governance_text', 'Minnesota Quiet Valor is organized and operated exclusively for charitable purposes under Section 501(c)(3) of the Internal Revenue Code and the laws of the State of Minnesota. The organization is governed by an independent Board of Directors responsible for strategic oversight, fiduciary stewardship, and mission accountability.

Minnesota Quiet Valor was founded through the vision and generosity of the leadership of KSP Supply Chain Solutions, a Veteran-owned business, which continues to support the organization through financial contributions, facilities, and in-kind resources. While that support is essential to our success, Minnesota Quiet Valor operates as an independent nonprofit corporation governed solely by its Board of Directors.'),
  ('about_commitment_text', 'Every decision we make begins with one question: how does this improve the lives of Veterans and their families? Minnesota Quiet Valor is committed to honoring every Veteran, putting the mission first, leading with integrity, and responsibly stewarding the resources entrusted to us by donors, partners, and supporters.');

-- KSP Gives Back — Seed Data (from current index.html)
-- Run: npm run db:seed

-- ── Hero ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('hero_title',       'KSP Gives Back'),
  ('hero_subtitle',    'Minnesota: Bound by Service, Supported for Life'),
  ('hero_description', 'A program fostering support and connections for Veterans and their spouses — creating opportunities for meaningful interactions, shared experiences, and community engagement.'),
  ('hero_cta_text',    'Get Involved Today'),
  ('hero_cta_link',    'mailto:info@mnquietvalor.com');

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('hero_goals_heading', 'Our 2026 goals are:');

DELETE FROM hero_goals;
INSERT INTO hero_goals (text, sort_order) VALUES
  ('Raise funds to provide vehicles', 1),
  ('Accessibility to disabled Veteran''s homes', 2),
  ('Meaningful experiences for families', 3);

-- ── Mission Section ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('mission_label', 'Who We Are'),
  ('mission_title', 'Our Mission');

DELETE FROM mission_cards;
INSERT INTO mission_cards (title, body, sort_order) VALUES
  ('Mission', 'A program fostering support and connections for Veterans and their spouses. Creating opportunities for meaningful interactions, shared experiences, and community engagement.', 1),
  ('Purpose', 'Providing support and connections for Minnesota Veterans and their spouses.', 2),
  ('Vision',  'Creating valuable support for all Minnesota Veterans and their spouses.', 3);

-- ── Values Section ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('values_label', 'What We Stand For'),
  ('values_title', 'Our Values');

DELETE FROM values_items;
INSERT INTO values_items (title, description, sort_order) VALUES
  ('Honor',      'Respect and recognize the sacrifices of Veterans and their spouses.', 1),
  ('Service',    'Committed to supporting those who served.', 2),
  ('Community',  'Foster connection and belonging for Veterans & spouses.', 3),
  ('Compassion', 'Provide care and assistance with empathy and respect.', 4),
  ('Integrity',  'Uphold honesty and accountability in all we do.', 5);

-- ── Banner ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('banner_text', 'Creating Valuable Support for All Minnesota Veterans and Their Spouses'),
  ('banner_sub',  '★   Honor   ★   Service   ★   Community   ★');

-- ── Goals Section ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('goals_label', 'What We Do'),
  ('goals_title', 'Our Goals');

DELETE FROM goals;
INSERT INTO goals (number, title, description, sort_order) VALUES
  ('01', 'Reduce Veteran Isolation',  'Engage veterans annually in peer support programs, social events, and community connections to combat loneliness.', 1),
  ('02', 'Assist with Daily Living',  'Support veterans with household tasks, mobility assistance, and home modifications to promote independence.', 2),
  ('03', 'Build a Volunteer Network', 'Recruit and train volunteers to provide transportation, companionship, and household support.', 3),
  ('04', 'Secure Sustainable Funding', 'Obtain grants, donations, and corporate sponsorships to fully fund and expand services statewide.', 4),
  ('05', 'Strengthen Peer Support',   'Create a statewide Buddy System connecting veterans with peers and trained volunteers for check-ins and social engagement.', 5),
  ('06', 'Build Intergenerational Bonds', 'Partner with schools and youth groups to connect veterans with younger generations through mentorship and shared experiences.', 6),
  ('07', 'Community Awareness',       'Build partnerships and engagement to strengthen awareness of veteran support needs across Minnesota.', 7),
  ('08', 'Measure & Improve',         'Track program success through veteran feedback, service data, and impact assessments to continuously refine and expand support.', 8);

-- ── Contact ──
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

-- ── Footer ──
INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('footer_copyright',   '© 2025 KSP Gives Back — All Rights Reserved.'),
  ('footer_parent_text', 'A philanthropic program of'),
  ('footer_parent_name', 'KSP Technologies'),
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
  ('Events',        '/events/',       2, 1),
  ('Testimonials',  '/testimonials/', 3, 1),
  ('Financials',    '/financials/',   4, 1),
  ('Contact',       '/#contact',      5, 1);

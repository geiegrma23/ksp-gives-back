import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`subtitle\` text,
  	\`hero_image_id\` integer,
  	\`image_url\` text,
  	\`content\` text NOT NULL,
  	\`html\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_hero_image_idx\` ON \`pages\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`date\` text,
  	\`end_date\` text,
  	\`time_start\` text,
  	\`time_end\` text,
  	\`location\` text,
  	\`description\` text,
  	\`body\` text,
  	\`image_id\` integer,
  	\`image_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`events_slug_idx\` ON \`events\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`events_image_idx\` ON \`events\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`events_updated_at_idx\` ON \`events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`events_created_at_idx\` ON \`events\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text,
  	\`quote\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`image_id\` integer,
  	\`image_url\` text,
  	\`sort_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonials_image_idx\` ON \`testimonials\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`financial_reports\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`period\` text,
  	\`description\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`file_id\` integer,
  	\`file_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`financial_reports_file_idx\` ON \`financial_reports\` (\`file_id\`);`)
  await db.run(sql`CREATE INDEX \`financial_reports_updated_at_idx\` ON \`financial_reports\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`financial_reports_created_at_idx\` ON \`financial_reports\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`financial_highlights\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`description\` text,
  	\`sort_order\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`financial_highlights_updated_at_idx\` ON \`financial_highlights\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`financial_highlights_created_at_idx\` ON \`financial_highlights\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`mission_cards\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`body\` text NOT NULL,
  	\`sort_order\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`mission_cards_updated_at_idx\` ON \`mission_cards\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`mission_cards_created_at_idx\` ON \`mission_cards\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`values_items\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`sort_order\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`values_items_updated_at_idx\` ON \`values_items\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`values_items_created_at_idx\` ON \`values_items\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`goals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	\`sort_order\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`goals_updated_at_idx\` ON \`goals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`goals_created_at_idx\` ON \`goals\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`hero_goals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	\`sort_order\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`hero_goals_updated_at_idx\` ON \`hero_goals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`hero_goals_created_at_idx\` ON \`hero_goals\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`nav_items\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`visible\` integer DEFAULT true,
  	\`sort_order\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`nav_items_updated_at_idx\` ON \`nav_items\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`nav_items_created_at_idx\` ON \`nav_items\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_content\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_title\` text,
  	\`hero_subtitle\` text,
  	\`hero_description\` text,
  	\`hero_goals_heading\` text,
  	\`hero_cta_text\` text,
  	\`hero_cta_link\` text,
  	\`hero_bg_id\` integer,
  	\`hero_bg_image\` text,
  	\`hero_video_embed\` text,
  	\`donate_text\` text,
  	\`donate_url\` text,
  	\`mission_label\` text,
  	\`mission_title\` text,
  	\`values_label\` text,
  	\`values_title\` text,
  	\`goals_label\` text,
  	\`goals_title\` text,
  	\`financials_label\` text,
  	\`financials_title\` text,
  	\`financials_intro\` text,
  	\`banner_text\` text,
  	\`banner_sub\` text,
  	\`contact_label\` text,
  	\`contact_title\` text,
  	\`contact_intro\` text,
  	\`contact_address\` text,
  	\`contact_phone\` text,
  	\`contact_email\` text,
  	\`contact_hours\` text,
  	\`contact_cta_text\` text,
  	\`contact_cta_link\` text,
  	\`footer_copyright\` text,
  	\`footer_parent_text\` text,
  	\`footer_parent_name\` text,
  	\`footer_parent_link\` text,
  	\`about_label\` text,
  	\`about_title\` text,
  	\`about_intro\` text,
  	\`about_img_id\` integer,
  	\`about_image\` text,
  	\`about_mission_title\` text,
  	\`about_mission_text\` text,
  	\`about_governance_title\` text,
  	\`about_governance_text\` text,
  	\`about_commitment_title\` text,
  	\`about_commitment_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_bg_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`about_img_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_hero_bg_idx\` ON \`site_content\` (\`hero_bg_id\`);`)
  await db.run(sql`CREATE INDEX \`site_content_about_img_idx\` ON \`site_content\` (\`about_img_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`pages_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`events_id\` integer REFERENCES events(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`testimonials_id\` integer REFERENCES testimonials(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`financial_reports_id\` integer REFERENCES financial_reports(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`financial_highlights_id\` integer REFERENCES financial_highlights(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`mission_cards_id\` integer REFERENCES mission_cards(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`values_items_id\` integer REFERENCES values_items(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`goals_id\` integer REFERENCES goals(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`hero_goals_id\` integer REFERENCES hero_goals(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`nav_items_id\` integer REFERENCES nav_items(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_events_id_idx\` ON \`payload_locked_documents_rels\` (\`events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_financial_reports_id_idx\` ON \`payload_locked_documents_rels\` (\`financial_reports_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_financial_highlights_id_idx\` ON \`payload_locked_documents_rels\` (\`financial_highlights_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_mission_cards_id_idx\` ON \`payload_locked_documents_rels\` (\`mission_cards_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_values_items_id_idx\` ON \`payload_locked_documents_rels\` (\`values_items_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_goals_id_idx\` ON \`payload_locked_documents_rels\` (\`goals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_hero_goals_id_idx\` ON \`payload_locked_documents_rels\` (\`hero_goals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_nav_items_id_idx\` ON \`payload_locked_documents_rels\` (\`nav_items_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`events\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`financial_reports\`;`)
  await db.run(sql`DROP TABLE \`financial_highlights\`;`)
  await db.run(sql`DROP TABLE \`mission_cards\`;`)
  await db.run(sql`DROP TABLE \`values_items\`;`)
  await db.run(sql`DROP TABLE \`goals\`;`)
  await db.run(sql`DROP TABLE \`hero_goals\`;`)
  await db.run(sql`DROP TABLE \`nav_items\`;`)
  await db.run(sql`DROP TABLE \`site_content\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}

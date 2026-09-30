import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_heading\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	\`size\` text DEFAULT 'large',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_heading_order_idx\` ON \`pages_blocks_heading\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_heading_parent_id_idx\` ON \`pages_blocks_heading\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_heading_path_idx\` ON \`pages_blocks_heading\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_order_idx\` ON \`pages_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_parent_id_idx\` ON \`pages_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_text_path_idx\` ON \`pages_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_order_idx\` ON \`pages_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_parent_id_idx\` ON \`pages_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_path_idx\` ON \`pages_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_image_image_idx\` ON \`pages_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_button\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_button_order_idx\` ON \`pages_blocks_button\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_button_parent_id_idx\` ON \`pages_blocks_button\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_button_path_idx\` ON \`pages_blocks_button\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_divider\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_divider_order_idx\` ON \`pages_blocks_divider\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_divider_parent_id_idx\` ON \`pages_blocks_divider\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_divider_path_idx\` ON \`pages_blocks_divider\` (\`_path\`);`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`content\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_heading\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_button\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_divider\`;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`content\` text NOT NULL;`)
}

// One-time: import the legacy site media (old R2 bucket + D1 media table)
// into Payload's Media library so editors can see and reuse existing images.
// Files keep their legacy key as filename so every existing /media/<key>
// reference stays valid; alt text carries the original upload name.
// Usage: NODE_ENV=production PAYLOAD_SECRET=ignore npx payload run scripts/migrate-media.ts
import { getPayload } from 'payload'
import config from '@payload-config'

const SITE = 'https://mnquietvalor.com'
const UA = { 'User-Agent': 'Mozilla/5.0 (media-migration)' }

const payload = await getPayload({ config })

const list: { id: number | string; key: string; filename: string; content_type: string }[] =
  await fetch(`${SITE}/api/media/public`, { headers: UA }).then((r) => r.json())

const existing = await payload.find({ collection: 'media', limit: 500 })
const have = new Set(existing.docs.map((d: { filename?: string }) => d.filename))

let ok = 0
let skip = 0
let fail = 0
for (const item of list) {
  if (String(item.id).startsWith('cms-') || have.has(item.key)) {
    skip++
    continue
  }
  try {
    const res = await fetch(`${SITE}/media/${item.key}`, { headers: UA })
    if (!res.ok) throw new Error(`fetch ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await payload.create({
      collection: 'media',
      data: { alt: item.filename || item.key },
      file: { data: buf, mimetype: item.content_type, name: item.key, size: buf.byteLength },
    })
    ok++
    console.log(`migrated ${item.key} (${item.filename})`)
  } catch (e) {
    fail++
    console.error(`FAILED ${item.key}:`, (e as Error).message.slice(0, 150))
  }
}
console.log(`media migration: ${ok} migrated, ${skip} skipped, ${fail} failed`)

// Point the hero background upload field at the migrated image so editors
// see the actual photo in Site Content instead of a filename.
const global = await payload.findGlobal({ slug: 'site-content' })
if (global.hero_bg_image && !global.hero_bg) {
  const match = await payload.find({
    collection: 'media',
    where: { filename: { equals: global.hero_bg_image } },
    limit: 1,
  })
  if (match.docs[0]) {
    await payload.updateGlobal({ slug: 'site-content', data: { hero_bg: match.docs[0].id } })
    console.log('hero_bg linked to migrated media doc', match.docs[0].id)
  }
}
process.exit(fail ? 1 : 0)

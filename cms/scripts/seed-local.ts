// One-time migration via the Payload Local API (bypasses REST auth; talks to
// the remote D1 through the wrangler proxy when NODE_ENV=production).
// Usage: NODE_ENV=production PAYLOAD_SECRET=ignore npx payload run scripts/seed-local.ts -- <legacy-data.json>
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '@payload-config'

const dataPath = process.argv[process.argv.length - 1]
if (!dataPath || !dataPath.endsWith('.json')) {
  console.error('usage: payload run scripts/seed-local.ts -- <legacy-data.json>')
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8').replace(/^﻿/, ''))
const [siteContent, missionCards, valuesItems, goals, heroGoals, navItems, testimonials, reports, highlights] =
  raw.map((r: { results: Record<string, unknown>[] }) => r.results)

const payload = await getPayload({ config })

// ── Global ──
const fields: Record<string, string> = {}
for (const row of siteContent as { key: string; value: string }[]) fields[row.key] = row.value
await payload.updateGlobal({ slug: 'site-content', data: fields })
console.log('site-content global: OK (' + Object.keys(fields).length + ' fields)')

// ── Collections ──
let ok = 0
let fail = 0
const seed = async (collection: string, docs: Record<string, unknown>[]) => {
  for (const doc of docs) {
    try {
      await payload.create({ collection: collection as never, data: doc as never })
      ok++
    } catch (e) {
      fail++
      console.error(`${collection} FAILED:`, (e as Error).message.slice(0, 200))
    }
  }
}

await seed('mission-cards', missionCards)
await seed('values-items', valuesItems)
await seed('goals', goals)
await seed('hero-goals', heroGoals)
await seed('nav-items', (navItems as { visible: number }[]).map((n) => ({ ...n, visible: Boolean(n.visible) })))
await seed(
  'testimonials',
  (testimonials as { featured: number; status?: string }[]).map((t) => ({
    ...t,
    featured: Boolean(t.featured),
    status: t.status || 'draft',
  })),
)
await seed('financial-reports', reports)
await seed('financial-highlights', highlights)

console.log(`collections: ${ok} created, ${fail} failed`)
process.exit(fail ? 1 : 0)

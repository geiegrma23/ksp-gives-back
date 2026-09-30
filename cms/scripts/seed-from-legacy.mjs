// One-time migration: seed Payload CMS from the legacy site D1 export.
// Usage: node scripts/seed-from-legacy.mjs <legacy-data.json> <email> <password>
// The JSON is the wrangler d1 execute --json output of the 9 export queries
// (site_content, mission_cards, values_items, goals, hero_goals, nav_items,
// testimonials, financial_reports, financial_highlights — in that order).
import fs from 'node:fs'

const CMS = 'https://cms.mnquietvalor.com'
const [, , dataPath, email, password] = process.argv
if (!dataPath || !email || !password) {
  console.error('usage: node seed-from-legacy.mjs <legacy-data.json> <email> <password>')
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8').replace(/^﻿/, ''))
const [siteContent, missionCards, valuesItems, goals, heroGoals, navItems, testimonials, reports, highlights] =
  raw.map((r) => r.results)

// ── Login ──
const loginRes = await fetch(`${CMS}/api/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
if (!loginRes.ok) {
  console.error('login failed:', loginRes.status, await loginRes.text())
  process.exit(1)
}
const { token } = await loginRes.json()
const H = { 'Content-Type': 'application/json', Authorization: `JWT ${token}` }

const post = async (path, data) => {
  const res = await fetch(`${CMS}/api/${path}`, { method: 'POST', headers: H, body: JSON.stringify(data) })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error(`POST ${path} FAILED ${res.status}:`, JSON.stringify(body.errors || body).slice(0, 300))
    return false
  }
  return true
}

// ── Global: site-content ──
const fields = {}
for (const row of siteContent) fields[row.key] = row.value
const globalRes = await fetch(`${CMS}/api/globals/site-content`, {
  method: 'POST',
  headers: H,
  body: JSON.stringify(fields),
})
console.log('site-content global:', globalRes.ok ? 'OK' : `FAILED ${globalRes.status} ${(await globalRes.text()).slice(0, 300)}`)

// ── Collections ──
let ok = 0
let fail = 0
const seed = async (slug, docs) => {
  for (const doc of docs) (await post(slug, doc)) ? ok++ : fail++
}

await seed('mission-cards', missionCards)
await seed('values-items', valuesItems)
await seed('goals', goals)
await seed('hero-goals', heroGoals)
await seed(
  'nav-items',
  navItems.map((n) => ({ ...n, visible: Boolean(n.visible) })),
)
await seed(
  'testimonials',
  testimonials.map((t) => ({ ...t, featured: Boolean(t.featured), status: t.status || 'draft' })),
)
await seed('financial-reports', reports)
await seed('financial-highlights', highlights)

console.log(`collections: ${ok} created, ${fail} failed`)

// ── Verify public reads ──
for (const p of ['globals/site-content', 'mission-cards', 'values-items', 'goals', 'hero-goals', 'nav-items']) {
  const r = await fetch(`${CMS}/api/${p}?limit=100`)
  const j = await r.json()
  console.log(`verify ${p}:`, r.status, j.docs ? `${j.docs.length} docs` : (j.hero_title || j.id ? 'global ok' : 'EMPTY?'))
}

// Re-save the site-content global (no changes) to exercise the afterChange
// KV purge hook. Usage: NODE_ENV=production PAYLOAD_SECRET=ignore npx payload run scripts/touch-global.ts
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const current = await payload.findGlobal({ slug: 'site-content' })
await payload.updateGlobal({ slug: 'site-content', data: { hero_title: current.hero_title } })
console.log('global re-saved; purge hook should have fired')
process.exit(0)

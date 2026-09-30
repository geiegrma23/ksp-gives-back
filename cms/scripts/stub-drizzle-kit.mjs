// Turbopack rewrites Payload's lazy `require('drizzle-kit/api')` (dev-only
// migration tooling) to a hashed specifier like `drizzle-kit-<hash>/api`
// without copying the package into .next/node_modules, which breaks the
// OpenNext esbuild bundling step. The code path never runs inside the
// Cloudflare Worker, so satisfy the resolver with a throwing stub.
// Run AFTER `next build`, BEFORE `opennextjs-cloudflare build --skipNextBuild`.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(root, '..')
const serverDir = path.join(projectDir, '.next', 'server')
// Project node_modules: OpenNext only copies traced files into .open-next, but
// esbuild's resolver walks up from the copied chunks to the real node_modules.
const modulesDir = path.join(projectDir, 'node_modules')

const hashes = new Set()
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    else if (entry.name.endsWith('.js')) {
      const src = fs.readFileSync(p, 'utf8')
      for (const m of src.matchAll(/["'](drizzle-kit-[0-9a-f]+)\/api["']/g)) hashes.add(m[1])
    }
  }
}
walk(serverDir)

if (hashes.size === 0) {
  console.log('stub-drizzle-kit: no hashed drizzle-kit references found, nothing to do')
  process.exit(0)
}

const stubJs = `module.exports = new Proxy({}, {
  get(_t, prop) {
    throw new Error('drizzle-kit/api ("' + String(prop) + '") is dev-only migration tooling and is not available in the Cloudflare Worker runtime')
  },
})
`

for (const name of hashes) {
  const dir = path.join(modulesDir, name)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'drizzle-kit', version: '0.0.0-worker-stub', main: 'api.js', exports: { '.': './api.js', './api': './api.js' } }, null, 2),
  )
  fs.writeFileSync(path.join(dir, 'api.js'), stubJs)
  console.log(`stub-drizzle-kit: stubbed ${name}`)
}

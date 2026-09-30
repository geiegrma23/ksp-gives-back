// Shared Cloudflare context resolution — works in the deployed worker
// (OpenNext runtime) AND in payload CLI runs (migrate, run) via the wrangler
// platform proxy. Used by payload.config.ts (bindings) and hooks (KV purge).
import fs from 'fs'
import path from 'path'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'

const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

export const isCLI = process.argv.some((value) =>
  (realpath(value) || '').endsWith(path.join('payload', 'bin.js')),
)
export const isProduction = process.env.NODE_ENV === 'production'

// Adapted from opennextjs-cloudflare's cloudflare-context helper
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}

let contextPromise: Promise<CloudflareContext> | null = null

export function getCfContext(): Promise<CloudflareContext> {
  if (!contextPromise) {
    contextPromise =
      isCLI || !isProduction
        ? getCloudflareContextFromWrangler()
        : getCloudflareContext({ async: true })
  }
  return contextPromise
}

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const infraDir = join(__dirname, '..')
const infraEnvPath = join(infraDir, '.env')
const webEnvPath = join(infraDir, '..', '..', 'apps', 'web', '.env')

// packages/infra/.env loads after apps/web/.env and wins for overlapping keys
// (PUBLIC_SERVER_URL, ALCHEMY_STAGE, Cloudflare credentials).
config({ path: webEnvPath, override: true })
config({ path: infraEnvPath, override: true })

const proc = Bun.spawnSync(['bunx', 'wrangler', 'whoami'], {
	cwd: infraDir,
	env: process.env,
	stdout: 'pipe',
	stderr: 'pipe',
})

process.stdout.write(proc.stdout)
process.stderr.write(proc.stderr)
process.exit(proc.exitCode ?? 1)

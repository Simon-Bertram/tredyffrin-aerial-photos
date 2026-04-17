import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const infraDir = join(__dirname, '..')
const infraEnvPath = join(infraDir, '.env')
const webEnvPath = join(infraDir, '..', '..', 'apps', 'web', '.env')

// Repo .env wins over inherited shell so a stale CLOUDFLARE_API_TOKEN in the
// parent environment cannot mask a valid token in packages/infra/.env.
config({ path: infraEnvPath, override: true })
config({ path: webEnvPath, override: true })

const proc = Bun.spawnSync(['bunx', 'wrangler', 'whoami'], {
	cwd: infraDir,
	env: process.env,
	stdout: 'pipe',
	stderr: 'pipe',
})

process.stdout.write(proc.stdout)
process.stderr.write(proc.stderr)
process.exit(proc.exitCode ?? 1)

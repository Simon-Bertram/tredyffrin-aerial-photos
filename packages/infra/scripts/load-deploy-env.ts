import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const infraDir = join(__dirname, '..')
const webEnvPath = join(infraDir, '..', '..', 'apps', 'web', '.env')
const infraEnvPath = join(infraDir, '.env')

export function loadDeployEnv(): void {
	config({ path: webEnvPath, override: true })
	config({ path: infraEnvPath, override: true })
}

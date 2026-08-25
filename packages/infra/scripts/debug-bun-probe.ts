import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const pinnedBun = join(homedir(), '.bun', 'bin', 'bun')
const bunHome = join(homedir(), '.bun')
const whichBun = spawnSync('which', ['bun'], { encoding: 'utf8' }).stdout.trim()
const brewBun = '/opt/homebrew/bin/bun'

// #region agent log
const payload = {
	sessionId: '232fef',
	runId: 'pre-fix',
	location: 'debug-bun-probe.ts',
	message: 'bun path probe',
	timestamp: Date.now(),
	data: {
		home: homedir(),
		runtimeVersion: Bun.version,
		runtimePath: process.execPath,
		pinnedBun,
		pinnedExists: existsSync(pinnedBun),
		bunHomeExists: existsSync(bunHome),
		bunHomeEntries: existsSync(bunHome) ? readdirSync(bunHome) : [],
		whichBun,
		brewBunExists: existsSync(brewBun),
		pathEnv: process.env.PATH ?? '',
		hypothesisA_pinnedMissing: !existsSync(pinnedBun),
		hypothesisB_homebrewActive:
			whichBun.includes('homebrew') || process.execPath.includes('homebrew'),
		hypothesisC_homeWrong: homedir() !== process.env.HOME,
		hypothesisD_brokenSymlink:
			existsSync(join(homedir(), '.bun', 'bin')) && !existsSync(pinnedBun),
		hypothesisE_hardcodedVsPath:
			!existsSync(pinnedBun) && Boolean(whichBun),
	},
}
await fetch('http://127.0.0.1:7739/ingest/6f212097-021c-4e8b-856c-d2b20f4fe080', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'X-Debug-Session-Id': '232fef',
	},
	body: JSON.stringify({
		...payload,
		hypothesisId: 'A-E',
	}),
}).catch(() => {})
console.error('[debug-bun-probe]', JSON.stringify(payload.data))
// #endregion

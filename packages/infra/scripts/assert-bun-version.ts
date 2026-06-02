import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const expected = readFileSync(join(repoRoot, '.bun-version'), 'utf8').trim()
const runtimeVersion = Bun.version
const runtimePath = process.execPath
const pinnedBun = join(homedir(), '.bun', 'bin', 'bun')

function readBunVersion (executable: string): string | null {
	if (!existsSync(executable)) return null
	const proc = spawnSync(executable, ['--version'], { encoding: 'utf8' })
	if (proc.status !== 0) return null
	return proc.stdout.trim()
}

const whichBun = spawnSync('which', ['bun'], { encoding: 'utf8' }).stdout.trim()
const pinnedVersion = readBunVersion(pinnedBun)

if (runtimeVersion !== expected) {
	console.error(
		`Bun version mismatch: expected ${expected} (see .bun-version), got ${runtimeVersion}.`,
	)
	console.error(`  Running: ${runtimePath}`)
	if (whichBun) console.error(`  which bun: ${whichBun}`)
	if (pinnedVersion === expected) {
		console.error('')
		console.error(
			`Pinned Bun ${expected} is installed at ${pinnedBun} but is not the active "bun".`,
		)
		console.error('Use either:')
		console.error(`  ${pinnedBun} run deploy`)
		console.error('  export PATH="$HOME/.bun/bin:$PATH"   # add to ~/.zshrc')
	} else {
		console.error('Install the pinned version, e.g.:')
		console.error('  curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.12"')
	}
	process.exit(1)
}

import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(scriptDir, '..', '..', '..')
const webDir = join(repoRoot, 'apps', 'web')
const previewPort = 8788

function assert (condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message)
	}
}

async function runCommand (cmd: string[], cwd: string): Promise<{ code: number; output: string }> {
	const proc = Bun.spawn(cmd, {
		cwd,
		env: process.env,
		stdout: 'pipe',
		stderr: 'pipe',
	})
	const [stdout, stderr, code] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	])
	const output = `${stdout}\n${stderr}`.trim()
	return { code, output }
}

async function assertExists (path: string): Promise<void> {
	await access(path, constants.F_OK)
}

async function waitForPreviewReady (): Promise<void> {
	for (let i = 0; i < 40; i += 1) {
		try {
			const response = await fetch(`http://127.0.0.1:${previewPort}/about`)
			if (response.status > 0) return
		} catch {
			// keep retrying until wrangler starts listening
		}
		await Bun.sleep(500)
	}
	throw new Error('Timed out waiting for local wrangler preview to start')
}

async function fetchHtml (path: string): Promise<string> {
	const response = await fetch(`http://127.0.0.1:${previewPort}${path}`)
	const body = await response.text()
	assert(response.status === 200, `Expected ${path} to return 200, got ${response.status}`)
	assert(/<!doctype html>/i.test(body), `Expected ${path} to return HTML`)
	assert(!/404: Not Found/.test(body), `Detected Cloudflare 404 template on ${path}`)
	return body
}

function getFirstLocationPath (sitemap: string): string {
	const match = sitemap.match(/<loc>([^<]*\/locations\/[^<]*)<\/loc>/i)
	assert(match, 'No /locations/* URL found in sitemap.xml')
	const path = new URL(match[1]).pathname
	assert(path.startsWith('/locations/'), `Invalid dynamic route discovered: ${path}`)
	return path
}

async function main (): Promise<void> {
	console.log('Running build...')
	const build = await runCommand(['bun', 'run', 'build'], repoRoot)
	console.log(build.output)
	assert(build.code === 0, 'Build failed')
	assert(!/ERR_DISPOSED/.test(build.output), 'Build output contains ERR_DISPOSED')
	assert(!/Cannot read properties of null \(reading 'useState'\)/.test(build.output), 'Build output contains React prerender hook error')

	console.log('Checking expected artifacts...')
	await assertExists(join(webDir, 'dist', 'server', 'entry.mjs'))
	await assertExists(join(webDir, 'dist', 'server', 'wrangler.json'))
	await assertExists(join(webDir, 'dist', 'client', 'favicon.svg'))

	console.log('Starting local wrangler preview...')
	const preview = Bun.spawn(
		[
			'bunx',
			'wrangler',
			'dev',
			'dist/server/entry.mjs',
			'--assets',
			'dist/client',
			'--ip',
			'127.0.0.1',
			'--port',
			String(previewPort),
			'--local',
			'--config',
			'wrangler.toml',
		],
		{
			cwd: webDir,
			env: process.env,
			stdout: 'pipe',
			stderr: 'pipe',
		},
	)

	try {
		await waitForPreviewReady()
		const rootHtml = await fetchHtml('/')
		await fetchHtml('/about')
		assert(!/Cannot read properties of undefined \(reading 'fetch'\)/.test(rootHtml), 'Root route failed with worker fetch binding error')

		const sitemapRes = await fetch(`http://127.0.0.1:${previewPort}/sitemap.xml`)
		assert(sitemapRes.status === 200, `Expected /sitemap.xml to return 200, got ${sitemapRes.status}`)
		const sitemap = await sitemapRes.text()
		const dynamicRoute = getFirstLocationPath(sitemap)
		await fetchHtml(dynamicRoute)
		console.log(`Validated routes: /, /about, ${dynamicRoute}`)
	} finally {
		preview.kill()
		await preview.exited
	}

	console.log('Prerender safety check passed')
}

main().catch((err) => {
	console.error(err instanceof Error ? err.message : String(err))
	process.exit(1)
})

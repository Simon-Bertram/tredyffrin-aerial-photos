import { loadDeployEnv } from './load-deploy-env'

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

export interface CloudflareApiResult<T> {
	success: boolean
	errors: Array<{ code: number; message: string }>
	result: T
}

export interface CloudflareZone {
	id: string
	name: string
}

export function isWorkersDevHostname(hostname: string): boolean {
	return hostname === 'workers.dev' || hostname.endsWith('.workers.dev')
}

export function zoneNameCandidates(hostname: string): string[] {
	const parts = hostname.split('.').filter(Boolean)
	const candidates: string[] = []

	for (let i = 0; i < parts.length - 1; i++) {
		candidates.push(parts.slice(i).join('.'))
	}

	return candidates
}

export function hostnameFromPublicUrl(publicServerUrl: string): string {
	return new URL(publicServerUrl).hostname
}

export function isPurgeEnabled(rawValue: string | undefined): boolean {
	return rawValue !== '0'
}

async function cloudflareFetch<T>(
	path: string,
	apiToken: string,
	init?: RequestInit,
): Promise<CloudflareApiResult<T>> {
	const response = await fetch(`${CLOUDFLARE_API_BASE}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${apiToken}`,
			'Content-Type': 'application/json',
			...init?.headers,
		},
	})

	const body = (await response.json()) as CloudflareApiResult<T>

	if (!response.ok) {
		const message =
			body.errors?.map((error) => error.message).join('; ') ||
			`HTTP ${response.status}`
		throw new Error(message)
	}

	if (!body.success) {
		const message =
			body.errors?.map((error) => error.message).join('; ') ||
			'Cloudflare API request failed'
		throw new Error(message)
	}

	return body
}

export async function findZoneByName(
	apiToken: string,
	zoneName: string,
): Promise<CloudflareZone | null> {
	const query = new URLSearchParams({
		name: zoneName,
		status: 'active',
	})
	const body = await cloudflareFetch<CloudflareZone[]>(
		`/zones?${query.toString()}`,
		apiToken,
	)
	return body.result[0] ?? null
}

export async function resolveZoneId(
	apiToken: string,
	publicServerUrl: string,
	explicitZoneId?: string,
): Promise<string | null> {
	if (explicitZoneId != null && explicitZoneId.length > 0) {
		return explicitZoneId
	}

	const hostname = hostnameFromPublicUrl(publicServerUrl)
	if (isWorkersDevHostname(hostname)) {
		return null
	}

	for (const candidate of zoneNameCandidates(hostname)) {
		const zone = await findZoneByName(apiToken, candidate)
		if (zone != null) {
			return zone.id
		}
	}

	return null
}

export async function purgeZoneCache(
	apiToken: string,
	zoneId: string,
): Promise<void> {
	await cloudflareFetch<{ id: string }>(
		`/zones/${zoneId}/purge_cache`,
		apiToken,
		{
			method: 'POST',
			body: JSON.stringify({ purge_everything: true }),
		},
	)
}

export interface PurgeCloudflareCacheOptions {
	apiToken?: string
	publicServerUrl?: string
	zoneId?: string
	purgeEnabled?: boolean
}

export async function purgeCloudflareCacheAfterDeploy(
	options: PurgeCloudflareCacheOptions,
): Promise<'purged' | 'skipped'> {
	if (options.purgeEnabled === false) {
		console.log('Skipping Cloudflare cache purge (CLOUDFLARE_PURGE_CACHE=0).')
		return 'skipped'
	}

	const apiToken = options.apiToken?.trim()
	if (apiToken == null || apiToken.length === 0) {
		console.warn(
			'Skipping Cloudflare cache purge: CLOUDFLARE_API_TOKEN is not set.',
		)
		return 'skipped'
	}

	const publicServerUrl = options.publicServerUrl?.trim()
	if (publicServerUrl == null || publicServerUrl.length === 0) {
		console.warn(
			'Skipping Cloudflare cache purge: PUBLIC_SERVER_URL is not set.',
		)
		return 'skipped'
	}

	const hostname = hostnameFromPublicUrl(publicServerUrl)
	if (isWorkersDevHostname(hostname)) {
		console.warn(
			`Skipping Cloudflare cache purge: ${hostname} is on workers.dev (zone purge requires a custom domain on your account).`,
		)
		return 'skipped'
	}

	const zoneId = await resolveZoneId(
		apiToken,
		publicServerUrl,
		options.zoneId,
	)
	if (zoneId == null) {
		console.warn(
			`Skipping Cloudflare cache purge: no active Cloudflare zone found for ${hostname}. Set CLOUDFLARE_ZONE_ID in packages/infra/.env.`,
		)
		return 'skipped'
	}

	await purgeZoneCache(apiToken, zoneId)
	console.log(`Purged Cloudflare cache for zone ${zoneId} (${hostname}).`)
	return 'purged'
}

async function main(): Promise<void> {
	loadDeployEnv()

	try {
		await purgeCloudflareCacheAfterDeploy({
			apiToken: process.env.CLOUDFLARE_API_TOKEN,
			publicServerUrl: process.env.PUBLIC_SERVER_URL,
			zoneId: process.env.CLOUDFLARE_ZONE_ID,
			purgeEnabled: isPurgeEnabled(process.env.CLOUDFLARE_PURGE_CACHE),
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Cloudflare cache purge failed: ${message}`)
		process.exit(1)
	}
}

if (import.meta.main) {
	void main()
}

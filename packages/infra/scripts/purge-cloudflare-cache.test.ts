import { afterEach, describe, expect, it, vi } from 'vitest'

import {
	findZoneByName,
	isPurgeEnabled,
	isWorkersDevHostname,
	purgeCloudflareCacheAfterDeploy,
	purgeZoneCache,
	resolveZoneId,
	zoneNameCandidates,
} from './purge-cloudflare-cache'

describe('isWorkersDevHostname', () => {
	it('detects workers.dev hostnames', () => {
		expect(isWorkersDevHostname('web.example.workers.dev')).toBe(true)
		expect(isWorkersDevHostname('example.com')).toBe(false)
	})
})

describe('zoneNameCandidates', () => {
	it('returns suffix candidates from most specific to apex', () => {
		expect(zoneNameCandidates('www.photos.example.com')).toEqual([
			'www.photos.example.com',
			'photos.example.com',
			'example.com',
		])
	})
})

describe('isPurgeEnabled', () => {
	it('defaults to enabled unless explicitly disabled', () => {
		expect(isPurgeEnabled(undefined)).toBe(true)
		expect(isPurgeEnabled('1')).toBe(true)
		expect(isPurgeEnabled('0')).toBe(false)
	})
})

describe('purgeCloudflareCacheAfterDeploy', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('skips purge for workers.dev URLs', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch')

		const result = await purgeCloudflareCacheAfterDeploy({
			apiToken: 'token',
			publicServerUrl: 'https://web-example.workers.dev',
		})

		expect(result).toBe('skipped')
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('purges cache when zone id is provided', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					errors: [],
					result: { id: 'purge-id' },
				}),
				{ status: 200 },
			),
		)

		const result = await purgeCloudflareCacheAfterDeploy({
			apiToken: 'token',
			publicServerUrl: 'https://photos.example.com',
			zoneId: 'zone-123',
		})

		expect(result).toBe('purged')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(fetchMock.mock.calls[0]?.[0]).toBe(
			'https://api.cloudflare.com/client/v4/zones/zone-123/purge_cache',
		)
	})
})

describe('resolveZoneId', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('returns explicit zone id without lookup', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch')

		await expect(
			resolveZoneId('token', 'https://photos.example.com', 'zone-explicit'),
		).resolves.toBe('zone-explicit')
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('looks up zone by hostname suffix', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					errors: [],
					result: [{ id: 'zone-found', name: 'example.com' }],
				}),
				{ status: 200 },
			),
		)

		await expect(
			resolveZoneId('token', 'https://www.example.com'),
		).resolves.toBe('zone-found')
	})
})

describe('findZoneByName and purgeZoneCache', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('findZoneByName returns the first active zone', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					errors: [],
					result: [{ id: 'zone-1', name: 'example.com' }],
				}),
				{ status: 200 },
			),
		)

		await expect(findZoneByName('token', 'example.com')).resolves.toEqual({
			id: 'zone-1',
			name: 'example.com',
		})
	})

	it('purgeZoneCache posts purge_everything', async () => {
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					errors: [],
					result: { id: 'purge-id' },
				}),
				{ status: 200 },
			),
		)

		await purgeZoneCache('token', 'zone-123')

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.cloudflare.com/client/v4/zones/zone-123/purge_cache',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ purge_everything: true }),
			}),
		)
	})
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SanityRepositoryTelemetryEvent } from '@/lib/sanity-location-repository'
import {
	buildGalleryNavGroups,
	fetchAboutPageFeaturePhotos,
	fetchGalleryNavItems,
	fetchLocationsForMap,
	fetchOtherLocationPlaces,
	fetchPublishedLocationSlugs,
	fetchThemeCollectionPhotoCounts,
	fetchThemePhotos,
	fetchThemePlaces,
	resetSanityRepositoryTelemetryEmitter,
	setSanityRepositoryTelemetryEmitter,
} from '@/lib/sanity-location-repository'

const fetchMock = vi.fn()
const mapSanityLocationToRecordMock = vi.fn()

const envMock = vi.hoisted(() => ({
	SANITY_E2E_FIXTURES: undefined as string | undefined,
}))

vi.mock('astro:env/server', () => ({
	PUBLIC_SANITY_PROJECT_ID: 'proj',
	PUBLIC_SANITY_DATASET: 'dataset',
	get SANITY_E2E_FIXTURES() {
		return envMock.SANITY_E2E_FIXTURES
	},
}))

vi.mock('@/lib/sanity/client', () => ({
	getSanityClient: () => ({
		fetch: fetchMock,
	}),
}))

vi.mock('@/lib/sanity/image', () => ({
	createSanityImageBuilder: () => ({
		image: () => ({
			width: () => ({
				auto: () => ({
					url: () => 'https://example.com/image.jpg',
				}),
			}),
		}),
	}),
}))

vi.mock('@/lib/sanity/map-location', () => ({
	mapSanityLocationToRecord: (...args: unknown[]) =>
		mapSanityLocationToRecordMock(...args),
}))

import { TREDYFFRIN_EASTTOWN_VALUE } from '@/lib/place-collections'

describe('sanity-location-repository drift handling', () => {
	const telemetryEvents: SanityRepositoryTelemetryEvent[] = []

	beforeEach(() => {
		telemetryEvents.length = 0
		fetchMock.mockReset()
		mapSanityLocationToRecordMock.mockReset()
		setSanityRepositoryTelemetryEmitter((event) => {
			telemetryEvents.push(event)
		})
	})

	afterEach(() => {
		resetSanityRepositoryTelemetryEmitter()
	})

	it('fails open for non-array map query responses and emits telemetry', async () => {
		fetchMock.mockResolvedValueOnce({ bad: 'shape' })

		const result = await fetchLocationsForMap()

		expect(result).toEqual([])
		expect(telemetryEvents).toEqual([
			expect.objectContaining({
				eventName: 'unexpectedShape',
				context: 'fetchLocationsForMap',
				queryKind: 'locationsForMap',
				reason: 'expected array',
			}),
		])
	})

	it('skips malformed theme place rows while preserving valid rows', async () => {
		fetchMock.mockResolvedValueOnce([
			{ name: 'Paoli', slug: 'paoli', photoCount: 2 },
			{ name: '', slug: 'bad-row', photoCount: 5 },
			{ name: 'NoSlug', slug: '', photoCount: 1 },
		])

		const result = await fetchThemePlaces('airfields')

		expect(result).toEqual([
			{
				name: 'Paoli',
				href: '/locations/paoli?collection=airfields',
				photoCount: 2,
			},
		])
		expect(telemetryEvents.some((event) => event.eventName === 'skip')).toBe(true)
	})

	it('defaults invalid theme collection counts to zero', async () => {
		fetchMock.mockResolvedValueOnce({
			airfields: 3,
			bridges: Number.NaN,
		})

		const result = await fetchThemeCollectionPhotoCounts()
		expect(result.airfields).toBe(3)
		expect(result.bridges).toBe(0)
		expect(result.railroads).toBe(0)
	})

	it('keeps valid slugs and ignores malformed slug rows', async () => {
		fetchMock.mockResolvedValueOnce([
			{ slug: 'paoli' },
			{ slug: 123 },
			{},
			{ slug: 'berwyn' },
		])

		const result = await fetchPublishedLocationSlugs()
		expect(result).toEqual(['paoli', 'berwyn'])
	})

	it('skips invalid mapped theme photo rows and emits skip telemetry', async () => {
		fetchMock.mockResolvedValueOnce([{ slug: 'a' }, { slug: 'b' }])
		mapSanityLocationToRecordMock
			.mockReturnValueOnce(undefined)
			.mockReturnValueOnce({
				slug: 'b',
				name: 'B',
				shortDescription: '',
				fullDescription: '',
				photos: [{ id: 'p1', title: 'Photo', src: '/p1.jpg', alt: 'p1' }],
			})

		const result = await fetchThemePhotos('airfields')

		expect(result).toEqual([
			{ id: 'p1', title: 'Photo', src: '/p1.jpg', alt: 'p1' },
		])
		expect(
			telemetryEvents.some(
				(event) =>
					event.eventName === 'skip' &&
					event.context === 'fetchThemePhotos' &&
					event.reason === 'location skipped after validation',
			),
		).toBe(true)
	})

	it('omits missing name/slug for other-location links', async () => {
		fetchMock.mockResolvedValueOnce([
			{ name: 'Paoli', slug: 'paoli', photoCount: 3 },
			{ name: ' ', slug: 'invalid' },
			{ name: 'No slug', slug: '' },
		])

		const result = await fetchOtherLocationPlaces()

		expect(result).toEqual([
			{ name: 'Paoli', href: '/locations/paoli', photoCount: 3 },
		])
	})

	it('returns fixture about-page photos without calling Sanity', async () => {
		envMock.SANITY_E2E_FIXTURES = '1'

		const result = await fetchAboutPageFeaturePhotos(5)

		expect(fetchMock).not.toHaveBeenCalled()
		expect(result.length).toBeGreaterThan(0)
		expect(result[0]).toMatchObject({
			slug: expect.any(String),
			src: expect.any(String),
			alt: expect.any(String),
			locationName: expect.any(String),
		})

		envMock.SANITY_E2E_FIXTURES = undefined
	})

	it('skips malformed gallery nav rows while preserving valid rows', async () => {
		fetchMock.mockResolvedValueOnce([
			{
				name: 'Paoli',
				slug: 'paoli',
				placeCollection: TREDYFFRIN_EASTTOWN_VALUE,
			},
			{ name: '', slug: 'bad-row' },
			{ name: 'Berwyn', slug: 'berwyn' },
		])

		const result = await fetchGalleryNavItems()

		expect(result).toEqual([
			{
				name: 'Paoli',
				slug: 'paoli',
				placeCollection: TREDYFFRIN_EASTTOWN_VALUE,
			},
			{ name: 'Berwyn', slug: 'berwyn' },
		])
		expect(telemetryEvents.some((event) => event.eventName === 'skip')).toBe(true)
	})

	it('groups gallery nav items by placeCollection and appends themed links', () => {
		const groups = buildGalleryNavGroups(
			[
				{
					name: 'Paoli',
					slug: 'paoli',
					placeCollection: TREDYFFRIN_EASTTOWN_VALUE,
				},
				{ name: 'Berwyn', slug: 'berwyn' },
			],
			{
				airfields: 2,
				bridges: 0,
				railroads: 1,
				'philadelphia-art-museum': 0,
			},
		)

		expect(groups).toEqual([
			{
				label: 'Tredyffrin Easttown',
				items: [{ name: 'Paoli', href: '/locations/paoli' }],
			},
			{
				label: 'Other Locations',
				items: [{ name: 'Berwyn', href: '/locations/berwyn' }],
			},
			{
				label: 'Themed Collections',
				items: [
					{ name: 'Airfields (2)', href: '/themes/airfields' },
					{ name: 'Bridges (0)', href: '/themes/bridges' },
					{ name: 'Railroads (1)', href: '/themes/railroads' },
					{
						name: 'Philadelphia Art Museum (0)',
						href: '/themes/philadelphia-art-museum',
					},
				],
			},
		])
	})

	it('uses Studio title for the Tredyffrin Easttown group label when provided', () => {
		const groups = buildGalleryNavGroups(
			[
				{
					name: 'Paoli',
					slug: 'paoli',
					placeCollection: TREDYFFRIN_EASTTOWN_VALUE,
				},
			],
			{
				airfields: 0,
				bridges: 0,
				railroads: 0,
				'philadelphia-art-museum': 0,
			},
			{ tredyffrinEasttownLabel: '  Tredyffrin & Easttown  ' },
		)

		expect(groups[0]?.label).toBe('Tredyffrin & Easttown')
	})

	it('omits empty gallery nav groups', () => {
		const groups = buildGalleryNavGroups(
			[
				{
					name: 'Paoli',
					slug: 'paoli',
					placeCollection: TREDYFFRIN_EASTTOWN_VALUE,
				},
			],
			{
				airfields: 0,
				bridges: 0,
				railroads: 0,
				'philadelphia-art-museum': 0,
			},
		)

		expect(groups.map((group) => group.label)).toEqual([
			'Tredyffrin Easttown',
			'Themed Collections',
		])
	})
})

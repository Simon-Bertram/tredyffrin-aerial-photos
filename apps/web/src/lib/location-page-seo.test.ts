import { describe, expect, it, vi } from 'vitest'

vi.mock('astro:env/client', () => ({
	PUBLIC_SERVER_URL: 'https://example.com',
}))

import {
	buildLocationPageLayoutMeta,
	LOCATION_PAGE_NOT_FOUND_DESCRIPTION,
} from '@/lib/location-page-seo'

const siteOrigin = 'https://example.com'

describe('buildLocationPageLayoutMeta', () => {
	it('builds metadata and JSON-LD for a resolved location', () => {
		const result = buildLocationPageLayoutMeta(
			{
				slug: 'paoli',
				name: 'Paoli',
				coordinates: { longitude: -75.48, latitude: 40.04 },
				shortDescription: 'Historic aerial imagery.',
				fullDescription: '',
				photos: [
					{
						id: 'p1',
						title: 'Plate',
						src: '/images/paoli.jpg',
						alt: 'Aerial view of Paoli',
					},
				],
			},
			siteOrigin,
		)

		expect(result.pageTitle).toBe('Paoli — Tredyffrin Aerial Photos')
		expect(result.previewSrc).toBe('/images/paoli.jpg')
		expect(result.jsonLd).toMatchObject({
			'@type': 'Place',
			name: 'Paoli',
			url: 'https://example.com/locations/paoli',
			image: ['https://example.com/images/paoli.jpg'],
		})
	})

	it('returns not-found metadata for missing locations', () => {
		const result = buildLocationPageLayoutMeta(undefined, siteOrigin)

		expect(result.pageTitle).toBe('Page not found — Tredyffrin Aerial Photos')
		expect(result.pageDescription).toBe(LOCATION_PAGE_NOT_FOUND_DESCRIPTION)
		expect(result.previewSrc).toBeUndefined()
		expect(result.jsonLd).toBeUndefined()
	})

	it('uses collection title and collection-filtered photos when provided', () => {
		const result = buildLocationPageLayoutMeta(
			{
				slug: 'paoli',
				name: 'Paoli',
				shortDescription: '',
				fullDescription: 'General archive text.',
				photos: [
					{
						id: 'unfiltered',
						title: 'Unfiltered',
						src: '/images/unfiltered.jpg',
						alt: 'Unfiltered',
					},
				],
			},
			siteOrigin,
			{
				collectionTitle: 'Airfields',
				displayPhotos: [
					{
						id: 'filtered',
						title: 'Filtered',
						src: '/images/filtered.jpg',
						alt: 'Filtered',
					},
				],
			},
		)

		expect(result.pageTitle).toBe(
			'Paoli — Airfields — Tredyffrin Aerial Photos',
		)
		expect(result.previewSrc).toBe('/images/filtered.jpg')
	})
})

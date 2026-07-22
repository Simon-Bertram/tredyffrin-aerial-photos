import { describe, expect, it, vi } from 'vitest'

const { fetchGalleryNavItemsMock, fetchThemeCollectionPhotoCountsMock, fetchPlaceCollectionTitleMock } =
	vi.hoisted(() => ({
		fetchGalleryNavItemsMock: vi.fn(),
		fetchThemeCollectionPhotoCountsMock: vi.fn(),
		fetchPlaceCollectionTitleMock: vi.fn(),
	}))

vi.mock('@/lib/sanity-location-repository', () => ({
	fetchGalleryNavItems: fetchGalleryNavItemsMock,
	fetchThemeCollectionPhotoCounts: fetchThemeCollectionPhotoCountsMock,
	fetchPlaceCollectionTitle: fetchPlaceCollectionTitleMock,
}))

import {
	ensureHeaderSanityData,
	loadHeaderSanityData,
} from '@/lib/header-sanity-data'

describe('loadHeaderSanityData', () => {
	it('fetches nav items, theme counts, and TE title in parallel', async () => {
		fetchGalleryNavItemsMock.mockResolvedValue([
			{ name: 'Paoli', slug: 'paoli' },
		])
		fetchThemeCollectionPhotoCountsMock.mockResolvedValue({ airfields: 3 })
		fetchPlaceCollectionTitleMock.mockResolvedValue('Tredyffrin Easttown')

		const result = await loadHeaderSanityData()

		expect(result).toEqual({
			navItems: [{ name: 'Paoli', slug: 'paoli' }],
			themeCounts: { airfields: 3 },
			tredyffrinEasttownTitle: 'Tredyffrin Easttown',
		})
		expect(fetchGalleryNavItemsMock).toHaveBeenCalledOnce()
		expect(fetchThemeCollectionPhotoCountsMock).toHaveBeenCalledOnce()
		expect(fetchPlaceCollectionTitleMock).toHaveBeenCalledOnce()
	})
})

describe('ensureHeaderSanityData', () => {
	it('reuses the same promise for a request locals object', async () => {
		fetchGalleryNavItemsMock.mockClear()
		fetchThemeCollectionPhotoCountsMock.mockClear()
		fetchPlaceCollectionTitleMock.mockClear()
		fetchGalleryNavItemsMock.mockResolvedValue([])
		fetchThemeCollectionPhotoCountsMock.mockResolvedValue({})
		fetchPlaceCollectionTitleMock.mockResolvedValue(undefined)

		const locals: Pick<App.Locals, 'headerSanityData'> = {}
		const first = ensureHeaderSanityData(locals)
		const second = ensureHeaderSanityData(locals)

		expect(first).toBe(second)
		await first
		expect(fetchGalleryNavItemsMock).toHaveBeenCalledOnce()
		expect(fetchThemeCollectionPhotoCountsMock).toHaveBeenCalledOnce()
		expect(fetchPlaceCollectionTitleMock).toHaveBeenCalledOnce()
	})
})

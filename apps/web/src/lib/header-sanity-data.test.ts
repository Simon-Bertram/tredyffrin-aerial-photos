import { describe, expect, it, vi } from 'vitest'

const { fetchGalleryNavItemsMock, fetchThemeCollectionPhotoCountsMock } =
	vi.hoisted(() => ({
		fetchGalleryNavItemsMock: vi.fn(),
		fetchThemeCollectionPhotoCountsMock: vi.fn(),
	}))

vi.mock('@/lib/sanity-location-repository', () => ({
	fetchGalleryNavItems: fetchGalleryNavItemsMock,
	fetchThemeCollectionPhotoCounts: fetchThemeCollectionPhotoCountsMock,
}))

import {
	ensureHeaderSanityData,
	loadHeaderSanityData,
} from '@/lib/header-sanity-data'

describe('loadHeaderSanityData', () => {
	it('fetches nav items and theme counts in parallel', async () => {
		fetchGalleryNavItemsMock.mockResolvedValue([
			{ name: 'Paoli', slug: 'paoli' },
		])
		fetchThemeCollectionPhotoCountsMock.mockResolvedValue({ airfields: 3 })

		const result = await loadHeaderSanityData()

		expect(result).toEqual({
			navItems: [{ name: 'Paoli', slug: 'paoli' }],
			themeCounts: { airfields: 3 },
		})
		expect(fetchGalleryNavItemsMock).toHaveBeenCalledOnce()
		expect(fetchThemeCollectionPhotoCountsMock).toHaveBeenCalledOnce()
	})
})

describe('ensureHeaderSanityData', () => {
	it('reuses the same promise for a request locals object', async () => {
		fetchGalleryNavItemsMock.mockClear()
		fetchThemeCollectionPhotoCountsMock.mockClear()
		fetchGalleryNavItemsMock.mockResolvedValue([])
		fetchThemeCollectionPhotoCountsMock.mockResolvedValue({})

		const locals: App.Locals = {}
		const first = ensureHeaderSanityData(locals)
		const second = ensureHeaderSanityData(locals)

		expect(first).toBe(second)
		await first
		expect(fetchGalleryNavItemsMock).toHaveBeenCalledOnce()
		expect(fetchThemeCollectionPhotoCountsMock).toHaveBeenCalledOnce()
	})
})

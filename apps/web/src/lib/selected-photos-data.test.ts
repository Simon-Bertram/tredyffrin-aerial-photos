import { describe, expect, it } from 'vitest'

import { buildSelectedPhotos, toCoverflowIslandPhotos } from '@/lib/selected-photos-data'

describe('buildSelectedPhotos', () => {
	it('prefers explicitly selected photos and numbers plates from 1', () => {
		const result = buildSelectedPhotos([
			{
				slug: 'paoli',
				name: 'Paoli',
				coordinates: { longitude: -75.48, latitude: 40.04 },
				shortDescription: '',
				fullDescription: '',
				photos: [
					{
						id: 'p1',
						title: 'One',
						src: '/1.jpg',
						alt: 'one',
						addToSelectedPhotosCollection: false,
					},
					{
						id: 'p2',
						title: 'Two',
						src: '/2.jpg',
						alt: 'two',
						addToSelectedPhotosCollection: true,
						selectedCollection: 'airfields',
					},
				],
			},
		])

		expect(result).toHaveLength(1)
		expect(result[0]).toMatchObject({
			key: 'paoli-p2',
			photoId: 'p2',
			plateNumber: 1,
			selectedCollection: 'airfields',
		})
	})

	it('falls back to the latest five photos when none are selected', () => {
		const photos = Array.from({ length: 8 }, (_, index) => ({
			id: `p-${index + 1}`,
			title: `Photo ${index + 1}`,
			src: `/${index + 1}.jpg`,
			alt: `photo-${index + 1}`,
			addToSelectedPhotosCollection: false,
		}))

		const result = buildSelectedPhotos([
			{
				slug: 'berwyn',
				name: 'Berwyn',
				coordinates: { longitude: -75.43, latitude: 40.04 },
				shortDescription: '',
				fullDescription: '',
				photos,
			},
		])

		expect(result).toHaveLength(5)
		expect(result[0]?.photoId).toBe('p-4')
		expect(result[4]?.photoId).toBe('p-8')
		expect(result[0]?.plateNumber).toBe(1)
		expect(result[4]?.plateNumber).toBe(5)
	})
})

describe('toCoverflowIslandPhotos', () => {
	it('drops non-island fields and preserves required display fields', () => {
		const result = toCoverflowIslandPhotos([
			{
				key: 'paoli-p2',
				photoId: 'p2',
				plateNumber: 1,
				locationName: 'Paoli',
				locationSlug: 'paoli',
				src: '/2.jpg',
				alt: 'two',
				photoDate: '1948',
				direction: 'North',
				selectedCollection: 'bridges',
			},
		])

		expect(result).toEqual([
			{
				src: '/2.jpg',
				alt: 'two',
				locationName: 'Paoli',
				locationSlug: 'paoli',
				photoId: 'p2',
				photoDate: '1948',
				selectedCollection: 'bridges',
			},
		])
	})
})

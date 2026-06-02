import { describe, expect, it } from 'vitest'

import { SELECTED_PHOTO_COLLECTIONS } from '@/lib/selected-photo-collections'
import {
	buildHomepageCoverflowPhotos,
	buildSelectedPhotos,
	toCoverflowIslandPhotos,
} from '@/lib/selected-photos-data'

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

describe('homepage dropdown filter data contract', () => {
	it('keeps at least one photo per configured collection for a production-like fixture', () => {
		const fixtureLocations = [
			{
				slug: 'paoli',
				name: 'Paoli',
				coordinates: { longitude: -75.48, latitude: 40.04 },
				shortDescription: '',
				fullDescription: '',
				photos: [
					{
						id: 'p1',
						title: 'Airfield',
						src: '/p1.jpg',
						alt: 'airfield',
						addToSelectedPhotosCollection: true,
						selectedCollection: 'airfields',
					},
					{
						id: 'p2',
						title: 'Bridge',
						src: '/p2.jpg',
						alt: 'bridge',
						addToSelectedPhotosCollection: true,
						selectedCollection: 'bridges',
					},
				],
			},
			{
				slug: 'berwyn',
				name: 'Berwyn',
				coordinates: { longitude: -75.43, latitude: 40.04 },
				shortDescription: '',
				fullDescription: '',
				photos: [
					{
						id: 'p3',
						title: 'Railroad',
						src: '/p3.jpg',
						alt: 'railroad',
						addToSelectedPhotosCollection: true,
						selectedCollection: 'railroads',
					},
					{
						id: 'p4',
						title: 'Museum',
						src: '/p4.jpg',
						alt: 'museum',
						addToSelectedPhotosCollection: true,
						selectedCollection: 'philadelphia-art-museum',
					},
				],
			},
		]

		const coverflowPhotos = buildHomepageCoverflowPhotos(fixtureLocations)

		const collectionCounts = coverflowPhotos.reduce<Record<string, number>>(
			(acc, photo) => {
				if (!photo.selectedCollection) {
					return acc
				}
				acc[photo.selectedCollection] = (acc[photo.selectedCollection] ?? 0) + 1
				return acc
			},
			{},
		)

		for (const collection of SELECTED_PHOTO_COLLECTIONS) {
			expect(collectionCounts[collection.value] ?? 0).toBeGreaterThan(0)
		}
	})

	it('includes theme-tagged photos outside the default selected strip for filtering', () => {
		const coverflowPhotos = buildHomepageCoverflowPhotos([
			{
				slug: 'paoli',
				name: 'Paoli',
				coordinates: { longitude: -75.48, latitude: 40.04 },
				shortDescription: '',
				fullDescription: '',
				photos: [
					{
						id: 'p1',
						title: 'Default strip',
						src: '/p1.jpg',
						alt: 'default',
						addToSelectedPhotosCollection: true,
					},
					{
						id: 'p2',
						title: 'Airfield only',
						src: '/p2.jpg',
						alt: 'airfield-only',
						addToSelectedPhotosCollection: false,
						selectedCollection: 'airfields',
					},
				],
			},
		])

		expect(coverflowPhotos).toHaveLength(2)
		expect(
			coverflowPhotos.find((photo) => photo.alt === 'default')?.inDefaultSet,
		).toBe(true)
		expect(
			coverflowPhotos.find((photo) => photo.alt === 'airfield-only')
				?.inDefaultSet,
		).toBe(false)
		expect(
			coverflowPhotos.find((photo) => photo.alt === 'airfield-only')
				?.selectedCollection,
		).toBe('airfields')
	})

	it('retains unclassified selected photos for all-photos mode', () => {
		const coverflowPhotos = buildHomepageCoverflowPhotos([
				{
					slug: 'paoli',
					name: 'Paoli',
					coordinates: { longitude: -75.48, latitude: 40.04 },
					shortDescription: '',
					fullDescription: '',
					photos: [
						{
							id: 'p1',
							title: 'Selected but unclassified',
							src: '/p1.jpg',
							alt: 'plate',
							addToSelectedPhotosCollection: true,
						},
					],
				},
			],
		)

		expect(coverflowPhotos).toHaveLength(1)
		expect(coverflowPhotos[0]?.selectedCollection).toBeUndefined()
		expect(coverflowPhotos[0]?.inDefaultSet).toBe(true)
	})
})

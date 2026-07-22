import { describe, expect, it } from 'vitest'

import { mapSanityLocationToRecord } from '@/lib/sanity/map-location'

const imageBuilder = {
	image: () => ({
		width: () => ({
			auto: () => ({
				url: () => 'https://cdn.example.com/photo.jpg',
			}),
		}),
	}),
} as never

describe('mapSanityLocationToRecord photo ids', () => {
	it('prefers imageIdentifier over _key when present', () => {
		const record = mapSanityLocationToRecord(
			{
				name: 'Paoli',
				slug: 'paoli',
				photos: [
					{
						_key: 'sanity-key',
						imageIdentifier: 'EW04',
						addedAt: '2026-07-01T12:00:00.000Z',
						title: 'Overhead',
						alt: 'Paoli overhead',
						photo: {
							_type: 'image',
							asset: { _ref: 'image-abc', _type: 'reference' },
						},
					},
				],
			},
			{ imageWidth: 800, imageBuilder },
		)

		expect(record?.photos[0]?.id).toBe('EW04')
		expect(record?.photos[0]?.addedAt).toBe('2026-07-01T12:00:00.000Z')
	})

	it('falls back to _key when imageIdentifier is missing', () => {
		const record = mapSanityLocationToRecord(
			{
				name: 'Paoli',
				slug: 'paoli',
				photos: [
					{
						_key: 'sanity-key',
						title: 'Overhead',
						alt: 'Paoli overhead',
						photo: {
							_type: 'image',
							asset: { _ref: 'image-abc', _type: 'reference' },
						},
					},
				],
			},
			{ imageWidth: 800, imageBuilder },
		)

		expect(record?.photos[0]?.id).toBe('sanity-key')
		expect(record?.photos[0]?.addedAt).toBeUndefined()
	})
})

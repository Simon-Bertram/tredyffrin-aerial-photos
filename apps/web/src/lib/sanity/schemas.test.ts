import { describe, expect, it } from 'vitest'

import {
	normalizeSanityPhotoReferences,
	sanityLocationPhotoRawSchema,
} from '@/lib/sanity/schemas'

describe('normalizeSanityPhotoReferences', () => {
	it('passes through string arrays', () => {
		expect(normalizeSanityPhotoReferences(['Ref A', 'Ref B'])).toEqual([
			'Ref A',
			'Ref B',
		])
	})

	it('extracts text from portable-text blocks', () => {
		expect(
			normalizeSanityPhotoReferences([
				{
					_key: '909ab1acc9dd',
					_type: 'block',
					children: [
						{
							_key: 'b56a144a3879',
							_type: 'span',
							marks: [],
							text: 'Image database id: EW04',
						},
					],
					markDefs: [],
					style: 'normal',
				},
			]),
		).toEqual(['Image database id: EW04'])
	})

	it('validates photo rows with portable-text references', () => {
		const parsed = sanityLocationPhotoRawSchema.safeParse({
			_key: '242043eacce0',
			title: 'Test',
			photo: {
				_type: 'image',
				asset: { _ref: 'image-abc', _type: 'reference' },
			},
			references: [
				{
					_type: 'block',
					children: [{ _type: 'span', text: 'Image database id: EW04' }],
				},
			],
		})
		expect(parsed.success).toBe(true)
		if (parsed.success) {
			expect(parsed.data.references).toEqual(['Image database id: EW04'])
		}
	})
})

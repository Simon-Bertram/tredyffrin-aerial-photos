import { describe, expect, it } from 'vitest'

import {
	SELECTED_PHOTO_COLLECTIONS,
	getSelectedPhotoCollectionTitle,
	isSelectedPhotoCollectionValue,
} from '@/lib/selected-photo-collections'

describe('selected photo collections', () => {
	it('returns the collection title for a known value', () => {
		expect(getSelectedPhotoCollectionTitle('airfields')).toBe('Airfields')
	})

	it('returns undefined for unknown or missing values', () => {
		expect(getSelectedPhotoCollectionTitle('does-not-exist')).toBeUndefined()
		expect(getSelectedPhotoCollectionTitle()).toBeUndefined()
	})

	it('validates only configured collection values', () => {
		for (const collection of SELECTED_PHOTO_COLLECTIONS) {
			expect(isSelectedPhotoCollectionValue(collection.value)).toBe(true)
		}
		expect(isSelectedPhotoCollectionValue('')).toBe(false)
		expect(isSelectedPhotoCollectionValue('bridges%2Fetc')).toBe(false)
	})
})

/** Matches Sanity Studio `selectedPhotoCollections.ts`. */
export interface SelectedPhotoCollection {
	title: string
	value: string
}

export const SELECTED_PHOTO_COLLECTIONS: SelectedPhotoCollection[] = [
	{ title: 'Airfields', value: 'airfields' },
	{ title: 'Bridges', value: 'bridges' },
	{ title: 'Railroads', value: 'railroads' },
	{
		title: 'Philadelphia Art Museum',
		value: 'philadelphia-art-museum',
	},
]

export const SELECTED_PHOTO_COLLECTION_VALUES =
	SELECTED_PHOTO_COLLECTIONS.map((c) => c.value) as [
		string,
		...string[],
	]

export type SelectedPhotoCollectionValue =
	(typeof SELECTED_PHOTO_COLLECTION_VALUES)[number]

export function getSelectedPhotoCollectionTitle(
	value?: string,
): string | undefined {
	return SELECTED_PHOTO_COLLECTIONS.find(
		(collection) => collection.value === value,
	)?.title
}

export function isSelectedPhotoCollectionValue(
	value: string,
): value is SelectedPhotoCollectionValue {
	return SELECTED_PHOTO_COLLECTION_VALUES.includes(value)
}

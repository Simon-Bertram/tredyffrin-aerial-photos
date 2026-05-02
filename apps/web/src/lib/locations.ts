export interface LocationPhoto {
	id: string
	title: string
	src: string
	/** Narrow Sanity CDN URL for small previews (e.g. map tooltips). */
	previewSrc?: string
	alt: string
	caption?: string
	addToSelectedPhotosCollection?: boolean
	photographer?: string
	photoDate?: string
	direction?: string
	references?: string
	comments?: string
}

export interface PhotoMetadataItem {
	key: 'photographer' | 'photoDate' | 'direction' | 'references' | 'comments'
	label: string
	value: string
}

export function getPhotoMetadataItems(
	photo: LocationPhoto,
): PhotoMetadataItem[] {
	const metadataConfig: Array<
		Pick<PhotoMetadataItem, 'key' | 'label'> & { value: string | undefined }
	> = [
		{
			key: 'photographer',
			label: 'Photographer',
			value: photo.photographer,
		},
		{
			key: 'photoDate',
			label: 'Year',
			value: photo.photoDate,
		},
		{
			key: 'direction',
			label: 'Direction',
			value: photo.direction,
		},
		{
			key: 'references',
			label: 'References',
			value: photo.references,
		},
		{
			key: 'comments',
			label: 'Comments',
			value: photo.comments,
		},
	]

	return metadataConfig.flatMap((item) => {
		const value = item.value?.trim()
		if (!value) {
			return []
		}

		return [{ key: item.key, label: item.label, value }]
	})
}

export interface LocationRecord {
	slug: string
	name: string
	coordinates: {
		longitude: number
		latitude: number
	}
	shortDescription: string
	fullDescription: string
	photos: LocationPhoto[]
}

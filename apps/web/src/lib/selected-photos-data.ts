import type { MapLocationRecord } from '@/lib/locations'

export interface SelectedPhoto {
	key: string
	photoId: string
	plateNumber: number
	locationName: string
	locationSlug: string
	src: string
	alt: string
	photoDate?: string
	direction?: string
	selectedCollection?: string
}

/** Fields serialized to the coverflow client island (no full `locations` graph). */
export interface CoverflowIslandPhoto {
	src: string
	alt: string
	locationName: string
	locationSlug: string
	photoId: string
	photoDate?: string
	selectedCollection?: string
}

export function toCoverflowIslandPhotos(
	photos: SelectedPhoto[],
): CoverflowIslandPhoto[] {
	return photos.map((p) => ({
		src: p.src,
		alt: p.alt,
		locationName: p.locationName,
		locationSlug: p.locationSlug,
		photoId: p.photoId,
		photoDate: p.photoDate,
		selectedCollection: p.selectedCollection,
	}))
}

interface SelectedPhotoCandidate extends Omit<SelectedPhoto, 'plateNumber'> {
	isSelected: boolean
}

/**
 * Flattens location photo lists into a single ordered sequence for the strip.
 */
export function buildSelectedPhotos(
	locations: MapLocationRecord[],
): SelectedPhoto[] {
	const allPhotos: SelectedPhotoCandidate[] = []
	for (const location of locations) {
		for (const photo of location.photos) {
			allPhotos.push({
				key: `${location.slug}-${photo.id}`,
				photoId: photo.id,
				locationName: location.name,
				locationSlug: location.slug,
				src: photo.src,
				alt: photo.alt,
				photoDate: photo.photoDate,
				direction: photo.direction,
				selectedCollection: photo.selectedCollection,
				isSelected: photo.addToSelectedPhotosCollection === true,
			})
		}
	}

	const selected = allPhotos.filter((photo) => photo.isSelected)
	const photosToShow =
		selected.length > 0 ? selected : allPhotos.slice(-5)

	return photosToShow.map((photo, index) => ({
		key: photo.key,
		photoId: photo.photoId,
		plateNumber: index + 1,
		locationName: photo.locationName,
		locationSlug: photo.locationSlug,
		src: photo.src,
		alt: photo.alt,
		photoDate: photo.photoDate,
		direction: photo.direction,
		selectedCollection: photo.selectedCollection,
	}))
}

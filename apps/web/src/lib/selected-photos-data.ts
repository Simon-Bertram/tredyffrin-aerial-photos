import type { LocationRecord, MapLocationRecord } from '@/lib/locations'
import { isSelectedPhotoCollectionValue } from '@/lib/selected-photo-collections'

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
	inDefaultSet?: boolean
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
	/** When false, photo is only shown when a theme collection filter is active. */
	inDefaultSet?: boolean
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
		...(p.inDefaultSet !== undefined ? { inDefaultSet: p.inDefaultSet } : {}),
	}))
}

/**
 * Homepage coverflow payload: curated default strip plus theme-tagged photos
 * so the collection dropdown can filter without an empty slideshow.
 */
export function buildHomepageCoverflowPhotos(
	locations: MapLocationRecord[],
	themeTaggedLocations: LocationRecord[] = [],
): CoverflowIslandPhoto[] {
	const defaultPhotos = buildSelectedPhotos(locations)
	const defaultKeys = new Set(defaultPhotos.map((photo) => photo.key))

	const defaultIslandPhotos = toCoverflowIslandPhotos(
		defaultPhotos.map((photo) => ({ ...photo, inDefaultSet: true })),
	)

	const themeTaggedExtras: CoverflowIslandPhoto[] = []
	const seenExtraKeys = new Set<string>()
	for (const location of [...locations, ...themeTaggedLocations]) {
		for (const photo of location.photos) {
			const key = `${location.slug}-${photo.id}`
			if (defaultKeys.has(key) || seenExtraKeys.has(key)) {
				continue
			}
			const collection = photo.selectedCollection
			if (!collection || !isSelectedPhotoCollectionValue(collection)) {
				continue
			}

			seenExtraKeys.add(key)
			themeTaggedExtras.push({
				src: photo.src,
				alt: photo.alt,
				locationName: location.name,
				locationSlug: location.slug,
				photoId: photo.id,
				photoDate: photo.photoDate,
				selectedCollection: collection,
				inDefaultSet: false,
			})
		}
	}

	return [...defaultIslandPhotos, ...themeTaggedExtras]
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

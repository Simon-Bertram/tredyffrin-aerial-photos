import type { LocationRecord } from '@/lib/locations'

export interface SelectedPhoto {
	key: string
	plateNumber: number
	locationName: string
	locationSlug: string
	src: string
	alt: string
	photoDate?: string
	direction?: string
}

/**
 * Flattens location photo lists into a single ordered sequence for the strip.
 */
export function buildSelectedPhotos(
	locations: LocationRecord[],
): SelectedPhoto[] {
	const photos: SelectedPhoto[] = []
	let plateNumber = 0
	for (const location of locations) {
		for (const photo of location.photos) {
			plateNumber += 1
			photos.push({
				key: `${location.slug}-${photo.id}`,
				plateNumber,
				locationName: location.name,
				locationSlug: location.slug,
				src: photo.src,
				alt: photo.alt,
				photoDate: photo.photoDate,
				direction: photo.direction,
			})
		}
	}
	return photos
}

import type { ImageUrlBuilder } from '@sanity/image-url'

import type { LocationPhoto, LocationRecord } from '@/lib/locations'
import { buildImageUrl } from '@/lib/sanity/image'
import {
	sanityImageForUrlSchema,
	sanityLocationPhotoRawSchema,
	sanityLocationRawSchema,
} from '@/lib/sanity/schemas'

export interface MapLocationOptions {
	imageWidth: number
	imageBuilder: ImageUrlBuilder
	onPhotoSkipped?: (reason: string, detail?: unknown) => void
}

function emptyToUndefined(s: string | null | undefined): string | undefined {
	if (s == null || s === '') {
		return undefined
	}
	return s
}

function referencesToUndefined(
	references: string[] | null | undefined,
): string | undefined {
	if (references == null || references.length === 0) {
		return undefined
	}
	const value = references.join(', ').trim()
	return value === '' ? undefined : value
}

function formatPhotoDate(
	year: number | null | undefined,
): string | undefined {
	if (year == null || Number.isNaN(year)) {
		return undefined
	}
	return String(year)
}

/**
 * Maps one validated location + built image URLs into `LocationRecord`.
 */
export function mapSanityLocationToRecord(
	raw: unknown,
	options: MapLocationOptions,
): LocationRecord | undefined {
	const parsed = sanityLocationRawSchema.safeParse(raw)
	if (!parsed.success) {
		options.onPhotoSkipped?.('location validation failed', parsed.error.issues)
		return undefined
	}

	const doc = parsed.data
	const photos: LocationPhoto[] = []
	const photoRows = doc.photos ?? []

	for (let i = 0; i < photoRows.length; i += 1) {
		const row = photoRows[i]
		const photoParsed = sanityLocationPhotoRawSchema.safeParse(row)
		if (!photoParsed.success) {
			options.onPhotoSkipped?.(
				`photo[${i}] validation failed`,
				photoParsed.error.issues,
			)
			continue
		}

		const p = photoParsed.data
		const imgParsed = sanityImageForUrlSchema.safeParse(p.photo)
		if (!imgParsed.success) {
			options.onPhotoSkipped?.(
				`photo[${i}] image invalid`,
				imgParsed.error.issues,
			)
			continue
		}

		const src = buildImageUrl(
			options.imageBuilder,
			imgParsed.data,
			options.imageWidth,
		)
		if (!src) {
			options.onPhotoSkipped?.(`photo[${i}] could not build URL`)
			continue
		}

		const id =
			p._key && p._key.length > 0 ? p._key : `${doc.slug}-photo-${i}`

		photos.push({
			id,
			title: p.title ?? '',
			src,
			alt: p.alt ?? '',
			caption: emptyToUndefined(p.caption),
			addToSelectedPhotosCollection:
				p.addToSelectedPhotosCollection === true,
			photographer: emptyToUndefined(p.photographer),
			photoDate: formatPhotoDate(p.photoDate ?? undefined),
			direction: emptyToUndefined(p.direction),
			references: referencesToUndefined(p.references),
			comments: emptyToUndefined(p.comments),
		})
	}

	return {
		slug: doc.slug,
		name: doc.name,
		coordinates: {
			longitude: doc.coordinates.lng,
			latitude: doc.coordinates.lat,
		},
		shortDescription: doc.shortDescription ?? '',
		fullDescription: doc.fullDescription ?? '',
		photos,
	}
}

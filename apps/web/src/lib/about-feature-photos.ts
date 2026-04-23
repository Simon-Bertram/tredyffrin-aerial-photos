import type { ImageUrlBuilder } from '@sanity/image-url'

import { buildImageUrl } from '@/lib/sanity/image'
import {
	sanityImageForUrlSchema,
	sanityLocationAboutFeatureRawSchema,
	sanityLocationPhotoRawSchema,
} from '@/lib/sanity/schemas'

export interface AboutFeaturePhoto {
	src: string
	alt: string
	slug: string
	locationName: string
	photoDate?: string
}

export interface AboutFeatureLocationPreview {
	slug: string
	name: string
	photos: Array<{ src: string; alt: string; photoDate?: string }>
}

export interface MapAboutFeatureRowsOptions {
	imageWidth: number
	imageBuilder: ImageUrlBuilder
	onPhotoSkipped?: (
		slug: string,
		reason: string,
		detail?: unknown,
	) => void
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
 * Spreads picks across the flattened catalog order (same algorithm as the
 * former inline helper on the about page).
 */
export function pickFeaturePhotos(
	locations: AboutFeatureLocationPreview[],
	max: number,
): AboutFeaturePhoto[] {
	const flat: AboutFeaturePhoto[] = []
	for (const loc of locations) {
		for (const photo of loc.photos) {
			flat.push({
				src: photo.src,
				alt: photo.alt,
				slug: loc.slug,
				locationName: loc.name,
				photoDate: photo.photoDate,
			})
		}
	}
	if (flat.length === 0) return []
	if (flat.length <= max) return flat

	const picks: AboutFeaturePhoto[] = []
	const usedSrc = new Set<string>()
	for (let i = 0; i < max; i += 1) {
		const t = max === 1 ? 0 : i / (max - 1)
		const idx = Math.min(flat.length - 1, Math.round(t * (flat.length - 1)))
		const candidate = flat[idx]
		if (!usedSrc.has(candidate.src)) {
			usedSrc.add(candidate.src)
			picks.push(candidate)
		}
	}
	for (const p of flat) {
		if (picks.length >= max) break
		if (!usedSrc.has(p.src)) {
			usedSrc.add(p.src)
			picks.push(p)
		}
	}
	return picks
}

export function mapSanityRowsToAboutFeatureLocations(
	rows: unknown[],
	options: MapAboutFeatureRowsOptions,
): AboutFeatureLocationPreview[] {
	const out: AboutFeatureLocationPreview[] = []

	for (const row of rows) {
		const parsed = sanityLocationAboutFeatureRawSchema.safeParse(row)
		if (!parsed.success) {
			options.onPhotoSkipped?.(
				'unknown',
				'location validation failed',
				parsed.error.issues,
			)
			continue
		}

		const doc = parsed.data
		const slug = doc.slug
		const photos: Array<{ src: string; alt: string; photoDate?: string }> =
			[]
		const photoRows = doc.photos ?? []

		for (let i = 0; i < photoRows.length; i += 1) {
			const photoRow = photoRows[i]
			const photoParsed = sanityLocationPhotoRawSchema.safeParse(photoRow)
			if (!photoParsed.success) {
				options.onPhotoSkipped?.(
					slug,
					`photo[${i}] validation failed`,
					photoParsed.error.issues,
				)
				continue
			}

			const p = photoParsed.data
			if (p.photo == null) {
				continue
			}
			const imgParsed = sanityImageForUrlSchema.safeParse(p.photo)
			if (!imgParsed.success) {
				options.onPhotoSkipped?.(
					slug,
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
				options.onPhotoSkipped?.(slug, `photo[${i}] could not build URL`)
				continue
			}

			photos.push({
				src,
				alt: p.alt ?? '',
				photoDate: formatPhotoDate(p.photoDate ?? undefined),
			})
		}

		if (photos.length > 0) {
			out.push({ slug, name: doc.name, photos })
		}
	}

	return out
}

import { sanityLocationNavRawSchema } from '@/lib/sanity/schemas'
import type { SanityRepositoryQueryKind } from '@/lib/sanity/repository-telemetry'
import { emitSanityRepositoryUnexpectedShape } from '@/lib/sanity/repository-telemetry'

export function getRowSlug(row: unknown): string {
	if (typeof row === 'object' && row !== null && 'slug' in row) {
		return String((row as { slug?: string }).slug ?? 'unknown')
	}
	return 'unknown'
}

export function requireSanityRows(
	rows: unknown,
	context: string,
	queryKind: SanityRepositoryQueryKind,
): unknown[] | null {
	if (!Array.isArray(rows)) {
		emitSanityRepositoryUnexpectedShape(
			context,
			queryKind,
			'expected array',
			rows,
		)
		return null
	}
	return rows
}

export interface PlaceLinkFields {
	name: string
	slug: string
	photoCount: number
}

export function parsePlaceLinkRow(row: unknown): PlaceLinkFields | null {
	if (typeof row !== 'object' || row === null) {
		return null
	}
	const name =
		'name' in row && typeof row.name === 'string' ? row.name.trim() : ''
	const slug =
		'slug' in row && typeof row.slug === 'string' ? row.slug.trim() : ''
	if (name === '' || slug === '') {
		return null
	}
	const photoCount =
		'photoCount' in row &&
		typeof row.photoCount === 'number' &&
		Number.isFinite(row.photoCount)
			? row.photoCount
			: 0
	return { name, slug, photoCount }
}

export interface GalleryNavPlaceFields {
	name: string
	slug: string
	placeCollection?: string
}

export function parseGalleryNavRow(row: unknown): GalleryNavPlaceFields | null {
	const parsed = sanityLocationNavRawSchema.safeParse(row)
	if (!parsed.success) {
		return null
	}

	const name = parsed.data.name.trim()
	const slug = parsed.data.slug.trim()
	if (name === '' || slug === '') {
		return null
	}

	const placeCollection = parsed.data.placeCollection?.trim()
	return {
		name,
		slug,
		...(placeCollection ? { placeCollection } : {}),
	}
}

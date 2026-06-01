import {
	PUBLIC_SANITY_DATASET,
	PUBLIC_SANITY_PROJECT_ID,
} from 'astro:env/server'

import {
	mapSanityRowsToAboutFeatureLocations,
	pickFeaturePhotos,
	type AboutFeaturePhoto,
} from '@/lib/about-feature-photos'
import type { LocationRecord, MapLocationRecord } from '@/lib/locations'
import { getSanityClient } from '@/lib/sanity/client'
import { createSanityImageBuilder } from '@/lib/sanity/image'
import { mapSanityLocationToRecord } from '@/lib/sanity/map-location'
import { TREDYFFRIN_EASTTOWN_VALUE } from '@/lib/place-collections'
import {
	locationBySlugQuery,
	locationSlugsQuery,
	locationsForAboutFeatureQuery,
	locationsForMapQuery,
	otherLocationPlacesQuery,
} from '@/lib/sanity/queries'

export interface OtherLocationPlaceLink {
	name: string
	href: string
}

const MAP_IMAGE_WIDTH = 1200
/** Map marker tooltip previews (`h-60`); primary `src` stays `MAP_IMAGE_WIDTH`. */
const MAP_PREVIEW_IMAGE_WIDTH = 800
const ABOUT_FEATURE_IMAGE_WIDTH = 1200
const DETAIL_IMAGE_WIDTH = 1600

function logSkip(
	context: string,
	slugOrId: string,
	reason: string,
	detail?: unknown,
) {
	console.warn(`[sanity:${context}] ${slugOrId}: ${reason}`, detail ?? '')
}

export async function fetchLocationsForMap(): Promise<MapLocationRecord[]> {
	const client = getSanityClient()
	const imageBuilder = createSanityImageBuilder(
		PUBLIC_SANITY_PROJECT_ID,
		PUBLIC_SANITY_DATASET,
	)
	const rows = await client.fetch<unknown[]>(locationsForMapQuery)
	if (!Array.isArray(rows)) {
		console.warn('[sanity:fetchLocationsForMap] expected array', rows)
		return []
	}

	const out: MapLocationRecord[] = []
	for (const row of rows) {
		const slug =
			typeof row === 'object' && row !== null && 'slug' in row
				? String((row as { slug?: string }).slug ?? 'unknown')
				: 'unknown'

		const mapped = mapSanityLocationToRecord(row, {
			imageWidth: MAP_IMAGE_WIDTH,
			previewImageWidth: MAP_PREVIEW_IMAGE_WIDTH,
			imageBuilder,
			onPhotoSkipped: (reason, detail) => {
				logSkip('fetchLocationsForMap', slug, reason, detail)
			},
		})
		if (!mapped) {
			logSkip(
				'fetchLocationsForMap',
				slug,
				'location skipped after validation',
			)
			continue
		}
		if (!mapped.coordinates) {
			logSkip('fetchLocationsForMap', slug, 'missing coordinates')
			continue
		}
		out.push(mapped as MapLocationRecord)
	}
	return out
}

export async function fetchAboutPageFeaturePhotos(
	max: number,
): Promise<AboutFeaturePhoto[]> {
	const client = getSanityClient()
	const imageBuilder = createSanityImageBuilder(
		PUBLIC_SANITY_PROJECT_ID,
		PUBLIC_SANITY_DATASET,
	)
	const rows = await client.fetch<unknown[]>(locationsForAboutFeatureQuery)
	if (!Array.isArray(rows)) {
		console.warn('[sanity:fetchAboutPageFeaturePhotos] expected array', rows)
		return []
	}

	const locations = mapSanityRowsToAboutFeatureLocations(rows, {
		imageWidth: ABOUT_FEATURE_IMAGE_WIDTH,
		imageBuilder,
		onPhotoSkipped: (slug, reason, detail) => {
			logSkip('fetchAboutPageFeaturePhotos', slug, reason, detail)
		},
	})

	return pickFeaturePhotos(locations, max)
}

export async function fetchPublishedLocationSlugs(): Promise<string[]> {
	const client = getSanityClient()
	const rows = await client.fetch<unknown>(locationSlugsQuery)
	if (!Array.isArray(rows)) {
		console.warn('[sanity:fetchPublishedLocationSlugs] expected array', rows)
		return []
	}
	const out: string[] = []
	for (const row of rows) {
		if (
			typeof row === 'object' &&
			row !== null &&
			'slug' in row &&
			typeof (row as { slug?: unknown }).slug === 'string'
		) {
			out.push((row as { slug: string }).slug)
		}
	}
	return out
}

export async function fetchOtherLocationPlaces(
	excludeSlug?: string,
): Promise<OtherLocationPlaceLink[]> {
	const client = getSanityClient()
	const rows = await client.fetch<unknown[]>(otherLocationPlacesQuery, {
		tredyffrinEasttown: TREDYFFRIN_EASTTOWN_VALUE,
	})
	if (!Array.isArray(rows)) {
		console.warn('[sanity:fetchOtherLocationPlaces] expected array', rows)
		return []
	}

	const out: OtherLocationPlaceLink[] = []
	for (const row of rows) {
		if (typeof row !== 'object' || row === null) {
			continue
		}
		const name =
			'name' in row && typeof row.name === 'string' ? row.name.trim() : ''
		const slug =
			'slug' in row && typeof row.slug === 'string' ? row.slug.trim() : ''
		if (name === '' || slug === '') {
			logSkip('fetchOtherLocationPlaces', slug || 'unknown', 'missing name or slug')
			continue
		}
		if (excludeSlug != null && slug === excludeSlug) {
			continue
		}
		out.push({ name, href: `/locations/${slug}` })
	}
	return out
}

export async function getSanityLocationRecordBySlug(
	slug: string,
): Promise<LocationRecord | undefined> {
	const client = getSanityClient()
	const imageBuilder = createSanityImageBuilder(
		PUBLIC_SANITY_PROJECT_ID,
		PUBLIC_SANITY_DATASET,
	)
	const row = await client.fetch<unknown | null>(locationBySlugQuery, {
		slug,
	})
	if (row == null) {
		return undefined
	}
	return mapSanityLocationToRecord(row, {
		imageWidth: DETAIL_IMAGE_WIDTH,
		imageBuilder,
		onPhotoSkipped: (reason, detail) => {
			logSkip('getSanityLocationRecordBySlug', slug, reason, detail)
		},
	})
}

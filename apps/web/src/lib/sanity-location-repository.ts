import {
	PUBLIC_SANITY_DATASET,
	PUBLIC_SANITY_PROJECT_ID,
} from 'astro:env/server'

import {
	mapSanityRowsToAboutFeatureLocations,
	pickFeaturePhotos,
	type AboutFeaturePhoto,
} from '@/lib/about-feature-photos'
import type { LocationRecord } from '@/lib/locations'
import { getSanityClient } from '@/lib/sanity/client'
import { createSanityImageBuilder } from '@/lib/sanity/image'
import { mapSanityLocationToRecord } from '@/lib/sanity/map-location'
import {
	locationBySlugQuery,
	locationSlugsQuery,
	locationsForAboutFeatureQuery,
	locationsForMapQuery,
} from '@/lib/sanity/queries'

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

export async function fetchLocationsForMap(): Promise<LocationRecord[]> {
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

	const out: LocationRecord[] = []
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
		out.push(mapped)
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

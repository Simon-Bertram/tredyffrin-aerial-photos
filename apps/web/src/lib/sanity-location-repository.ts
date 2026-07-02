import {
	mapSanityRowsToAboutFeatureLocations,
	pickFeaturePhotos,
	type AboutFeaturePhoto,
} from '@/lib/about-feature-photos'
import {
	e2eFixtureLocationBySlug,
	e2eFixtureGalleryNavItems,
	e2eFixtureLocationsForMap,
	e2eFixtureOtherLocationPlaces,
	e2eFixturePublishedLocationSlugs,
	e2eFixtureThemeCollectionCounts,
	e2eFixtureThemePhotos,
	e2eFixtureThemeTaggedLocations,
	isE2eFixturesEnabled,
} from '@/lib/e2e-fixtures'
import type {
	GalleryNavGroup,
	GalleryNavItem,
	LocationPhoto,
	LocationRecord,
	MapLocationRecord,
} from '@/lib/locations'
import { getSanityRepositoryContext } from '@/lib/sanity/repository-context'
import {
	getRowSlug,
	parseGalleryNavRow,
	parsePlaceLinkRow,
	requireSanityRows,
} from '@/lib/sanity/repository-row-guards'
import {
	emitSanityRepositorySkip,
	resetSanityRepositoryTelemetryEmitter,
	setSanityRepositoryTelemetryEmitter,
	type SanityRepositoryQueryKind,
	type SanityRepositoryTelemetryEmitter,
	type SanityRepositoryTelemetryEvent,
} from '@/lib/sanity/repository-telemetry'
import { mapSanityLocationToRecord } from '@/lib/sanity/map-location'
import { TREDYFFRIN_EASTTOWN_VALUE } from '@/lib/place-collections'
import {
	SELECTED_PHOTO_COLLECTIONS,
	type SelectedPhotoCollectionValue,
} from '@/lib/selected-photo-collections'
import {
	locationBySlugQuery,
	locationNavOptionsQuery,
	locationSlugsQuery,
	locationsForAboutFeatureQuery,
	locationsForMapQuery,
	locationsWithThemeTaggedPhotosQuery,
	otherLocationPlacesQuery,
	themeCollectionPhotoCountsQuery,
	themeLocationsWithPhotosQuery,
	themePlacesQuery,
} from '@/lib/sanity/queries'

export type {
	SanityRepositoryQueryKind,
	SanityRepositoryTelemetryEmitter,
	SanityRepositoryTelemetryEvent,
}

export {
	resetSanityRepositoryTelemetryEmitter,
	setSanityRepositoryTelemetryEmitter,
}

export interface OtherLocationPlaceLink {
	name: string
	href: string
	photoCount: number
}

export type ThemePlaceLink = OtherLocationPlaceLink

export interface ThemeCollectionLink {
	title: string
	href: string
	photoCount: number
}

export type ThemeCollectionPhotoCounts = Record<
	SelectedPhotoCollectionValue,
	number
>

export interface GalleryNavPlaceItem {
	name: string
	slug: string
	placeCollection?: string
}

const MAP_IMAGE_WIDTH = 1200
/** Map marker tooltip previews (`h-60`); primary `src` stays `MAP_IMAGE_WIDTH`. */
const MAP_PREVIEW_IMAGE_WIDTH = 800
const ABOUT_FEATURE_IMAGE_WIDTH = 1200
const DETAIL_IMAGE_WIDTH = 1600

export async function fetchLocationsForMap(): Promise<MapLocationRecord[]> {
	if (isE2eFixturesEnabled()) {
		return e2eFixtureLocationsForMap
	}

	const { client, imageBuilder } = getSanityRepositoryContext()
	const rows = await client.fetch<unknown[]>(locationsForMapQuery)
	const safeRows = requireSanityRows(
		rows,
		'fetchLocationsForMap',
		'locationsForMap',
	)
	if (safeRows == null) {
		return []
	}

	const out: MapLocationRecord[] = []
	for (const row of safeRows) {
		const slug = getRowSlug(row)

		const mapped = mapSanityLocationToRecord(row, {
			imageWidth: MAP_IMAGE_WIDTH,
			previewImageWidth: MAP_PREVIEW_IMAGE_WIDTH,
			imageBuilder,
			onPhotoSkipped: (reason, detail) => {
				emitSanityRepositorySkip(
					'fetchLocationsForMap',
					'locationsForMap',
					slug,
					reason,
					detail,
				)
			},
		})
		if (!mapped) {
			emitSanityRepositorySkip(
				'fetchLocationsForMap',
				'locationsForMap',
				slug,
				'location skipped after validation',
			)
			continue
		}
		if (!mapped.coordinates) {
			emitSanityRepositorySkip(
				'fetchLocationsForMap',
				'locationsForMap',
				slug,
				'missing coordinates',
			)
			continue
		}
		out.push(mapped as MapLocationRecord)
	}
	return out
}

export async function fetchLocationsWithThemeTaggedPhotos(): Promise<
	LocationRecord[]
> {
	if (isE2eFixturesEnabled()) {
		return e2eFixtureThemeTaggedLocations
	}

	const { client, imageBuilder } = getSanityRepositoryContext()
	const rows = await client.fetch<unknown[]>(locationsWithThemeTaggedPhotosQuery)
	const safeRows = requireSanityRows(
		rows,
		'fetchLocationsWithThemeTaggedPhotos',
		'locationsWithThemeTaggedPhotos',
	)
	if (safeRows == null) {
		return []
	}

	const out: LocationRecord[] = []
	for (const row of safeRows) {
		const slug = getRowSlug(row)
		const mapped = mapSanityLocationToRecord(row, {
			imageWidth: MAP_IMAGE_WIDTH,
			imageBuilder,
			onPhotoSkipped: (reason, detail) => {
				emitSanityRepositorySkip(
					'fetchLocationsWithThemeTaggedPhotos',
					'locationsWithThemeTaggedPhotos',
					slug,
					reason,
					detail,
				)
			},
		})
		if (!mapped) {
			emitSanityRepositorySkip(
				'fetchLocationsWithThemeTaggedPhotos',
				'locationsWithThemeTaggedPhotos',
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
	if (isE2eFixturesEnabled()) {
		const locations = e2eFixtureLocationsForMap.map((location) => ({
			slug: location.slug,
			name: location.name,
			photos: location.photos.map((photo) => ({
				src: photo.src,
				alt: photo.alt,
				photoDate: photo.photoDate,
			})),
		}))
		return pickFeaturePhotos(locations, max)
	}

	const { client, imageBuilder } = getSanityRepositoryContext()
	const rows = await client.fetch<unknown[]>(locationsForAboutFeatureQuery)
	const safeRows = requireSanityRows(
		rows,
		'fetchAboutPageFeaturePhotos',
		'locationsForAboutFeature',
	)
	if (safeRows == null) {
		return []
	}

	const locations = mapSanityRowsToAboutFeatureLocations(safeRows, {
		imageWidth: ABOUT_FEATURE_IMAGE_WIDTH,
		imageBuilder,
		onPhotoSkipped: (slug, reason, detail) => {
			emitSanityRepositorySkip(
				'fetchAboutPageFeaturePhotos',
				'locationsForAboutFeature',
				slug,
				reason,
				detail,
			)
		},
	})

	return pickFeaturePhotos(locations, max)
}

export async function fetchPublishedLocationSlugs(): Promise<string[]> {
	if (isE2eFixturesEnabled()) {
		return e2eFixturePublishedLocationSlugs
	}

	const { client } = getSanityRepositoryContext()
	const rows = await client.fetch<unknown>(locationSlugsQuery)
	const safeRows = requireSanityRows(
		rows,
		'fetchPublishedLocationSlugs',
		'locationSlugs',
	)
	if (safeRows == null) {
		return []
	}

	const out: string[] = []
	for (const row of safeRows) {
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
	if (isE2eFixturesEnabled()) {
		return e2eFixtureOtherLocationPlaces.filter(
			(place) => excludeSlug == null || !place.href.endsWith(`/${excludeSlug}`),
		)
	}

	const { client } = getSanityRepositoryContext()
	const rows = await client.fetch<unknown[]>(otherLocationPlacesQuery, {
		tredyffrinEasttown: TREDYFFRIN_EASTTOWN_VALUE,
	})
	const safeRows = requireSanityRows(
		rows,
		'fetchOtherLocationPlaces',
		'otherLocationPlaces',
	)
	if (safeRows == null) {
		return []
	}

	const out: OtherLocationPlaceLink[] = []
	for (const row of safeRows) {
		const parsed = parsePlaceLinkRow(row)
		if (parsed == null) {
			const slug = getRowSlug(row)
			emitSanityRepositorySkip(
				'fetchOtherLocationPlaces',
				'otherLocationPlaces',
				slug,
				'missing name or slug',
			)
			continue
		}
		if (excludeSlug != null && parsed.slug === excludeSlug) {
			continue
		}
		out.push({
			name: parsed.name,
			href: `/locations/${parsed.slug}`,
			photoCount: parsed.photoCount,
		})
	}
	return out
}

export async function fetchGalleryNavItems(): Promise<GalleryNavPlaceItem[]> {
	if (isE2eFixturesEnabled()) {
		return e2eFixtureGalleryNavItems
	}

	const { client } = getSanityRepositoryContext()
	const rows = await client.fetch<unknown[]>(locationNavOptionsQuery)
	const safeRows = requireSanityRows(
		rows,
		'fetchGalleryNavItems',
		'locationNavOptions',
	)
	if (safeRows == null) {
		return []
	}

	const out: GalleryNavPlaceItem[] = []
	for (const row of safeRows) {
		const parsed = parseGalleryNavRow(row)
		if (parsed == null) {
			emitSanityRepositorySkip(
				'fetchGalleryNavItems',
				'locationNavOptions',
				getRowSlug(row),
				'missing name or slug',
			)
			continue
		}
		out.push(parsed)
	}
	return out
}

function toLocationNavItem(item: GalleryNavPlaceItem): GalleryNavItem {
	return {
		name: item.name,
		href: `/locations/${item.slug}`,
	}
}

export function buildGalleryNavGroups(
	items: GalleryNavPlaceItem[],
	themeCounts: ThemeCollectionPhotoCounts,
): GalleryNavGroup[] {
	const tredyffrin = items.filter(
		(item) => item.placeCollection === TREDYFFRIN_EASTTOWN_VALUE,
	)
	const other = items.filter(
		(item) => item.placeCollection !== TREDYFFRIN_EASTTOWN_VALUE,
	)

	const groups: GalleryNavGroup[] = []

	if (tredyffrin.length > 0) {
		groups.push({
			label: 'Tredyffrin Easttown',
			items: tredyffrin.map(toLocationNavItem),
		})
	}

	if (other.length > 0) {
		groups.push({
			label: 'Other Locations',
			items: other.map(toLocationNavItem),
		})
	}

	const themeLinks = buildThemeCollectionLinks(themeCounts)
	if (themeLinks.length > 0) {
		groups.push({
			label: 'Themed Collections',
			items: themeLinks.map((theme) => ({
				name: `${theme.title} (${theme.photoCount})`,
				href: theme.href,
			})),
		})
	}

	return groups
}

function mapThemePlaceRows(
	rows: unknown[],
	collection: string,
): ThemePlaceLink[] {
	const out: ThemePlaceLink[] = []
	for (const row of rows) {
		const parsed = parsePlaceLinkRow(row)
		if (parsed == null) {
			emitSanityRepositorySkip(
				'mapThemePlaceRows',
				'themePlaces',
				getRowSlug(row),
				'missing name or slug',
			)
			continue
		}
		out.push({
			name: parsed.name,
			href: `/locations/${parsed.slug}?collection=${encodeURIComponent(collection)}`,
			photoCount: parsed.photoCount,
		})
	}
	return out
}

export async function fetchThemePlaces(
	collection: string,
): Promise<ThemePlaceLink[]> {
	const { client } = getSanityRepositoryContext()
	const rows = await client.fetch<unknown[]>(themePlacesQuery, {
		collection,
	})
	const safeRows = requireSanityRows(rows, 'fetchThemePlaces', 'themePlaces')
	if (safeRows == null) {
		return []
	}
	return mapThemePlaceRows(safeRows, collection)
}

export async function fetchThemePhotos(
	collection: string,
): Promise<LocationPhoto[]> {
	if (isE2eFixturesEnabled()) {
		return e2eFixtureThemePhotos[collection] ?? []
	}

	const { client, imageBuilder } = getSanityRepositoryContext()
	const rows = await client.fetch<unknown[]>(themeLocationsWithPhotosQuery, {
		collection,
	})
	const safeRows = requireSanityRows(
		rows,
		'fetchThemePhotos',
		'themeLocationsWithPhotos',
	)
	if (safeRows == null) {
		return []
	}

	const photos: LocationPhoto[] = []
	for (const row of safeRows) {
		const slug = getRowSlug(row)

		const mapped = mapSanityLocationToRecord(row, {
			imageWidth: DETAIL_IMAGE_WIDTH,
			imageBuilder,
			onPhotoSkipped: (reason, detail) => {
				emitSanityRepositorySkip(
					'fetchThemePhotos',
					'themeLocationsWithPhotos',
					slug,
					reason,
					detail,
				)
			},
		})
		if (!mapped) {
			emitSanityRepositorySkip(
				'fetchThemePhotos',
				'themeLocationsWithPhotos',
				slug,
				'location skipped after validation',
			)
			continue
		}
		photos.push(...mapped.photos)
	}
	return photos
}

export async function fetchThemeCollectionPhotoCounts(): Promise<ThemeCollectionPhotoCounts> {
	if (isE2eFixturesEnabled()) {
		return e2eFixtureThemeCollectionCounts
	}

	const { client } = getSanityRepositoryContext()
	const row = await client.fetch<unknown>(themeCollectionPhotoCountsQuery)
	const counts = {} as ThemeCollectionPhotoCounts
	for (const { value } of SELECTED_PHOTO_COLLECTIONS) {
		const n =
			typeof row === 'object' &&
			row !== null &&
			value in row &&
			typeof (row as Record<string, unknown>)[value] === 'number' &&
			Number.isFinite((row as Record<string, number>)[value])
				? (row as Record<string, number>)[value]
				: 0
		counts[value as SelectedPhotoCollectionValue] = n
	}
	return counts
}

export function buildThemeCollectionLinks(
	counts: ThemeCollectionPhotoCounts,
): ThemeCollectionLink[] {
	return SELECTED_PHOTO_COLLECTIONS.map(({ title, value }) => ({
		title,
		href: `/themes/${value}`,
		photoCount: counts[value],
	}))
}

export async function getSanityLocationRecordBySlug(
	slug: string,
): Promise<LocationRecord | undefined> {
	if (isE2eFixturesEnabled()) {
		return e2eFixtureLocationBySlug[slug]
	}

	const { client, imageBuilder } = getSanityRepositoryContext()
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
			emitSanityRepositorySkip(
				'getSanityLocationRecordBySlug',
				'locationBySlug',
				slug,
				reason,
				detail,
			)
		},
	})
}

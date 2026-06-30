import type {
	LocationPhoto,
	LocationRecord,
	MapLocationRecord,
} from '@/lib/locations'
import type {
	GalleryNavPlaceItem,
	OtherLocationPlaceLink,
	ThemeCollectionPhotoCounts,
} from '@/lib/sanity-location-repository'
import type { SelectedPhotoCollectionValue } from '@/lib/selected-photo-collections'
import { TREDYFFRIN_EASTTOWN_VALUE } from '@/lib/place-collections'
import { SANITY_E2E_FIXTURES } from 'astro:env/server'

import { E2E_TEST_LOCATION_SLUG } from '@/lib/e2e-constants'

const FIXTURE_IMAGE =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="#dcc0be" width="800" height="600"/></svg>',
	)

export function isE2eFixturesEnabled(): boolean {
	return SANITY_E2E_FIXTURES === '1'
}

const e2eMapLocation: MapLocationRecord = {
	slug: E2E_TEST_LOCATION_SLUG,
	name: 'E2E Test Location',
	coordinates: { longitude: -75.483168, latitude: 40.0402 },
	shortDescription: 'Fixture location for automated tests.',
	fullDescription: 'Full description for E2E test location.',
	photos: [
		{
			id: 'e2e-photo-default',
			title: 'Default View',
			src: FIXTURE_IMAGE,
			previewSrc: FIXTURE_IMAGE,
			alt: 'E2E default photo',
			addToSelectedPhotosCollection: true,
			photoDate: '1970',
		},
	],
}

const e2eAirfieldLocation: MapLocationRecord = {
	slug: 'e2e-airfield-site',
	name: 'E2E Airfield Site',
	coordinates: { longitude: -75.49, latitude: 40.05 },
	shortDescription: 'Airfield fixture for collection filter tests.',
	fullDescription: 'Airfield fixture location.',
	photos: [
		{
			id: 'e2e-photo-airfields',
			title: 'Airfield View',
			src: FIXTURE_IMAGE,
			previewSrc: FIXTURE_IMAGE,
			alt: 'E2E airfields photo',
			selectedCollection: 'airfields',
			photoDate: '1971',
		},
	],
}

export const e2eFixtureLocationsForMap: MapLocationRecord[] = [
	e2eMapLocation,
	e2eAirfieldLocation,
]

export const e2eFixtureThemeTaggedLocations: LocationRecord[] = [
	e2eAirfieldLocation,
]

export const e2eFixtureLocationBySlug: Record<string, LocationRecord> = {
	[E2E_TEST_LOCATION_SLUG]: e2eMapLocation,
}

export const e2eFixtureThemePhotos: Record<string, LocationPhoto[]> = {
	airfields: [
		{
			id: 'e2e-theme-airfields-photo',
			title: 'Airfields Theme Photo',
			src: FIXTURE_IMAGE,
			alt: 'E2E airfields theme photo',
			selectedCollection: 'airfields',
			photoDate: '1972',
		},
	],
}

export const e2eFixtureThemeCollectionCounts: ThemeCollectionPhotoCounts = {
	airfields: 1,
	bridges: 0,
	railroads: 0,
	'philadelphia-art-museum': 0,
}

export const e2eFixtureOtherLocationPlaces: OtherLocationPlaceLink[] = [
	{
		name: 'E2E Test Location',
		href: `/locations/${E2E_TEST_LOCATION_SLUG}`,
		photoCount: 1,
	},
]

export const e2eFixtureGalleryNavItems: GalleryNavPlaceItem[] = [
	{
		name: 'E2E Test Location',
		slug: E2E_TEST_LOCATION_SLUG,
		placeCollection: TREDYFFRIN_EASTTOWN_VALUE,
	},
	{
		name: 'E2E Airfield Site',
		slug: 'e2e-airfield-site',
	},
]

export const e2eFixturePublishedLocationSlugs: string[] = [
	E2E_TEST_LOCATION_SLUG,
	'e2e-airfield-site',
]

export type E2eFixtureCollectionValue = SelectedPhotoCollectionValue

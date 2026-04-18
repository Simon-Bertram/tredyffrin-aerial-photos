import type { LocationRecord } from '@/lib/locations'
import { toAbsoluteUrl } from '@/lib/site-url'
import { truncateMeta } from '@/lib/truncate-meta'

export const LOCATION_PAGE_NOT_FOUND_DESCRIPTION =
	'This location is not listed in the Tredyffrin aerial photograph archive.'

export interface LocationPageLayoutMeta {
	pageTitle: string
	pageDescription: string
	previewSrc: string | undefined
	previewAlt: string | undefined
	jsonLd: Record<string, unknown> | undefined
}

export function buildLocationPageLayoutMeta(
	location: LocationRecord | undefined,
	siteOrigin: string,
): LocationPageLayoutMeta {
	const pageTitle = location
		? `${location.name} — Tredyffrin Aerial Photos`
		: 'Page not found — Tredyffrin Aerial Photos'
	const pageDescription = location
		? truncateMeta(
				location.shortDescription || location.fullDescription,
				160,
			)
		: LOCATION_PAGE_NOT_FOUND_DESCRIPTION
	const preview = location?.photos[0]
	const jsonLd = location
		? buildPlaceJsonLd(location, siteOrigin)
		: undefined
	return {
		pageTitle,
		pageDescription,
		previewSrc: preview?.src,
		previewAlt: preview?.alt,
		jsonLd,
	}
}

function buildPlaceJsonLd(
	location: LocationRecord,
	siteOrigin: string,
): Record<string, unknown> {
	const doc: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Place',
		name: location.name,
		description: truncateMeta(
			location.shortDescription || location.fullDescription,
			300,
		),
		geo: {
			'@type': 'GeoCoordinates',
			latitude: location.coordinates.latitude,
			longitude: location.coordinates.longitude,
		},
		url: `${siteOrigin}/locations/${location.slug}`,
	}
	if (location.photos.length > 0) {
		doc.image = location.photos.map((p) => toAbsoluteUrl(p.src))
	}
	return doc
}

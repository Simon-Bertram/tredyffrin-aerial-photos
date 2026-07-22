import {
	fetchGalleryNavItems,
	fetchPlaceCollectionTitle,
	fetchThemeCollectionPhotoCounts,
	type GalleryNavPlaceItem,
	type ThemeCollectionPhotoCounts,
} from '@/lib/sanity-location-repository'
import { TREDYFFRIN_EASTTOWN_VALUE } from '@/lib/place-collections'

export interface HeaderSanityData {
	navItems: GalleryNavPlaceItem[]
	themeCounts: ThemeCollectionPhotoCounts
	tredyffrinEasttownTitle?: string
}

type HeaderSanityLocals = Pick<App.Locals, 'headerSanityData'>

export async function loadHeaderSanityData(): Promise<HeaderSanityData> {
	const [navItems, themeCounts, tredyffrinEasttownTitle] = await Promise.all([
		fetchGalleryNavItems(),
		fetchThemeCollectionPhotoCounts(),
		fetchPlaceCollectionTitle(TREDYFFRIN_EASTTOWN_VALUE),
	])
	return {
		navItems,
		themeCounts,
		...(tredyffrinEasttownTitle
			? { tredyffrinEasttownTitle }
			: {}),
	}
}

export function ensureHeaderSanityData(
	locals: HeaderSanityLocals,
): Promise<HeaderSanityData> {
	if (!locals.headerSanityData) {
		locals.headerSanityData = loadHeaderSanityData()
	}
	return locals.headerSanityData
}

export function getHeaderSanityData(
	locals: HeaderSanityLocals,
): Promise<HeaderSanityData> {
	return ensureHeaderSanityData(locals)
}

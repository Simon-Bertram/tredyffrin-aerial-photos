import {
	fetchGalleryNavItems,
	fetchThemeCollectionPhotoCounts,
	type GalleryNavPlaceItem,
	type ThemeCollectionPhotoCounts,
} from '@/lib/sanity-location-repository'

export interface HeaderSanityData {
	navItems: GalleryNavPlaceItem[]
	themeCounts: ThemeCollectionPhotoCounts
}

export async function loadHeaderSanityData(): Promise<HeaderSanityData> {
	const [navItems, themeCounts] = await Promise.all([
		fetchGalleryNavItems(),
		fetchThemeCollectionPhotoCounts(),
	])
	return { navItems, themeCounts }
}

export function ensureHeaderSanityData(
	locals: App.Locals,
): Promise<HeaderSanityData> {
	if (!locals.headerSanityData) {
		locals.headerSanityData = loadHeaderSanityData()
	}
	return locals.headerSanityData
}

export function getHeaderSanityData(
	locals: App.Locals,
): Promise<HeaderSanityData> {
	return ensureHeaderSanityData(locals)
}

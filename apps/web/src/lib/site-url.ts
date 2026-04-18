import { PUBLIC_SERVER_URL } from 'astro:env/client'

export function getSiteOrigin(): string {
	return PUBLIC_SERVER_URL.replace(/\/$/, '')
}

/** Build an absolute URL for OG, canonical fallbacks, and JSON-LD. */
export function toAbsoluteUrl(pathOrUrl: string): string {
	if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
		return pathOrUrl
	}
	const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
	return `${getSiteOrigin()}${path}`
}

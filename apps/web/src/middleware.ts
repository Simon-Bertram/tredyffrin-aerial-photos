import { defineMiddleware } from 'astro:middleware'

// / is prerendered: validate real Cache-Control on production GET / before
// changing max-age/s-maxage (edge may treat static HTML differently).
export const HTML_CACHE_CONTROL =
	'public, max-age=60, s-maxage=600, stale-while-revalidate=86400'

const CACHEABLE_HTML_ROUTE_PATTERNS: ReadonlyArray<RegExp> = [
	/^\/$/,
	/^\/about$/,
	/^\/locations\/[^/]+$/,
	/^\/themes\/[^/]+$/,
]

export function isCacheableHtmlRoute(pathname: string): boolean {
	return CACHEABLE_HTML_ROUTE_PATTERNS.some((pattern) =>
		pattern.test(pathname),
	)
}

export interface CacheHeaderDecisionInput {
	method: string
	status: number
	pathname: string
	hasCacheControlHeader: boolean
	contentType?: string | null
}

export function shouldSetHtmlCacheHeader({
	method,
	status,
	pathname,
	hasCacheControlHeader,
	contentType,
}: CacheHeaderDecisionInput): boolean {
	if (method !== 'GET' || status !== 200 || hasCacheControlHeader) {
		return false
	}

	if (
		contentType != null &&
		contentType.length > 0 &&
		!contentType.includes('text/html')
	) {
		return false
	}

	return isCacheableHtmlRoute(pathname)
}

export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next()

	if (
		!shouldSetHtmlCacheHeader({
			method: context.request.method,
			status: response.status,
			pathname: context.url.pathname,
			hasCacheControlHeader: response.headers.has('Cache-Control'),
			contentType: response.headers.get('Content-Type'),
		})
	) {
		return response
	}

	response.headers.set('Cache-Control', HTML_CACHE_CONTROL)
	return response
})

import { defineMiddleware } from 'astro:middleware'

// / is prerendered: validate real Cache-Control on production GET / before
// changing max-age/s-maxage (edge may treat static HTML differently).
export const HTML_CACHE_CONTROL =
	'public, max-age=60, s-maxage=600, stale-while-revalidate=86400'

export const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https://cdn.sanity.io https://*.basemaps.cartocdn.com https://tiles.openstreetmap.org https://s3.amazonaws.com",
	"font-src 'self'",
	"connect-src 'self' https://*.cartocdn.com https://*.sanity.io https://api.sanity.io https://s3.amazonaws.com",
	"worker-src 'self' blob:",
	"child-src 'self' blob:",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'",
].join('; ')

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
	'Content-Security-Policy': CONTENT_SECURITY_POLICY,
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

export function applySecurityHeaders(
	response: Response,
	isHttps: boolean,
): void {
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		if (!response.headers.has(name)) {
			response.headers.set(name, value)
		}
	}

	if (isHttps && !response.headers.has('Strict-Transport-Security')) {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains',
		)
	}
}

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

	applySecurityHeaders(response, context.url.protocol === 'https:')

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

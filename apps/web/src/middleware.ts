import { defineMiddleware } from 'astro:middleware'

const HTML_CACHE_CONTROL =
	'public, max-age=60, s-maxage=600, stale-while-revalidate=86400'

function isCacheableHtmlRoute(pathname: string): boolean {
	if (pathname === '/' || pathname === '/about') {
		return true
	}

	return pathname.startsWith('/locations/')
}

export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next()

	if (
		context.request.method !== 'GET' ||
		response.status !== 200 ||
		!isCacheableHtmlRoute(context.url.pathname) ||
		response.headers.has('Cache-Control')
	) {
		return response
	}

	response.headers.set('Cache-Control', HTML_CACHE_CONTROL)
	return response
})

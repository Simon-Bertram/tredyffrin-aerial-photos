import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'

vi.mock('astro:middleware', () => ({
	defineMiddleware: (handler: unknown) => handler,
}))

import {
	applySecurityHeaders,
	CONTENT_SECURITY_POLICY,
	isCacheableHtmlRoute,
	SECURITY_HEADERS,
	shouldSetHtmlCacheHeader,
} from '@/middleware'

describe('isCacheableHtmlRoute', () => {
	it('returns true for known cacheable routes', () => {
		expect(isCacheableHtmlRoute('/about')).toBe(true)
		expect(isCacheableHtmlRoute('/locations/paoli')).toBe(true)
		expect(isCacheableHtmlRoute('/themes/airfields')).toBe(true)
	})

	it('returns false for non-cacheable routes', () => {
		expect(isCacheableHtmlRoute('/')).toBe(false)
		expect(isCacheableHtmlRoute('/locations')).toBe(false)
		expect(isCacheableHtmlRoute('/themes')).toBe(false)
		expect(isCacheableHtmlRoute('/api/foo')).toBe(false)
	})
})

describe('shouldSetHtmlCacheHeader', () => {
	it('returns true only for cache-eligible GET 200 responses', () => {
		expect(
			shouldSetHtmlCacheHeader({
				method: 'GET',
				status: 200,
				pathname: '/locations/paoli',
				hasCacheControlHeader: false,
			}),
		).toBe(true)
	})

	it('returns true for theme pages', () => {
		expect(
			shouldSetHtmlCacheHeader({
				method: 'GET',
				status: 200,
				pathname: '/themes/airfields',
				hasCacheControlHeader: false,
			}),
		).toBe(true)
	})

	it('returns false for non-GET methods', () => {
		expect(
			shouldSetHtmlCacheHeader({
				method: 'POST',
				status: 200,
				pathname: '/locations/paoli',
				hasCacheControlHeader: false,
			}),
		).toBe(false)
	})

	it('returns false for non-200 responses', () => {
		expect(
			shouldSetHtmlCacheHeader({
				method: 'GET',
				status: 404,
				pathname: '/locations/paoli',
				hasCacheControlHeader: false,
			}),
		).toBe(false)
	})

	it('returns false for non-cacheable routes', () => {
		expect(
			shouldSetHtmlCacheHeader({
				method: 'GET',
				status: 200,
				pathname: '/api/foo',
				hasCacheControlHeader: false,
			}),
		).toBe(false)
	})

	it('returns false when cache-control already exists', () => {
		expect(
			shouldSetHtmlCacheHeader({
				method: 'GET',
				status: 200,
				pathname: '/locations/paoli',
				hasCacheControlHeader: true,
			}),
		).toBe(false)
	})

	it('returns false for non-html content types', () => {
		expect(
			shouldSetHtmlCacheHeader({
				method: 'GET',
				status: 200,
				pathname: '/locations/paoli',
				hasCacheControlHeader: false,
				contentType: 'application/json',
			}),
		).toBe(false)
	})
})

describe('applySecurityHeaders', () => {
	it('allows AWS terrain elevation tiles for map 3D terrain', () => {
		expect(CONTENT_SECURITY_POLICY).toContain(
			'https://s3.amazonaws.com',
		)
		expect(CONTENT_SECURITY_POLICY.match(/connect-src[^;]*/)?.[0]).toContain(
			'https://s3.amazonaws.com',
		)
	})
	it('sets baseline security headers when absent', () => {
		const response = new Response('ok')

		applySecurityHeaders(response, false)

		for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
			expect(response.headers.get(name)).toBe(value)
		}
		expect(response.headers.get('Strict-Transport-Security')).toBeNull()
	})

	it('sets HSTS on https responses', () => {
		const response = new Response('ok')

		applySecurityHeaders(response, true)

		expect(response.headers.get('Strict-Transport-Security')).toBe(
			'max-age=31536000; includeSubDomains',
		)
	})

	it('does not overwrite existing header values', () => {
		const response = new Response('ok', {
			headers: {
				'X-Frame-Options': 'SAMEORIGIN',
			},
		})

		applySecurityHeaders(response, false)

		expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
	})
})

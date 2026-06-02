import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'

vi.mock('astro:middleware', () => ({
	defineMiddleware: (handler: unknown) => handler,
}))

import {
	isCacheableHtmlRoute,
	shouldSetHtmlCacheHeader,
} from '@/middleware'

describe('isCacheableHtmlRoute', () => {
	it('returns true for known cacheable routes', () => {
		expect(isCacheableHtmlRoute('/')).toBe(true)
		expect(isCacheableHtmlRoute('/about')).toBe(true)
		expect(isCacheableHtmlRoute('/locations/paoli')).toBe(true)
		expect(isCacheableHtmlRoute('/themes/airfields')).toBe(true)
	})

	it('returns false for non-cacheable routes', () => {
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

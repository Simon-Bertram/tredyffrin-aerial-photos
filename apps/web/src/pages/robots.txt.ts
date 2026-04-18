import type { APIRoute } from 'astro'

import { getSiteOrigin } from '@/lib/site-url'

export const GET: APIRoute = () => {
	const origin = getSiteOrigin()
	const body = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`
	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400',
		},
	})
}

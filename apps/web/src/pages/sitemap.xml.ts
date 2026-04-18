import type { APIRoute } from 'astro'

import { fetchPublishedLocationSlugs } from '@/lib/sanity-location-repository'
import { getSiteOrigin } from '@/lib/site-url'

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

export const GET: APIRoute = async () => {
	const origin = getSiteOrigin()
	const slugs = await fetchPublishedLocationSlugs()

	const paths = ['', 'about', ...slugs.map((s) => `locations/${s}`)]
	const urls = paths.map((p) =>
		p === '' ? `${origin}/` : `${origin}/${p}`,
	)

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map((loc) => {
		const priority = loc === `${origin}/` ? '1.0' : '0.8'
		return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
	})
	.join('\n')}
</urlset>`

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	})
}

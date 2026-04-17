import { createClient, type SanityClient } from '@sanity/client'

import {
	PUBLIC_SANITY_DATASET,
	PUBLIC_SANITY_PROJECT_ID,
	SANITY_API_READ_TOKEN,
} from 'astro:env/server'

let cached: SanityClient | undefined

export function getSanityClient(): SanityClient {
	if (cached) {
		return cached
	}

	const hasToken =
		typeof SANITY_API_READ_TOKEN === 'string' &&
		SANITY_API_READ_TOKEN.length > 0

	cached = createClient({
		projectId: PUBLIC_SANITY_PROJECT_ID,
		dataset: PUBLIC_SANITY_DATASET,
		apiVersion: '2024-01-01',
		useCdn: !hasToken,
		...(hasToken ? { token: SANITY_API_READ_TOKEN } : {}),
	})

	return cached
}

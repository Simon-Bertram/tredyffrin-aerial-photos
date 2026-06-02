import {
	PUBLIC_SANITY_DATASET,
	PUBLIC_SANITY_PROJECT_ID,
} from 'astro:env/server'
import type { SanityClient } from '@sanity/client'

import { getSanityClient } from '@/lib/sanity/client'
import { createSanityImageBuilder } from '@/lib/sanity/image'

export interface SanityRepositoryContext {
	client: SanityClient
	imageBuilder: ReturnType<typeof createSanityImageBuilder>
}

let cachedImageBuilder: ReturnType<typeof createSanityImageBuilder> | undefined

export function getSanityRepositoryContext(): SanityRepositoryContext {
	return {
		client: getSanityClient(),
		imageBuilder:
			cachedImageBuilder ??
			(cachedImageBuilder = createSanityImageBuilder(
				PUBLIC_SANITY_PROJECT_ID,
				PUBLIC_SANITY_DATASET,
			)),
	}
}

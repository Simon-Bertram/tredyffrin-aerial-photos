declare module 'alchemy/cloudflare/astro' {
	import type { AstroIntegration } from 'astro'

	interface AlchemyAstroAdapterOptions {
		platformProxy?: {
			configPath?: string
		}
		prerenderEnvironment?: 'node' | 'workerd'
	}

	export default function alchemy (
		options?: AlchemyAstroAdapterOptions,
	): AstroIntegration
}

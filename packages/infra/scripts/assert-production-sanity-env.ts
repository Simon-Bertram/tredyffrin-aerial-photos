import { loadDeployEnv } from './load-deploy-env'

export interface ProductionSanityEnvInput {
	alchemyStage?: string
	sanityApiReadToken?: string
	sanityE2eFixtures?: string
	allowSanityApiReadToken?: string
}

export function isProductionDeployStage(stage: string | undefined): boolean {
	return (stage ?? 'production') === 'production'
}

function hasNonEmptyValue(value: string | undefined): boolean {
	return typeof value === 'string' && value.trim().length > 0
}

export function validateProductionSanityEnv(
	input: ProductionSanityEnvInput,
): string | null {
	if (!isProductionDeployStage(input.alchemyStage)) {
		return null
	}

	if (input.sanityE2eFixtures === '1') {
		return 'SANITY_E2E_FIXTURES=1 must not be set for production deploys.'
	}

	if (!hasNonEmptyValue(input.sanityApiReadToken)) {
		return null
	}

	if (input.allowSanityApiReadToken === '1') {
		return null
	}

	return (
		'SANITY_API_READ_TOKEN is set for a production deploy. ' +
		'Public datasets must omit this token so Sanity CDN is used. ' +
		'Remove SANITY_API_READ_TOKEN from apps/web/.env, packages/infra/.env, ' +
		'and your shell. For a private dataset only, set ALLOW_SANITY_API_READ_TOKEN=1 ' +
		'in packages/infra/.env.'
	)
}

export function assertProductionSanityEnv(
	input: ProductionSanityEnvInput,
): void {
	const error = validateProductionSanityEnv(input)
	if (error != null) {
		throw new Error(error)
	}
}

function main(): void {
	loadDeployEnv()

	try {
		assertProductionSanityEnv({
			alchemyStage: process.env.ALCHEMY_STAGE,
			sanityApiReadToken: process.env.SANITY_API_READ_TOKEN,
			sanityE2eFixtures: process.env.SANITY_E2E_FIXTURES,
			allowSanityApiReadToken: process.env.ALLOW_SANITY_API_READ_TOKEN,
		})
		console.log(
			'Production Sanity env OK: SANITY_API_READ_TOKEN unset (CDN reads enabled).',
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(message)
		process.exit(1)
	}
}

if (import.meta.main) {
	main()
}

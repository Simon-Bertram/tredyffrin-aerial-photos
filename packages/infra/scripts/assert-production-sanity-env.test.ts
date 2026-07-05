import { describe, expect, it } from 'vitest'

import {
	assertProductionSanityEnv,
	isProductionDeployStage,
	validateProductionSanityEnv,
} from './assert-production-sanity-env'

describe('isProductionDeployStage', () => {
	it('treats missing stage as production', () => {
		expect(isProductionDeployStage(undefined)).toBe(true)
	})

	it('detects non-production stages', () => {
		expect(isProductionDeployStage('si')).toBe(false)
		expect(isProductionDeployStage('staging')).toBe(false)
	})
})

describe('validateProductionSanityEnv', () => {
	it('passes when production has no Sanity token', () => {
		expect(
			validateProductionSanityEnv({
				alchemyStage: 'production',
			}),
		).toBeNull()
	})

	it('fails when production has SANITY_API_READ_TOKEN', () => {
		expect(
			validateProductionSanityEnv({
				alchemyStage: 'production',
				sanityApiReadToken: 'secret',
			}),
		).toMatch(/SANITY_API_READ_TOKEN is set/)
	})

	it('allows token when explicitly opted in for private datasets', () => {
		expect(
			validateProductionSanityEnv({
				alchemyStage: 'production',
				sanityApiReadToken: 'secret',
				allowSanityApiReadToken: '1',
			}),
		).toBeNull()
	})

	it('fails when SANITY_E2E_FIXTURES is enabled in production', () => {
		expect(
			validateProductionSanityEnv({
				alchemyStage: 'production',
				sanityE2eFixtures: '1',
			}),
		).toMatch(/SANITY_E2E_FIXTURES=1/)
	})

	it('skips checks for non-production stages', () => {
		expect(
			validateProductionSanityEnv({
				alchemyStage: 'si',
				sanityApiReadToken: 'secret',
				sanityE2eFixtures: '1',
			}),
		).toBeNull()
	})
})

describe('assertProductionSanityEnv', () => {
	it('throws when validation fails', () => {
		expect(() =>
			assertProductionSanityEnv({
				alchemyStage: 'production',
				sanityApiReadToken: 'secret',
			}),
		).toThrow(/SANITY_API_READ_TOKEN is set/)
	})
})

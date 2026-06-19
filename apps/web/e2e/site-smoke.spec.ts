import { expect, test } from '@playwright/test'

import { E2E_TEST_LOCATION_SLUG } from '../src/lib/e2e-constants'

test.describe('site smoke and abuse-path checks', () => {
	test('homepage dropdown filters selected-photos coverflow in-place', async ({
		page,
	}) => {
		await page.goto('/')

		const section = page.locator('#selected-photographs')
		await section.scrollIntoViewIfNeeded()

		const dropdown = page.locator('#photo-collection')
		await expect(dropdown).toBeVisible()

		const emptyState = page.getByText(
			'The plate drawers await their first photograph.',
		)
		const activeSlideTitle = page.locator(
			'#selected-photographs .swiper-slide-active p',
		).first()

		const getActivePhotoTitle = async (): Promise<string> => {
			return (await activeSlideTitle.textContent())?.trim() ?? ''
		}

		await expect(activeSlideTitle).toBeVisible({ timeout: 15000 })

		const initialTitle = await getActivePhotoTitle()
		expect(initialTitle.length).toBeGreaterThan(0)

		const optionValues = await dropdown.locator('option').evaluateAll((options) =>
			options
				.map((opt) => opt.getAttribute('value') ?? '')
				.filter((value) => value.length > 0),
		)

		let foundUpdatedNonEmptyState = false
		for (const value of optionValues) {
			await dropdown.selectOption(value)
			await expect(emptyState).not.toBeVisible({ timeout: 5000 })

			if (await emptyState.isVisible()) {
				continue
			}

			const filteredTitle = await getActivePhotoTitle()
			if (filteredTitle.length === 0) {
				continue
			}

			// Valid filter interaction should update the active slide without navigation.
			if (filteredTitle !== initialTitle) {
				foundUpdatedNonEmptyState = true
				break
			}
		}

		expect(foundUpdatedNonEmptyState).toBe(true)
		await expect(page).toHaveURL(/\/$/)
	})

	test('serves robots.txt with sitemap reference', async ({ request }) => {
		const response = await request.get('/robots.txt')
		expect(response.ok()).toBe(true)
		expect(response.headers()['content-type']).toContain('text/plain')
		const body = await response.text()
		expect(body).toContain('User-agent: *')
		expect(body).toContain('/sitemap.xml')
	})

	test('serves sitemap.xml with static core routes', async ({ request }) => {
		const response = await request.get('/sitemap.xml')
		expect(response.ok()).toBe(true)
		expect(response.headers()['content-type']).toContain('application/xml')
		const body = await response.text()
		expect(body).toContain('<urlset')
		expect(body).toContain('/about')
		expect(body).toContain('/themes/airfields')
	})

	test('renders a valid theme page and keeps URL-state params stable', async ({
		page,
	}) => {
		await page.goto('/themes/airfields?photo=seed')
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Airfields',
		)
		await expect(page).toHaveURL(/\/themes\/airfields\?photo=seed$/)
	})

	test('returns 404 for invalid theme slug', async ({ page }) => {
		const response = await page.goto('/themes/not-a-valid-collection')
		expect(response?.status()).toBe(404)
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Theme not found',
		)
	})

	test('returns 404 for unknown location slug', async ({ page }) => {
		const response = await page.goto('/locations/not-a-real-location')
		expect(response?.status()).toBe(404)
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Location not found',
		)
	})

	test('renders a valid location page from fixture data', async ({ page }) => {
		const response = await page.goto(`/locations/${E2E_TEST_LOCATION_SLUG}`)
		expect(response?.status()).toBe(200)
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'E2E Test Location',
		)
		await expect(page.getByRole('heading', { level: 2 })).toContainText(
			'Location Photos',
		)
	})
})

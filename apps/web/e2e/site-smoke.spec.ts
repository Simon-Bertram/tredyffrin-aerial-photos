import { expect, test } from '@playwright/test'

test.describe('site smoke and abuse-path checks', () => {
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
})

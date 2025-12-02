import { expect, test } from '@playwright/test';

/**
 * E2E tests for public card SEO implementation
 * 
 * These tests verify that Open Graph tags, Twitter Card tags,
 * and JSON-LD structured data are properly rendered on public card pages.
 * 
 * Requirements: 1.2
 */

test.describe('Public Card SEO', () => {
	// Note: These tests require a test card to exist in the database
	// You may need to create a test card first or mock the data
	
	test.skip('should have Open Graph meta tags', async ({ page }) => {
		// Navigate to a test card (replace with actual test slug)
		await page.goto('/card/test-card-slug');
		
		// Check basic Open Graph tags
		const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
		const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
		const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
		const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
		const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
		
		expect(ogTitle).toBeTruthy();
		expect(ogDescription).toBeTruthy();
		expect(ogImage).toBeTruthy();
		expect(ogUrl).toContain('/card/');
		expect(ogType).toBe('profile');
		
		// Check enhanced Open Graph tags
		const ogImageAlt = await page.locator('meta[property="og:image:alt"]').getAttribute('content');
		const ogImageWidth = await page.locator('meta[property="og:image:width"]').getAttribute('content');
		const ogImageHeight = await page.locator('meta[property="og:image:height"]').getAttribute('content');
		const ogSiteName = await page.locator('meta[property="og:site_name"]').getAttribute('content');
		const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');
		
		expect(ogImageAlt).toBeTruthy();
		expect(ogImageWidth).toBe('1200');
		expect(ogImageHeight).toBe('630');
		expect(ogSiteName).toBe('Digital Card Studio');
		expect(ogLocale).toBe('en_US');
	});
	
	test.skip('should have Twitter Card meta tags', async ({ page }) => {
		await page.goto('/card/test-card-slug');
		
		const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
		const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
		const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
		const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
		const twitterImageAlt = await page.locator('meta[name="twitter:image:alt"]').getAttribute('content');
		
		expect(twitterCard).toBe('summary_large_image');
		expect(twitterTitle).toBeTruthy();
		expect(twitterDescription).toBeTruthy();
		expect(twitterImage).toBeTruthy();
		expect(twitterImageAlt).toBeTruthy();
	});
	
	test.skip('should have JSON-LD structured data', async ({ page }) => {
		await page.goto('/card/test-card-slug');
		
		// Get the JSON-LD script tag
		const jsonLdScript = await page.locator('script[type="application/ld+json"]').textContent();
		
		expect(jsonLdScript).toBeTruthy();
		
		// Parse and validate the structured data
		const structuredData = JSON.parse(jsonLdScript!);
		
		expect(structuredData['@context']).toBe('https://schema.org');
		expect(structuredData['@type']).toMatch(/Person|Organization/);
		expect(structuredData.name).toBeTruthy();
		
		// For Person schema
		if (structuredData['@type'] === 'Person') {
			expect(structuredData.url).toBeTruthy();
			expect(structuredData.image).toBeTruthy();
		}
		
		// For Organization schema
		if (structuredData['@type'] === 'Organization') {
			expect(structuredData.url).toBeTruthy();
			expect(structuredData.contactPoint).toBeTruthy();
			expect(structuredData.contactPoint['@type']).toBe('ContactPoint');
		}
	});
	
	test.skip('should have canonical URL', async ({ page }) => {
		await page.goto('/card/test-card-slug');
		
		const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
		
		expect(canonical).toBeTruthy();
		expect(canonical).toContain('/card/');
	});
	
	test.skip('should have additional SEO meta tags', async ({ page }) => {
		await page.goto('/card/test-card-slug');
		
		const robots = await page.locator('meta[name="robots"]').getAttribute('content');
		const author = await page.locator('meta[name="author"]').getAttribute('content');
		const description = await page.locator('meta[name="description"]').getAttribute('content');
		
		expect(robots).toBe('index, follow');
		expect(author).toBeTruthy();
		expect(description).toBeTruthy();
	});
	
	test.skip('should generate rich description for professional cards', async ({ page }) => {
		// This test assumes a professional card with company info
		await page.goto('/card/professional-test-card-slug');
		
		const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
		
		// Should include designation and company name
		expect(ogDescription).toBeTruthy();
		// The description should be limited to 200 characters
		expect(ogDescription!.length).toBeLessThanOrEqual(200);
	});
});

/**
 * Manual Testing Instructions:
 * 
 * 1. Create a test card in the database with complete profile information
 * 2. Update the test slugs above with your actual test card slug
 * 3. Run the tests: npm run test
 * 
 * For manual validation:
 * 
 * 1. View Page Source:
 *    - Navigate to /card/[your-slug]
 *    - Right-click > View Page Source
 *    - Verify all meta tags are present in the HTML
 * 
 * 2. Facebook Debugger:
 *    - Go to https://developers.facebook.com/tools/debug/
 *    - Enter your card URL
 *    - Verify the preview looks correct
 * 
 * 3. Twitter Card Validator:
 *    - Go to https://cards-dev.twitter.com/validator
 *    - Enter your card URL
 *    - Verify the card preview
 * 
 * 4. Google Rich Results Test:
 *    - Go to https://search.google.com/test/rich-results
 *    - Enter your card URL
 *    - Verify structured data is valid
 * 
 * 5. Schema.org Validator:
 *    - Go to https://validator.schema.org/
 *    - Enter your card URL
 *    - Verify JSON-LD is valid
 */

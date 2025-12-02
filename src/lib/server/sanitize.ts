/**
 * HTML Sanitization Utility
 * Sanitizes user-generated HTML content to prevent XSS attacks
 * while allowing safe rich content like images, videos, and formatting
 */

/**
 * Sanitize HTML content
 * This is a server-side implementation that will work without DOMPurify
 * For production, consider using isomorphic-dompurify
 */
export function sanitizeHTML(html: string): string {
	if (!html) return '';

	// Remove script tags and event handlers
	let sanitized = html
		// Remove script tags
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		// Remove event handlers
		.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
		.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
		// Remove javascript: protocol
		.replace(/javascript:/gi, '')
		// Remove data: protocol (except for images)
		.replace(/href\s*=\s*["']data:(?!image)/gi, 'href="')
		.replace(/src\s*=\s*["']data:(?!image)/gi, 'src="');

	return sanitized;
}

/**
 * Validate and sanitize iframe embeds
 * Only allows whitelisted domains
 */
export function sanitizeIframe(html: string): string {
	const allowedDomains = [
		'youtube.com',
		'youtube-nocookie.com',
		'youtu.be',
		'vimeo.com',
		'player.vimeo.com',
		'google.com/maps',
		'maps.google.com',
		'dailymotion.com',
		'soundcloud.com'
	];

	// Extract iframe src
	const iframeRegex = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
	
	return html.replace(iframeRegex, (match, src) => {
		try {
			const url = new URL(src);
			const isAllowed = allowedDomains.some(domain => 
				url.hostname.includes(domain)
			);

			if (!isAllowed) {
				return '<!-- Iframe from untrusted source removed -->';
			}

			// Add security attributes
			return match
				.replace(/>/g, ' sandbox="allow-scripts allow-same-origin allow-presentation" loading="lazy">');
		} catch {
			return '<!-- Invalid iframe removed -->';
		}
	});
}

/**
 * Complete sanitization pipeline
 */
export function sanitizeContent(html: string): string {
	let sanitized = sanitizeHTML(html);
	sanitized = sanitizeIframe(sanitized);
	return sanitized;
}

/**
 * Validate content size
 */
export function validateContentSize(html: string, maxSizeKB: number = 50): boolean {
	const sizeInKB = new Blob([html]).size / 1024;
	return sizeInKB <= maxSizeKB;
}

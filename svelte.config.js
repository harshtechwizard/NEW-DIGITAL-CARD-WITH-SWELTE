import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Vercel adapter with optimized configuration
		// Note: Routes can specify their own runtime via export const config
		adapter: adapter({
			// Default to Node.js runtime for compatibility
			// Individual routes can opt into edge runtime
			// Regions for deployment (optional, defaults to all)
			regions: ['iad1'], // US East, adjust based on your target audience
			// Memory and timeout settings
			memory: 1024,
			maxDuration: 10
		}),

		// Content Security Policy and security headers
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'unsafe-inline'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'https:'],
				'font-src': ['self', 'data:'],
				'connect-src': ['self', 'https://*.supabase.co'],
				'frame-ancestors': ['none']
			}
		},

		// CSRF protection configuration
		// Note: Additional CSRF validation is implemented in hooks.server.ts
		csrf: {
			// checkOrigin is deprecated, using trustedOrigins instead
			trustedOrigins: [] // Empty array means only same-origin requests are allowed
		},

		// Environment variable validation
		env: {
			publicPrefix: 'PUBLIC_',
			privatePrefix: ''
		}
	}
};

export default config;

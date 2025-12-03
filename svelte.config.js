import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Node adapter for Dokploy/self-hosted deployment
		adapter: adapter({
			out: 'build'
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

/**
 * Server hooks for SvelteKit
 * Handles authentication, CSRF protection, security headers, and environment validation
 */

import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { getEnv } from '$lib/server/env';
import type { Handle } from '@sveltejs/kit';

// Validate environment variables on server startup
try {
	getEnv();
} catch (error) {
	console.error('❌ Environment validation failed:');
	console.error(error);
	process.exit(1);
}

/**
 * CSRF Protection Handle
 * Validates origin header for state-changing requests
 */
const csrfHandle: Handle = async ({ event, resolve }) => {
	// Skip CSRF check for GET and HEAD requests
	if (event.request.method === 'GET' || event.request.method === 'HEAD') {
		return resolve(event);
	}

	const origin = event.request.headers.get('origin');
	const host = event.request.headers.get('host');

	// In development, allow localhost origins
	if (dev) {
		if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
			return resolve(event);
		}
	}

	// Validate origin matches host
	if (!origin || !host) {
		console.warn('CSRF: Missing origin or host header', { origin, host });
		return new Response('CSRF validation failed: Missing origin or host header', {
			status: 403
		});
	}

	try {
		new URL(origin); // Validate origin is a valid URL
		if (!origin.includes(host)) {
			console.warn('CSRF: Origin does not match host', { origin, host });
			return new Response('CSRF validation failed: Origin mismatch', { status: 403 });
		}
	} catch {
		console.warn('CSRF: Invalid origin URL', { origin });
		return new Response('CSRF validation failed: Invalid origin', { status: 403 });
	}

	return resolve(event);
};

/**
 * Security Headers Handle
 * Adds security headers to all responses
 */
const securityHeadersHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	// Production-only headers
	if (!dev) {
		// Content Security Policy
		response.headers.set(
			'Content-Security-Policy',
			[
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline'",
				"style-src 'self' 'unsafe-inline'",
				"img-src 'self' data: https:",
				"font-src 'self' data:",
				"connect-src 'self' https://*.supabase.co",
				"frame-ancestors 'none'"
			].join('; ')
		);

		// Strict Transport Security (HTTPS only)
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	}

	return response;
};

/**
 * Authentication Handle
 * Retrieves and validates user session, sets event.locals
 */
const authHandle: Handle = async ({ event, resolve }) => {
	// Import here to avoid circular dependencies
	const { createSupabaseServerClient } = await import('$lib/server/supabase');
	
	// Create Supabase client for this request
	const supabase = createSupabaseServerClient(event);
	
	// Get session (this will automatically refresh if expired)
	const {
		data: { session },
		error
	} = await supabase.auth.getSession();
	
	if (error) {
		console.error('Session retrieval error:', error);
		event.locals.session = null;
		event.locals.user = null;
	} else {
		event.locals.session = session;
		event.locals.user = session?.user ?? null;
	}
	
	// Make supabase client available in event.locals
	event.locals.supabase = supabase;
	
	// Resolve the request
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			// Allow content-range header for Supabase queries
			return name === 'content-range';
		}
	});
};

/**
 * Combine all handles in sequence
 */
export const handle = sequence(authHandle, csrfHandle, securityHeadersHandle);

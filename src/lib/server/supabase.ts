/**
 * Server-side Supabase client configuration
 * 
 * This module provides secure server-side Supabase clients with proper cookie handling.
 * - createSupabaseServerClient: For authenticated requests with user sessions
 * - createSupabaseServiceClient: For admin operations that bypass RLS
 * 
 * Security features:
 * - httpOnly cookies prevent XSS attacks
 * - secure flag ensures HTTPS-only transmission
 * - sameSite: 'lax' provides CSRF protection
 * - Service role key is never exposed to client
 */

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { RequestEvent } from '@sveltejs/kit';
import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY
} from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

/**
 * Creates a Supabase client for server-side operations with user authentication
 * 
 * This client:
 * - Reads/writes session from/to httpOnly cookies
 * - Respects Row Level Security (RLS) policies
 * - Automatically refreshes expired sessions
 * - Is safe to use in load functions and form actions
 * 
 * @param event - SvelteKit RequestEvent containing cookies
 * @returns Supabase client configured for the current user session
 */
export function createSupabaseServerClient(event: RequestEvent) {
	return createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get: (key) => event.cookies.get(key),
				set: (key, value, options) => {
					event.cookies.set(key, value, {
						...options,
						httpOnly: true,
						secure: true,
						sameSite: 'lax',
						path: '/',
						maxAge: 60 * 60 * 24 * 365 // 1 year
					});
				},
				remove: (key, options) => {
					event.cookies.delete(key, {
						...options,
						path: '/'
					});
				}
			}
		}
	);
}

/**
 * Creates a Supabase client with service role privileges
 * 
 * This client:
 * - Bypasses Row Level Security (RLS) policies
 * - Should ONLY be used for admin operations
 * - Must NEVER be exposed to the client
 * - Is suitable for analytics tracking, batch operations, etc.
 * 
 * ⚠️ WARNING: Use with extreme caution! This client has full database access.
 * 
 * @returns Supabase client with service role privileges
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not configured
 */
export function createSupabaseServiceClient() {
	if (!SUPABASE_SERVICE_ROLE_KEY) {
		throw new Error(
			'SUPABASE_SERVICE_ROLE_KEY is not set. This is required for admin operations. ' +
			'Add it to your .env file for production features.'
		);
	}

	return createClient<Database>(
		PUBLIC_SUPABASE_URL,
		SUPABASE_SERVICE_ROLE_KEY,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		}
	);
}

/**
 * Helper function to get the current session from a request
 * 
 * @param event - SvelteKit RequestEvent
 * @returns Session object or null if not authenticated
 */
export async function getSession(event: RequestEvent) {
	const supabase = createSupabaseServerClient(event);
	const {
		data: { session },
		error
	} = await supabase.auth.getSession();

	if (error) {
		console.error('Session retrieval error:', error);
		return null;
	}

	return session;
}

/**
 * Helper function to get the current user from a request
 * 
 * @param event - SvelteKit RequestEvent
 * @returns User object or null if not authenticated
 */
export async function getUser(event: RequestEvent) {
	const session = await getSession(event);
	return session?.user ?? null;
}

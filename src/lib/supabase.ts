/**
 * Client-side Supabase client configuration
 * 
 * This module provides a browser-safe Supabase client for client-side operations.
 * 
 * Features:
 * - Automatic session refresh
 * - RLS-protected queries (respects database security policies)
 * - Safe for use in Svelte components
 * - Singleton pattern ensures one client instance
 * 
 * Usage:
 * ```typescript
 * import { supabase } from '$lib/supabase';
 * 
 * // Fetch user's cards (RLS ensures only their data is returned)
 * const { data } = await supabase
 *   .from('business_cards')
 *   .select('*')
 *   .eq('user_id', user.id);
 * ```
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '$lib/types/database';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Browser-side Supabase client
 * 
 * This client:
 * - Automatically manages session state
 * - Refreshes expired tokens
 * - Respects Row Level Security (RLS) policies
 * - Uses the anonymous key (safe for public exposure)
 * 
 * Note: All queries are subject to RLS policies defined in the database.
 * Users can only access data they're authorized to see.
 */
export const supabase = createBrowserClient<Database>(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
	{
		auth: {
			// Automatically refresh session when it expires
			autoRefreshToken: true,
			// Persist session in browser storage
			persistSession: true,
			// Detect session changes across tabs
			detectSessionInUrl: true
		}
	}
);

/**
 * Helper function to check if user is authenticated
 * 
 * @returns Promise resolving to true if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	const {
		data: { session }
	} = await supabase.auth.getSession();
	return session !== null;
}

/**
 * Helper function to get current user
 * 
 * @returns Promise resolving to User object or null
 */
export async function getCurrentUser() {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	return user;
}

/**
 * Helper function to sign out
 * 
 * @returns Promise resolving when sign out is complete
 */
export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) {
		console.error('Sign out error:', error);
		throw error;
	}
}

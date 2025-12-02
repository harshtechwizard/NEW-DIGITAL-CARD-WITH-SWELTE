import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Logout endpoint
 * 
 * Signs out the user and redirects to home page
 */
export const POST: RequestHandler = async ({ locals }) => {
	const supabase = locals.supabase;
	
	// Sign out
	await supabase.auth.signOut();
	
	// Redirect to home
	throw redirect(303, '/');
};

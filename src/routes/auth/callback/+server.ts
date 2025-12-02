import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * OAuth callback handler
 * 
 * This endpoint handles the OAuth callback from providers (Google, GitHub)
 * and exchanges the authorization code for a session.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') || '/dashboard';
	
	if (code) {
		const supabase = locals.supabase;
		
		// Exchange code for session
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		
		if (error) {
			console.error('OAuth callback error:', error);
			throw redirect(303, '/login?error=oauth_failed');
		}
	}
	
	// Redirect to dashboard or specified next page
	throw redirect(303, next);
};

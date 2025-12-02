import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Protected layout - requires authentication
 * 
 * This layout wraps all protected routes and ensures the user is authenticated.
 * If not authenticated, redirects to login page.
 * Loads user data for display in navigation.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.session) {
		throw redirect(303, '/login');
	}
	
	// Load user's personal info for display in navigation
	const { data: personalInfo } = await locals.supabase
		.from('personal_info')
		.select('full_name, profile_photo_url')
		.eq('user_id', locals.user!.id)
		.single();
	
	return {
		session: locals.session,
		user: locals.user,
		personalInfo: personalInfo || null
	};
};

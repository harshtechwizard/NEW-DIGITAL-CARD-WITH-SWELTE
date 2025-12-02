import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Server load function for cards listing page
 * 
 * Fetches all business cards for the authenticated user with basic personal info
 * for preview purposes. Cards are ordered by creation date (newest first).
 * 
 * Requirements: 7.1, 7.2
 */
export const load: PageServerLoad = async ({ locals }) => {
	// Auth check is handled by parent layout, but double-check for safety
	if (!locals.session || !locals.user) {
		throw redirect(303, '/login');
	}

	// Fetch all business cards for current user with basic personal info
	const { data: cards, error } = await locals.supabase
		.from('business_cards')
		.select(
			`
			id,
			name,
			slug,
			template_type,
			is_active,
			is_default,
			created_at,
			updated_at
		`
		)
		.eq('user_id', locals.user.id)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching business cards:', error);
		return {
			cards: [],
			error: 'Failed to load business cards'
		};
	}

	// Also fetch basic personal info for preview
	const { data: personalInfo } = await locals.supabase
		.from('personal_info')
		.select('full_name, profile_photo_url')
		.eq('user_id', locals.user.id)
		.single();

	return {
		cards: cards || [],
		personalInfo: personalInfo || null,
		error: null
	};
};

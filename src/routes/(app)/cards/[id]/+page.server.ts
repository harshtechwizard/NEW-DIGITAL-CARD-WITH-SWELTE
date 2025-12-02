/**
 * Card Edit - Server Load
 * Loads existing card data and user profile data for editing
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;

	// Fetch card by ID
	const { data: card, error: cardError } = await locals.supabase
		.from('business_cards')
		.select('*')
		.eq('id', id)
		.single();

	// Handle card not found
	if (cardError || !card) {
		throw error(404, 'Card not found');
	}

	// Verify card belongs to current user
	if (card.user_id !== locals.user!.id) {
		throw error(403, 'You do not have permission to edit this card');
	}

	// Fetch personal info
	const { data: personalInfo } = await locals.supabase
		.from('personal_info')
		.select('*')
		.eq('user_id', locals.user!.id)
		.maybeSingle();

	// Fetch professional info
	const { data: professionalInfo } = await locals.supabase
		.from('professional_info')
		.select('*')
		.eq('user_id', locals.user!.id)
		.order('is_primary', { ascending: false });

	// Fetch education
	const { data: education } = await locals.supabase
		.from('education')
		.select('*')
		.eq('user_id', locals.user!.id)
		.order('year_completed', { ascending: false });

	// Fetch awards
	const { data: awards } = await locals.supabase
		.from('awards')
		.select('*')
		.eq('user_id', locals.user!.id)
		.order('date_received', { ascending: false });

	// Fetch products/services
	const { data: productsServices } = await locals.supabase
		.from('products_services')
		.select('*')
		.eq('user_id', locals.user!.id)
		.order('created_at', { ascending: false });

	// Fetch photo gallery
	const { data: photos } = await locals.supabase
		.from('photo_gallery')
		.select('*')
		.eq('user_id', locals.user!.id)
		.order('display_order', { ascending: true });

	return {
		card,
		personalInfo: personalInfo || null,
		professionalInfo: professionalInfo || [],
		education: education || [],
		awards: awards || [],
		productsServices: productsServices || [],
		photos: photos || []
	};
};

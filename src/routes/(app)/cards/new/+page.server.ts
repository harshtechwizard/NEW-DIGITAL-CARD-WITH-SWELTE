/**
 * Card Creator - Server Load
 * Loads user profile data for card creation
 */

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
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

	// Fetch custom sections
	const { data: customSections } = await locals.supabase
		.from('custom_sections')
		.select('*')
		.eq('user_id', locals.user!.id)
		.order('display_order', { ascending: true });

	return {
		personalInfo: personalInfo || null,
		professionalInfo: professionalInfo || [],
		education: education || [],
		awards: awards || [],
		productsServices: productsServices || [],
		photos: photos || [],
		customSections: customSections || []
	};
};

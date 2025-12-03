import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	personalInfoSchema,
	professionalInfoSchema,
	educationSchema,
	awardSchema,
	productServiceSchema,
	photoGallerySchema,
	customSectionSchema
} from '$lib/server/validation';
import { sanitizeContent, validateContentSize } from '$lib/server/sanitize';
import type { UserProfile } from '$lib/types/database';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session || !locals.user) {
		throw redirect(303, '/login');
	}

	const userId = locals.user.id;

	// Fetch all profile data in parallel
	const [
		{ data: personalInfo },
		{ data: professionalInfo },
		{ data: education },
		{ data: awards },
		{ data: productsServices },
		{ data: photoGallery },
		{ data: customSections }
	] = await Promise.all([
		locals.supabase.from('personal_info').select('*').eq('user_id', userId).single(),
		locals.supabase.from('professional_info').select('*').eq('user_id', userId),
		locals.supabase.from('education').select('*').eq('user_id', userId).order('year_completed', { ascending: false }),
		locals.supabase.from('awards').select('*').eq('user_id', userId).order('date_received', { ascending: false }),
		locals.supabase.from('products_services').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
		locals.supabase.from('photo_gallery').select('*').eq('user_id', userId).order('display_order', { ascending: true }),
		locals.supabase.from('custom_sections').select('*').eq('user_id', userId).order('display_order', { ascending: true })
	]);

	const profile: UserProfile = {
		personal_info: personalInfo || null,
		professional_info: professionalInfo || [],
		education: education || [],
		awards: awards || [],
		products_services: productsServices || [],
		photo_gallery: photoGallery || [],
		custom_sections: customSections || []
	};

	return {
		profile
	};
};

export const actions: Actions = {
	savePersonalInfo: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		// Validate input
		const validation = personalInfoSchema.safeParse(data);
		if (!validation.success) {
			return fail(400, {
				error: validation.error.issues[0]?.message || 'Validation failed'
			});
		}

		// Clean data: convert empty strings to null for optional fields
		const cleanedData: any = {};
		for (const [key, value] of Object.entries(validation.data)) {
			if (value === '' || value === null || value === undefined) {
				cleanedData[key] = null;
			} else {
				cleanedData[key] = value;
			}
		}

		// Check if personal info exists
		const { data: existing } = await locals.supabase
			.from('personal_info')
			.select('id')
			.eq('user_id', locals.user.id)
			.maybeSingle();

		if (existing) {
			// Update existing
			const { error } = await locals.supabase
				.from('personal_info')
				.update(cleanedData)
				.eq('user_id', locals.user.id);

			if (error) {
				return fail(500, { error: `Failed to update: ${error.message}` });
			}
		} else {
			// Insert new
			const { error } = await locals.supabase
				.from('personal_info')
				.insert({ ...cleanedData, user_id: locals.user.id });

			if (error) {
				return fail(500, { error: `Failed to save: ${error.message}` });
			}
		}

		return {
			success: true,
			message: 'Personal information saved successfully'
		};
	},

	saveProfessionalInfo: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const data = Object.fromEntries(formData);
		delete data.id;

		// Validate input
		const validation = professionalInfoSchema.safeParse(data);
		if (!validation.success) {
			return fail(400, {
				error: validation.error.issues[0]?.message || 'Validation failed'
			});
		}

		// Clean data: convert empty strings to null
		const cleanedData: any = {};
		for (const [key, value] of Object.entries(validation.data)) {
			if (value === '' || value === null || value === undefined) {
				cleanedData[key] = null;
			} else {
				cleanedData[key] = value;
			}
		}

		if (id) {
			// Update existing
			const { error } = await locals.supabase
				.from('professional_info')
				.update(cleanedData)
				.eq('id', id)
				.eq('user_id', locals.user.id);

			if (error) {
				return fail(500, { error: `Failed to update: ${error.message}` });
			}
		} else {
			// Insert new
			const { error } = await locals.supabase
				.from('professional_info')
				.insert({ ...cleanedData, user_id: locals.user.id });

			if (error) {
				return fail(500, { error: `Failed to save: ${error.message}` });
			}
		}

		return { success: true, message: 'Professional information saved successfully' };
	},

	deleteProfessionalInfo: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		const { error } = await locals.supabase
			.from('professional_info')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete professional info' });
		}

		return { success: true, message: 'Professional info deleted successfully' };
	},

	saveEducation: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const data = Object.fromEntries(formData);
		delete data.id;

		// Convert year to number if present
		const processedData: any = { ...data };
		if (processedData.year_completed) {
			processedData.year_completed = parseInt(processedData.year_completed as string);
		}

		// Validate input
		const validation = educationSchema.safeParse(processedData);
		if (!validation.success) {
			return fail(400, {
				error: validation.error.issues[0]?.message || 'Validation failed',
				fields: data
			});
		}

		if (id) {
			// Update existing
			const { error } = await locals.supabase
				.from('education')
				.update(validation.data)
				.eq('id', id)
				.eq('user_id', locals.user.id);

			if (error) {
				return fail(500, { error: 'Failed to update education' });
			}
		} else {
			// Insert new
			const { error } = await locals.supabase
				.from('education')
				.insert({ ...validation.data, user_id: locals.user.id });

			if (error) {
				return fail(500, { error: 'Failed to save education' });
			}
		}

		return { success: true, message: 'Education saved successfully' };
	},

	deleteEducation: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		const { error } = await locals.supabase
			.from('education')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete education' });
		}

		return { success: true, message: 'Education deleted successfully' };
	},

	saveAward: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const data = Object.fromEntries(formData);
		delete data.id;

		// Validate input
		const validation = awardSchema.safeParse(data);
		if (!validation.success) {
			return fail(400, {
				error: validation.error.issues[0]?.message || 'Validation failed',
				fields: data
			});
		}

		// Convert empty strings to null for date fields (PostgreSQL requirement)
		const cleanedData = {
			...validation.data,
			date_received: validation.data.date_received === '' ? null : validation.data.date_received,
			expiry_date: validation.data.expiry_date === '' ? null : validation.data.expiry_date
		};

		if (id) {
			// Update existing
			const { error } = await locals.supabase
				.from('awards')
				.update(cleanedData)
				.eq('id', id)
				.eq('user_id', locals.user.id);

			if (error) {
				return fail(500, { error: 'Failed to update award' });
			}
		} else {
			// Insert new
			const { error } = await locals.supabase
				.from('awards')
				.insert({ ...cleanedData, user_id: locals.user.id });

			if (error) {
				return fail(500, { error: 'Failed to save award' });
			}
		}

		return { success: true, message: 'Award saved successfully' };
	},

	deleteAward: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		const { error } = await locals.supabase
			.from('awards')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete award' });
		}

		return { success: true, message: 'Award deleted successfully' };
	},

	saveProductService: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const data = Object.fromEntries(formData);
		delete data.id;

		// Validate input
		const validation = productServiceSchema.safeParse(data);
		if (!validation.success) {
			return fail(400, {
				error: validation.error.issues[0]?.message || 'Validation failed',
				fields: data
			});
		}

		if (id) {
			// Update existing
			const { error } = await locals.supabase
				.from('products_services')
				.update(validation.data)
				.eq('id', id)
				.eq('user_id', locals.user.id);

			if (error) {
				return fail(500, { error: 'Failed to update product/service' });
			}
		} else {
			// Insert new
			const { error } = await locals.supabase
				.from('products_services')
				.insert({ ...validation.data, user_id: locals.user.id });

			if (error) {
				return fail(500, { error: 'Failed to save product/service' });
			}
		}

		return { success: true, message: 'Product/Service saved successfully' };
	},

	deleteProductService: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		const { error } = await locals.supabase
			.from('products_services')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete product/service' });
		}

		return { success: true, message: 'Product/Service deleted successfully' };
	},

	savePhotoGallery: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const data = Object.fromEntries(formData);
		delete data.id;

		// Convert display_order to number if present
		const processedData: any = { ...data };
		if (processedData.display_order) {
			processedData.display_order = parseInt(processedData.display_order as string);
		}

		// Validate input
		const validation = photoGallerySchema.safeParse(processedData);
		if (!validation.success) {
			return fail(400, {
				error: validation.error.issues[0]?.message || 'Validation failed',
				fields: data
			});
		}

		if (id) {
			// Update existing
			const { error } = await locals.supabase
				.from('photo_gallery')
				.update(validation.data)
				.eq('id', id)
				.eq('user_id', locals.user.id);

			if (error) {
				return fail(500, { error: 'Failed to update photo' });
			}
		} else {
			// Insert new
			const { error } = await locals.supabase
				.from('photo_gallery')
				.insert({ ...validation.data, user_id: locals.user.id });

			if (error) {
				return fail(500, { error: 'Failed to save photo' });
			}
		}

		return { success: true, message: 'Photo saved successfully' };
	},

	deletePhotoGallery: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		const { error } = await locals.supabase
			.from('photo_gallery')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete photo' });
		}

		return { success: true, message: 'Photo deleted successfully' };
	},

	saveCustomSection: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const data = Object.fromEntries(formData);
		delete data.id;

		// Convert display_order to number and is_active to boolean
		const processedData: any = { ...data };
		if (processedData.display_order) {
			processedData.display_order = parseInt(processedData.display_order as string);
		}
		processedData.is_active = processedData.is_active === 'on';

		// Validate input
		const validation = customSectionSchema.safeParse(processedData);
		if (!validation.success) {
			return fail(400, {
				error: validation.error.issues[0]?.message || 'Validation failed'
			});
		}

		// Validate content size
		if (!validateContentSize(validation.data.content)) {
			return fail(400, { error: 'Content is too large (max 50KB)' });
		}

		// Sanitize HTML content
		const sanitizedContent = sanitizeContent(validation.data.content);
		const cleanedData = {
			...validation.data,
			content: sanitizedContent
		};

		if (id) {
			// Update existing
			const { error } = await locals.supabase
				.from('custom_sections')
				.update(cleanedData)
				.eq('id', id)
				.eq('user_id', locals.user.id);

			if (error) {
				return fail(500, { error: 'Failed to update custom section' });
			}
		} else {
			// Insert new
			const { error } = await locals.supabase
				.from('custom_sections')
				.insert({ ...cleanedData, user_id: locals.user.id });

			if (error) {
				return fail(500, { error: 'Failed to save custom section' });
			}
		}

		return { success: true, message: 'Custom section saved successfully' };
	},

	deleteCustomSection: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID is required' });
		}

		const { error } = await locals.supabase
			.from('custom_sections')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete custom section' });
		}

		return { success: true, message: 'Custom section deleted successfully' };
	}
};


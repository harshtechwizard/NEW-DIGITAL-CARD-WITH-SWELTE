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
import { retryDatabaseOperation, VersionConflictError } from '$lib/server/retry';
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
		const version = data.version ? parseInt(data.version as string) : 0;
		delete data.version;

		// Validate input
		const validation = personalInfoSchema.safeParse(data);
		if (!validation.success) {
			return fail(400, {
				error: validation.error.issues[0]?.message || 'Validation failed'
			});
		}

		try {
			// Use database function for optimistic locking
			const result = await retryDatabaseOperation(async () => {
				const { data: rpcData, error: rpcError } = await locals.supabase.rpc(
					'upsert_personal_info_optimistic',
					{
						p_user_id: locals.user!.id,
						p_expected_version: version,
						p_full_name: validation.data.full_name,
						p_date_of_birth: validation.data.date_of_birth || null,
						p_primary_email: validation.data.primary_email || null,
						p_secondary_email: validation.data.secondary_email || null,
						p_mobile_number: validation.data.mobile_number || null,
						p_phone_number: validation.data.phone_number || null,
						p_whatsapp_number: validation.data.whatsapp_number || null,
						p_home_address: null, // Not in schema yet
						p_bio: validation.data.bio || null,
						p_profile_photo_url: validation.data.profile_photo_url || null,
						p_instagram_url: validation.data.instagram_url || null,
						p_facebook_url: validation.data.facebook_url || null,
						p_linkedin_url: validation.data.linkedin_url || null
					}
				);

				if (rpcError) {
					throw rpcError;
				}

				return rpcData;
			}, 'save personal info');

			if (!result || result.length === 0) {
				return fail(500, { error: 'Failed to save personal information' });
			}

			const saveResult = result[0];

			if (!saveResult.success) {
				// Version conflict
				if (saveResult.message.includes('Version conflict')) {
					return fail(409, {
						error: 'Version conflict',
						message: saveResult.message,
						currentVersion: saveResult.new_version,
						details: 'Your data was modified in another session. Please refresh and try again.'
					});
				}

				return fail(500, { error: saveResult.message });
			}

			return {
				success: true,
				message: saveResult.message,
				version: saveResult.new_version,
				isNew: saveResult.is_new
			};
		} catch (err: any) {
			console.error('Error saving personal info:', err);

			if (err.message?.includes('version conflict') || err.message?.includes('Version conflict')) {
				return fail(409, {
					error: 'Version conflict',
					details: 'Your data was modified in another session. Please refresh and try again.'
				});
			}

			return fail(500, {
				error: 'Failed to save personal information',
				details: err.message
			});
		}
	},

	saveProfessionalInfo: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const version = formData.get('version') ? parseInt(formData.get('version') as string) : 1;
		const data = Object.fromEntries(formData);
		delete data.id;
		delete data.version;

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

		try {
			if (id) {
				// Update existing with optimistic locking
				const result = await retryDatabaseOperation(async () => {
					// First check current version
					const { data: current, error: fetchError } = await locals.supabase
						.from('professional_info')
						.select('version')
						.eq('id', id)
						.eq('user_id', locals.user!.id)
						.single();

					if (fetchError || !current) {
						throw new Error('Professional info not found');
					}

					if (current.version !== version) {
						throw new VersionConflictError(
							'Professional info was modified by another session',
							current.version
						);
					}

					// Update with version check
					const { data: updated, error: updateError } = await locals.supabase
						.from('professional_info')
						.update(cleanedData)
						.eq('id', id)
						.eq('user_id', locals.user!.id)
						.eq('version', version)
						.select()
						.single();

					if (updateError) {
						throw updateError;
					}

					if (!updated) {
						throw new VersionConflictError('Version conflict during update');
					}

					return updated;
				}, 'update professional info');

				return {
					success: true,
					message: 'Professional information updated successfully',
					version: result.version
				};
			} else {
				// Insert new
				const { data: inserted, error } = await locals.supabase
					.from('professional_info')
					.insert({ ...cleanedData, user_id: locals.user.id, version: 1 })
					.select()
					.single();

				if (error) {
					return fail(500, { error: `Failed to save: ${error.message}` });
				}

				return {
					success: true,
					message: 'Professional information saved successfully',
					id: inserted.id,
					version: inserted.version
				};
			}
		} catch (err: any) {
			console.error('Error saving professional info:', err);

			if (err instanceof VersionConflictError) {
				return fail(409, {
					error: 'Version conflict',
					message: err.message,
					currentVersion: err.currentVersion,
					details: 'Your data was modified in another session. Please refresh and try again.'
				});
			}

			return fail(500, {
				error: 'Failed to save professional information',
				details: err.message
			});
		}
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

